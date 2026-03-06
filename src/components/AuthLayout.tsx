import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="page-bg">
      {/* Site Header */}
      <header className="text-center mb-7">
        <h1 className="text-[2.6rem] font-extrabold text-white tracking-[0.12em] leading-none mb-1.5">
          KMITL
        </h1>
        <p className="text-[0.72rem] font-semibold text-white/40 tracking-[0.2em] uppercase">
          Facility Reservation System
        </p>
      </header>

      {/* Page Content (card) */}
      {children}

      {/* Footer */}
      <footer className="mt-7 text-[0.68rem] font-medium text-white/20 tracking-widest uppercase text-center">
        King Mongkut&apos;s Institute of Technology Ladkrabang
      </footer>
    </div>
  );
}
