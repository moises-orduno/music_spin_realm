import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Bookmark, Share2, MoreHorizontal, Disc3, Guitar, Drum, Star, Check,
  ChevronRight, Heart, MessageCircle, ChevronDown, Target, ArrowRight, Flame,
} from "lucide-react";
import { debateDetail, comments as initialComments } from "../data/debateDetail";

const ICON_MAP = { disc: Disc3, guitar: Guitar, drum: Drum, star: Star };

function OptionCard({ opt, selected, onSelect }) {
  const Icon = ICON_MAP[opt.icon] || Disc3;
  return (
    <button
      onClick={() => onSelect(opt.letter)}
      data-testid={`option-${opt.letter}`}
      className={`card-panel p-5 text-left relative transition-all ${
        selected ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "hover:border-[var(--border-2)]"
      }`}
    >
      {/* Letter circle */}
      <div className="absolute top-4 left-4 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
           style={{ background: "var(--accent)", color: "#fff" }}>
        {opt.letter}
      </div>
      {selected && (
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center">
          <Check size={13} className="text-white" strokeWidth={3} />
        </div>
      )}
      <div className="flex justify-end mb-4">
        <Icon size={42} className="text-[var(--accent-2)]" strokeWidth={1.5} />
      </div>
      <div className="font-medium text-[14.5px] mb-1">{opt.title}</div>
      <div className="text-[11.5px] text-[var(--text-muted)] leading-snug mb-4">{opt.desc}</div>
      <div className="flex items-center justify-between text-[12px] mb-1.5">
        <span className="font-semibold">{opt.pct}%</span>
        <span className="text-[var(--text-muted)]">({opt.votes.toLocaleString()} votes)</span>
      </div>
      <div className="h-1 rounded-full bg-[var(--border)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${opt.pct}%`, background: "var(--accent)" }} />
      </div>
    </button>
  );
}

function ReplyCard({ c, onLike, liked }) {
  return (
    <div className="ml-12 pl-5 border-l border-[var(--border)]" data-testid={`reply-${c.id}`}>
      <div className="flex gap-3 mb-3">
        <div className="w-9 h-9 rounded-full shrink-0 border border-[var(--border-2)]" style={{ background: `radial-gradient(circle at 30% 30%, ${c.avatarColor}, #1a1612)` }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-medium text-[13px]">{c.author}</span>
            <span className="text-[11px] text-[var(--text-dim)]">· {c.time}</span>
          </div>
          {c.badges && c.badges.map((b) => (
            <div key={b} className="text-[11px] text-[var(--text-muted)] mb-2">{b}</div>
          ))}
          <p className="text-[13px] text-[var(--text)]/90 leading-relaxed">{c.text}</p>
          <div className="flex items-center gap-5 mt-3">
            <button
              onClick={() => onLike(c.id)}
              data-testid={`like-reply-${c.id}`}
              className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--accent-2)] transition"
            >
              <Heart size={13} className={liked ? "text-[var(--accent-2)] fill-[var(--accent-2)]" : ""} />
              {c.likes + (liked ? 1 : 0)}
            </button>
            <button className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] transition">
              <MessageCircle size={13} /> Reply
            </button>
            <button className="text-[var(--text-dim)] hover:text-[var(--text)]"><MoreHorizontal size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentCard({ c, onLike, likedMap }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  return (
    <div data-testid={`comment-${c.id}`}>
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 rounded-full shrink-0 border border-[var(--border-2)]" style={{ background: `radial-gradient(circle at 30% 30%, ${c.avatarColor}, #1a1612)` }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-medium text-[13.5px]">{c.author}</span>
            {c.verified && <Star size={11} className="text-[var(--accent-2)]" fill="var(--accent-2)" />}
            <span className="text-[11px] text-[var(--text-dim)]">· {c.time}</span>
            {c.topArgument && (
              <span className="ml-auto px-2 py-0.5 rounded-md border border-[var(--accent)]/40 text-[10px] text-[var(--accent-2)]" data-testid="top-argument-badge">
                Top Argument
              </span>
            )}
          </div>
          {c.badges && c.badges.map((b) => (
            <div key={b} className="text-[11px] text-[var(--text-muted)] mb-2">{b}</div>
          ))}
          <p className="text-[13px] text-[var(--text)]/90 leading-relaxed">{c.text}</p>

          <div className="flex items-center gap-5 mt-3">
            <button
              onClick={() => onLike(c.id)}
              data-testid={`like-${c.id}`}
              className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--accent-2)] transition"
            >
              <Heart size={13} className={likedMap[c.id] ? "text-[var(--accent-2)] fill-[var(--accent-2)]" : ""} />
              {c.likes + (likedMap[c.id] ? 1 : 0)}
            </button>
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              data-testid={`reply-${c.id}`}
              className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] transition"
            >
              <MessageCircle size={13} /> Reply
            </button>
            <button className="text-[var(--text-dim)] hover:text-[var(--text)]"><MoreHorizontal size={14} /></button>
          </div>

          {showReplyInput && (
            <div className="mt-3 flex gap-2" data-testid={`reply-input-${c.id}`}>
              <input
                placeholder="Write a reply..."
                className="flex-1 bg-[var(--panel-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-[12px] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)]/40"
              />
              <button className="btn-accent rounded-lg px-3 text-[12px]">Send</button>
            </div>
          )}
        </div>
      </div>

      {c.replies && c.replies.length > 0 && (
        <div className="space-y-3 mb-3">
          {c.replies.map((r) => (
            <ReplyCard key={r.id} c={r} onLike={onLike} liked={likedMap[r.id]} />
          ))}
        </div>
      )}

      {c.moreReplies > 0 && (
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="ml-12 text-[11.5px] text-[var(--accent-2)] hover:underline flex items-center gap-1 mb-3"
          data-testid={`more-replies-${c.id}`}
        >
          View {c.moreReplies} more replies <ChevronDown size={12} className={showReplies ? "rotate-180 transition" : "transition"} />
        </button>
      )}
    </div>
  );
}

