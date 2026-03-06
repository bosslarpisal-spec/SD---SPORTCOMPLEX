"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type FacilityType = "sports" | "coworking" | "info" | "membership";

interface Facility {
  id: number;
  name: string;
  category: string;
  type: FacilityType;
  emoji: string;
  location: string;
  open: string;
  desc: string;
  minPlayers?: number;
  fee?: string;
  studentFee?: string;
  slots?: number;
}

const CATEGORIES = ["All", "Sports", "Co-working", "Gym & Pool", "Membership"];

const FACILITIES: Facility[] = [
  // Sports
  {
    id: 1, name: "Football Field",    category: "Sports",    type: "sports",
    emoji: "⚽", slots: 4,  location: "Zone A, Field 1",    open: "06:00 – 22:00",
    desc: "Full-size outdoor football pitch with floodlights.",
    minPlayers: 6,
  },
  {
    id: 2, name: "Volleyball Court",  category: "Sports",    type: "sports",
    emoji: "🏐", slots: 6,  location: "Zone A, Court 3",    open: "07:00 – 21:00",
    desc: "Indoor volleyball court with professional net and flooring.",
    minPlayers: 6,
  },
  {
    id: 3, name: "Badminton Court",   category: "Sports",    type: "sports",
    emoji: "🏸", slots: 8,  location: "Sport Complex, 2F",  open: "07:00 – 21:00",
    desc: "Professional-grade badminton courts with proper lighting.",
    minPlayers: 4,
  },
  {
    id: 4, name: "Table Tennis",      category: "Sports",    type: "sports",
    emoji: "🏓", slots: 10, location: "Sport Complex, 1F",  open: "08:00 – 20:00",
    desc: "Table tennis tables available for singles or doubles play.",
    minPlayers: 2,
  },
  // Co-working
  {
    id: 5, name: "Private Room A",    category: "Co-working", type: "coworking",
    emoji: "🚪", slots: 3,  location: "Library, 3rd Floor", open: "08:00 – 20:00",
    desc: "Enclosed private room for focused group work. Fits up to 6 people.",
  },
  {
    id: 6, name: "Private Room B",    category: "Co-working", type: "coworking",
    emoji: "🚪", slots: 2,  location: "Library, 3rd Floor", open: "08:00 – 20:00",
    desc: "Enclosed private room ideal for presentations and study sessions. Fits up to 8 people.",
  },
  {
    id: 7, name: "Co-working Table",  category: "Co-working", type: "coworking",
    emoji: "💻", slots: 15, location: "Innovation Hub, 1F", open: "08:00 – 22:00",
    desc: "Open-plan coworking tables with high-speed Wi-Fi and power outlets.",
  },
  // Gym & Pool (info only)
  {
    id: 8, name: "Fitness Center",    category: "Gym & Pool", type: "info",
    emoji: "🏋️", location: "Sport Complex, G Floor", open: "05:00 – 22:00",
    desc: "Fully equipped gym with free weights, cardio machines, and personal trainers.",
    fee: "50 THB / session",
    studentFee: "Free with student membership",
  },
  {
    id: 9, name: "Swimming Pool",     category: "Gym & Pool", type: "info",
    emoji: "🏊", location: "Aquatic Center",          open: "06:00 – 20:00",
    desc: "50m competition-grade pool. Open to all students and staff.",
    fee: "40 THB / session",
    studentFee: "20 THB / session (student member)",
  },
  // Membership
  {
    id: 10, name: "Student Membership", category: "Membership", type: "membership",
    emoji: "🎓", location: "Admin Office", open: "09:00 – 16:00",
    desc: "Automatic for registered students using a student email (@kmitl.ac.th). Enjoy discounted facility fees and priority booking.",
    fee: "Free",
  },
  {
    id: 11, name: "Semester Pass",     category: "Membership", type: "membership",
    emoji: "🎫", location: "Admin Office", open: "09:00 – 16:00",
    desc: "Unlimited gym and pool access for one full semester. Includes priority booking for all sports courts.",
    fee: "990 THB / semester",
    studentFee: "590 THB / semester (student member)",
  },
];

