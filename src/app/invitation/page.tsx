"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Check, X, Clock } from "lucide-react";

function InvitationPageInner() {
  const searchParams = useSearchParams();
  const invitationId = searchParams.get("id");
  const [status, setStatus] = useState<"pending" | "accepted" | "declined" | "expired" | "loading">("loading");
  const [invitation, setInvitation] = useState<any>(null);
  // ✅ FIX: for no-account users, ask for their name
  const [guestName, setGuestName] = useState("");
  const [hasAccount, setHasAccount] = useState(true);

  useEffect(() => {
    if (!invitationId) { setStatus("expired"); return; }
    fetch(`/api/invitation/respond?id=${invitationId}`)
      .then(r => r.json())
      .then(data => {
        if (data.invitation) {
          setInvitation(data.invitation);
          // ✅ FIX: if no receiver populated, this is a no-account user
          if (!data.invitation.receiver) {
            setHasAccount(false);
          }
          const expired = new Date() > new Date(data.invitation.expiresAt);
          if (expired) {
            setStatus("expired");
          } else if (data.invitation.status !== "pending") {
            // ✅ FIX: already responded — show that state, not pending
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
    // ✅ FIX: no-account user must provide name before accepting
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

  const sportIcon: Record<string, string> = {
    "Football": "⚽", "Volleyball": "🏐", "Badminton": "🏸",
    "Table Tennis": "🏓", "Fitness Center": "🏋️", "Swimming Pool": "🏊",
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0070f3] to-[#00a3ff] rounded-2xl mb-3 shadow-lg">
            <span className="text-2xl">🎓</span>
          </div>
          <h1 className="text-xl font-black text-gray-900">KMITL Sports Booking</h1>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">

          {status === "loading" && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-[#0070f3] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 font-bold">Loading invitation...</p>
            </div>
          )}

          {status === "pending" && invitation && (
            <>
              <div className="text-center mb-8">
                <div className="text-5xl mb-3">{sportIcon[invitation.reservation?.sport] || "🏆"}</div>
                <span className="text-[10px] font-black text-[#0070f3] bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">New Invitation</span>
                <h2 className="text-2xl font-black text-gray-900 mt-3 mb-2">You're invited!</h2>
                <p className="text-gray-500 text-sm">
                  <strong className="text-gray-900">{invitation.sender?.name}</strong> invited you to a{" "}
                  <strong className="text-[#0070f3]">{invitation.reservation?.sport}</strong> session.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-6 space-y-3">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Sport</p>
                  <p className="font-black text-gray-900">{sportIcon[invitation.reservation?.sport] || "🏆"} {invitation.reservation?.sport}</p>
                </div>
                <div className="border-t border-gray-200"></div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Date & Time</p>
                  <p className="font-black text-gray-900">📅 {invitation.reservation?.date} · {invitation.reservation?.timeSlot}</p>
                </div>
                <div className="border-t border-gray-200"></div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Invited by</p>
                  <p className="font-black text-gray-900">👤 {invitation.sender?.name}</p>
                </div>
              </div>

              {/* ✅ FIX: Ask name if no account */}
              {!hasAccount && (
                <div className="mb-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Your Name</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder="Enter your name to respond"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => respond("accepted")}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#0070f3] text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                >
                  <Check size={18} /> Accept
                </button>
                <button onClick={() => respond("declined")}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all active:scale-95"
                >
                  <X size={18} /> Decline
                </button>
              </div>
            </>
          )}

          {status === "accepted" && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">You're in!</h2>
              <p className="text-gray-500 text-sm">You've accepted the invitation. See you on the court!</p>
            </div>
          )}

          {status === "declined" && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">❌</div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Invitation declined</h2>
              <p className="text-gray-500 text-sm">You've declined the invitation. Maybe next time!</p>
            </div>
          )}

          {status === "expired" && (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="text-orange-500" size={28} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Invitation expired</h2>
              <p className="text-gray-500 text-sm">This invitation is no longer valid or has already been responded to.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function InvitationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-100 border-t-[#0070f3] rounded-full animate-spin"></div></div>}>
      <InvitationPageInner />
    </Suspense>
  );
}
