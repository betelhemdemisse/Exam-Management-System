import { Routes, Route } from "react-router-dom";
import {
  ChartPieIcon,
  UserIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { Navbar } from "@/widgets/layout";
import routes from "@/routes";

export function Exam() {
  const navbarRoutes = [
    {
      name: "exam",
      path: "/exam",
    },
  
    {
      name: "exam",
      path: "/exam/questions",
    },
  
  ];

  return (
    <div className="relative min-h-screen w-full">
      <Routes>
        {routes.map(
          ({ layout, pages }) =>
            layout === "exam" &&
            pages.map(({ path, element }) => (
              <Route exact path={path} element={element} />
            ))
        )}
      </Routes>
    </div>
  );
}

Exam.displayName = "/src/layout/exam.jsx";

export default Exam;
