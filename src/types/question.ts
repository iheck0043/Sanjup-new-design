
export interface Question {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'multi_choice' | 'dropdown' | 'scale' | 'rating' | 'matrix' | 'image_choice' | 'priority' | 'combobox' | 'description' | 'group' | 'single_select' | 'range_slider' | 'text_question_short' | 'text_question_long' | 'number_descriptive' | 'prioritize' | 'select_multi_image' | 'question_group' | 'statement' | 'grading' | 'text_question' | 'چندگزینه‌ای' | 'چندگزینه‌ای تصویری' | 'لیست کشویی';
  text: string;
  label: string;
  title?: string;
  order?: number;
  isRequired?: boolean;
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
}
