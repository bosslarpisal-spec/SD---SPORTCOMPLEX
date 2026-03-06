"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", { email, password, redirect: false });

    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/home");
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="mb-7">
          <h2 className="text-[1.55rem] font-extrabold text-neutral-900 tracking-tight leading-snug mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-neutral-400">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-4">
            <label className="block text-[0.82rem] font-semibold text-neutral-800 mb-1.5">
              Email Address
            </label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@kmitl.ac.th"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="block text-[0.82rem] font-semibold text-neutral-800 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
              <input
                className="auth-input pl-10 pr-10"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end mb-5">
            <Link href="/forgot-password" className="text-[0.82rem] font-semibold text-[#3b6ef6] hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mb-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-xs font-medium text-neutral-400">or</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/home" })}
          className="btn-google"
        >
          <span className="w-[22px] h-[22px] rounded-full border-2 border-white/50 flex items-center justify-center text-[0.7rem] font-extrabold shrink-0">
            G
          </span>
          Sign In with Google
        </button>

        <p className="text-center mt-5 text-sm text-neutral-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-[#3b6ef6] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
