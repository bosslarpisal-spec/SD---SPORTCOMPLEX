"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    if (email) router.push("/forgot-password/create-password");
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        {/* Back */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-neutral-500 hover:text-[#3b6ef6] transition-colors mb-5"
        >
          ← Back to Sign In
        </Link>

        {/* Heading */}
        <div className="mb-5">
          <h2 className="text-[1.55rem] font-extrabold text-neutral-900 tracking-tight leading-snug mb-1">
            Forgot password?
          </h2>
          <p className="text-sm text-neutral-400">
            No worries, we&apos;ll send you a reset link.
          </p>
        </div>

        {/* Hint box */}
        <div className="bg-[#eef2ff] rounded-xl px-4 py-3.5 mb-5">
          <p className="text-[0.83rem] font-medium text-[#3b6ef6] leading-relaxed">
            Enter the email address linked to your KMITL account and we&apos;ll
            send you a password reset link.
          </p>
        </div>

        {/* Email */}
        <div className="mb-6">
          <label className="block text-[0.82rem] font-semibold text-neutral-800 mb-1.5">
            Email Address
          </label>
          <input
            className="auth-input"
            type="email"
            placeholder="you@kmitl.ac.th"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button className="btn-primary" onClick={handleSubmit}>
          Send Reset Link
        </button>

        {/* Sign in link */}
        <p className="text-center mt-5 text-sm text-neutral-400">
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#3b6ef6] hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