export default function DebateDetail() {
  const { id } = useParams();
  const d = debateDetail;
  const [vote, setVote] = useState("C");
  const [likedComments, setLikedComments] = useState({});
  const [activeTab, setActiveTab] = useState("Top");

  const selectedOpt = d.options.find((o) => o.letter === vote);
  const total = d.options.reduce((sum, o) => sum + o.votes, 0);

  // Donut chart calc
  let cumulative = 0;
  const colors = ["#56536b", "#a78bfa", "#8b5cf6", "#6d28d9"];
  const segments = d.options.map((o, i) => {
    const pct = (o.votes / total) * 100;
    const start = cumulative;
    cumulative += pct;
    return { start, end: cumulative, color: colors[i], label: o.letter, pct: o.pct, votes: o.votes };
  });

  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const a = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };
  const arcPath = (cx, cy, r, startPct, endPct) => {
    const startA = (startPct / 100) * 360;
    const endA = (endPct / 100) * 360;
    const s = polarToCartesian(cx, cy, r, endA);
    const e = polarToCartesian(cx, cy, r, startA);
    const large = endA - startA > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
  };

  return (
    <div className="flex gap-6 min-w-0" data-testid="debate-detail-page">
      <div className="flex-1 min-w-0 space-y-7 fade-in-up">
        <Link to="/debates" className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] inline-flex items-center gap-1" data-testid="back-to-debates">
          ← Back to all debates
        </Link>

        {/* Hero */}
        <div className="card-panel p-7 relative overflow-hidden" style={{ background: d.heroBg }} data-testid="debate-hero">
          <div className="absolute right-0 top-0 bottom-0 w-[300px] hidden lg:block" style={{ background: "radial-gradient(circle at 70% 50%, rgba(139,92,246,0.18), transparent 70%)" }}/>
          <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
            <button className="card-panel px-3 py-1.5 text-[12px] flex items-center gap-1.5 hover:border-[var(--accent)]/40 transition" data-testid="save-btn">
              <Bookmark size={13} /> Save
            </button>
            <button className="card-panel px-3 py-1.5 text-[12px] flex items-center gap-1.5 hover:border-[var(--accent)]/40 transition" data-testid="share-btn">
              <Share2 size={13} /> Share
            </button>
            <button className="card-panel w-9 h-8 flex items-center justify-center hover:border-[var(--accent)]/40 transition"><MoreHorizontal size={13} /></button>
          </div>
          <div className="relative max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Flame size={13} className="text-[#ef4444]" />
              <span className="text-[10.5px] tracking-[0.18em] uppercase font-semibold text-[#ef4444]">{d.badge}</span>
            </div>
            <h1 className="font-serif text-[28px] sm:text-[36px] leading-[1.1] mb-3">{d.title}</h1>
            <p className="text-[13px] text-[var(--text-muted)] mb-5">{d.subtitle}</p>
            <div className="flex flex-wrap items-center gap-3 text-[11.5px] text-[var(--text-muted)]">
              <div className="flex -space-x-2">
                {d.voterAvatarColors.map((c, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-[var(--panel)]" style={{ background: `linear-gradient(135deg, ${c}, #1a1612)` }} />
                ))}
              </div>
              <span>{d.totalVotes} votes</span>
              <span className="text-[var(--text-dim)]">·</span>
              <span>{d.comments} comments</span>
              <span className="text-[var(--text-dim)]">·</span>
              <span>Started by <span className="text-[var(--text)]">{d.startedBy}</span></span>
              <span className="text-[var(--text-dim)]">·</span>
              <span className="text-[var(--accent-2)]">{d.timeLeft}</span>
            </div>
          </div>
        </div>

        {/* Pick A Side */}
        <div>
          <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--text-muted)] mb-4">Pick A Side</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" data-testid="pick-a-side">
            {d.options.map((opt) => (
              <OptionCard key={opt.letter} opt={opt} selected={vote === opt.letter} onSelect={setVote} />
            ))}
          </div>

          {/* Voted indicator */}
          {selectedOpt && (
            <div className="mt-4 card-panel px-5 py-3 flex items-center justify-between gap-3" data-testid="voted-indicator">
              <span className="text-[12.5px] text-[var(--text-muted)]">
                You voted for: <span className="text-[var(--accent-2)] font-medium">{selectedOpt.letter}) {selectedOpt.title}</span>, {selectedOpt.desc}
              </span>
              <button className="text-[12px] text-[var(--text)] flex items-center gap-1 hover:text-[var(--accent-2)]" data-testid="change-vote-btn">
                Change Vote <ChevronRight size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Comments tabs */}
        <div>
          <div className="flex gap-6 border-b border-[var(--border)] mb-5" data-testid="comments-tabs">
            {["Top", "New", "Controversial"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                data-testid={`comments-tab-${t.toLowerCase()}`}
                className={`pb-3 text-[13px] relative ${activeTab === t ? "text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}
              >
                {t}
                {activeTab === t && <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--accent)]" />}
              </button>
            ))}
          </div>

          <div className="space-y-6" data-testid="comments-list">
            {initialComments.map((c) => (
              <CommentCard
                key={c.id}
                c={c}
                onLike={(cid) => setLikedComments({ ...likedComments, [cid]: !likedComments[cid] })}
                likedMap={likedComments}
              />
            ))}
          </div>

          {/* Add comment */}
          <div className="mt-7 card-panel p-4 flex gap-3" data-testid="add-comment">
            <div className="w-9 h-9 rounded-full shrink-0" style={{ background: "linear-gradient(135deg, #c2a876, #3a2a1a)" }} />
            <input
              placeholder="Share your take on this debate..."
              className="flex-1 bg-transparent border-0 text-[13px] focus:outline-none placeholder:text-[var(--text-dim)]"
              data-testid="add-comment-input"
            />
            <button className="btn-accent rounded-lg px-4 text-[12.5px]">Post</button>
          </div>
        </div>
      </div>

      {/* Right rail */}
      <aside className="hidden xl:block w-[280px] shrink-0 space-y-6 fade-in-up" data-testid="debate-right-rail">
        {/* Results donut */}
        <div className="card-panel p-5" data-testid="results-card">
          <div className="text-[10.5px] tracking-[0.18em] uppercase text-[var(--text-muted)] mb-4">Results</div>
          <div className="flex items-center gap-5">
            <div className="relative w-[110px] h-[110px] shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="14"/>
                {segments.map((s, i) => (
                  <path
                    key={i}
                    d={arcPath(50, 50, 40, s.start, s.end)}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="14"
                    strokeLinecap="butt"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="font-serif text-[18px] leading-none">{d.totalVotes}</div>
                <div className="text-[9.5px] text-[var(--text-dim)] uppercase tracking-wider mt-1">votes</div>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {segments.map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-[12px]">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
                  <span className="font-medium w-3">{s.label}</span>
                  <span className="text-[var(--text-muted)] ml-auto">{s.pct}% ({s.votes >= 1000 ? `${(s.votes/1000).toFixed(1)}K` : s.votes})</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="font-serif text-[20px]">{d.totalVotes}</div>
              <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider">Total votes</div>
            </div>
            <div>
              <div className="font-serif text-[20px]">{d.comments}</div>
              <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider">Comments</div>
            </div>
          </div>
        </div>

        {/* Top Arguments */}
        <div className="card-panel p-5" data-testid="top-arguments">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10.5px] tracking-[0.18em] uppercase text-[var(--text-muted)]">Top Arguments</div>
            <button className="text-[11px] text-[var(--accent-2)] hover:underline">View all</button>
          </div>
          <div className="space-y-4">
            {d.topArguments.map((a) => {
              const Ic = a.icon ? ICON_MAP[a.icon] : null;
              return (
                <div key={a.id} className="flex gap-3" data-testid={`top-arg-${a.id}`}>
                  <div className="w-12 h-12 rounded-md shrink-0 flex items-center justify-center cover" style={{ background: a.image || `linear-gradient(135deg, ${a.avatarColor}40, #1a1612)` }}>
                    {Ic && <Ic size={18} className="text-[var(--accent-2)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[var(--text)]/90 leading-snug mb-1.5">{a.text}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[var(--text-muted)]">{a.author}</span>
                      <span className="text-[11px] text-[var(--accent-2)] flex items-center gap-1">
                        <Heart size={10} /> {a.likes}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="mt-4 w-full border border-[var(--border-2)] rounded-lg py-1.5 text-[11.5px] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent)]/40">
            View all top arguments
          </button>
        </div>

        {/* Related Debates */}
        <div className="card-panel p-5" data-testid="related-debates">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10.5px] tracking-[0.18em] uppercase text-[var(--text-muted)]">Related Debates</div>
            <button className="text-[11px] text-[var(--accent-2)] hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {d.relatedDebates.map((r) => (
              <Link key={r.id} to={`/debates/${r.id}`} className="flex gap-3 group" data-testid={`related-${r.id}`}>
                <div className="w-14 h-14 rounded-md shrink-0 cover" style={{ background: r.cover }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] leading-snug group-hover:text-[var(--accent-2)] transition">{r.title}</div>
                  <div className="text-[10.5px] text-[var(--text-dim)] mt-0.5">{r.votes} votes · {r.comments} comments</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Vinyl CTA */}
        <div className="card-panel p-5 relative overflow-hidden" data-testid="vinyl-cta">
          <div className="absolute -bottom-6 -right-6 opacity-25">
            <Target size={90} className="text-[var(--accent)]"/>
          </div>
          <div className="text-[10.5px] tracking-[0.18em] uppercase text-[var(--accent-2)] mb-2 relative">Looking For Beatles Vinyl?</div>
          <p className="text-[12px] text-[var(--text-muted)] mb-4 relative">Find it. Hunt it. Add it to your collection.</p>
          <button className="border border-[var(--accent)]/40 text-[var(--accent-2)] text-[12px] px-4 py-2 rounded-lg flex items-center gap-1.5 hover:bg-[var(--accent-soft)] transition relative" data-testid="create-hunt-btn">
            <Target size={12} /> Create a hunt request
          </button>
        </div>
      </aside>
    </div>
  );
}
