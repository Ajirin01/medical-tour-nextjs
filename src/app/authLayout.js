"use client";
import AuthNavbar from "@/components/AuthNavbar";
import "./globals.css";

export default function AuthLayout({ children }) {
  return (
    <div className="bg-gray-100 min-h-screen">
      <AuthNavbar />
      <main className="container mx-auto p-4">{children}</main>
    </div>
  );
}
