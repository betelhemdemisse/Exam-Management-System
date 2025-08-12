import React, { useState, useEffect } from "react";
import {
    Card,
    CardBody,
    Typography,
    Button,
    Input,
    Select,
    Option
} from "@material-tailwind/react";
import * as XLSX from "xlsx";
import ExamReportService from "../../service/result.service";

export function Result() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        company: "",
        gender: "",
        region: "",
        type: "",
        status: "",
        startDate: "",
        endDate: ""
    });
    const rowsPerPage = 10;
    const [page, setPage] = useState(0);
    const fetchResults = async (appliedFilters = {}) => {
        setLoading(true);
        try {
            const data = await ExamReportService.getAllExamResults(appliedFilters);
            console.log("Fetched result data", data);
            setResults(data || []);
        } catch (error) {
            console.error("Failed to load exam results:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults(filters);
    }, [filters]);

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value || ""
        }));
    };

    const handleExport = () => {
        if (results.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(results);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Results");
        XLSX.writeFile(wb, "exam_results.xlsx");
    };

    if (loading) {
        return <p className="p-4 text-blue-gray-500">Loading results...</p>;
    }

    return (
        <div className="mt-12 mb-8 flex flex-col gap-6">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
                <Input
                    label="Organization"
                    value={filters.company}
                    onChange={(e) => handleFilterChange("company", e.target.value)}
                />

                {/* Gender Dropdown */}
                <Select
                    label="Gender"
                    value={filters.gender}
                    onChange={(value) => handleFilterChange("gender", value)}
                >
                    <Option value="">All</Option>
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                </Select>

                <Input
                    label="Region"
                    value={filters.region}
                    onChange={(e) => handleFilterChange("region", e.target.value)}
                />
                <Input
                    label="Type"
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                />

                {/* Status Dropdown */}
                <Select
                    label="Status"
                    value={filters.status}
                    onChange={(value) => handleFilterChange("status", value)}
                >
                    <Option value="">All</Option>
                    <Option value="passed">Passed</Option>
                    <Option value="failed">Failed</Option>
                </Select>

                <Input
                    type="date"
                    label="Start Date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                />
                <Input
                    type="date"
                    label="End Date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                />
            </div>

            {/* Export Button */}
            <div className="px-4">
                {results.length > 0 && (
                    <Button onClick={handleExport} color="blue">
                        Export XLSX
                    </Button>
                )}
            </div>

            {/* Results Table */}
            <Card shadow={false} className="border border-blue-gray-100">
                <CardBody className="overflow-x-auto px-4 py-4">
                    <table className="w-full min-w-[900px] text-left">
                        <thead>
                            <tr className="bg-blue-gray-50">
                                {[
                                    "NO",
                                    "Full Name",
                                    "Gender",
                                    "Organization",
                                    "Region",
                                    "Position",
                                    "Questions",
                                    "Score",
                                    "Status",
                                    "Exam Date"
                                ].map((header) => (
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
                          
                                  {results
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((res, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-blue-gray-50 transition-colors"
                                >
                                    <td className="p-4 align-top"> {page * rowsPerPage + index + 1}</td>
                                    <td className="p-4 align-top">{res.studentName}</td>
                                    <td className="p-4 align-top">{res.gender}</td>
                                    <td className="p-4 align-top">{res.company}</td>
                                    <td className="p-4 align-top">{res.region}</td>
                                    <td className="p-4 align-top">{res.position}</td>
                                    <td className="p-4 align-top">{res.totalQuestions}</td>
                                    <td className="p-4 align-top">{res.score}</td>
                                    <td
                                        className={`p-4 align-top font-semibold ${res.status.toLowerCase() === "passed"
                                                ? "text-green-600"
                                                : "text-red-600"
                                            }`}
                                    >
                                        {res.status}
                                    </td>

                                    <td className="p-4 align-top">
                                        {new Date(res.dateOfExam).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {results.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={12}
                                        className="p-4 text-center text-blue-gray-500"
                                    >
                                        No results match the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                     <div className="flex justify-between items-center mt-4">
                                <Button
                                  variant="outlined"
                                  size="sm"
                                  disabled={page === 0}
                                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                                >
                                  Previous
                                </Button>
                                <span className="text-sm text-gray-600">
                                  Page {page + 1} of {Math.ceil(results.length / rowsPerPage)}
                                </span>
                                <Button
                                  variant="outlined"
                                  size="sm"
                                  disabled={page >= Math.ceil(results.length / rowsPerPage) - 1}
                                  onClick={() =>
                                    setPage((prev) =>
                                      prev < Math.ceil(results.length / rowsPerPage) - 1
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
        </div>
    );
}

export default Result;
