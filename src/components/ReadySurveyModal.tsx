import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  X,
  Search,
  ArrowRight,
  Clock,
  FileText,
  Loader2,
  ClipboardList,
} from "lucide-react";
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
  hasImageError?: boolean;
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

  // Handle image error
  const handleImageError = (templateId: number) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === templateId
          ? { ...template, hasImageError: true }
          : template
      )
    );
  };

  // Fetch categories
  const fetchCategoriesData = useCallback(async () => {
    if (!accessToken) return;

    try {
      const data = await fetchTemplateCategories(accessToken);
      const categoryList = [
        { id: 0, title: "همه" }, // دسته‌بندی همه
        ...(data.data?.map((tag: TemplateCategory) => ({
          id: tag.id,
          title: tag.title,
        })) || []),
      ];

      setCategories(categoryList);

      // Select "همه" category by default
      if (categoryList.length > 0 && !selectedCategory) {
        setSelectedCategory(0);
        fetchTemplatesData(0);
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
      if (categoryId === undefined && !search) return;

      setIsSearching(true);

      try {
        // اگر categoryId صفر است (همه)، tags نفرستیم
        const data = await fetchTemplates(
          accessToken,
          categoryId === 0 ? undefined : categoryId,
          search
        );
        const templateList =
          data.data?.map((template: APITemplate) => ({
            id: template.id,
            title: template.title,
            questionCount: template.question_count || 0,
            logo: template.logo || "",
            categoryId: template.tag_id,
            description: template.description || "",
            hasImageError: false,
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
        setSelectedCategory(0);
        fetchTemplatesData(0);
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
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-2xl">
        <div className="flex flex-col h-[90vh]">
          {/* Header */}
          <div className="pb-6 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-slate-800 dark:to-slate-700 px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white text-right mb-1">
                  انتخاب نظرسنجی آماده
                </h2>
                <p className="text-sm text-gray-600 dark:text-slate-300 text-right">
                  قالب‌های تخصصی و آماده برای شروع سریع
                </p>
              </div>
            </div>
          </div>

          {!selectedTemplate ? (
            // Template List Mode
            <div className="flex flex-col h-[85vh]">
              <div className="flex flex-1 overflow-hidden">
                {/* Refined Sidebar */}
                <div className="w-72 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm border-l border-slate-200/50 dark:border-slate-700/50 p-5 overflow-y-auto">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                    دسته‌بندی‌ها
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={
                          selectedCategory === category.id ? "default" : "ghost"
                        }
                        className={`w-full justify-start text-right h-auto py-2.5 px-3 rounded-lg transition-all duration-200 ${
                          selectedCategory === category.id
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100"
                        }`}
                        onClick={() => handleCategoryClick(category.id)}
                        disabled={
                          isCategoryLoading && selectedCategory === category.id
                        }
                      >
                        {isCategoryLoading &&
                          selectedCategory === category.id && (
                            <Loader2 className="ml-2 h-3 w-3 animate-spin" />
                          )}
                        <span className="text-xs font-medium">
                          {category.title}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Luxury Main Content */}
                <div className="flex-1 bg-gradient-to-br from-slate-50/30 to-white dark:from-slate-900/30 dark:to-slate-800/30 p-6 overflow-y-auto">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">
                    نظرسنجی‌های عمومی
                  </h3>

                  {isSearching ? (
                    <div className="flex flex-col items-center justify-center h-52">
                      <div className="relative">
                        <Loader2 className="h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-400" />
                        <div
                          className="absolute inset-2 h-6 w-6 border-2 border-slate-300 dark:border-slate-600 border-t-transparent rounded-full animate-spin"
                          style={{
                            animationDirection: "reverse",
                            animationDuration: "1.5s",
                          }}
                        ></div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm">
                        در حال جستجو...
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {templates.map((template) => (
                        <Card
                          key={template.id}
                          className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 overflow-hidden rounded-2xl group"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <div className="aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                            {template.logo && !template.hasImageError ? (
                              <>
                                <img
                                  src={template.logo}
                                  alt={template.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={() => handleImageError(template.id)}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 group-hover:from-slate-200 group-hover:to-slate-300 dark:group-hover:from-slate-600 dark:group-hover:to-slate-700 transition-all duration-300">
                                <ClipboardList className="w-12 h-12 text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform duration-300" />
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {template.title}
                            </h4>
                            <Badge
                              variant="secondary"
                              className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs px-2 py-1 rounded-lg"
                            >
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
            // Luxury Preview Mode
            <div className="flex flex-1 overflow-hidden">
              {/* Luxury Template Info */}
              <div className="w-[380px] bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm p-6 border-l border-slate-200/50 dark:border-slate-700/50 overflow-y-auto">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                  {selectedTemplate.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed text-sm">
                  {selectedTemplate.description}
                </p>

                <div className="space-y-4 mb-6">
                  <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                        <FileText className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        تعداد سوال
                      </span>
                    </div>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedTemplate.questionCount} سوال
                    </span>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                        <Clock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        زمان پاسخگویی
                      </span>
                    </div>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      ۱۰ دقیقه
                    </span>
                  </div>
                </div>

                <Button
                  onClick={useTemplate}
                  disabled={isLoading}
                  className="w-full h-10 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  size="sm"
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

              {/* Luxury Preview Frame */}
              <div className="flex-1 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-8">
                <div className="relative">
                  {/* Phone Frame */}
                  <div className="w-80 h-[600px] bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-4 shadow-2xl border-4 border-slate-800 dark:border-slate-700">
                    {/* Screen */}
                    <div className="w-full h-full bg-white dark:bg-slate-100 rounded-[2rem] overflow-hidden relative">
                      {/* Top notch */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 dark:bg-slate-800 rounded-b-2xl z-10"></div>

                      <iframe
                        src={getIframeUrl(selectedTemplate)}
                        className="w-full h-full border-0"
                        title="Survey Preview"
                      />
                    </div>
                  </div>

                  {/* Elegant Label */}
                  <div className="absolute -right-20 top-1/2 transform -translate-y-1/2">
                    <div className="bg-slate-700/90 dark:bg-slate-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg shadow-lg">
                      <span className="text-xs font-medium whitespace-nowrap">
                        پیش‌نمایش موبایل
                      </span>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-emerald-500/20 rounded-full"></div>
                  <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-emerald-500/10 rounded-full"></div>
                  <div className="absolute top-1/4 -left-8 w-6 h-6 bg-emerald-500/15 rounded-full"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReadySurveyModal;
