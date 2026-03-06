"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";

const CATEGORIES = [
  { id: "sports",     label: "Sports",      emoji: "⚽", desc: "Football, Badminton, Volleyball & more", color: "bg-blue-50 border-blue-100"   },
  { id: "coworking",  label: "Co-working",  emoji: "💻", desc: "Private rooms & open tables",           color: "bg-green-50 border-green-100" },
  { id: "gym",        label: "Gym & Pool",  emoji: "🏋️", desc: "Gym & swimming pool info & fees",       color: "bg-orange-50 border-orange-100"},
  { id: "membership", label: "Membership",  emoji: "🎫", desc: "Student & staff member privileges",     color: "bg-purple-50 border-purple-100"},
];

const STEPS = [
  { num: "1", label: "Select Category", desc: "Choose Sports, Co-working, Gym & Pool, or Membership", color: "bg-sky-500"     },
  { num: "2", label: "Choose Facility", desc: "Select the specific facility you want to reserve",     color: "bg-orange-500"  },
  { num: "3", label: "Fill Details",    desc: "Enter date, time, participants and invite friends",    color: "bg-green-500"   },
  { num: "4", label: "Confirm",         desc: "Review and confirm your reservation",                  color: "bg-fuchsia-500" },
];

const FEATURED = [
  { name: "Football Field",    category: "Sports",    minPlayers: 6,  img: "⚽" },
  { name: "Volleyball Court",  category: "Sports",    minPlayers: 6,  img: "🏐" },
  { name: "Badminton Court",   category: "Sports",    minPlayers: 4,  img: "🏸" },
  { name: "Table Tennis",      category: "Sports",    minPlayers: 2,  img: "🏓" },
  { name: "Private Room",      category: "Co-working",minPlayers: null, img: "🚪" },
  { name: "Fitness Center",    category: "Gym & Pool",minPlayers: null, img: "🏋️" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f4f4f4] font-sans">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative pt-16 h-[460px] flex items-center justify-center overflow-hidden">
        <Image
          src="/campus-hero.jpg"
          alt="KMITL Campus"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Lighter overlay so the campus photo stays clear */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3 drop-shadow-lg leading-tight">
            KMITL Facility Reservation System
          </h1>
          <p className="text-sm md:text-base text-white/80 font-medium tracking-wide">
            Reserve facilities at King Mongkut&apos;s Institute of Technology Ladkrabang
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link href="/facility"
              className="px-6 py-3 bg-[#3b6ef6] hover:bg-[#2a5ce0] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-900/30">
              Browse Facilities
            </Link>
            <Link href="/my-reservation"
              className="px-6 py-3 bg-white/15 hover:bg-white/25 text-white text-sm font-bold rounded-xl transition-all backdrop-blur border border-white/25">
              My Reservations
            </Link>
          </div>
        </div>
      </section>

      {/* ── Category Cards ───────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/facility?category=${cat.id}`}
              className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ${cat.color}`}
            >
              <div className="text-4xl">{cat.emoji}</div>
              <div className="text-center">
                <div className="text-sm font-extrabold text-neutral-800 tracking-wide uppercase">{cat.label}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{cat.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Facilities ──────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 mt-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">Available Facilities</h2>
          <Link href="/facility" className="text-sm font-semibold text-[#3b6ef6] hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED.map((f) => (
            <Link key={f.name} href="/facility"
              className="bg-white rounded-2xl p-5 border border-neutral-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-2xl mb-4">{f.img}</div>
              <div className="font-bold text-neutral-900 text-sm mb-1">{f.name}</div>
              <div className="text-xs text-neutral-400 mb-3">{f.category}</div>
              {f.minPlayers && (
                <div className="text-xs font-medium text-[#3b6ef6] bg-blue-50 px-2 py-0.5 rounded-full inline-block mb-2">
                  Min {f.minPlayers} players
                </div>
              )}
              <div className="flex justify-end">
                <span className="text-[#3b6ef6] text-xs font-semibold group-hover:underline">Book →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 mt-12 mb-16">
        <div className="bg-white rounded-3xl p-10 border border-neutral-100 shadow-sm">
          <h2 className="text-2xl font-extrabold text-neutral-900 text-center tracking-tight mb-10">HOW IT WORKS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-5 left-[12.5%] right-[12.5%] h-px bg-neutral-200 z-0" />
            {STEPS.map((s) => (
              <div key={s.num} className="flex flex-col items-center text-center relative z-10">
                <div className={`w-10 h-10 rounded-full ${s.color} text-white text-sm font-extrabold flex items-center justify-center mb-4 shadow-md`}>
                  {s.num}
                </div>
                <div className="font-bold text-neutral-900 text-sm mb-2">{s.label}</div>
                <div className="text-xs text-neutral-500 leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
