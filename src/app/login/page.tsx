"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<"user" | "admin">("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", identifier);
      formData.append("password", password);

      const result = await loginUser(formData);

      if (result.success) {
        if (result.user) {
          if (loginType === "admin" && result.user.role !== "admin") {
            setError("Access Denied: Admin credentials required.");
            setLoading(false);
            return;
          }
          localStorage.setItem("gs_user", JSON.stringify(result.user));
        }
        window.location.href = loginType === "admin" ? "/admin/dashboard" : "/dashboard";
      } else {
        if (result.unverified) {
          // If result.email is returned, use it. Otherwise fallback to identifier.
          router.push(`/verify-otp?email=${encodeURIComponent(result.email || identifier)}`);
        } else {
          setError(result.error || "Invalid credentials.");
        }
      }
    } catch (err) {
      setError("System connection failure. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 lg:p-8 font-sans overflow-hidden">
      {/* Blurred background image behind everything */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=2000" 
          alt="Tropical Background" 
          className="w-full h-full object-cover blur-[8px] scale-105 opacity-60" 
        />
        <div className="absolute inset-0 bg-white/40 mix-blend-overlay"></div>
      </div>

      {/* Main Card Container */}
      <div className="relative z-10 w-full max-w-[900px] bg-transparent lg:bg-white rounded-[2rem] lg:rounded-[3rem] shadow-none lg:shadow-2xl overflow-hidden flex flex-col lg:flex-row lg:max-h-[85vh]">
        
        {/* Left Side (Form Area) */}
        <div className="w-full lg:w-[45%] bg-white/85 lg:bg-white backdrop-blur-xl lg:backdrop-blur-none p-6 sm:p-8 lg:pl-12 lg:pr-6 lg:py-8 flex flex-col justify-center rounded-[2rem] lg:rounded-none shadow-2xl lg:shadow-none relative z-20 overflow-y-auto scrollbar-hide">
          
          <h1 className="text-3xl font-bold text-gray-900 mb-5 tracking-tight font-serif">Log in</h1>
          
          {error && (
            <div className="p-3 mb-4 rounded-2xl border border-red-200 bg-red-50 text-red-600 text-[13px] text-center font-medium">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setLoginType("user")}
                className={`flex-1 py-2.5 rounded-full text-[13px] font-bold transition-all ${
                  loginType === "user"
                    ? "bg-[#36534B] text-white shadow-md"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => setLoginType("admin")}
                className={`flex-1 py-2.5 rounded-full text-[13px] font-bold transition-all ${
                  loginType === "admin"
                    ? "bg-[#36534B] text-white shadow-md"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                Admin
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 ml-4 uppercase tracking-wider">
                {loginType === "admin" ? "Admin Email or ID" : "Login, email or phone number"}
              </label>
              <input 
                type="text" 
                required 
                value={identifier} 
                onChange={(e) => setIdentifier(e.target.value)} 
                className="w-full bg-white border border-gray-300 text-gray-900 px-5 py-3.5 rounded-full focus:border-[#36534B] focus:ring-1 focus:ring-[#36534B] outline-none transition-all text-[14px] shadow-sm" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-500 ml-4 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full bg-white border border-gray-300 text-gray-900 pl-5 pr-12 py-3.5 rounded-full focus:border-[#36534B] focus:ring-1 focus:ring-[#36534B] outline-none transition-all text-[14px] shadow-sm" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 py-3 rounded-full bg-[#36534B] text-white font-medium text-[15px] hover:bg-[#2A423A] shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/forgot-password" className="text-[12px] text-gray-400 font-medium hover:text-gray-600 transition-colors">Forgot login or password?</Link>
          </div>
          
          <p className="text-center text-[13px] text-gray-500 mt-4">
            Don't have an account? <Link href="/register" className="text-[#36534B] font-bold hover:underline ml-1">Register</Link>
          </p>
        </div>

        {/* Right Side (Visual & Paper Cut Wave) - Only visible on LG */}
        <div className="hidden lg:block w-[55%] relative overflow-hidden bg-white">
          
          {/* Custom Layered Paper Cut SVG Wave */}
          <div className="absolute left-0 top-0 bottom-0 w-48 h-full z-10 pointer-events-none -ml-1">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full drop-shadow-[-25px_0_25px_rgba(0,0,0,0.6)]">
              {/* Bottom shadow layer */}
              <path fill="#2F4F4F" d="M0,0 L0,100 L60,100 C95,75 25,65 55,45 C85,25 25,15 60,0 Z" opacity="0.4" />
              {/* Middle shadow layer */}
              <path fill="#e5e7eb" d="M0,0 L0,100 L45,100 C80,75 10,65 40,45 C70,25 10,15 45,0 Z" className="drop-shadow-[-10px_0_15px_rgba(0,0,0,0.3)]" />
              {/* Top white layer bridging to the form */}
              <path fill="white" d="M0,0 L0,100 L30,100 C65,75 -5,65 25,45 C55,25 -5,15 30,0 Z" className="drop-shadow-[-5px_0_10px_rgba(0,0,0,0.1)]" />
            </svg>
          </div>

          {/* Tropical Leaf Image */}
          <img 
            src="https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=1000" 
            alt="Tropical leaves" 
            className="w-full h-full object-cover object-left"
          />
        </div>

      </div>
    </div>
  );
}
