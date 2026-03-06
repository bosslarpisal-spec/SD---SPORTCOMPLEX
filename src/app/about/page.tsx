"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import PageBackground from "@/components/PageBackground";
import { Trophy, Users, UtensilsCrossed, Award, Clock, Shield, Mail, MapPin, Zap, Smartphone, Lock, ClipboardList } from "lucide-react";

const FACILITIES = [
  { Icon: Trophy,          label: "Sports Courts",    desc: "Football fields, volleyball courts, badminton courts, and table tennis tables for team booking." },
  { Icon: Users,           label: "Co-working Rooms", desc: "Private study rooms for KMITL students. Requires @kmitl.ac.th email." },
  { Icon: UtensilsCrossed, label: "Canteen Tables",   desc: "Reserve tables at the Engineering or Central Canteen in advance. @kmitl.ac.th required." },
  { Icon: Award,           label: "Membership",       desc: "Student privileges and semester passes for frequent facility users." },
];

const RULES = [
  { Icon: Clock,  title: "Booking Hours",      desc: "All facilities bookable 06:00–22:00 daily. Full hours only — no partial slots." },
  { Icon: Shield, title: "Max Duration",        desc: "Each booking is limited to a maximum of 3 hours per session." },
  { Icon: Mail,   title: "Email Restriction",   desc: "Co-working rooms and canteen tables require a verified @kmitl.ac.th email." },
  { Icon: Trophy, title: "Sports Confirmation", desc: "Sports bookings require 50%+ of invited players to accept within 1 hour, or the slot is released." },
];

const FEATURES = [
  { Icon: Zap,           label: "Instant Booking" },
  { Icon: Smartphone,    label: "Mobile Friendly" },
  { Icon: Lock,          label: "Secure & Private" },
  { Icon: ClipboardList, label: "Real-time Slots" },
];

const FAQS = [
  { q: "Who can book facilities?",           a: "All registered KMITL students and staff with an active account can book sports courts. Co-working and canteen require @kmitl.ac.th email." },
  { q: "How far in advance can I book?",     a: "You can book facilities up to 7 days in advance through the facility browser." },
  { q: "What is the cancellation policy?",   a: "Reservations can be cancelled at any time from My Reservations. The slot is released immediately and the booking is removed after 15 minutes." },
  { q: "Are there any fees?",                a: "Most facility bookings are free for students. Some memberships may require a small fee payable at the front desk." },
];

export default function AboutPage() {
  return (
    <PageBackground>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#FF7B00]/20 border border-[#FF7B00]/30 text-[#FF7B00] text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
          King Mongkut&apos;s Institute of Technology Ladkrabang
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-[1.1]">
          About the<br /><span className="text-[#FF7B00]">Reservation System</span>
        </h1>
        <p className="text-sm md:text-base text-white/50 max-w-xl mx-auto leading-relaxed mb-8">
          A modern booking platform that eliminates paperwork and queues — reserve sports courts,
          co-working spaces, and canteen tables in seconds.
        </p>
        <Link href="/facility"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#FF7B00] hover:bg-[#e06f00] text-white text-sm font-bold rounded-xl transition-all shadow-btn">
          Explore Facilities
        </Link>
      </section>

      {/* What you can book */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-extrabold text-white tracking-tight mb-6">What You Can Book</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FACILITIES.map((f) => (
            <div key={f.label} className="bg-[#111] rounded-2xl p-6 border border-white/[0.07] hover:border-[#FF7B00]/30 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-[#FF7B00]/10 flex items-center justify-center mb-4">
                <f.Icon className="w-5 h-5 text-[#FF7B00]" />
              </div>
              <div className="font-bold text-white text-sm mb-1.5">{f.label}</div>
              <div className="text-xs text-white/40 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission + features */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="bg-[#111] rounded-3xl p-8 md:p-10 border border-white/[0.07]">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight mb-4">Our Mission</h2>
              <p className="text-sm text-white/45 leading-relaxed mb-4">
                We believe access to quality facilities should be effortless. Book any campus
                resource in seconds — from your phone or laptop, no paperwork required.
              </p>
              <p className="text-sm text-white/45 leading-relaxed">
                Built as a Software Engineering project at KMITL&apos;s ISE programme.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3">
                  <f.Icon className="w-4 h-4 text-[#FF7B00] shrink-0" />
                  <span className="text-xs font-semibold text-white/70">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Booking Rules */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="bg-[#111] rounded-3xl p-8 md:p-10 border border-white/[0.07]">
          <h2 className="text-xl font-extrabold text-white tracking-tight mb-8">Booking Rules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {RULES.map((r) => (
              <div key={r.title} className="flex gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#FF7B00]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <r.Icon className="w-4 h-4 text-[#FF7B00]" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm mb-1">{r.title}</div>
                  <div className="text-xs text-white/40 leading-relaxed">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-extrabold text-white tracking-tight mb-6">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq) => (
            <div key={faq.q} className="bg-[#111] rounded-2xl p-6 border border-white/[0.07]">
              <h3 className="text-sm font-extrabold text-white mb-2">{faq.q}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Location + Contact */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-4 bg-[#FF7B00]/8 border border-[#FF7B00]/20 rounded-2xl p-6">
            <div className="w-9 h-9 rounded-xl bg-[#FF7B00]/15 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-[#FF7B00]" />
            </div>
            <div>
              <div className="font-bold text-white text-sm mb-1">Location</div>
              <div className="text-xs text-white/45 leading-relaxed">
                King Mongkut&apos;s Institute of Technology Ladkrabang<br />
                1 Chalongkrung Rd, Lat Krabang, Bangkok 10520
              </div>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-[#FF7B00]/8 border border-[#FF7B00]/20 rounded-2xl p-6">
            <div className="w-9 h-9 rounded-xl bg-[#FF7B00]/15 flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="w-4 h-4 text-[#FF7B00]" />
            </div>
            <div>
              <div className="font-bold text-white text-sm mb-1">Need Help?</div>
              <div className="text-xs text-white/45 leading-relaxed">
                Contact the KMITL IT Helpdesk or visit<br />
                the Student Affairs office on campus.
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageBackground>
  );
}
