import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth, Exam } from "@/layouts";

function App() {
  return (
    <Routes>
  {/* Redirect root to sign-in to avoid blank page and preserve port */}
  <Route path="/" element={<Navigate to="/sign-in" replace />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/*" element={<Auth />} />
      <Route path="/exam/*" element={<Exam />} />
      <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
      
    </Routes>
  );
}

export default App;
