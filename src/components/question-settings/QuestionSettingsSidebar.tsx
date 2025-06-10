
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TextQuestionSettings from './question-types/TextQuestionSettings';
import MultiChoiceQuestionSettings from './question-types/MultiChoiceQuestionSettings';
import DropdownQuestionSettings from './question-types/DropdownQuestionSettings';
import ScaleQuestionSettings from './question-types/ScaleQuestionSettings';
import MatrixQuestionSettings from './question-types/MatrixQuestionSettings';
import PriorityQuestionSettings from './question-types/PriorityQuestionSettings';
import ImageChoiceQuestionSettings from './question-types/ImageChoiceQuestionSettings';
import RatingQuestionSettings from './question-types/RatingQuestionSettings';
import NumberQuestionSettings from './question-types/NumberQuestionSettings';
import DescriptionQuestionSettings from './question-types/DescriptionQuestionSettings';
import QuestionGroupSettings from './question-types/QuestionGroupSettings';
import EmailQuestionSettings from './question-types/EmailQuestionSettings';
import type { Question } from '../../pages/Index';

interface QuestionSettingsSidebarProps {
  question: Question;
  onUpdateField: (field: keyof Question, value: any) => void;
}

const QuestionSettingsSidebar: React.FC<QuestionSettingsSidebarProps> = ({
  question,
  onUpdateField,
}) => {
  const renderQuestionTypeSettings = () => {
    switch (question.type) {
      case 'متنی با پاسخ کوتاه':
      case 'متنی با پاسخ بلند':
        return <TextQuestionSettings question={question} onUpdate={(updates) => {
          Object.keys(updates).forEach(key => {
            onUpdateField(key as keyof Question, updates[key]);
          });
        }} form={{ control: null }} />;
      case 'چندگزینه‌ای':
      case 'چندگزینه‌ای تصویری':
        return <MultiChoiceQuestionSettings question={question} onUpdate={(updates) => {
          Object.keys(updates).forEach(key => {
            onUpdateField(key as keyof Question, updates[key]);
          });
        }} form={{ control: null }} />;
      case 'لیست کشویی':
        return <DropdownQuestionSettings question={question} onUpdate={(updates) => {
          Object.keys(updates).forEach(key => {
            onUpdateField(key as keyof Question, updates[key]);
          });
        }} form={{ control: null }} />;
      case 'طیفی':
        return <ScaleQuestionSettings question={question} onUpdate={(updates) => {
          Object.keys(updates).forEach(key => {
            onUpdateField(key as keyof Question, updates[key]);
          });
        }} form={{ control: null }} />;
      case 'ماتریسی':
        return <MatrixQuestionSettings question={question} onUpdate={(updates) => {
          Object.keys(updates).forEach(key => {
            onUpdateField(key as keyof Question, updates[key]);
          });
        }} form={{ control: null }} />;
      case 'اولویت‌دهی':
        return <PriorityQuestionSettings question={question} onUpdate={(updates) => {
          Object.keys(updates).forEach(key => {
            onUpdateField(key as keyof Question, updates[key]);
          });
        }} form={{ control: null }} />;
      case 'چندگزینه‌ای تصویری':
        return <ImageChoiceQuestionSettings question={question} onUpdate={(updates) => {
          Object.keys(updates).forEach(key => {
            onUpdateField(key as keyof Question, updates[key]);
          });
        }} form={{ control: null }} />;
      case 'درجه‌بندی':
        return <RatingQuestionSettings question={question} onUpdate={(updates) => {
          Object.keys(updates).forEach(key => {
            onUpdateField(key as keyof Question, updates[key]);
          });
        }} form={{ control: null }} />;
      case 'عدد':
        return <NumberQuestionSettings question={question} onUpdate={(updates) => {
          Object.keys(updates).forEach(key => {
            onUpdateField(key as keyof Question, updates[key]);
          });
        }} form={{ control: null }} />;
      case 'متن بدون پاسخ':
        return <DescriptionQuestionSettings question={question} onUpdate={(updates) => {
          Object.keys(updates).forEach(key => {
            onUpdateField(key as keyof Question, updates[key]);
          });
        }} form={{ control: null }} />;
      case 'گروه سوال':
        return <QuestionGroupSettings question={question} onUpdate={(updates) => {
          Object.keys(updates).forEach(key => {
            onUpdateField(key as keyof Question, updates[key]);
          });
        }} form={{ control: null }} />;
      case 'ایمیل':
        return <EmailQuestionSettings question={question} onUpdate={(updates) => {
          Object.keys(updates).forEach(key => {
            onUpdateField(key as keyof Question, updates[key]);
          });
        }} form={{ control: null }} />;
      default:
        return <div>No settings available for this question type.</div>;
    }
  };

  return (
    <div className="space-y-6 p-4">
      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
        <div className="space-y-0.5">
          <FormLabel htmlFor="required">اجباری</FormLabel>
        </div>
        <FormControl>
          <Switch
            id="required"
            checked={question.required || false}
            onCheckedChange={(value) => onUpdateField('required', value)}
          />
        </FormControl>
      </FormItem>

      {renderQuestionTypeSettings()}
    </div>
  );
};

export default QuestionSettingsSidebar;
