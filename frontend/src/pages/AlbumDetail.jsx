import React, { useState, useEffect } from "react";
import {
  Star, Heart, Plus, Target, ChevronDown, ChevronRight, Disc,
  FolderOpen, MessageSquare, Users, ShoppingCart, ArrowRight,
} from "lucide-react";
import {
  getAlbumById, getSimilarAlbumsById
}
  from "../services/albumService";

import {
  getAlbumListings
}
  from "../services/marketplaceService";

import { useNavigate, useParams, Link } from "react-router-dom";


const ICON_MAP = { FolderOpen, MessageSquare, Users, Target };

const CONDITION_COLORS = {
  "M": "#10b981",
  "NM": "#10b981",
  "VG+": "#a78bfa",
  "VG": "#f59e0b",
  "G": "#ef4444",
};

function ConditionBadge({ code }) {
  const color = CONDITION_COLORS[code] || "#8b5cf6";
  return (
    <span
      className="inline-flex items-center justify-center w-11 h-8 rounded-md text-[11.5px] font-bold shrink-0"
      style={{ color, background: `${color}18`, border: `1px solid ${color}40` }}
    >
      {code}
    </span>
  );
}

function CopyRow({ c }) {
  return (
    <div
      className="card-panel p-3 flex items-center gap-4"
      data-testid={`copy-${c.album?.id}-${c.catalog_number}`}
    >
      {/* Album cover */}
      <div
        className="w-[54px] h-[54px] rounded shrink-0 cover"
        style={{ background: c.album?.cover_url }}
      />

      {/* Pressing */}
      <div className="min-w-[200px] shrink-0">
        <div className="text-[13px] font-medium">
          {c.pressing_country} · {c.pressing_year}
        </div>

        <div className="text-[11.5px] text-[var(--text-muted)]">
          {c.label} · {c.catalog_number}
        </div>
      </div>

      {/* Condition */}
      <div className="flex items-center gap-3 shrink-0">
        <ConditionBadge code={c.media_condition} />

        <div className="min-w-0">
          <div className="text-[12.5px]">
            {c.media_condition}
          </div>

          <div className="text-[11px] text-[var(--text-muted)]">
            Sleeve: {c.sleeve_condition}
          </div>
        </div>
      </div>

      {/* Pressing details */}
      <div className="hidden xl:block min-w-0 flex-1">
        <div className="text-[12px] truncate">
          {c.format} · {c.speed} RPM
        </div>

        <div className="text-[10.5px] text-[var(--text-muted)] truncate">
          {c.pressing_description}
        </div>
      </div>

      {/* Price */}
      <div className="text-right shrink-0 min-w-[90px]">
        <div className="text-[15px] font-medium">
          {c.currency === "USD" ? "$" : c.currency}{" "}
          {Number(c.price).toFixed(2)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        <button
          className="btn-accent rounded-lg px-4 py-2 text-[12px] flex items-center gap-1.5"
          data-testid={`add-cart-${c.album?.id}-${c.catalog_number}`}
        >
          <ShoppingCart size={12} />
          Add to cart
        </button>

        <button
          className="w-9 h-9 rounded-lg border border-[var(--border-2)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-2)] hover:border-[var(--accent)]/40 transition"
          data-testid={`save-${c.album?.id}-${c.catalog_number}`}
        >
          <Heart size={13} />
        </button>
      </div>
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-[var(--border)] last:border-b-0">
      <span className="text-[12px] text-[var(--text-muted)]">{label}</span>
      <span className="text-[12.5px] text-right">{value}</span>
    </div>
  );
}

export default function AlbumDetail() {
  const { id } = useParams();
  const [tab, setTab] = useState("About");
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [sort, setSort] = useState("Price: Low to High");
  const [showSort, setShowSort] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [album, setAlbum] = useState({});
  const [albumsRelated, setAlbumsRelated] = useState({});
  const [loading, setLoading] = useState();
  const [copies, setCopies] = useState([]);
  const navigate = useNavigate();

  const createEmptyDraft = () => ({
    title: "",
    description: "",
    category: "",
    items: [],
  });

  const handleHuntCreateClick = () => {

    let draft = createEmptyDraft();

    const albumItem = {
      id: crypto.randomUUID(),
      position: 1,
      album,
      why_this_album: "",
      favorite_lyric: "",
      owned: false,
      hunting: true,
    };

    draft.items = [albumItem];

    sessionStorage.setItem("new-hunt-draft", JSON.stringify(draft));

    navigate(`/huntForm/new`);
  };

  useEffect(() => {
    
    async function fetchAlbum() {
      setLoading(true);

      try {
        const data = await getAlbumById(id);
        setAlbum(data);
      } catch (err) {
        console.error("Failed to load album by id:", err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchSimilarAlbums() {
      setLoading(true);

      try {
        const data = await getSimilarAlbumsById(id);
        setAlbumsRelated(data);
      } catch (err) {
        console.error("Failed to load similar:", err);
      } finally {
        setLoading(false);
      }
    }

    async function fetchCopies() {

      try {
        const data = await getAlbumListings(id);
        setCopies(data);
      } catch (err) {
        console.error("Failed to load debate:", err);
      } finally {
      }
    }

    fetchCopies();

    fetchSimilarAlbums();

    fetchAlbum();
  }, [id]);

  /* ---------------------------
    Loading state
 ----------------------------*/
  if (loading || !album) {
    return <div className="p-6">Loading Album...</div>;
  }

  return (
    <div className="fade-in-up space-y-8" data-testid="album-detail-page">
      {/* Breadcrumb */}
      <nav className="text-[12px] text-[var(--text-muted)] flex items-center gap-1.5" data-testid="breadcrumb">
        <Link to="/" className="hover:text-[var(--text)]">Home</Link>
        <ChevronRight size={12} />
        <Link to="/albums" className="hover:text-[var(--text)]">Albums</Link>
        <ChevronRight size={12} />
        <span className="text-[var(--text)]">{album.title}</span>
      </nav>

      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6" data-testid="album-hero">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
          {/* Cover */}
          <div
            className="w-full md:w-[220px] aspect-square md:h-[220px] rounded-md shrink-0 overflow-hidden"
            data-testid="album-cover"
          >
            {album?.cover_url ? (
              <img
                src={album.cover_url}
                alt={`${album.title} cover`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full cover cover-placeholder flex items-center justify-center">
                <span className="text-sm text-[var(--text-muted)]">
                  No cover available
                </span>
              </div>
            )}
          </div>          
          {/* Info */}
          <div className="min-w-0">
            <span className="text-[10.5px] tracking-[0.2em] uppercase text-[var(--accent-2)] font-semibold">ALBUM</span>
            <h1 className="font-serif text-[36px] sm:text-[42px] leading-none mt-2 mb-2">{album.title}</h1>
            <div className="text-[16px] text-[var(--text)]/85 mb-2">{album.artist?.name}</div>
            <div className="text-[12.5px] text-[var(--text-muted)] mb-3">{album.year} · {album.label}</div>
            {album.genres && album.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {album.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-1 rounded-full text-[11px] border border-[var(--border-2)] text-[var(--text-muted)]"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4 text-[12px] text-[var(--text-muted)] mb-5">
              <span className="flex items-center gap-1.5">
                <Star size={13} className="text-[var(--accent-2)]" fill="var(--accent-2)" strokeWidth={0} />
                <span className="text-[var(--text)] font-medium">{album.rating}</span> ({album.ratingCount} ratings)
              </span>
              <span className="flex items-center gap-1.5"><FolderOpen size={13} /> {album.listCount} lists</span>
              <span className="flex items-center gap-1.5"><MessageSquare size={13} /> {album.debateCount} debates</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFavorited(!favorited)}
                data-testid="favorite-btn"
                className={`border border-[var(--border-2)] rounded-lg px-4 py-2 text-[12.5px] flex items-center gap-1.5 hover:border-[var(--accent)]/40 transition ${favorited ? "text-[var(--accent-2)] border-[var(--accent)]/40" : ""}`}
              >
                <Heart size={13} className={favorited ? "fill-current" : ""} /> {favorited ? "Favorited" : "Favorite"}
              </button>
              <button className="border border-[var(--border-2)] rounded-lg px-4 py-2 text-[12.5px] flex items-center gap-1.5 hover:border-[var(--accent)]/40 transition" data-testid="add-collection-btn">
                <Plus size={13} /> Add to Collection
              </button>
              <button
                onClick={handleHuntCreateClick}
                className="btn-accent rounded-lg px-4 py-2 text-[12.5px] flex items-center gap-1.5" data-testid="hunt-btn">
                <Target size={13} /> Hunt this album
              </button>
            </div>
          </div>
        </div>

        {/* Meta card */}
        <div className="card-panel p-5" data-testid="meta-card">
          <MetaRow label="Release date" value={album.year} />
          <MetaRow label="Label" value={album.label} />
          <MetaRow label="Country" value={album.country} />
          <div className="pt-3">
            <div className="text-[12px] text-[var(--text-muted)] mb-2">Total copies wanted</div>
            <div className="flex items-center gap-3">
              <span className="text-[22px] font-serif">{album.totalWanted}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section data-testid="description">
        <p className="text-[13.5px] text-[var(--text-muted)] leading-relaxed max-w-3xl">
          {album.description}
          {expandedDesc && " Its 6-song lineup and electric edge shocked purist folk fans and inspired generations of songwriters who came after. Recorded at Columbia's 30th Street Studio, the album is now widely considered one of the greatest of all time."}
        </p>
        <button onClick={() => setExpandedDesc(!expandedDesc)} className="text-[12px] text-[var(--accent-2)] hover:underline mt-2 flex items-center gap-1" data-testid="expand-desc">
          View {expandedDesc ? "less" : "full description"} <ChevronDown size={12} className={expandedDesc ? "rotate-180" : ""} />
        </button>
      </section>

      {/* Available copies */}
      <section className="card-panel p-5" data-testid="available-copies">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-[22px]">Available copies</h2>

            <span className="w-6 h-6 rounded-full bg-[var(--accent-soft)] text-[var(--accent-2)] flex items-center justify-center text-[11px] font-medium">
              {copies.length}
            </span>
          </div>

          {copies.length > 0 && (
            <div className="flex items-center gap-2 text-[12px] text-[var(--text-muted)]">
              <span>Sort by:</span>

              <div className="relative">
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-2)] text-[12px] hover:border-[var(--accent)]/40 transition"
                  data-testid="sort-btn"
                >
                  {sort}
                  <ChevronDown
                    size={12}
                    className={showSort ? "rotate-180" : ""}
                  />
                </button>

                {showSort && (
                  <div className="absolute right-0 top-full mt-1 w-[190px] card-panel py-1.5 z-30">
                    {[
                      "Price: Low to High",
                      "Price: High to Low",
                      "Best condition",
                      "Top rated seller",
                    ].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setSort(s);
                          setShowSort(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-[12px] hover:bg-[var(--accent-soft)] ${s === sort
                          ? "text-[var(--accent-2)]"
                          : "text-[var(--text-muted)]"
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {copies.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-3xl mb-3">💿</div>

            <h3 className="font-serif text-[18px] mb-1">
              No copies available
            </h3>

            <p className="text-[12px] text-[var(--text-muted)]">
              There are no copies of this album for sale right now.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2.5">
              {copies.slice(0, 5).map((c) => (
                <CopyRow key={c.id} c={c} />
              ))}
            </div>

            {copies.length > 5 && (
              <div className="text-center mt-5">
                <button
                  className="text-[12.5px] text-[var(--accent-2)] hover:underline inline-flex items-center gap-1.5"
                  data-testid="view-all-copies"
                >
                  View all {copies.length} copies
                  <ArrowRight size={12} />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Tabs + community */}
      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6" data-testid="tabs-and-community">
        {/* Left tabs */}
        <div className="card-panel p-5">
          <div className="flex items-center gap-7 border-b border-[var(--border)] mb-5" data-testid="tabs">
            {["About", "Tracklist", "Details", "Versions (24)"].map((t) => (
              <button key={t} onClick={() => setTab(t.split(" ")[0])}
                data-testid={`tab-${t.split(" ")[0].toLowerCase()}`}
                className={`pb-3 text-[13px] relative whitespace-nowrap ${tab === t.split(" ")[0] ? "text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}
              >
                {t}
                {tab === t.split(" ")[0] && <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--accent)]" />}
              </button>
            ))}
          </div>

          {tab === "About" && (
            <div className="space-y-5" data-testid="about-content">
              <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
                {album.description}
              </p>

              {Array.isArray(album?.features) && album.features.length > 0 && (
                <ul className="space-y-2.5">
                  {album.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-[13px] text-[var(--text)]/85"
                    >
                      <Disc
                        size={13}
                        className="text-[var(--accent-2)] mt-1 shrink-0"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              {Array.isArray(album?.tracks) && album.tracks.length > 0 && (
                <div>
                  <h3 className="font-serif text-[17px] mb-3 mt-6">Tracklist</h3>
                  <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-[13px]">
                    {album.tracks.map((t, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-[var(--text-dim)] w-4 text-right">
                          {i + 1}.
                        </span>
                        <span>{t.title}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {tab === "Tracklist" && (
            <ol
              className="space-y-2 text-[13px]"
              data-testid="tracklist-content"
            >
              {Array.isArray(album?.tracks) && album.tracks.length > 0 ? (
                album.tracks.map((t, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 py-1.5 border-b border-[var(--border)] last:border-b-0"
                  >
                    <span className="text-[var(--text-dim)] w-6 font-serif text-[15px]">
                      {i + 1}
                    </span>
                    <span>{t.title}</span>
                  </li>
                ))
              ) : (
                <li className="text-[var(--text-muted)] py-2">
                  No tracklist available.
                </li>
              )}
            </ol>
          )}

          {tab === "Details" && (
            <div className="space-y-1" data-testid="details-content">
              <MetaRow label="Release date" value={album.year} />
              <MetaRow label="Label" value={album.label} />
              <MetaRow label="Country" value={album.country} />
              <MetaRow label="Genres" value={album.genres.join(", ")} />
            </div>
          )}

          {tab === "Versions" && (
            <div className="text-center py-10 text-[13px] text-[var(--text-muted)]" data-testid="versions-content">
              24 different pressings and versions available.
              <div className="mt-3">
                <button className="text-[12.5px] text-[var(--accent-2)] hover:underline">View all versions →</button>
              </div>
            </div>
          )}
        </div>

        {/* Right: In the community + Your activity */}
        <div className="space-y-5">
          <div className="card-panel p-5" data-testid="community">
            <h3 className="font-serif text-[17px] mb-4">In the community</h3>

            {Array.isArray(album?.community) && album.community.length > 0 ? (
              <div className="space-y-3">
                {album.community.map((row) => {
                  const Ic = ICON_MAP[row.icon] || Users;

                  return (
                    <button
                      key={row.key}
                      className="w-full flex items-center gap-3 py-1 group"
                      data-testid={`community-${row.key}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
                        <Ic
                          size={14}
                          className="text-[var(--accent-2)]"
                        />
                      </div>

                      <span className="flex-1 text-left text-[12.5px] text-[var(--text)]/85 group-hover:text-[var(--accent-2)] transition">
                        {row.label}
                      </span>

                      <span className="text-[13px] font-medium">
                        {row.value}
                      </span>

                      <ArrowRight
                        size={12}
                        className="text-[var(--text-dim)] group-hover:text-[var(--accent-2)] transition"
                      />
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-[12.5px] text-[var(--text-muted)]">
                No community activity yet.
              </p>
            )}
          </div>

          <div className="card-panel p-5" data-testid="your-activity">
            <h3 className="font-serif text-[17px] mb-4">Your activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 py-2 border-b border-[var(--border)]">
                <span className="text-[12.5px] text-[var(--text-muted)]">You don&apos;t own this album</span>
                <button className="border border-[var(--border-2)] text-[11.5px] px-3 py-1.5 rounded-lg hover:border-[var(--accent)]/40 hover:text-[var(--accent-2)] transition flex items-center gap-1.5" data-testid="add-collection-inline">
                  <Plus size={11} /> Add to Collection
                </button>
              </div>
              <div className="flex items-center justify-between gap-3 py-2">
                <span className="text-[12.5px] text-[var(--text-muted)]">
                  Not hunting this album
                </span>

                <button
                  onClick={handleHuntCreateClick}
                  className="btn-accent rounded-lg text-[11.5px] px-3 py-1.5 flex items-center gap-1.5"
                  data-testid="hunt-inline"
                >
                  <Target size={11} />
                  Hunt this album
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* You might also like */}
      <section data-testid="related-albums">
        <h3 className="font-serif text-[22px] mb-5">You might also like</h3>

        {Array.isArray(albumsRelated) && albumsRelated.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {albumsRelated.map((r) => (
                <Link
                  key={r.id}
                  to={`/albums/${r.id}`}
                  className="group"
                  data-testid={`related-${r.id}`}
                >
                  <div
                    className="relative aspect-square cover rounded-md mb-2.5 hover-lift"
                    style={{
                      backgroundImage: r.cover_url
                        ? `url(${r.cover_url})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[rgba(0,0,0,0.6)] backdrop-blur flex items-center justify-center hover:bg-[var(--accent)] transition"
                    >
                      <Heart size={12} className="text-white" />
                    </button>
                  </div>

                  <div className="text-[13px] font-medium truncate group-hover:text-[var(--accent-2)] transition">
                    {r.title}
                  </div>

                  <div className="text-[11px] text-[var(--text-muted)] truncate">
                    {r.artist.name}
                  </div>

                  <div className="text-[11px] text-[var(--text-dim)] mt-0.5">
                    {r.year}
                  </div>

                  <div className="text-[11.5px] text-[var(--accent-2)] mt-1 flex items-center gap-1">
                    <Star
                      size={10}
                      fill="var(--accent-2)"
                      strokeWidth={0}
                    />
                    {r.rating}
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-5">
              <button
                className="text-[12.5px] text-[var(--accent-2)] hover:underline inline-flex items-center gap-1.5"
                data-testid="more-recs"
              >
                View more recommendations <ArrowRight size={12} />
              </button>
            </div>
          </>
        ) : (
          <p className="text-[12.5px] text-[var(--text-muted)]">
            No recommendations available.
          </p>
        )}
      </section>
    </div>
  );
}
