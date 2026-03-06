//src/app/home/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { Trophy, Users, Award, UtensilsCrossed, Dumbbell, ArrowRight, CheckCircle, Target, Globe, Feather, Disc } from "lucide-react";

const CATEGORIES = [
  {
    id: "sports",
    label: "Sports",
    Icon: Trophy,
    desc: "Football, Badminton, Volleyball & more",
    accent: "border-[#FF7B00]/30 hover:border-[#FF7B00]/60 bg-[#FF7B00]/5",
    iconBg: "bg-[#FF7B00]/15",
    iconColor: "text-[#FF7B00]",
  },
  {
    id: "coworking",
    label: "Co-working",
    Icon: Users,
    desc: "Private rooms — @kmitl.ac.th only",
    accent: "border-[#FF7B00]/30 hover:border-[#FF7B00]/60 bg-[#FF7B00]/5",
    iconBg: "bg-[#FF7B00]/15",
    iconColor: "text-[#FF7B00]",
  },
  {
    id: "canteen",
    label: "Canteen",
    Icon: UtensilsCrossed,
    desc: "Engineering & Central canteen tables",
    accent: "border-[#FF7B00]/30 hover:border-[#FF7B00]/60 bg-[#FF7B00]/5",
    iconBg: "bg-[#FF7B00]/15",
    iconColor: "text-[#FF7B00]",
  },
  {
    id: "membership",
    label: "Membership",
    Icon: Award,
    desc: "Student privileges & semester passes",
    accent: "border-[#FF7B00]/30 hover:border-[#FF7B00]/60 bg-[#FF7B00]/5",
    iconBg: "bg-[#FF7B00]/15",
    iconColor: "text-[#FF7B00]",
  },
];

const STEPS = [
  { num: "1", label: "Select Category", desc: "Choose Sports, Co-working, Canteen, or Membership", bg: "bg-[#FF7B00]", numColor: "text-white" },
  { num: "2", label: "Choose Facility", desc: "Pick the specific court, room, or table you want",  bg: "bg-white",     numColor: "text-black" },
  { num: "3", label: "Fill Details",    desc: "Select date, time slot and invite participants",     bg: "bg-[#FF7B00]", numColor: "text-white" },
  { num: "4", label: "Confirm",         desc: "Review and confirm your reservation",                bg: "bg-white",     numColor: "text-black" },
];

const FEATURED = [
  { name: "Football Field",   category: "Sports",    minPlayers: 6,    Icon: Target,          slots: "2 fields"  },
  { name: "Volleyball Court", category: "Sports",    minPlayers: 6,    Icon: Globe,           slots: "2 courts"  },
  { name: "Badminton Court",  category: "Sports",    minPlayers: 4,    Icon: Feather,         slots: "8 courts"  },
  { name: "Table Tennis",     category: "Sports",    minPlayers: 2,    Icon: Disc,            slots: "4 tables"  },
  { name: "Private Room A",   category: "Co-working", minPlayers: null, Icon: Users,           slots: "2 rooms"   },
  { name: "Eng. Canteen",     category: "Canteen",   minPlayers: null, Icon: UtensilsCrossed, slots: "30 tables" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black font-sans">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-16 h-[520px] flex items-center justify-center overflow-hidden">
        <Image
          src="/campus-hero.jpg"
          alt="KMITL Campus"
          fill priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" />

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#FF7B00]/20 border border-[#FF7B00]/30 text-[#FF7B00] text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            KMITL Facility Reservation
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4 leading-[1.1]">
            Book Your<br /><span className="text-[#FF7B00]">Facility</span> Instantly
          </h1>
          <p className="text-sm md:text-base text-white/55 font-medium mb-8 max-w-xl mx-auto">
            Reserve sports courts, co-working rooms, and canteen tables at King Mongkut&apos;s Institute of Technology Ladkrabang
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/facility"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#FF7B00] hover:bg-[#e06f00] text-white text-sm font-bold rounded-xl transition-all shadow-btn">
              Browse Facilities <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/my-reservation"
              className="px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white text-sm font-bold rounded-xl transition-all border border-white/15 backdrop-blur">
              My Reservations
            </Link>
          </div>
        </div>
      </section>

      {/* ── Category Cards ────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} href={`/facility?category=${cat.id}`}
              className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border ${cat.accent} hover:-translate-y-1 transition-all duration-200`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.iconBg}`}>
                <cat.Icon className={`w-6 h-6 ${cat.iconColor}`} />
              </div>
              <div className="text-center">
                <div className="text-xs font-extrabold text-white tracking-wide uppercase">{cat.label}</div>
                <div className="text-[0.67rem] text-white/35 mt-0.5 leading-snug">{cat.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Facilities ───────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 mt-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Available Facilities</h2>
            <p className="text-xs text-white/35 mt-1">Select a facility and book your slot instantly</p>
          </div>
          <Link href="/facility" className="inline-flex items-center gap-1 text-xs font-bold text-[#FF7B00] hover:text-[#e06f00] transition-colors">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED.map((f) => (
            <Link key={f.name} href="/facility"
              className="bg-[#111] rounded-2xl p-5 border border-white/[0.07] hover:border-[#FF7B00]/40 hover:shadow-[0_0_30px_rgba(255,123,0,0.08)] hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-[#FF7B00]/10 flex items-center justify-center mb-4">
                <f.Icon className="w-5 h-5 text-[#FF7B00]" />
              </div>
              <div className="font-bold text-white text-sm mb-1">{f.name}</div>
              <div className="text-xs text-white/40 mb-3">{f.category}</div>
              <div className="flex items-center justify-between">
                {f.minPlayers ? (
                  <span className="text-xs font-semibold text-[#FF7B00] bg-[#FF7B00]/10 px-2 py-0.5 rounded-full">
                    Min {f.minPlayers} players
                  </span>
                ) : (
                  <span className="text-xs text-white/30">{f.slots}</span>
                )}
                <span className="text-[#FF7B00] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Book →
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/[0.06]">
                <span className="text-[0.65rem] text-white/30">06:00 – 22:00 daily</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 mt-14">
        <div className="bg-[#111] rounded-3xl p-10 border border-white/[0.07]">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">HOW IT WORKS</h2>
            <p className="text-xs text-white/35 mt-1.5">Book your facility in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-5 left-[12.5%] right-[12.5%] h-px bg-white/10 z-0" />
            {STEPS.map((s) => (
              <div key={s.num} className="flex flex-col items-center text-center relative z-10">
                <div className={`w-10 h-10 rounded-full ${s.bg} ${s.numColor} text-sm font-extrabold flex items-center justify-center mb-4 shadow-btn`}>
                  {s.num}
                </div>
                <div className="font-bold text-white text-sm mb-2">{s.label}</div>
                <div className="text-xs text-white/40 leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rules Banner ─────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 mt-8 mb-20">
        <div className="bg-[#FF7B00]/8 border border-[#FF7B00]/20 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            "Booking hours: 06:00 – 22:00 daily",
            "Max 3-hour bookings, full hours only",
            "Co-working & Canteen: @kmitl.ac.th required",
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-[#FF7B00] shrink-0" />
              <span className="text-xs text-white/60 font-medium">{text}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
