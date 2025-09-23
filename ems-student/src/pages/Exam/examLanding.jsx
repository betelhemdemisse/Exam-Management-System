import { useNavigate } from "react-router-dom";
 import PreventInspection from "./securityMeasure/preventInspection";
import examService from "@/service/exam.service";
import Ems_logo from "../../assets/img/ems_logo.png";
import Question_mark_vector from "../../assets/img/question_mark_vector.png";
import SampleProfile from "../../assets/img/sample_profile.png";
import authService from "@/service/auth.service";
import { useEffect, useState } from "react";

export function ExamLanding() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const getCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
      } else {
        console.log("No user is currently logged in.");
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  const handleBeginExam = async () => {
    try {

      const createdExam = await examService.createExam();
      if (createdExam?.examID) {
        localStorage.setItem("currentExamId", createdExam.examID);
      }

      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        await elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
   navigate("/exam/questions", { state: createdExam });

    } catch (error) {
      console.error("Failed to start exam:", error);
      setModalMessage("Unable to start the exam.");
      setModalOpen(true);
    }
  };

  return (
    // <PreventInspection>
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4 flex justify-end items-center max-w-7xl mx-auto rounded-lg">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold text-sm">{currentUser?.name}</p>
            <p className="text-gray-500 text-xs">{currentUser?.role}</p>
          </div>
          {currentUser?.gender }
          <img
            src={SampleProfile}
            alt="Profile"
            className="w-10 h-10 rounded-full border border-gray-300"
          />
        </div>
      </header>

      <div className="flex justify-center p-6 space-y-6 flex-col items-center">
  <div
    className="w-full max-w-7xl text-white p-8 rounded-lg shadow-lg flex flex-col lg:flex-row justify-between items-center"
    style={{ backgroundColor: "#1167b4" }}
  >
    <div className="lg:w-2/3">
      <div className="text-sm uppercase tracking-wide mb-2">
        Dashboard / My Exam
      </div>
      <h1 className="text-3xl font-extrabold mb-4 flex items-center gap-2">
        📜 Exam Instructions
      </h1>
      <ol className="list-decimal list-inside space-y-3 text-base">
         <li>
          The test contains 25 multiple-choice questions.
        </li>
        <li>
          The total duration of the test is 45 minutes to complete.
        </li>
        <li>
          <span className="font-semibold">Stay in one session:</span> Complete
          the exam in one continuous session without leaving the browser.
        </li>
        <li>
          <span className="font-semibold text-red-300">No tab switching:</span>{" "}
          Do not switch tabs, minimize the browser,or open other applications this will end your exam.
        </li>
           
        <li>
          Report technical issues to the{" "}
          <span className="font-semibold">supervisor immediately</span>.
        </li>
       
          <li>When time expires, the test will automatically submit your answers.</li>
          <li> The timer will start as soon as you begin the test.</li>
          <li>Select the best answer by clicking on the corresponding option.</li>
          <li>Do not use calculators, mobile phones, or other electronic devices during the test.</li>
          <li>Any form of cheating will result in disqualification</li>
      </ol>
    </div>

    <div className="lg:w-1/3 flex justify-center mt-6 lg:mt-0">
      <img src={Ems_logo} alt="Logo" className="max-h-44 object-contain" />
    </div>
  </div>

  <div className="w-full max-w-7xl bg-white p-8 rounded-lg shadow-lg flex flex-col lg:flex-row justify-between items-start gap-6 relative">
    <div className="lg:w-2/3">
      <h2 className="text-lg font-bold mb-4">User Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <p className="text-gray-500 text-sm">Full Name</p>
          <p className="font-medium">{currentUser?.name}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Company</p>
          <p className="font-medium">{currentUser?.company}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Position</p>
          <p className="font-medium">{currentUser?.position}</p>
        </div>

      </div>
      <button
        onClick={handleBeginExam}
        className="text-white px-6 py-2 rounded transition flex items-center gap-2
          bg-gradient-to-r from-[#1167B4] to-[#7F7EFF]
          hover:from-[#0e559a] hover:to-[#6a6de6]"
      >
        Begin Exam <span className="text-lg">&rarr;</span>
      </button>
    </div>

    <div className="absolute top-2 right-2 w-49 h-48 opacity-50">
      <img
        src={Question_mark_vector}
        alt="User Image"
        className="rounded object-cover w-full h-full"
      />
    </div>
  </div>
</div>


      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-6">{modalMessage}</p>
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
    // {/* </PreventInspection> */}
  );
}
