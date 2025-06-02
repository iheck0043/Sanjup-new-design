
import { Question, ApiQuestion } from "../pages/QuestionnaireForm";

export const mapApiQuestionType = (type: string): string => {
  switch (type) {
    case "multi_select":
      return "چندگزینه‌ای (چند جواب)";
    case "single_select":
      return "چندگزینه‌ای (تک جواب)";
    case "matrix":
      return "ماتریسی";
    case "prioritize":
      return "اولویت دهی";
    case "combobox":
      return "لیست کشویی";
    case "grading":
      return "درجه بندی";
    case "text_question":
      return "متنی کوتاه";
    case "number_descriptive":
      return "اعداد";
    case "question_group":
      return "گروه سوال";
    case "statement":
      return "توضیحی";
    case "select_multi_image":
      return "انتخاب تصویر (چند جواب)";
    case "select_single_image":
      return "انتخاب تصویر (تک جواب)";
    case "yes_no":
      return "بله/خیر";
    case "website":
      return "وب سایت";
    case "range_slider":
      return "طیفی";
    case "email":
      return "ایمیل";
    default:
      return "متنی کوتاه";
  }
};

export const mapApiQuestionToQuestion = (question: ApiQuestion): Question => {
  return {
    id: question.id,
    type: mapApiQuestionType(question.type),
    label: question.title,
    required: question.is_required,
    textType: question.style === "long" ? "long" : "short",
    hasMedia: !!question.attachment_type,
    mediaType: question.attachment_type as "image" | "video",
    parentId: question.related_group,
    // Map other fields based on question type
    ...(question.type === "multi_select" && {
      options: question.options || [],
      hasOther: question.has_other || false,
      hasNone: question.has_none || false,
      hasAll: question.has_all || false,
      isMultiSelect: true,
      randomizeOptions: question.randomize_options || false,
    }),
    ...(question.type === "single_select" && {
      options: question.options || [],
      hasOther: question.has_other || false,
      hasNone: question.has_none || false,
      hasAll: question.has_all || false,
      isMultiSelect: false,
      randomizeOptions: question.randomize_options || false,
    }),
    ...(question.type === "matrix" && {
      rows: question.rows || [],
      columns: question.columns || [],
    }),
    ...(question.type === "prioritize" && {
      options: question.options || [],
      isPrioritize: true,
    }),
    ...(question.type === "combobox" && {
      options: question.options || [],
      isCombobox: true,
    }),
    ...(question.type === "grading" && {
      ratingMax: question.rating_max,
      ratingStyle: question.rating_style,
      isGrading: true,
    }),
    ...(question.type === "text_question" && {
      textType: question.style === "long" ? "long" : "short",
      minChars: question.min_chars,
      maxChars: question.max_chars,
    }),
    ...(question.type === "number_descriptive" && {
      isNumber: true,
      minNumber: question.min_value,
      maxNumber: question.max_value,
      step: question.step,
      defaultValue: question.default_value,
    }),
    ...(question.type === "select_multi_image" && {
      isMultiImage: true,
      imageOptions: question.options?.map((opt) => ({ text: opt })) || [],
    }),
    ...(question.type === "select_single_image" && {
      isSingleImage: true,
      imageOptions: question.options?.map((opt) => ({ text: opt })) || [],
    }),
    ...(question.type === "yes_no" && {
      isYesNo: true,
    }),
    ...(question.type === "website" && {
      isWebsite: true,
      validation: {
        pattern: "^https?://.+",
        required: question.is_required,
      },
    }),
    ...(question.type === "range_slider" && {
      isRangeSlider: true,
      minValue: question.min_value,
      maxValue: question.max_value,
      step: question.step,
      defaultValue: question.default_value,
    }),
    ...(question.type === "email" && {
      isEmail: true,
      validation: {
        pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        required: question.is_required,
      },
    }),
  };
};
