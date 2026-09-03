import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Chip } from "../components/ui-bits";
import axios from "axios";
import {
  Plus, MoreVertical, Users, Disc, Music, Clock,
  Gamepad2, Hash, Zap, Shield, ChevronDown, Loader2,
} from "lucide-react";
import { debateOfTheDay, activeNow, popularCategories } from "../data/debates";
import { getDebates } from "../services/debateService";

const TABS = ["Trending", "New", "Hot", "My Debates", "Friends"];
const CATS = ["All", "General", "Bands & Artists", "Albums", "Genres", "Era", "Fun & Games"];

// Compute pct from votes for display
function withPct(d) {
  const total = (d.options || []).reduce((s, o) => s + (o.votes || 0), 0) || 1;
  const opts = (d.options || []).map((o) => ({ ...o, pct: Math.round((o.votes / total) * 100) }));
  const totalVotes = total;
  // For vs type, sync contenders pct with computed pct from options
  let contenders = d.contenders;
  let extra = d.extra;
  if (d.type === "vs" && contenders && opts.length >= 2) {
    contenders = contenders.map((c, i) => ({ ...c, pct: opts[i] ? opts[i].pct : c.pct }));
    if (extra && opts[2]) extra = { ...extra, pct: opts[2].pct };
  }
  // Format votes/comments to short string
  const votesStr = totalVotes >= 1000 ? `${(totalVotes / 1000).toFixed(1)}K` : `${totalVotes}`;
  const commentsStr = d.comments >= 1000 ? `${(d.comments / 1000).toFixed(1)}K` : `${d.comments || 0}`;
  return { ...d, options: opts, contenders, extra, votes: votesStr, comments: commentsStr };
}

function Badge({ label, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <Zap size={12} style={{ color }} fill={color} />
      <span className="text-[10.5px] tracking-[0.18em] uppercase font-semibold" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

function VotersAvatars({ seed = 0 }) {
  return (
    <div className="flex -space-x-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-7 h-7 rounded-full border-2 border-[var(--panel)]"
          style={{ background: `linear-gradient(135deg, hsl(${(seed + i) * 80 % 360}, 40%, 50%), hsl(${(seed + i) * 80 % 360 + 30}, 30%, 25%))` }}
        />
      ))}
    </div>
  );
}

function Footer({ children, testid }) {
  return (
    <div className="mt-5 pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3" data-testid={testid}>
      {children}
    </div>
  );
}

function VsCard({ d, onVote, selectedOption }) {
  return (
    <div className="card-panel p-6" data-testid={`debate-${d.id}`}>
      <div className="flex items-center justify-between mb-2">
        <Badge label={d.badge} color={d.badge_color} />
        <button className="text-[var(--text-dim)] hover:text-[var(--text)]"><MoreVertical size={15} /></button>
      </div>
      <h3 className="font-serif text-[24px] sm:text-[26px] leading-tight mb-1">{d.title}</h3>
      {d.subtitle && <p className="text-[12.5px] text-[var(--text-muted)] mb-5">{d.subtitle}</p>}

      <div className="flex items-center gap-4 sm:gap-6">
        {d.contenders && d.contenders.slice(0, 2).map((c, i) => (
          <React.Fragment key={i}>
            {i === 1 && (
              <div className="w-10 h-10 rounded-full border border-[var(--border-2)] flex items-center justify-center text-[10.5px] font-semibold tracking-widest text-[var(--text-muted)] shrink-0">VS</div>
            )}
            <button
              onClick={() => onVote(d.id, i)}
              data-testid={`vs-option-${d.id}-${i}`}
              className="flex-1 flex items-center gap-3 sm:gap-4 text-left"
            >
              <div className="w-[80px] h-[60px] sm:w-[120px] sm:h-[80px] rounded-md shrink-0 cover" style={{ background: c.image }} />
              <div className="min-w-0 flex-1">
                <div className="text-[12px] text-[var(--text-muted)] truncate">{c.name}</div>
                <div className={`text-[22px] sm:text-[26px] font-serif transition ${selectedOption === i ? "text-[var(--accent-2)]" : "text-[var(--text)]"}`}>{c.pct}%</div>
                <div className="h-1 rounded-full bg-[var(--border)] overflow-hidden mt-1">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${c.pct}%`, background: "var(--accent)", boxShadow: selectedOption === i ? "0 0 12px var(--accent-glow)" : "none" }} />
                </div>
              </div>
            </button>
          </React.Fragment>
        ))}
      </div>

      {d.extra && (
        <div className="mt-4 flex items-center gap-3 px-2">
          <div className="text-[12.5px] text-[var(--text-muted)] w-16">{d.extra.name}</div>
          <div className="text-[12.5px] text-[var(--text)] w-10">{d.extra.pct}%</div>
          <div className="flex-1 h-1 rounded-full bg-[var(--border)] overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${d.extra.pct}%`, background: "var(--accent)" }} />
          </div>
        </div>
      )}

      <Footer testid={`debate-footer-${d.id}`}>
        <div className="flex items-center gap-3 text-[12px] text-[var(--text-muted)]">
          <VotersAvatars seed={d.id.charCodeAt(0)} />
          <span>{d.votes} votes</span>
          <span className="text-[var(--text-dim)]">·</span>
          <span>{d.comments} comments</span>
        </div>
        <Link to={`/debates/${d.id}`} className="border border-[var(--border-2)] text-[12.5px] px-4 py-2 rounded-lg hover:border-[var(--accent)] hover:text-[var(--accent-2)] transition inline-block" data-testid={`view-debate-${d.id}`}>
          View Debate
        </Link>
      </Footer>
    </div>
  );
}

