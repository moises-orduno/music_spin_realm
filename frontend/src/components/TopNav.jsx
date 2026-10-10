import React from "react";
import { NavLink } from "react-router-dom";
import { Search, Bell, MessageCircle, Menu } from "lucide-react";
import { useDrawer } from "./Layout";
import { getCurrentUser, logout } from "../services/authService";
import { useNavigate } from "react-router-dom";

import { useState, useRef, useEffect } from "react";

const topLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/debates", label: "Debates" },
  { to: "/topLists", label: "Tops" },
  { to: "/hunt", label: "Hunt" },
  { to: "/collection", label: "Collection" },
  { to: "/people", label: "People" },
];

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogoutClick = ()=>{
    logout();
    navigate(`/`);
  }

  return (
    <div
      ref={menuRef}
      className="relative hidden sm:block"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] text-[13px] hover:bg-[var(--panel)] transition"
      >
        {user.display_name}

        <span
          className={`text-[10px] transition-transform ${open ? "rotate-180" : ""
            }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-lg overflow-hidden z-50">
          <NavLink
            to={`/profile`}
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-[13px] hover:bg-[var(--accent-soft)] transition"
          >
            Profile
          </NavLink>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              handleLogoutClick();
            }}
            className="w-full text-left px-4 py-3 text-[13px] hover:bg-[var(--accent-soft)] transition"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function TopNav() {
  const { setOpen } = useDrawer();
  const user = getCurrentUser();
  const navigate = useNavigate();

  const handleSearchAlbumClick = () => {

    navigate(
      "/listsSearch",
      {
        state: {
          returnTo: "/albums/",
          storageKey: `album-detail`,
        },
      }
    );
  };

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
          SOME SORT<br />OF EAY
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-[420px] hidden sm:block">
          <button
            type="button"
            onClick={handleSearchAlbumClick}
            data-testid="open-search-link"
            className="flex items-center gap-3 w-full h-12 px-5 bg-[var(--panel)] border border-[var(--border)] rounded-full text-[13px] text-[var(--text-muted)] hover:border-[var(--border-2)] transition-colors text-left"
          >
            <Search
              size={17}
              className="shrink-0 text-[var(--text-dim)]"
              strokeWidth={1.8}
            />

            <span className="whitespace-nowrap">
              Search albums, artists...
            </span>
          </button>
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

          {!user ? (
            <NavLink
              to="/login"
              data-testid="login-link"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-full border border-[var(--accent)]/40 text-[var(--accent-2)] text-[12.5px] hover:bg-[var(--accent-soft)] transition"
            >
              Log in
            </NavLink>
          ) : (
            <UserMenu user={user} onLogout={logout} />
          )}

          <button
            className="w-9 h-9 rounded-full border border-[var(--border)] items-center justify-center btn-ghost hidden sm:flex"
            data-testid="notifications-btn"
          >
            <Bell size={15} strokeWidth={1.6} />
          </button>

          <button
            className="w-9 h-9 rounded-full border border-[var(--border)] items-center justify-center btn-ghost hidden sm:flex"
            data-testid="messages-btn"
          >
            <MessageCircle size={15} strokeWidth={1.6} />
          </button>

          <div
            className="w-9 h-9 rounded-full border border-[var(--border-2)] shrink-0 overflow-hidden"
            data-testid="user-avatar"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: "linear-gradient(135deg, #c2a876, #3a2a1a)",
                }}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
