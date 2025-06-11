
export interface Question {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'multi_choice' | 'dropdown' | 'scale' | 'rating' | 'matrix' | 'image_choice' | 'priority' | 'combobox' | 'description' | 'group';
  text: string;
  label: string;
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
}