// ── Info Modal (Gym & Pool) ──────────────────────────────
function InfoModal({ facility, onClose }: { facility: Facility; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-3xl mb-2">{facility.emoji}</div>
            <h3 className="text-lg font-extrabold text-neutral-900">{facility.name}</h3>
            <p className="text-sm text-neutral-400">{facility.location}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-400 hover:text-neutral-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-neutral-600 leading-relaxed mb-5">{facility.desc}</p>

        <div className="bg-neutral-50 rounded-2xl p-4 space-y-3 mb-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-neutral-700">🕐 Hours</span>
            <span className="text-neutral-600">{facility.open}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-neutral-700">💰 Walk-in Fee</span>
            <span className="text-neutral-600">{facility.fee}</span>
          </div>
          {facility.studentFee && (
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#3b6ef6]">🎓 Student Rate</span>
              <span className="text-[#3b6ef6] font-semibold">{facility.studentFee}</span>
            </div>
          )}
        </div>

        <div className="bg-blue-50 rounded-xl px-4 py-3 mb-5">
          <p className="text-xs font-medium text-[#3b6ef6]">
            No reservation required — just show up during opening hours. Student members enjoy reduced rates automatically.
          </p>
        </div>

        <button onClick={onClose}
          className="w-full py-3 text-sm font-bold text-white bg-[#3b6ef6] hover:bg-[#2a5ce0] rounded-xl transition-colors">
          Got it
        </button>
      </div>
    </div>
  );
}

