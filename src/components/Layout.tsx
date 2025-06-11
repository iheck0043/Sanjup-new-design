import { Outlet } from "react-router-dom";
import UserMenu from "./UserMenu";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
