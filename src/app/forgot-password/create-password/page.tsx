"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import PasswordStrength from "@/components/PasswordStrength";

const REQUIREMENTS = [
  { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
  { label: "One uppercase letter",   test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "One number",             test: (pw: string) => /\d/.test(pw) },
];

export default function CreatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const mismatch = confirm.length > 0 && password !== confirm;
  const allMet   = REQUIREMENTS.every((r) => r.test(password)) && password === confirm && confirm.length > 0;

  const handleSubmit = () => {
    if (allMet) router.push("/forgot-password/reset-password");
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        {/* Back */}
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-neutral-500 hover:text-[#3b6ef6] transition-colors mb-5"
        >
          ← Back
        </Link>

        {/* Heading */}
        <div className="mb-7">
          <h2 className="text-[1.55rem] font-extrabold text-neutral-900 tracking-tight leading-snug mb-1">
            Create new password
          </h2>
          <p className="text-sm text-neutral-400">
            Make it strong and memorable.
          </p>
        </div>

        {/* New Password */}
        <div className="mb-4">
          <label className="block text-[0.82rem] font-semibold text-neutral-800 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
            <input
              className="auth-input pl-10 pr-10"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrength password={password} />

          {/* Requirements */}
          {password.length > 0 && (
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {REQUIREMENTS.map((req) => {
                const met = req.test(password);
                return (
                  <li key={req.label} className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-200"
                      style={{ background: met ? "#22c55e" : "#d1d5db" }}
                    />
                    <span
                      className="text-[0.78rem] font-medium transition-colors duration-200"
                      style={{ color: met ? "#22c55e" : "#9ca3af" }}
                    >
                      {req.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-7">
          <label className="block text-[0.82rem] font-semibold text-neutral-800 mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
            <input
              className={`auth-input pl-10 pr-10 ${mismatch ? "border-red-400" : ""}`}
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm your new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {mismatch && (
            <p className="text-xs font-medium text-red-500 mt-1.5">
              Passwords don&apos;t match
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          disabled={!allMet}
          onClick={handleSubmit}
        >
          Reset Password
        </button>
      </div>
    </AuthLayout>
  );
}
