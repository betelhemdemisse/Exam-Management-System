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
import { Home, User, QuestionBank, Result, ChangePassword } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import { ExamLanding } from "./pages/Exam";
import { Questions } from "./pages/Exam";
import ProtectedRoute from './ProtectedRoute';
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
        element:(
         <ProtectedRoute>
           <Home />
        </ProtectedRoute>) 

      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "User",
        path: "/user",
        element:( 
         <ProtectedRoute>
          <User />
        </ProtectedRoute>) 
      },
      {
        icon: <ClipboardDocumentIcon {...icon} />,
        name: "Question Bank",
        path: "/question_bank",
        element: ( 
         <ProtectedRoute>
            <QuestionBank />
         </ProtectedRoute>
         )
      },
      {
        icon: <DocumentCheckIcon {...icon} />,
        name: "Result",
        path: "/result",
        element: (
         <ProtectedRoute>
           <Result />
         </ProtectedRoute>
        )
      },
       {
        path: "/change-password",
        element: (
         <ProtectedRoute>
           <ChangePassword />
         </ProtectedRoute>
        )
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
