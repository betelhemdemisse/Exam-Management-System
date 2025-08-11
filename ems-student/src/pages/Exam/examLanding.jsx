import { useNavigate } from "react-router-dom";
// import PreventInspection from "./securityMeasure/preventInspection";
import examService from "@/service/exam.service";
import Ems_logo from "../../assets/img/ems_logo.png";
import Question_mark_vector from "../../assets/img/question_mark_vector.png";
export function ExamLanding() {
  const navigate = useNavigate();

  const handleBeginExam = async () => {
    try {
      const configID = "66ddf678-616d-4108-8b70-efe5b851bce3";

      const createdExam = await examService.createExam({
        configID,
        exam_type: "mcq"
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
    <div className="min-h-screen bg-gray-100">
<header className="bg-white shadow p-4 flex justify-end items-center max-w-7xl mx-auto rounded-lg">
  <div className="flex items-center gap-3">
    <div className="text-right">
      <p className="font-semibold text-sm">Tensae Tefera</p>
      <p className="text-gray-500 text-xs">User</p>
    </div>
    <img
      src="/profile.jpg"
      alt="Profile"
      className="w-10 h-10 rounded-full border border-gray-300"
    />
  </div>
</header>

   <div className="flex justify-center p-6 space-y-6 flex-col items-center">
<div
  className="w-full max-w-7xl text-white p-8 rounded-lg shadow-lg flex flex-col lg:flex-row justify-between items-center"
  style={{ backgroundColor: '#1167b4' }}
>  <div className="lg:w-2/3">
      <div className="text-sm uppercase tracking-wide mb-2">
        Dashboard / My Courses
      </div>
      <h1 className="text-2xl font-bold mb-4">
        Advanced Technical Certification
      </h1>
      <p className="mb-6 text-sm leading-relaxed">
        Exam description. Donec ullamcorper nulla non metus auctor
        fringilla. Cras justo odio, dapibus ac facilisis in, egestas eget
        quam. Duis mollis, est non commodo luctus, nisi erat porttitor
        ligula, eget lacinia odio sem nec elit. Donec id elit non mi porta
        gravida at eget metus.
      </p>

      <div className="flex flex-wrap gap-8">
        <div>
          <p className="font-bold text-lg">#75</p>
          <span className="text-sm">Exam Questions</span>
        </div>
        <div>
          <p className="font-bold text-lg">120 Minutes</p>
          <span className="text-sm">Duration</span>
        </div>
        <div>
          <p className="font-bold text-lg">80%</p>
          <span className="text-sm">Passing Score</span>
        </div>
      </div>
    </div>

    <div className="lg:w-1/3 flex justify-center mt-6 lg:mt-0">
      <img src={Ems_logo} alt="Logo" className="max-h-32 object-contain" />
    </div>
  </div>

    
<div className="w-full max-w-7xl bg-white p-8 rounded-lg shadow-lg flex flex-col lg:flex-row justify-between items-start gap-6 relative">
  <div className="lg:w-2/3">
    <h2 className="text-lg font-bold mb-4">User Information</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div>
        <p className="text-gray-500 text-sm">Full Name</p>
        <p className="font-medium">Tensae Tefera</p>
      </div>
      <div>
        <p className="text-gray-500 text-sm">Company</p>
        <p className="font-medium">TechSolutions Inc.</p>
      </div>
      <div>
        <p className="text-gray-500 text-sm">Position</p>
        <p className="font-medium">UI/UX Designer</p>
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
   </div>
    );
  }
