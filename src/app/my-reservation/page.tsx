"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Timer } from "lucide-react";

// ── Types ────────────────────────────────────────────────
interface Reservation {
  _id: string;
  sport: string;
  hostName: string;
  date: string;
  timeSlot: string;
  status: string; // "active" | "confirmed" | "cancelled"
  role: "host" | "invitee";
  invitationDetails?: { email: string; status: string }[];
  senderName?: string;
  invitationId?: string;
  inviteStatus?: string;
  expiresAt?: string;
}

// ── Countdown: used for INVITEE invitation expiry ────────
function InviteCountdown({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
  const [timeLeft, setTimeLeft] = useState("");
  const firedRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        if (!firedRef.current) { firedRef.current = true; onExpire(); }
      } else {
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${m}m ${s}s`);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  if (!timeLeft) return null;
  return (
    <span className={`text-[0.65rem] font-bold flex items-center gap-1 ${timeLeft === "Expired" ? "text-red-500" : "text-orange-500 animate-pulse"}`}>
      <Timer size={11} /> {timeLeft === "Expired" ? "Offer Expired" : `Expires in ${timeLeft}`}
    </span>
  );
}

// ── Countdown: used for HOST — waiting for invitees ──────
function PendingCountdown({ invitationDetails }: { invitationDetails: { email: string; status: string; expiresAt?: string }[] }) {
  const [timeLeft, setTimeLeft] = useState("");
  const expiresAt = invitationDetails.find(i => i.expiresAt)?.expiresAt;
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Expired"); return; }
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const total = invitationDetails.length;
  const accepted = invitationDetails.filter(i => i.status === "accepted").length;
  const pending = invitationDetails.filter(i => i.status === "pending").length;
  const majority = Math.floor(total / 2) + 1;
  const needed = Math.max(0, majority - accepted);

  if (total === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-neutral-100">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
          Waiting for confirmations
        </p>
        <div className="flex items-center gap-2">
          {timeLeft && timeLeft !== "Expired" && (
            <span className="text-[10px] font-black text-orange-500 animate-pulse flex items-center gap-1">
              <Timer size={10} /> {timeLeft}
            </span>
          )}
          <span className="text-[10px] font-black text-orange-400 flex items-center gap-1">
            {pending} pending
          </span>
        </div>
      </div>
      {/* Progress bar */}
      <div className="w-full bg-neutral-100 rounded-full h-1.5 mb-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${accepted >= majority ? "bg-green-500" : "bg-[#3b6ef6]"}`}
          style={{ width: `${Math.min(100, (accepted / majority) * 100)}%` }}
        />
      </div>
      <p className="text-[10px] text-neutral-400 font-semibold">
        {accepted >= majority
          ? "✅ Majority accepted — reservation confirmed!"
          : `${accepted}/${majority} accepted needed to confirm${needed > 0 ? ` — need ${needed} more` : ""}`}
      </p>
    </div>
  );
}

// ── Invitation status badge ──────────────────────────────
function InviteeBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    accepted: "text-green-500",
    declined: "text-red-400",
    expired:  "text-red-400",
    pending:  "text-orange-400",
  };
  const labels: Record<string, string> = {
    accepted: "ACCEPTED",
    declined: "DECLINED",
    expired:  "EXPIRED",
    pending:  "NO RESPONSE YET",
  };
  return (
    <span className={`text-[9px] font-black uppercase ${styles[status] || "text-gray-400"}`}>
      ● {labels[status] || status}
    </span>
  );
}

const SPORT_EMOJI: Record<string, string> = {
  "Football Field":   "⚽",
  "Volleyball Court": "🏐",
  "Badminton Court":  "🏸",
  "Table Tennis":     "🏓",
  "Private Room A":   "🚪",
  "Private Room B":   "🚪",
  "Co-working Table": "💻",
};

