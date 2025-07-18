import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GripVertical,
  Image as ImageIcon,
  Star,
  Heart,
  ThumbsUp,
} from "lucide-react";
import type { Question } from "../../pages/QuestionnaireForm";

interface QuestionPreviewProps {
  question: Question;
}

const QuestionPreview: React.FC<QuestionPreviewProps> = ({ question }) => {
  const [scaleValue, setScaleValue] = React.useState(
    Math.ceil((question.scaleMax || 5) / 2)
  );

  React.useEffect(() => {
    setScaleValue(Math.ceil((question.scaleMax || 5) / 2));
  }, [question.scaleMax, question.id]);

  const isText =
    question.type === "text_question_short" ||
    question.type === "text_question_long";
  const isNumber = question.type === "number_descriptive";
  const isEmail = question.type === "text_question_email";
  const isDescription = question.type === "statement";
  const isScale = question.type === "range_slider";
  const isRating = question.type === "grading";
  const isDropdown = question.type === "combobox";
  const isMatrix = question.type === "matrix";
  const isPriority = question.type === "prioritize";
  const isImageChoice = question.type === "select_multi_image";
  const hasOptions = question.type === "single_select";

  // Determine the attachment path and build a full URL if it is a relative path
  const attachmentPath =
    (question as any).full_url || question.mediaUrl || question.attachment;

  const apiBase = import.meta.env.VITE_API_BASE_URL;
  const attachmentSrc = attachmentPath
    ? attachmentPath.startsWith("http")
      ? attachmentPath
      : `${apiBase}/${attachmentPath}`
    : null;

  // Detect if the attachment is a video based on the declared type or file extension
  const isVideoAttachment =
    question.attachment_type === "video" ||
    (attachmentPath && /\.(mp4|webm|ogg)(\?.*)?$/i.test(attachmentPath));

  return (
    <div className="flex-1 p-6 bg-white overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-medium mb-6 text-gray-800 border-b border-gray-200 pb-3">
            پیش‌نمایش سوال
          </h3>

          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium text-gray-900">
                {question.label}
                {(question.required || question.isRequired) && (
                  <span className="text-red-500 mr-1">*</span>
                )}
              </Label>

              {question.hasDescription && question.description && (
                <p className="text-sm text-gray-600 mt-1 mb-3">
                  {question.description}
                </p>
              )}

              {/* Media attachment preview (image / video) */}
              {attachmentSrc && (
                <div className="mb-4">
                  {isVideoAttachment ? (
                    <video
                      src={attachmentSrc}
                      controls
                      className="w-full max-h-[300px] rounded-md border"
                    />
                  ) : (
                    <img
                      src={attachmentSrc}
                      alt="attachment"
                      className="w-full max-h-[300px] object-contain border rounded-md"
                    />
                  )}
                </div>
              )}

              <div className="mt-3">
                {/* Text Question Preview */}
                {isText &&
                  (question.textType === "long" ? (
                    <Textarea
                      placeholder="پاسخ خود را وارد کنید"
                      disabled
                      className="bg-gray-50 min-h-[100px]"
                    />
                  ) : (
                    <Input
                      placeholder="پاسخ خود را وارد کنید"
                      disabled
                      className="bg-gray-50"
                    />
                  ))}

                {/* Number Question Preview */}
                {isNumber && (
                  <Input
                    type="number"
                    placeholder="عدد را وارد کنید"
                    disabled
                    className="bg-gray-50"
                  />
                )}

                {/* Email Question Preview */}
                {isEmail && (
                  <Input
                    type="email"
                    placeholder="ایمیل خود را وارد کنید"
                    disabled
                    className="bg-gray-50"
                  />
                )}

                {/* Description Preview */}
                {isDescription && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    این یک متن بدون پاسخ است که فقط اطلاعات ارائه می‌دهد
                  </div>
                )}

                {/* Scale Question Preview */}
                {isScale && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
                    {/* Slider */}
                    <div className="relative" dir="ltr">
                      <style>{`
                        .scale-slider::-webkit-slider-thumb {
                          appearance: none;
                          height: 0;
                          width: 0;
                          opacity: 0;
                        }
                        .scale-slider::-moz-range-thumb {
                          height: 0;
                          width: 0;
                          opacity: 0;
                          border: none;
                          background: transparent;
                        }
                      `}</style>
                      <input
                        type="range"
                        min="1"
                        max={question.scaleMax || 5}
                        value={scaleValue}
                        onChange={(e) =>
                          setScaleValue(parseInt(e.target.value))
                        }
                        className="w-full h-8 bg-gray-200 rounded-lg appearance-none cursor-pointer scale-slider"
                        dir="ltr"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                            ((scaleValue - 1) /
                              ((question.scaleMax || 5) - 1)) *
                            100
                          }%, #e5e7eb ${
                            ((scaleValue - 1) /
                              ((question.scaleMax || 5) - 1)) *
                            100
                          }%, #e5e7eb 100%)`,
                        }}
                      />

                      {/* Scale numbers inside slider */}
                      <div
                        className="absolute inset-0 flex justify-between items-center px-3 pointer-events-none"
                        dir="ltr"
                      >
                        {Array.from(
                          { length: question.scaleMax || 5 },
                          (_, i) => (
                            <span
                              key={i}
                              className="text-sm text-gray-700 font-semibold"
                            >
                              {i + 1}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Current value display */}
                    <div className="text-center text-sm font-medium text-blue-600 mb-2">
                      مقدار انتخابی: {scaleValue}
                    </div>

                    {/* Scale labels - فقط سه برچسب کاربر */}
                    <div
                      className="flex justify-between items-center text-sm text-gray-600 mt-4 px-2"
                      dir="ltr"
                    >
                      <div className="text-center max-w-[30%]">
                        {question.scaleLabels?.left && (
                          <span className="block leading-tight font-medium text-gray-700">
                            {question.scaleLabels.left}
                          </span>
                        )}
                      </div>
                      <div className="text-center max-w-[30%]">
                        {question.scaleLabels?.center && (
                          <span className="block leading-tight font-medium text-gray-700">
                            {question.scaleLabels.center}
                          </span>
                        )}
                      </div>
                      <div className="text-center max-w-[30%]">
                        {question.scaleLabels?.right && (
                          <span className="block leading-tight font-medium text-gray-700">
                            {question.scaleLabels.right}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Rating Question Preview */}
                {isRating && (
                  <div className="flex gap-2">
                    {Array.from({ length: question.ratingMax || 5 }, (_, i) => (
                      <button
                        key={i}
                        className="text-gray-300 hover:text-yellow-400 disabled:cursor-not-allowed"
                        disabled
                      >
                        {question.ratingStyle === "heart" && (
                          <Heart className="w-6 h-6" />
                        )}
                        {question.ratingStyle === "thumbs" && (
                          <ThumbsUp className="w-6 h-6" />
                        )}
                        {(!question.ratingStyle ||
                          question.ratingStyle === "star") && (
                          <Star className="w-6 h-6" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Dropdown Preview */}
                {isDropdown && (
                  <Select disabled>
                    <SelectTrigger className="bg-gray-50">
                      <SelectValue placeholder="گزینه‌ای را انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {(question.options || ["گزینه ۱", "گزینه ۲"]).map(
                        (option, index) => (
                          <SelectItem key={index} value={option}>
                            {option}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}

                {/* Matrix Preview */}
                {isMatrix && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 p-2 bg-gray-50"></th>
                          {(question.columns || ["ستون ۱", "ستون ۲"]).map(
                            (column, index) => (
                              <th
                                key={index}
                                className="border border-gray-300 p-2 bg-gray-50 text-sm"
                              >
                                {column}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {(question.rows || ["سطر ۱", "سطر ۲"]).map(
                          (row, rowIndex) => (
                            <tr key={rowIndex}>
                              <td className="border border-gray-300 p-2 bg-gray-50 text-sm">
                                {row}
                              </td>
                              {(question.columns || ["ستون ۱", "ستون ۲"]).map(
                                (_, colIndex) => (
                                  <td
                                    key={colIndex}
                                    className="border border-gray-300 p-2 text-center"
                                  >
                                    <input
                                      type="radio"
                                      name={`matrix-${rowIndex}`}
                                      disabled
                                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300"
                                    />
                                  </td>
                                )
                              )}
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Priority Preview */}
                {isPriority && (
                  <div className="space-y-2">
                    {(question.options || ["گزینه ۱", "گزینه ۲"]).map(
                      (option, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 border border-gray-200 rounded bg-gray-50 cursor-move"
                        >
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{index + 1}.</span>
                          <span className="text-sm">{option}</span>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Image Choice Preview */}
                {isImageChoice && (
                  <div className="grid grid-cols-2 gap-4">
                    {(
                      question.imageOptions || [
                        { text: "گزینه ۱", imageUrl: "" },
                        { text: "گزینه ۲", imageUrl: "" },
                      ]
                    ).map((option, index) => (
                      <label key={index} className="cursor-pointer">
                        <div className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                          <input
                            type="radio"
                            name="image-choice-preview"
                            disabled
                            className="sr-only"
                          />
                          <div className="space-y-2">
                            {option.imageUrl ? (
                              <div className="w-full h-24 bg-gray-100 rounded overflow-hidden">
                                <img
                                  src={option.imageUrl}
                                  alt={option.text}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            <p className="text-sm text-center">{option.text}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Multi-choice Preview */}
                {hasOptions && question.options && (
                  <div className="space-y-3">
                    {question.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type={question.isMultiSelect ? "checkbox" : "radio"}
                          name="preview-options"
                          disabled
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </div>
                    ))}

                    {question.hasOther && (
                      <div className="flex items-center gap-3">
                        <input
                          type={question.isMultiSelect ? "checkbox" : "radio"}
                          name="preview-options"
                          disabled
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">سایر:</span>
                        <Input
                          className="text-xs h-8 bg-gray-50"
                          disabled
                          placeholder="توضیح دهید..."
                        />
                      </div>
                    )}

                    {question.hasNone && (
                      <div className="flex items-center gap-3">
                        <input
                          type={question.isMultiSelect ? "checkbox" : "radio"}
                          name="preview-options"
                          disabled
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">هیچکدام</span>
                      </div>
                    )}

                    {question.hasAll && (
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          disabled
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">همه موارد</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPreview;
