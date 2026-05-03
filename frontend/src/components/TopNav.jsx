import React from "react";
import { NavLink } from "react-router-dom";
import { Search, Bell, MessageCircle, Menu } from "lucide-react";
import { useDrawer } from "./Layout";

const topLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/debates", label: "Debates" },
  { to: "/tops", label: "Tops" },
  { to: "/hunt", label: "Hunt" },
  { to: "/collection", label: "Collection" },
  { to: "/people", label: "People" },
];

export default function TopNav() {
  const { setOpen } = useDrawer();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[rgba(12,11,10,0.85)] border-b border-[var(--border)]" data-testid="top-nav">
      <div className="flex items-center gap-3 md:gap-5 px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Mobile hamburger */}
        <button
          className="lg:hidden w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center btn-ghost shrink-0"
          onClick={() => setOpen(true)}
          data-testid="menu-toggle"
        >
          <Menu size={16} strokeWidth={1.6} />
        </button>

        {/* Mobile brand */}
        <div className="lg:hidden font-serif text-[15px] leading-[1] font-light shrink-0">
          SOME SORT<br/>OF EAY
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-[420px] hidden sm:block">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" strokeWidth={1.8} />
          <input
            data-testid="top-search-input"
            placeholder="Search albums, artists, debates..."
            className="w-full bg-[var(--panel)] border border-[var(--border)] rounded-full pl-10 pr-4 py-2.5 text-[13px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--border-2)] transition-colors"
          />
        </div>

        {/* Mobile search icon */}
        <button className="sm:hidden ml-auto w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center btn-ghost" data-testid="mobile-search-btn">
          <Search size={15} strokeWidth={1.8} />
        </button>

        {/* Nav links (desktop) */}
        <nav className="items-center gap-9 ml-auto hidden md:flex" data-testid="top-nav-links">
          {topLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              data-testid={`top-nav-${label.toLowerCase()}`}
              className={({ isActive }) => `top-nav-item text-[13px] pb-1 ${isActive ? "active" : ""}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3 md:ml-6">
          <button className="w-9 h-9 rounded-full border border-[var(--border)] items-center justify-center btn-ghost hidden sm:flex" data-testid="notifications-btn">
            <Bell size={15} strokeWidth={1.6} />
          </button>
          <button className="w-9 h-9 rounded-full border border-[var(--border)] items-center justify-center btn-ghost hidden sm:flex" data-testid="messages-btn">
            <MessageCircle size={15} strokeWidth={1.6} />
          </button>
          <div
            className="w-9 h-9 rounded-full border border-[var(--border-2)] shrink-0"
            style={{ background: "linear-gradient(135deg, #c2a876, #3a2a1a)" }}
            data-testid="user-avatar"
          />
        </div>
      </div>
    </header>
  );
}
