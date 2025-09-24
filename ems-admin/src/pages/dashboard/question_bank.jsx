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
    Select,
    Option
} from "@material-tailwind/react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import * as XLSX from "xlsx";
import QuestionService from "../../service/question.service";
import CreateQuestionModal from "../dashboard/question modal/CreateQuestionModal";
import EditQuestionModal from "../dashboard/question modal/EditQuestionModal";

export function QuestionBank() {
    const fileInputRef = useRef(null);
    const [openIndex, setOpenIndex] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [newQuestions, setNewQuestions] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);

    const [filters, setFilters] = useState({
        examSource: "",
    });

    const rowsPerPage = 10;
    const [page, setPage] = useState(0);

    const toggleDropdown = (index) => {
        setOpenIndex((prev) => (prev === index ? null : index));
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(0); // reset pagination when filtering
    };

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const data = await QuestionService.getQuestions();
                const processedQuestions = data.map((q) => {
                    const correctLabels = q.correctAnswers
                        ?.map((ans) => {
                            const matchedChoice = q.choices.find(
                                (c) => c.choiceID === ans.choiceID
                            );
                            return matchedChoice ? matchedChoice.label : null;
                        })
                        .filter(Boolean);

                    return {
                        ...q,
                        correct_choice_labels: correctLabels.join(", "),
                    };
                });

                setQuestions(processedQuestions);
            } catch (error) {
                console.error("Failed to fetch questions:", error);
            }
        };
        fetchQuestions();
    }, []);

    const [importFile, setImportFile] = useState(null);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setImportFile(file);

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
                    correct_choice_labels: row.correct_choice_labels,
                    exam_source: row.exam_source || null,
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
                await QuestionService.importQuestions(importFile);
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

    const filteredQuestions = questions.filter((q) => {
        if (filters.examSource && filters.examSource !== "all") {
            if (filters.examSource === "na") {
                return !q.exam_source; // only those with no exam_source
            }
            return q.exam_source?.toLowerCase() === filters.examSource.toLowerCase();
        }
        return true;
    });


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

            {/* Toolbar */}
            <div className="flex justify-between items-center gap-2">
                <div className="w-48 shrink-0">
                    <Select
                        label="Exam Source"
                        value={filters.examSource || "all"}
                        onChange={(value) => handleFilterChange("examSource", value)}
                    >
                        <Option value="all">All</Option>
                        <Option value="mesob">መሶብ</Option>
                        <Option value="land">መሬት</Option>
                        <Option value="na">N/A</Option>
                    </Select>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        color="green"
                        onClick={() => setCreateModalOpen(true)}
                    >
                        + Create Question
                    </Button>
                    <Button size="sm" color="blue" onClick={handleImportClick}>
                        Import
                    </Button>
                </div>
            </div>


            {/* Questions table */}
            <Card shadow={false} className="border border-blue-gray-100">
                <CardBody className="overflow-x-auto px-4 py-4">
                    <table className="w-full min-w-[700px] text-left">
                        <thead>
                            <tr className="bg-blue-gray-50">
                                {["NO", "Question", "Type", "Exam Source", "Option Action", "Action"].map(
                                    (header) => (
                                        <th key={header} className="p-4">
                                            <Typography
                                                variant="small"
                                                className="font-semibold uppercase text-blue-gray-600"
                                            >
                                                {header}
                                            </Typography>
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuestions
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((q, index) => (
                                    <React.Fragment key={index}>
                                        <tr className="hover:bg-blue-gray-50 transition-colors">
                                            <td className="p-4 align-top">
                                                <Typography className="text-sm text-blue-gray-700 font-medium">
                                                    {page * rowsPerPage + index + 1}
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
                                                <Typography className="text-sm text-blue-gray-700">
                                                    {q.exam_source || "N/A"}
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
                                            <td className="p-4 align-top">
                                                <Button
                                                    variant="text"
                                                    size="sm"
                                                    color="blue"
                                                    onClick={() => {
                                                        setSelectedQuestionId(q.questionID);
                                                        setEditModalOpen(true);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                            </td>
                                        </tr>

                                        {openIndex === index && (
                                            <tr>
                                                <td colSpan={6} className="p-4 bg-blue-gray-50">
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

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-4 px-4">
                        <Button
                            variant="outlined"
                            size="sm"
                            disabled={page === 0}
                            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                        >
                            Previous
                        </Button>

                        <span className="text-sm text-gray-600">
                            Page {page + 1} of {Math.ceil(filteredQuestions.length / rowsPerPage)}
                        </span>

                        <Button
                            variant="outlined"
                            size="sm"
                            disabled={
                                page >= Math.ceil(filteredQuestions.length / rowsPerPage) - 1
                            }
                            onClick={() =>
                                setPage((prev) =>
                                    prev < Math.ceil(filteredQuestions.length / rowsPerPage) - 1
                                        ? prev + 1
                                        : prev
                                )
                            }
                        >
                            Next
                        </Button>
                    </div>
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
                            <Typography className="text-sm text-blue-gray-500">
                                Exam Source: {q.exam_source || "N/A"}
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

            {/* Create & Edit Modals */}
            <CreateQuestionModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreated={(newQ) =>
                    setQuestions((prev) => [
                        ...prev,
                        {
                            ...newQ,
                            correct_choice_labels:
                                newQ.correctAnswers
                                    ?.map((a) => a.label)
                                    .join(", ") ||
                                newQ.choices
                                    ?.filter((c) => c.isCorrect)
                                    .map((c) => c.label)
                                    .join(", ") ||
                                "",
                        },
                    ])
                }
            />
            <EditQuestionModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                questionId={selectedQuestionId}
                onUpdated={(updatedQ) => {
                    setQuestions((prev) =>
                        prev.map((q) =>
                            q.id === updatedQ.id
                                ? {
                                    ...updatedQ,
                                    correct_choice_labels:
                                        updatedQ.correct_choice_labels.join(", "),
                                }
                                : q
                        )
                    );
                }}
            />
        </div>
    );
}

export default QuestionBank;
