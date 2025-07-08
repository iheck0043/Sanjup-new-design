import React from "react";
import { Eye, Edit3, ArrowRight, DollarSign, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import LogoSanjupBlue from "@/assets/Logo-Sanjup-blue.png";

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
  children?: React.ReactNode;
  totalAmount?: number;
  summary?: React.ReactNode;
  onPay?: () => void;
  amountLoading?: boolean;
}

const FormHeader: React.FC<FormHeaderProps> = ({
  formTitle,
  setFormTitle,
  steps,
  backPath = "/",
  children,
  totalAmount,
  summary,
  onPay,
  amountLoading = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Detect if we're in adtest context
  const isAdTest = location.pathname.includes("/adtest/");
  const pathSegments = location.pathname.split("/");
  const currentId = pathSegments[2]; // Extract ID from path

  const defaultSteps = [
    { id: 1, title: "طراحی نظرسنجی", path: "/" },
    { id: 2, title: "انتخاب مخاطب", path: "/audience" },
    { id: 3, title: "گزارش نتایج", path: "/results" },
  ];

  const adTestSteps = [
    { id: 1, title: "تعیین محتوا", path: `/adtest/${currentId}` },
    { id: 2, title: "سوالات", path: `/adtest/${currentId}/questions` },
    { id: 3, title: "انتخاب مخاطب", path: `/adtest/${currentId}/audience` },
    { id: 4, title: "گزارش نتایج", path: `/adtest/${currentId}/results` },
  ];

  const currentSteps = steps || (isAdTest ? adTestSteps : defaultSteps);

  const getCurrentStep = () => {
    const currentPath = location.pathname;
    // For adtest context, match more intelligently
    if (isAdTest) {
      if (currentPath.includes("/questions")) return 2;
      if (currentPath.includes("/audience")) return 3;
      if (currentPath.includes("/results")) return 4;
      return 1; // Default to first step (content determination)
    }
    const step = currentSteps.find((s) => s.path === currentPath);
    return step ? step.id : 1;
  };

  const currentStep = getCurrentStep();

  const handlePreview = () => {
    if (currentId) {
      const previewPath = isAdTest
        ? `/adtest/${currentId}/preview`
        : `/questionnaire/${currentId}/preview`;

      window.open(previewPath, "_blank");
    }
  };

  return (
    <div className=" bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-4">
          <div className="flex justify-between items-center h-16">
            {/* Left Side - Logo, Back Button and Form Title */}
            <div className="flex items-center">
              <div
                className="flex items-center cursor-pointer mr-4"
                onClick={() => navigate("/")}
              >
                <img
                  src={LogoSanjupBlue}
                  alt="سنجاپ"
                  className="h-8 w-auto hover:opacity-80 transition-opacity"
                />
              </div>

              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mr-3"></div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(backPath)}
                className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 mr-3"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>

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

            {/* Center - Steps Navigation */}
            <div className="flex items-center gap-1">
              {currentSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => navigate(step.path)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentStep === step.id
                        ? "bg-blue-600 text-white shadow-sm dark:bg-blue-500"
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

            {/* Right Side - Preview, Pay button, Theme Toggle and User Menu */}
            <div className="flex items-center gap-2">
              {typeof totalAmount === "number" && (
                <div className="flex items-center gap-1.5">
                  <HoverCard openDelay={100}>
                    <HoverCardTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-8"
                        disabled={amountLoading}
                      >
                        {amountLoading ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs">در حال محاسبه</span>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          <span className="text-sm font-medium">
                            {totalAmount.toLocaleString()} تومان
                          </span>
                        )}
                        <ChevronDown className="w-3.5 h-3.5" />
                      </Button>
                    </HoverCardTrigger>
                    {summary && (
                      <HoverCardContent
                        className="p-0 border-none shadow-xl bg-transparent w-[380px] max-h-[80vh] overflow-y-auto"
                        align="end"
                      >
                        {summary}
                      </HoverCardContent>
                    )}
                  </HoverCard>
                  <Button
                    size="sm"
                    onClick={onPay}
                    className="flex items-center gap-1 text-white bg-green-600 hover:bg-green-700 h-8"
                    disabled={amountLoading}
                  >
                    {/* <DollarSign className="w-3.5 h-3.5" /> */}
                    <span className="text-sm">پرداخت</span>
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 h-8"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="text-sm">پیش‌نمایش</span>
              </Button>
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16">{children}</main>
    </div>
  );
};

export default FormHeader;
