
export interface Question {
  id: string;
  type: string;
  title: string;
  label: string;
  text: string;
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
  maxChars?: number;
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
  textType?: string;
}
