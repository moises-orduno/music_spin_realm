import React from "react";

// Reusable album cover component with gradient + title overlay
export function AlbumCover({ title, artist, gradient, size = "full", className = "", showLabel = true }) {
  return (
    <div
      className={`cover cover-placeholder ${className}`}
      style={{
        background: gradient,
        width: size === "full" ? "100%" : size,
        aspectRatio: "1 / 1",
      }}
    >
      {showLabel && (
        <div className="text-center leading-tight">
          <div className="font-serif text-[13px] opacity-90">{title}</div>
          {artist && <div className="text-[9px] mt-1 opacity-60 font-sans">{artist}</div>}
        </div>
      )}
    </div>
  );
}

export function Chip({ children, active = false }) {
  return (
    <button
      className={`px-4 py-1.5 rounded-full text-[12px] border transition-all ${
        active
          ? "bg-[var(--accent)] text-[#17160f] border-[var(--accent)] font-medium"
          : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--border-2)]"
      }`}
    >
      {children}
    </button>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div className="text-[11px] tracking-[0.18em] text-[var(--text-muted)] uppercase">{children}</div>
      {action}
    </div>
  );
}
