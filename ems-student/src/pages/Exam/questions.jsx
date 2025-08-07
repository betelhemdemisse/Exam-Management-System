import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export function Questions() {
  const [showContent, setShowContent] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizTime, setQuizTime] = useState(0); // in seconds
  const [showFinishConfirmation, setShowFinishConfirmation] = useState(false);
  const [countDownTimer, setCountDownTimer] = useState(15 * 60); // 15 minutes in seconds

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

    const timer = setInterval(() => {
      setCountDownTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishAttempt(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showContent]);

  // Quiz elapsed time counter
  useEffect(() => {
    if (!showContent) return;

    const timer = setInterval(() => {
      setQuizTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showContent]);

  const handleNext = () => {
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
  };

  const handleQuestionNavigation = (questionNumber) => {
    setCurrentQuestion(questionNumber);
    setSelectedOption(null);
  };

  const handleFinishAttempt = () => {
    setShowFinishConfirmation(true);
  };

  const confirmFinish = () => {
    setShowFinishConfirmation(false);
    alert('Quiz completed!');
    // Here you would typically navigate to results or another page
  };

  const cancelFinish = () => {
    setShowFinishConfirmation(false);
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
    );
  }

  const currentQ = questions[currentQuestion - 1];
  const progressPercentage = (currentQuestion / questions.length) * 100;

  return (  
    <div className="h-screen bg-white flex flex-col">
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

      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="w-full flex-start">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Question {currentQuestion} of {questions.length}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Centered Question Area */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                {currentQ.text}
              </h2>
              
              <div className="space-y-3 mb-8">
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
        <div className="w-64 p-4 border-l border-gray-200 overflow-y-auto">
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
            <h3 className="font-semibold text-gray-700 mb-2">Questions</h3>
            <div className="grid grid-cols-3 gap-2">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => handleQuestionNavigation(index + 1)}
                  className={`w-full h-12 flex items-center justify-center rounded-md border ${
                    currentQuestion === index + 1
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-100'
                  } transition-colors`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Questions;