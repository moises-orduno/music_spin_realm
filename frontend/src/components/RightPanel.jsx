import React from "react";
import { ArrowRight, Crown, ArrowUpRight, Cake, BadgeCheck } from "lucide-react";
import { hunting, rareFinds } from "../data/mock";

function SectionHeader({ title, link = "View all" }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-[10px] tracking-[0.18em] text-[var(--text-dim)] uppercase">{title}</div>
      <button className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--accent)] transition-colors">
        {link} <ArrowRight size={12} />
      </button>
    </div>
  );
}

export default function RightPanel() {
  return (
    <aside className="w-[300px] shrink-0 px-6 py-6 space-y-7 border-l border-[var(--border)]" data-testid="right-panel">
      {/* Currently Hunting */}
      <div data-testid="currently-hunting">
        <SectionHeader title="Currently Hunting" />
        <div className="space-y-4">
          {hunting.slice(0, 4).map((h) => (
            <div key={h.id} className="flex gap-3 items-start group cursor-pointer" data-testid={`hunt-item-${h.id}`}>
              <div
                className="cover cover-placeholder w-[54px] h-[54px] shrink-0"
                style={{ background: h.cover }}
              >
                <span className="opacity-70">{h.title}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate">{h.title}</div>
                <div className="text-[11px] text-[var(--text-muted)] truncate">{h.artist}</div>
                <div className="text-[10px] text-[var(--text-dim)] mt-0.5 truncate">{h.detail}</div>
                <div className="text-[10.5px] text-[var(--accent)] mt-1">{h.price}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[13px] font-medium">{h.collectors}</div>
                <div className="text-[9.5px] text-[var(--text-dim)]">collectors</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collector Circle */}
      <div
        className="rounded-xl p-5 relative overflow-hidden border border-[#4a3660]"
        style={{ background: "linear-gradient(155deg, #3b2a4f 0%, #1e1430 100%)" }}
        data-testid="collector-circle-card"
      >
        <div className="flex items-center gap-2 mb-4">
          <Crown size={14} className="text-[var(--accent)]" />
          <div className="text-[10px] tracking-[0.18em] text-[var(--accent)] uppercase font-medium">Collector Circle</div>
        </div>
        <ul className="space-y-2.5 mb-5 text-[12px]">
          {[
            { icon: ArrowUpRight, text: "Priority hunt requests" },
            { icon: ArrowRight, text: "Early access to rare finds" },
            { icon: Cake, text: "Birthday vinyl" },
            { icon: BadgeCheck, text: "Collector badge" },
          ].map(({ icon: Ic, text }, i) => (
            <li key={i} className="flex items-center gap-2.5 text-[var(--text)]/90">
              <Ic size={13} className="text-[var(--accent)]/80" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
        <button className="btn-accent w-full rounded-full py-2 text-[12px]" data-testid="join-circle-btn">
          Join now
        </button>
        <div className="text-center text-[11px] text-[var(--text-muted)] mt-2.5 underline decoration-dotted cursor-pointer hover:text-[var(--accent)]">
          Learn more →
        </div>
      </div>

      {/* Rare Finds */}
      <div data-testid="rare-finds">
        <SectionHeader title="Rare Finds" />
        <div className="space-y-4">
          {rareFinds.map((r) => (
            <div key={r.id} className="flex gap-3 items-start cursor-pointer group" data-testid={`rare-find-${r.id}`}>
              <div
                className="cover cover-placeholder w-[54px] h-[54px] shrink-0"
                style={{ background: r.cover }}
              >
                <span className="opacity-70">{r.title.split(" ").slice(0,2).join(" ")}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate">{r.title}</div>
                <div className="text-[11px] text-[var(--text-muted)] truncate">{r.artist}</div>
                <div className="text-[10px] text-[var(--text-dim)] mt-0.5 truncate">{r.detail}</div>
              </div>
              <div className="text-[13px] text-[var(--accent)] font-medium shrink-0">{r.price}</div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
