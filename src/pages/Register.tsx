import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("رمز عبور و تکرار آن مطابقت ندارند");
      setLoading(false);
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password);
      toast.success("ثبت نام با موفقیت انجام شد");
      navigate("/");
    } catch (error) {
      toast.error("خطا در ثبت نام");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 left-6 z-10">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl dark:border-slate-700/50 border dark:shadow-slate-900/30">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-slate-900 dark:text-white">
            ثبت نام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                name="username"
                placeholder="نام کاربری"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full h-12 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 dark:text-white dark:placeholder-slate-400"
              />
            </div>
            <div>
              <Input
                type="email"
                name="email"
                placeholder="ایمیل"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full h-12 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 dark:text-white dark:placeholder-slate-400"
              />
            </div>
            <div>
              <Input
                type="password"
                name="password"
                placeholder="رمز عبور"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full h-12 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 dark:text-white dark:placeholder-slate-400"
              />
            </div>
            <div>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="تکرار رمز عبور"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full h-12 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 dark:text-white dark:placeholder-slate-400"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={loading}
            >
              {loading ? "در حال ثبت نام..." : "ثبت نام"}
            </Button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
              >
                قبلاً ثبت نام کرده‌اید؟ وارد شوید
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
