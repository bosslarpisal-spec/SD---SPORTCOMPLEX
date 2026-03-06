import React from "react";

interface PageBackgroundProps {
  children: React.ReactNode;
}

export default function PageBackground({ children }: PageBackgroundProps) {
  return (
    <div
      className="min-h-screen font-sans relative"
      style={{
        backgroundImage: "url('/bg-artwork.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/70 z-0" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
