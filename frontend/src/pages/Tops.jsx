import React from "react";
import { topsByCommunity } from "../data/mock";
import { Chip, SectionTitle } from "../components/ui-bits";
import { Trophy, ArrowRight } from "lucide-react";

export default function Tops() {
  return (
    <div className="space-y-8 fade-in-up" data-testid="tops-page">
      <div>
        <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] mb-3">Community Rankings</div>
        <h1 className="font-serif text-[32px] sm:text-[40px] leading-tight mb-3">The Tops</h1>
        <p className="text-[14px] text-[var(--text-muted)] max-w-[560px]">
          Curated top 10 lists from the sharpest ears in the community. Agree. Disagree. Make your own.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip active>All Genres</Chip>
        <Chip>Rock</Chip>
        <Chip>Jazz</Chip>
        <Chip>Hip-Hop</Chip>
        <Chip>Indie</Chip>
        <Chip>Electronic</Chip>
        <Chip>Classical</Chip>
        <Chip>Folk</Chip>
      </div>

      <SectionTitle action={<button className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--accent)]">View all <ArrowRight size={12} /></button>}>
        Featured Tops
      </SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {topsByCommunity.map((t) => (
          <div key={t.id} className="card-panel hover-lift overflow-hidden cursor-pointer" data-testid={`tops-list-${t.id}`}>
            <div className="h-[140px] relative" style={{ background: t.cover }}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(0,0,0,0.7)]" />
              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                <div className="text-[11px] tracking-[0.18em] uppercase text-[var(--accent)] font-medium">{t.title}</div>
                <Trophy size={15} className="text-[var(--accent)]/70" />
              </div>
            </div>
            <div className="p-5 space-y-3">
              {t.items.map((it) => (
                <div key={it.rank} className="flex items-center gap-4">
                  <span className="font-serif text-[22px] text-[var(--text-dim)] w-6">{it.rank}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] truncate">{it.title}</div>
                    {it.sub && <div className="text-[11px] text-[var(--text-muted)] truncate">{it.sub}</div>}
                  </div>
                </div>
              ))}
              <div className="text-[11px] text-[var(--text-dim)] pt-1 border-t border-[var(--border)] mt-3">+ {t.more} more albums</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
