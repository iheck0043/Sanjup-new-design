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

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
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
      navigate("/surveys");
    } catch (error) {
      console.error("OTP verification error in Login:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("کد تایید نامعتبر است");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>ورود به سیستم</CardTitle>
          <CardDescription>
            {showOtpInput
              ? "کد تایید را وارد کنید"
              : "شماره موبایل خود را وارد کنید"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showOtpInput ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <Input
                type="tel"
                placeholder="شماره موبایل"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                className="text-left"
              />
              <Button type="submit" className="w-full">
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
              <Button type="submit" className="w-full">
                تایید
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowOtpInput(false)}
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
 