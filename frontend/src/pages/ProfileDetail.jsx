import React, { useState, useEffect, useRef } from "react";
import { getCurrentUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/userService";
import { getImageUrl } from "../lib/utils";
import {
  PencilIcon
} from "lucide-react";

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

    if (artists.length === 0) {
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
          Favorite Artists
        </h2>
        </div>
        <p className="mt-6 text-sm text-[var(--muted)]">
          No artist yet.
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
  onEditProfile,
  navigate
}) {
  return (
    <section className="px-8 pt-10 pb-8">
      {/* Profile intro */}
      <div className="flex items-start justify-between gap-8">
        <div className="flex items-start gap-8">
          {/* Avatar */}
          <div className="shrink-0">
            <img
              src={getImageUrl(profile.avatar_url, `default_user_image.png`)}
              alt={profile.display_name}
              className="
                w-44 h-44
                rounded-full
                object-cover
                border-2
                border-[var(--accent)]
                p-1
              "
            />
          </div>

          {/* Profile information */}
          <div className="pt-2">
            <h1
              className="
                text-5xl
                font-serif
                tracking-tight
                text-[var(--text)]
              "
            >
              {profile.display_name}
            </h1>

            <p className="mt-1 text-lg text-[var(--muted)]">
              @{profile.username}
            </p>

            {profile.bio && (
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
                {profile.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-10 mt-6">
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

        {/* Action */}
        {isOwnProfile ? (
          <button
            onClick={() =>
              {navigate(`/profileForm/edit`), sessionStorage.removeItem("profile-form");}
            }
            className="
                btn-ghost
                inline-flex
                items-center
                justify-center
                gap-1.5
                rounded-full
                border
                border-[var(--border)]
                px-8
                py-4
                text-[12px]
                whitespace-nowrap
                transition
                hover:border-[#3d85c6]
                hover:text-[#3d85c6]
                "
          >
            <PencilIcon size={13} />
            Edit
          </button>
        ) : (
          <button
            className="
              px-6 py-2.5
              rounded-full
              bg-[var(--accent)]
              text-white
              text-sm font-medium
              hover:opacity-90
              transition
            "
          >
            Follow
          </button>
        )}
      </div>

      {/* Favorites */}
      <div className="grid grid-cols-12 gap-5 mt-10">
        {/* Favorite Genres */}
        <div className="col-span-3">
          <FavoriteGenres genres={profile.favorite_genres || []} />
        </div>

        {/* Favorite Artists */}
        <div className="col-span-6">
          <FavoriteArtists artists={profile.favorite_artists || []} />
        </div>

        {/* Currently listening to Album */}
        <div className="col-span-3">
          <CurrentlyListeningAlbum album={profile.currently_listening_album} />
        </div>
      </div>
    </section>
  );
}

export default function ProfileDetail() {

  const user = getCurrentUser();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);


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

    async function loadProfile() {
      try {
        setLoading(true);
        const data = await getProfile(user.username);

        console.log("data",data.currently_listening_album);
        setProfile(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }

    loadProfile();

  }, []);

  if (loading || !profile) {
    return <div className="p-6">Loading Profile...</div>;
  }

  return (

    <div className="space-y-8 fade-in-up" data-testid="collection-page">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] mb-3">
            Your information
          </div>

          <h1 className="font-serif text-[32px] sm:text-[40px] leading-tight mb-3">
            My Profile
          </h1>
          <p className="text-[13px] text-[var(--text-muted)]">Share your information with the world.</p>

        </div>

        <div className="flex items-center gap-2">

          <ProfileHeader
            profile={profile}
            isOwnProfile={profile.username === user.username}
            navigate={navigate}
          />
        </div>
      </div>

    </div>

  );
}
