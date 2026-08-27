import React, { useEffect, useState } from "react";
import { Chip, SectionTitle } from "../components/ui-bits";
import { Trophy, ArrowRight, Plus } from "lucide-react";

import { getLists } from "../services/listService";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";

export default function TopLists() {
  const [lists, setLists] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loadingLists, setLoadingLists] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const categories = [
    "All",
    "Rock",
    "Jazz",
    "Hip-Hop",
    "Indie",
    "Electronic",
    "Classical",
    "Folk",
  ];


  const user = getCurrentUser();
  
  const handleListClick = (list) => {
    navigate(`/lists/${list.id}`);
  };

  const handleListCreatelick = () => {
    if (!user) {
      navigate("/login", {
        state: {
          message: "Log in to create a list.",
          redirectTo: `/createList`,
        },
      });
      return;
    }

    navigate(`/createList`);
  };

  useEffect(() => {
    const loadLists = async () => {
      try {
        setLoadingLists(true);
        setError(null);

        const data = await getLists({
          category:
            selectedCategory === "All"
              ? undefined
              : selectedCategory,
        });

        setLists(data);
      } catch (err) {
        setError(err.message || "Failed to load lists");
      } finally {
        setLoadingLists(false);
      }
    };

    loadLists();
  }, [selectedCategory]);

  return (
    <div className="space-y-8 fade-in-up" data-testid="tops-page">
      <div>
        <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] mb-3">Community Rankings</div>
        <h1 className="font-serif text-[32px] sm:text-[40px] leading-tight mb-3">The Tops</h1>
        <p className="text-[14px] text-[var(--text-muted)] max-w-[560px]">
          Curated top 10 lists from the sharpest ears in the community. Agree. Disagree. Make your own.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Chip
              key={category}
              active={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            >
              {category === "All" ? "All Genres" : category}
            </Chip>
          ))}
        </div>

        <button
          onClick={() => handleListCreatelick()}
          className="btn-accent inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"

        >
          <Plus size={14} />
          Create List
        </button>
      </div>

      <SectionTitle
        action={
          <button className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--accent)]">
            View all <ArrowRight size={12} />
          </button>
        }
      >
        Featured Tops
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
              Explore the community's favorite albums and create your own top lists.
            </p>

            <button
              onClick={handleListCreatelick}
              className="btn-accent inline-flex items-center gap-2 px-5 py-3 rounded-full"
            >
              <Trophy size={14} />
              Create New List
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
                      key={it.position}
                      className="flex items-center gap-4"
                    >
                      <span className="font-serif text-[22px] text-[var(--text-dim)] w-6">
                        {it.position}
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
