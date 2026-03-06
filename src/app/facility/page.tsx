"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Trophy, Dumbbell, Users, UtensilsCrossed, Award, Waves,
  type LucideIcon,
} from "lucide-react";
import PageBackground from "@/components/PageBackground";

type FacilityType = "sports" | "coworking" | "canteen" | "info" | "membership";

interface Facility {
  id: number;
  name: string;
  category: string;
  type: FacilityType;
  Icon: LucideIcon;
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
  {
    id: 1, name: "Football Field", category: "Sports", type: "sports",
    Icon: Trophy, location: "Zone A", open: "06:00 – 22:00",
    desc: "Full-size outdoor football pitch with floodlights.",
    minPlayers: 6, slotNames: ["Field 1", "Field 2"],
  },
  {
    id: 2, name: "Volleyball Court", category: "Sports", type: "sports",
    Icon: Trophy, location: "Zone A", open: "06:00 – 22:00",
    desc: "Indoor volleyball court with professional net and flooring.",
    minPlayers: 6, slotNames: ["Court 1", "Court 2"],
  },
  {
    id: 3, name: "Badminton Court", category: "Sports", type: "sports",
    Icon: Dumbbell, location: "Sport Complex, 2F", open: "06:00 – 22:00",
    desc: "Professional-grade badminton courts with proper lighting.",
    minPlayers: 4, slotNames: BADMINTON_SLOTS,
  },
  {
    id: 4, name: "Table Tennis", category: "Sports", type: "sports",
    Icon: Dumbbell, location: "Sport Complex, 1F", open: "06:00 – 22:00",
    desc: "Table tennis tables available for singles or doubles play.",
    minPlayers: 2, slotNames: TABLE_SLOTS,
  },
  {
    id: 5, name: "Private Room A", category: "Co-working", type: "coworking",
    Icon: Users, location: "Library, 3rd Floor", open: "06:00 – 22:00",
    desc: "Enclosed private room for focused group work. Fits up to 6 people.",
    slotNames: ["A101", "A102"], requiresKMITL: true,
  },
  {
    id: 6, name: "Private Room B", category: "Co-working", type: "coworking",
    Icon: Users, location: "Library, 3rd Floor", open: "06:00 – 22:00",
    desc: "Enclosed private room ideal for presentations. Fits up to 8 people.",
    slotNames: ["B101", "B102"], requiresKMITL: true,
  },
  {
    id: 7, name: "Engineering Canteen", category: "Canteen", type: "canteen",
    Icon: UtensilsCrossed, location: "Engineering Building", open: "06:00 – 22:00",
    desc: "Reserve a table at the Engineering Canteen. One table per account at a time.",
    slotNames: CANTEEN_SLOTS, requiresKMITL: true,
  },
  {
    id: 8, name: "Central Canteen", category: "Canteen", type: "canteen",
    Icon: UtensilsCrossed, location: "Central Building", open: "06:00 – 22:00",
    desc: "Reserve a table at the Central Canteen. One table per account at a time.",
    slotNames: CANTEEN_SLOTS, requiresKMITL: true,
  },
  {
    id: 9, name: "Fitness Center", category: "Gym & Pool", type: "info",
    Icon: Dumbbell, location: "Sport Complex, G Floor", open: "05:00 – 22:00",
    desc: "Fully equipped gym with free weights, cardio machines, and personal trainers.",
    fee: "50 THB / session", studentFee: "Free with student membership",
  },
  {
    id: 10, name: "Swimming Pool", category: "Gym & Pool", type: "info",
    Icon: Waves, location: "Aquatic Center", open: "06:00 – 22:00",
    desc: "50m competition-grade pool. Open to all students and staff.",
    fee: "40 THB / session", studentFee: "20 THB / session (student member)",
  },
  {
    id: 11, name: "Student Membership", category: "Membership", type: "membership",
    Icon: Award, location: "Admin Office", open: "09:00 – 16:00",
    desc: "Automatic for registered students using @kmitl.ac.th email. Enjoy discounted facility fees and priority booking.",
    fee: "Free",
  },
  {
    id: 12, name: "Semester Pass", category: "Membership", type: "membership",
    Icon: Award, location: "Admin Office", open: "09:00 – 16:00",
    desc: "Unlimited gym and pool access for one full semester. Includes priority booking for all sports courts.",
    fee: "990 THB / semester", studentFee: "590 THB / semester (student member)",
  },
];

// ── Time slot helpers ─────────────────────────────────────

