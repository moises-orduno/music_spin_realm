import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageSquare, ThumbsUp, Search, Store, Users, FolderOpen, Star, Clock, Target, UserCheck } from "lucide-react";

const mainNav = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/debates", label: "Debates", icon: MessageSquare },
  { to: "/tops", label: "Tops", icon: ThumbsUp },
  { to: "/hunt", label: "Hunt Requests", icon: Search },
  { to: "/marketplace", label: "Marketplace", icon: Store },
  { to: "/people", label: "People", icon: Users },
  { to: "/collection", label: "Collections", icon: FolderOpen },
];

const shortcuts = [
  { to: "/tops", label: "My Top 10", icon: Star },
  { to: "/collection", label: "My Collection", icon: Clock },
  { to: "/hunt", label: "My Hunt List", icon: Target },
  { to: "/people", label: "Following", icon: UserCheck },
];

export default function Sidebar() {
  const loc = useLocation();
  return (
    <aside className="w-[220px] shrink-0 px-5 py-8 border-r border-[var(--border)] min-h-screen flex flex-col sticky top-0" data-testid="sidebar">
      {/* Brand */}
      <div className="mb-10">
        <div className="font-serif text-[22px] leading-[1.05] font-light tracking-tight" data-testid="brand-logo">
          SOME SORT<br/>OF EAY
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-1 mb-8" data-testid="sidebar-main-nav">
        {mainNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            data-testid={`nav-${label.toLowerCase().replace(/\s/g, "-")}`}
            className={({ isActive }) =>
              `nav-item flex items-center gap-3 px-3 py-2.5 text-[14px] ${isActive ? "active" : ""}`
            }
          >
            <Icon size={17} strokeWidth={1.6} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Shortcuts */}
      <div className="mb-4">
        <div className="text-[10px] tracking-[0.15em] text-[var(--text-dim)] uppercase px-3 mb-3">Your Shortcuts</div>
        <nav className="flex flex-col gap-1">
          {shortcuts.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              data-testid={`shortcut-${label.toLowerCase().replace(/\s/g, "-")}`}
              className="nav-item flex items-center gap-3 px-3 py-2 text-[13px]"
            >
              <Icon size={15} strokeWidth={1.6} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Promo card */}
      <div className="mt-auto pt-6">
        <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--panel)]" data-testid="sidebar-promo">
          <div
            className="h-[110px] grain"
            style={{ background: "radial-gradient(circle at 30% 40%, #3a2a1a 0%, #0a0705 80%)" }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-[#2a2620]" style={{ background: "radial-gradient(circle, #1a1714 30%, #0a0907 60%)" }}/>
            </div>
          </div>
          <div className="p-4">
            <div className="font-serif text-[17px] leading-tight mb-1">From wishlist<br/>to shelf.</div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-4">
              We help you get the records of your dreams.
            </p>
            <button className="btn-accent w-full px-3 py-2 rounded-full text-[12px]" data-testid="sidebar-join-circle-btn">
              Join Collector Circle
            </button>
            <div className="text-center text-[10.5px] text-[var(--text-dim)] mt-3">
              Already a member? <span className="text-[var(--text-muted)] underline decoration-dotted cursor-pointer">Sign in</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
