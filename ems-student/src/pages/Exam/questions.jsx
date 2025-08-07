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
        <div className="max-w-4xl flex-start">
          <div className="flex-1 mr-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Question {currentQuestion} of {questions.length}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Questions Sidebar */}
        <div className="w-64 p-4 border-r border-gray-200 overflow-y-auto">
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
      </div>
    </div>
  );
}

export default Questions;