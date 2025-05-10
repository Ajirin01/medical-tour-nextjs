"use client";
import { usePathname } from "next/navigation";
import Navbar from "../components/Navbar";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import AuthSessionProvider from "./SessionProvider";
import { ToastProvider } from "@/context/ToastContext";
import { UserProvider } from "@/context/UserContext";
import AuthWatcher from "@/components/AuthWatcher";
import { ArrowUpCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    setIsVisible(window.scrollY > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Check if we're on the homepage
  const isHomepage = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html lang="en">
      <head>
      {isHomepage && (
            <>
              {/* Add metadata specific to the homepage */}
              <meta charSet="utf-8" />
              <meta content="width=device-width, initial-scale=1.0" name="viewport" />
              <title>SozoDigiCare</title>
              <meta name="description" content="Welcome to SozoDigiCare" />
              <meta name="keywords" content="medical tourism, healthcare, services" />

              {/* Add favicons specific to the homepage */}
              <link href="/images/favicon.png" rel="icon" />
              {/* <link href="/apple-touch-icon.png" rel="apple-touch-icon" /> */}

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
      </head>
      <body className="bg-gray-100" 
      style={{
        backgroundImage: "url('/images/Medical-tourism.jpg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
      >
        <AuthSessionProvider>
          <AuthWatcher /> 
          <UserProvider>
            <ToastProvider>
              <CartProvider>
                {/* Conditionally render Navbar only on homepage */}
                {/* {isHomepage && <Navbar />} */}
                {/* <Navbar /> */}
                
                {!isAdmin && <Navbar />}
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

        {isVisible && 
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-2 bg-blue-600 text-white rounded-full-important shadow-lg hover:bg-blue-700 transition"
            aria-label="Scroll to top"
          >
            <ArrowUpCircleIcon className="w-6 h-6" />
          </button>
        }

        {!isAdmin && <Footer />}
        
      </body>
    </html>
  );
}
