"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type Status = "upcoming" | "completed" | "cancelled";

interface Invitee {
  email: string;
  status: "pending" | "accepted" | "declined";
}

interface Reservation {
  _id: string;
  facilityType: string;
  facilityName: string;
  slot: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  minPlayers?: number;
  invitees: Invitee[];
  status: Status;
  countdownDeadline?: string;
  cancelledAt?: string;
}

const STATUS_STYLES: Record<Status, string> = {
  upcoming:  "bg-blue-50 text-[#3b6ef6]",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-500",
};

const INVITEE_STYLES: Record<Invitee["status"], string> = {
  accepted: "bg-green-50 text-green-600",
  declined: "bg-red-50 text-red-500",
  pending:  "bg-neutral-100 text-neutral-500",
};

const FACILITY_EMOJI: Record<string, string> = {
  sports: "⚽", coworking: "🚪", canteen: "🍽️", info: "🏋️", membership: "🎫",
};

const TABS = ["All", "upcoming", "completed", "cancelled"] as const;

function Countdown({ deadline }: { deadline: string }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const tick = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Expired"); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const isExpired = remaining === "Expired";
  return (
    <span className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-full ${isExpired ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-600"}`}>
      {isExpired ? "Countdown expired" : `⏱ ${remaining} left`}
    </span>
  );
}

export default function MyReservationPage() {
  const { data: session } = useSession();
  const [list,      setList]      = useState<Reservation[]>([]);
  const [fetching,  setFetching]  = useState(true);
  const [active,    setActive]    = useState<typeof TABS[number]>("All");
  const [cancel,    setCancel]    = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchReservations = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/reservations");
      if (res.ok) setList(await res.json());
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchReservations();
  }, [session, fetchReservations]);

  const filtered = active === "All" ? list : list.filter(r => r.status === active);

  const counts = {
    upcoming:  list.filter(r => r.status === "upcoming").length,
    completed: list.filter(r => r.status === "completed").length,
    cancelled: list.filter(r => r.status === "cancelled").length,
  };

  const doCancel = async (id: string) => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/reservations/${id}`, { method: "PATCH" });
      if (res.ok) {
        // Mark as cancelled locally; remove after 15 min
        setList(prev => prev.map(r => r._id === id ? { ...r, status: "cancelled", cancelledAt: new Date().toISOString() } : r));
        setTimeout(() => setList(prev => prev.filter(r => r._id !== id)), 15 * 60 * 1000);
      }
    } finally {
      setCancelling(false);
      setCancel(null);
    }
  };

  const confirmedCount = (r: Reservation) => r.invitees.filter(i => i.status === "accepted").length;
  const isConfirmed    = (r: Reservation) => confirmedCount(r) >= Math.ceil((r.minPlayers ?? 2) / 2);

  return (
    <div className="min-h-screen bg-[#f4f4f4] font-sans">
      <Navbar />

      {/* Cancel confirm modal */}
      {cancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-extrabold text-neutral-900 mb-2">Cancel Reservation?</h3>
            <p className="text-sm text-neutral-500 mb-6">
              This cannot be undone. Your slot will be released.<br />
              <span className="text-xs text-neutral-400">The reservation will be removed from this page in 15 minutes.</span>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancel(null)} disabled={cancelling}
                className="flex-1 py-3 text-sm font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors">
                Keep it
              </button>
              <button onClick={() => doCancel(cancel)} disabled={cancelling}
                className="flex-1 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-60">
                {cancelling ? "Cancelling…" : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-16">
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight mb-1">My Reservations</h1>
            <p className="text-sm text-neutral-500">Track and manage all your facility bookings</p>

            <div className="mt-5 flex gap-2 flex-wrap">
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActive(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border
                    ${active === tab
                      ? "bg-[#3b6ef6] text-white border-[#3b6ef6] shadow-md shadow-blue-200"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-[#3b6ef6] hover:text-[#3b6ef6]"}`}>
                  {tab} {tab !== "All" && <span className="ml-1 opacity-70">({counts[tab as Status]})</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {fetching ? (
            <div className="text-center py-20 text-neutral-400">
              <p className="font-semibold">Loading reservations…</p>
            </div>
          ) : filtered.length === 0 ? (
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
                const isSports = r.facilityType === "sports";
                const emoji    = FACILITY_EMOJI[r.facilityType] ?? "📋";
                const accepted = confirmedCount(r);
                const confirmed = isConfirmed(r);

                return (
                  <div key={r._id}
                    className="bg-white rounded-2xl p-5 border border-neutral-100 hover:shadow-md transition-all duration-200">
                    {/* Top row */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-2xl shrink-0">
                        {emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Name + status */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-extrabold text-neutral-900 text-sm">{r.facilityName}</h3>
                          <span className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[r.status]}`}>
                            {r.status}
                          </span>
                          {/* Sports confirmation badge */}
                          {isSports && r.status === "upcoming" && (
                            <span className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-full ${confirmed ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                              {confirmed ? "✓ Confirmed" : "Pending confirmation"}
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <p className="text-xs text-neutral-500 mb-0.5">
                          📍 {r.slot} &nbsp;·&nbsp; {r.facilityName}
                        </p>
                        <p className="text-xs text-neutral-500 mb-0.5">
                          📅 {r.date} &nbsp;·&nbsp; 🕐 {r.startTime} – {r.endTime} &nbsp;·&nbsp; ⏱ {r.duration}h
                        </p>

                        {/* Countdown (sports, upcoming, has deadline) */}
                        {isSports && r.status === "upcoming" && r.countdownDeadline && (
                          <div className="mt-1.5">
                            <Countdown deadline={r.countdownDeadline} />
                            {r.minPlayers && (
                              <span className="ml-2 text-[0.7rem] text-neutral-400">
                                {accepted} / {Math.ceil(r.minPlayers / 2)} needed
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-[0.68rem] font-mono text-neutral-400">{r._id.slice(-8).toUpperCase()}</span>
                        {r.status === "upcoming" && (
                          <button onClick={() => setCancel(r._id)}
                            className="px-3 py-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Invitees (sports only) */}
                    {isSports && r.invitees.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-neutral-100">
                        <p className="text-[0.72rem] font-bold text-neutral-500 uppercase tracking-wide mb-2">Invitees</p>
                        <div className="flex flex-wrap gap-2">
                          {r.invitees.map((inv, i) => (
                            <div key={i} className="flex items-center gap-1.5 bg-neutral-50 rounded-lg px-3 py-1.5">
                              <span className="text-xs text-neutral-700">{inv.email}</span>
                              <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full capitalize ${INVITEE_STYLES[inv.status]}`}>
                                {inv.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
