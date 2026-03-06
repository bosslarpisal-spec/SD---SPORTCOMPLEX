"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type FacilityType = "sports" | "coworking" | "canteen" | "info" | "membership";

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
  slotNames?: string[];
  requiresKMITL?: boolean;
}

const CATEGORIES = ["All", "Sports", "Co-working", "Canteen", "Gym & Pool", "Membership"];

const BADMINTON_SLOTS = Array.from({ length: 8 },  (_, i) => `Court ${i + 1}`);
const TABLE_SLOTS     = Array.from({ length: 4 },  (_, i) => `Table ${i + 1}`);
const CANTEEN_SLOTS   = Array.from({ length: 30 }, (_, i) => `T${i + 1}`);

const FACILITIES: Facility[] = [
  // Sports
  {
    id: 1, name: "Football Field",   category: "Sports", type: "sports",
    emoji: "⚽", location: "Zone A", open: "06:00 – 22:00",
    desc: "Full-size outdoor football pitch with floodlights.",
    minPlayers: 6, slotNames: ["Field 1", "Field 2"],
  },
  {
    id: 2, name: "Volleyball Court", category: "Sports", type: "sports",
    emoji: "🏐", location: "Zone A", open: "06:00 – 22:00",
    desc: "Indoor volleyball court with professional net and flooring.",
    minPlayers: 6, slotNames: ["Court 1", "Court 2"],
  },
  {
    id: 3, name: "Badminton Court",  category: "Sports", type: "sports",
    emoji: "🏸", location: "Sport Complex, 2F", open: "06:00 – 22:00",
    desc: "Professional-grade badminton courts with proper lighting.",
    minPlayers: 4, slotNames: BADMINTON_SLOTS,
  },
  {
    id: 4, name: "Table Tennis",     category: "Sports", type: "sports",
    emoji: "🏓", location: "Sport Complex, 1F", open: "06:00 – 22:00",
    desc: "Table tennis tables available for singles or doubles play.",
    minPlayers: 2, slotNames: TABLE_SLOTS,
  },
  // Co-working
  {
    id: 5, name: "Private Room A",   category: "Co-working", type: "coworking",
    emoji: "🚪", location: "Library, 3rd Floor", open: "06:00 – 22:00",
    desc: "Enclosed private room for focused group work. Fits up to 6 people.",
    slotNames: ["A101", "A102"], requiresKMITL: true,
  },
  {
    id: 6, name: "Private Room B",   category: "Co-working", type: "coworking",
    emoji: "🚪", location: "Library, 3rd Floor", open: "06:00 – 22:00",
    desc: "Enclosed private room ideal for presentations. Fits up to 8 people.",
    slotNames: ["B101", "B102"], requiresKMITL: true,
  },
  // Canteen
  {
    id: 7, name: "Engineering Canteen", category: "Canteen", type: "canteen",
    emoji: "🍽️", location: "Engineering Building", open: "06:00 – 22:00",
    desc: "Reserve a table at the Engineering Canteen. One table per account at a time.",
    slotNames: CANTEEN_SLOTS, requiresKMITL: true,
  },
  {
    id: 8, name: "Central Canteen",     category: "Canteen", type: "canteen",
    emoji: "🍜", location: "Central Building", open: "06:00 – 22:00",
    desc: "Reserve a table at the Central Canteen. One table per account at a time.",
    slotNames: CANTEEN_SLOTS, requiresKMITL: true,
  },
  // Gym & Pool (info only)
  {
    id: 9,  name: "Fitness Center",  category: "Gym & Pool", type: "info",
    emoji: "🏋️", location: "Sport Complex, G Floor", open: "05:00 – 22:00",
    desc: "Fully equipped gym with free weights, cardio machines, and personal trainers.",
    fee: "50 THB / session", studentFee: "Free with student membership",
  },
  {
    id: 10, name: "Swimming Pool",   category: "Gym & Pool", type: "info",
    emoji: "🏊", location: "Aquatic Center", open: "06:00 – 22:00",
    desc: "50m competition-grade pool. Open to all students and staff.",
    fee: "40 THB / session", studentFee: "20 THB / session (student member)",
  },
  // Membership
  {
    id: 11, name: "Student Membership", category: "Membership", type: "membership",
    emoji: "🎓", location: "Admin Office", open: "09:00 – 16:00",
    desc: "Automatic for registered students using @kmitl.ac.th email. Enjoy discounted facility fees and priority booking.",
    fee: "Free",
  },
  {
    id: 12, name: "Semester Pass",   category: "Membership", type: "membership",
    emoji: "🎫", location: "Admin Office", open: "09:00 – 16:00",
    desc: "Unlimited gym and pool access for one full semester. Includes priority booking for all sports courts.",
    fee: "990 THB / semester", studentFee: "590 THB / semester (student member)",
  },
];

