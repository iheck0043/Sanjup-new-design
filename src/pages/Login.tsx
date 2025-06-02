
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

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const { login, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(phone);
      setShowOtpInput(true);
      toast.success("کد تایید ارسال شد");
    } catch (error) {
      toast.error("خطا در ارسال کد تایید");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyOTP(phone, otp);
      toast.success("ورود موفقیت آمیز");
      navigate("/");
    } catch (error: any) {
      console.error("OTP verification error in Login:", error);
      
      // Check if it's a new user that needs signup
      if (error?.message === "NEW_USER_SIGNUP_REQUIRED") {
        setShowSignupForm(true);
        setShowOtpInput(false);
        toast.info("لطفا اطلاعات خود را تکمیل کنید");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("کد تایید نامعتبر است");
      }
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("لطفا نام و نام خانوادگی را وارد کنید");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("phone", phone);
      formData.append("first_name", firstName.trim());
      formData.append("last_name", lastName.trim());

      const response = await fetch(`${BASE_URL}/api/v1/auth/sanjup/register`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "خطا در ثبت نام");
      }

      toast.success("ثبت نام با موفقیت انجام شد");
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error instanceof Error ? error.message : "خطا در ثبت نام");
    }
  };

  const resetToPhoneInput = () => {
    setShowOtpInput(false);
    setShowSignupForm(false);
    setOtp("");
    setFirstName("");
    setLastName("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[rgba(4,102,200,1)] to-[rgba(3,73,142,1)]">
      <Card className="w-[400px] bg-white">
        <CardHeader>
          <CardTitle>ثبت نام / ورود</CardTitle>
          <CardDescription>
            {showSignupForm
              ? "لطفا اطلاعات خود را تکمیل کنید"
              : showOtpInput
              ? "کد تایید را وارد کنید"
              : "شماره موبایل خود را وارد کنید"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showSignupForm ? (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="نام"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                type="text"
                placeholder="نام خانوادگی"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                className="w-full"
                style={{ backgroundColor: "rgba(4, 102, 200, 1)" }}
              >
                تایید
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={resetToPhoneInput}
              >
                بازگشت
              </Button>
            </form>
          ) : !showOtpInput ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <Input
                type="tel"
                placeholder="شماره موبایل"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                className="text-left"
              />
              <Button 
                type="submit" 
                className="w-full"
                style={{ backgroundColor: "rgba(4, 102, 200, 1)" }}
              >
                دریافت کد تایید
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="کد تایید"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                dir="ltr"
                className="text-left"
              />
              <Button 
                type="submit" 
                className="w-full"
                style={{ backgroundColor: "rgba(4, 102, 200, 1)" }}
              >
                تایید
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={resetToPhoneInput}
              >
                تغییر شماره موبایل
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
