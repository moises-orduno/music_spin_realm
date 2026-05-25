import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Heart, MessageCircle, Users, Eye, Shuffle, Bookmark, Share2, MoreHorizontal,
  ChevronDown, Check, ArrowRight, ArrowLeft,
} from "lucide-react";
import { listDetail } from "../data/listDetail";

const TABS = [
  { id: "list", label: "The List" },
  { id: "discussion", label: "Discussion", count: "2.1K" },
  { id: "remixes", label: "Remixes", count: "820" },
];

function StatBlock({ Icon, value, label }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={16} className="text-[var(--text-muted)]" strokeWidth={1.6} />
      <div>
        <div className="text-[15px] font-medium leading-none">{value}</div>
        <div className="text-[10.5px] text-[var(--text-dim)] uppercase tracking-wider mt-1">{label}</div>
      </div>
    </div>
  );
}

function RemixRow({ r }) {
  return (
    <div className="card-panel p-5 flex items-start gap-5" data-testid={`remix-${r.id}`}>
      <div className="font-serif text-[28px] text-[var(--accent)] w-8 shrink-0 text-center">{r.rank}</div>

      {/* 2x2 mosaic placeholder */}
      <div className="w-[100px] h-[100px] grid grid-cols-2 grid-rows-2 gap-[2px] shrink-0 rounded overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="cover" style={{ background: `linear-gradient(135deg, hsl(${(r.id * 60 + i * 80) % 360}, 40%, 40%), hsl(${(r.id * 60 + i * 80 + 30) % 360}, 30%, 20%))` }} />
        ))}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-serif text-[18px] leading-tight">{r.title}</h3>
        <div className="text-[12px] text-[var(--text-muted)] mb-2">by <span className="text-[var(--accent-2)]">{r.author}</span></div>
        <p className="text-[12.5px] text-[var(--text-muted)] leading-snug max-w-md">{r.desc}</p>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-2 min-w-[100px]">
        <button className="text-[var(--text-dim)] hover:text-[var(--text)] self-end"><MoreHorizontal size={15} /></button>
        <div className="flex items-center gap-1.5 text-[12px] text-[var(--text)]/85"><Heart size={12} /> {r.likes}</div>
        <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]"><MessageCircle size={12} /> {r.comments}</div>
        <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]"><Users size={12} /> +{r.additions} additions</div>
        <div className="text-[11px] text-[var(--text-dim)]">{r.time}</div>
      </div>
    </div>
  );
}

