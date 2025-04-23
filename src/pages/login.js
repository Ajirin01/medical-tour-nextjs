"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/app/authLayout"; 
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res.error) {
      setError(res.error);
    } else {
      router.push("/"); // Redirect to homepage or dashboard
    }
  };

  return (
    <AuthLayout>
      <div
        className="relative px-6 lg:px-8"
        style={{
          backgroundImage: "url('/images/Medical-tourism.jpg')",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-md space-y-8 p-6 bg-white rounded-lg shadow-md">
            <div className="text-center">
              <img
                alt="Your Company"
                src="/images/logo/logo.png"
                className="mx-auto h-10 w-auto"
              />
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Sign in to your account
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Sign in
                </button>
              </div>
            </form>

            <p className="text-center text-sm text-gray-500">
              Not a member?{" "}
              <Link href="/auth/sign-up" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
