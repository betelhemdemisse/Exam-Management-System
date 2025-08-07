import React, { useState } from "react";
import {
  Card,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export function QuestionBank() {
  const questions = [
    {
      question: "What is the capital of France?",
      options: ["Berlin", "Madrid", "Paris", "Rome"],
      answer: "Paris",
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Earth", "Mars", "Jupiter", "Venus"],
      answer: "Mars",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleDropdown = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-6">
      {/* Import button */}
      <div className="flex justify-end">
        <Button size="sm" color="blue">
          Import
        </Button>
      </div>

      <Card shadow={false} className="border border-blue-gray-100">
        <CardBody className="overflow-x-auto px-4 py-4">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="bg-blue-gray-50">
                {["NO", "Question", "Action"].map((header) => (
                  <th key={header} className="p-4">
                    <Typography
                      variant="small"
                      className="font-semibold uppercase text-blue-gray-600"
                    >
                      {header}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {questions.map((q, index) => (
                <React.Fragment key={index}>
                  <tr className="hover:bg-blue-gray-50 transition-colors">
                    <td className="p-4 align-top">
                      <Typography className="text-sm text-blue-gray-700 font-medium">
                        {index + 1}
                      </Typography>
                    </td>
                    <td className="p-4 align-top">
                      <Typography className="text-sm font-semibold text-blue-gray-800">
                        {q.question}
                      </Typography>
                    </td>
                    <td className="p-4 align-top">
                      <Button
                        variant="text"
                        size="sm"
                        className="flex items-center gap-1 text-blue-600"
                        onClick={() => toggleDropdown(index)}
                      >
                        {openIndex === index ? (
                          <>
                            Hide Options <ChevronUpIcon className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            Show Options <ChevronDownIcon className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>

                  {openIndex === index && (
                    <tr>
                      <td colSpan={3} className="p-4 bg-blue-gray-50">
                        <div className="space-y-2">
                          <Typography className="text-sm font-medium text-blue-gray-600">
                            Options:
                          </Typography>
                          <ul className="list-none ml-2 space-y-1 text-sm text-blue-gray-800">
                            {q.options.map((opt, i) => (
                              <li key={i}>
                                <span className="font-bold mr-1">
                                  {String.fromCharCode(65 + i)}.
                                </span>
                                {opt}
                              </li>
                            ))}
                          </ul>
                          <Typography className="text-sm font-medium text-green-600">
                            Answer: {q.answer}
                          </Typography>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

export default QuestionBank;
