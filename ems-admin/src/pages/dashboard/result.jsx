import React, { useState } from "react";
import {
    Card,
    CardBody,
    Typography,
    Select,
    Option,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button
} from "@material-tailwind/react";
import * as XLSX from "xlsx";

export function Result() {
    const results = [
        {
            fullName: "Alice Johnson",
            campaign: "Frontend Developer",
            totalQuestions: 15,
            correctAnswers: 13,
            type: "Junior",
            organization: "Org A",
            gender: "Female",
            region: "Region 1",
        },
        {
            fullName: "Bob Smith",
            campaign: "Backend Developer",
            totalQuestions: 15,
            correctAnswers: 8,
            type: "Experienced",
            organization: "Org B",
            gender: "Male",
            region: "Region 2",
        },
        {
            fullName: "Charlie Doe",
            campaign: "UI/UX Designer",
            totalQuestions: 15,
            correctAnswers: 15,
            type: "Experienced",
            organization: "Org A",
            gender: "Male",
            region: "Region 1",
        },
    ];

    const [filters, setFilters] = useState({
        organization: "",
        gender: "",
        region: "",
        type: "",
    });

    const [openModal, setOpenModal] = useState(false);

    const getStatus = (score, total) => {
        const percentage = (score / total) * 100;
        return percentage >= 60 ? "Pass" : "Fail";
    };

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const filteredResults = results.filter((res) => {
        return (
            (!filters.organization || res.organization === filters.organization) &&
            (!filters.gender || res.gender === filters.gender) &&
            (!filters.region || res.region === filters.region) &&
            (!filters.type || res.type === filters.type)
        );
    });

    const handleExport = () => {
        const exportData = filteredResults.map((res, index) => ({
            "NO": index + 1,
            "Full Name": res.fullName,
            "Gender": res.gender,
            "Campaign": res.campaign,
            "Type": res.type,
            "Questions": res.totalQuestions,
            "Correct Answers": `${res.correctAnswers}/${res.totalQuestions}`,
            "Status": getStatus(res.correctAnswers, res.totalQuestions),
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
        XLSX.writeFile(workbook, "filtered_results.xlsx");
        setOpenModal(false);
    };

    return (
        <div className="mt-12 mb-8 flex flex-col gap-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                <Select label="Organization" value={filters.organization} onChange={(val) => handleFilterChange("organization", val)}>
                    <Option value="">All</Option>
                    <Option value="Org A">Org A</Option>
                    <Option value="Org B">Org B</Option>
                </Select>
                <Select label="Gender" value={filters.gender} onChange={(val) => handleFilterChange("gender", val)}>
                    <Option value="">All</Option>
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                </Select>
                <Select label="Region" value={filters.region} onChange={(val) => handleFilterChange("region", val)}>
                    <Option value="">All</Option>
                    <Option value="Region 1">Region 1</Option>
                    <Option value="Region 2">Region 2</Option>
                </Select>
                <Select label="Type" value={filters.type} onChange={(val) => handleFilterChange("type", val)}>
                    <Option value="">All</Option>
                    <Option value="Junior">Junior</Option>
                    <Option value="Experienced">Experienced</Option>
                </Select>
            </div>

            {/* Export Preview Button */}
            <div className="px-4">
                {filteredResults.length > 0 && (
                    <Button onClick={() => setOpenModal(true)} color="blue">
                        Preview & Export XLSX
                    </Button>
                )}
            </div>

            {/* Result Table */}
            <Card shadow={false} className="border border-blue-gray-100">
                <CardBody className="overflow-x-auto px-4 py-4">
                    <table className="w-full min-w-[900px] text-left">
                        <thead>
                            <tr className="bg-blue-gray-50">
                                {["NO", "Full Name", "Gender", "Campaign", "Type", "Questions", "Result", "Status"].map((header) => (
                                    <th key={header} className="p-4">
                                        <Typography variant="small" className="font-semibold uppercase text-blue-gray-600">
                                            {header}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResults.map((res, index) => (
                                <tr key={index} className="hover:bg-blue-gray-50 transition-colors">
                                    <td className="p-4 align-top">{index + 1}</td>
                                    <td className="p-4 align-top">{res.fullName}</td>
                                    <td className="p-4 align-top">{res.gender}</td>
                                    <td className="p-4 align-top">{res.campaign}</td>
                                    <td className="p-4 align-top">{res.type}</td>
                                    <td className="p-4 align-top">{res.totalQuestions}</td>
                                    <td className="p-4 align-top">{res.correctAnswers}/{res.totalQuestions}</td>
                                    <td className="p-4 align-top">
                                        <span className={`font-semibold ${getStatus(res.correctAnswers, res.totalQuestions) === "Pass" ? "text-green-600" : "text-red-600"}`}>
                                            {getStatus(res.correctAnswers, res.totalQuestions)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredResults.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="p-4 text-center text-blue-gray-500">
                                        No results match the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardBody>
            </Card>

            {/* Modal for Export Preview */}
            <Dialog open={openModal} handler={setOpenModal} size="lg">
                <DialogHeader>Preview Filtered Results</DialogHeader>
                <DialogBody className="overflow-y-auto max-h-[400px]">
                    <table className="w-full min-w-[800px] text-left">
                        <thead>
                            <tr className="bg-blue-gray-50">
                                {["NO", "Full Name", "Gender", "Campaign", "Type", "Questions", "Result", "Status"].map((header) => (
                                    <th key={header} className="p-2 text-sm text-blue-gray-600">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResults.map((res, index) => (
                                <tr key={index}>
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2">{res.fullName}</td>
                                    <td className="p-2">{res.gender}</td>
                                    <td className="p-2">{res.campaign}</td>
                                    <td className="p-2">{res.type}</td>
                                    <td className="p-2">{res.totalQuestions}</td>
                                    <td className="p-2">{res.correctAnswers}/{res.totalQuestions}</td>
                                    <td className="p-2">
                                        <span className={getStatus(res.correctAnswers, res.totalQuestions) === "Pass" ? "text-green-600" : "text-red-600"}>
                                            {getStatus(res.correctAnswers, res.totalQuestions)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </DialogBody>
                <DialogFooter>
                    <Button variant="text" color="red" onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button color="green" onClick={handleExport}>Export XLSX</Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}

export default Result;
