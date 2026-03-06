"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { ClipboardList, LogOut, Menu, X, ChevronDown, UserCircle } from "lucide-react";

const NAV_LINKS = [
  { label: "Home",           href: "/home" },
  { label: "My Reservation", href: "/my-reservation" },
  { label: "About Us",       href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const userEmail   = session?.user?.email ?? "";
  const userInitial = userEmail.charAt(0).toUpperCase();
  const userImage   = (session?.user as any)?.image as string | undefined;

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/home" className="text-xl font-extrabold text-white tracking-[0.12em] shrink-0">
          KMITL
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150
                ${pathname === l.href
                  ? "text-[#FF7B00] bg-[#FF7B00]/10"
                  : "text-white/60 hover:text-white hover:bg-white/[0.07]"}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* User dropdown */}
        <div className="hidden md:flex items-center gap-3 ml-auto relative">
          <button onClick={() => setDropOpen(!dropOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white/70 hover:text-white hover:bg-white/[0.07] transition-all">
            {userImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userImage} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <span className="w-7 h-7 rounded-full bg-[#FF7B00] text-white text-xs font-bold flex items-center justify-center">
                {userInitial || "?"}
              </span>
            )}
            <span className="max-w-[160px] truncate">{userEmail || "Guest"}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropOpen ? "rotate-180" : ""}`} />
          </button>

          {dropOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-[#141414] rounded-xl shadow-card border border-white/[0.07] py-1 z-50">
              <Link href="/my-reservation" onClick={() => setDropOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.05] font-medium transition-colors">
                <ClipboardList className="w-4 h-4" /> My Reservations
              </Link>
              <Link href="/profile" onClick={() => setDropOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.05] font-medium transition-colors">
                <UserCircle className="w-4 h-4" /> User Profile
              </Link>
              <hr className="my-1 border-white/[0.06]" />
              <button onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/[0.07] transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#0d0d0d] px-6 py-3 flex flex-col gap-1">
          <div className="px-3 py-2 text-xs font-semibold text-white/30 truncate">{userEmail}</div>
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors
                ${pathname === l.href ? "text-[#FF7B00] bg-[#FF7B00]/10" : "text-white/60 hover:text-white hover:bg-white/[0.07]"}`}>
              {l.label}
            </Link>
          ))}
          <Link href="/profile" onClick={() => setMenuOpen(false)}
            className="px-3 py-2.5 rounded-lg text-sm font-semibold text-white/60 hover:text-white hover:bg-white/[0.07] transition-colors">
            User Profile
          </Link>
          <hr className="my-2 border-white/[0.06]" />
          <button onClick={handleSignOut}
            className="px-3 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 rounded-lg text-left transition-colors">
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
