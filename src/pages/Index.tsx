
export interface Question {
  id: string;
  type: string;
  label: string;
  title?: string;
  required?: boolean;
  options?: string[];
  related_group?: string | null;
  style?: string;
  conditions?: Array<{
    id: string;
    sourceOption: string;
    targetQuestionId: string;
  }>;
  // Matrix properties
  rows?: string[];
  columns?: string[];
  // Image choice properties
  imageOptions?: Array<{
    text: string;
    imageUrl: string;
  }>;
  // Dropdown specific properties
  isMultiSelect?: boolean;
  minSelectableChoices?: number;
  maxSelectableChoices?: number;
  shuffleOptions?: boolean;
  hasOther?: boolean;
  hasNone?: boolean;
  // Media properties
  hasMedia?: boolean;
  mediaType?: string;
  mediaUrl?: string;
  attachment?: string;
  attachment_type?: string;
}
