
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return <div>در حال بارگذاری...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>پروفایل کاربری</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">نام:</label>
            <p className="text-gray-900">{user.first_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">نام خانوادگی:</label>
            <p className="text-gray-900">{user.last_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">شماره موبایل:</label>
            <p className="text-gray-900">{user.phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">ایمیل:</label>
            <p className="text-gray-900">{user.email || "ثبت نشده"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
