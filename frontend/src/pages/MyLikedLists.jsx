import React, { useEffect, useState } from "react";
import { Chip, SectionTitle } from "../components/ui-bits";
import { Trophy, ArrowRight, Glasses } from "lucide-react";

import { getMyLikedLists} from "../services/listService";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";

export default function MyLikedLists() {
  const [lists, setLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);

  const navigate = useNavigate();

  const user = getCurrentUser();

  const handleListClick = (list) => {
    navigate(`/lists/${list.id}`);
  };

  const handleExplorelick = () => {
    navigate(`/topLists`);
  };

  useEffect(() => {
    const loadLists = async () => {

      try {
        setLoadingLists(true);
        const data = await getMyLikedLists();

        setLists(data);
      } catch (err) {
        console.error(err.message || "Failed to load lists");
      } finally {
        setLoadingLists(false);
      }
    };

    loadLists();
  }, []);

  return (
    <div className="space-y-8 fade-in-up" data-testid="tops-page">
      <div>
        <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] mb-3">Community Rankings</div>
        <h1 className="font-serif text-[32px] sm:text-[40px] leading-tight mb-3">My Liked Lists</h1>
        <p className="text-[14px] text-[var(--text-muted)] max-w-[560px]">
          All the lists that I have liked.
        </p>
      </div>

      <SectionTitle>
        All my lists
      </SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loadingLists ? (
          <div className="col-span-full text-center py-16">
            <p className="text-[var(--text-muted)]">Loading lists...</p>
          </div>
        ) : lists.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="text-5xl mb-4">🏆</div>

            <h2 className="font-serif text-2xl mb-2">
              No lists yet
            </h2>

            <p className="text-[var(--text-muted)] mb-6">
              Explore the community's lists and save them to see them here.
            </p>

            <button
              onClick={handleExplorelick}
              className="btn-accent inline-flex items-center gap-2 px-5 py-3 rounded-full"
            >
              <Glasses size={14} />
              Explore
            </button>
          </div>
        ) : (
          lists.map((list) => (
            <div
              onClick={() => handleListClick(list)}
              key={list.id}
              className="card-panel hover-lift overflow-hidden cursor-pointer"
            >
              <div
                className="h-[140px] relative"
                style={{ background: list.image }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(0,0,0,0.7)]" />

                <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                  <div className="text-[11px] tracking-[0.18em] uppercase text-[var(--accent)] font-medium">
                    {list.title}
                  </div>

                  <Trophy
                    size={15}
                    className="text-[var(--accent)]/70"
                  />
                </div>
              </div>

              <div className="p-5 space-y-3">
                {Array.isArray(list.recent_albums) &&
                  list.recent_albums.length > 0 ? (
                  list.recent_albums.map((it) => (
                    <div
                      key={(it.position+1)}
                      className="flex items-center gap-4"
                    >
                      <span className="font-serif text-[22px] text-[var(--text-dim)] w-6">
                        {(it.position+1)}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] truncate">
                          {it.album.title}
                        </div>

                        <div className="text-[11px] text-[var(--text-muted)] truncate">
                          {it.album.artist}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[12px] text-[var(--text-muted)] py-2">
                    No albums in this list yet.
                  </div>
                )}

                {Array.isArray(list.recent_albums) && (
                  <div className="text-[11px] text-[var(--text-dim)] pt-1 border-t border-[var(--border)] mt-3">
                    +{" "}
                    {Math.max(
                      0,
                      (list.items_count ?? 0) - list.recent_albums.length
                    )}{" "}
                    more albums
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
