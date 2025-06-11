import React, { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../lib/auth-context";

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface BrandSloganQuestion {
  id: string;
  type: string;
  title: string;
  order: number;
}

interface BrandSloganInputProps {
  adTestType: "brand" | "slogan";
  questions: BrandSloganQuestion[];
  onQuestionsUpdate: () => void;
}

const BrandSloganInput: React.FC<BrandSloganInputProps> = ({
  adTestType,
  questions,
  onQuestionsUpdate,
}) => {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const [addingLoading, setAddingLoading] = useState(false);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [localBrands, setLocalBrands] = useState([{ title: "" }]);

  // Ref to store debounce timeouts for title updates
  const titleUpdateTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Filter statement questions that are not the first one (order !== 1)
  const statementQuestions = questions.filter(
    (q) => q.type === "statement" && q.order !== 1
  );

  const isBrandTest = adTestType === "brand";
  const isSloganTest = adTestType === "slogan";

  // Use statement questions if available, otherwise use local brands
  const displayItems =
    statementQuestions.length > 0 ? statementQuestions : localBrands;

  const addNewItem = async (index: number) => {
    if (!accessToken || !id) {
      toast.error("خطا در احراز هویت");
      return;
    }

    setAddingLoading(true);

    try {
      // Prepare question data
      const questionData = {
        is_required: false,
        order: 2,
        type: "statement",
        title: statementQuestions.length === 0 ? localBrands[index].title : "",
        related_group: null,
        attachment: "",
        attachment_type: "",
      };

      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/single-question-create/${id}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(questionData),
        }
      );

      if (!response.ok) {
        throw new Error("خطا در افزودن آیتم");
      }

      toast.success(
        `${isBrandTest ? "نام برند" : "شعار برند"} با موفقیت افزوده شد`
      );
      onQuestionsUpdate();

      // If using local brands, add a new empty item
      if (statementQuestions.length === 0) {
        setLocalBrands((prev) => [...prev, { title: "" }]);
      }
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error(
        error instanceof Error ? error.message : "خطا در افزودن آیتم"
      );
    } finally {
      setAddingLoading(false);
    }
  };

  const removeItem = async (index: number) => {
    if (!accessToken || !id) {
      toast.error("خطا در احراز هویت");
      return;
    }

    // If using local brands, just remove from local state
    if (statementQuestions.length === 0) {
      if (localBrands.length <= 1) {
        toast.error("حداقل یک آیتم باید باقی بماند");
        return;
      }
      setLocalBrands((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    setRemovingIndex(index);

    try {
      const questionId = statementQuestions[index].id;

      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/${id}/questions/${questionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("خطا در حذف آیتم");
      }

      toast.success(
        `${isBrandTest ? "نام برند" : "شعار برند"} با موفقیت حذف شد`
      );
      onQuestionsUpdate();
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error(error instanceof Error ? error.message : "خطا در حذف آیتم");
    } finally {
      setRemovingIndex(null);
    }
  };

  const updateQuestionTitle = async (questionId: string, title: string) => {
    if (!accessToken) return;

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/questionnaire/${questionId}/questions/update/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("خطا در بروزرسانی عنوان");
      }

      console.log("Question title updated successfully");
    } catch (error) {
      console.error("Error updating question title:", error);
      toast.error("خطا در بروزرسانی عنوان");
    }
  };

  // Debounced function to update question title
  const debouncedUpdateTitle = useCallback(
    (questionId: string, newTitle: string) => {
      // Clear existing timeout for this question
      if (titleUpdateTimeouts.current[questionId]) {
        clearTimeout(titleUpdateTimeouts.current[questionId]);
      }

      // Set new debounced timeout
      titleUpdateTimeouts.current[questionId] = setTimeout(() => {
        updateQuestionTitle(questionId, newTitle);
        // Clean up the timeout reference
        delete titleUpdateTimeouts.current[questionId];
      }, 500); // Wait 0.5 seconds after user stops typing
    },
    []
  );

  const handleTitleChange = (value: string, index: number) => {
    if (statementQuestions.length === 0) {
      // Update local brands state
      setLocalBrands((prev) =>
        prev.map((brand, i) =>
          i === index ? { ...brand, title: value } : brand
        )
      );
    } else {
      // Update API question title with debounce
      const question = statementQuestions[index];
      debouncedUpdateTitle(question.id, value);
    }
  };

  // Cleanup timeouts on component unmount
  useEffect(() => {
    return () => {
      // Clear all pending timeouts when component unmounts
      Object.values(titleUpdateTimeouts.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
      titleUpdateTimeouts.current = {};
    };
  }, []);

  return (
    <div className="w-full" dir="rtl">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          لطفا محتوای خود را وارد کنید:
        </h3>
        <p className="text-gray-600 text-sm">
          {isBrandTest
            ? "هر نامی که وارد می‌کنید، به‌طور جداگانه توسط گروهی از پاسخ‌دهندگان ارزیابی می‌شود."
            : "هر شعاری که وارد می‌کنید، به‌طور جداگانه توسط گروهی از پاسخ‌دهندگان ارزیابی می‌شود."}
        </p>
      </div>

      {/* Input Fields */}
      <div className="flex flex-col items-center justify-center space-y-4">
        {displayItems.map((item, index) => (
          <Card key={`item_${index}`} className="w-full max-w-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Input
                  key={`input_${
                    statementQuestions.length > 0
                      ? statementQuestions[index]?.id
                      : index
                  }`}
                  defaultValue={
                    statementQuestions.length > 0
                      ? statementQuestions[index]?.title || ""
                      : localBrands[index]?.title || ""
                  }
                  placeholder={isBrandTest ? "نام برند" : "شعار برند"}
                  onChange={(e) => handleTitleChange(e.target.value, index)}
                  className="flex-1"
                />

                {/* Add Button - Show only for the last item */}
                {index === displayItems.length - 1 && (
                  <Button
                    onClick={() => addNewItem(index)}
                    disabled={addingLoading}
                    size="sm"
                    variant="outline"
                    className="text-gray-600 hover:text-gray-700 border-gray-300"
                  >
                    {addingLoading ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                )}

                {/* Remove Button - Show for all items except the first when there are multiple */}
                {index > 0 && (
                  <Button
                    onClick={() => removeItem(index)}
                    disabled={removingIndex === index}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 border-red-300"
                  >
                    {removingIndex === index ? (
                      <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                    ) : (
                      <Minus className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {displayItems.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">
            هنوز {isBrandTest ? "نام برندی" : "شعاری"} وارد نشده است
          </p>
          <Button
            onClick={() => addNewItem(0)}
            disabled={addingLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {addingLoading
              ? "در حال افزودن..."
              : `افزودن اولین ${isBrandTest ? "نام برند" : "شعار"}`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default BrandSloganInput;
