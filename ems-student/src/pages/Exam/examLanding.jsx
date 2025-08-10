import { useNavigate } from "react-router-dom";
// import PreventInspection from "./securityMeasure/preventInspection";
import examService from "@/service/exam.service";

export function ExamLanding() {
  const navigate = useNavigate();

  const handleBeginExam = async () => {
    try {
      const configID = "bf7a4a83-5886-4907-b5aa-a45126cca1c1";

      const createdExam = await examService.createExam({
        configID,
        exam_type: "mcq", // Added exam_type
      });
console.log("createdExam",createdExam.examID)
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

      // Navigate to questions page
      navigate("/exam/questions");
    } catch (error) {
      console.error("Failed to start exam:", error);
      alert("Unable to start the exam. Please try again.");
    }
  };


  return (
    <div className="h-screen bg-white-50 p-8 flex overflow-hidden">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] flex">
        {/* Sidebar */}
        <div className="w-1/4 bg-grey border-r p-4 flex flex-col rounded-lg">
          <div className="mb-6 border p-4 rounded-lg bg-green-50">
            <h1 className="text-2xl font-bold text-gray-800">Exam Dashboard</h1>
            <p className="text-sm text-gray-600">
              Welcome to your certification portal
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-black-500 flex-1">
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              User Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="text-lg font-semibold">Johnathan D. Smith</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Company</p>
                <p className="text-lg font-semibold">TechSolutions Inc.</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Position</p>
                <p className="text-lg font-semibold">Senior Developer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-3/4 flex flex-col pl-6">
          <div className="bg-white border p-4 rounded-lg mb-4">
            <div className="bg-green-50 p-3 rounded-lg mb-3">
              <h2 className="text-lg font-bold text-gray-800">Exam Information</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Exam Name:</span>
                <span className="font-medium">
                  Advanced Technical Certification
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">120 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Questions:</span>
                <span className="font-medium">75 items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Passing Score:</span>
                <span className="font-medium">80%</span>
              </div>
            </div>
          </div>

          {/* Instructions Card */}
          <div className="flex-1 flex flex-col">
            <div className="bg-grey border p-4 rounded-lg flex-1 flex flex-col">
              <div className="flex-1 overflow-auto">
                <h2 className="text-lg font-bold text-gray-800 mb-3">
                  Exam Instructions
                </h2>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                  <li>The exam must be completed in one session.</li>
                  <li>Ensure your device is fully charged.</li>
                  <li>Close all other applications.</li>
                  <li>Use of external resources is prohibited.</li>
                  <li>System will auto-submit when time expires.</li>
                  <li>Report technical issues immediately.</li>
                </ol>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex justify-end">
                  <button
                    onClick={handleBeginExam}
                    className="bg-green-100 hover:bg-green-200 text-green-1000 font-medium py-4 px-10 rounded-xl text-lg transition-colors"
                  >
                    Begin Exam →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
