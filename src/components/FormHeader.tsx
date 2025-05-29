
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

interface FormHeaderProps {
  formTitle: string;
  setFormTitle: (title: string) => void;
}

const FormHeader: React.FC<FormHeaderProps> = ({ formTitle, setFormTitle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const steps = [
    { id: 1, title: 'طراحی نظرسنجی', path: '/' },
    { id: 2, title: 'انتخاب مخاطب', path: '/audience' },
    { id: 3, title: 'گزارش نتایج', path: '/results' }
  ];

  const getCurrentStep = () => {
    const currentPath = location.pathname;
    const step = steps.find(s => s.path === currentPath);
    return step ? step.id : 1;
  };

  const currentStep = getCurrentStep();

  return (
    <div className="h-20 bg-white/90 backdrop-blur-sm border-b border-gray-200/50 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/surveys')}
          className="h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="h-8 w-px bg-gray-300"></div>
        
        <input
          type="text"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          className="text-lg font-semibold bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 min-w-0 max-w-md"
          placeholder="عنوان فرم"
        />
      </div>

      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => navigate(step.path)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentStep === step.id
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
    </div>
  );
};

export default FormHeader;
