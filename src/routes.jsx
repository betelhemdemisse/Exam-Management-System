import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  ClipboardDocumentIcon 
} from "@heroicons/react/24/solid";
import { Home, User, QuestionBank } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import { ExamLanding } from "./pages/Exam";
import { Questions } from "./pages/Exam";
const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "User",
        path: "/user",
        element: <User />,
      },
       {
        icon: <ClipboardDocumentIcon {...icon} />,
        name: "Question Bank",
        path: "/question_bank",
        element: <QuestionBank />,
      },
    ],
  },
  {
    layout: "auth",
    pages: [
      {
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
  {
    layout: "exam",
    pages: [
      {
        path: "",
        element: <ExamLanding />,
      },
      {
        path:"/questions",
        element:<Questions />
      }
    ],
  },
];

export default routes;
