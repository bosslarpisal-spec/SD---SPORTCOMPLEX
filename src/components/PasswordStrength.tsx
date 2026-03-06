"use client";

interface PasswordStrengthProps {
  password: string;
}

const COLORS = ["#e8e8e8", "#ef4444", "#f97316", "#eab308", "#22c55e"];
const LABELS = ["", "Weak", "Fair", "Good", "Strong"];

function getStrength(pw: string): number {
  if (!pw) return 0;
  if (pw.length < 6) return 1;
  if (pw.length < 10) return 2;
  if (pw.length < 14) return 3;
  return 4;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = getStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2 mb-1">
      <div className="flex gap-1.5 mb-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= strength ? COLORS[strength] : "#e8e8e8" }}
          />
        ))}
      </div>
      <p className="text-xs font-medium text-neutral-400">
        Strength: {LABELS[strength]}
      </p>
    </div>
  );
}
