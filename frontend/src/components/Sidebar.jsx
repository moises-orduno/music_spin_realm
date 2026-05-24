import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageSquare, ThumbsUp, Search, Store, Users, FolderOpen, Star, Clock, Target, UserCheck, Plus, AudioLines } from "lucide-react";

const mainNav = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/debates", label: "Debates", icon: MessageSquare },
  { to: "/tops", label: "Top 10s", icon: ThumbsUp },
  { to: "/hunt", label: "Hunt", icon: Search },
  { to: "/marketplace", label: "Marketplace", icon: Store },
  { to: "/people", label: "People", icon: Users },
  { to: "/collection", label: "Collection", icon: FolderOpen },
];

const shortcuts = [
  { to: "/tops", label: "My Top 10", icon: Star },
  { to: "/collection", label: "My Collection", icon: Clock },
  { to: "/hunt", label: "My Hunt List", icon: Target },
  { to: "/people", label: "Following", icon: UserCheck },
];

export default function Sidebar() {
  return (
    <aside className="w-[230px] shrink-0 px-4 py-7 border-r border-[var(--border)] min-h-screen flex flex-col sticky top-0" data-testid="sidebar">
      {/* Brand */}
      <NavLink to="/" className="mb-9 flex items-center gap-2.5 px-2" data-testid="brand-logo">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
          <AudioLines size={17} className="text-white" />
        </div>
        <div className="font-serif text-[20px] leading-none tracking-tight">SpinRealm</div>
      </NavLink>

      {/* Main nav */}
      <nav className="flex flex-col gap-0.5 mb-7" data-testid="sidebar-main-nav">
        {mainNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            data-testid={`nav-${label.toLowerCase().replace(/\s/g, "-")}`}
            className={({ isActive }) =>
              `nav-item flex items-center gap-3 px-3 py-2.5 text-[13.5px] ${isActive ? "active" : ""}`
            }
          >
            <Icon size={16.5} strokeWidth={1.7} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Start a Debate CTA */}
      <NavLink
        to="/debates/new"
        className="btn-accent rounded-xl px-3 py-3 text-[13px] flex items-center justify-center gap-2 mb-7"
        data-testid="start-debate-btn"
      >
        <Plus size={15} /> Start a Debate
      </NavLink>

      {/* Shortcuts */}
      <div className="mb-4">
        <div className="text-[10px] tracking-[0.15em] text-[var(--text-dim)] uppercase px-3 mb-2">Your Library</div>
        <nav className="flex flex-col gap-0.5">
          {shortcuts.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              data-testid={`shortcut-${label.toLowerCase().replace(/\s/g, "-")}`}
              className="nav-item flex items-center gap-3 px-3 py-2 text-[12.5px]"
            >
              <Icon size={14.5} strokeWidth={1.6} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User mini card */}
      <NavLink to="/profile/analogmind" className="mt-auto card-panel p-3 flex items-center gap-3 hover:border-[var(--accent)]/40 transition" data-testid="user-mini-card">
        <div className="w-10 h-10 rounded-full shrink-0" style={{ background: "radial-gradient(circle at 30% 30%, #c2a876, #1a1612)" }} />
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-medium truncate">analogmind</div>
          <div className="text-[10.5px] text-[var(--text-muted)]">View profile →</div>
        </div>
      </NavLink>
    </aside>
  );
}

