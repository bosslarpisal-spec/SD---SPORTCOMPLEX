// src/app/invitation/page.tsx
"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check, X, Clock,
  Target, Globe, Feather, Disc, Dumbbell, Users, UtensilsCrossed, Waves, Award,
  GraduationCap, Calendar, User,
  type LucideIcon,
} from "lucide-react";

function getSportIcon(name: string): LucideIcon {
  const map: Record<string, LucideIcon> = {
    "Football": Target,
    "Football Field": Target,
    "Volleyball": Globe,
    "Volleyball Court": Globe,
    "Badminton": Feather,
    "Badminton Court": Feather,
    "Table Tennis": Disc,
    "Fitness Center": Dumbbell,
    "Swimming Pool": Waves,
    "Co-working": Users,
    "Canteen": UtensilsCrossed,
    "Membership": Award,
  };
  return map[name] ?? Target;
}

function InvitationPageInner() {
  const searchParams = useSearchParams();
  const invitationId = searchParams.get("id");
  const [status, setStatus] = useState<"pending" | "accepted" | "declined" | "expired" | "loading">("loading");
  const [invitation, setInvitation] = useState<any>(null);
  const [guestName, setGuestName] = useState("");
  const [hasAccount, setHasAccount] = useState(true);

  useEffect(() => {
    if (!invitationId) { setStatus("expired"); return; }
    fetch(`/api/invitation/respond?id=${invitationId}`)
      .then(r => r.json())
      .then(data => {
        if (data.invitation) {
          setInvitation(data.invitation);
          if (!data.invitation.receiver) {
            setHasAccount(false);
          }
          const expired = new Date() > new Date(data.invitation.expiresAt);
          if (expired) {
            setStatus("expired");
          } else if (data.invitation.status !== "pending") {
            setStatus(data.invitation.status);
          } else {
            setStatus("pending");
          }
        } else {
          setStatus("expired");
        }
      })
      .catch(() => setStatus("expired"));
  }, [invitationId]);

  const respond = async (response: "accepted" | "declined") => {
    if (!hasAccount && !guestName.trim()) {
      alert("Please enter your name before responding.");
      return;
    }
    setStatus("loading");
    const res = await fetch("/api/invitation/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invitationId,
        response,
        guestName: hasAccount ? undefined : guestName.trim(),
      }),
    });
    if (res.ok) setStatus(response);
    else {
      const data = await res.json();
      if (data.message === "Already responded") setStatus(invitation?.status || "expired");
      else setStatus("expired");
    }
  };


  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF7B00] rounded-2xl mb-3 shadow-lg">
            <GraduationCap className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-xl font-black text-white">KMITL Sports Booking</h1>
        </div>

        <div className="bg-[#111111] rounded-[2rem] shadow-2xl border border-[#FF7B00]/20 p-8">

          {status === "loading" && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-[#FF7B00]/30 border-t-[#FF7B00] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/70 font-bold">Loading invitation...</p>
            </div>
          )}

          {status === "pending" && invitation && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#FF7B00]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  {(() => { const Icon = getSportIcon(invitation.reservation?.sport || ""); return <Icon className="w-8 h-8 text-[#FF7B00]" />; })()}
                </div>
                <span className="text-[10px] font-black text-[#FF7B00] bg-[#FF7B00]/10 px-3 py-1 rounded-full uppercase tracking-wider">New Invitation</span>
                <h2 className="text-2xl font-black text-white mt-3 mb-2">You're invited!</h2>
                <p className="text-white/60 text-sm">
                  <strong className="text-white">{invitation.sender?.name}</strong> invited you to a{" "}
                  <strong className="text-[#FF7B00]">{invitation.reservation?.sport}</strong> session.
                </p>
              </div>

              <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/[0.07] mb-6 space-y-3">
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1">Sport</p>
                  <p className="font-black text-white flex items-center gap-2">
                    {(() => { const Icon = getSportIcon(invitation.reservation?.sport || ""); return <Icon size={14} className="text-[#FF7B00]" />; })()}
                    {invitation.reservation?.sport}
                  </p>
                </div>
                <div className="border-t border-white/[0.07]"></div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1">Date & Time</p>
                  <p className="font-black text-white flex items-center gap-1"><Calendar size={13} className="text-[#FF7B00]" /> {invitation.reservation?.date} · {invitation.reservation?.timeSlot}</p>
                </div>
                <div className="border-t border-white/[0.07]"></div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-1">Invited by</p>
                  <p className="font-black text-white flex items-center gap-1"><User size={13} className="text-[#FF7B00]" /> {invitation.sender?.name}</p>
                </div>
              </div>

              {!hasAccount && (
                <div className="mb-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-wider block mb-2">Your Name</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="Enter your name to respond"
                    className="w-full border border-white/[0.1] bg-white/[0.05] rounded-xl px-4 py-3 text-sm font-bold text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#FF7B00]"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => respond("accepted")}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#FF7B00] text-black rounded-2xl font-black shadow-lg shadow-[#FF7B00]/20 hover:bg-[#e06f00] transition-all active:scale-95"
                >
                  <Check size={18} /> Accept
                </button>
                <button onClick={() => respond("declined")}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/[0.08] text-white rounded-2xl font-black border border-white/[0.15] hover:bg-white/[0.12] transition-all active:scale-95"
                >
                  <X size={18} /> Decline
                </button>
              </div>
            </>
          )}

          {status === "accepted" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#FF7B00]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-[#FF7B00]" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">You're in!</h2>
              <p className="text-white/60 text-sm">You've accepted the invitation. See you on the court!</p>
              <button
                onClick={() => window.location.href = '/'}
                className="mt-6 inline-block px-6 py-3 bg-[#FF7B00] text-black font-black rounded-xl hover:bg-[#e06f00] transition-all"
              >
                Back to Home →
              </button>
            </div>
          )}

          {status === "declined" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-white/60" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Invitation declined</h2>
              <p className="text-white/60 text-sm">You've declined the invitation. Maybe next time!</p>
              <button
                onClick={() => window.location.href = '/'}
                className="mt-6 inline-block px-6 py-3 bg-[#FF7B00] text-black font-black rounded-xl hover:bg-[#e06f00] transition-all"
              >
                Back to Home →
              </button>
            </div>
          )}

          {status === "expired" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#FF7B00]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="text-[#FF7B00]" size={32} />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Invitation expired</h2>
              <p className="text-white/60 text-sm">This invitation is no longer valid or has already been responded to.</p>
              <button
                onClick={() => window.location.href = '/'}
                className="mt-6 inline-block px-6 py-3 bg-[#FF7B00] text-black font-black rounded-xl hover:bg-[#e06f00] transition-all"
              >
                Back to Home →
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/40 text-xs">King Mongkut's Institute of Technology Ladkrabang</p>
        </div>
      </div>
    </div>
  );
}

export default function InvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FF7B00]/30 border-t-[#FF7B00] rounded-full animate-spin"></div>
      </div>
    }>
      <InvitationPageInner />
    </Suspense>
  );
}