import React, { useState } from "react";
import { Flame, Sparkles, MessageSquare, Zap, ChevronDown, MoreVertical, Search } from "lucide-react";
import { allDebates, trendingTopics } from "../data/debates";

const filters = [
  { label: "Trending", Icon: Flame },
  { label: "New", Icon: Sparkles },
  { label: "Most Commented", Icon: MessageSquare },
  { label: "Controversial", Icon: Zap },
];

function FilterTab({ Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      data-testid={`filter-${label.toLowerCase().replace(/\s/g, "-")}`}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12.5px] transition border ${
        active
          ? "bg-[var(--accent-soft)] text-[var(--accent-2)] border-[var(--accent)]/40"
          : "bg-transparent text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)] hover:border-[var(--border-2)]"
      }`}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

function DebateRow({ d, onVote, selectedOption }) {
  return (
    <div className="card-panel p-5 hover:border-[var(--border-2)] transition" data-testid={`debate-row-${d.id}`}>
      <div className="flex gap-5">
        {/* Image */}
        <div
          className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] rounded-lg shrink-0 cover"
          style={{ background: d.image }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Top row: badge + actions */}
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[10px] tracking-[0.15em] uppercase font-semibold"
              style={{ color: d.badgeColor }}
            >
              {d.badge}
            </span>
            <button className="text-[var(--text-dim)] hover:text-[var(--text)]" data-testid={`debate-menu-${d.id}`}>
              <MoreVertical size={15} />
            </button>
          </div>

          {/* Title */}
          <h3 className="font-serif text-[18px] sm:text-[20px] leading-snug mb-3 line-clamp-2">{d.title}</h3>

          {/* Participants */}
          <div className="flex items-center gap-2.5 mb-3 text-[12px] text-[var(--text-muted)]">
            <div className="flex -space-x-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full border-2 border-[var(--panel)]"
                  style={{ background: `linear-gradient(135deg, hsl(${(d.id * 60 + i * 80) % 360}, 40%, 45%), hsl(${(d.id * 60 + i * 80 + 30) % 360}, 30%, 25%))` }}
                />
              ))}
            </div>
            <span>{d.participants} debated this</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {d.tags.map((t) => (
              <span key={t} className="px-2.5 py-0.5 rounded-full text-[10.5px] border border-[var(--border-2)] text-[var(--text-muted)]">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Vote bars */}
        <div className="hidden md:flex flex-col gap-2 w-[280px] shrink-0 self-center">
          {d.options.map((o, i) => (
            <button
              key={i}
              onClick={() => onVote(d.id, i)}
              data-testid={`vote-${d.id}-${i}`}
              className={`text-left group ${selectedOption === i ? "" : ""}`}
            >
              <div className="flex items-center justify-between text-[12.5px] mb-1">
                <span className={`font-semibold ${selectedOption === i ? "text-[var(--accent-2)]" : ""}`} style={{ color: selectedOption === i ? o.color : undefined }}>{o.pct}%</span>
                <span className="text-[var(--text-muted)] truncate ml-3">{o.label}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${o.pct}%`, background: o.color, boxShadow: selectedOption === i ? `0 0 12px ${o.color}` : undefined }}
                />
              </div>
            </button>
          ))}
          <div className="text-right text-[11px] text-[var(--text-dim)] mt-1 flex items-center justify-end gap-1.5">
            <MessageSquare size={11} /> {d.comments} comments
          </div>
        </div>
      </div>

      {/* Mobile vote bars */}
      <div className="md:hidden mt-4 flex flex-col gap-2">
        {d.options.map((o, i) => (
          <button
            key={i}
            onClick={() => onVote(d.id, i)}
            data-testid={`vote-mobile-${d.id}-${i}`}
            className="text-left"
          >
            <div className="flex items-center justify-between text-[12px] mb-1">
              <span className="font-semibold" style={{ color: selectedOption === i ? o.color : undefined }}>{o.pct}%</span>
              <span className="text-[var(--text-muted)] truncate ml-3">{o.label}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${o.pct}%`, background: o.color }} />
            </div>
          </button>
        ))}
        <div className="text-right text-[11px] text-[var(--text-dim)] mt-1">{d.comments} comments</div>
      </div>
    </div>
  );
}

export default function Debates() {
  const [activeFilter, setActiveFilter] = useState("Trending");
  const [category, setCategory] = useState("All Categories");
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [votes, setVotes] = useState({}); // {debateId: optionIndex}

  const handleVote = (id, idx) => setVotes((v) => ({ ...v, [id]: idx }));

  const cats = ["All Categories", "Bands & Artists", "Albums", "Genres", "Era", "Fun & Games"];

  return (
    <div className="flex gap-6 min-w-0" data-testid="debates-page">
      {/* Main */}
      <div className="flex-1 min-w-0 space-y-6 fade-in-up">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-[34px] sm:text-[42px] leading-none mb-2">Debates</h1>
            <p className="text-[13px] text-[var(--text-muted)]">Argue. Defend. Discover.</p>
          </div>
          <div className="relative max-w-[280px] w-full sm:w-auto">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
            <input
              data-testid="debates-search"
              placeholder="Search debates..."
              className="w-full sm:w-[260px] bg-[var(--panel)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2 text-[12.5px] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--border-2)]"
            />
          </div>
        </div>

        {/* Filters + category dropdown */}
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex flex-wrap gap-2" data-testid="debate-filters">
            {filters.map(({ label, Icon }) => (
              <FilterTab
                key={label}
                Icon={Icon}
                label={label}
                active={activeFilter === label}
                onClick={() => setActiveFilter(label)}
              />
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowCatMenu(!showCatMenu)}
              data-testid="category-dropdown"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-[12.5px] text-[var(--text)] hover:border-[var(--border-2)]"
            >
              {category} <ChevronDown size={13} className={`transition ${showCatMenu ? "rotate-180" : ""}`} />
            </button>
            {showCatMenu && (
              <div className="absolute right-0 top-full mt-1 w-[200px] card-panel py-1.5 z-30" data-testid="category-menu">
                {cats.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCategory(c); setShowCatMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-[12.5px] hover:bg-[var(--accent-soft)] transition ${c === category ? "text-[var(--accent-2)]" : "text-[var(--text-muted)]"}`}
                    data-testid={`cat-option-${c.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Debates list */}
        <div className="space-y-4">
          {allDebates.map((d) => (
            <DebateRow key={d.id} d={d} onVote={handleVote} selectedOption={votes[d.id]} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-4">
          <button className="text-[12.5px] text-[var(--text-muted)] hover:text-[var(--accent)] inline-flex items-center gap-1.5" data-testid="load-more">
            <ChevronDown size={13} /> Scroll for more debates
          </button>
        </div>
      </div>

      {/* Right rail */}
      <aside className="hidden xl:block w-[230px] shrink-0 fade-in-up" data-testid="debates-right-rail">
        <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--text-dim)] mb-3">Trending Topics</div>
        <div className="flex flex-wrap gap-2">
          {trendingTopics.map((t) => (
            <button
              key={t}
              className="px-3 py-1.5 rounded-full text-[11.5px] border border-[var(--border-2)] text-[var(--text-muted)] hover:text-[var(--accent-2)] hover:border-[var(--accent)]/40 transition"
              data-testid={`topic-${t.toLowerCase().replace(/\s/g, "-")}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-8 card-panel p-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle, var(--accent-glow), transparent 70%)" }} />
          <div className="text-[10px] tracking-[0.18em] uppercase text-[var(--accent-2)] mb-2 relative">Debate Tips</div>
          <ul className="space-y-1.5 text-[12px] text-[var(--text-muted)] relative">
            <li>• Be respectful</li>
            <li>• Keep it civil</li>
            <li>• Back up your take</li>
            <li>• No hate, just music</li>
          </ul>
          <button className="text-[11.5px] text-[var(--accent-2)] mt-3 hover:underline relative" data-testid="read-guidelines">
            Read our guidelines →
          </button>
        </div>
      </aside>
    </div>
  );
}
