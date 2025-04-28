"use client";
import { usePathname } from "next/navigation";
import Navbar from "../components/Navbar";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import AuthSessionProvider from "./SessionProvider";
import { ToastProvider } from "@/context/ToastContext";
import { UserProvider } from "@/context/UserContext";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  // Check if we're on the homepage
  const isHomepage = pathname === "/";

  return (
    <html lang="en">
      <body className="bg-gray-100">
        {isHomepage && (
          <>
            {/* Add metadata specific to the homepage */}
            <meta charSet="utf-8" />
            <meta content="width=device-width, initial-scale=1.0" name="viewport" />
            <title>Index - Medicio Bootstrap Template</title>
            <meta name="description" content="Medical Tourism App - Homepage" />
            <meta name="keywords" content="medical tourism, healthcare, services" />

            {/* Add favicons specific to the homepage */}
            <link href="assets/img/favicon.png" rel="icon" />
            <link href="assets/img/apple-touch-icon.png" rel="apple-touch-icon" />

            {/* Fonts for the homepage */}
            <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet" />
            
            {/* Vendor CSS Files for the homepage */}
            <link href="assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
            <link href="assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet" />
            <link href="assets/vendor/aos/aos.css" rel="stylesheet" />
            <link href="assets/vendor/fontawesome-free/css/all.min.css" rel="stylesheet" />
            <link href="assets/vendor/glightbox/css/glightbox.min.css" rel="stylesheet" />
            <link href="assets/vendor/swiper/swiper-bundle.min.css" rel="stylesheet" />
            
            {/* Main CSS File for the homepage */}
            <link href="assets/css/main.css" rel="stylesheet" />
          </>
        )}

        <AuthSessionProvider>
          <UserProvider>
            <ToastProvider>
              <CartProvider>
                {/* Conditionally render Navbar only on homepage */}
                {isHomepage && <Navbar />}
                {children} {/* Children will render as usual */}
              </CartProvider>
            </ToastProvider>
          </UserProvider>
        </AuthSessionProvider>

        {isHomepage && (
          <>
            
            {/* Vendor JS Files for the homepage */}
            <script src="assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
            <script src="assets/vendor/php-email-form/validate.js"></script>
            <script src="assets/vendor/aos/aos.js"></script>
            <script src="assets/vendor/glightbox/js/glightbox.min.js"></script>
            <script src="assets/vendor/purecounter/purecounter_vanilla.js"></script>
            <script src="assets/vendor/swiper/swiper-bundle.min.js"></script>
            
            {/* Main JS File for the homepage with defer */}
            <script src="assets/js/main.js" defer></script>
          </>
        )}
      </body>
    </html>
  );
}
