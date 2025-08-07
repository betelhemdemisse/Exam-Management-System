import React, { useRef, useState } from "react";
import {
    Card,
    CardBody,
    Typography,
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import * as XLSX from "xlsx";

export function QuestionBank() {
    const fileInputRef = useRef(null);

    const [questions, setQuestions] = useState([
        {
            question: "What is the capital of France?",
            options: ["Berlin", "Madrid", "Paris", "Rome"],
            answer: "Paris",
            question_type: "Junior",
        },
        {
            question: "Which planet is known as the Red Planet?",
            options: ["Earth", "Mars", "Jupiter", "Venus"],
            answer: "Mars",
            question_type: "Experienced",
        },
    ]);

    const [openIndex, setOpenIndex] = useState(null);
    const [newQuestions, setNewQuestions] = useState([]);
    const [showDialog, setShowDialog] = useState(false);

    const toggleDropdown = (index) => {
        setOpenIndex((prev) => (prev === index ? null : index));
    };

    const handleImportClick = () => {
        fileInputRef.current.click(); // simulate file input
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Optional: validate required fields like question, options, etc.
            const parsedQuestions = jsonData.map((row) => ({
                question: row.question,
                options: [row.optionA, row.optionB, row.optionC, row.optionD], // Adjust column names
                answer: row.answer,
                question_type: row.question_type,
            }));

            setNewQuestions(parsedQuestions);
            setShowDialog(true);
        };

        reader.readAsArrayBuffer(file);
    };

    const handleConfirmImport = () => {
        setQuestions((prev) => [...prev, ...newQuestions]);
        setNewQuestions([]);
        setShowDialog(false);
    };

    const handleCancelImport = () => {
        setNewQuestions([]);
        setShowDialog(false);
    };

    return (
        <div className="mt-12 mb-8 flex flex-col gap-6">
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Import button */}
            <div className="flex justify-end">
                <Button size="sm" color="blue" onClick={handleImportClick}>
                    Import
                </Button>
            </div>

            <Card shadow={false} className="border border-blue-gray-100">
                <CardBody className="overflow-x-auto px-4 py-4">
                    <table className="w-full min-w-[700px] text-left">
                        <thead>
                            <tr className="bg-blue-gray-50">
                                {["NO", "Question", "Type", "Action"].map((header) => (
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
                                            <Typography className="text-sm text-blue-gray-700">
                                                {q.question_type}
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
                                            <td colSpan={4} className="p-4 bg-blue-gray-50">
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

            {/* Import Preview Dialog */}
            <Dialog open={showDialog} handler={handleCancelImport}>
                <DialogHeader>Preview Imported Questions</DialogHeader>
                <DialogBody className="max-h-[500px] overflow-y-auto">
                    {newQuestions.map((q, i) => (
                        <div key={i} className="mb-4 border-b pb-2">
                            <Typography className="font-semibold text-blue-gray-800">
                                {i + 1}. {q.question}
                            </Typography>
                            <ul className="ml-4 mt-1 text-sm list-disc text-blue-gray-700">
                                {q.options.map((opt, j) => (
                                    <li key={j}>
                                        <strong>{String.fromCharCode(65 + j)}.</strong> {opt}
                                    </li>
                                ))}
                            </ul>
                            <Typography className="text-sm text-green-600 mt-1">
                                Answer: {q.answer}
                            </Typography>
                            <Typography className="text-sm text-blue-gray-500">
                                Type: {q.question_type}
                            </Typography>
                        </div>
                    ))}
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="red" onClick={handleCancelImport}>
                        Cancel
                    </Button>
                    <Button color="green" onClick={handleConfirmImport}>
                        Confirm Import
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}

export default QuestionBank;
