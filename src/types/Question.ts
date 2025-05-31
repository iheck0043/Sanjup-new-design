
export interface CombinedCondition {
  id: string;
  sourceQuestionId: string;
  sourceOption: string;
  operator: 'AND' | 'OR';
}

export interface ConditionalRule {
  id: string;
  conditions: CombinedCondition[];
  targetQuestionId: string;
}

export interface Question {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  hasDescription?: boolean;
  description?: string;
  hasMedia?: boolean;
  options?: string[];
  imageOptions?: { text: string; imageUrl: string }[];
  rows?: string[];
  columns?: string[];
  scaleMax?: number;
  scaleLabels?: { left?: string; center?: string; right?: string };
  ratingMax?: number;
  ratingStyle?: 'star' | 'heart' | 'thumbs';
  textType?: 'short' | 'long';
  minChars?: number;
  maxChars?: number;
  minNumber?: number;
  maxNumber?: number;
  hasOther?: boolean;
  hasNone?: boolean;
  hasAll?: boolean;
  isRequired?: boolean;
  isMultiSelect?: boolean;
  randomizeOptions?: boolean;
  combinedConditions?: ConditionalRule[];
}
