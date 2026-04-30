import React from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import RightPanel from "./RightPanel";

export default function Layout({ children, showRightPanel = true }) {
  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <div className="flex-1 flex min-w-0">
        <div className="flex-1 min-w-0 flex flex-col">
          <TopNav />
          <main className="flex-1 px-8 py-6">{children}</main>
        </div>
        {showRightPanel && <RightPanel />}
      </div>
    </div>
  );
}
