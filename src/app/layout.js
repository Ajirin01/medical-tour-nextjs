"use client";
import Navbar from "../components/Navbar";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import AuthSessionProvider from "./SessionProvider";
import { ToastProvider } from "@/context/ToastContext";
import { usePathname } from "next/navigation";
import { UserProvider } from "@/context/UserContext";

// export const metadata = {
//   title: "Medical Tourism App",
//   description: "Explore medical services and lab referrals.",
// };

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin"); // Adjust based on your admin route structure

  return (
    <html lang="en">
      <body className="bg-gray-100">
        <AuthSessionProvider>
            <UserProvider>
              <ToastProvider>
                <CartProvider>
                  {!isAdmin && <Navbar />}
                  {children}  {/* ✅ Admin pages won't be affected */}
                </CartProvider>
              </ToastProvider>
            </UserProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
