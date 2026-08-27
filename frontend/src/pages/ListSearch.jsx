import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Search, X, Plus, Clock } from "lucide-react";
import { getSearch } from "../services/albumService";

import { useLocation } from "react-router-dom";
const RECENT_KEY = "recentAlbumSearches";
const FILTERS = ["All", "Albums", "Artists", "Songs", "Decade"];

function loadRecent() {
  try {
    return JSON.parse(sessionStorage.getItem(RECENT_KEY) || "[]");
  } catch (_) {
    return [];
  }
}
function saveRecent(list) {
  try {
    sessionStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 6)));
  } catch (_) {
    /* noop */
  }
}

export default function ListSearch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const listId = id || "saddest-albums-ever";
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState(loadRecent());
  const inputRef = useRef(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { returnTo, storageKey } = location.state || {};

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const albums = await getSearch(query, 10, listId);

        setResults(albums);
      } catch (e) {
        console.error(e);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, listId]);

  const createEmptyDraft = () => ({
    title: "",
    description: "",
    category: "",
    items: [],
  });

  const handlePick = (album) => {
    let draft = JSON.parse(sessionStorage.getItem(storageKey));

    if (!draft) {
      draft = createEmptyDraft();
    }

    draft.items.push({
      id: crypto.randomUUID(),
      position: draft.items.length + 1,
      album,
      why_this_album: "",
      favorite_lyric: "",
      owned: false,
      hunting: false,
    });

    if (storageKey === `album-detail`) {
      navigate(returnTo + album.id);
      return;
    }

    sessionStorage.setItem(
      storageKey,
      JSON.stringify(draft)
    );

    navigate(returnTo);
  };

  const clearRecent = () => { saveRecent([]); setRecent([]); };

  return (
    <div className="max-w-[900px] mx-auto fade-in-up space-y-6" data-testid="album-search-page">
      <Link to={`/lists/${listId}/remix/add`} className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] inline-flex items-center gap-1.5" data-testid="back-link">
        <ArrowLeft size={13} /> Back to suggestions
      </Link>

      <h1 className="font-serif text-[28px] sm:text-[34px] leading-none">Search albums</h1>

      <div className="relative">
        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" strokeWidth={1.8} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any album or artist..."
          data-testid="search-input"
          className="w-full bg-[var(--panel)] border border-[var(--border)] rounded-xl pl-14 pr-14 py-4 text-[15px] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)]/50 transition"
        />
        {query && (
          <button onClick={() => setQuery("")} data-testid="clear-btn"
            className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--border-2)] flex items-center justify-center hover:bg-[var(--border)] transition">
            <X size={12} />
          </button>
        )}
      </div>

      {!query.trim() && recent.length > 0 && (
        <section data-testid="recent-searches">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-[var(--text-dim)]">
              <Clock size={12} /> Recent
            </div>
            <button onClick={clearRecent} className="text-[11px] text-[var(--text-muted)] hover:text-[var(--accent-2)]" data-testid="clear-recent">
              Clear
            </button>
          </div>
          <div className="space-y-2">
            {recent.map((a) => (
              <button key={a.id} onClick={() => handlePick(a)} data-testid={`recent-${a.id}`}
                className="card-panel w-full flex items-center gap-3 px-3 py-2.5 text-left hover:border-[var(--accent)]/40 transition"
              >
                <div className="w-11 h-11 rounded shrink-0 cover" style={{ background: a.cover_url }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">{a.title}</div>
                  <div className="text-[11.5px] text-[var(--text-muted)] truncate">{a.artist.name} · {a.year}</div>
                </div>
                <Plus size={14} className="text-[var(--accent-2)]" />
              </button>
            ))}
          </div>
        </section>
      )}

      {!query.trim() && recent.length === 0 && (
        <div className="card-panel p-12 text-center" data-testid="empty-state">
          <Search size={32} className="mx-auto text-[var(--text-dim)] mb-3" strokeWidth={1.4} />
          <p className="text-[13px] text-[var(--text-muted)]">Start typing to find albums by title or artist.</p>
        </div>
      )}

      {query.trim() && (
        <section data-testid="search-results">
          <div className="text-[11.5px] text-[var(--text-muted)] mb-3">
            {loading
              ? "Searching..."
              : results.length > 0
                ? `${results.length} results for "${query}"`
                : `No results for "${query}"`}
          </div>
          <div className="space-y-2">
            {results.map((a) => (
              <button key={a.id} onClick={() => handlePick(a)} data-testid={`result-${a.id}`}
                className="card-panel w-full flex items-center gap-4 px-4 py-3 text-left hover:border-[var(--accent)]/40 group transition"
              >
                <img
                  src={a.cover_url}
                  alt={a.title}
                  className="w-12 h-12 rounded object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium truncate">{a.title}</div>
                  <div className="text-[12px] text-[var(--text-muted)] truncate">{a.artist.name} · {a.year}</div>
                </div>
                <span className="border border-[var(--accent)]/40 text-[var(--accent-2)] text-[11.5px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                  <Plus size={11} /> Add
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
