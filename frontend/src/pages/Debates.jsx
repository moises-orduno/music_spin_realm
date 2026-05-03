import React from "react";
import { MessageSquare, Flame, Clock, ArrowRight } from "lucide-react";
import { debates } from "../data/mock";
import { Chip, SectionTitle } from "../components/ui-bits";

export default function Debates() {
  return (
    <div className="space-y-8 fade-in-up" data-testid="debates-page">
      <div>
        <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] mb-3">Music Court</div>
        <h1 className="font-serif text-[32px] sm:text-[40px] leading-tight mb-3">The Debates Floor</h1>
        <p className="text-[14px] text-[var(--text-muted)] max-w-[560px]">
          Defend your picks. Challenge the canon. Every vinyl lover has an opinion — here's where they're tested.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Chip active>All</Chip>
        <Chip>Hot <Flame size={11} className="inline ml-1" /></Chip>
        <Chip>New</Chip>
        <Chip>Rock</Chip>
        <Chip>Jazz</Chip>
        <Chip>Hip-Hop</Chip>
        <Chip>Electronic</Chip>
        <Chip>90s</Chip>
        <Chip>Classic</Chip>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
          <Clock size={12} /> Sort: Trending
        </div>
      </div>

      <SectionTitle
        action={<button className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--accent)]">View all <ArrowRight size={12} /></button>}
      >
        Ongoing Debates
      </SectionTitle>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {debates.map((d) => (
          <div key={d.id} className="card-panel hover-lift p-0 overflow-hidden cursor-pointer" data-testid={`debate-${d.id}`}>
            <div className="aspect-[4/5] relative" style={{ background: d.cover }}>
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.9)] via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-serif text-[18px] leading-tight mb-3">{d.title}</h3>
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <div className="flex items-center gap-1.5"><MessageSquare size={11} /> {d.comments}</div>
                  <div className="text-[var(--accent)]">Join →</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
