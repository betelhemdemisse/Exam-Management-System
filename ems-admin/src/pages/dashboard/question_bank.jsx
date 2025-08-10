import React, { useRef, useState, useEffect } from "react";
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
import QuestionService from "../../service/question.service";

export function QuestionBank() {
    const fileInputRef = useRef(null);
    const [openIndex, setOpenIndex] = useState(null);
    const [questions, setQuestions] = useState([]); // main question list
    const [newQuestions, setNewQuestions] = useState([]); // import preview
    const [showDialog, setShowDialog] = useState(false);

    const toggleDropdown = (index) => {
        setOpenIndex((prev) => (prev === index ? null : index));
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const data = await QuestionService.getQuestions();
                console.log("Fetched questions:", data);
                const processedQuestions = data.map(q => {
                    const correctLabels = q.correctAnswers
                        ?.map(ans => {
                            const matchedChoice = q.choices.find(c => c.choiceID === ans.choiceID);
                            return matchedChoice ? matchedChoice.label : null;
                        })
                        .filter(Boolean); 

                    return {
                        ...q,
                        correct_choice_labels: correctLabels.join(", ")
                    };
                });

                setQuestions(processedQuestions);
            } catch (error) {
                console.error("Failed to fetch questions:", error);
            }
        };
        fetchQuestions();
    }, []);

    const [importFile, setImportFile] = useState(null); // store file

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setImportFile(file); // store file for later upload

        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: "binary" });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const parsedQuestions = jsonData.map((row) => ({
                    question_text: row.question_text,
                    question_type: row.question_type,
                    category: row.category,
                    difficulty: row.difficulty,
                    choices: JSON.parse(row.choices),
                    correct_choice_labels: row.correct_choice_labels
                }));

                setNewQuestions(parsedQuestions);
                setShowDialog(true);
            };

            reader.readAsBinaryString(file);
        } catch (error) {
            console.error("Failed to import questions:", error);
        }
    };

    const handleConfirmImport = async () => {
        try {
            if (importFile) {
                await QuestionService.importQuestions(importFile); // send file to backend
            }
            setQuestions((prev) => [...prev, ...newQuestions]);
            setNewQuestions([]);
            setImportFile(null);
            setShowDialog(false);
        } catch (error) {
            console.error("Failed to save imported questions:", error);
        }
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
                accept=".csv"
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

            {/* Questions table */}
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
                                                {q.question_text}
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
                                                        Hide Options{" "}
                                                        <ChevronUpIcon className="w-4 h-4" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Show Options{" "}
                                                        <ChevronDownIcon className="w-4 h-4" />
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
                                                        {q.choices.map((opt, i) => (
                                                            <li key={i}>
                                                                <span className="font-bold mr-1">
                                                                    {opt.label}.
                                                                </span>
                                                                {opt.choice_text}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <Typography className="text-sm font-medium text-green-600">
                                                        Answer: {q.correct_choice_labels}
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
                                {i + 1}. {q.question_text}
                            </Typography>
                            <ul className="ml-4 mt-1 text-sm list-disc text-blue-gray-700">
                                {q.choices.map((opt, j) => (
                                    <li key={j}>
                                        <strong>{opt.label}.</strong> {opt.choice_text}
                                    </li>
                                ))}
                            </ul>
                            <Typography className="text-sm text-green-600 mt-1">
                                Answer: {q.correct_choice_labels}
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
