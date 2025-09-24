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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../fonts/NotoSansEthiopic-VariableFont_wdth,wght-normal.js";
import html2canvas from "html2canvas";

export function Result() {
    const [allResults, setAllResults] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        company: "",
        gender: "",
        region: "",
        type: "",
        status: "",
        startDate: "",
        endDate: "",
        exam_source: ""
    });

    const uniqueExamSources = Array.from(
        new Set(allResults.map(r => r.user?.exam_source))
    );


    const examSourceLabels = {
        mesob: "መሶብ",
        land: "መሬት",
    };

    const rowsPerPage = 10;
    const [page, setPage] = useState(0);

    // fetch only once
    const fetchResults = async () => {
        setLoading(true);
        try {
            const data = await ExamReportService.getAllExamResults({});
            setAllResults(data || []);
        } catch (error) {
            console.error("Failed to load exam results:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    // apply frontend filtering
    useEffect(() => {
        let filtered = [...allResults];

        if (filters.company) {
            filtered = filtered.filter(r => r.company === filters.company);
        }
        if (filters.gender) {
            filtered = filtered.filter(r => r.gender === filters.gender);
        }
        if (filters.region) {
            filtered = filtered.filter(r => r.region === filters.region);
        }
        if (filters.type) {
            filtered = filtered.filter(r => r.type === filters.type);
        }
        if (filters.status) {
            filtered = filtered.filter(r => r.status === filters.status);
        }
        if (filters.exam_source) {
            if (filters.exam_source === "N/A") {
                filtered = filtered.filter(r => !r.user?.exam_source);
            } else {
                filtered = filtered.filter(r => r.user?.exam_source === filters.exam_source);
            }
        }

        if (filters.startDate) {
            filtered = filtered.filter(
                r => new Date(r.dateOfExam) >= new Date(filters.startDate)
            );
        }
        if (filters.endDate) {
            filtered = filtered.filter(
                r => new Date(r.dateOfExam) <= new Date(filters.endDate)
            );
        }

        setResults(filtered);
    }, [filters, allResults]);

    const [loadingPdf, setLoadingPdf] = useState(false);
    const handleDownload = async (user_id) => {
        try {
            setLoadingPdf(true);
            const response = await ExamReportService.getDetailUserResult(user_id);
            if (!response || response.length === 0) return alert("No exam data available");
            console.log("Exam Data:", response);
            const exam = response[0];
            const pdf = new jsPDF("p", "pt", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 30;
            let currentHeight = margin;

            pdf.setFont("NotoSansEthiopic", "normal");

            pdf.setFontSize(22);
            pdf.setTextColor(22, 160, 133);
            pdf.text("Exam Result", pageWidth / 2, currentHeight, { align: "center" });
            currentHeight += 12;
            pdf.setDrawColor(22, 160, 133);
            pdf.setLineWidth(1);
            pdf.line(margin, currentHeight, pageWidth - margin, currentHeight);
            currentHeight += 25;

            pdf.setFontSize(12);
            pdf.setTextColor(0, 0, 0);
            pdf.setFillColor(245, 245, 245);
            pdf.rect(margin, currentHeight, pageWidth - 2 * margin, 50, "F");
            pdf.text(`User Login Code: ${exam.loginCode}`, margin + 10, currentHeight + 18);
            pdf.text(`Status: ${exam.status}`, margin + 10, currentHeight + 32);
            pdf.text(`Score: ${exam.score}`, margin + 10, currentHeight + 46);
            currentHeight += 70;

            for (let i = 0; i < exam.questions.length; i++) {
                const q = exam.questions[i];

                const questionHtml = document.createElement("div");
                questionHtml.style.width = "600px";
                questionHtml.style.padding = "10px";
                questionHtml.style.fontFamily = "Noto Sans Ethiopic, sans-serif";
                questionHtml.style.background = "#f9f9f9";
                questionHtml.style.borderRadius = "8px";
                questionHtml.style.border = "1px solid #ddd";
                questionHtml.style.marginBottom = "8px";
                questionHtml.innerHTML = `
        <strong style="color: #16a085;">${i + 1}. ${q.question}</strong><br>
        ${q.choices?.map(c => `${c.label}. ${c.text}`).join("<br>") || ""}<br>
        <em style="color: #2980b9;">User Answer:</em> ${q.userAnswer ? `${q.userAnswer.label}. ${q.userAnswer.text}` : "ምላሽ አልተሰጠም"}<br>
        <em style="color: #27ae60;">Correct Answer:</em> ${q.correctAnswer ? `${q.correctAnswer.label}. ${q.correctAnswer.text}` : " ምላሽ አልተሰጠም"}<br>
      `;

                document.body.appendChild(questionHtml);
                const canvas = await html2canvas(questionHtml, { scale: 1.5, useCORS: true });
                document.body.removeChild(questionHtml);

                const imgData = canvas.toDataURL("image/jpeg", 0.8);
                const imgWidth = pageWidth - 2 * margin;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                if (currentHeight + imgHeight > pageHeight - margin) {
                    pdf.addPage();
                    currentHeight = margin;
                }

                pdf.addImage(imgData, "JPEG", margin, currentHeight, imgWidth, imgHeight);
                currentHeight += imgHeight + 12;
            }

            pdf.save(`exam-result-${exam.userID}.pdf`);
            setLoadingPdf(false);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF");
            setLoadingPdf(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value || ""
        }));
        setPage(0);
    };

   const handleExport = () => {
    if (results.length === 0) return;

    const formattedResults = results.map(row => ({
        "NO": row.id || "",
        "Full Name": row.studentName || "",
        "Gender": row.gender || "",
        "Organization": row.company || "",
        "Region": row.region || "",
        "Position": row.position || "",
        "Exam Source": row.user?.exam_source 
            ? examSourceLabels[row.user.exam_source] || row.user.exam_source 
            : "N/A",
        "Questions": row.totalQuestions || "",
        "Score": row.score || "",
        "Percentage": row.percentage || "",
        "Status": row.status || "",
        "Exam Date": row.dateOfExam ? new Date(row.dateOfExam).toLocaleDateString() : ""
    }));

    const ws = XLSX.utils.json_to_sheet(formattedResults);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");

    XLSX.writeFile(wb, "exam_results.xlsx", { bookType: "xlsx", type: "array" });
};


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
            {/* Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
                <Select
                    label="Organization"
                    value={filters.company}
                    onChange={(value) => handleFilterChange("company", value)}
                >
                    <Option value="">All</Option>
                    {uniqueOrganizations.map((org, i) => (
                        <Option key={i} value={org}>{org}</Option>
                    ))}
                </Select>

                <Select
                    label="Exam Source"
                    value={filters.exam_source}
                    onChange={(value) => handleFilterChange("exam_source", value)}
                >
                    <Option value="">All</Option>
                    {uniqueExamSources.map((src, i) => (
                        <Option key={i} value={src || "N/A"}>
                            {examSourceLabels[src] || src || "N/A"}
                        </Option>
                    ))}
                </Select>


                <Select
                    label="Gender"
                    value={filters.gender}
                    onChange={(value) => handleFilterChange("gender", value)}
                >
                    <Option value="">All</Option>
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                </Select>

                <Select
                    label="Region"
                    value={filters.region}
                    onChange={(value) => handleFilterChange("region", value)}
                >
                    <Option value="">All</Option>
                    {uniqueRegions.map((reg, i) => (
                        <Option key={i} value={reg}>{reg}</Option>
                    ))}
                </Select>

                <Select
                    label="Type"
                    value={filters.type}
                    onChange={(value) => handleFilterChange("type", value)}
                >
                    <Option value="">All</Option>
                    <Option value="junior">Junior</Option>
                    <Option value="experienced">Experienced</Option>
                </Select>

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

            {/* Export */}
            <div className="px-4">
                {results.length > 0 && (
                    <Button onClick={handleExport} color="blue">Export XLSX</Button>
                )}
            </div>

            {/* Results Table */}
            <Card shadow={false} className="border border-blue-gray-100">
                <CardBody className="overflow-x-auto px-4 py-4">
                    <table className="w-full min-w-[900px] text-left">
                        <thead>
                            <tr className="bg-blue-gray-50">
                                {[
                                    "NO", "Full Name", "Gender", "Organization", "Region", "Position",
                                    "Exam Source", "Questions", "Score", "Percentage", "Status", "Exam Date", "Action"
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
                                    <tr key={index} className="hover:bg-blue-gray-50 transition-colors">
                                        <td className="p-4">{page * rowsPerPage + index + 1}</td>
                                        <td className="p-4">{res.studentName}</td>
                                        <td className="p-4">{res.gender}</td>
                                        <td className="p-4">{res.company}</td>
                                        <td className="p-4">{res.region}</td>
                                        <td className="p-4">{res.position}</td>
                                        <td className="p-4">
                                            {examSourceLabels[res.user?.exam_source] || "N/A"}
                                        </td>
                                        <td className="p-4">{res.totalQuestions}</td>
                                        <td className="p-4">{res.score}</td>
                                        <td className="p-4">{res.percentage}</td>
                                        <td className={`p-4 font-semibold ${res.status.toLowerCase() === "passed"
                                            ? "text-green-600"
                                            : "text-red-600"
                                            }`}>
                                            {res.status}
                                        </td>
                                        <td className="p-4">
                                            {new Date(res.dateOfExam).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <span
                                                onClick={() => handleDownload(res.user?.userID)}
                                                className="cursor-pointer text-blue-600 hover:text-blue-800"
                                            >
                                                <i className="fas fa-download"></i>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            {results.length === 0 && (
                                <tr>
                                    <td colSpan={13} className="p-4 text-center text-blue-gray-500">
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
