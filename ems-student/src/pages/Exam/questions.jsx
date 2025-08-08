import { useState, useEffect, useRef } from "react";

import PreventInspection from "./securityMeasure/preventInspection"

import { Link, useNavigate } from "react-router-dom";


export function Questions() {
  const [showContent, setShowContent] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizTime, setQuizTime] = useState(0); // in seconds
  const [showFinishConfirmation, setShowFinishConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countDownTimer, setCountDownTimer] = useState(15 * 60); // 15 minutes in seconds
  const navigate = useNavigate();
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
const [answeredQuestions, setAnsweredQuestions] = useState([]);
  // Refs for timer intervals
  const countdownTimerRef = useRef(null);
  const quizTimerRef = useRef(null);

  const questions = [
    {
      id: 1,
      text: "Which of the following best describes the concept of 'props' in React?",
      options: [
        "Props are internal state management tools within a component",
        "Props are immutable inputs passed down from parent to child components",
        "Props are lifecycle methods that control component rendering",
        "Props are hooks that manage side effects in functional components"
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      text: "What is the purpose of the virtual DOM in React?",
      options: [
        "To directly manipulate the browser's DOM for better performance",
        "To provide a virtual representation of the UI that is kept in memory",
        "To replace the need for state management libraries",
        "To enable server-side rendering of components"
      ],
      correctAnswer: 1
    },
    {
      id: 3,
      text: "Which hook is used to perform side effects in functional components?",
      options: [
        "useState",
        "useEffect",
        "useContext",
        "useReducer"
      ],
      correctAnswer: 1
    },
    {
      id: 4,
      text: "What is the correct way to update state based on previous state in React?",
      options: [
        "setState(newValue)",
        "setState(prevState => newValue)",
        "this.state = newValue",
        "state.update(newValue)"
      ],
      correctAnswer: 1
    },
    {
      id: 5,
      text: "Which method is called right before a component is removed from the DOM?",
      options: [
        "componentDidMount",
        "componentWillUnmount",
        "componentDidUpdate",
        "shouldComponentUpdate"
      ],
      correctAnswer: 1
    }
  ];

  // Countdown timer before quiz starts
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

  // Quiz countdown timer (15 minutes)
  useEffect(() => {
    if (!showContent) return;

    countdownTimerRef.current = setInterval(() => {
      setCountDownTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          handleFinishAttempt(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [showContent]);

  // Quiz elapsed time counter
  useEffect(() => {
    if (!showContent) return;

    quizTimerRef.current = setInterval(() => {
      setQuizTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (quizTimerRef.current) {
        clearInterval(quizTimerRef.current);
      }
    };
  }, [showContent]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // User exited fullscreen
        setShowFullscreenWarning(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleContinueExam = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
    setShowFullscreenWarning(false);
  };


  const handleExitExam = () => {
    clearInterval(countdownTimerRef.current);
    clearInterval(quizTimerRef.current);
    navigate("/sign-in");
  };

const handleNext = () => {
  if (currentQuestion < questions.length && selectedOption === null && !answeredQuestions.includes(currentQuestion)) {
  }
  
  if (currentQuestion < questions.length) {
    setCurrentQuestion(currentQuestion + 1);
    setSelectedOption(null);
  }
};


  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(null);
    }
  };
const handleOptionSelect = (optionIndex) => {
  setSelectedOption(optionIndex);
  // Mark current question as answered
  if (!answeredQuestions.includes(currentQuestion)) {
    setAnsweredQuestions([...answeredQuestions, currentQuestion]);
  }
};
  const handleQuestionNavigation = (questionNumber) => {
    setCurrentQuestion(questionNumber);
    setSelectedOption(null);
  };

const handleFinishAttempt = () => {
  const unansweredCount = questions.length - answeredQuestions.length;
  if (unansweredCount > 0) {
    if (window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to finish?`)) {
      setShowFinishConfirmation(true);
    }
  } else {
    setShowFinishConfirmation(true);
  }
};
  const confirmFinish = () => {
    // Clear both timers when exam is finished
    clearInterval(countdownTimerRef.current);
    clearInterval(quizTimerRef.current);

    setShowFinishConfirmation(false);
    setShowSuccessModal(true);
  };

  const cancelFinish = () => {
    setShowFinishConfirmation(false);
  };

  const handleContinue = () => {
    setShowSuccessModal(false);
  };

  // Format the countdown to always show 2 digits (e.g., "05" instead of "5")
  const formatCountdown = (time) => {
    return time < 10 ? `0${time}` : time.toString();
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const currentQ = questions[currentQuestion - 1];
  const progressPercentage = (currentQuestion / questions.length) * 100;

  return (
    <PreventInspection>
    <div className="h-screen bg-white flex flex-col">

      {/* ✅ Fullscreen Warning Modal */}
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

     <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
<div className="bg-white shadow-sm p-4 sticky top-0 z-10">
  <div className="w-full flex justify-between items-start">
    {/* Left side - Progress bar section */}
    <div className="flex-1 max-w-6xl">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>Question {currentQuestion} of {questions.length}</span>
        <span>{Math.round(progressPercentage)}% Complete</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-4 shadow-inner relative overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-in-out"
          style={{
            width: `${progressPercentage}%`,
            background: `linear-gradient(to right, #34d399, #3b82f6)`
          }}
        ></div>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
          {Math.round(progressPercentage)}%
        </span>
      </div>
    </div>

<div className="ml-4 flex-shrink-0 flex items-center">
  <span className="text-xl font-semibold text-gray-900 tracking-wide">
    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
      Johnathan D. Smith
    </span>
  </span>
</div>
  </div>
</div>
</div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto p-4 mt-24">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                {currentQ.text}
              </h2>

              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <label
                    key={index}
                    htmlFor={`option${index}`}
                    className={`block p-4 rounded-lg cursor-pointer border-l-4 ${selectedOption === index ? 'border-l-blue-500 bg-blue-50 shadow-md' : 'border-l-transparent hover:border-l-blue-500 hover:shadow-md hover:bg-blue-50'} transition-all duration-200`}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        id={`option${index}`}
                        name="question"
                        className="mt-0.5 mr-3"
                        checked={selectedOption === index}
                        onChange={() => handleOptionSelect(index)}
                      />
                      <span className="text-gray-700">
                        {option}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Navigation Buttons under question card */}
              <div className="flex justify-between">
                <button
                  className={`px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 shadow-sm ${currentQuestion === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handlePrevious}
                  disabled={currentQuestion === 1}
                >
                  ← Previous
                </button>
                {currentQuestion < questions.length ? (
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 shadow-md"
                    onClick={handleNext}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    className="px-6 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 shadow-md"
                    onClick={handleFinishAttempt}
                  >
                    Finish
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Questions Sidebar - Right Side */}

        <div className="w-64 p-4 border-l border-gray-200 overflow-y-auto bg-gray-50">
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
            <div className="text-white text-center">
              <p className="text-sm font-light mb-1">Time Remaining</p>
              <div className="flex justify-center items-baseline">
                <span className="text-3xl font-bold tracking-tight">
                  {formatTime(countDownTimer).split(':')[0]}
                </span>
                <span className="text-xl mx-1">:</span>
                <span className="text-3xl font-bold tracking-tight">
                  {formatTime(countDownTimer).split(':')[1]}
                </span>
              </div>
              <div className="flex justify-between text-xs mt-2 opacity-80">
                <span>MIN</span>
                <span>SEC</span>
              </div>
            </div>
          </div>

          {/* Questions Navigation */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-4 text-lg">Questions</h3>
          <div className="grid grid-cols-3 gap-3">
  {questions.map((q, index) => {
    const isCurrent = currentQuestion === index + 1;
    const isAnswered = answeredQuestions.includes(index + 1);
    const isSkipped = !isAnswered && currentQuestion > index + 1; 

    let baseClasses = "h-12 w-full flex items-center justify-center rounded-md text-sm font-semibold transition-all duration-200 border";

    let statusClass = "";
    if (isCurrent) {
      statusClass = "bg-blue-100 border-blue-500 text-blue-700 shadow-md";
    } else if (isAnswered) {
      statusClass = "bg-green-100 border-green-400 text-green-700";
    } else if (isSkipped) {
      statusClass = "bg-red-100 border-yellow-400 text-yellow-700"; // V
    } else {
      statusClass = "bg-white border-gray-300 text-gray-600 hover:bg-gray-100";
    }

    return (
      <button
        key={q.id}
        onClick={() => handleQuestionNavigation(index + 1)}
        className={`${baseClasses} ${statusClass}`}
      >
        {index + 1}
        {isSkipped && (
          <span className="ml-1 text-yellow-600">!</span> // Add an exclamation mark for skipped questions
        )}
      </button>
    );
  })}
</div>
          </div>
        </div>


      </div>
    </div>
    </PreventInspection>
  );
}

export default Questions;