// ── Time slot helpers ─────────────────────────────────────
// 06:00 to 22:00
const ALL_SLOTS = Array.from({ length: 17 }, (_, i) => {
  const h = i + 6;
  return `${String(h).padStart(2, "0")}:00`;
});

function getStartSlots(date: string): string[] {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const currentH = now.getHours();
  return ALL_SLOTS.filter(s => {
    const h = parseInt(s, 10);
    if (h >= 22) return false; // last valid start is 21 (end = 22)
    if (date === todayStr) return h > currentH;
    return true;
  });
}

function getEndSlots(start: string): string[] {
  if (!start) return [];
  const startH = parseInt(start, 10);
  return ALL_SLOTS.filter(s => {
    const h = parseInt(s, 10);
    return h > startH && h <= Math.min(startH + 3, 22);
  });
}

function isTimeConflict(
  newStart: string, newEnd: string,
  bookings: { startTime: string; endTime: string }[]
): boolean {
  const ns = parseInt(newStart, 10);
  const ne = parseInt(newEnd, 10);
  return bookings.some(b => {
    const bs = parseInt(b.startTime, 10);
    const be = parseInt(b.endTime, 10);
    return ns < be && ne > bs;
  });
}

// ── Info Modal (Gym & Pool) ───────────────────────────────
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
        <button onClick={onClose} className="w-full py-3 text-sm font-bold text-white bg-[#3b6ef6] hover:bg-[#2a5ce0] rounded-xl transition-colors">
          Got it
        </button>
      </div>
    </div>
  );
}

// ── Membership Modal ──────────────────────────────────────
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
            <li>✓ Free access to co-working rooms</li>
          </ul>
        </div>
        <button onClick={onClose} className="w-full py-3 text-sm font-bold text-white bg-[#3b6ef6] hover:bg-[#2a5ce0] rounded-xl transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

