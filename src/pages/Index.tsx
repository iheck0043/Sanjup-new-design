
import React from 'react';
import { Question } from '../types/question';

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
export type { Question };
