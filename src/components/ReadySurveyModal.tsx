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
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl rounded-3xl">
        {!selectedTemplate ? (
          // Template List Mode
          <div className="flex flex-col h-[85vh]">
            {/* Luxury Header */}
            <div className="flex items-center justify-between p-8 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 dark:from-emerald-900/20 dark:to-emerald-800/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 dark:bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">نظرسنجی آماده</h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">انتخاب از مجموعه نظرسنجی‌های تخصصی</p>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="جستجوی نظرسنجی"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-96 pr-12 h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 dark:focus:border-emerald-500 text-lg"
                />
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Refined Sidebar */}
              <div className="w-80 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm border-l border-slate-200/50 dark:border-slate-700/50 p-6 overflow-y-auto">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">دسته‌بندی‌ها</h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className={`w-full justify-start text-right h-auto py-4 px-4 rounded-xl transition-all duration-200 ${
                        selectedCategory === category.id 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg" 
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                      onClick={() => handleCategoryClick(category.id)}
                      disabled={isCategoryLoading && selectedCategory === category.id}
                    >
                      {isCategoryLoading && selectedCategory === category.id && (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      )}
                      <span className="text-base font-medium">{category.title}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Luxury Main Content */}
              <div className="flex-1 bg-gradient-to-br from-slate-50/30 to-white dark:from-slate-900/30 dark:to-slate-800/30 p-8 overflow-y-auto">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  نظرسنجی‌های عمومی
                </h3>

                {isSearching ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="relative">
                      <Loader2 className="h-12 w-12 animate-spin text-emerald-600 dark:text-emerald-400" />
                      <div className="absolute inset-2 h-8 w-8 border-2 border-slate-300 dark:border-slate-600 border-t-transparent rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-4 text-lg">در حال جستجو...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {templates.map((template) => (
                      <Card
                        key={template.id}
                        className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 overflow-hidden rounded-2xl group"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                          <img
                            src={template.logo}
                            alt={template.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = "/images/templates/default.jpg";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <CardContent className="p-5">
                          <h4 className="font-bold text-slate-900 dark:text-white text-base mb-3 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {template.title}
                          </h4>
                          <Badge 
                            variant="secondary" 
                            className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-sm px-3 py-1 rounded-xl"
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
          <div className="flex flex-col h-[90vh]">
            {/* Luxury Preview Header */}
            <div className="flex items-center justify-between p-8 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-emerald-50/50 to-emerald-100/30 dark:from-emerald-900/20 dark:to-emerald-800/10">
              <Button
                variant="ghost"
                onClick={() => setSelectedTemplate(null)}
                className="flex items-center gap-3 px-6 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all duration-200"
              >
                <ArrowRight className="h-5 w-5" />
                <span className="text-lg font-medium">بازگشت</span>
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">پیش‌نمایش نظرسنجی</h2>
              </div>
              
              <div className="w-32" /> {/* Spacer */}
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Luxury Template Info */}
              <div className="w-[420px] bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-sm p-8 border-l border-slate-200/50 dark:border-slate-700/50 overflow-y-auto">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                  {selectedTemplate.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-lg">
                  {selectedTemplate.description}
                </p>

                <div className="space-y-6 mb-10">
                  <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                        <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-base font-semibold text-slate-700 dark:text-slate-300">تعداد سوال</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedTemplate.questionCount} سوال
                    </span>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                        <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-base font-semibold text-slate-700 dark:text-slate-300">زمان پاسخگویی</span>
                    </div>
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      ۱۰ دقیقه
                    </span>
                  </div>
                </div>

                <Button
                  onClick={useTemplate}
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
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
                  <div className="absolute -right-24 top-1/2 transform -translate-y-1/2">
                    <div className="bg-slate-700/90 dark:bg-slate-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl shadow-lg">
                      <span className="text-sm font-medium whitespace-nowrap">پیش‌نمایش موبایل</span>
                    </div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-emerald-500/20 rounded-full"></div>
                  <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-emerald-500/10 rounded-full"></div>
                  <div className="absolute top-1/4 -left-8 w-6 h-6 bg-emerald-500/15 rounded-full"></div>
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