const ALL_SLOTS = Array.from({ length: 17 }, (_, i) => {
  const h = i + 6;
  return `${String(h).padStart(2, "0")}:00`;
});

function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function minBookingDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toLocalDateStr(tomorrow);
}

function maxBookingDate(): string {
  const max = new Date();
  max.setDate(max.getDate() + 7);
  return toLocalDateStr(max);
}

function getStartSlots(date: string): string[] {
  const now = new Date();
  const todayStr = toLocalDateStr(now);
  const currentH = now.getHours();
  if (date === todayStr && currentH < 6) return [];
  return ALL_SLOTS.filter(s => {
    const h = parseInt(s, 10);
    if (h >= 22) return false;
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
  newStart: string,
  newEnd: string,
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

function isSlotAvailable(
  slotName: string,
  availability: Record<string, { startTime: string; endTime: string }[]>,
  date: string
): boolean {
  const now = new Date();
  const todayStr = toLocalDateStr(now);
  if (date === todayStr && now.getHours() < 6) return true;
  const bookings = availability[slotName] ?? [];
  const starts = getStartSlots(date);
  return starts.some(s => getEndSlots(s).some(e => !isTimeConflict(s, e, bookings)));
}

// ── Info Modal ────────────────────────────────────────────

function InfoModal({ facility, onClose }: { facility: Facility; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-[#141414] border border-white/[0.07] rounded-3xl p-8 max-w-md w-full shadow-card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#FF7B00]/10 flex items-center justify-center mb-3">
              <facility.Icon className="w-6 h-6 text-[#FF7B00]" />
            </div>
            <h3 className="text-lg font-extrabold text-white">{facility.name}</h3>
            <p className="text-sm text-white/40">{facility.location}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-white/60 leading-relaxed mb-5">{facility.desc}</p>
        <div className="bg-white/[0.04] rounded-2xl p-4 space-y-3 mb-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-white/70">Hours</span>
            <span className="text-white/60">{facility.open}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-white/70">Walk-in Fee</span>
            <span className="text-white/60">{facility.fee}</span>
          </div>
          {facility.studentFee && (
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#FF7B00]">Student Rate</span>
              <span className="text-[#FF7B00] font-semibold">{facility.studentFee}</span>
            </div>
          )}
        </div>
        <div className="bg-[#FF7B00]/10 border border-[#FF7B00]/20 rounded-xl px-4 py-3 mb-5">
          <p className="text-xs font-medium text-[#FF7B00]">
            No reservation required — just show up during opening hours. Student members enjoy reduced rates automatically.
          </p>
        </div>
        <button onClick={onClose} className="w-full py-3 text-sm font-bold text-white bg-[#FF7B00] hover:bg-[#e06f00] rounded-xl transition-colors shadow-btn">
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
      <div className="bg-[#141414] border border-white/[0.07] rounded-3xl p-8 max-w-md w-full shadow-card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#FF7B00]/10 flex items-center justify-center mb-3">
              <facility.Icon className="w-6 h-6 text-[#FF7B00]" />
            </div>
            <h3 className="text-lg font-extrabold text-white">{facility.name}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-white/60 leading-relaxed mb-5">{facility.desc}</p>
        <div className="bg-white/[0.04] rounded-2xl p-4 space-y-3 mb-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-white/70">Regular Price</span>
            <span className="text-white/60">{facility.fee}</span>
          </div>
          {facility.studentFee && (
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#FF7B00]">Student Price</span>
              <span className="text-[#FF7B00] font-semibold">{facility.studentFee}</span>
            </div>
          )}
        </div>
        <div className="bg-[#FF7B00]/10 border border-[#FF7B00]/20 rounded-xl px-4 py-3 mb-5">
          <p className="text-xs font-semibold text-[#FF7B00] mb-1">Student Member Privileges</p>
          <ul className="text-xs text-white/50 space-y-1">
            <li>✓ Automatic for @kmitl.ac.th email accounts</li>
            <li>✓ Discounted fees on sports &amp; gym facilities</li>
            <li>✓ Priority booking up to 7 days in advance</li>
            <li>✓ Free access to co-working rooms</li>
          </ul>
        </div>
        <button onClick={onClose} className="w-full py-3 text-sm font-bold text-white bg-[#FF7B00] hover:bg-[#e06f00] rounded-xl transition-colors shadow-btn">
          Close
        </button>
      </div>
    </div>
  );
}

// ── Booking Modal ─────────────────────────────────────────

function BookingModal({ facility, onClose }: { facility: Facility; onClose: () => void }) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? "";
  const isKMITL = userEmail.endsWith("@kmitl.ac.th");

  const [slot,             setSlot]             = useState("");
  const [date,             setDate]             = useState("");
  const [startTime,        setStartTime]        = useState("");
  const [endTime,          setEndTime]          = useState("");
  const [inviteEmail,      setInviteEmail]      = useState("");
  const [invitees,         setInvitees]         = useState<string[]>([]);
  const [note,             setNote]             = useState("");
  const [bookedRanges,     setBookedRanges]     = useState<{ startTime: string; endTime: string }[]>([]);
  const [slotAvailability, setSlotAvailability] = useState<Record<string, { startTime: string; endTime: string }[]>>({});
  const [loading,          setLoading]          = useState(false);
  const [done,             setDone]             = useState(false);
  const [error,            setError]            = useState("");

  const isSports  = facility.type === "sports";
  const isCanteen = facility.type === "canteen";
  const minP      = facility.minPlayers ?? 1;
  const slotNames = facility.slotNames ?? [];

  const requiredInvitees = minP - 1;
  const enoughInvitees   = !isSports || invitees.length >= requiredInvitees;

  const startSlots = getStartSlots(date);
  const endSlots   = getEndSlots(startTime);

  const kmitlBlocked = facility.requiresKMITL && !isKMITL;
  const canBook = !kmitlBlocked && !!slot && !!date && !!startTime && !!endTime && enoughInvitees;

  const fetchFacilityAvailability = useCallback(async () => {
    if (!date) { setSlotAvailability({}); return; }
    const res = await fetch(`/api/reservations/facility-availability?facilityId=${facility.id}&date=${date}`);
    if (res.ok) setSlotAvailability(await res.json());
  }, [facility.id, date]);

  const fetchAvailability = useCallback(async () => {
    if (!date || !slot) { setBookedRanges([]); return; }
    const res = await fetch(`/api/reservations/availability?facilityId=${facility.id}&date=${date}&slot=${encodeURIComponent(slot)}`);
    if (res.ok) setBookedRanges(await res.json());
  }, [facility.id, date, slot]);

  useEffect(() => { fetchFacilityAvailability(); }, [fetchFacilityAvailability]);
  useEffect(() => { fetchAvailability(); }, [fetchAvailability]);

  const availableSlots = date
    ? slotNames.filter(s => isSlotAvailable(s, slotAvailability, date))
    : slotNames;

  const handleStartChange = (val: string) => {
    setStartTime(val);
    setEndTime("");
  };

  const validStartSlots = startSlots.filter(s => {
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
          minPlayers: facility.minPlayers,
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

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
        <div className="bg-[#141414] border border-white/[0.07] rounded-3xl p-10 max-w-sm w-full text-center shadow-card">
          <div className="w-16 h-16 rounded-full bg-[#FF7B00] flex items-center justify-center mx-auto mb-5 text-white text-2xl font-bold shadow-btn">✓</div>
          <h3 className="text-xl font-extrabold text-white mb-2">Booking Confirmed!</h3>
          <p className="text-sm text-white/60 mb-2">
            <span className="font-semibold text-white">{facility.name}</span> — {slot}
          </p>
          <p className="text-xs text-white/40 mb-1">{date} &nbsp;·&nbsp; {startTime} – {endTime}</p>
          {isSports && invitees.length > 0 && (
            <p className="text-xs text-white/40 mb-4">
              Invitations sent to {invitees.length} friend{invitees.length > 1 ? "s" : ""}.
            </p>
          )}
          {isSports && (
            <div className="bg-[#FF7B00]/10 border border-[#FF7B00]/20 rounded-xl px-4 py-3 mb-4">
              <p className="text-xs font-medium text-[#FF7B00]">
                Invitees have <strong>1 hour</strong> to respond. If fewer than half accept, this reservation will be auto-cancelled.
              </p>
            </div>
          )}
          <Link
            href="/my-reservation"
            className="block w-full py-3 bg-[#FF7B00] text-white text-sm font-bold rounded-xl hover:bg-[#e06f00] transition-colors shadow-btn mb-3"
          >
            View My Reservations
          </Link>
          <button onClick={onClose} className="w-full py-3 text-sm font-semibold text-white/40 hover:text-white transition-colors">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-[#141414] border border-white/[0.07] rounded-3xl p-8 max-w-md w-full shadow-card max-h-[90vh] overflow-y-auto">

        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="w-12 h-12 rounded-xl bg-[#FF7B00]/10 flex items-center justify-center mb-3">
              <facility.Icon className="w-6 h-6 text-[#FF7B00]" />
            </div>
            <h3 className="text-lg font-extrabold text-white">{facility.name}</h3>
            <p className="text-sm text-white/40">{facility.location}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {kmitlBlocked && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5">
            <p className="text-xs font-semibold text-red-400">
              This facility is only available to @kmitl.ac.th accounts. Please sign in with your student email.
            </p>
          </div>
        )}

        {isSports && (
          <div className="bg-[#FF7B00]/10 border border-[#FF7B00]/20 rounded-xl px-4 py-3 mb-5">
            <p className="text-xs font-semibold text-[#FF7B00]">
              Minimum <span className="font-extrabold">{minP} participants</span> required. You are the host — invite friends below.
              Reservation confirms when ≥ {Math.ceil(minP / 2)} invitees accept within 1 hour.
            </p>
          </div>
        )}

        {isCanteen && (
          <div className="bg-[#FF7B00]/10 border border-[#FF7B00]/20 rounded-xl px-4 py-3 mb-5">
            <p className="text-xs font-semibold text-[#FF7B00]">
              One table reservation per account at a time.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
            <p className="text-xs font-semibold text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-4">

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Date</label>
            <input
              type="date"
              min={minBookingDate()}
              max={maxBookingDate()}
              value={date}
              onChange={e => { setDate(e.target.value); setSlot(""); setStartTime(""); setEndTime(""); }}
              className="w-full px-3.5 py-3 bg-[#1c1c1c] border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[#FF7B00] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">
              {isCanteen ? "Select Table" : isSports ? "Select Field / Court" : "Select Room"}
              {date && (
                <span className="ml-2 font-normal text-white/30">
                  ({availableSlots.length} / {slotNames.length} available)
                </span>
              )}
            </label>
            <select
              value={slot}
              onChange={e => { setSlot(e.target.value); setStartTime(""); setEndTime(""); }}
              disabled={!date}
              className="w-full px-3.5 py-3 bg-[#1c1c1c] border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[#FF7B00] transition-all disabled:opacity-40"
            >
              <option value="">-- Select --</option>
              {availableSlots.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {date && availableSlots.length === 0 && (
              <p className="text-xs text-red-400 mt-1">No available slots for this date.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Start Time</label>
            <select
              value={startTime}
              onChange={e => handleStartChange(e.target.value)}
              disabled={!slot || validStartSlots.length === 0}
              className="w-full px-3.5 py-3 bg-[#1c1c1c] border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[#FF7B00] transition-all disabled:opacity-40"
            >
              <option value="">-- Select start time --</option>
              {validStartSlots.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {slot && date && validStartSlots.length === 0 && (
              <p className="text-xs text-[#FF7B00] mt-1">Facility opens at 06:00 — start times will appear then.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">
              End Time <span className="ml-1 text-white/30 font-normal">(max 3 hours)</span>
            </label>
            <select
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              disabled={!startTime}
              className="w-full px-3.5 py-3 bg-[#1c1c1c] border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[#FF7B00] transition-all disabled:opacity-40"
            >
              <option value="">-- Select end time --</option>
              {validEndSlots.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {isSports && (
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Invite Players <span className="text-white/30 font-normal">(min {minP} total including you)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="friend@kmitl.ac.th"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addInvite())}
                  className="flex-1 px-3.5 py-3 bg-[#1c1c1c] border border-white/10 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:border-[#FF7B00] transition-all"
                />
                <button
                  type="button"
                  onClick={addInvite}
                  className="px-4 py-3 bg-[#FF7B00] text-white text-xs font-bold rounded-xl hover:bg-[#e06f00] transition-colors shadow-btn"
                >
                  Add
                </button>
              </div>

              <div className="mt-2">
                <div className="w-full bg-white/[0.08] rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${enoughInvitees ? "bg-green-500" : "bg-[#FF7B00]"}`}
                    style={{ width: `${Math.min(100, (invitees.length / Math.max(requiredInvitees, 1)) * 100)}%` }}
                  />
                </div>
                {!enoughInvitees && (
                  <p className="text-xs text-amber-400 mt-1">
                    Add {requiredInvitees - invitees.length} more player{requiredInvitees - invitees.length !== 1 ? "s" : ""} to unlock booking
                  </p>
                )}
                {enoughInvitees && invitees.length > 0 && (
                  <p className="text-xs text-green-400 mt-1 font-semibold">✓ Minimum players reached</p>
                )}
              </div>

              {invitees.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {invitees.map(email => (
                    <span key={email} className="flex items-center gap-1 px-2.5 py-1 bg-[#FF7B00]/10 text-[#FF7B00] text-xs font-semibold rounded-full border border-[#FF7B00]/20">
                      {email}
                      <button
                        onClick={() => setInvitees(prev => prev.filter(e => e !== email))}
                        className="hover:text-red-400 ml-0.5"
                      >✕</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Notes (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              placeholder="Any special requests..."
              className="w-full px-3.5 py-3 bg-[#1c1c1c] border border-white/10 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:border-[#FF7B00] transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-semibold text-white/60 bg-white/[0.06] hover:bg-white/10 rounded-xl transition-colors border border-white/10"
          >
            Cancel
          </button>
          <button
            disabled={!canBook || loading}
            onClick={handleConfirm}
            className="flex-1 py-3 text-sm font-bold text-white bg-[#FF7B00] hover:bg-[#e06f00] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-colors shadow-btn"
          >
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
    <PageBackground>
      <Navbar />
      {renderModal()}

      <div className="pt-16">
        <div className="bg-black border-b border-white/[0.07]">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">Browse Facilities</h1>
            <p className="text-sm text-white/40">Find and book KMITL facilities instantly</p>

            <div className="mt-5 relative max-w-md">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-sm">🔍</span>
              <input
                className="w-full pl-10 pr-4 py-3 bg-[#111] border border-white/10 rounded-xl text-sm text-white placeholder-white/25 outline-none focus:border-[#FF7B00] transition-all"
                placeholder="Search facilities..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="mt-4 flex gap-2 flex-wrap">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border
                    ${activeCategory === c
                      ? "bg-[#FF7B00] text-white border-[#FF7B00] shadow-btn"
                      : "bg-transparent text-white/50 border-white/10 hover:border-[#FF7B00]/50 hover:text-[#FF7B00]"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-white/30">
              <div className="text-4xl mb-3">🔎</div>
              <p className="font-semibold">No facilities found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(f => (
                <div
                  key={f.id}
                  className="bg-[#111] rounded-2xl p-6 border border-white/[0.07] hover:border-[#FF7B00]/30 hover:shadow-[0_0_30px_rgba(255,123,0,0.08)] hover:-translate-y-1 transition-all duration-200 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#FF7B00]/10 flex items-center justify-center">
                      <f.Icon className="w-6 h-6 text-[#FF7B00]" />
                    </div>
                  </div>

                  <h3 className="font-extrabold text-white text-sm mb-1">{f.name}</h3>
                  <p className="text-xs text-white/40 mb-1">📍 {f.location}</p>
                  <p className="text-xs text-white/40 mb-2">🕐 {f.open}</p>

                  {f.minPlayers && (
                    <span className="text-xs font-semibold text-[#FF7B00] bg-[#FF7B00]/10 border border-[#FF7B00]/20 px-2 py-0.5 rounded-full inline-block mb-2 w-fit">
                      Min {f.minPlayers} players
                    </span>
                  )}
                  {f.fee && f.type === "info" && (
                    <span className="text-xs font-semibold text-white/60 bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded-full inline-block mb-2 w-fit">
                      {f.fee}
                    </span>
                  )}
                  {f.type === "membership" && (
                    <span className="text-xs font-semibold text-white/60 bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded-full inline-block mb-2 w-fit">
                      {f.fee}
                    </span>
                  )}
                  {f.requiresKMITL && (
                    <span className="text-xs font-semibold text-[#FF7B00]/70 bg-[#FF7B00]/10 border border-[#FF7B00]/15 px-2 py-0.5 rounded-full inline-block mb-2 w-fit">
                      @kmitl.ac.th only
                    </span>
                  )}

                  <p className="text-xs text-white/40 leading-relaxed mb-5 flex-1">{f.desc}</p>

                  <button
                    onClick={() => setSelected(f)}
                    className={`w-full py-2.5 text-white text-xs font-bold rounded-xl transition-all active:scale-[0.98]
                      ${f.type === "info" || f.type === "membership"
                        ? "bg-white/10 hover:bg-white/15 border border-white/15"
                        : "bg-[#FF7B00] hover:bg-[#e06f00] shadow-btn"}`}
                  >
                    {f.type === "info"        ? "View Info & Fees"
                    : f.type === "membership" ? "View Membership"
                    :                          "Book Now"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageBackground>
  );
}