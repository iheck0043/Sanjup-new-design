
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { ApiQuestion } from "../pages/QuestionnaireForm";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface QuestionnaireCompleted {
  answer_count: number;
}

interface Questionnaire {
  id: string;
  title: string;
  description: string;
  status: string;
  created: number;
  questionnaire_completed: QuestionnaireCompleted;
}

interface QuestionnaireResponse {
  data: Questionnaire;
  info: {
    status: number;
    message: string;
  };
}

export const useQuestionnaireData = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);

  useEffect(() => {
    if (!accessToken) {
      toast.error("لطفا ابتدا وارد حساب کاربری خود شوید");
      navigate("/login");
      return;
    }

    if (id && id !== "new") {
      fetchQuestionnaire();
      fetchQuestions();
    } else {
      setLoading(false);
    }
  }, [id, accessToken]);

  const fetchQuestionnaire = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/sanjup/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("خطا در دریافت اطلاعات پرسشنامه");
      }

      const data: QuestionnaireResponse = await response.json();
      if (data.info.status === 200) {
        setQuestionnaire(data.data);
      } else {
        throw new Error(data.info.message);
      }
    } catch (error) {
      console.error("Error fetching questionnaire:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "خطا در دریافت اطلاعات پرسشنامه"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/${id}/questions`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("خطا در دریافت سوالات");
      }

      const data = await response.json();
      if (data.info.status === 200) {
        setQuestions(data.data as ApiQuestion[]);
      } else {
        throw new Error(data.info.message);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error(
        error instanceof Error ? error.message : "خطا در دریافت سوالات"
      );
    }
  };

  return {
    questionnaire,
    questions,
    setQuestions,
    loading,
    fetchQuestions,
  };
};
