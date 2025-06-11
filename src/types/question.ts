
export interface Question {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'multi_choice' | 'dropdown' | 'scale' | 'rating' | 'matrix' | 'image_choice' | 'priority' | 'combobox' | 'description' | 'group' | 'single_select' | 'range_slider' | 'text_question_short' | 'text_question_long' | 'text_question_email' | 'number_descriptive' | 'prioritize' | 'select_multi_image' | 'select_single_image' | 'question_group' | 'statement' | 'grading' | 'text_question' | 'multi_select' | 'چندگزینه‌ای' | 'چندگزینه‌ای تصویری' | 'لیست کشویی';
  text: string;
  label: string;
  title?: string;
  order?: number;
  isRequired?: boolean;
  required?: boolean;
  is_required?: boolean; // For API compatibility
  placeholder?: string;
  minChars?: number;
  maxChars?: number;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  ratingType?: 'star' | 'heart' | 'thumbs';
  ratingMax?: number;
  matrixRows?: string[];
  matrixColumns?: string[];
  imageOptions?: Array<{
    id: string;
    label: string;
    imageUrl: string;
  }>;
  allowMultiple?: boolean;
  priorityItems?: string[];
  groupQuestions?: Question[];
  description?: string;
  conditions?: any[];
  related_group?: string;
  hasMedia?: boolean;
  mediaType?: string;
  mediaUrl?: string;
  attachment?: string;
  attachment_type?: string;
  rows?: string[];
  columns?: string[];
  isMultiSelect?: boolean;
  minSelectableChoices?: number;
  maxSelectableChoices?: number;
  shuffleOptions?: boolean;
  hasOther?: boolean;
  hasNone?: boolean;
  maxLength?: number;
  limit?: number;
  minNumber?: number;
  maxNumber?: number;
  children?: Question[];
  defaultValue?: any; // For API compatibility
}
