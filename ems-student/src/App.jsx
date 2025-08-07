import { Routes, Route, Navigate } from "react-router-dom";
import {  Auth, Exam } from "@/layouts";

function App() {
  return (
    <Routes>
      <Route path="/*" element={<Auth />} />
      <Route path="/exam/*" element={<Exam />} />
      <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
      
    </Routes>
  );
}

export default App;
