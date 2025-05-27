
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Check } from 'lucide-react';

interface FormHeaderProps {
  formTitle: string;
  setFormTitle: (title: string) => void;
}

const FormHeader: React.FC<FormHeaderProps> = ({ formTitle, setFormTitle }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(formTitle);

  const handleTitleSave = () => {
    setFormTitle(tempTitle);
    setIsEditingTitle(false);
  };

  const steps = [
    { id: 1, name: 'طراحی پرسشنامه', active: true },
    { id: 2, name: 'انتشار', active: false },
    { id: 3, name: 'مشاهده نتایج', active: false }
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center space-x-6 space-x-reverse">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">F</span>
            </div>
            
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="text-lg font-semibold border-blue-200 focus:border-blue-400"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleTitleSave()}
                />
                <Button size="sm" onClick={handleTitleSave} className="h-8 w-8 p-0">
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditingTitle(true)}
                className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors group"
              >
                {formTitle}
                <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center">
          <nav className="flex items-center space-x-1 space-x-reverse">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  step.active 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ml-2 ${
                    step.active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.id}
                  </span>
                  {step.name}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-6 h-px bg-gray-200 mx-2"></div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default FormHeader;
