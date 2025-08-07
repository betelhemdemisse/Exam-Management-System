import { useState, useEffect } from "react";
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";

export function Questions() {
  const [showContent, setShowContent] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);

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
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="w-full flex-start">
          <div className="flex-1">
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
                    onClick={() => alert('Quiz completed!')}
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
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-4 text-lg">Questions</h3>
            <div className="grid grid-cols-3 gap-3">
              {questions.map((q, index) => {
                const isCurrent = currentQuestion === index + 1;
                const isAnswered =
                  currentQuestion > index + 1 ||
                  (currentQuestion === index + 1 && selectedOption !== null);

                let baseClasses =
                  "h-12 w-full flex items-center justify-center rounded-md text-sm font-semibold transition-all duration-200 border";

                let statusClass = "";
                if (isCurrent) {
                  statusClass = "bg-blue-100 border-blue-500 text-blue-700 shadow-md";
                } else if (isAnswered) {
                  statusClass = "bg-green-100 border-green-400 text-green-700";
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
                  </button>
                );
              })}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}

export default Questions;