function BinaryCard({ d, vote, onVote }) {
  return (
    <div className="card-panel p-6" data-testid={`debate-${d.id}`}>
      <div className="flex items-center justify-between mb-2">
        <Badge label={d.badge} color={d.badge_color} />
        <button className="text-[var(--text-dim)] hover:text-[var(--text)]"><MoreVertical size={15} /></button>
      </div>
      <h3 className="font-serif text-[24px] sm:text-[26px] leading-tight mb-1">{d.title}</h3>
      {d.subtitle && <p className="text-[12.5px] text-[var(--text-muted)] mb-5">{d.subtitle}</p>}

      <div className="flex items-center gap-4 sm:gap-6">
        {d.options.map((o, i) => (
          <React.Fragment key={i}>
            {i === 1 && (
              <div className="w-10 h-10 rounded-full border border-[var(--border-2)] flex items-center justify-center text-[10.5px] font-semibold tracking-widest text-[var(--text-muted)] shrink-0">VS</div>
            )}
            <button
              onClick={() => onVote(d.id, i)}
              data-testid={`binary-option-${d.id}-${i}`}
              className="flex-1 text-left"
            >
              <div className="text-[12px] text-[var(--text-muted)] mb-1">{o.label}</div>
              <div className={`text-[28px] sm:text-[34px] font-serif transition ${vote === i ? "text-[var(--accent-2)]" : "text-[var(--text)]"}`}>{(o.votes / d.total_votes) * 100}%</div>
              <div className="h-1 rounded-full bg-[var(--border)] overflow-hidden mt-1.5">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${((o.votes / d.total_votes) * 100)}%`, background: "var(--accent)", boxShadow: vote === i ? "0 0 12px var(--accent-glow)" : "none" }} />
              </div>
            </button>
          </React.Fragment>
        ))}
      </div>

      <Footer testid={`debate-footer-${d.id}`}>
        <div className="flex items-center gap-3 text-[12px] text-[var(--text-muted)]">
          <VotersAvatars seed={d.id.charCodeAt(0)} />
          <span>{d.total_votes} votes</span>
          <span className="text-[var(--text-dim)]">·</span>
          <span>{d.comments} comments</span>
        </div>
        <Link to={`/debates/${d.id}`} className="border border-[var(--border-2)] text-[12.5px] px-4 py-2 rounded-lg hover:border-[var(--accent)] hover:text-[var(--accent-2)] transition inline-block">
          View Debate
        </Link>
      </Footer>
    </div>
  );
}

function AlbumPickCard({ d, onVote }) {
  return (
    <div className="card-panel p-6" data-testid={`debate-${d.id}`}>
      <div className="flex items-center justify-between mb-2">
        <Badge label={d.badge} color={d.badge_color} />
        <button className="text-[var(--text-dim)] hover:text-[var(--text)]"><MoreVertical size={15} /></button>
      </div>
      <h3 className="font-serif text-[24px] sm:text-[26px] leading-tight mb-1">{d.title}</h3>
      {d.subtitle && <p className="text-[12.5px] text-[var(--text-muted)] mb-5">{d.subtitle}</p>}

      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {(d.albums || []).map((a, i) => (
          <button key={i} onClick={() => onVote(d.id, i)} className="aspect-square rounded-md cover cover-placeholder hover:scale-105 transition" style={{ background: a.cover }} data-testid={`album-pick-${d.id}-${i}`}>
            <span className="opacity-70 text-[10px]">{a.title}</span>
          </button>
        ))}
      </div>

      <Footer testid={`debate-footer-${d.id}`}>
        <div className="flex items-center gap-3 text-[12px] text-[var(--text-muted)]">
          <VotersAvatars seed={d.id.charCodeAt(0)} />
          <span>{d.total_votes} votes</span>
          <span className="text-[var(--text-dim)]">·</span>
          <span>{d.comments} comments</span>
        </div>
        <Link to={`/debates/${d.id}`} className="border border-[var(--border-2)] text-[12.5px] px-4 py-2 rounded-lg hover:border-[var(--accent)] hover:text-[var(--accent-2)] transition inline-block">
          View Debate
        </Link>
      </Footer>
    </div>
  );
}

function GameCard({ d }) {
  return (
    <div className="card-panel p-6" data-testid={`debate-${d.id}`}>
      <div className="flex items-center justify-between mb-2">
        <Badge label={d.badge} color={d.badge_color} />
        <button className="text-[var(--text-dim)] hover:text-[var(--text)]"><MoreVertical size={15} /></button>
      </div>
      <h3 className="font-serif text-[24px] sm:text-[26px] leading-tight mb-1">{d.title}</h3>
      <p className="text-[12.5px] text-[var(--text-muted)] mb-5">{d.subtitle}</p>

      <div className="flex items-center justify-end gap-2.5">
        {[...Array(d.avatars || 6)].map((_, i) => (
          <div key={i} className="w-11 h-11 rounded-full border-2 border-[var(--panel)]" style={{ background: `linear-gradient(135deg, hsl(${i * 50}, 40%, 50%), hsl(${i * 50 + 30}, 30%, 25%))` }} />
        ))}
      </div>

      <Footer testid={`debate-footer-${d.id}`}>
        <div className="flex items-center gap-3 text-[12px] text-[var(--text-muted)]">
          <span>{d.stat}</span>
          <span className="text-[var(--text-dim)]">·</span>
          <span>{d.comments} comments</span>
        </div>
        <button className="btn-accent text-[12.5px] px-5 py-2 rounded-lg" data-testid={`play-now-${d.id}`}>
          {d.cta || "Play Now"}
        </button>
      </Footer>
    </div>
  );
}

const ICON_MAP = { Users, Disc, Music, Clock, Gamepad2, Hash };

export default function Debates() {
  const [tab, setTab] = useState("Trending");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("Most Popular");
  const [debates, setDebates] = useState([]);
  const [loadingDebates, setLoadingDebates] = useState(true);
  const [error, setError] = useState(null);
  const [myVotes, setMyVotes] = useState({}); // {debateId: optionIndex}

  useEffect(() => {
    const loadDebates = async () => {
      try {
        setLoadingDebates(true);
        setError(null);

        const data = await getDebates();
        setDebates(data);

      } catch (err) {
        setError(err.message || "Failed to load debates");
      } finally {
        setLoadingDebates(false);
      }
    };

    loadDebates();
  }, []);

  const handleCreateDebate = ()=>{

  }

  const handleVote = async (id, optionIndex) => {
    // Optimistic UI: track my vote
    setMyVotes((v) => ({ ...v, [id]: optionIndex }));
    try {
      const res = await axios.post(`${API}/debates/${id}/vote`, { option_index: optionIndex });
      // Replace this debate in the list with the updated one
      setDebates((curr) => curr.map((d) => (d.id === id ? withPct(res.data) : d)));
    } catch (e) {
      console.error("Vote failed", e);
    }
  };

  if (loadingDebates || !debates) {
    return <div className="p-6">Loading Debates...</div>;
  }

  return (
    <div className="flex gap-6 min-w-0" data-testid="debates-page">
      <div className="flex-1 min-w-0 space-y-6 fade-in-up">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] mb-3">
              Your Shelf
            </div>

            <h1 className="font-serif text-[34px] sm:text-[44px] leading-none mb-2">Debates</h1>
            <p className="text-[13px] text-[var(--text-muted)]">Where music lovers argue (respectfully).</p>
          </div>
          
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-7 border-b border-[var(--border)] overflow-x-auto" data-testid="debate-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              data-testid={`tab-${t.toLowerCase().replace(/\s/g, "-")}`}
              className={`pb-3 text-[13px] whitespace-nowrap relative ${tab === t ? "text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}
            >
              {t}
              {tab === t && <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--accent)]" />}
            </button>
          ))}
        </div>

        {/* Category chips + sort */}
        <div className="flex flex-wrap items-center justify-between gap-3">

          {/* Categories */}
          <div
            className="flex flex-wrap gap-2"
            data-testid="category-chips"
          >
            {CATS.map((category) => (
              <Chip
                key={category}
                active={cat === category}
                onClick={() => setCat(category)}
              >
                {category}
              </Chip>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">

            {/* Create Debate */}
            <button
              onClick={handleCreateDebate}
              className="btn-accent inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
              data-testid="create-debate-btn"
            >
              <Plus size={14} />
              Create Debate
            </button>

          </div>
        </div>

        {/* Loading / Error / List */}
        {!loadingDebates && !error && (
          <div className="space-y-5">
            {debates.map((d) => {
              if (d.type === "vs") return <VsCard key={d.id} d={d} onVote={handleVote} selectedOption={myVotes[d.id]} />;
              if (d.type === "binary") return <BinaryCard key={d.id} d={d} vote={myVotes[d.id]} onVote={handleVote} />;
              if (d.type === "album-pick") return <AlbumPickCard key={d.id} d={d} onVote={handleVote} />;
              if (d.type === "game") return <GameCard key={d.id} d={d} />;
              return null;
            })}
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 mt-8 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-[11.5px] text-[var(--text-muted)]">
          <div>© 2026 SpinRealm</div>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-[var(--text)]">About</a>
            <span>·</span>
            <a href="#" className="hover:text-[var(--text)]">Guidelines</a>
            <span>·</span>
            <a href="#" className="hover:text-[var(--text)]">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:text-[var(--text)]">Terms</a>
            <span>·</span>
            <a href="#" className="hover:text-[var(--text)]">Contact</a>
          </div>
          <div className="italic font-serif">Made for music lovers.</div>
        </div>
      </div>

      {/* Right rail (unchanged static for now) */}
      <aside className="hidden xl:block w-[260px] shrink-0 space-y-6 fade-in-up" data-testid="debates-right-rail">
        <div className="card-panel p-5" data-testid="debate-of-day">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={13} className="text-[var(--accent)]" fill="var(--accent)" />
            <span className="text-[12px] font-medium">Debate of the Day</span>
          </div>
          <div className="rounded-lg overflow-hidden mb-3 cover" style={{ background: debateOfTheDay.cover, aspectRatio: "1 / 1" }} />
          <div className="font-serif text-[15px] mb-1">{debateOfTheDay.title}</div>
          <p className="text-[11.5px] text-[var(--text-muted)] mb-3">{debateOfTheDay.subtitle}</p>
          <button className="btn-accent w-full rounded-lg py-2 text-[12px]" data-testid="join-debate-day-btn">Join the Debate</button>
          <div className="text-center text-[10.5px] text-[var(--text-dim)] mt-2">
            {debateOfTheDay.votes} votes · {debateOfTheDay.comments} comments
          </div>
        </div>

        <div className="card-panel p-5" data-testid="active-now">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span className="text-[12px] font-medium">Active Now</span>
          </div>
          <div className="space-y-3">
            {activeNow.map((u) => (
              <div key={u.handle} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full shrink-0" style={{ background: `linear-gradient(135deg, ${u.color}, #1a1612)` }} />
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] truncate">{u.handle}</div>
                  <div className="text-[10.5px] text-[var(--text-muted)]">{u.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-panel p-5" data-testid="popular-categories">
          <div className="text-[12px] font-medium mb-4">Popular Categories</div>
          <div className="space-y-2.5">
            {popularCategories.map((c) => {
              const Ic = ICON_MAP[c.icon] || Hash;
              return (
                <button key={c.label} className="w-full flex items-center gap-3 py-1 text-[12.5px] text-[var(--text)]/85 hover:text-[var(--accent-2)] transition">
                  <Ic size={14} className="text-[var(--text-muted)]" /> {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="card-panel p-5 relative overflow-hidden" data-testid="debate-tips">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle, var(--accent-glow), transparent 70%)" }} />
          <div className="flex items-center justify-between mb-3 relative">
            <div className="text-[12px] font-medium">Debate Tips</div>
            <Shield size={15} className="text-[var(--accent-2)]" />
          </div>
          <ul className="space-y-1.5 text-[12px] text-[var(--text-muted)] relative">
            <li>• Be respectful</li>
            <li>• Keep it civil</li>
            <li>• Back up your take</li>
            <li>• No hate, just music</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
