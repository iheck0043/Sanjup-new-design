
import React from 'react';

export interface Question {
  id: string;
  type: string;
  title: string;
  label?: string;
  text?: string;
  required?: boolean;
  isRequired?: boolean;
  is_required?: boolean;
  order?: number;
  related_group?: string | null;
  hasMedia?: boolean;
  mediaType?: string;
  mediaUrl?: string;
  attachment?: string;
  attachment_type?: string;
  attachmentType?: string;
  description?: string;
  options?: string[];
  conditions?: Array<{
    id: string;
    sourceOption: string;
    targetQuestionId: string;
  }>;
  children?: Question[];
  minNumber?: number;
  maxNumber?: number;
  maxLength?: number;
  limit?: number;
  rows?: string[];
  columns?: string[];
  imageOptions?: Array<{
    text: string;
    imageUrl: string;
  }>;
  isMultiSelect?: boolean;
  minSelectableChoices?: number;
  maxSelectableChoices?: number;
  shuffleOptions?: boolean;
  hasOther?: boolean;
  hasNone?: boolean;
  defaultValue?: any;
  step?: number;
}

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">صفحه اصلی</h1>
        <p className="text-gray-600">به سیستم مدیریت پرسشنامه خوش آمدید</p>
      </div>
    </div>
  );
};

export default Index;
