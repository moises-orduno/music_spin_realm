import React from "react";
import { hunting } from "../data/mock";
import { Chip } from "../components/ui-bits";
import { Target, MapPin, Tag } from "lucide-react";

export default function Hunt() {
  return (
    <div className="space-y-8 fade-in-up" data-testid="hunt-page">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] mb-3">Wishlist to shelf</div>
          <h1 className="font-serif text-[40px] leading-tight mb-3">Hunt Requests</h1>
          <p className="text-[14px] text-[var(--text-muted)] max-w-[560px]">
            The records you're chasing. The community is watching every flea market, estate sale, and dusty bin for you.
          </p>
        </div>
        <button className="btn-accent px-5 py-2.5 rounded-full text-[13px] flex items-center gap-2" data-testid="new-hunt-btn">
          <Target size={14} /> New hunt request
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip active>Active</Chip>
        <Chip>Found</Chip>
        <Chip>Expired</Chip>
        <Chip>Archive</Chip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hunting.map((h) => (
          <div key={h.id} className="card-panel hover-lift p-5 flex gap-5 cursor-pointer" data-testid={`hunt-${h.id}`}>
            <div
              className="cover cover-placeholder w-[110px] h-[110px] shrink-0"
              style={{ background: h.cover }}
            >
              <div className="font-serif opacity-80 text-[11px]">{h.title}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <h3 className="font-serif text-[20px] leading-tight truncate">{h.title}</h3>
                  <div className="text-[12.5px] text-[var(--text-muted)]">{h.artist}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[18px] font-serif text-[var(--accent)]">{h.collectors}</div>
                  <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider">hunters</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-[var(--text-muted)] mt-3">
                <span className="flex items-center gap-1.5"><MapPin size={11} /> {h.detail}</span>
                <span className="flex items-center gap-1.5 text-[var(--accent)]"><Tag size={11} /> {h.price}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="border border-[var(--border-2)] text-[12px] px-3 py-1.5 rounded-full btn-ghost">Details</button>
                <button className="bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-[var(--accent)] text-[12px] px-3 py-1.5 rounded-full hover:bg-[var(--accent)]/20 transition">
                  I have this
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
