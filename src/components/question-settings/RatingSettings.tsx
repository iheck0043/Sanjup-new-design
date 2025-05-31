
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Star, Heart, ThumbsUp } from 'lucide-react';
import { Question } from '../../types/Question';

interface RatingSettingsProps {
  question: Question;
  onUpdate: (field: keyof Question, value: any) => void;
}

const RatingSettings: React.FC<RatingSettingsProps> = ({ question, onUpdate }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-3 block">تنظیم درجه</Label>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">تعداد درجه‌ها (1-10)</Label>
            <Slider
              value={[question.ratingMax || 5]}
              onValueChange={(value) => onUpdate('ratingMax', value[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>10</span>
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-600 mb-1 block">یا وارد کنید</Label>
            <Input
              type="number"
              value={question.ratingMax || 5}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 1 && value <= 10) {
                  onUpdate('ratingMax', value);
                }
              }}
              min={1}
              max={10}
              className="w-24"
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <Label className="text-sm font-medium">شکل درجه‌بندی</Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { type: 'star', icon: <Star className="w-5 h-5" />, label: 'ستاره' },
            { type: 'heart', icon: <Heart className="w-5 h-5" />, label: 'قلب' },
            { type: 'thumbs', icon: <ThumbsUp className="w-5 h-5" />, label: 'لایک' }
          ].map(({ type, icon, label }) => (
            <button
              key={type}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                question.ratingStyle === type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onUpdate('ratingStyle', type)}
            >
              {icon}
              <span className="text-xs mt-1">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingSettings;
