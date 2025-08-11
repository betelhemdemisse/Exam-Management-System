import React, { useState } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Input,
    Typography,
    Select,
    Option,
    Checkbox
} from "@material-tailwind/react";
import QuestionService from "../../../service/question.service";

export default function CreateQuestionModal({ open, onClose, onCreated }) {
    const [questionText, setQuestionText] = useState("");
    const [category, setCategory] = useState("");
    const [difficulty, setDifficulty] = useState("Easy");
    const [questionType, setQuestionType] = useState("junior");
    const [choices, setChoices] = useState([
        { label: "A", choice_text: "", isCorrect: false },
        { label: "B", choice_text: "", isCorrect: false },
    ]);

    const addChoice = () => {
        const nextLabel = String.fromCharCode(65 + choices.length); // A,B,C...
        setChoices([...choices, { label: nextLabel, choice_text: "", isCorrect: false }]);
    };

    const removeChoice = (index) => {
        const updated = choices.filter((_, i) => i !== index);
        // Reassign labels sequentially
        const relabeled = updated.map((c, i) => ({
            ...c,
            label: String.fromCharCode(65 + i),
        }));
        setChoices(relabeled);
    };

    const updateChoiceText = (index, value) => {
        const updated = [...choices];
        updated[index].choice_text = value;
        setChoices(updated);
    };

    const toggleCorrect = (index) => {
        const updated = [...choices];
        updated[index].isCorrect = !updated[index].isCorrect;
        setChoices(updated);
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                question_text: questionText,
                category,
                difficulty,
                question_type: questionType,
                choices: choices.map((c) => ({
                    label: c.label,
                    choice_text: c.choice_text,
                })),
                correct_choice_labels: choices
                    .filter((c) => c.isCorrect)
                    .map((c) => c.label),
            };

            await QuestionService.createQuestion(payload);
            onCreated(payload);
            onClose();

            // Reset form
            setQuestionText("");
            setCategory("");
            setDifficulty("Easy");
            setQuestionType("junior");
            setChoices([
                { label: "A", choice_text: "", isCorrect: false },
                { label: "B", choice_text: "", isCorrect: false },
            ]);
        } catch (err) {
            console.error("Failed to create question:", err);
        }
    };


    return (
        <Dialog open={open} handler={onClose} size="lg">
            <DialogHeader>Create New Question</DialogHeader>
            <DialogBody className="space-y-4">
                <div>
                    <Typography variant="small" className="mb-1 font-medium">Question Text</Typography>
                    <Input value={questionText} onChange={(e) => setQuestionText(e.target.value)} />
                </div>

                <div>
                    <Typography variant="small" className="mb-1 font-medium">Category</Typography>
                    <Input value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <Typography variant="small" className="mb-1 font-medium">Difficulty</Typography>
                        <Select value={difficulty} onChange={(val) => setDifficulty(val)}>
                            <Option value="Easy">Easy</Option>
                            <Option value="Medium">Medium</Option>
                            <Option value="Hard">Hard</Option>
                        </Select>
                    </div>
                    <div className="flex-1">
                        <Typography variant="small" className="mb-1 font-medium">Question Type</Typography>
                        <Select value={questionType} onChange={(val) => setQuestionType(val)}>
                            <Option value="junior">Junior</Option>
                            <Option value="experienced">Experienced</Option>
                        </Select>
                    </div>
                </div>

                <div>
                    <Typography variant="small" className="mb-1 font-medium">Choices</Typography>
                    {choices.map((choice, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                            <Typography className="w-6">{choice.label}.</Typography>
                            <Input
                                value={choice.choice_text}
                                onChange={(e) => updateChoiceText(index, e.target.value)}
                                className="flex-1"
                                placeholder={`Option ${choice.label}`}
                            />
                            <Checkbox
                                checked={choice.isCorrect}
                                onChange={() => toggleCorrect(index)}
                                label="Correct"
                            />
                            {choices.length > 2 && (
                                <Button
                                    variant="text"
                                    color="red"
                                    onClick={() => removeChoice(index)}
                                    className="px-2"
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button size="sm" color="blue" onClick={addChoice}>
                        + Add Option
                    </Button>
                </div>
            </DialogBody>
            <DialogFooter>
                <Button variant="text" color="red" onClick={onClose}>Cancel</Button>
                <Button color="green" onClick={handleSubmit}>Create</Button>
            </DialogFooter>
        </Dialog>
    );
}
