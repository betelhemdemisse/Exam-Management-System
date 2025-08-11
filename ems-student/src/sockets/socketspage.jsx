import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function ExamPage() {
  const [warning, setWarning] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const userToken = localStorage.getItem("userToken");

    if (!userToken) {
      console.error("❌ No token found. User might not be logged in.");
      return;
    }

    const socket = io("http://196.189.30.156:3000", {
      auth: {
        token: userToken,
      },
    });

    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("exam_warning", (payload) => {
      console.log("⚠️ 5 minutes left!", payload);
      setWarning("⚠️ 5 minutes left!");
    });

    socket.on("exam_auto_submitted", (payload) => {
      console.log("✅ Auto-submitted", payload);
      setStatus("✅ Your exam was auto-submitted.");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Exam Page</h1>
      {warning && <p style={{ color: "orange", fontWeight: "bold" }}>{warning}</p>}
      {status && <p style={{ color: "green", fontWeight: "bold" }}>{status}</p>}
    </div>
  );
}
