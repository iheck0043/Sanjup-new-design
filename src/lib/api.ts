import { useAuth } from "./auth-context";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface Category {
  logo: string;
  id: number;
  title: string;
  caption: string;
  color: string;
}

interface QuestionnaireCompleted {
  answer_count: number;
  user_limit: number;
  percent: number;
}

export interface Questionnaire {
  id: string;
  title: string;
  category: Category;
  time_of_completion: number;
  public_publish_date: string | null;
  single_user_publish_date: number | null;
  public_expire_at: string | null;
  single_user_expire_at: number | null;
  status: string;
  created: number;
  updated: number;
  question_count: number;
  questionnaire_completed: QuestionnaireCompleted;
  default_questionnaire: boolean;
  questionnaire_type: string;
}

export interface QuestionnaireResponse {
  info: {
    response_type: string;
    status: number;
    message: string;
    attrs: any[];
    count: number;
    next: string | null;
    previous: string | null;
  };
  data: Questionnaire[];
}

export const questionnaireStatuses = [
  { value: "all", label: "همه" },
  { value: "draft", label: "پیش‌نویس" },
  { value: "published", label: "منتشر شده" },
  { value: "pending", label: "در حال بررسی" },
  { value: "pending_publish", label: "انتشار با زمانبندی" },
  { value: "finished", label: "پایان یافته" },
];

export const fetchQuestionnaires = async (
  page: number,
  pageSize: number,
  status: string,
  accessToken: string
): Promise<QuestionnaireResponse> => {
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const statusParam = status === "all" ? "" : status;
  const response = await fetch(
    `${BASE_URL}/api/v1/questionnaire/sanjup/?page=${page}&page_size=${pageSize}&status=${statusParam}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch questionnaires");
  }

  return response.json();
};

export const deleteQuestionnaire = async (
  id: string,
  accessToken: string
): Promise<void> => {
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const response = await fetch(
    `${BASE_URL}/api/v1/questionnaire/sanjup/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete questionnaire");
  }
};

export const createQuestionnaire = async (
  title: string,
  questionnaireType: string,
  accessToken: string
): Promise<{ data: { id: string; title: string; status: string } }> => {
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const response = await fetch(
    `${BASE_URL}/api/v1/questionnaire/sanjup/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title,
        questionnaire_type: questionnaireType,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create questionnaire");
  }

  return response.json();
};

export const setPublishMethods = async (
  id: string,
  accessToken: string
): Promise<void> => {
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const formData = new FormData();
  formData.append("publish_public", "false");
  formData.append("publish_single_user", "true");
  formData.append("publish_questioner", "false");

  const response = await fetch(
    `${BASE_URL}/api/v1/questionnaire/sanjup/${id}/publish_methods/`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to set publish methods");
  }
};

export const updateQuestionnaireType = async (
  id: string,
  questionnaireType: string,
  accessToken: string
): Promise<void> => {
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const formData = new FormData();
  formData.append("questionnaire_type", questionnaireType);

  const response = await fetch(
    `${BASE_URL}/api/v1/questionnaire/update-type/${id}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update questionnaire type");
  }
};

// Template related API functions
export interface TemplateCategory {
  id: number;
  title: string;
}

export interface Template {
  id: number;
  title: string;
  question_count: number;
  logo: string;
  tag_id: number;
  description: string;
}

export const fetchTemplateCategories = async (
  accessToken: string
): Promise<{ data: TemplateCategory[] }> => {
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const response = await fetch(`${BASE_URL}/api/v1/common/tags?page_size=100`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch template categories");
  }

  return response.json();
};

export const fetchTemplates = async (
  accessToken: string,
  categoryId?: number,
  search?: string
): Promise<{ data: Template[] }> => {
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const params = new URLSearchParams();
  if (search) {
    params.append("title__icontains", search);
  } else if (categoryId) {
    params.append("tags", categoryId.toString());
  }

  const response = await fetch(
    `${BASE_URL}/api/v1/questionnaire/templates-list?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch templates");
  }

  return response.json();
};

export const copyTemplate = async (
  templateId: number,
  accessToken: string
): Promise<{ data: number }> => {
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const response = await fetch(
    `${BASE_URL}/api/v1/panel/questionnaire-deep-copy/${templateId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to copy template");
  }

  return response.json();
};

// AI Survey Generation API functions
export interface AISurveyRequest {
  title: string;
  summary: string;
  target?: string;
  category: string;
  preferred_question_type?: string[];
  question_count: string;
  sample_topics?: string;
  tone?: string;
  brand_name?: string;
  competitors?: string;
}

export const generateAISurvey = async (
  payload: AISurveyRequest,
  accessToken: string
): Promise<{ data: { id: string } }> => {
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const response = await fetch(
    `${BASE_URL}/api/v1/questionnaire/ai/auto-generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate AI survey");
  }

  return response.json();
};

export const checkAISurveyStatus = async (
  id: string,
  accessToken: string
): Promise<{ data: { questionnaire?: string } }> => {
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const response = await fetch(
    `${BASE_URL}/api/v1/questionnaire/ai/questionnaire-builder-details/${id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to check AI survey status");
  }

  return response.json();
};

// File upload and survey import API functions
export const uploadFile = async (
  formData: FormData,
  accessToken: string
): Promise<{ data: { full_url: string } }> => {
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const response = await fetch(`${BASE_URL}/api/v1/uploader/files/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload file");
  }

  return response.json();
};

export const generateAISurveyFromFile = async (
  fileUrl: string,
  accessToken: string
): Promise<{ data: { id: string } }> => {
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const response = await fetch(
    `${BASE_URL}/api/v1/questionnaire/ai/auto-generate-fromfile`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ file: fileUrl }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate survey from file");
  }

  return response.json();
};

export const importPorslineSurvey = async (
  url: string,
  accessToken: string
): Promise<{ data: { id: string } }> => {
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const response = await fetch(`${BASE_URL}/api/v1/questionnaire/extraction`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error("Failed to import Porsline survey");
  }

  return response.json();
};

// Report and Dashboard APIs
export interface ReportSummary {
  id: string;
  title: string;
  status: "draft" | "published" | "finished" | "expired";
  created: string;
  single_user_publish_date?: string;
  single_user_expire_at?: string;
  questionnaire_completed?: {
    percent: number;
    answer_count: number;
    user_limit: number;
  };
}

export interface ExportStatus {
  waiting: boolean;
  file_address: string;
  updated: string;
}

export const fetchReportSummary = async (
  id: string,
  accessToken: string
): Promise<{ data: ReportSummary }> => {
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const response = await fetch(
    `${BASE_URL}/api/v1/dashboard/dashboard-initial/${id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch report summary");
  }

  return response.json();
};

export const checkExportStatus = async (
  id: string,
  accessToken: string
): Promise<{ data: ExportStatus }> => {
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const response = await fetch(
    `${BASE_URL}/api/v2/questionnaire/export/${id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to check export status");
  }

  return response.json();
};

export const createExport = async (
  id: string,
  accessToken: string
): Promise<{ data: ExportStatus }> => {
  if (!accessToken) {
    throw new Error("No access token available");
  }

  const response = await fetch(
    `${BASE_URL}/api/v2/questionnaire/export/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create export");
  }

  return response.json();
};
