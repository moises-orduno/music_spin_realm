import React, { createContext, useContext, useState } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import RightPanel from "./RightPanel";
import { X } from "lucide-react";

export const DrawerContext = createContext({ open: false, setOpen: () => {} });
export const useDrawer = () => useContext(DrawerContext);

export default function Layout({ children, showRightPanel = true }) {
  const [open, setOpen] = useState(false);

  return (
    <DrawerContext.Provider value={{ open, setOpen }}>
      <div className="flex min-h-screen bg-[var(--bg)]">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile drawer overlay */}
        {open && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 lg:hidden fade-in-up"
            onClick={() => setOpen(false)}
            data-testid="drawer-overlay"
          />
        )}
        <div
          className={`fixed top-0 left-0 z-50 h-full lg:hidden transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          data-testid="mobile-drawer"
        >
          <div className="relative bg-[var(--bg)] h-full">
            <button
              className="absolute top-5 right-4 w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] z-10"
              onClick={() => setOpen(false)}
              data-testid="drawer-close-btn"
            >
              <X size={14} />
            </button>
            <Sidebar />
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 flex min-w-0">
          <div className="flex-1 min-w-0 flex flex-col">
            <TopNav />
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 lg:py-6">{children}</main>
            {/* Mobile right panel at bottom */}
            {showRightPanel && (
              <div className="xl:hidden border-t border-[var(--border)]">
                <RightPanel mobile />
              </div>
            )}
          </div>
          {showRightPanel && (
            <div className="hidden xl:block">
              <RightPanel />
            </div>
          )}
        </div>
      </div>
    </DrawerContext.Provider>
  );
}
