import React, { useState } from "react";
import { MapPin, Music, Calendar, Star, Crown, Target, MoreHorizontal, CheckCircle2, ArrowRight, Plus } from "lucide-react";
import { profile } from "../data/profile";

function Stat({ value, label, testid }) {
  return (
    <div className="text-center sm:text-left" data-testid={testid}>
      <div className="text-[20px] sm:text-[22px] font-serif">{value}</div>
      <div className="text-[10.5px] text-[var(--text-muted)] uppercase tracking-wider">{label}</div>
    </div>
  );
}

function Badge({ label, color, bg }) {
  return (
    <span
      className="px-3 py-1 rounded-full text-[11.5px] border inline-flex items-center gap-1.5"
      style={{ color, background: bg, borderColor: `${color}30` }}
    >
      {label === "Collector" && <Crown size={11} />}
      {label === "Top 1% Debater" && <Star size={11} />}
      {label === "Vinyl Hunter" && <Target size={11} />}
      {label}
    </span>
  );
}

function CircleProgress({ value }) {
  const r = 28, c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(232,213,160,0.15)" strokeWidth="4" />
      <circle cx="36" cy="36" r={r} fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
    </svg>
  );
}

const TABS = ["Top 10", "Collection", "Hunt List", "Activity", "Playlists"];

