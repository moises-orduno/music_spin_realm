import React from "react";
import { spotlight } from "../data/mock";
import { Chip } from "../components/ui-bits";
import { UserPlus } from "lucide-react";

export default function People() {
  const extended = [...spotlight, ...spotlight].slice(0, 9).map((s, i) => ({ ...s, id: i + 1 }));
  return (
    <div className="space-y-8 fade-in-up" data-testid="people-page">
      <div>
        <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] mb-3">The Community</div>
        <h1 className="font-serif text-[40px] leading-tight mb-3">People</h1>
        <p className="text-[14px] text-[var(--text-muted)] max-w-[560px]">
          Discover collectors who share your taste — and others who will open your ears to something new.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip active>Discover</Chip>
        <Chip>Following</Chip>
        <Chip>Followers</Chip>
        <Chip>Top collectors</Chip>
        <Chip>Nearby</Chip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {extended.map((s) => (
          <div key={s.id} className="card-panel hover-lift p-6 cursor-pointer" data-testid={`person-${s.id}`}>
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-[64px] h-[64px] rounded-full shrink-0 border border-[var(--border-2)]"
                style={{ background: `linear-gradient(135deg, ${s.avatarColor}, #1a1612)` }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium truncate">{s.handle}</div>
                <div className="text-[11.5px] text-[var(--text-muted)] truncate">{s.type}</div>
                <div className="text-[10.5px] text-[var(--text-dim)] mt-0.5">Top 10 · {s.followers} followers</div>
              </div>
              <button className="border border-[var(--accent)]/40 text-[var(--accent)] text-[11.5px] px-3 py-1.5 rounded-full hover:bg-[var(--accent-soft)] transition flex items-center gap-1.5" data-testid={`follow-btn-${s.id}`}>
                <UserPlus size={11} /> Follow
              </button>
            </div>
            <p className="font-serif text-[15px] italic text-[var(--text)]/85 leading-snug mb-4">
              “{s.quote}”
            </p>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-[44px] h-[44px] rounded border border-[var(--border)]"
                  style={{ background: `linear-gradient(135deg, hsl(${(i + s.id) * 40}, 40%, 40%), hsl(${(i + s.id) * 40 + 20}, 30%, 20%))` }}
                />
              ))}
              <div className="w-[44px] h-[44px] rounded border border-[var(--border)] bg-[var(--panel-2)] flex items-center justify-center text-[10px] text-[var(--text-muted)]">
                +138
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
