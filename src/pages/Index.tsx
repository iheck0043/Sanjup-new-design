
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
}

export default function Index() {
  return <div>Index Page</div>;
}