function ProfileRightPanel() {
  return (
    <div className="space-y-7">
      {/* About */}
      <div className="card-panel p-5" data-testid="about-card">
        <div className="text-[14px] font-medium mb-3">About</div>
        <p className="text-[12.5px] text-[var(--text-muted)] whitespace-pre-line leading-relaxed mb-4">{profile.bio}</p>
        <div className="text-[11px] tracking-wider text-[var(--text-dim)] uppercase mb-2">Genres</div>
        <div className="flex flex-wrap gap-1.5">
          {profile.genres.map((g) => (
            <span key={g} className="px-2.5 py-1 rounded-full text-[11px] border border-[var(--border-2)] text-[var(--text-muted)]">{g}</span>
          ))}
        </div>
      </div>

      {/* Current Top 5 */}
      <div data-testid="top5-card">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[13.5px] font-medium">Current Top 5 This Month</div>
          <button className="text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-1">View all <ArrowRight size={11}/></button>
        </div>
        <div className="space-y-3">
          {profile.top5Month.map((a) => (
            <div key={a.rank} className="flex items-center gap-3" data-testid={`top5-${a.rank}`}>
              <span className="text-[var(--text-dim)] text-[13px] w-3">{a.rank}</span>
              <div className="w-[40px] h-[40px] rounded cover" style={{ background: a.cover }} />
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] truncate">{a.title}</div>
                <div className="text-[10.5px] text-[var(--text-muted)] truncate">{a.artist}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hunt List */}
      <div data-testid="hunt-card">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[13.5px] font-medium">Hunt List</div>
          <button className="text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-1">View all <ArrowRight size={11}/></button>
        </div>
        <div className="space-y-3">
          {profile.huntList.map((h, i) => (
            <div key={h.id} className="flex items-center gap-3" data-testid={`hunt-${h.id}`}>
              <span className="text-[var(--text-dim)] text-[13px] w-3">{i + 1}</span>
              <div className="w-[40px] h-[40px] rounded cover cover-placeholder" style={{ background: `linear-gradient(135deg, #${(i * 444444 + 333333).toString(16).slice(0,6)}, #1a1612)` }} />
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] truncate">{h.title}</div>
                <div className="text-[10.5px] text-[var(--text-muted)] truncate">{h.sub}</div>
                <div className="text-[10px] text-[var(--text-dim)]">{h.detail}</div>
              </div>
              <div className="text-[12px] text-[var(--accent)] shrink-0">{h.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div data-testid="activity-card">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[13.5px] font-medium">Recent Activity</div>
          <button className="text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-1">View all <ArrowRight size={11}/></button>
        </div>
        <div className="space-y-3">
          {profile.activity.map((a) => (
            <div key={a.id} className="flex gap-2.5 items-start" data-testid={`activity-${a.id}`}>
              <div className="w-1 h-1 rounded-full bg-[var(--accent)] mt-2 shrink-0"/>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-[var(--text-muted)]">{a.text}</div>
                {a.target && <div className="text-[12.5px] mt-0.5">{a.target}</div>}
              </div>
              <div className="text-[10.5px] text-[var(--text-dim)] shrink-0">{a.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState("Top 10");
  const [followed, setFollowed] = useState(false);

  return (
    <div className="flex gap-6 min-w-0" data-testid="profile-page">
      <div className="flex-1 min-w-0 space-y-6 fade-in-up">
        {/* Profile header card */}
        <div className="card-panel p-5 sm:p-7">
          <div className="flex flex-col md:flex-row gap-6">
            <div
              className="w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] rounded-full shrink-0 border border-[var(--border-2)]"
              style={{ background: `radial-gradient(circle at 30% 30%, ${profile.avatarColor}, #1a1612)` }}
              data-testid="profile-avatar"
            />

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="font-serif text-[28px] sm:text-[34px] leading-none">{profile.handle}</h1>
                    {profile.premium && <Star size={16} fill="#b67dff" stroke="#b67dff" />}
                  </div>
                  <div className="text-[12.5px] text-[var(--text-muted)]">Collector since {profile.since}</div>
                  <p className="font-serif italic text-[14px] text-[var(--text)]/85 mt-3 max-w-md">"{profile.quote}"</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setFollowed(!followed)}
                    data-testid="follow-btn"
                    className={`px-5 py-2 rounded-full text-[12.5px] font-medium transition ${
                      followed ? "border border-[var(--border-2)] text-[var(--text-muted)]" : "btn-accent"
                    }`}
                  >
                    {followed ? "Following" : "Follow"}
                  </button>
                  <button className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center btn-ghost" data-testid="more-btn">
                    <MoreHorizontal size={15} />
                  </button>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-5" data-testid="badges">
                {profile.badges.map((b) => <Badge key={b.label} {...b} />)}
              </div>

              {/* Taste match + stats */}
              <div className="flex flex-wrap items-center justify-between gap-5">
                <div className="flex items-center gap-3" data-testid="taste-match">
                  <div className="relative">
                    <CircleProgress value={profile.tasteMatch} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="font-serif text-[18px] leading-none">{profile.tasteMatch}%</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Taste match</div>
                    <div className="text-[13px] text-[var(--accent)]">Great taste.</div>
                  </div>
                </div>

                <div className="flex items-center gap-5 sm:gap-7 flex-wrap">
                  <Stat value={profile.stats.debates} label="Debates" testid="stat-debates" />
                  <Stat value={profile.stats.comments} label="Comments" testid="stat-comments" />
                  <Stat value={profile.stats.top10s} label="Top 10s" testid="stat-top10s" />
                  <Stat value={profile.stats.followers} label="Followers" testid="stat-followers" />
                  <Stat value={profile.stats.following} label="Following" testid="stat-following" />
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 pt-5 border-t border-[var(--border)] text-[12px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5"><MapPin size={12} /> {profile.location}</span>
                <span className="flex items-center gap-1.5"><Music size={12} /> Mostly listens to: {profile.listens}</span>
                <span className="flex items-center gap-1.5"><Calendar size={12} /> Joined {profile.joined}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-7 border-b border-[var(--border)] overflow-x-auto" data-testid="profile-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              data-testid={`tab-${t.toLowerCase().replace(/\s/g, "-")}`}
              className={`pb-3 text-[13px] whitespace-nowrap transition relative ${
                activeTab === t ? "text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {t}
              {activeTab === t && <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--accent)]"/>}
            </button>
          ))}
        </div>

        {/* Tab content — Top 10 */}
        {activeTab === "Top 10" && (
          <div data-testid="top10-content">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-serif text-[20px]">Top 10 Albums of All Time</h2>
                <div className="text-[11.5px] text-[var(--text-muted)] mt-0.5">Updated 2 weeks ago</div>
              </div>
              <button className="text-[12px] text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-1">View full list <ArrowRight size={12}/></button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {profile.top10.map((a) => (
                <div key={a.rank} className="card-panel overflow-hidden hover-lift cursor-pointer" data-testid={`top10-album-${a.rank}`}>
                  <div className="aspect-square relative cover" style={{ background: a.cover }}>
                    <div className="absolute top-2 left-2 w-7 h-7 rounded bg-[rgba(0,0,0,0.7)] backdrop-blur flex items-center justify-center text-[13px] font-serif">{a.rank}</div>
                  </div>
                  <div className="p-3">
                    <div className="text-[13px] truncate font-medium">{a.title}</div>
                    <div className="text-[11px] text-[var(--text-muted)] truncate">{a.artist}</div>
                    <div className={`text-[10.5px] mt-1.5 flex items-center gap-1 ${a.status === "Owned" ? "text-[var(--accent-2)]" : "text-[#e8755a]"}`}>
                      {a.status === "Owned" ? <CheckCircle2 size={11} /> : <Target size={11} />}
                      {a.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-5 border border-[var(--border-2)] px-4 py-2 rounded-full text-[12px] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40" data-testid="edit-top10-btn">Edit Top 10</button>
          </div>
        )}

        {/* Collection tab — show owned albums */}
        {activeTab === "Collection" && (
          <div data-testid="collection-content">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-serif text-[20px]">Collection</h2>
                <div className="text-[11.5px] text-[var(--text-muted)] mt-0.5">142 albums owned</div>
              </div>
              <button className="text-[12px] text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-1">View all <ArrowRight size={12}/></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {profile.top10.filter((a) => a.status === "Owned").map((a) => (
                <div key={a.rank} className="card-panel overflow-hidden hover-lift cursor-pointer" data-testid={`collection-album-${a.rank}`}>
                  <div className="aspect-square cover" style={{ background: a.cover }} />
                  <div className="p-3">
                    <div className="text-[13px] truncate font-medium">{a.title}</div>
                    <div className="text-[11px] text-[var(--text-muted)] truncate">{a.artist}</div>
                    <div className="text-[10.5px] mt-1.5 text-[var(--accent-2)] flex items-center gap-1">
                      <CheckCircle2 size={11} /> Owned
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hunt List tab */}
        {activeTab === "Hunt List" && (
          <div data-testid="huntlist-content">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-[20px]">Hunt List</h2>
              <span className="text-[11.5px] text-[var(--text-muted)]">{profile.huntList.length} records being hunted</span>
            </div>
            <div className="space-y-3">
              {profile.huntList.map((h, i) => (
                <div key={h.id} className="card-panel p-4 flex items-center gap-4" data-testid={`huntlist-item-${h.id}`}>
                  <div className="w-14 h-14 rounded shrink-0 cover cover-placeholder" style={{ background: `linear-gradient(135deg, hsl(${i*80}, 35%, 35%), #1a1612)` }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium truncate">{h.title}</div>
                    <div className="text-[12px] text-[var(--text-muted)] truncate">{h.sub}</div>
                    <div className="text-[11px] text-[var(--text-dim)]">{h.detail}</div>
                  </div>
                  <div className="text-[16px] text-[var(--accent-2)] font-serif shrink-0">{h.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity tab */}
        {activeTab === "Activity" && (
          <div data-testid="activity-content">
            <h2 className="font-serif text-[20px] mb-4">Recent Activity</h2>
            <div className="card-panel p-5">
              <div className="space-y-4">
                {profile.activity.map((a) => (
                  <div key={a.id} className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 shrink-0"/>
                    <div className="flex-1">
                      <div className="text-[13px] text-[var(--text-muted)]">{a.text}</div>
                      {a.target && <div className="text-[14px] mt-0.5">{a.target}</div>}
                    </div>
                    <div className="text-[11px] text-[var(--text-dim)] shrink-0">{a.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Playlists tab */}
        {activeTab === "Playlists" && (
          <div className="card-panel p-10 text-center" data-testid="playlists-content">
            <div className="font-serif text-[20px] mb-2">Playlists</div>
            <p className="text-[13px] text-[var(--text-muted)]">No playlists yet. {profile.handle} hasn't published any playlists.</p>
          </div>
        )}

        {/* Top 10s by user */}
        <div data-testid="user-tops">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-[20px]">Top 10s by {profile.handle}</h2>
            <button className="text-[12px] text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-1">View all <ArrowRight size={12}/></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {profile.topsByUser.map((t) => (
              <div key={t.id} className="card-panel overflow-hidden hover-lift cursor-pointer" data-testid={`user-top-${t.id}`}>
                <div className="aspect-[4/3] cover" style={{ background: t.cover }} />
                <div className="p-3">
                  <div className="text-[13px] font-medium truncate">{t.title}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom right panel */}
      <aside className="hidden xl:block w-[300px] shrink-0 fade-in-up">
        <ProfileRightPanel />
      </aside>

      {/* Mobile right panel below content */}
      <div className="xl:hidden col-span-full"/>
    </div>
  );
}
