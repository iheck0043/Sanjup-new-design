
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
}
