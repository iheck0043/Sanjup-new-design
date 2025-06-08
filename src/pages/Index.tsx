
// This file is needed for imports in other components
export interface Question {
  id: string;
  type: string;
  label: string;
  title?: string;
  related_group?: string | null;
  required?: boolean;
  options?: any[];
  description?: string;
  conditions?: any[];
  placeholder?: string;
  text?: string;
  is_required?: boolean;
  order?: number;
}

export interface ApiQuestion {
  id: string;
  type: string;
  title?: string;
  label: string;
  related_group?: string | null;
  required?: boolean;
  options?: any[];
  description?: string;
  conditions?: any[];
  placeholder?: string;
  style?: string;
  text?: string;
  is_required?: boolean;
  order?: number;
}

export default function Index() {
  return <div>Index Page</div>;
}
