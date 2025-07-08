import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useApi } from "@/hooks/useApi";
import {
  Eye,
  ArrowLeft,
  Edit3,
  X,
  Clock,
  Users,
  HelpCircle,
  BarChart3,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PreviewLayout from "@/components/PreviewLayout";
import LogoSanjup from "@/assets/Logo-Sanjup.png";

interface SurveyItem {
  id: string;
  title: string;
  caption: string;
  user_reward: number;
  publisher: string;
  question_count: number;
  time_of_completion: number;
  finish_message: string;
  questionnaire_completed: {
    user_limit: number;
  };
}

interface Question {
  id: string;
  question_title: string;
  type: string;
}

const Preview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  const [step, setStep] = useState(0);
  const [item, setItem] = useState<SurveyItem | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [url, setUrl] = useState("https://example.com");

  const {
    loading: pollLoading,
    data: pollData,
    get: getPoll,
  } = useApi<{ data: SurveyItem }>(`api/v1/questionnaire/sanjup/${id}/`);
  const {
    loading: questionsLoading,
    data: questionsData,
    get: getQuestions,
  } = useApi<{ data: Question[] }>(`api/v1/questionnaire/${id}/questions`);

  // Fetch poll data
  useEffect(() => {
    if (id && accessToken) {
      getPoll({});
    }
  }, [id, accessToken]);

  // Fetch questions data
  useEffect(() => {
    if (id && accessToken) {
      getQuestions({});
    }
  }, [id, accessToken]);

  // Update item when poll data is received
  useEffect(() => {
    if (pollData?.data) {
      setItem(pollData.data);

      // Generate survey URL
      const baseUrl = !window.location.hostname.includes("webapp-dev")
        ? // ? "https://survey-webview.pollche.com/survey/"
          "https://webapp-dev.pollche.com/survey/"
        : "https://webapp-dev.pollche.com/survey/";

      setUrl(
        `${baseUrl}?id=${id}&token=${accessToken}&questionCount=${pollData.data.question_count}&firstName=${user?.first_name}&platform=sanjup`
      );
    }
  }, [pollData, id, accessToken, user]);

  // Update questions when questions data is received
  useEffect(() => {
    if (questionsData?.data) {
      setQuestions(questionsData.data);
    }
  }, [questionsData]);

  const handleClose = () => {
    window.close();
  };

  const handleEdit = () => {
    if (step !== 0) {
      // Navigate to specific question
      const newWindow = window.open(
        `/questionnaire/${id}?questionIndex=${step - 1}`,
        "_blank"
      );
      if (newWindow) newWindow.focus();
    } else {
      // Navigate to main edit page
      const newWindow = window.open(`/questionnaire/${id}`, "_blank");
      if (newWindow) newWindow.focus();
    }
  };

  const handlePrevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleNextStep = () => {
    if (step < 1) {
      setStep(step + 1);
    }
  };

  if (pollLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center">
        <div className="text-white text-lg">در حال بارگیری...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center">
        <div className="text-white text-lg">نظرسنجی یافت نشد</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Logo */}
      <div className="fixed top-14 right-14 z-10">
        <img
          src={LogoSanjup}
          alt="سنجاپ"
          className="h-8 w-auto brightness-0 invert"
        />
      </div>

      <div className="flex items-center justify-center min-h-screen">
        <div className="relative" style={{ width: "400px", height: "761px" }}>
          {/* Side Label */}
          <p
            className="absolute text-white text-sm whitespace-nowrap"
            style={{
              top: "230px",
              left: "-105px",
              transform: "rotate(-90deg)",
              transformOrigin: "center",
            }}
          >
            پیش نمایش نظرسنجی ساخته شده
          </p>

          {/* Previous Button */}
          {step !== 0 && (
            <button
              onClick={handlePrevStep}
              className="absolute bg-white flex items-center justify-center text-black text-xs font-medium rounded px-3 py-2"
              style={{
                left: "-65px",
                top: "60%",
                width: "103px",
                height: "60px",
              }}
            >
              اطلاعات نظرسنجی
              <ArrowLeft className="w-4 h-4 mr-2 rotate-180" />
            </button>
          )}

          {/* Next Button */}
          {step < 1 && (
            <button
              onClick={handleNextStep}
              className="absolute bg-white flex items-center justify-center text-black text-sm font-medium rounded px-3 py-2"
              style={{
                left: step !== 0 ? "-200px" : "-65px",
                top: "60%",
                width: "103px",
                height: "60px",
              }}
            >
              سوالات
              <ArrowLeft className="w-4 h-4 mr-2 " />
            </button>
          )}

          {/* Edit Button */}
          <button
            onClick={handleEdit}
            className="absolute bg-gray-800 flex items-center justify-center rounded"
            style={{
              width: "60px",
              height: "60px",
              top: "-40px",
              right: "-60px",
            }}
          >
            <Edit3 className="w-5 h-5 text-white" />
          </button>

          {/* Phone Frame */}
          <div
            style={{ transform: "translateX(90px)" }}
            className="relative z-10"
          >
            <PreviewLayout />
          </div>

          {/* Content - Step 0: Survey Info */}
          {step === 0 && (
            <div
              className="absolute bg-white rounded-xl p-5 z-20"
              style={{
                height: "527px",
                bottom: "23px",
                left: "56px",
                right: "22px",
              }}
              dir="rtl"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <span className="font-semibold text-lg">{item.title}</span>
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <X className="w-4 h-4 text-gray-500" />
                </div>
              </div>

              {/* Reward Section */}
              <div
                className="bg-gradient-to-r from-blue-100 to-purple-100 mt-6 w-full rounded-lg flex p-3 items-center justify-center border border-blue-200"
                style={{
                  height: "116px",
                }}
              >
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    جایزه این نظرسنجی
                  </p>
                  <div className="flex justify-center items-center">
                    <p className="text-2xl font-medium text-gray-900">
                      {item.user_reward}
                    </p>
                    <div className="w-6 h-6 bg-yellow-400 rounded-full mr-2 flex items-center justify-center">
                      <span className="text-yellow-800 text-xs font-bold">
                        ₮
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="flex flex-wrap w-full mt-4 text-xs">
                {/* Publisher */}
                <div className="w-1/2 pl-2 mb-3">
                  <div className="h-11 bg-gray-100 py-2 px-2 rounded-lg flex items-center justify-start">
                    <BarChart3 className="w-4 h-4 text-purple-600 ml-1" />
                    <span className="text-gray-600 font-light ml-1">
                      منتشرکننده
                    </span>
                    <span
                      className="text-gray-900 font-semibold truncate"
                      title={item.publisher}
                    >
                      {item.publisher}
                    </span>
                  </div>
                </div>

                {/* Questions */}
                <div className="w-1/2 pr-2 mb-3">
                  <div className="h-11 bg-gray-100 py-2 px-2 rounded-lg flex items-center justify-start">
                    <HelpCircle className="w-4 h-4 text-purple-600 ml-1" />
                    <span className="text-gray-600 font-light ml-1">
                      سؤالات
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {item.question_count} سوال
                    </span>
                  </div>
                </div>

                {/* Participants */}
                <div className="w-1/2 pl-2 mb-3">
                  <div className="h-11 bg-gray-100 py-2 px-2 rounded-lg flex items-center justify-start">
                    <Users className="w-4 h-4 text-purple-600 ml-1" />
                    <span className="text-gray-600 font-light ml-1">
                      شرکت کننده
                    </span>
                    <span
                      className="text-gray-900 font-semibold"
                      title={`${
                        item.questionnaire_completed.user_limit || 0
                      } نفر`}
                    >
                      {item.questionnaire_completed.user_limit || 0} نفر
                    </span>
                  </div>
                </div>

                {/* Time */}
                <div className="w-1/2 pr-2 mb-3">
                  <div className="h-11 bg-gray-100 py-2 px-2 rounded-lg flex items-center justify-start">
                    <Clock className="w-4 h-4 text-purple-600 ml-1" />
                    <span className="text-gray-600 font-light ml-1">
                      زمان لازم
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {item.time_of_completion} دقیقه
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-5 py-4 px-8">
                <div className="flex items-center mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500 ml-2" />
                  <span className="font-semibold text-sm">
                    توضیحات و راهنما
                  </span>
                </div>
                <p className="text-sm text-justify text-gray-700">
                  {item.caption}
                </p>
              </div>
            </div>
          )}

          {/* Content - Step 1+: Survey iframe */}
          {step > 0 && (
            <div
              className="absolute bg-white rounded-xl overflow-hidden z-20"
              style={{
                height: "600px",
                bottom: "23px",
                left: "56px",
                right: "22px",
                paddingBottom: "80px",
              }}
              dir="rtl"
            >
              <iframe
                src={url}
                width="100%"
                height="595px"
                style={{ border: "none" }}
                title="نظرسنجی"
              />
            </div>
          )}

          {/* Final Step: Completion Message */}
          {step === questions.length + 1 && (
            <div
              className="absolute bg-purple-900 text-center rounded-3xl p-5 text-white z-20"
              style={{
                height: "647px",
                bottom: "23px",
                left: "56px",
                right: "22px",
              }}
              dir="rtl"
            >
              <div className="relative">
                {/* Success Icon SVG */}
                <svg
                  width="280"
                  height="406"
                  className="mx-auto"
                  viewBox="0 0 280 406"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M205 42C192.297 42 182.488 30.9697 175.864 20.1307C168.487 8.05782 155.184 0 140 0C124.816 0 111.513 8.05782 104.136 20.1307C97.5123 30.9697 87.7025 42 75 42H20C8.95431 42 0 50.9543 0 62V386C0 397.046 8.95431 406 20 406H260C271.046 406 280 397.046 280 386V62C280 50.9543 271.046 42 260 42H205Z"
                    fill="white"
                  />
                  <circle
                    cx="140"
                    cy="42"
                    r="21"
                    fill="url(#paint0_linear_28_218)"
                  />
                  <path
                    d="M127.958 44.125L134.333 50.5L148.5 36.3334"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_28_218"
                      x1="119"
                      y1="21"
                      x2="161"
                      y2="63"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#00B642" />
                      <stop offset="1" stopColor="#A9E1BC" />
                    </linearGradient>
                  </defs>
                </svg>

                <p className="absolute flex justify-center items-center text-center left-12 right-12 top-36">
                  {item.finish_message}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Preview;
