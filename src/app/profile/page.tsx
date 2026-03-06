"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import PageBackground from "@/components/PageBackground";
import { Lock, Eye, EyeOff, Check, X } from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  image: string;
  provider: string;
}

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();

  const [profile,      setProfile]      = useState<UserProfile | null>(null);
  const [name,         setName]         = useState("");
  const [imageUrl,     setImageUrl]     = useState("");
  const [nameLoading,  setNameLoading]  = useState(false);
  const [nameMsg,      setNameMsg]      = useState<{ ok: boolean; text: string } | null>(null);

  const [currentPw,    setCurrentPw]    = useState("");
  const [newPw,        setNewPw]        = useState("");
  const [confirmPw,    setConfirmPw]    = useState("");
  const [showCurrent,  setShowCurrent]  = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [pwLoading,    setPwLoading]    = useState(false);
  const [pwMsg,        setPwMsg]        = useState<{ ok: boolean; text: string } | null>(null);

  const isGoogle = profile?.provider === "google" && !profile?.image?.startsWith("http") && false;
  // Show password section unless we definitively know they're google-only (no password set)
  // We'll just always show it — the API handles google-only users by allowing them to SET a new password

  useEffect(() => {
    fetch("/api/user/profile")
      .then(r => r.json())
      .then(data => {
        setProfile(data);
        setName(data.name ?? "");
        setImageUrl(data.image ?? "");
      });
  }, []);

  const userInitial = (profile?.name ?? session?.user?.email ?? "?").charAt(0).toUpperCase();

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameLoading(true);
    setNameMsg(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNameMsg({ ok: false, text: data.error ?? "Update failed" });
      } else {
        setProfile(prev => prev ? { ...prev, name: data.name, image: data.image } : prev);
        await updateSession({ name: data.name, image: data.image ?? "" });
        setNameMsg({ ok: true, text: "Profile updated successfully" });
      }
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setPwMsg({ ok: false, text: "Passwords don't match" });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ ok: false, text: "Password must be at least 6 characters" });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwMsg({ ok: false, text: data.error ?? "Password change failed" });
      } else {
        setPwMsg({ ok: true, text: "Password changed successfully" });
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
      }
    } finally {
      setPwLoading(false);
    }
  };

  void isGoogle;

  return (
    <PageBackground>
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 pt-28 pb-24">
        <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">User Profile</h1>
        <p className="text-sm text-white/40 mb-10">Manage your account information and password</p>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-10">
          <div className="relative">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-[#FF7B00]/40" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#FF7B00] flex items-center justify-center text-white text-3xl font-extrabold border-2 border-[#FF7B00]/40">
                {userInitial}
              </div>
            )}
          </div>
          <div>
            <div className="font-extrabold text-white text-lg">{profile?.name ?? "—"}</div>
            <div className="text-sm text-white/40">{profile?.email}</div>
            <div className="mt-1 text-xs text-white/25 capitalize">
              Signed in via {profile?.provider ?? "—"}
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="bg-[#111] rounded-2xl p-7 border border-white/[0.07] mb-5">
          <h2 className="text-base font-extrabold text-white mb-5">Edit Profile</h2>
          <form onSubmit={handleSaveName} className="space-y-4">
            <div>
              <label className="block text-[0.82rem] font-semibold text-white/70 mb-1.5">Full Name</label>
              <input
                className="auth-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="block text-[0.82rem] font-semibold text-white/70 mb-1.5">
                Profile Image URL <span className="font-normal text-white/30">(optional)</span>
              </label>
              <input
                className="auth-input"
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            {nameMsg && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
                ${nameMsg.ok ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                {nameMsg.ok ? <Check className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
                {nameMsg.text}
              </div>
            )}

            <button type="submit" disabled={nameLoading}
              className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
              {nameLoading ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-[#111] rounded-2xl p-7 border border-white/[0.07]">
          <h2 className="text-base font-extrabold text-white mb-1">Change Password</h2>
          <p className="text-xs text-white/35 mb-5">
            {profile?.provider === "google"
              ? "You signed in with Google. You can set a password to also enable email login."
              : "Enter your current password to set a new one."}
          </p>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {profile?.provider !== "google" && (
              <div>
                <label className="block text-[0.82rem] font-semibold text-white/70 mb-1.5">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4 pointer-events-none" />
                  <input
                    className="auth-input pl-10 pr-10"
                    type={showCurrent ? "text" : "password"}
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    placeholder="Current password"
                  />
                  <button type="button" onClick={() => setShowCurrent(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[0.82rem] font-semibold text-white/70 mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4 pointer-events-none" />
                <input
                  className="auth-input pl-10 pr-10"
                  type={showNew ? "text" : "password"}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  required
                />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[0.82rem] font-semibold text-white/70 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4 pointer-events-none" />
                <input
                  className={`auth-input pl-10 pr-10 ${confirmPw && confirmPw !== newPw ? "border-red-400" : ""}`}
                  type={showConfirm ? "text" : "password"}
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPw && confirmPw !== newPw && (
                <p className="text-xs text-red-400 mt-1.5">Passwords don&apos;t match</p>
              )}
            </div>

            {pwMsg && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
                ${pwMsg.ok ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                {pwMsg.ok ? <Check className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
                {pwMsg.text}
              </div>
            )}

            <button type="submit" disabled={pwLoading || (confirmPw.length > 0 && confirmPw !== newPw)}
              className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
              {pwLoading ? "Updating…" : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </PageBackground>
  );
}