// ── Membership Modal ─────────────────────────────────────
function MembershipModal({ facility, onClose }: { facility: Facility; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-3xl mb-2">{facility.emoji}</div>
            <h3 className="text-lg font-extrabold text-neutral-900">{facility.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-400 hover:text-neutral-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-neutral-600 leading-relaxed mb-5">{facility.desc}</p>

        <div className="bg-neutral-50 rounded-2xl p-4 space-y-3 mb-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-neutral-700">💰 Regular Price</span>
            <span className="text-neutral-600">{facility.fee}</span>
          </div>
          {facility.studentFee && (
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#3b6ef6]">🎓 Student Price</span>
              <span className="text-[#3b6ef6] font-semibold">{facility.studentFee}</span>
            </div>
          )}
        </div>

        <div className="bg-purple-50 rounded-xl px-4 py-3 mb-5">
          <p className="text-xs font-semibold text-purple-700 mb-1">Student Member Privileges</p>
          <ul className="text-xs text-purple-600 space-y-1">
            <li>✓ Automatic for @kmitl.ac.th email accounts</li>
            <li>✓ Discounted fees on sports & gym facilities</li>
            <li>✓ Priority booking up to 7 days in advance</li>
            <li>✓ Free access to co-working tables</li>
          </ul>
        </div>

        <button onClick={onClose}
          className="w-full py-3 text-sm font-bold text-white bg-[#3b6ef6] hover:bg-[#2a5ce0] rounded-xl transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

// ── Booking Modal (Sports & Co-working) ──────────────────
function BookingModal({ facility, onClose }: { facility: Facility; onClose: () => void }) {
  const [date, setDate]         = useState("");
  const [time, setTime]         = useState("");
  const [dur, setDur]           = useState("1");
  const [note, setNote]         = useState("");
  const [participants, setParticipants] = useState(facility.minPlayers ?? 1);
  const [inviteEmail, setInviteEmail]   = useState("");
  const [invitees, setInvitees]         = useState<string[]>([]);
  const [done, setDone]         = useState(false);

  const isSports = facility.type === "sports";
  const minP = facility.minPlayers ?? 1;
  const canBook = isSports ? participants >= minP : true;

  const addInvite = () => {
    const email = inviteEmail.trim();
    if (email && !invitees.includes(email)) {
      setInvitees((prev) => [...prev, email]);
      setInviteEmail("");
    }
  };

  const removeInvite = (email: string) => {
    setInvitees((prev) => prev.filter((e) => e !== email));
  };

  if (done) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3b6ef6] to-[#6b9eff] flex items-center justify-center mx-auto mb-5 text-white text-2xl font-bold shadow-lg">✓</div>
        <h3 className="text-xl font-extrabold text-neutral-900 mb-2">Booking Confirmed!</h3>
        <p className="text-sm text-neutral-500 mb-2">
          Your reservation for <span className="font-semibold text-neutral-800">{facility.name}</span> has been submitted.
        </p>
        {isSports && invitees.length > 0 && (
          <p className="text-xs text-neutral-400 mb-4">Invitations sent to {invitees.length} friend{invitees.length > 1 ? "s" : ""}.</p>
        )}
        <Link href="/my-reservation"
          className="block w-full py-3 bg-[#3b6ef6] text-white text-sm font-bold rounded-xl hover:bg-[#2a5ce0] transition-colors mb-3">
          View My Reservations
        </Link>
        <button onClick={onClose} className="w-full py-3 text-sm font-semibold text-neutral-500 hover:text-neutral-700 transition-colors">
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-3xl mb-2">{facility.emoji}</div>
            <h3 className="text-lg font-extrabold text-neutral-900">{facility.name}</h3>
            <p className="text-sm text-neutral-400">{facility.location}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-400 hover:text-neutral-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sports min-player notice */}
        {isSports && (
          <div className="bg-blue-50 rounded-xl px-4 py-3 mb-5">
            <p className="text-xs font-semibold text-[#3b6ef6]">
              Minimum <span className="font-extrabold">{minP} participants</span> required. You are the host — invite friends by email below.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-3.5 py-3 bg-neutral-100 border border-transparent rounded-xl text-sm text-neutral-900 outline-none focus:border-[#3b6ef6] focus:bg-white transition-all" />
          </div>

          {/* Time */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Start Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              className="w-full px-3.5 py-3 bg-neutral-100 border border-transparent rounded-xl text-sm text-neutral-900 outline-none focus:border-[#3b6ef6] focus:bg-white transition-all" />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Duration (hours)</label>
            <select value={dur} onChange={e => setDur(e.target.value)}
              className="w-full px-3.5 py-3 bg-neutral-100 border border-transparent rounded-xl text-sm text-neutral-900 outline-none focus:border-[#3b6ef6] focus:bg-white transition-all">
              {["1","2","3","4"].map(h => <option key={h} value={h}>{h} hour{h !== "1" ? "s" : ""}</option>)}
            </select>
          </div>

          {/* Participants (sports only) */}
          {isSports && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Number of Participants
                <span className="ml-1 text-neutral-400 font-normal">(min {minP})</span>
              </label>
              <input
                type="number"
                min={minP}
                value={participants}
                onChange={e => setParticipants(Number(e.target.value))}
                className={`w-full px-3.5 py-3 bg-neutral-100 border rounded-xl text-sm text-neutral-900 outline-none transition-all
                  ${participants < minP ? "border-red-400 bg-red-50" : "border-transparent focus:border-[#3b6ef6] focus:bg-white"}`}
              />
              {participants < minP && (
                <p className="text-xs text-red-500 mt-1">At least {minP} participants required</p>
              )}
            </div>
          )}

          {/* Invite Friends (sports only) */}
          {isSports && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Invite Friends (by email)</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="friend@kmitl.ac.th"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addInvite())}
                  className="flex-1 px-3.5 py-3 bg-neutral-100 border border-transparent rounded-xl text-sm outline-none focus:border-[#3b6ef6] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={addInvite}
                  className="px-4 py-3 bg-[#3b6ef6] text-white text-xs font-bold rounded-xl hover:bg-[#2a5ce0] transition-colors"
                >
                  Add
                </button>
              </div>
              {invitees.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {invitees.map(email => (
                    <span key={email} className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-[#3b6ef6] text-xs font-semibold rounded-full">
                      {email}
                      <button onClick={() => removeInvite(email)} className="hover:text-red-500 ml-0.5">✕</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Notes (optional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Any special requests..."
              className="w-full px-3.5 py-3 bg-neutral-100 border border-transparent rounded-xl text-sm text-neutral-900 outline-none focus:border-[#3b6ef6] focus:bg-white transition-all resize-none" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-3 text-sm font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors">
            Cancel
          </button>
          <button
            disabled={!date || !time || !canBook}
            onClick={() => setDone(true)}
            className="flex-1 py-3 text-sm font-bold text-white bg-[#3b6ef6] hover:bg-[#2a5ce0] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors shadow-md shadow-blue-200">
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────
export default function FacilityPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Facility | null>(null);

  const filtered = FACILITIES.filter(f => {
    const matchCat = activeCategory === "All" || f.category === activeCategory;
    const matchQ   = f.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  const renderModal = () => {
    if (!selected) return null;
    if (selected.type === "info")       return <InfoModal       facility={selected} onClose={() => setSelected(null)} />;
    if (selected.type === "membership") return <MembershipModal facility={selected} onClose={() => setSelected(null)} />;
    return                                     <BookingModal    facility={selected} onClose={() => setSelected(null)} />;
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] font-sans">
      <Navbar />
      {renderModal()}

      <div className="pt-16">
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight mb-1">Browse Facilities</h1>
            <p className="text-sm text-neutral-500">Find and book KMITL facilities instantly</p>

            {/* Search */}
            <div className="mt-5 relative max-w-md">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-base pointer-events-none">🔍</span>
              <input
                className="w-full pl-10 pr-4 py-3 bg-neutral-100 border border-transparent rounded-xl text-sm outline-none focus:border-[#3b6ef6] focus:bg-white transition-all"
                placeholder="Search facilities..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Category tabs */}
            <div className="mt-4 flex gap-2 flex-wrap">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setActiveCategory(c)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border
                    ${activeCategory === c
                      ? "bg-[#3b6ef6] text-white border-[#3b6ef6] shadow-md shadow-blue-200"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-[#3b6ef6] hover:text-[#3b6ef6]"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Facility grid */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-neutral-400">
              <div className="text-4xl mb-3">🔎</div>
              <p className="font-semibold">No facilities found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(f => (
                <div key={f.id}
                  className="bg-white rounded-2xl p-6 border border-neutral-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center text-2xl">
                      {f.emoji}
                    </div>
                    {f.slots !== undefined && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                        ${f.slots > 10 ? "bg-green-50 text-green-600" : f.slots > 3 ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-500"}`}>
                        {f.slots} slots
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-neutral-900 text-sm mb-1">{f.name}</h3>
                  <p className="text-xs text-neutral-400 mb-1">📍 {f.location}</p>
                  <p className="text-xs text-neutral-400 mb-2">🕐 {f.open}</p>

                  {/* Sports: min players badge */}
                  {f.minPlayers && (
                    <span className="text-xs font-semibold text-[#3b6ef6] bg-blue-50 px-2 py-0.5 rounded-full inline-block mb-2 w-fit">
                      Min {f.minPlayers} players
                    </span>
                  )}
                  {/* Gym/Pool: fee badge */}
                  {f.fee && f.type === "info" && (
                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full inline-block mb-2 w-fit">
                      {f.fee}
                    </span>
                  )}
                  {/* Membership: price badge */}
                  {f.type === "membership" && (
                    <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full inline-block mb-2 w-fit">
                      {f.fee}
                    </span>
                  )}

                  <p className="text-xs text-neutral-500 leading-relaxed mb-5 flex-1">{f.desc}</p>

                  <button
                    onClick={() => setSelected(f)}
                    className={`w-full py-2.5 text-white text-xs font-bold rounded-xl transition-colors shadow-sm active:scale-[0.98]
                      ${f.type === "info"       ? "bg-orange-500 hover:bg-orange-600 shadow-orange-100"
                      : f.type === "membership" ? "bg-purple-600 hover:bg-purple-700 shadow-purple-100"
                      :                          "bg-[#3b6ef6] hover:bg-[#2a5ce0] shadow-blue-100"}`}>
                    {f.type === "info"       ? "View Info & Fees"
                    : f.type === "membership" ? "View Membership"
                    :                          "Book Now"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
