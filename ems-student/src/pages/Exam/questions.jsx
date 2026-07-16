import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ExamService from "../../service/exam.service";
import SecureEnvironment from "./securityMeasure/preventInspection";

export function Questions() {
  const [showContent, setShowContent] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizTime, setQuizTime] = useState(0);
  const [showFinishConfirmation, setShowFinishConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [showUnansweredWarnModal, setShowUnansweredWarnModal] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const createdExam = location.state;
  
  const countdownTimerRef = useRef(null);
  const quizTimerRef = useRef(null);
  const [countDownTimer, setCountDownTimer] = useState(createdExam?.duration_minutes * 60 || 0);
  const [exam, setExam] = useState(createdExam || null);
  const questionsArray = exam?.questions || [];
  const examId = localStorage.getItem("currentExamId");

  // CRITICAL: Store all answers in a ref for persistence
  const answersRef = useRef({});
  const initialLoadDone = useRef(false);
  // Track if we're in the middle of saving to prevent race conditions
  const isSavingRef = useRef(false);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    };
  }, []);

  // Initial countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowContent(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load saved answers ONLY ONCE
  useEffect(() => {
    if (!showContent || !questionsArray.length || initialLoadDone.current) return;

    try {
      let savedAnswers = {};
      try {
        const stored = localStorage.getItem("savedAnswers");
        if (stored) {
          savedAnswers = JSON.parse(stored);
        }
      } catch (e) {
        console.warn("localStorage access restricted during load, starting fresh");
      }
      
      const examAnswers = savedAnswers[examId] || {};
      
      // Store all answers in ref
      answersRef.current = { ...examAnswers };
      initialLoadDone.current = true;
      
      // Load answer for first question
      const firstQ = questionsArray[0];
      if (firstQ && examAnswers[firstQ.exam_questionID]) {
        const savedChoiceID = examAnswers[firstQ.exam_questionID];
        const optionIndex = firstQ.choices.findIndex(c => c.choiceID === savedChoiceID);
        setSelectedOption(optionIndex !== -1 ? optionIndex : null);
      }
      
      console.log("✅ Loaded saved answers:", examAnswers);
    } catch (error) {
      console.error("Error loading saved answers:", error);
    }
  }, [showContent, questionsArray, examId]);

  // Exam timer
  useEffect(() => {
    if (!showContent) return;

    countdownTimerRef.current = setInterval(() => {
      setCountDownTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [showContent]);

  // Quiz timer
  useEffect(() => {
    if (!showContent) return;

    quizTimerRef.current = setInterval(() => {
      setQuizTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    };
  }, [showContent]);

  // Fullscreen management
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && showContent) {
        setTimeout(() => {
          if (!document.fullscreenElement) {
            setShowFullscreenWarning(true);
          }
        }, 1000);
      }
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [showContent]);

  const handleTimeUp = async () => {
    setShowTimeUpModal(true);
    await autoSubmitExam();
  };

  // CRITICAL FIX: Force save ANY answer, including the last one
  const saveAnswerToStorage = (questionIndex, optionIndex) => {
    // Prevent race conditions
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    
    try {
      // Validate inputs
      if (optionIndex === null || optionIndex === undefined) {
        isSavingRef.current = false;
        return;
      }
      if (questionIndex < 0 || questionIndex >= questionsArray.length) {
        isSavingRef.current = false;
        return;
      }
      
      const currentQ = questionsArray[questionIndex];
      if (!currentQ) {
        isSavingRef.current = false;
        return;
      }
      
      const choiceID = currentQ.choices[optionIndex]?.choiceID;
      if (!choiceID) {
        isSavingRef.current = false;
        return;
      }
      
      // Get existing saved answers with localStorage error handling
      let savedAnswers = {};
      try {
        const stored = localStorage.getItem("savedAnswers");
        if (stored) {
          savedAnswers = JSON.parse(stored);
        }
      } catch (e) {
        console.warn("localStorage access restricted, using in-memory storage only");
        // Fallback to in-memory only if localStorage fails
      }
      
      if (!savedAnswers[examId]) savedAnswers[examId] = {};
      
      // Save the answer
      savedAnswers[examId][currentQ.exam_questionID] = choiceID;
      
      // Try to save to localStorage, but don't fail if restricted
      try {
        localStorage.setItem("savedAnswers", JSON.stringify(savedAnswers));
      } catch (e) {
        console.warn("localStorage write restricted, answer saved in memory only");
      }
      
      // Update ref - THIS IS CRITICAL (always works)
      answersRef.current[currentQ.exam_questionID] = choiceID;
      
      console.log(`✅ SAVED: Question ${questionIndex + 1} -> ${choiceID}`);
      console.log("📦 All answers:", answersRef.current);
      
      isSavingRef.current = false;
      return true;
    } catch (error) {
      console.error("Error saving answer:", error);
      isSavingRef.current = false;
      return false;
    }
  };

  // Load answer for a specific question
  const loadAnswerForQuestion = (questionIndex) => {
    try {
      const currentQ = questionsArray[questionIndex];
      if (!currentQ) return null;
      
      // Check in ref first
      if (answersRef.current[currentQ.exam_questionID]) {
        const savedChoiceID = answersRef.current[currentQ.exam_questionID];
        const optionIndex = currentQ.choices.findIndex(c => c.choiceID === savedChoiceID);
        if (optionIndex !== -1) {
          console.log(`📖 Loaded from REF: Question ${questionIndex + 1} -> ${savedChoiceID}`);
          return optionIndex;
        }
      }
      
      // If not in ref, check localStorage
      const savedAnswers = JSON.parse(localStorage.getItem("savedAnswers") || "{}");
      const examAnswers = savedAnswers[examId] || {};
      const savedChoiceID = examAnswers[currentQ.exam_questionID];
      
      if (savedChoiceID) {
        const optionIndex = currentQ.choices.findIndex(c => c.choiceID === savedChoiceID);
        if (optionIndex !== -1) {
          // Update ref with this answer
          answersRef.current[currentQ.exam_questionID] = savedChoiceID;
          console.log(`📖 Loaded from STORAGE: Question ${questionIndex + 1} -> ${savedChoiceID}`);
          return optionIndex;
        }
      }
      
      console.log(`❌ No answer for Question ${questionIndex + 1}`);
      return null;
    } catch (error) {
      console.error("Error loading answer:", error);
      return null;
    }
  };

  // CRITICAL FIX: Navigate to any question - ALWAYS save current first
  const navigateToQuestion = (questionNumber) => {
    console.log(`🔄 Navigating from Q${currentQuestion} to Q${questionNumber}`);
    
    // STEP 1: ALWAYS save current answer before leaving
    if (selectedOption !== null) {
      console.log(`💾 Saving Q${currentQuestion} before navigation`);
      saveAnswerToStorage(currentQuestion - 1, selectedOption);
    } else {
      console.log(`⚠️ No answer to save for Q${currentQuestion}`);
    }
    
    // STEP 2: Navigate to new question
    setCurrentQuestion(questionNumber);
    
    // STEP 3: Load answer for new question
    const loadedOption = loadAnswerForQuestion(questionNumber - 1);
    setSelectedOption(loadedOption);
    
    console.log(`✅ Navigated to Q${questionNumber}, loaded: ${loadedOption}`);
  };

  // Handle next
  const handleNext = () => {
    console.log(`➡️ Moving from Q${currentQuestion} to next`);
    
    // ALWAYS save current before moving
    if (selectedOption !== null) {
      saveAnswerToStorage(currentQuestion - 1, selectedOption);
    }

    if (currentQuestion < questionsArray.length) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      
      // Load answer for next question
      const loadedOption = loadAnswerForQuestion(nextQuestion - 1);
      setSelectedOption(loadedOption);
    }
  };

  // Handle previous - CRITICAL FIX for the last question issue
  const handlePrevious = () => {
    console.log(`⬅️ Moving from Q${currentQuestion} to previous`);
    
    // CRITICAL: Save current answer BEFORE moving to previous
    // This is where the last question answer was being lost!
    if (selectedOption !== null) {
      saveAnswerToStorage(currentQuestion - 1, selectedOption);
    } else {
      // Even if selectedOption is null, check if there's a saved answer we might have missed
      const savedAnswer = loadAnswerForQuestion(currentQuestion - 1);
      if (savedAnswer !== null) {
        console.log(`🔄 Found saved answer for Q${currentQuestion} that wasn't in state, saving it`);
        saveAnswerToStorage(currentQuestion - 1, savedAnswer);
      }
    }

    if (currentQuestion > 1) {
      const prevQuestion = currentQuestion - 1;
      setCurrentQuestion(prevQuestion);
      
      // Load answer for previous question
      const loadedOption = loadAnswerForQuestion(prevQuestion - 1);
      setSelectedOption(loadedOption);
    }
  };

  // Handle option select with auto-save
  const handleOptionSelect = (optionIndex) => {
    console.log(`🎯 Selected option ${optionIndex} for Q${currentQuestion}`);
    setSelectedOption(optionIndex);
    
    // Immediately save the answer (even for last question)
    saveAnswerToStorage(currentQuestion - 1, optionIndex);
  };

  const handleQuestionNavigation = (questionNumber) => {
    navigateToQuestion(questionNumber);
  };

  const handleFinishAttempt = () => {
    console.log(`🏁 Finishing exam, saving Q${currentQuestion}`);
    
    // CRITICAL: Save current answer before finishing
    if (selectedOption !== null) {
      saveAnswerToStorage(currentQuestion - 1, selectedOption);
    }
    
    const totalQuestions = questionsArray.length;
    const answered = Object.keys(answersRef.current).length;
    const unanswered = totalQuestions - answered;
    setUnansweredCount(unanswered);
    
    console.log(`📊 Answered: ${answered}, Total: ${totalQuestions}, Unanswered: ${unanswered}`);
    
    if (unanswered > 0) {
      setShowUnansweredWarnModal(true);
    } else {
      setShowFinishConfirmation(true);
    }
  };

  const closeConfirmation = () => {
    setShowFinishConfirmation(false);
  };

  const autoSubmitExam = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // CRITICAL: Save current answer before submitting
      if (selectedOption !== null) {
        saveAnswerToStorage(currentQuestion - 1, selectedOption);
      }

      const savedAnswers = JSON.parse(localStorage.getItem("savedAnswers") || "{}");
      const examAnswersObj = savedAnswers[examId] || {};

      const answersArray = Object.entries(examAnswersObj).map(([exam_questionID, choiceID]) => ({
        exam_questionID,
        choiceID,
      }));

      const payload = {
        examID: examId,
        answers: answersArray,
      };

      await ExamService.submitExam(payload);

      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);

      localStorage.removeItem("savedAnswers");
      localStorage.removeItem("currentExamId");

      return true;
    } catch (error) {
      console.error("Error auto-submitting exam:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmFinish = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // CRITICAL: Save current answer before submitting
      if (selectedOption !== null) {
        saveAnswerToStorage(currentQuestion - 1, selectedOption);
      }

      const savedAnswers = JSON.parse(localStorage.getItem("savedAnswers") || "{}");
      const examAnswersObj = savedAnswers[examId] || {};

      const answersArray = Object.entries(examAnswersObj).map(([exam_questionID, choiceID]) => ({
        exam_questionID,
        choiceID,
      }));

      const payload = {
        examID: examId,
        answers: answersArray,
      };

      await ExamService.submitExam(payload);

      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);

      setShowFinishConfirmation(false);
      setShowSuccessModal(true);
      
      localStorage.removeItem("savedAnswers");
      localStorage.removeItem("currentExamId");
    } catch (error) {
      console.error("Error submitting exam:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelFinish = () => {
    setShowUnansweredWarnModal(false);
  };

  const handleContinueExam = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
    setShowFullscreenWarning(false);
  };

  const handleExitExam = async () => {
    await autoSubmitExam();
    setTimeout(() => {
      navigate("/sign-in");
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("savedAnswers");
    localStorage.removeItem("currentExamId");
    navigate("/sign-in");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!showContent) {
    return (
      <SecureEnvironment examId={examId} onAutoSubmit={autoSubmitExam}>
        <div className="h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Get Ready!</h1>
            <p className="text-xl text-gray-600">Starting in {countdown} seconds...</p>
            <div className="mt-8">
              <div className="w-20 h-20 border-4 border-blue-500 rounded-full mx-auto flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">{countdown}</span>
              </div>
            </div>
          </div>
        </div>
      </SecureEnvironment>
    );
  }

  const currentQ = questionsArray[currentQuestion - 1];
  if (!currentQ) {
    return <div>Loading questions...</div>;
  }

  return (
    <SecureEnvironment examId={examId} onAutoSubmit={autoSubmitExam}>
      <div className="h-screen bg-white flex flex-col">
        {/* All Modal Components (same as before) */}
        {showFullscreenWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
              <h3 className="text-xl font-semibold mb-4">Fullscreen Required</h3>
              <p className="text-gray-600 mb-6">
                You have exited fullscreen mode. Please return to fullscreen to continue your exam.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleExitExam}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Exit Exam
                </button>
                <button
                  onClick={handleContinueExam}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {showUnansweredWarnModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-lg font-semibold mb-4">Confirm Finish</h2>
              <p className="mb-6">
                You have {unansweredCount} unanswered questions. Are you sure you want to finish?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelFinish}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmFinish}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Finish
                </button>
              </div>
            </div>
          </div>
        )}

        {showTimeUpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
              <h3 className="text-xl font-semibold mb-4">Time's Up!</h3>
              <p className="text-gray-600 mb-6">
                The exam time has ended. Your answers have been automatically submitted.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {showFinishConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
              <h3 className="text-xl font-semibold mb-4">Are you sure you want to finish?</h3>
              <p className="text-gray-600 mb-6">
                You still have time remaining. Make sure you've reviewed all your answers before submitting.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeConfirmation}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Review Again
                </button>
                <button
                  onClick={confirmFinish}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Yes, Finish Now'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl transform transition-all">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Exam Submitted Successfully!</h3>
                <div className="mb-6">
                  <p className="text-gray-600 mb-2">Congratulations on completing your exam.</p>
                </div>
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleLogout}
                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showTimeUpModal && !showSuccessModal && (
          <div className="flex min-h-screen overflow-hidden bg-gray-50 p-6 gap-4 items-start">
            {/* Left Section - Question Card */}
            <div className="flex-1 h-[680px] bg-white rounded-xl shadow-lg p-10 flex flex-col justify-between">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>
                    Question {currentQuestion} of {questionsArray.length}
                  </span>
                  <span>
                    {Math.round((currentQuestion / questionsArray.length) * 100)}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-in-out"
                    style={{
                      width: `${(currentQuestion / questionsArray.length) * 100}%`,
                      background: `linear-gradient(to right, #34d399, #3b82f6)`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Question */}
              <h2 className="text-2xl font-bold text-gray-900 leading-snug mb-8">
                {currentQ.question_text}
              </h2>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {currentQ.choices.map((option, index) => (
                  <label
                    key={option.choiceID}
                    htmlFor={`option${index}`}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedOption === index
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id={`option${index}`}
                        name={`question-${currentQuestion}`}
                        className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500"
                        checked={selectedOption === index}
                        onChange={() => handleOptionSelect(index)}
                      />
                      <span className="text-gray-800 font-medium">{option.choice_text}</span>
                    </div>
                    <span className="ml-4 text-gray-800 font-bold">{option.label}</span>
                  </label>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-10">
                <button
                  className={`px-5 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 shadow-sm transition ${
                    currentQuestion === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                  }`}
                  onClick={handlePrevious}
                  disabled={currentQuestion === 1}
                >
                  ← Previous
                </button>

                {currentQuestion < questionsArray.length ? (
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-700 transition"
                    onClick={handleNext}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium shadow-md hover:bg-green-700 transition"
                    onClick={handleFinishAttempt}
                  >
                    Finish
                  </button>
                )}
              </div>
            </div>

            {/* Right Panel - Timer and Question Navigator */}

{/* Right Panel - Timer and Question Navigator */}
<div className="w-72 h-[680px] bg-white rounded-xl shadow-lg flex flex-col p-4">
  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white shadow-md mb-4">
    <p className="text-sm font-light flex items-center justify-center gap-1 mb-1">⏳ Time Remaining</p>
    <div className="flex justify-center items-center text-2xl font-bold tracking-tight">
      {formatTime(countDownTimer)}
    </div>
  </div>

  <div className="border-t border-gray-200 my-4"></div>

  <div className="flex-1 overflow-y-auto">
    <div className="grid grid-cols-5 gap-3">
      {questionsArray.map((q, index) => {
        const questionNumber = index + 1;
        const isCurrent = currentQuestion === questionNumber;
        const isAnswered = !!answersRef.current[q.exam_questionID];
        
        let baseClasses = "h-10 w-10 flex items-center justify-center rounded-md text-sm font-semibold transition-all duration-200 border relative";
        let statusClass = "";

        if (isCurrent) {
          // Current question - show blue regardless of answered status
          statusClass = "border-blue-500 bg-blue-500 text-white";
        } else if (isAnswered) {
          // Answered but not current - show green
          statusClass = "border-green-500 bg-green-500 text-white";
        } else {
          // Unanswered and not current - show gray
          statusClass = "border-gray-300 bg-gray-200 text-gray-700 hover:bg-gray-300";
        }

        return (
          <button
            key={q.exam_questionID || index}
            onClick={() => handleQuestionNavigation(questionNumber)}
            className={`${baseClasses} ${statusClass}`}
            title={isAnswered ? "Answered" : "Unanswered"}
          >
            {questionNumber}
            {/* Show a small indicator for unanswered questions */}
            {!isAnswered && !isCurrent && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        );
      })}
    </div>
  </div>
  
  <div className="mt-4 pt-4 border-t border-gray-200">
    <div className="flex justify-between text-xs text-gray-500">
      <span>Answered: {Object.keys(answersRef.current).length}</span>
      <span>Total: {questionsArray.length}</span>
    </div>
    {/* Add legend for clarity */}
    <div className="flex justify-center gap-4 mt-2 text-xs">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-blue-500 rounded"></div>
        <span>Current</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-green-500 rounded"></div>
        <span>Answered</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-gray-200 rounded border border-gray-300"></div>
        <span>Unanswered</span>
      </div>
    </div>
  </div>
</div>

          </div>
        )}
      </div>
    </SecureEnvironment>
  );
}

export default Questions;