// ── Main Page ────────────────────────────────────────────
export default function MyReservationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [active, setActive] = useState<"All" | "active" | "confirmed" | "cancelled">("All");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.user) {
      setCurrentUser({
        name:  session.user.name  || "",
        email: session.user.email || "",
        id:    (session.user as any).id || "",
      });
    }
  }, [session, status]);

  useEffect(() => {
    if (!currentUser?.email) return;
    fetchReservations(currentUser.email);
    const interval = setInterval(() => fetchReservations(currentUser.email), 5000);
    return () => clearInterval(interval);
  }, [currentUser?.email]);

  const fetchReservations = async (email: string) => {
    try {
      const res = await fetch(`/api/reservation?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      const combined = [
        ...(data.owned    || []).map((r: any) => ({ ...r, role: "host"    })),
        ...(data.received || []).map((r: any) => ({ ...r, role: "invitee" })),
      ];

      const now = new Date();

      // ✅ For each active host reservation, check if invites expired → auto-cancel
      for (const r of combined) {
        if (r.role === "host" && r.status === "active") {
          try {
            await fetch("/api/reservation/check-expired", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reservationId: r._id }),
            });
          } catch (e) { /* silent */ }
        }
      }

      // ✅ Auto-delete confirmed reservations past their date+time
      for (const r of combined) {
        if (r.role === "host" && r.status === "confirmed" && r.date && r.timeSlot) {
          const reservationTime = new Date(`${r.date}T${r.timeSlot}:00`);
          if (now >= reservationTime) {
            try {
              await fetch(`/api/reservation?id=${r._id}`, { method: "DELETE" });
            } catch (e) { /* silent */ }
          }
        }
      }

      setReservations(combined.filter(r => {
        // Hide confirmed reservations that have passed
        if (r.role === "host" && r.status === "confirmed" && r.date && r.timeSlot) {
          const reservationTime = new Date(`${r.date}T${r.timeSlot}:00`);
          return now < reservationTime;
        }
        return true;
      }));
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  const handleRespond = async (invitationId: string, response: "accepted" | "declined") => {
    try {
      const res = await fetch("/api/invitation/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, response }),
      });
      if (res.ok) {
        // ✅ After auto-decline on expiry, check if reservation should be cancelled
        if (response === "declined") {
          const inv = reservations.find((r: any) => r.invitationId === invitationId);
          if (inv) {
            await fetch("/api/reservation/check-expired", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reservationId: (inv as any)._id || (inv as any).id }),
            });
          }
        }
        fetchReservations(currentUser.email);
      }
    } catch (e) {
      console.error("Respond failed:", e);
    }
  };

  const handleConfirmedCancel = async () => {
    if (!confirmId) return;
    const id = confirmId;
    setConfirmId(null);
    try {
      const res = await fetch(`/api/reservation?id=${id}`, { method: "DELETE" });
      if (res.ok) setReservations((prev) => prev.filter((r) => r._id !== id));
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  if (status === "loading" || !currentUser) return null;

  // ✅ "Upcoming" = only active (pending confirmation)
  // ✅ "Completed" = only confirmed
  // ✅ "Cancelled" = only cancelled
  const filtered = (() => {
    if (active === "All") return reservations;
    if (active === "active") return reservations.filter(r => r.status === "active");
    return reservations.filter(r => r.status === active);
  })();

  const counts = {
    active:    reservations.filter(r => r.status === "active").length,
    confirmed: reservations.filter(r => r.status === "confirmed").length,
    cancelled: reservations.filter(r => r.status === "cancelled").length,
  };

  const tabs = [
    { key: "All",       label: "All",       count: null },
    { key: "active",    label: "Upcoming",  count: counts.active },
    { key: "confirmed", label: "Completed", count: counts.confirmed },
    { key: "cancelled", label: "Cancelled", count: counts.cancelled },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f4f4f4] font-sans">
      <Navbar />

      {/* Cancel confirm modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setConfirmId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center"
            onClick={(e) => e.stopPropagation()}>
            <div className="text-3xl mb-3">🗑️</div>
            <p className="text-gray-900 font-semibold text-lg mb-1">Cancel this booking?</p>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmId(null)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition">
                Keep it
              </button>
              <button onClick={handleConfirmedCancel}
                className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition">
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-16">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight mb-1">My Reservations</h1>
            <p className="text-sm text-neutral-500">Track and manage all your facility bookings</p>
            <div className="mt-5 flex gap-3 flex-wrap">
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActive(tab.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border
                    ${active === tab.key
                      ? tab.key === "confirmed"
                        ? "bg-green-500 text-white border-green-500 shadow-md shadow-green-200"
                        : "bg-[#3b6ef6] text-white border-[#3b6ef6] shadow-md shadow-blue-200"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-[#3b6ef6] hover:text-[#3b6ef6]"}`}>
                  {tab.key === "confirmed" ? "✅ " : ""}{tab.label}
                  {tab.count !== null && <span className="ml-1 opacity-70">({tab.count})</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📋</div>
              <p className="font-semibold text-neutral-500 mb-2">No reservations found</p>
              <Link href="/facility"
                className="inline-block mt-2 px-5 py-2.5 bg-[#3b6ef6] text-white text-sm font-bold rounded-xl hover:bg-[#2a5ce0] transition-colors">
                Browse Facilities
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map(r => {
                const isConfirmed = r.status === "confirmed";
                return (
                  <div key={r._id + (r.role || "")}
                    className={`bg-white rounded-2xl p-5 border transition-all duration-200 hover:shadow-md
                      ${r.status === "cancelled" ? "opacity-50 border-neutral-100" :
                        isConfirmed ? "border-green-200 ring-1 ring-green-100" :
                        "border-neutral-100"}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl shrink-0
                        ${isConfirmed ? "bg-green-50 border-green-100" : "bg-neutral-50 border-neutral-100"}`}>
                        {SPORT_EMOJI[r.sport] || "🏆"}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-extrabold text-neutral-900 text-sm">{r.sport}</h3>

                          {/* Role badge */}
                          {r.role === "host" ? (
                            <span className="text-[0.65rem] font-black px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100 uppercase">
                              Your Reservation
                            </span>
                          ) : (
                            <span className="text-[0.65rem] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 uppercase">
                              Invite from {r.senderName}
                            </span>
                          )}

                          {/* ✅ Completed badge */}
                          {isConfirmed && (
                            <span className="text-[0.65rem] font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 uppercase">
                              ✅ Completed
                            </span>
                          )}

                          {/* Invitee expiry countdown — only if still pending */}
                          {r.role === "invitee" && r.expiresAt && r.inviteStatus === "pending" && (
                            <InviteCountdown
                              expiresAt={r.expiresAt}
                              onExpire={() => handleRespond(r.invitationId!, "declined")}
                            />
                          )}
                        </div>

                        <p className="text-xs text-neutral-400">
                          📅 {r.date} &nbsp;·&nbsp; 🕐 {r.timeSlot}
                        </p>

                        {/* Host: invitees list + live pending countdown */}
                        {r.role === "host" && r.invitationDetails && r.invitationDetails.length > 0 && (
                          <>
                            <div className="mt-3 pt-3 border-t border-neutral-100">
                              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">
                                Invited Participants
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {r.invitationDetails.map((inv, i) => (
                                  <div key={i} className="px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-bold border border-gray-100 flex items-center gap-2">
                                    <span className="text-gray-600">{inv.email}</span>
                                    <InviteeBadge status={inv.status} />
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* ✅ Live progress bar while waiting — only if not yet confirmed */}
                            {!isConfirmed && (
                              <PendingCountdown invitationDetails={r.invitationDetails} />
                            )}
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {r.role === "host" && r.status !== "cancelled" && (
                          <button onClick={() => setConfirmId(r._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                            🗑 Cancel Booking
                          </button>
                        )}

                        {/* Invitee: accept/decline if still pending */}
                        {r.role === "invitee" && r.inviteStatus === "pending" && r.expiresAt && new Date() < new Date(r.expiresAt) && (
                          <div className="flex gap-2">
                            <button onClick={() => handleRespond(r.invitationId!, "accepted")}
                              className="px-4 py-2 bg-[#3b6ef6] text-white text-xs font-bold rounded-xl hover:bg-[#2a5ce0] transition-colors">
                              ✓ Accept
                            </button>
                            <button onClick={() => handleRespond(r.invitationId!, "declined")}
                              className="px-4 py-2 bg-neutral-100 text-neutral-600 text-xs font-bold rounded-xl hover:bg-neutral-200 transition-colors">
                              ✕ Decline
                            </button>
                          </div>
                        )}

                        {/* Invitee: show their response status if already responded */}
                        {r.role === "invitee" && r.inviteStatus && r.inviteStatus !== "pending" && (
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg
                            ${r.inviteStatus === "accepted" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                            You {r.inviteStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-8 text-center">
              <Link href="/facility"
                className="inline-block px-6 py-3 bg-[#3b6ef6] text-white text-sm font-bold rounded-xl hover:bg-[#2a5ce0] transition-colors shadow-md shadow-blue-200">
                + Book Another Facility
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}