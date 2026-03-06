import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <div className="auth-card text-center">
        {/* Success icon */}
        <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#3b6ef6] to-[#6b9eff] flex items-center justify-center mx-auto mb-6 shadow-[0_10px_32px_rgba(59,110,246,0.4)]">
          <span className="text-white text-2xl font-bold">✓</span>
        </div>

        {/* Heading */}
        <h2 className="text-[1.5rem] font-extrabold text-neutral-900 tracking-tight mb-2.5">
          Password reset!
        </h2>
        <p className="text-sm text-neutral-400 leading-relaxed mb-7">
          Your password has been successfully updated.
          <br />
          You can now sign in with your new credentials.
        </p>

        {/* Steps */}
        <ul className="text-left mb-7 flex flex-col gap-3">
          {[
            "Your old password is no longer valid.",
            "Use your new password to access your account.",
            "If you didn't make this change, contact support immediately.",
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#eef2ff] text-[#3b6ef6] text-[0.7rem] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-[0.83rem] font-medium text-neutral-500 leading-snug pt-0.5">
                {text}
              </span>
            </li>
          ))}
        </ul>

        {/* Back to login */}
        <Link href="/login" className="btn-primary block">
          Back to Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
