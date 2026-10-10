import React, { useState, useEffect } from "react";
import { Crown, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { SectionTitle } from "../components/ui-bits";
import { useNavigate, Link } from "react-router-dom";

import { getDebates, getRandomDebate } from "../services/debateService";
import { getLists } from "../services/listService";
import { getProfiles } from "../services/userService";

const formatTitle = (text, maxLineLength = 20) => {
  const words = text.trim().split(/\s+/);
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine
      ? `${currentLine} ${word}`
      : word;

    if (candidate.length <= maxLineLength || !currentLine) {
      currentLine = candidate;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

function FormattedTitle({ text }) {
  const lines = formatTitle(text, 20);

  return (
    <h1 className="font-serif text-[30px] sm:text-[38px] lg:text-[44px] leading-[1.05] font-normal mb-4">
      {lines.map((line, index) => (
        <span key={index} className="block">
          {line}
        </span>
      ))}
    </h1>
  );
}

export default function Home() {

  const [debates, setDebates] = useState([]);
  const [loadingDebates, setLoadingDebates] = useState(true);
  const [lists, setLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [debateOfTheDay, setDebateOfTheDay] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleDebateClick = (debate) => {
    navigate(`/debates/${debate.id}`);
  };

  const handleListClick = (list) => {
    navigate(`/lists/${list.id}`);
  };

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

    const loadLists = async () => {
      try {
        setLoadingLists(true);
        setError(null);

        const data = await getLists();
        setLists(data);

      } catch (err) {
        setError(err.message || "Failed to load lists");
        console.log(err);
      } finally {
        setLoadingLists(false);
      }
    };


    const loadProfiles = async () => {
      try {
        setLoadingProfiles(true);
        setError(null);

        const data = await getProfiles();
        setProfiles(data);

      } catch (err) {
        setError(err.message || "Failed to load profiles");
        console.log(err);
      } finally {
        setLoadingProfiles(false);
      }
    };

    const loadRandomDebate = async () => {
      try {

        const data = await getRandomDebate();
        setDebateOfTheDay(data);

      } catch (err) {
        setError(err.message || "Failed to load debates");
      } finally {
        setLoadingDebates(false);
      }
    };

    loadRandomDebate();

    loadProfiles();

    loadDebates();

    loadLists();

  }, []);

  return (
    <div className="space-y-10 fade-in-up" data-testid="home-page">
      {/* Hero — Music Court */}
      <section
        className="relative overflow-hidden rounded-2xl border border-[var(--border)] p-6 sm:p-8 lg:p-10 min-h-[320px] sm:min-h-[360px] flex items-center grain"
        style={{
          background:
            "linear-gradient(115deg, #0f0d0b 0%, #1a1612 40%, #2a2018 60%, #0a0806 100%), radial-gradient(circle at 70% 50%, rgba(100,80,50,0.25), transparent 60%)",
        }}
        data-testid="hero-music-court"
      >
        {debateOfTheDay ?
          <div className="relative z-10 max-w-[540px]">
            <div className="flex items-center gap-2 mb-5">
              <Crown size={14} className="text-[var(--accent)]" />
              <span className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)]">Music Court</span>
            </div>
            <FormattedTitle text={debateOfTheDay.title} />
            <p className="text-[14px] text-[var(--text-muted)] mb-7 max-w-[420px]">
              Defend your pick. Convince the court.
            </p>
            <div className="flex items-center gap-3 mb-7">
              <button className="btn-accent w-full rounded-full py-2 text-[12px]"
                data-testid="join-debate-btn"
                onClick={() => handleDebateClick(debateOfTheDay)}>
                Join the debate
              </button>
              <Link to="/debates">
                <button className="text-[13px] text-[var(--text)] flex items-center gap-1.5 px-4 py-2.5 btn-ghost">
                  See all debates <ArrowRight size={14} />
                </button>
              </Link>
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
                <span className="text-[var(--text)] font-medium">{debateOfTheDay.comments}</span> defending their picks
              </span>
            </div>
          </div>
          : <div>Loading debates...</div>}

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

      </section>

      {/* Top Debates This Week */}
      <section data-testid="top-debates-section">
        <SectionTitle
          action={
            <Link to="/debates">
              <button
                className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--accent)]"
                data-testid="view-all-debates"
              >
                View all Debates
                <ArrowRight size={12} />
              </button>
            </Link>
          }
        >
          Top Debates This Week
        </SectionTitle>
        {loadingDebates ? (
          <div>Loading debates...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4" >
            {debates.slice(0, 5).map((d) => (
              <div
                key={d.id}
                className="card-panel hover-lift p-0 overflow-hidden cursor-pointer"
                onClick={() => handleDebateClick(d)}
              >
                <div
                  className="aspect-[4/5] w-full relative"
                  style={{
                    backgroundImage: `url(${d.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.85)] via-transparent to-transparent" />

                  {/* Badge */}
                  {d.badge && (
                    <div
                      className="absolute top-3 left-3 text-[10px] px-2 py-1 rounded"
                      style={{ backgroundColor: d.badge_color }}
                    >
                      {d.badge}
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-serif text-[16px] leading-tight mb-2">
                      {d.title}
                    </h3>

                    <div className="text-[11px] text-[var(--text-muted)] mb-1">
                      {d.subtitle}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span>
                        💬 {d.comments} comments
                      </span>

                      <span>
                        👁 {d.views} views
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tops by the Community */}
      <section data-testid="tops-section">
        <SectionTitle
          action={
            <Link
              to="/topLists"
              className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--accent)]"
            >
              View all tops <ArrowRight size={12} />
            </Link>
          }
        >
          Tops by the Community
        </SectionTitle>

        {loadingLists ? (
          <div>Loading Lists...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {lists.map((list) => (
              <div
                key={list.id}
                className="card-panel hover-lift overflow-hidden cursor-pointer"
                onClick={() => handleListClick(list)}
              >
                <div
                  className="h-[120px] relative bg-cover bg-center"
                  style={{
                    backgroundImage: list.image
                      ? `url(${list.image})`
                      : list.recent_albums[0]?.cover_url
                        ? `url(${list.recent_albums[0].cover_url})`
                        : undefined,
                    backgroundColor: "#333",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(0,0,0,0.6)]" />

                  <div className="absolute bottom-3 left-4 text-[10.5px] tracking-[0.15em] uppercase text-[var(--accent)] font-medium">
                    {list.title}
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  {list.recent_albums.slice(0, 3).map((album, index) => (
                    <div key={album.id} className="flex items-center gap-3">
                      <span className="text-[13px] text-[var(--text-dim)] w-3">
                        {(album.position + 1)}
                      </span>

                      <div className="min-w-0">
                        <div className="text-[13px] truncate">
                          {album.album.title}
                        </div>

                        <div className="text-[10.5px] text-[var(--text-muted)] truncate">
                          {album.album.artist}
                        </div>
                      </div>
                    </div>
                  ))}

                  {list.items_count > 3 && (
                    <div className="text-[10.5px] text-[var(--text-dim)] pt-1">
                      + {list.items_count - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Collector Spotlight */}
      <section data-testid="collector-spotlight-section">

        <SectionTitle
          action={
            <Link
              to="/people"
              className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--accent)]"
            >
              View all people <ArrowRight size={12} />
            </Link>
          }
        >
          Collector Spotlight
        </SectionTitle>

        {loadingProfiles ? (
          <div>Loading profiles...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {profiles.slice(0, 4).map((s) => (
              <div key={s.id} className="card-panel hover-lift p-5 cursor-pointer" data-testid={`spotlight-${s.id}`}>
                <div className="flex gap-4 mb-3">
                  <div
                    className="w-[60px] h-[60px] rounded-full shrink-0"
                    style={{ background: `linear-gradient(135deg, ${s.avatarColor}, #1a1612)` }}
                  />
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-medium truncate">{s.display_name}</div>
                  </div>
                </div>
                <p className="font-serif text-[14px] italic text-[var(--text)]/85 leading-snug mb-3">
                  “{s.bio}”
                </p>
                <div className="text-[10.5px] text-[var(--text-dim)]">{s.followers_count} followers</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
