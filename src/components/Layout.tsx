import React from "react";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Bell, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserMenu from "./UserMenu";
import ThemeToggle from "./ThemeToggle";
import LogoSanjupBlue from "@/assets/Logo-Sanjup-blue.png";

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="w-full px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div
              className="flex items-center cursor-pointer"
              onClick={() => navigate("/")}
            >
              <img
                src={LogoSanjupBlue}
                alt="سنجاپ"
                className="h-8 w-auto hover:opacity-80 transition-opacity"
              />
            </div>

            {/* Right side - Theme Toggle and User Menu */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16">{children || <Outlet />}</main>
    </div>
  );
}
