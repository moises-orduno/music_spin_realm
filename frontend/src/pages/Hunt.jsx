import { Chip } from "../components/ui-bits";
import { MapPin, Tag, Target } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getHunts } from "../services/huntService";
import { getCurrentUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function Hunt() {

  const [hunt, setHunt] = useState([]);
  const [loadingHunts, setLoadingHunts] = useState(true);
  const [error, setError] = useState(null);
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [status, setStatus] = useState("hunting");
  const [counts, setCounts] = useState({});

  const handleHuntCreateClick = () => {
    if (!user) {
      navigate("/login", {
        state: {
          message: "Log in to create a list.",
          redirectTo: `/createList`,
        },
      });
      return;
    }

    navigate(`/huntForm`);
  };

  const handleDetailsClick = (id) => {
    navigate(`/huntDetail/${id}`);
  };

  useEffect(() => {
    const loadHunts = async () => {
      try {
        setLoadingHunts(true);
        setError(null);

        const data = await getHunts(status);

        setHunt(data);
      } catch (err) {
        setError(err.message || "Failed to load hunts");
      } finally {
        setLoadingHunts(false);
      }
    };

    loadHunts();
  }, [status]);

  const formatPrice = (price) => {
    if (!price) return "";

    // Handle price ranges
    if (typeof price === "object") {
      const symbol = price.currency === "USD" ? "$" : price.currency;

      if (price.min === price.max) {
        return `${symbol}${price.min}`;
      }

      return `${symbol}${price.min}–${symbol}${price.max}`;
    }

    // Handle regular numeric prices
    if (typeof price === "number") {
      return `$${price.toFixed(2)}`;
    }

    return "";
  };


  return (
    <div className="space-y-8 fade-in-up" data-testid="hunt-page">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] mb-3">Wishlist to shelf</div>
          <h1 className="font-serif text-[40px] leading-tight mb-3">Hunt Requests</h1>
          <p className="text-[14px] text-[var(--text-muted)] max-w-[560px]">
            The records you're chasing. The community is watching every flea market, estate sale, and dusty bin for you.
          </p>
        </div>

      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Chip
            active={status === "hunting"}
            onClick={() => setStatus("hunting")}
          >
            🎯 Hunting ({hunt.length})
          </Chip>

          <Chip
            active={status === "found"}
            onClick={() => setStatus("found")}
          >
            ✅ Found ({counts.found})
          </Chip>

          <Chip
            active={status === "completed"}
            onClick={() => setStatus("completed")}
          >
            📦 Completed ({counts.completed})
          </Chip>
        </div>
        <button
          onClick={handleHuntCreateClick}
          className="btn-accent inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
        >
          <Target size={14} />
          Create Hunt
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loadingHunts ? (
          <p>Loading...</p>
        ) : hunt.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="text-5xl mb-4">🎯</div>

            <h2 className="font-serif text-2xl mb-2">
              No hunts yet
            </h2>

            <p className="text-[var(--text-muted)] mb-6">
              Start your first hunt and let the community help you find the records you're looking for.
            </p>

            <button
              onClick={handleHuntCreateClick}
              className="btn-accent inline-flex items-center gap-2 px-5 py-3 rounded-full"
            >
              <Target size={14} />
              Create New Hunt
            </button>
          </div>
        ) : (

          hunt.map((h) => (
            <div
              key={h.id}
              className="card-panel hover-lift p-4 sm:p-5 flex gap-4 sm:gap-5 cursor-pointer"
            >
              <div
                className="cover cover-placeholder w-[88px] h-[88px] sm:w-[110px] sm:h-[110px] shrink-0"
                style={{
                  backgroundImage: h.album.cover_url
                    ? `url(${h.album.cover_url})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {!h.album.cover_url && (
                  <div className="font-serif opacity-80 text-[11px]">
                    {h.album.title}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-serif text-[20px] leading-tight truncate">
                      {h.album.title}
                    </h3>

                    <div className="text-[12.5px] text-[var(--text-muted)]">
                      {h.album.artist}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[18px] font-serif text-[var(--accent)]">
                      {h.hunters_count}
                    </div>

                    <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider">
                      hunters
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-[var(--text-muted)] mt-3">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={11} />
                    {h.pressing} • {h.condition}
                  </span>

                  <span className="flex items-center gap-1.5 text-[var(--accent)]">

                    <Tag size={11} />
                    {formatPrice(h.price)}
                  </span>
                </div>

                {h.details && (
                  <div className="mt-2 text-sm text-[var(--text-muted)]">
                    {h.details}
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button

                    onClick={()=>handleDetailsClick(h.id)}
                    className="border border-[var(--border-2)] text-[12px] px-3 py-1.5 rounded-full btn-ghost">
                    Details
                  </button>

                  <button className="bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-[var(--accent)] text-[12px] px-3 py-1.5 rounded-full hover:bg-[var(--accent)]/20 transition">
                    I have this
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
