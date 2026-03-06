"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type Status = "Upcoming" | "Completed" | "Cancelled";

interface Reservation {
  id: string;
  facility: string;
  emoji: string;
  category: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  status: Status;
}

const RESERVATIONS: Reservation[] = [
  { id: "RSV-001", facility: "Main Football Field",  emoji: "⚽", category: "Sports",    date: "2025-03-10", time: "16:00", duration: "2 hrs", location: "Zone A, Field 1",    status: "Upcoming"  },
  { id: "RSV-002", facility: "Fitness Center A",     emoji: "🏋️", category: "Exercise",  date: "2025-03-08", time: "07:00", duration: "1 hr",  location: "Sport Complex, G",   status: "Upcoming"  },
  { id: "RSV-003", facility: "Study Room 3F",        emoji: "📖", category: "Coworking", date: "2025-03-05", time: "13:00", duration: "3 hrs", location: "Library, 3rd Floor", status: "Completed" },
  { id: "RSV-004", facility: "Basketball Court",     emoji: "🏀", category: "Sports",    date: "2025-03-01", time: "18:00", duration: "2 hrs", location: "Zone B, Court 2",    status: "Completed" },
  { id: "RSV-005", facility: "Olympic Swimming Pool",emoji: "🏊", category: "Sports",    date: "2025-02-22", time: "06:30", duration: "1 hr",  location: "Aquatic Center",     status: "Cancelled" },
];

const STATUS_STYLES: Record<Status, string> = {
  Upcoming:  "bg-blue-50 text-[#3b6ef6]",
  Completed: "bg-green-50 text-green-600",
  Cancelled: "bg-red-50 text-red-500",
};

const TABS: Status[] = ["Upcoming", "Completed", "Cancelled"];

export default function MyReservationPage() {
  const [active, setActive]    = useState<Status | "All">("All");
  const [cancel, setCancel]    = useState<string | null>(null);
  const [list, setList]        = useState<Reservation[]>(RESERVATIONS);

  const filtered = active === "All" ? list : list.filter(r => r.status === active);

  const counts = {
    Upcoming:  list.filter(r => r.status === "Upcoming").length,
    Completed: list.filter(r => r.status === "Completed").length,
    Cancelled: list.filter(r => r.status === "Cancelled").length,
  };

  const doCancel = (id: string) => {
    setList(prev => prev.map(r => r.id === id ? { ...r, status: "Cancelled" } : r));
    setCancel(null);
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] font-sans">
      <Navbar />

      {/* Cancel confirm modal */}
      {cancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-extrabold text-neutral-900 mb-2">Cancel Reservation?</h3>
            <p className="text-sm text-neutral-500 mb-6">This action cannot be undone. Your slot will be released.</p>
            <div className="flex gap-3">
              <button onClick={() => setCancel(null)}
                className="flex-1 py-3 text-sm font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors">
                Keep it
              </button>
              <button onClick={() => doCancel(cancel)}
                className="flex-1 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors">
                Yes, Cancel
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

            {/* Stats row */}
            <div className="mt-5 flex gap-3 flex-wrap">
              {(["All", ...TABS] as const).map(tab => (
                <button key={tab} onClick={() => setActive(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border
                    ${active === tab
                      ? "bg-[#3b6ef6] text-white border-[#3b6ef6] shadow-md shadow-blue-200"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-[#3b6ef6] hover:text-[#3b6ef6]"}`}>
                  {tab} {tab !== "All" && <span className="ml-1 opacity-70">({counts[tab as Status]})</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reservation list */}
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
              {filtered.map(r => (
                <div key={r.id}
                  className="bg-white rounded-2xl p-5 border border-neutral-100 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-2xl shrink-0">
                    {r.emoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-extrabold text-neutral-900 text-sm">{r.facility}</h3>
                      <span className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status]}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mb-0.5">📍 {r.location}</p>
                    <p className="text-xs text-neutral-400">
                      📅 {r.date} &nbsp;·&nbsp; 🕐 {r.time} &nbsp;·&nbsp; ⏱ {r.duration}
                    </p>
                  </div>

                  {/* ID + actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[0.68rem] font-mono text-neutral-400">{r.id}</span>
                    {r.status === "Upcoming" && (
                      <button
                        onClick={() => setCancel(r.id)}
                        className="px-3 py-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
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
