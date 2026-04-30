import React from "react";
import { Crown, ChevronLeft, ChevronRight, ArrowRight, MessageSquare } from "lucide-react";
import { debates, topsByCommunity, spotlight } from "../data/mock";
import { SectionTitle } from "../components/ui-bits";

export default function Home() {
  return (
    <div className="space-y-10 fade-in-up" data-testid="home-page">
      {/* Hero — Music Court */}
      <section
        className="relative overflow-hidden rounded-2xl border border-[var(--border)] p-10 min-h-[360px] flex items-center grain"
        style={{
          background:
            "linear-gradient(115deg, #0f0d0b 0%, #1a1612 40%, #2a2018 60%, #0a0806 100%), radial-gradient(circle at 70% 50%, rgba(100,80,50,0.25), transparent 60%)",
        }}
        data-testid="hero-music-court"
      >
        <div className="relative z-10 max-w-[540px]">
          <div className="flex items-center gap-2 mb-5">
            <Crown size={14} className="text-[var(--accent)]" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)]">Music Court</span>
          </div>
          <h1 className="font-serif text-[44px] leading-[1.05] font-normal mb-4">
            Which albums<br/>truly have no skips?
          </h1>
          <p className="text-[14px] text-[var(--text-muted)] mb-7 max-w-[420px]">
            Defend your pick. Convince the court.
          </p>
          <div className="flex items-center gap-3 mb-7">
            <button className="btn-accent px-6 py-2.5 rounded-lg text-[13px]" data-testid="join-debate-btn">
              Join the debate
            </button>
            <button className="text-[13px] text-[var(--text)] flex items-center gap-1.5 px-4 py-2.5 btn-ghost">
              See all debates <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-[#1a1612]"
                  style={{ background: `linear-gradient(135deg, hsl(${i * 70}, 40%, 50%), hsl(${i * 70 + 30}, 30%, 25%))` }}
                />
              ))}
            </div>
            <span className="text-[12px] text-[var(--text-muted)]">
              <span className="text-[var(--text)] font-medium">1.2K collectors</span> defending their picks
            </span>
          </div>
        </div>

        {/* Decorative album cluster */}
        <div className="absolute right-[-40px] top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-3 opacity-90">
          {[
            { g: "linear-gradient(135deg, #2a2620, #0a0906)", rotate: -8 },
            { g: "linear-gradient(135deg, #c2a876, #3a2a15)", rotate: 4 },
            { g: "linear-gradient(135deg, #e8a030, #4a2a10)", rotate: -3 },
            { g: "radial-gradient(circle, #fff, #6ab0d8 30%, #0a1530 60%)", rotate: 6 },
            { g: "linear-gradient(135deg, #3a3630, #0a0a0a)", rotate: -5 },
          ].map((c, i) => (
            <div
              key={i}
              className="w-[120px] h-[120px] rounded-md shadow-2xl border border-[rgba(255,255,255,0.06)]"
              style={{
                background: c.g,
                transform: `translateY(${(i % 2) * 12}px) rotate(${c.rotate}deg)`,
              }}
            />
          ))}
        </div>

        {/* Carousel arrows */}
        <div className="absolute bottom-6 right-6 flex gap-2 z-20">
          <button className="w-8 h-8 rounded-full border border-[var(--border-2)] flex items-center justify-center btn-ghost" data-testid="hero-prev">
            <ChevronLeft size={14} />
          </button>
          <button className="w-8 h-8 rounded-full border border-[var(--border-2)] flex items-center justify-center btn-ghost" data-testid="hero-next">
            <ChevronRight size={14} />
          </button>
        </div>
      </section>

      {/* Top Debates This Week */}
      <section data-testid="top-debates-section">
        <SectionTitle
          action={
            <button className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--accent)]" data-testid="view-all-debates">
              View all <ArrowRight size={12} />
            </button>
          }
        >
          Top Debates This Week
        </SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {debates.slice(0, 5).map((d) => (
            <div key={d.id} className="card-panel hover-lift p-0 overflow-hidden cursor-pointer" data-testid={`debate-card-${d.id}`}>
              <div
                className="aspect-[4/5] w-full relative"
                style={{ background: d.cover }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.85)] via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-serif text-[16px] leading-tight mb-2">{d.title}</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                    <MessageSquare size={11} />
                    {d.comments} comments
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tops by the Community */}
      <section data-testid="tops-section">
        <SectionTitle
          action={
            <button className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--accent)]">
              View all tops <ArrowRight size={12} />
            </button>
          }
        >
          Tops by the Community
        </SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {topsByCommunity.map((t) => (
            <div key={t.id} className="card-panel hover-lift overflow-hidden cursor-pointer" data-testid={`top-card-${t.id}`}>
              <div className="h-[120px] relative" style={{ background: t.cover }}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(0,0,0,0.6)]" />
                <div className="absolute bottom-3 left-4 text-[10.5px] tracking-[0.15em] uppercase text-[var(--accent)] font-medium">
                  {t.title}
                </div>
              </div>
              <div className="p-4 space-y-2.5">
                {t.items.map((it) => (
                  <div key={it.rank} className="flex items-center gap-3">
                    <span className="text-[13px] text-[var(--text-dim)] w-3">{it.rank}</span>
                    <div className="min-w-0">
                      <div className="text-[13px] truncate">{it.title}</div>
                      {it.sub && <div className="text-[10.5px] text-[var(--text-muted)] truncate">{it.sub}</div>}
                    </div>
                  </div>
                ))}
                <div className="text-[10.5px] text-[var(--text-dim)] pt-1">+ {t.more} more</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collector Spotlight */}
      <section data-testid="collector-spotlight-section">
        <SectionTitle
          action={
            <button className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--accent)]">
              View all <ArrowRight size={12} />
            </button>
          }
        >
          Collector Spotlight
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {spotlight.slice(0, 4).map((s) => (
            <div key={s.id} className="card-panel hover-lift p-5 cursor-pointer" data-testid={`spotlight-${s.id}`}>
              <div className="flex gap-4 mb-3">
                <div
                  className="w-[60px] h-[60px] rounded-full shrink-0"
                  style={{ background: `linear-gradient(135deg, ${s.avatarColor}, #1a1612)` }}
                />
                <div className="min-w-0">
                  <div className="text-[13.5px] font-medium truncate">{s.handle}</div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate">{s.type}</div>
                </div>
              </div>
              <p className="font-serif text-[14px] italic text-[var(--text)]/85 leading-snug mb-3">
                “{s.quote}”
              </p>
              <div className="text-[10.5px] text-[var(--text-dim)]">Top 10 · {s.followers} followers</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
