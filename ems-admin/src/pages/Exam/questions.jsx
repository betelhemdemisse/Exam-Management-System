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

  return (  
    <div className="h-screen bg-white flex flex-col">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
      <div className="max-w-4xl flex-start">
  <div className="flex-1 mr-4">
    <div className="flex justify-between text-sm text-gray-600 mb-1">
      <span>Question 5 of 20</span>
      <span>25% Complete</span>
    </div>
    <div className="flex items-center">
      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '25%' }}></div>
      </div>
     
    </div>
  </div>
</div>
      </div>

      {/* Centered Question Area */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
            1. Which of the following best describes the concept of 'props' in React?
            </h2>
            
            <div className="space-y-3 mb-8">
              {[1, 2, 3, 4].map((option) => (
                <label 
                  key={option}
                  htmlFor={`option${option}`} 
                  className="block p-4 rounded-lg cursor-pointer hover:border-l-4 hover:border-l-blue-500 hover:shadow-md hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="flex items-start">
                    <input 
                      type="radio" 
                      id={`option${option}`} 
                      name="question" 
                      className="mt-0.5 mr-3" 
                    />
                    <span className="text-gray-700">
                      {option === 1 && "Props are internal state management tools within a component"}
                      {option === 2 && "Props are immutable inputs passed down from parent to child components"}
                      {option === 3 && "Props are lifecycle methods that control component rendering"}
                      {option === 4 && "Props are hooks that manage side effects in functional components"}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            {/* Navigation Buttons under question card */}
            <div className="flex justify-between">
              <button className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 shadow-sm">
                ← Previous
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 shadow-md">
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Questions;