export default function ListDetail() {
  const { id } = useParams();
  const d = listDetail;
  const [tab, setTab] = useState("remixes");
  const [sort, setSort] = useState("Most Popular");
  const [showSort, setShowSort] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex gap-6 min-w-0" data-testid="list-detail-page">
      <div className="flex-1 min-w-0 space-y-6 fade-in-up">
        <Link to="/tops" className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] inline-flex items-center gap-1.5" data-testid="back-to-tops">
          <ArrowLeft size={13} /> Back to list
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8" data-testid="list-header">
          <div
            className="w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] rounded-lg shrink-0 cover"
            style={{ background: d.cover }}
            data-testid="list-cover"
          />
          <div className="flex-1 min-w-0">
            <span className="inline-block px-2.5 py-1 rounded text-[10.5px] tracking-[0.15em] uppercase font-semibold bg-[var(--accent-soft)] text-[var(--accent-2)] border border-[var(--accent)]/30 mb-3" data-testid="list-badge">
              {d.badge}
            </span>
            <h1 className="font-serif text-[34px] sm:text-[44px] leading-none mb-1">{d.title}</h1>
            <div className="text-[12.5px] text-[var(--text-muted)] mb-4">by <span className="text-[var(--accent-2)]">{d.author}</span></div>
            <p className="text-[13.5px] text-[var(--text-muted)] mb-5 whitespace-pre-line max-w-xl">{d.description}</p>

            <div className="flex flex-wrap items-center gap-6 mb-5">
              <StatBlock Icon={Heart} value={d.likes} label="Likes" />
              <StatBlock Icon={MessageCircle} value={d.comments} label="Comments" />
              <StatBlock Icon={Users} value={d.remixes} label="Remixes" />
              <StatBlock Icon={Eye} value={d.views} label="Views" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button className="btn-accent rounded-lg px-5 py-2.5 text-[13px] flex items-center gap-2" data-testid="remix-list-btn">
                <Shuffle size={14} /> Remix this list
              </button>
              <button
                onClick={() => setSaved(!saved)}
                data-testid="save-list-btn"
                className={`rounded-lg px-5 py-2.5 text-[13px] flex items-center gap-2 border transition ${
                  saved ? "border-[var(--accent)]/40 text-[var(--accent-2)] bg-[var(--accent-soft)]" : "border-[var(--border-2)] hover:border-[var(--accent)]/40"
                }`}
              >
                <Bookmark size={14} className={saved ? "fill-current" : ""} /> {saved ? "Saved" : "Save"}
              </button>
              <button className="w-10 h-10 rounded-lg border border-[var(--border-2)] flex items-center justify-center hover:border-[var(--accent)]/40 transition"><Share2 size={14} /></button>
              <button className="w-10 h-10 rounded-lg border border-[var(--border-2)] flex items-center justify-center hover:border-[var(--accent)]/40 transition"><MoreHorizontal size={14} /></button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-[var(--border)] overflow-x-auto" data-testid="list-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              data-testid={`tab-${t.id}`}
              className={`pb-3 text-[13.5px] whitespace-nowrap relative flex items-center gap-2 ${tab === t.id ? "text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}
            >
              {t.label}
              {t.count && <span className="text-[11px] text-[var(--text-muted)]">{t.count}</span>}
              {tab === t.id && <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--accent)]" />}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "remixes" && (
          <div className="space-y-5" data-testid="remixes-content">
            <div className="flex items-center justify-between">
              <p className="text-[12.5px] text-[var(--text-muted)]">Remixes of this list created by the community.</p>
              <div className="relative">
                <button onClick={() => setShowSort(!showSort)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-[12.5px] hover:border-[var(--border-2)]" data-testid="sort-dropdown">
                  {sort} <ChevronDown size={13} className={showSort ? "rotate-180 transition" : "transition"} />
                </button>
                {showSort && (
                  <div className="absolute right-0 top-full mt-1 w-[180px] card-panel py-1.5 z-30">
                    {["Most Popular", "Newest", "Most Liked"].map((s) => (
                      <button key={s} onClick={() => { setSort(s); setShowSort(false); }} className={`w-full text-left px-4 py-2 text-[12.5px] hover:bg-[var(--accent-soft)] ${s === sort ? "text-[var(--accent-2)]" : "text-[var(--text-muted)]"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              {d.remixList.map((r) => <RemixRow key={r.id} r={r} />)}
            </div>
            <button className="w-full card-panel py-3 text-[12.5px] text-[var(--text-muted)] hover:text-[var(--accent-2)] flex items-center justify-center gap-1.5" data-testid="load-more-remixes">
              Load more remixes <ChevronDown size={13} />
            </button>
          </div>
        )}

        {tab === "list" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4" data-testid="list-content">
            {d.albums.map((a) => (
              <div key={a.rank} className="card-panel overflow-hidden hover-lift cursor-pointer" data-testid={`album-${a.rank}`}>
                <div className="aspect-square relative cover" style={{ background: a.cover }}>
                  <div className="absolute top-2 left-2 w-7 h-7 rounded bg-[rgba(0,0,0,0.7)] backdrop-blur flex items-center justify-center text-[13px] font-serif">{a.rank}</div>
                </div>
                <div className="p-3">
                  <div className="text-[13px] font-medium truncate">{a.title}</div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate">{a.artist} · {a.year}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "discussion" && (
          <div className="space-y-4" data-testid="discussion-content">
            {d.discussion.map((c) => (
              <div key={c.id} className="card-panel p-5 flex gap-3" data-testid={`discuss-${c.id}`}>
                <div className="w-10 h-10 rounded-full shrink-0" style={{ background: `radial-gradient(circle at 30% 30%, ${c.avatarColor}, #1a1612)` }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-[13.5px]">{c.author}</span>
                    <span className="text-[11px] text-[var(--text-dim)]">· {c.time}</span>
                  </div>
                  <p className="text-[13px] text-[var(--text)]/90 leading-relaxed">{c.text}</p>
                  <div className="flex items-center gap-4 mt-3 text-[11.5px] text-[var(--text-muted)]">
                    <button className="flex items-center gap-1 hover:text-[var(--accent-2)]"><Heart size={12} /> {c.likes}</button>
                    <button className="flex items-center gap-1 hover:text-[var(--text)]"><MessageCircle size={12} /> Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right rail */}
      <aside className="hidden xl:block w-[300px] shrink-0 space-y-6 fade-in-up" data-testid="list-right-rail">
        {/* About */}
        <div className="card-panel p-5" data-testid="about-card">
          <div className="text-[13.5px] font-medium mb-3">About this remix list</div>
          <p className="text-[12px] text-[var(--text-muted)] mb-4">Anyone can remix this list and add their own twist.</p>
          <div className="text-[11px] tracking-wider text-[var(--text-dim)] uppercase mb-1">Open for remixes</div>
          <div className="text-[13px] text-[var(--accent-2)] mb-4">{d.openForRemixes ? "Yes" : "No"}</div>
          <div className="text-[11px] tracking-wider text-[var(--text-dim)] uppercase mb-2">Original list by</div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full" style={{ background: "linear-gradient(135deg, #c2a876, #3a2a1a)" }} />
            <span className="text-[12.5px]">{d.author}</span>
          </div>
          <button className="w-full border border-[var(--border-2)] py-2 rounded-lg text-[12px] text-[var(--text-muted)] hover:text-[var(--accent-2)] hover:border-[var(--accent)]/40" data-testid="view-original-list">
            View original list
          </button>
        </div>

        {/* Remix Stats */}
        <div className="card-panel p-5" data-testid="remix-stats-card">
          <div className="text-[13.5px] font-medium mb-4">Remix Stats</div>
          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <div>
              <div className="font-serif text-[20px]">{d.stats.remixes}</div>
              <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider">Remixes</div>
            </div>
            <div>
              <div className="font-serif text-[20px]">{d.stats.users}</div>
              <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider">Users</div>
            </div>
            <div>
              <div className="font-serif text-[20px]">{d.stats.additions}</div>
              <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider">Total additions</div>
            </div>
          </div>
          {/* Mini bar chart */}
          <div className="flex items-end gap-1 h-[60px]">
            {[35, 55, 45, 70, 60, 80, 50, 90, 65, 55, 75, 45, 60, 40, 50, 35, 30, 20].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-[var(--accent)]" style={{ height: `${h}%`, opacity: 0.6 + (i / 30) }} />
            ))}
          </div>
        </div>

        {/* Top remixers */}
        <div className="card-panel p-5" data-testid="top-remixers">
          <div className="text-[13.5px] font-medium mb-4">Top remixers</div>
          <div className="space-y-3">
            {d.topRemixers.map((u, i) => (
              <div key={u.handle} className="flex items-center gap-3" data-testid={`remixer-${i + 1}`}>
                <span className="text-[var(--accent)] font-serif text-[15px] w-4">{i + 1}</span>
                <div className="w-9 h-9 rounded-full shrink-0" style={{ background: `linear-gradient(135deg, ${u.color}, #1a1612)` }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] truncate">{u.handle}</div>
                  <div className="text-[10.5px] text-[var(--text-muted)]">{u.remixes} remixes</div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full border border-[var(--border-2)] py-1.5 rounded-lg text-[11.5px] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent)]/40">
            View all remixers
          </button>
        </div>

        {/* Recent Activity */}
        <div className="card-panel p-5" data-testid="recent-activity-card">
          <div className="text-[13.5px] font-medium mb-4">Recent Activity</div>
          <div className="space-y-3">
            {d.recentActivity.map((a, i) => (
              <div key={i} className="flex gap-3" data-testid={`activity-${i}`}>
                <div className="w-8 h-8 rounded-full shrink-0" style={{ background: `linear-gradient(135deg, hsl(${i * 80}, 35%, 45%), #1a1612)` }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] truncate">{a.handle}</div>
                  <div className="text-[11px] text-[var(--text-muted)] leading-snug">{a.text}</div>
                </div>
                <div className="text-[10.5px] text-[var(--text-dim)] shrink-0">{a.time}</div>
              </div>
            ))}
          </div>
          <button className="mt-4 text-[11.5px] text-[var(--accent-2)] hover:underline flex items-center gap-1">
            View all activity <ArrowRight size={11} />
          </button>
        </div>

        {/* Rules */}
        <div className="card-panel p-5" data-testid="rules-card">
          <div className="text-[13.5px] font-medium mb-3">Rules for remixes</div>
          <ul className="space-y-2.5">
            {d.rules.map((r) => (
              <li key={r} className="flex gap-2.5 text-[12.5px] text-[var(--text)]/85">
                <Check size={13} className="text-[var(--accent-2)] mt-0.5 shrink-0" strokeWidth={2.5} />
                {r}
              </li>
            ))}
          </ul>
          <button className="mt-4 text-[11.5px] text-[var(--accent-2)] hover:underline flex items-center gap-1">
            Read full guidelines <ArrowRight size={11} />
          </button>
        </div>
      </aside>
    </div>
  );
}
