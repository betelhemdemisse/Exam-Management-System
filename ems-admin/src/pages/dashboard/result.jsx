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
    const [allResults, setAllResults] = useState([]); // store full data for dropdowns
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
            if (Object.keys(appliedFilters).length === 0) {
                // store full dataset for dropdowns
                setAllResults(data || []);
            }
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

    useEffect(() => {
        // initial load with no filters to populate dropdowns
        fetchResults({});
    }, []);

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value || ""
        }));
        setPage(0); // reset to first page when filter changes
    };

    const handleExport = () => {
        if (results.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(results);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Results");
        XLSX.writeFile(wb, "exam_results.xlsx");
    };

    // derive unique values from full dataset
    const uniqueOrganizations = Array.from(
        new Set(allResults.map(r => r.company).filter(Boolean))
    );
    const uniqueRegions = Array.from(
        new Set(allResults.map(r => r.region).filter(Boolean))
    );

    if (loading) {
        return <p className="p-4 text-blue-gray-500">Loading results...</p>;
    }

    return (
        <div className="mt-12 mb-8 flex flex-col gap-6">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
                
                {/* Organization Dropdown */}
                <Select
                    label="Organization"
                    value={filters.company}
                    onChange={(value) => handleFilterChange("company", value)}
                >
                    <Option value="">All</Option>
                    {uniqueOrganizations.map((org, i) => (
                        <Option key={i} value={org}>
                            {org}
                        </Option>
                    ))}
                </Select>

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

                {/* Region Dropdown */}
                <Select
                    label="Region"
                    value={filters.region}
                    onChange={(value) => handleFilterChange("region", value)}
                >
                    <Option value="">All</Option>
                    {uniqueRegions.map((reg, i) => (
                        <Option key={i} value={reg}>
                            {reg}
                        </Option>
                    ))}
                </Select>

                {/* Type Dropdown */}
                <Select
                    label="Type"
                    value={filters.type}
                    onChange={(value) => handleFilterChange("type", value)}
                >
                    <Option value="">All</Option>
                    <Option value="junior">Junior</Option>
                    <Option value="experienced">Experienced</Option>
                </Select>

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

                {/* Date Filters */}
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
                                    "Percentage",
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
                                        <td className="p-4 align-top">
                                            {page * rowsPerPage + index + 1}
                                        </td>
                                        <td className="p-4 align-top">{res.studentName}</td>
                                        <td className="p-4 align-top">{res.gender}</td>
                                        <td className="p-4 align-top">{res.company}</td>
                                        <td className="p-4 align-top">{res.region}</td>
                                        <td className="p-4 align-top">{res.position}</td>
                                        <td className="p-4 align-top">{res.totalQuestions}</td>
                                        <td className="p-4 align-top">{res.score}</td>
                                        <td className="p-4 align-top">{res.percentage}</td>
                                        <td
                                            className={`p-4 align-top font-semibold ${
                                                res.status.toLowerCase() === "passed"
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

                    {/* Pagination */}
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
