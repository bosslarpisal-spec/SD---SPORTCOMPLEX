"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

const NAV_LINKS = [
  { label: "Home Page",      href: "/home" },
  { label: "My Reservation", href: "/my-reservation" },
  { label: "About Us",       href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const userEmail = session?.user?.email ?? "";
  const userInitial = userEmail.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/home" className="text-xl font-extrabold text-neutral-900 tracking-[0.1em] shrink-0">
          KMITL
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150
                ${pathname === l.href
                  ? "text-[#3b6ef6] bg-[#eef2ff]"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* User dropdown */}
        <div className="hidden md:flex items-center gap-3 ml-auto relative">
          <button
            onClick={() => setDropOpen(!dropOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-[#3b6ef6] text-white text-xs font-bold flex items-center justify-center">
              {userInitial || "?"}
            </span>
            <span className="max-w-[180px] truncate">{userEmail || "Guest"}</span>
            <svg className={`w-3.5 h-3.5 transition-transform ${dropOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropOpen && (
            <div className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-neutral-100 py-1 z-50">
              <Link href="/my-reservation" onClick={() => setDropOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 font-medium">
                📋 My Reservations
              </Link>
              <hr className="my-1 border-neutral-100" />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-medium"
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-lg hover:bg-neutral-100" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white px-6 py-3 flex flex-col gap-1">
          <div className="px-3 py-2 text-xs font-semibold text-neutral-400 truncate">{userEmail}</div>
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors
                ${pathname === l.href ? "text-[#3b6ef6] bg-[#eef2ff]" : "text-neutral-700 hover:bg-neutral-50"}`}>
              {l.label}
            </Link>
          ))}
          <hr className="my-2 border-neutral-100" />
          <button onClick={handleSignOut}
            className="px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-lg text-left">
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
