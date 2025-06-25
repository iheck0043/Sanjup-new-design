import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus } from "lucide-react";
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
  const [inputValue, setInputValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const isBrandTest = adTestType === "brand";

  const addNewItem = async () => {
    if (!inputValue.trim()) {
      toast.error(`لطفا ${isBrandTest ? "نام برند" : "شعار برند"} را وارد کنید`);
      return;
    }

    if (!accessToken || !id) {
      toast.error("خطا در احراز هویت");
      return;
    }

    setIsAdding(true);

    try {
      // Prepare question data with appropriate prefix
      const prefix = isBrandTest ? "[brand] " : "[slogan] ";
      const questionData = {
        is_required: false,
        order: 2,
        type: "statement",
        title: prefix + inputValue.trim(),
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
        `${isBrandTest ? "نام برند" : "شعار برند"} با موفقیت اضافه شد`
      );
      
      // Clear input and update questions
      setInputValue("");
      onQuestionsUpdate();
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error(
        error instanceof Error ? error.message : "خطا در افزودن آیتم"
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addNewItem();
    }
  };

  return (
    <div className="w-full" dir="rtl">
      <div className="flex items-center space-x-3 space-x-reverse">
        <div className="flex-1">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`${isBrandTest ? "نام برند خود را وارد کنید" : "شعار برند خود را وارد کنید"}...`}
            className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 text-sm"
            dir="rtl"
            disabled={isAdding}
          />
        </div>
        <Button
          onClick={addNewItem}
          disabled={!inputValue.trim() || isAdding}
          className={`
            ${isBrandTest 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-orange-600 hover:bg-orange-700"
            } 
            text-white px-4 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isAdding ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {!isAdding && "اضافه"}
        </Button>
      </div>
      
      {/* Helper Text */}
      <p className="text-xs text-gray-500 mt-2">
        {isBrandTest 
          ? "نام برند خود را وارد کرده و روی دکمه اضافه کلیک کنید" 
          : "شعار برند خود را وارد کرده و روی دکمه اضافه کلیک کنید"
        }
      </p>
    </div>
  );
};

export default BrandSloganInput;
