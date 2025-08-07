import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  ClipboardDocumentIcon,
  DocumentCheckIcon 
} from "@heroicons/react/24/solid";
import { SignIn, SignUp } from "@/pages/auth";
import { ExamLanding } from "./pages/Exam";
import { Questions } from "./pages/Exam";
const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  

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
