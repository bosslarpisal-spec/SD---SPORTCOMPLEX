"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import PasswordStrength from "@/components/PasswordStrength";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mismatch) return;
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    // Auto sign-in after registration
    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (signInRes?.error) {
      setError("Account created. Please sign in.");
      router.push("/login");
    } else {
      router.push("/home");
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-neutral-500 hover:text-[#3b6ef6] transition-colors mb-5"
        >
          ← Back to Sign In
        </Link>

        <div className="mb-7">
          <h2 className="text-[1.55rem] font-extrabold text-neutral-900 tracking-tight leading-snug mb-1">
            Create account
          </h2>
          <p className="text-sm text-neutral-400">Join the reservation system</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-[0.82rem] font-semibold text-neutral-800 mb-1.5">Full Name</label>
            <input
              className="auth-input"
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-[0.82rem] font-semibold text-neutral-800 mb-1.5">Email Address</label>
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
          <div className="mb-4">
            <label className="block text-[0.82rem] font-semibold text-neutral-800 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
              <input
                className="auth-input pl-10 pr-10"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-[0.82rem] font-semibold text-neutral-800 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
              <input
                className={`auth-input pl-10 pr-10 ${mismatch ? "border-red-400" : ""}`}
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mismatch && (
              <p className="text-xs font-medium text-red-500 mt-1.5">Passwords don&apos;t match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={mismatch || loading}
            className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
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
          Sign Up with Google
        </button>

        <p className="text-center mt-5 text-sm text-neutral-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#3b6ef6] hover:underline">Sign In</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
