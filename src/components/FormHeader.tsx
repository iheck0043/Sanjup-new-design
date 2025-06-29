import React from "react";
import { ArrowLeft, Eye, Edit3, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ui/theme-toggle";
import UserMenu from "./UserMenu";

interface Step {
  id: number;
  title: string;
  path: string;
}

interface FormHeaderProps {
  formTitle: string;
  setFormTitle: (title: string) => void;
  steps?: Step[];
  backPath?: string;
}

const FormHeader: React.FC<FormHeaderProps> = ({
  formTitle,
  setFormTitle,
  steps,
  backPath = "/",
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultSteps = [
    { id: 1, title: "طراحی نظرسنجی", path: "/" },
    { id: 2, title: "انتخاب مخاطب", path: "/audience" },
    { id: 3, title: "گزارش نتایج", path: "/results" },
  ];

  const currentSteps = steps || defaultSteps;

  const getCurrentStep = () => {
    const currentPath = location.pathname;
    const step = currentSteps.find((s) => s.path === currentPath);
    return step ? step.id : 1;
  };

  const currentStep = getCurrentStep();

  return (
    <div className="h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/70 dark:border-slate-700/70 flex items-center justify-between px-4 fixed w-full top-0 z-20 shadow-sm">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(backPath)}
          className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowRight className="w-4 h-4" />
        </Button>

        <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>

        <div className="group relative">
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="text-base font-medium bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 min-w-0 max-w-xs border border-transparent rounded-md px-2 py-1 transition-all duration-200 hover:border-slate-200 dark:hover:border-slate-600 focus:border-slate-300 focus:bg-slate-50/50 dark:focus:bg-slate-800/50"
            placeholder="عنوان فرم"
          />
          <Edit3 className="w-3 h-3 text-slate-400 absolute left-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      </div>

      {/* Centered Steps */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1">
        {currentSteps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => navigate(step.path)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentStep === step.id
                  ? "bg-slate-700 text-white shadow-sm dark:bg-slate-600"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span className="ml-1.5 text-xs">{step.id}</span>
              <span className="text-sm">{step.title}</span>
            </button>
            {index < currentSteps.length - 1 && (
              <div className="w-6 h-px bg-slate-300 dark:bg-slate-600 mx-0.5"></div>
            )}
          </div>
        ))}
      </div>

      {/* Theme Toggle, Preview Button and User Menu */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 h-8"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="text-sm">پیش‌نمایش</span>
        </Button>
        <UserMenu />
      </div>
    </div>
  );
};

export default FormHeader;
