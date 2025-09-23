import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const DownloadPDF = ({ data }) => {
  const handleDownload = () => {
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(18);
    doc.text("Exam Result", 14, 20);

    const exam = data[0]; // since response is an array
    doc.setFontSize(12);
    doc.text(`User ID: ${exam.userID}`, 14, 30);
    doc.text(`Exam ID: ${exam.examID}`, 14, 36);
    doc.text(`Score: ${exam.score}`, 14, 42);
    doc.text(`Status: ${exam.status}`, 14, 48);

    // Table for questions
    const tableColumn = ["Question", "Your Answer", "Correct Answer", "Status"];
    const tableRows = [];

    exam.questions.forEach((q, index) => {
      const status = q.userAnswer?.text === q.correctAnswer?.text ? "✔️ Correct" : "❌ Wrong";
      tableRows.push([
        `${index + 1}. ${q.question}`,
        q.userAnswer?.text || "Not answered",
        q.correctAnswer?.text || "N/A",
        status,
      ]);
    });

    doc.autoTable({
      startY: 55,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8, cellWidth: "wrap" },
      columnStyles: {
        0: { cellWidth: 70 }, 
        1: { cellWidth: 40 }, 
        2: { cellWidth: 40 }, 
        3: { cellWidth: 30 }, 
      },
    });

    // Save PDF
    doc.save("exam-result.pdf");
  };

  return (
    <button onClick={handleDownload} style={{ padding: "10px", background: "blue", color: "#fff" }}>
      Download PDF
    </button>
  );
};

export default DownloadPDF;
