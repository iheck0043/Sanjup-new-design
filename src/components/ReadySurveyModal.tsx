import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { X, Search, ArrowRight, Clock, FileText, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  fetchTemplateCategories,
  fetchTemplates,
  copyTemplate,
  type TemplateCategory,
  type Template as APITemplate,
} from "@/lib/api";

interface Template {
  id: number;
  title: string;
  questionCount: number;
  logo: string;
  categoryId: number;
  description: string;
}

interface Category {
  id: number;
  title: string;
}

interface ReadySurveyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTemplateSelect?: (templateId: number) => void;
}

const ReadySurveyModal: React.FC<ReadySurveyModalProps> = ({
  open,
  onOpenChange,
  onTemplateSelect,
}) => {
  const { accessToken } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  // Fetch categories
  const fetchCategoriesData = useCallback(async () => {
    if (!accessToken) return;

    try {
      const data = await fetchTemplateCategories(accessToken);
      const categoryList =
        data.data?.map((tag: TemplateCategory) => ({
          id: tag.id,
          title: tag.title,
        })) || [];

      setCategories(categoryList);

      // Select first category by default
      if (categoryList.length > 0 && !selectedCategory) {
        setSelectedCategory(categoryList[0].id);
        fetchTemplatesData(categoryList[0].id);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("خطا در دریافت دسته‌بندی‌ها");
    }
  }, [accessToken, selectedCategory]);

  // Fetch templates
  const fetchTemplatesData = useCallback(
    async (categoryId?: number, search?: string) => {
      if (!accessToken) return;
      if (!categoryId && !search) return;

      setIsSearching(true);

      try {
        const data = await fetchTemplates(accessToken, categoryId, search);
        const templateList =
          data.data?.map((template: APITemplate) => ({
            id: template.id,
            title: template.title,
            questionCount: template.question_count || 0,
            logo: template.logo || "/images/templates/default.jpg",
            categoryId: template.tag_id,
            description: template.description || "",
          })) || [];

        setTemplates(templateList);
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast.error("خطا در دریافت نظرسنجی‌ها");
      } finally {
        setIsSearching(false);
      }
    },
    [accessToken]
  );

  // Handle category click
  const handleCategoryClick = (categoryId: number) => {
    setIsCategoryLoading(true);
    setSelectedCategory(categoryId);
    setSearchQuery("");
    fetchTemplatesData(categoryId);
    setIsCategoryLoading(false);
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3) {
        setSelectedCategory(null);
        fetchTemplatesData(undefined, searchQuery);
      } else if (searchQuery.length === 0 && categories.length > 0) {
        setSelectedCategory(categories[0].id);
        fetchTemplatesData(categories[0].id);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, categories, fetchTemplatesData]);

  // Use template
  const useTemplate = async () => {
    if (!selectedTemplate?.id || !accessToken) return;

    setIsLoading(true);

    try {
      const data = await copyTemplate(selectedTemplate.id, accessToken);

      if (data.data) {
        onTemplateSelect?.(data.data);
        onOpenChange(false);
        toast.success("نظرسنجی با موفقیت ایجاد شد");
      }
    } catch (error) {
      console.error("Error using template:", error);
      toast.error("خطا در استفاده از قالب");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset modal state when closed
  useEffect(() => {
    if (!open) {
      setSelectedTemplate(null);
      setSearchQuery("");
    }
  }, [open]);

  // Initialize data
  useEffect(() => {
    if (open && categories.length === 0) {
      fetchCategoriesData();
    }
  }, [open, categories.length, fetchCategoriesData]);

  const getIframeUrl = (template: Template) => {
    const baseUrl = "https://survey-webview.pollche.com/survey/";
    return `${baseUrl}?id=${template.id}&token=${accessToken}&questionCount=${template.questionCount}&platform=sanjup`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
        {!selectedTemplate ? (
          // Template List Mode
          <div className="flex flex-col h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-white">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>

              <h2 className="text-xl font-bold">نظرسنجی آماده</h2>

              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="جستجوی نظرسنجی"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 pr-10"
                />
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <div className="w-64 bg-white border-l p-4 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">نمونه نظرسنجی</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.id ? "default" : "ghost"
                      }
                      className="w-full justify-start text-right h-auto py-2"
                      onClick={() => handleCategoryClick(category.id)}
                      disabled={
                        isCategoryLoading && selectedCategory === category.id
                      }
                    >
                      {isCategoryLoading &&
                        selectedCategory === category.id && (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        )}
                      {category.title}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">
                  نظرسنجی‌های عمومی
                </h3>

                {isSearching ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {templates.map((template) => (
                      <Card
                        key={template.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-white border-0 overflow-hidden"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="aspect-video bg-gray-100 overflow-hidden">
                          <img
                            src={template.logo}
                            alt={template.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "/images/templates/default.jpg";
                            }}
                          />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                            {template.title}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {template.questionCount} سوال
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Preview Mode
          <div className="flex flex-col h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-white">
              <Button
                variant="ghost"
                onClick={() => setSelectedTemplate(null)}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                بازگشت
              </Button>
              <h2 className="text-xl font-bold">پیش‌نمایش</h2>
              <div className="w-20" /> {/* Spacer */}
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Template Info */}
              <div className="w-96 bg-white p-8 border-l overflow-y-auto">
                <h3 className="text-2xl font-bold mb-4">
                  {selectedTemplate.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {selectedTemplate.description}
                </p>

                <div className="space-y-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">تعداد سوال</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {selectedTemplate.questionCount} سوال
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">زمان پاسخگویی</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      ۱۰ دقیقه
                    </span>
                  </div>
                </div>

                <Button
                  onClick={useTemplate}
                  disabled={isLoading}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      در حال ایجاد...
                    </>
                  ) : (
                    "استفاده از این نظرسنجی"
                  )}
                </Button>
              </div>

              {/* Preview Frame */}
              <div className="flex-1 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-8">
                <div className="relative">
                  <div className="w-80 h-[600px] bg-black rounded-3xl p-3 shadow-2xl">
                    <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                      <iframe
                        src={getIframeUrl(selectedTemplate)}
                        className="w-full h-full border-0"
                        title="Survey Preview"
                      />
                    </div>
                  </div>
                  <div className="absolute -right-20 top-1/2 transform -translate-y-1/2 rotate-90 text-white text-sm font-medium whitespace-nowrap">
                    پیش نمایش نظرسنجی
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReadySurveyModal;
