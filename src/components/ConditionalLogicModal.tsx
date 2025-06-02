
import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Condition {
    id: string;
    questionId: string;
    operator: string;
    value: string;
}

interface ConditionalLogicModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (conditions: Condition[]) => void;
    initialConditions?: Condition[];
    questionOptions: { value: string; label: string }[];
}

export function ConditionalLogicModal({ 
    open, 
    onClose, 
    onSave, 
    initialConditions = [], 
    questionOptions 
}: ConditionalLogicModalProps) {
    const [conditions, setConditions] = useState<Condition[]>(initialConditions);

    const addCondition = () => {
        const newCondition: Condition = {
            id: Math.random().toString(36).substring(7),
            questionId: "",
            operator: "equals",
            value: "",
        };
        setConditions([...conditions, newCondition]);
    };

    const updateCondition = (id: string, field: string, value: string) => {
        setConditions(
            conditions.map((condition) =>
                condition.id === id ? { ...condition, [field]: value } : condition
            )
        );
    };

    const removeCondition = (id: string) => {
        setConditions(conditions.filter((condition) => condition.id !== id));
    };

    const handleSave = () => {
        onSave(conditions);
        onClose();
    };

    return (
        <div className={`fixed inset-0 z-50 ${open ? "block" : "hidden"}`}>
            <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 z-50 w-full max-w-md shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">منطق شرطی</h2>
                        <Button variant="ghost" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    {conditions.map((condition) => (
                        <div key={condition.id} className="mb-4 p-4 border rounded-md">
                            <div className="grid gap-2">
                                <Label htmlFor={`question-${condition.id}`}>سوال</Label>
                                <Select
                                    value={condition.questionId}
                                    onValueChange={(value) => updateCondition(condition.id, "questionId", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="انتخاب سوال" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {questionOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Label htmlFor={`operator-${condition.id}`}>عملگر</Label>
                                <Select
                                    value={condition.operator}
                                    onValueChange={(value) => updateCondition(condition.id, "operator", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="انتخاب عملگر" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="equals">برابر</SelectItem>
                                        <SelectItem value="notEquals">نابرابر</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Label htmlFor={`value-${condition.id}`}>مقدار</Label>
                                <Input
                                    type="text"
                                    value={condition.value}
                                    onChange={(e) => updateCondition(condition.id, "value", e.target.value)}
                                />
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="mt-2"
                                onClick={() => removeCondition(condition.id)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                حذف
                            </Button>
                        </div>
                    ))}
                    <Button variant="secondary" onClick={addCondition} className="mb-4">
                        <Plus className="h-4 w-4 mr-2" />
                        افزودن شرط
                    </Button>
                    <div className="flex justify-end">
                        <Button variant="ghost" onClick={onClose}>
                            انصراف
                        </Button>
                        <Button onClick={handleSave}>ذخیره</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
