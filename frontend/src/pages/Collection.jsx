import React, { useState, useEffect } from "react";
import { Chip } from "../components/ui-bits";
import { Grid2x2, List, Plus } from "lucide-react";
import { getMyCollection } from "../services/collectionService";
import { getCurrentUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function Collection() {

  const user = getCurrentUser();
  const navigate = useNavigate();

  const [collectionAlbums, setCollectionAlbums] = useState([]);
  const [error, setError] = useState("");

  const [loadingCollection, setLoadingCollection] = useState(true);

  const handleListClick = (list) => {
    navigate(`/lists/${list.id}`);
  };

  const handleAddAlbumClick = () => {
    if (!user) {
      navigate("/login", {
        state: {
          message: "Log in to start your collection.",
          redirectTo: `/createCollectionAlbum`,
        },
      });
      return;
    }

    navigate(`/createCollectionAlbum`);
  };

  useEffect(() => {
    const loadCollection = async () => {

      try {
        setLoadingCollection(true);
        setError(null);
        const data = await getMyCollection();

        setCollectionAlbums(data.items);
      } catch (err) {
        setError(err.message || "Failed to load collection");
      } finally {
        setLoadingCollection(false);
      }
    };

    loadCollection();
  }, []);


  return (
    <div className="space-y-8 fade-in-up" data-testid="collection-page">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] mb-3">
            The Shelf
          </div>

          <h1 className="font-serif text-[32px] sm:text-[40px] leading-tight mb-3">
            My Collection
          </h1>

          <div className="flex items-center gap-6 text-[13px] text-[var(--text-muted)]">
            <span>
              <span className="text-[var(--text)] font-medium">
                {collectionAlbums.length}
              </span>{" "}
              albums
            </span>

            <span>
              <span className="text-[var(--text)] font-medium">
                {new Set(
                  collectionAlbums
                    .map((item) => item.album?.artist?.name)
                    .filter(Boolean)
                ).size}
              </span>{" "}
              artists
            </span>

            <span>
              <span className="text-[var(--text)] font-medium">
                $
                {collectionAlbums
                  .reduce(
                    (total, item) => total + (item.price_paid || 0),
                    0
                  )
                  .toLocaleString()}
              </span>{" "}
              value
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="w-9 h-9 rounded-lg border border-[var(--border-2)] flex items-center justify-center btn-ghost text-[var(--accent)]"
          >
            <Grid2x2 size={14} />
          </button>

          <button
            className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center btn-ghost"
          >
            <List size={14} />
          </button>

          <button
            onClick={handleAddAlbumClick}
            className="btn-accent px-4 py-2 rounded-full text-[12.5px] flex items-center gap-1.5 ml-2"
            data-testid="add-album-btn"
          >
            <Plus size={14} />
            Add album
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip active>All</Chip>
        <Chip>Recently added</Chip>
        <Chip>Favorites</Chip>
        <Chip>Original press</Chip>
        <Chip>Reissue</Chip>
        <Chip>By genre</Chip>
        <Chip>By decade</Chip>
      </div>

      {loadingCollection ? (
        <div className="text-center py-16">
          <div className="text-[var(--text-muted)] text-[13px]">
            Loading your collection...
          </div>
        </div>
      ) : collectionAlbums.length === 0 ? (
        <div className="col-span-full text-center py-16">
          <div className="text-5xl mb-4">💿</div>

          <h2 className="font-serif text-2xl mb-2">
            Your collection is empty
          </h2>

          <p className="text-[var(--text-muted)] mb-6">
            Start building your shelf by adding the records you own.
          </p>

          <button
            onClick={handleAddAlbumClick}
            className="btn-accent inline-flex items-center gap-2 px-5 py-3 rounded-full"
          >
            <Plus size={14} />
            Add Your First Album
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {collectionAlbums.map((item) => {
            const album = item.album;

            return (
              <div
                key={item.id}
                className="cursor-pointer group"
                data-testid={`collection-item-${item.id}`}
              >
                <div
                  className="cover cover-placeholder aspect-square w-full hover-lift mb-3"
                  style={{
                    background: album?.cover_url
                      ? `url(${album.cover_url}) center / cover`
                      : undefined,
                  }}
                >
                  {!album?.cover_url && (
                    <div className="text-center">
                      <div className="font-serif text-[14px] opacity-90">
                        {album?.title}
                      </div>

                      <div className="text-[9.5px] mt-1 opacity-60">
                        {album?.artist?.name}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-[13px] truncate">
                  {album?.title}
                </div>

                <div className="text-[11px] text-[var(--text-muted)] truncate">
                  {album?.artist?.name} ·{" "}
                  {item.pressing_year || album?.year}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