// ── Booking Modal (Sports, Co-working, Canteen) ───────────
function BookingModal({ facility, onClose }: { facility: Facility; onClose: () => void }) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? "";
  const isKMITL   = userEmail.endsWith("@kmitl.ac.th");

  const [slot,        setSlot]        = useState("");
  const [date,        setDate]        = useState("");
  const [startTime,   setStartTime]   = useState("");
  const [endTime,     setEndTime]     = useState("");
  const [participants, setParticipants] = useState(facility.minPlayers ?? 1);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitees,    setInvitees]    = useState<string[]>([]);
  const [note,        setNote]        = useState("");
  const [bookedRanges, setBookedRanges] = useState<{ startTime: string; endTime: string }[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [done,        setDone]        = useState(false);
  const [error,       setError]       = useState("");

  const isSports   = facility.type === "sports";
  const isCanteen  = facility.type === "canteen";
  const minP       = facility.minPlayers ?? 1;
  const slotNames  = facility.slotNames ?? [];

  const startSlots = getStartSlots(date);
  const endSlots   = getEndSlots(startTime);

  const kmitlBlocked = facility.requiresKMITL && !isKMITL;
  const canBook = !kmitlBlocked && !!slot && !!date && !!startTime && !!endTime &&
    (isSports ? participants >= minP : true);

  // Fetch booked ranges when facility/date/slot change
  const fetchAvailability = useCallback(async () => {
    if (!date || !slot) { setBookedRanges([]); return; }
    const res = await fetch(`/api/reservations/availability?facilityId=${facility.id}&date=${date}&slot=${encodeURIComponent(slot)}`);
    if (res.ok) setBookedRanges(await res.json());
  }, [facility.id, date, slot]);

  useEffect(() => { fetchAvailability(); }, [fetchAvailability]);

  const handleStartChange = (val: string) => {
    setStartTime(val);
    setEndTime("");
  };

  // Filter start slots: also grey out slots that conflict
  const validStartSlots = startSlots.filter(s => {
    // A start time is invalid if every possible end time conflicts
    const possibleEnds = getEndSlots(s);
    if (possibleEnds.length === 0) return false;
    return possibleEnds.some(e => !isTimeConflict(s, e, bookedRanges));
  });

  const validEndSlots = endSlots.filter(e => !isTimeConflict(startTime, e, bookedRanges));

  const addInvite = () => {
    const email = inviteEmail.trim();
    if (email && !invitees.includes(email)) {
      setInvitees(prev => [...prev, email]);
      setInviteEmail("");
    }
  };

  const handleConfirm = async () => {
    if (!canBook) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId:   facility.id,
          facilityType: facility.type,
          facilityName: facility.name,
          slot,
          date,
          startTime,
          endTime,
          minPlayers:   facility.minPlayers,
          invitees,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Booking failed. Please try again.");
      } else {
        setDone(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3b6ef6] to-[#6b9eff] flex items-center justify-center mx-auto mb-5 text-white text-2xl font-bold shadow-lg">✓</div>
        <h3 className="text-xl font-extrabold text-neutral-900 mb-2">Booking Confirmed!</h3>
        <p className="text-sm text-neutral-500 mb-2">
          <span className="font-semibold text-neutral-800">{facility.name}</span> — {slot}
        </p>
        <p className="text-xs text-neutral-400 mb-1">{date} &nbsp;·&nbsp; {startTime} – {endTime}</p>
        {isSports && invitees.length > 0 && (
          <p className="text-xs text-neutral-400 mb-4">Invitations sent to {invitees.length} friend{invitees.length > 1 ? "s" : ""}.</p>
        )}
        {isSports && (
          <div className="bg-amber-50 rounded-xl px-4 py-3 mb-4">
            <p className="text-xs font-medium text-amber-700">
              Invitees have <strong>1 hour</strong> to respond. If fewer than half accept, this reservation will be auto-cancelled.
            </p>
          </div>
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

        {/* KMITL email restriction warning */}
        {kmitlBlocked && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
            <p className="text-xs font-semibold text-red-600">
              This facility is only available to @kmitl.ac.th accounts. Please sign in with your student email.
            </p>
          </div>
        )}

        {/* Sports min-player notice */}
        {isSports && (
          <div className="bg-blue-50 rounded-xl px-4 py-3 mb-5">
            <p className="text-xs font-semibold text-[#3b6ef6]">
              Minimum <span className="font-extrabold">{minP} participants</span> required. You are the host — invite friends below.
              Reservation confirms when ≥ {Math.ceil(minP / 2)} invitees accept within 1 hour.
            </p>
          </div>
        )}

        {/* Canteen one-table notice */}
        {isCanteen && (
          <div className="bg-orange-50 rounded-xl px-4 py-3 mb-5">
            <p className="text-xs font-semibold text-orange-600">
              One table reservation per account at a time.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <p className="text-xs font-semibold text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Slot picker */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              {isCanteen ? "Select Table" : isSports ? "Select Field / Court" : "Select Room"}
            </label>
            <select value={slot} onChange={e => { setSlot(e.target.value); setStartTime(""); setEndTime(""); }}
              className="w-full px-3.5 py-3 bg-neutral-100 border border-transparent rounded-xl text-sm text-neutral-900 outline-none focus:border-[#3b6ef6] focus:bg-white transition-all">
              <option value="">-- Select --</option>
              {slotNames.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Date</label>
            <input type="date"
              min={new Date().toISOString().split("T")[0]}
              value={date}
              onChange={e => { setDate(e.target.value); setStartTime(""); setEndTime(""); }}
              className="w-full px-3.5 py-3 bg-neutral-100 border border-transparent rounded-xl text-sm text-neutral-900 outline-none focus:border-[#3b6ef6] focus:bg-white transition-all" />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Start Time</label>
            <select value={startTime} onChange={e => handleStartChange(e.target.value)}
              disabled={!date}
              className="w-full px-3.5 py-3 bg-neutral-100 border border-transparent rounded-xl text-sm text-neutral-900 outline-none focus:border-[#3b6ef6] focus:bg-white transition-all disabled:opacity-50">
              <option value="">-- Select start time --</option>
              {validStartSlots.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* End Time */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              End Time <span className="ml-1 text-neutral-400 font-normal">(max 3 hours)</span>
            </label>
            <select value={endTime} onChange={e => setEndTime(e.target.value)}
              disabled={!startTime}
              className="w-full px-3.5 py-3 bg-neutral-100 border border-transparent rounded-xl text-sm text-neutral-900 outline-none focus:border-[#3b6ef6] focus:bg-white transition-all disabled:opacity-50">
              <option value="">-- Select end time --</option>
              {validEndSlots.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Participants (sports only) */}
          {isSports && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Number of Participants <span className="ml-1 text-neutral-400 font-normal">(min {minP})</span>
              </label>
              <input type="number" min={minP} value={participants}
                onChange={e => setParticipants(Number(e.target.value))}
                className={`w-full px-3.5 py-3 bg-neutral-100 border rounded-xl text-sm text-neutral-900 outline-none transition-all
                  ${participants < minP ? "border-red-400 bg-red-50" : "border-transparent focus:border-[#3b6ef6] focus:bg-white"}`} />
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
                <input type="email" placeholder="friend@kmitl.ac.th"
                  value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addInvite())}
                  className="flex-1 px-3.5 py-3 bg-neutral-100 border border-transparent rounded-xl text-sm outline-none focus:border-[#3b6ef6] focus:bg-white transition-all" />
                <button type="button" onClick={addInvite}
                  className="px-4 py-3 bg-[#3b6ef6] text-white text-xs font-bold rounded-xl hover:bg-[#2a5ce0] transition-colors">
                  Add
                </button>
              </div>
              {invitees.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {invitees.map(email => (
                    <span key={email} className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-[#3b6ef6] text-xs font-semibold rounded-full">
                      {email}
                      <button onClick={() => setInvitees(prev => prev.filter(e => e !== email))} className="hover:text-red-500 ml-0.5">✕</button>
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
            disabled={!canBook || loading}
            onClick={handleConfirm}
            className="flex-1 py-3 text-sm font-bold text-white bg-[#3b6ef6] hover:bg-[#2a5ce0] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors shadow-md shadow-blue-200">
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function FacilityPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search,   setSearch]   = useState("");
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

            <div className="mt-5 relative max-w-md">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">🔍</span>
              <input
                className="w-full pl-10 pr-4 py-3 bg-neutral-100 border border-transparent rounded-xl text-sm outline-none focus:border-[#3b6ef6] focus:bg-white transition-all"
                placeholder="Search facilities..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

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
                    {f.slotNames && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                        ${f.slotNames.length > 10 ? "bg-green-50 text-green-600"
                        : f.slotNames.length > 3  ? "bg-yellow-50 text-yellow-600"
                        :                           "bg-red-50 text-red-500"}`}>
                        {f.slotNames.length} slots
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-neutral-900 text-sm mb-1">{f.name}</h3>
                  <p className="text-xs text-neutral-400 mb-1">📍 {f.location}</p>
                  <p className="text-xs text-neutral-400 mb-2">🕐 {f.open}</p>

                  {f.minPlayers && (
                    <span className="text-xs font-semibold text-[#3b6ef6] bg-blue-50 px-2 py-0.5 rounded-full inline-block mb-2 w-fit">
                      Min {f.minPlayers} players
                    </span>
                  )}
                  {f.fee && f.type === "info" && (
                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full inline-block mb-2 w-fit">
                      {f.fee}
                    </span>
                  )}
                  {f.type === "membership" && (
                    <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full inline-block mb-2 w-fit">
                      {f.fee}
                    </span>
                  )}
                  {f.requiresKMITL && (
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full inline-block mb-2 w-fit">
                      @kmitl.ac.th only
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
