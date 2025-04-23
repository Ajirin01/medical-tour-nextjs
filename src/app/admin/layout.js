"use client";

import { SidebarProvider, useSidebar } from "@/context/admin/SidebarContext";
import { ToastProvider } from "@/context/ToastContext";
import AuthSessionProvider from "@/app/SessionProvider";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";

import { ThemeProvider } from "@/context/admin/ThemeContext";

export default function AdminLayout({ children }) {
  return (
    <AuthSessionProvider>
      <ToastProvider>
        <ThemeProvider>
          <SidebarProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
          </SidebarProvider>
        </ThemeProvider>
      </ToastProvider>
    </AuthSessionProvider>
  );
}

// Extracted Admin Layout Content to prevent `useSidebar` error
function AdminLayoutContent({ children }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex dark:bg-gray-900 dark:text-gray-300">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 dark:bg-gray-900 dark:text-gray-300">
          {children}
        </div>
      </div>
    </div>
  );
}
