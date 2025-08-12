import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ExamService from "../../service/exam.service";
 import PreventInspection from "./securityMeasure/preventInspection";

export function Questions() {
  const [showContent, setShowContent] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizTime, setQuizTime] = useState(0);
  const [showFinishConfirmation, setShowFinishConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const navigate = useNavigate();
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const countdownTimerRef = useRef(null);
  const quizTimerRef = useRef(null);
  const [selectedOptions, setSelectedOptions] = useState({});

  const location = useLocation();
  const createdExam = location.state;
  const [countDownTimer, setCountDownTimer] = useState(createdExam?.duration_minutes*60|| 0 );

  const [exam, setExam] = useState(createdExam || null);

  const questionsArray = exam?.questions || [];

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

  useEffect(() => {
    if (!showContent) return;

    quizTimerRef.current = setInterval(() => {
      setQuizTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    };
  }, [showContent]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setShowFullscreenWarning(true);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleTimeUp = async () => {
    setShowTimeUpModal(true);
    await confirmFinish();
  };

  const handleContinueExam = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
    setShowFullscreenWarning(false);
  };

  const handleExitExam = () => {
    clearInterval(countdownTimerRef.current);
    clearInterval(quizTimerRef.current);
    navigate("/sign-in");
  };

  const handleNext = () => {
    if (selectedOption !== null) {
      try {
        const currentExamId = localStorage.getItem("currentExamId");
        const currentQ = questionsArray[currentQuestion - 1];
        const savedAnswers = JSON.parse(localStorage.getItem("savedAnswers") || "{}");

        if (!savedAnswers[currentExamId]) savedAnswers[currentExamId] = {};

  // Store by exam_questionID so submit payload uses the correct identifier
  savedAnswers[currentExamId][currentQ.exam_questionID] = currentQ.choices[selectedOption].choiceID;

        localStorage.setItem("savedAnswers", JSON.stringify(savedAnswers));
      } catch (error) {
        console.error("Error saving answer locally:", error);
      }
    }

    if (currentQuestion < questionsArray.length) {
      const nextQuestionNumber = currentQuestion + 1;
      setCurrentQuestion(nextQuestionNumber);

      try {
        const currentExamId = localStorage.getItem("currentExamId");
        const savedAnswers = JSON.parse(localStorage.getItem("savedAnswers") || "{}");
        const nextQ = questionsArray[nextQuestionNumber - 1];
  const savedChoiceID = savedAnswers?.[currentExamId]?.[nextQ.exam_questionID];

        const savedOptionIndex = nextQ.choices.findIndex(c => c.choiceID === savedChoiceID);
        setSelectedOption(savedOptionIndex !== -1 ? savedOptionIndex : null);
      } catch {
        setSelectedOption(null);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      const prevQuestionNumber = currentQuestion - 1;
      setCurrentQuestion(prevQuestionNumber);
      setSelectedOption(selectedOptions[prevQuestionNumber] ?? null);
    }
  };

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
    setSelectedOptions((prev) => ({
      ...prev,
      [currentQuestion]: optionIndex,
    }));
    if (!answeredQuestions.includes(currentQuestion)) {
      setAnsweredQuestions([...answeredQuestions, currentQuestion]);
    }
  };

  const handleQuestionNavigation = (questionNumber) => {
    setCurrentQuestion(questionNumber);
    setSelectedOption(selectedOptions[questionNumber] ?? null);
  };

  const handleFinishAttempt = () => {
    const unansweredCount = questionsArray.length - answeredQuestions.length;
    if (unansweredCount > 0) {
      if (window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to finish?`)) {
        setShowFinishConfirmation(true);
      }
    } else {
      setShowFinishConfirmation(true);
    }
  };

  const saveCurrentAnswer = () => {
    if (selectedOption !== null) {
      try {
        const currentExamId = localStorage.getItem("currentExamId");
        const currentQ = questionsArray[currentQuestion - 1];
        const savedAnswers = JSON.parse(localStorage.getItem("savedAnswers") || "{}");

        if (!savedAnswers[currentExamId]) savedAnswers[currentExamId] = {};

        savedAnswers[currentExamId][currentQ.exam_questionID] = currentQ.choices[selectedOption].choiceID;

        localStorage.setItem("savedAnswers", JSON.stringify(savedAnswers));
      } catch (error) {
        console.error("Error saving answer locally:", error);
      }
    }
  };

  const confirmFinish = async () => {
    try {
      saveCurrentAnswer();

      const currentExamId = localStorage.getItem("currentExamId");
      const savedAnswers = JSON.parse(localStorage.getItem("savedAnswers") || "{}");

      const examAnswersObj = savedAnswers[currentExamId] || {};

      const answersArray = Object.entries(examAnswersObj).map(([exam_questionID, choiceID]) => ({
        exam_questionID,
        choiceID,
      }));

      const payload = {
        examID: currentExamId,
        answers: answersArray,
      };
      console.log("payload", payload);

      await ExamService.submitExam(payload);

      clearInterval(countdownTimerRef.current);
      clearInterval(quizTimerRef.current);
      setShowFinishConfirmation(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error submitting exam:", error);
    }
  };

  const cancelFinish = () => {
    setShowFinishConfirmation(false);
  };

  const handleContinue = () => {
    setShowSuccessModal(false);
  };

  const formatCountdown = (time) => {
    return time < 10 ? `0${time}` : time.toString();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!showContent) {
    return (
      <PreventInspection>
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
      </PreventInspection>
    );
  }

  // Defensive: check currentQ exists
  const currentQ = questionsArray[currentQuestion - 1];
  if (!currentQ) {
    return <div>Loading questions...</div>;
  }

  return (

    // <PreventInspection>

    <div className="h-screen bg-white flex flex-col">
      {/* Fullscreen Warning Modal */}
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

      {/* Time Up Modal */}
      {showTimeUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Time's Up!</h3>
            <p className="text-gray-600 mb-6">
              The exam time has ended. Your answers have been automatically submitted.
            </p>
            <div className="flex justify-end">
              <Link to="/sign-in">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Continue
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Finish Confirmation Modal */}
      {showFinishConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Are you sure you want to finish?</h3>
            <p className="text-gray-600 mb-6">
              You still have time remaining. Make sure you've reviewed all your answers before submitting.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelFinish}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Review Again
              </button>
              <button
                onClick={confirmFinish}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Yes, Finish Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
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
                <Link to="/sign-in">
                  <button
                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Logout
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showTimeUpModal && (
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
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedOption === index
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  <input
                    type="radio"
                    id={`option${index}`}
                    name="question"
                    className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500"
                    checked={selectedOption === index}
                    onChange={() => handleOptionSelect(index)}
                  />
                  <span className="text-gray-800 font-medium">{option.choice_text}</span>
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

          <div className="w-72 h-[680px] bg-white rounded-xl shadow-lg flex flex-col p-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white shadow-md mb-4">
              <p className="text-sm font-light flex items-center justify-center gap-1 mb-1">⏳ Time Remaining</p>
              <div className="flex justify-center items-center text-2xl font-bold tracking-tight">{formatTime(countDownTimer)}</div>
            </div>

            <div className="border-t border-gray-200 my-4"></div>

            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-5 gap-3">
                {questionsArray.map((q, index) => {
                  const isCurrent = currentQuestion === index + 1;
                  const isAnswered = answeredQuestions.includes(index + 1);
                  const isSkipped = !isAnswered && currentQuestion > index + 1;

                  let baseClasses = "h-10 w-10 flex items-center justify-center rounded-md text-sm font-semibold transition-all duration-200 border";
                  let statusClass = "";

                  if (isCurrent) {
                    statusClass = "bg-blue-500 text-white border-blue-500";
                  } else if (isAnswered) {
                    statusClass = "bg-green-500 text-white border-green-500";
                  } else if (isSkipped) {
                    statusClass = "bg-red-500 text-white border-red-500";
                  } else {
                    statusClass = "bg-gray-200 text-gray-700 border-gray-200 hover:bg-gray-300";
                  }

                  return (
                    <button
                      key={q.questionID || index}
                      onClick={() => handleQuestionNavigation(index + 1)}
                      className={`${baseClasses} ${statusClass}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    // {/* </PreventInspection> */}
  );
}

export default Questions;
