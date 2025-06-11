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
