import React, { useState, useEffect, useRef } from "react";
import { UserCheck, UserPlus, Plus } from "lucide-react";
import { getMyCollection, getCollectionByUser } from "../services/collectionService";
import { getCurrentUser } from "../services/authService";
import { useNavigate, useParams } from "react-router-dom";
import { getProfile, toggleFollowById } from "../services/userService";
import { getImageUrl } from "../lib/utils";


function CurrentlyListeningAlbum({ album }) {

  if (!album) {

    return (
      <div
        className="
          h-full
          rounded-xl
          border border-[var(--border)]
          bg-[var(--panel)]
          p-5
        "
      >
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xl text-[var(--accent)]">
            ♬
          </span>
          <h2 className="text-lg font-medium">
            Currently Listening to
          </h2>
        </div>
        <p className="mt-6 text-sm text-[var(--muted)]">
          No album yet.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        h-full
        rounded-xl
        border border-[var(--border)]
        bg-[var(--panel)]
        p-5
      "
    >
      <div className="flex items-center gap-3 mb-5">
        <span className="text-xl text-[var(--accent)]">
          ♬
        </span>

        <h2 className="text-lg font-medium">
          Currently Listening to
        </h2>
      </div>

      <div>
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
          {album?.artist?.name}
        </div>
      </div>
    </div>
  );
}

function FavoriteArtists({ artists }) {
  return (
    <div
      className="
        h-full
        rounded-xl
        border border-[var(--border)]
        bg-[var(--panel)]
        p-5
      "
    >
      <div className="flex items-center gap-3 mb-5">
        <span className="text-xl text-[var(--accent)]">
          ♙
        </span>

        <h2 className="text-lg font-medium">
          Favorite Artists
        </h2>
      </div>

      <div className="flex justify-between gap-4">
        {artists.slice(0, 5).map((artist) => (
          <div
            key={artist.id}
            className="flex flex-col items-center min-w-0"
          >
            <img
              src={artist.image_url || "/default-artist.png"}
              alt={artist.name}
              className="
                w-20 h-20
                rounded-full
                object-cover
                border border-[var(--border)]
              "
            />

            <span
              className="
                mt-2
                text-xs
                text-center
                text-[var(--muted)]
                truncate
                max-w-24
              "
            >
              {artist.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FavoriteGenres({ genres }) {
  return (
    <div
      className="
        h-full
        rounded-xl
        border border-[var(--border)]
        bg-[var(--panel)]
        p-5
      "
    >
      <div className="flex items-center gap-3 mb-5">
        <span className="text-xl text-[var(--accent)]">
          ♬
        </span>

        <h2 className="text-lg font-medium">
          Favorite Genres
        </h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <span
            key={genre}
            className="
              px-4 py-2
              rounded-full
              bg-[var(--accent)]/20
              text-sm
              text-[var(--text)]
            "
          >
            {genre}
          </span>
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  value,
  options,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(
    (option) => option.value === value
  );

  const isActive = value !== "all";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`
          inline-flex items-center gap-2
          px-3 py-1.5
          rounded-full
          border
          text-sm
          transition
          ${isActive
            ? "border-[var(--accent)] bg-[var(--accent)]/10"
            : "border-[var(--border)] hover:bg-[var(--panel)]"
          }
        `}
      >
        <span>
          {isActive && selectedOption
            ? `${label}: ${selectedOption.label}`
            : label}
        </span>

        <span
          className={`text-[10px] transition-transform ${open ? "rotate-180" : ""
            }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          className="
            absolute
            left-0
            top-full
            mt-2
            min-w-[180px]
            rounded-xl
            border
            border-[var(--border)]
            bg-[var(--panel)]
            shadow-lg
            overflow-hidden
            z-50
          "
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`
                w-full
                px-4
                py-2.5
                text-left
                text-sm
                hover:bg-[var(--background)]
                transition
                ${value === option.value
                  ? "font-medium"
                  : ""
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span>{option.label}</span>

                {value === option.value && (
                  <span>✓</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileStat({ value, label }) {
  return (
    <div>
      <div className="text-lg font-medium text-[var(--text)]">
        {value}
      </div>

      <div className="text-sm text-[var(--muted)]">
        {label}
      </div>
    </div>
  );
}

function ProfileHeader({
  profile,
  isOwnProfile = false,
  setProfile,
}) {
  const handleFollowClick = async (userId) => {
    try {
      const result = await toggleFollowById(userId);

      setProfile({
        ...profile,
        is_following: result.following,
        followers_count: result.followers_count,
      });
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <section className="
      w-full max-w-6xl mx-auto
      px-4 sm:px-6 lg:px-8
      pt-6 sm:pt-10 pb-8
    ">

      {/* Profile intro */}
      <div className="
        flex flex-col items-center text-center
        sm:flex-row sm:items-start sm:text-left
        gap-5 sm:gap-6 lg:gap-8
      ">

        {/* Avatar */}
        <div className="shrink-0">
          <img
            src={getImageUrl(profile.avatar_url, "default_user_image.png")}
            alt={profile.display_name}
            className="
              w-28 h-28
              sm:w-36 sm:h-36
              lg:w-44 lg:h-44
              rounded-full object-cover
              border-2 border-[var(--accent)] p-1
            "
          />
        </div>

        {/* Profile information */}
        <div className="
          min-w-0 w-full flex-1
          text-center sm:text-left
          sm:pt-2
        ">

          <h1 className="
            text-4xl sm:text-4xl lg:text-5xl
            font-serif tracking-tight
            text-[var(--text)]
            break-words
          ">
            {profile.display_name}
          </h1>

          <p className="mt-1 text-base sm:text-lg text-[var(--muted)] break-all">
            @{profile.username}
          </p>

          {profile.bio && (
            <p className="
              mt-3 sm:mt-4
              max-w-2xl
              text-sm sm:text-base
              leading-6 sm:leading-7
              text-[var(--muted)]
            ">
              {profile.bio}
            </p>
          )}

          {/* Action */}
          <div className="mt-4">
            <button
              className="
                  inline-flex items-center justify-center
                  rounded-full bg-[var(--accent)]
                  text-white text-sm font-medium
                  px-7 py-2.5
                  hover:opacity-90 transition
                "
            >
              Follow
            </button>
          </div>

          {/* Statistics */}
          <div className="
            grid grid-cols-3
            sm:flex sm:flex-wrap
            justify-items-center sm:justify-items-start
            gap-x-5 gap-y-5
            sm:gap-x-8 sm:gap-y-4
            mt-7
          ">
            <ProfileStat
              value={profile.albums_count ?? 0}
              label="Albums"
            />

            <ProfileStat
              value={profile.lists_count ?? 0}
              label="Lists"
            />

            <ProfileStat
              value={profile.debates_count ?? 0}
              label="Debates"
            />

            <ProfileStat
              value={profile.following_count ?? 0}
              label="Following"
            />

            <ProfileStat
              value={profile.followers_count ?? 0}
              label="Followers"
            />
          </div>

        </div>
      </div>

      {/* Favorites */}
      <div className="
        grid grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-12
        gap-4 sm:gap-5
        mt-8 sm:mt-10
      ">

        <div className="lg:col-span-3">
          <FavoriteGenres genres={profile.favorite_genres || []} />
        </div>

        <div className="sm:col-span-2 lg:col-span-6">
          <FavoriteArtists artists={profile.favorite_artists || []} />
        </div>

        <div className="lg:col-span-3">
          <CurrentlyListeningAlbum
            album={profile.currently_listening_album}
          />
        </div>

      </div>
    </section>
  );
}

export default function Collection() {

  const user = getCurrentUser();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    favorite: "all",
    pressing: "all",
    condition: "all",
    price: "all",
  });

  const filterCollection = (filterName, value) => {

    const newFilters = {
      ...filters,
      [filterName]: value,
    };

    setFilters(newFilters);

    let filtered = [...collectionAlbums];

    if (newFilters.favorite === "favorite") {
      filtered = filtered.filter((item) => item.favorite === true);
    }

    if (newFilters.favorite === "not_favorite") {
      filtered = filtered.filter((item) => item.favorite !== true);
    }

    if (newFilters.pressing !== "all") {
      filtered = filtered.filter(
        (item) => item.pressing === newFilters.pressing
      );
    }

    if (newFilters.condition !== "all") {
      filtered = filtered.filter(
        (item) => item.media_condition === newFilters.condition
      );
    }

    if (newFilters.price === "under_50") {
      filtered = filtered.filter(
        (item) => (item.price_paid ?? 0) < 50
      );
    }

    if (newFilters.price === "50_100") {
      filtered = filtered.filter(
        (item) =>
          (item.price_paid ?? 0) >= 50 &&
          (item.price_paid ?? 0) <= 100
      );
    }

    if (newFilters.price === "100_200") {
      filtered = filtered.filter(
        (item) =>
          (item.price_paid ?? 0) > 100 &&
          (item.price_paid ?? 0) <= 200
      );
    }

    if (newFilters.price === "over_200") {
      filtered = filtered.filter(
        (item) => (item.price_paid ?? 0) > 200
      );
    }

    setFilteredCollectionAlbums(filtered);
  };

  const { username } = useParams();

  const [collectionAlbums, setCollectionAlbums] = useState([]);
  const [filteredCollectionAlbums, setFilteredCollectionAlbums] = useState([]);

  const [error, setError] = useState("");
  const [profile, setProfile] = useState({});

  const [loadingCollection, setLoadingCollection] = useState(true);

  const handleCollectionClick = (collection) => {
    navigate(`/collectionDetail/${collection.id}`);
  };

  const [sort, setSort] = useState("all");

  const handleAddAlbumClick = () => {
    navigate(`/CollectionAlbumForm/new`);
  };

  useEffect(() => {

    if (!user) {
      navigate("/login", {
        state: {
          message: "Log in to start your collection.",
          redirectTo: `/collectionAlbumForm/new`,
        },
      });
      return;
    }

    const loadCollection = async () => {
      try {
        setLoadingCollection(true);

        let data;

        if (username) {
          data = await getCollectionByUser(username);
        } else {
          data = await getMyCollection();
        }

        setCollectionAlbums(data.items);
        setFilteredCollectionAlbums(data.items);

      } catch (err) {
        console.error("Failed to load collection:", err.message);
      } finally {
        setLoadingCollection(false);
      }
    };

    async function loadProfile() {
      try {

        const selectedUsername = username ? username : user.username;
        const data = await getProfile(selectedUsername);
        setProfile(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadProfile();

    loadCollection();
  }, [username]);

  return (
    <div className="space-y-8 fade-in-up" data-testid="collection-page">
      <div className="flex-wrap items-start justify-between gap-6">
        <div>
          <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] mb-3">

            {username ? "My music" : "Your Shelf"}
          </div>

          <h1 className="font-serif text-[32px] sm:text-[40px] leading-tight mb-3">
            {username ? "Collector" : "My Collection"}

          </h1>
          <p className="text-[13px] text-[var(--text-muted)]"> {username ? "Enjoy others collection" : "Share your collection with the world."}</p>

        </div>

        {username ?

          <div className="flex items-center gap-2">

            <ProfileHeader
              profile={profile}
              isOwnProfile={user ? profile.username === user.username : false}
              setProfile={setProfile}
            />

          </div>
          : <div></div>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="Favorite"
            value={filters.favorite}
            onChange={(value) => filterCollection("favorite", value)}
            options={[
              { value: "all", label: "All" },
              { value: "favorite", label: "Favorites" },
              { value: "not_favorite", label: "Not favorites" },
            ]}
          />

          <FilterChip
            label="Pressing"
            value={filters.pressing}
            onChange={(value) => filterCollection("pressing", value)}
            options={[
              { value: "all", label: "All" },
              { value: "original", label: "Original press" },
              { value: "reissue", label: "Reissue" },
              { value: "unknown", label: "Unknown" },
            ]}
          />

          <FilterChip
            label="Condition"
            value={filters.condition}
            onChange={(value) => filterCollection("condition", value)}
            options={[
              { value: "all", label: "All" },
              { value: "Mint", label: "Mint" },
              { value: "Near Mint", label: "Near Mint" },
              { value: "Very Good Plus", label: "Very Good +" },
              { value: "Very Good", label: "Very Good" },
              { value: "Good", label: "Good" },
            ]}
          />

          <FilterChip
            label="Price"
            value={filters.price}
            onChange={(value) => filterCollection("price", value)}
            options={[
              { value: "all", label: "Any price" },
              { value: "under_50", label: "Under $50" },
              { value: "50_100", label: "$50 – $100" },
              { value: "100_200", label: "$100 – $200" },
              { value: "over_200", label: "$200+" },
            ]}
          />
        </div>

        <FilterChip
          label="Sort"
          value={sort}
          onChange={setSort}
          options={[
            { value: "recently_added", label: "Recently added" },
            { value: "oldest_added", label: "Oldest added" },
            { value: "title", label: "Title A–Z" },
            { value: "artist", label: "Artist A–Z" },
            { value: "year", label: "Release year" },
            { value: "price", label: "Price paid" },
          ]}
        />

        {!username ?

          <button
            onClick={handleAddAlbumClick}
            className="btn-accent inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
            data-testid="add-album-btn"
          >
            <Plus size={14} />
            Add album
          </button>
          : <div></div>}
      </div>
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

    {!username ?
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
         : <div></div>}
      </div>

      {loadingCollection ? (
        <div className="text-center py-16">
          <div className="text-[var(--text-muted)] text-[13px]">
            Loading your collection...
          </div>
        </div>
      ) : filteredCollectionAlbums.length === 0 ? (
        <div className="col-span-full text-center py-16">
          <div className="text-5xl mb-4">💿</div>

          <h2 className="font-serif text-2xl mb-2">
            {username ? "The collection is empty" : "Your collection is empty"}
          </h2>

          <p className="text-[var(--text-muted)] mb-6">
            {username ? "No records yet" : "Start building your shelf by adding the records you own."}
          </p>
          {!username ?

            <button
              onClick={handleAddAlbumClick}
              className="btn-accent inline-flex items-center gap-2 px-5 py-3 rounded-full"
            >
              <Plus size={14} />
              Add Your First Album
            </button>
            : <div></div>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredCollectionAlbums.map((item) => {
            const album = item.album;

            return (
              <div
                onClick={() => handleCollectionClick(item)}
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
