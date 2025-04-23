'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { postData } from '@/utils/api';
import { useToast } from "@/context/ToastContext";


export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams.get('role');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { addToast } = useToast();

  const alertSuccess = (msg) => addToast(msg, "success");
  const alertError = (msg) => addToast(msg, "error");

  useEffect(() => {
    if (roleFromUrl) {
      setFormData((prev) => ({ ...prev, role: roleFromUrl }));
    }else{
        setFormData((prev) => ({ ...prev, role: 'user' }));
    }
  }, [roleFromUrl]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // console.log(formData)
    // return
    try {
      const res = await postData('users/register', formData);
      console.log(res)
      if (res.userId) {
        alertSuccess("Sign-Up successful, please check your email for otp!")
        router.push(`/auth/verify-otp?email=${formData.email}`);
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      alertError('Registration failed!')
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
        className="relative px-6 lg:px-8"
        style={{
          backgroundImage: "url('/images/Medical-tourism.jpg')",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        <div className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-md">
            {/* Centered Logo */}
            <div className="flex justify-center">
            <img src="/images/logo/logo.png" alt="Logo" className="h-12" />
            </div>

            <h2 className="text-center text-2xl font-bold text-gray-800">Create your {roleFromUrl} account</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
                />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
                type="submit"
                disabled={loading || !formData.role}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
            >
                {loading ? 'Registering...' : 'Sign Up'}
            </button>
            </form>
        </div>
        </div>
    </div>
  );
}
