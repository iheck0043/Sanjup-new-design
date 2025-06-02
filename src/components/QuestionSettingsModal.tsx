import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, X, Settings, Star, StarOff } from "lucide-react";
import { ConditionalLogicModal } from "./ConditionalLogicModal";

interface QuestionSettingsModalProps {
  open: boolean;
  onClose: () => void;
  question: any;
  onSave: (updatedQuestion: any) => void;
}

interface Option {
  id: string;
  text: string;
}

export function QuestionSettingsModal({ open, onClose, question, onSave }: QuestionSettingsModalProps) {
  const [text, setText] = useState(question?.text || "");
  const [type, setType] = useState(question?.type || "text");
  const [required, setRequired] = useState(question?.required || false);
  const [description, setDescription] = useState(question?.description || "");
  const [options, setOptions] = useState<Option[]>(question?.options || []);
  const [showConditionalLogicModal, setShowConditionalLogicModal] = useState(false);
  const [conditionalLogic, setConditionalLogic] = useState(question?.conditionalLogic || []);
  const [isStarred, setIsStarred] = useState(question?.isStarred || false);

  useEffect(() => {
    if (question) {
      setText(question.text || "");
      setType(question.type || "text");
      setRequired(question.required || false);
      setDescription(question.description || "");
      setOptions(question.options || []);
      setConditionalLogic(question.conditionalLogic || []);
      setIsStarred(question.isStarred || false);
    }
  }, [question]);

  const handleOptionChange = (id: string, value: string) => {
    setOptions(options.map(option => option.id === id ? { ...option, text: value } : option));
  };

  const handleAddOption = () => {
    setOptions([...options, { id: String(Date.now()), text: "" }]);
  };

  const handleDeleteOption = (id: string) => {
    setOptions(options.filter(option => option.id !== id));
  };

  const handleSave = () => {
    const updatedQuestion = {
      ...question,
      text,
      type,
      required,
      description,
      options,
      conditionalLogic,
      isStarred
    };
    onSave(updatedQuestion);
    onClose();
  };

  const handleCloseConditionalLogicModal = () => {
    setShowConditionalLogicModal(false);
  };

  const handleSaveConditionalLogic = (newConditionalLogic: any) => {
    setConditionalLogic(newConditionalLogic);
    setShowConditionalLogicModal(false);
  };

  const toggleStar = () => {
    setIsStarred(!isStarred);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center justify-between">
              <span>تنظیمات سوال</span>
              <Button variant="ghost" size="icon" onClick={toggleStar}>
                {isStarred ? (
                  <Star className="h-5 w-5 text-yellow-500" />
                ) : (
                  <StarOff className="h-5 w-5" />
                )}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="content" className="space-y-4">
          <TabsList>
            <TabsTrigger value="content">محتوا</TabsTrigger>
            <TabsTrigger value="options">گزینه ها</TabsTrigger>
            <TabsTrigger value="advanced">پیشرفته</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="text">متن سوال</Label>
                <Textarea
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="متن سوال را وارد کنید"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">نوع سوال</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب نوع سوال" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">متنی</SelectItem>
                    <SelectItem value="number">عددی</SelectItem>
                    <SelectItem value="select">انتخابی</SelectItem>
                    <SelectItem value="multiple">چند انتخابی</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">توضیحات</Label>
                <Input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="توضیحات مربوط به سوال"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="options" className="space-y-4">
            {type === "select" || type === "multiple" ? (
              <div className="space-y-2">
                <Label>گزینه ها</Label>
                <div className="space-y-1">
                  {options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(option.id, e.target.value)}
                        placeholder="متن گزینه"
                      />
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteOption(option.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={handleAddOption}>
                    <Plus className="w-4 h-4 ml-2" />
                    افزودن گزینه
                  </Button>
                </div>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>توجه</CardTitle>
                  <CardDescription>
                    این سوال از نوع {type} است و نیازی به تنظیم گزینه ندارد.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>برای افزودن گزینه، نوع سوال را به "انتخابی" یا "چند انتخابی" تغییر دهید.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="required">اجباری</Label>
              <Switch
                id="required"
                checked={required}
                onCheckedChange={(checked) => setRequired(checked)}
              />
            </div>

            <div className="space-y-2">
              <Button onClick={() => setShowConditionalLogicModal(true)}>
                <Settings className="w-4 h-4 ml-2" />
                تنظیمات منطق شرطی
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button onClick={handleSave}>ذخیره</Button>
        </div>
      </DialogContent>

      <ConditionalLogicModal
        open={showConditionalLogicModal}
        onClose={handleCloseConditionalLogicModal}
        conditionalLogic={conditionalLogic}
        onSave={handleSaveConditionalLogic}
      />
    </Dialog>
  );
}
