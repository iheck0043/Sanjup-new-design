import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  ArrowLeft,
  Phone,
  Shield,
  CheckCircle2,
  Users,
  BarChart3,
  Target,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { usePersianInput, toPersianNumbers } from "@/hooks/use-persian-input";

import LogoSanjup from "@/assets/Logo-Sanjup.png";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Login() {
  const phoneInput = usePersianInput("", { maxLength: 11 });
  const otpInput = usePersianInput("", { maxLength: 6 });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(phoneInput.value);
      setShowOtpInput(true);
      toast.success("کد تایید ارسال شد");
    } catch (error) {
      toast.error("خطا در ارسال کد تایید");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await verifyOTP(phoneInput.value, otpInput.value);
      toast.success("ورود موفقیت آمیز");
      navigate("/");
    } catch (error: any) {
      if (error?.message === "NEW_USER_SIGNUP_REQUIRED") {
        setShowSignupForm(true);
        setShowOtpInput(false);
        toast.info("لطفا اطلاعات خود را تکمیل کنید");
      } else {
        toast.error(error?.message || "کد تایید نامعتبر است");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("لطفا نام و نام خانوادگی را وارد کنید");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("phone", phoneInput.value);
      formData.append("first_name", firstName.trim());
      formData.append("last_name", lastName.trim());

      const response = await fetch(`${BASE_URL}/api/v1/auth/sanjup/register`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.info?.message || data.message || "خطا در ثبت نام");
      }

      if (data.data?.access_token) {
        localStorage.setItem("access_token", data.data.access_token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.data.user_id,
            phone: data.data.phone,
            access_token: data.data.access_token,
            refresh_token: data.data.refresh_token,
          })
        );
      }

      toast.success("ثبت نام با موفقیت انجام شد");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "خطا در ثبت نام");
    } finally {
      setIsLoading(false);
    }
  };

  const resetToPhoneInput = () => {
    setShowOtpInput(false);
    setShowSignupForm(false);
    otpInput.handleChange("");
    setFirstName("");
    setLastName("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 left-6 z-10">
        <ThemeToggle />
      </div>
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-32 left-16 w-40 h-40 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 border border-white/20 rounded-full"></div>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <img
            src={LogoSanjup}
            alt="سنجاپ"
            className="h-12 w-auto brightness-0 invert"
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              پلتفرم طراحی و انتشار
              <br />
              <span className="text-blue-400">نظرسنجی و تحقیقات بازار</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              با سنجاپ، نظرسنجی‌های حرفه‌ای طراحی کنید، مخاطبان هدف را شناسایی
              کرده و بینش‌های ارزشمند کسب کنید.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-slate-200">تارگت دقیق مخاطبان</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-slate-200">تحلیل‌های پیشرفته</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-slate-200">انتشار آسان و سریع</span>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="relative z-10 flex items-center gap-6 text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span>نتایج آنی</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>استفاده آسان</span>
          </div>
        </div>
      </div>

      {/* Right Side - Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 dark:bg-slate-900">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <img
              src={LogoSanjup}
              alt="سنجاپ"
              className="h-10 w-auto mx-auto mb-4 dark:brightness-0 dark:invert"
            />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              پلتفرم طراحی و انتشار نظرسنجی
            </h1>
          </div>

          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm dark:border-slate-700/50 border dark:shadow-slate-900/30">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                {showSignupForm
                  ? "تکمیل اطلاعات"
                  : showOtpInput
                  ? "تایید هویت"
                  : "ورود"}
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300 text-base">
                {showSignupForm ? (
                  "برای ادامه، اطلاعات زیر را تکمیل کنید"
                ) : showOtpInput ? (
                  <>
                    کد تایید به شماره{" "}
                    <span className="persian-number-display">
                      {toPersianNumbers(phoneInput.value)}
                    </span>{" "}
                    ارسال شد
                  </>
                ) : (
                  "شماره موبایل خود را وارد کنید"
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {showSignupForm ? (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      placeholder="نام"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-12 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 dark:text-white dark:placeholder-slate-400"
                      required
                    />
                    <Input
                      type="text"
                      placeholder="نام خانوادگی"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-12 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 dark:text-white dark:placeholder-slate-400"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? "در حال ثبت..." : "تکمیل ثبت نام"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full h-12 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={resetToPhoneInput}
                  >
                    <ArrowLeft className="w-4 h-4 ml-2" />
                    بازگشت
                  </Button>
                </form>
              ) : !showOtpInput ? (
                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5" />
                    <Input
                      type="tel"
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      value={phoneInput.displayValue}
                      onChange={(e) => phoneInput.handleChange(e.target.value)}
                      dir="ltr"
                      className="h-12 pl-4 pr-12 bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 text-left dark:text-white dark:placeholder-slate-400 persian-number-display"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? "در حال ارسال..." : "دریافت کد تایید"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <Input
                    type="text"
                    placeholder="کد ۴ رقمی"
                    value={otpInput.displayValue}
                    onChange={(e) => otpInput.handleChange(e.target.value)}
                    dir="ltr"
                    className="h-12 text-center text-2xl font-mono bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 tracking-widest dark:text-white dark:placeholder-slate-400 persian-number-display"
                    maxLength={6}
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? "در حال تایید..." : "تایید و ورود"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full h-12 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={resetToPhoneInput}
                  >
                    <ArrowLeft className="w-4 h-4 ml-2" />
                    تغییر شماره موبایل
                  </Button>
                </form>
              )}

              {/* Platform Benefits */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    <p className="font-medium mb-1">پلتفرم کامل و یکپارچه</p>
                    <p>از طراحی تا انتشار و تحلیل نتایج، همه چیز در یک مکان.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
