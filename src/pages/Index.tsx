
export interface Question {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  options?: string[];
  related_group?: string | null;
  style?: string;
}
