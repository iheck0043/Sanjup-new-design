import React from "react";
import { ArrowLeft, Eye, Edit3, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate, useLocation } from "react-router-dom";

interface FormHeaderProps {
  formTitle: string;
  setFormTitle: (title: string) => void;
}

const FormHeader: React.FC<FormHeaderProps> = ({ formTitle, setFormTitle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const steps = [
    { id: 1, title: "طراحی نظرسنجی", path: "/" },
    { id: 2, title: "انتخاب مخاطب", path: "/audience" },
    { id: 3, title: "گزارش نتایج", path: "/results" },
  ];

  const getCurrentStep = () => {
    const currentPath = location.pathname;
    const step = steps.find((s) => s.path === currentPath);
    return step ? step.id : 1;
  };

  const currentStep = getCurrentStep();

  return (
    <div className="h-20 bg-white/90 backdrop-blur-sm border-b border-gray-200/50 flex items-center justify-between px-6 fixed w-full top-0 z-20">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <ArrowRight className="w-5 h-5" />
        </Button>

        <div className="h-8 w-px bg-gray-300"></div>

        <div className="group relative">
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 min-w-0 max-w-md border-2 border-transparent rounded-md px-2 py-1 transition-all duration-200 hover:border-gray-200 focus:border-blue-300 focus:bg-blue-50/30"
            placeholder="عنوان فرم"
          />
          <Edit3 className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      </div>

      {/* Centered Steps */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => navigate(step.path)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentStep === step.id
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <span className="ml-2">{step.id}</span>
              {step.title}
            </button>
            {index < steps.length - 1 && (
              <div className="w-8 h-px bg-gray-300 mx-1"></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Preview Button */}
      <Button
        variant="outline"
        className="flex items-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-50"
      >
        <Eye className="w-4 h-4" />
        پیش‌نمایش
      </Button>
    </div>
  );
};

export default FormHeader;
