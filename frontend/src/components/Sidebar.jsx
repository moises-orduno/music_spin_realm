import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageSquare, ThumbsUp, Search, 
  Store, Users, FolderOpen, Star, Clock, 
  Target, UserCheck, ChevronDown, AudioLines, Truck, ShoppingCart } from "lucide-react";
import React, { useState } from "react";
import { getCurrentUser } from "../services/authService";

const mainNav = [
  {
    to: "/", label: "Home", icon: Home, end: true,
  },
  {
    to: "/debates", label: "Debates", icon: MessageSquare,
  },
  {
    label: "Top Lists",
    icon: ThumbsUp,
    children: [
      { to: "/topLists", label: "Discover", end: true },
      { to: "/topLists/mine", label: "My Lists", end: true },
      { to: "/topLists/liked", label: "Liked", end: true },
      { to: "/topLists/saved", label: "Saved", end: true },
    ],
  },
  {
    to: "/hunt", label: "Hunt", icon: Search,
  },
  {
    to: "/marketplace", label: "Marketplace", icon: Store,
  },
  {
    label: "People",
    icon: Users,
    children: [
      { to: "/people", label: "Discover", end: true },
      { to: "/people/following", label: "Following", end: true },
      { to: "/people/followed", label: "Followed", end: true },
    ],
  },
  {
    to: "/collection", label: "My Collection", icon: FolderOpen,
  },
  {
    label: "Orders",
    icon: Truck,
    children: [
      { to: "/orders/completed", label: "Completed", end: true },
      { to: "/orders/active", label: "Active", end: true },
      { to: "/orders/cancelled", label: "Cancelled", end: true },
    ],
  },
];

const shortcuts = [
  { to: "/topLists", label: "My Top 10", icon: Star },
  { to: "/shoppingCart", label: "My Shopping Cart", icon: ShoppingCart },
  { to: "/hunt", label: "My Hunt List", icon: Target },
  { to: "/people", label: "Following", icon: UserCheck },
];

function NavSection({ item, active }) {
  const [manuallyOpen, setManuallyOpen] = useState(false);

  const Icon = item.icon;

  const open = active || manuallyOpen;

   return (
    <div>
      <button
        type="button"
        onClick={() => setManuallyOpen((value) => !value)}
        className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 text-[13.5px] ${
          active ? "active" : ""
        }`}
      >
        <Icon size={16.5} strokeWidth={1.7} />

        <span className="flex-1 text-left">
          {item.label}
        </span>

        <ChevronDown
          size={15}
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="ml-9 mt-0.5 mb-1 flex flex-col">
          {item.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              end={child.end}
              className={({ isActive }) =>
                `px-3 py-2 text-[12.5px] rounded-md transition-colors ${
                  isActive
                    ? "text-[var(--foreground)] font-medium"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {

  const location = useLocation();

  const isSectionActive = (item) => {
    if (!item.children) return false;

    return item.children.some(
      (child) =>
        location.pathname === child.to ||
        location.pathname.startsWith(`${child.to}/`)
    );
  };

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
      <nav
        className="flex flex-col gap-0.5 mb-7"
        data-testid="sidebar-main-nav"
      >
        {mainNav.map((item) => {
          if (item.children) {
            return (
              <NavSection
                key={item.label}
                item={item}
                active={isSectionActive(item)}
              />
            );
          }

          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-testid={`nav-${item.label
                .toLowerCase()
                .replace(/\s/g, "-")}`}
              className={({ isActive }) =>
                `nav-item flex items-center gap-3 px-3 py-2.5 text-[13.5px] ${isActive ? "active" : ""
                }`
              }
            >
              <Icon size={16.5} strokeWidth={1.7} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>


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
      <NavLink to="/profile" className="mt-auto card-panel p-3 flex items-center gap-3 hover:border-[var(--accent)]/40 transition" data-testid="user-mini-card">
        <div className="w-10 h-10 rounded-full shrink-0" style={{ background: "radial-gradient(circle at 30% 30%, #c2a876, #1a1612)" }} />
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-medium truncate">{getCurrentUser()?getCurrentUser().username:""}</div>
          <div className="text-[10.5px] text-[var(--text-muted)]">View profile →</div>
        </div>
      </NavLink>
    </aside>
  );
}

