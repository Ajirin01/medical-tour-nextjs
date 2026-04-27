"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { doctors } from "@/assets";
import { useToast } from "@/context/ToastContext";
import { FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";

const formInput =
  "border-[3px] border-primary-5 text-primary-2 rounded-[20px] overflow-hidden p-3 w-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-5";
const formLabel = "block mb-1 text-sm font-semibold text-gray-700 ml-2";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_CAPTCHA_KEY;

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams.get("role") || "user";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!captchaToken) {
      addToast("Please complete the CAPTCHA.", "error");
      return;
    }

    setLoading(true);
    try {
      const BASE = process.env.NEXT_PUBLIC_NODE_API_BASE_URL || "http://localhost:5000/medical-tourism";
      const res = await fetch(`${BASE}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-platform": process.env.NEXT_PUBLIC_PLATFORM || "global",
        },
        body: JSON.stringify({ email, password, role: roleFromUrl, captchaToken }),
      });

      const data = await res.json();

      if (res.ok && data.userId) {
        addToast("Account created! Check your email for the OTP.", "success");
        router.push(`/auth/verify-otp?email=${email}`);
      } else {
        const msg = data.message || "Registration failed. Please try again.";
        setError(msg);
        addToast(msg, "error");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Something went wrong. Please try again.");
      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full py-12 sm:py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
          {/* LEFT SIDE IMAGE — blends into background from bottom */}
          <div className="w-full lg:w-1/2 hidden lg:flex items-end self-stretch relative overflow-hidden">
            <Image
              src={doctors.src}
              alt="Healthcare professionals"
              width={600}
              height={500}
              className="object-contain object-bottom w-full h-auto"
            />
            {/* Bottom fade to blend into page background */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </div>

          {/* RIGHT SIDE FORM */}
          <div className="w-full lg:w-1/2 bg-white p-8 sm:p-10 rounded-[32px] shadow-xl border border-gray-100">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center uppercase tracking-tight">
              Create Account
            </h2>
            <p className="text-center text-gray-500 mb-8 font-medium">
              Join SozoDigiCare — complete your profile after sign-up
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-semibold text-center border border-red-100">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label className={formLabel}>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={formInput}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label className={formLabel}>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={formInput}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[38px] text-primary-5 hover:text-primary-7 transition-colors"
                >
                  {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                </button>
              </div>

              {/* CAPTCHA */}
              <div className="pt-2">
                <ReCAPTCHA
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={(token) => setCaptchaToken(token)}
                  className="mx-auto"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 rounded-[20px] bg-gradient-to-r from-[var(--color-primary-6)] to-[var(--color-primary-7)] text-white font-bold text-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-3" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              <div className="text-center text-gray-500 font-medium">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary-6 underline hover:text-primary-8 decoration-2 underline-offset-4"
                >
                  Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
