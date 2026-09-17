import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Camera,
  X,
  Plus,
  Music2,
  UserRound,
  Mail,
  Pencil,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getProfile, updateUser } from "../services/userService";
const ACCENT = "#F04BA8";

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        <Icon size={21} style={{ color: ACCENT }} />

        <h2 className="text-lg font-medium text-[var(--text)]">
          {title}
        </h2>
      </div>

      {description && (
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {description}
        </p>
      )}
    </div>
  );
}

function Label({ children }) {
  return (
    <label className="block mb-2 text-sm font-medium text-[var(--text)]">
      {children}
    </label>
  );
}

function Input({ value, onChange, disabled = false }) {
  return (
    <input
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="
        w-full rounded-lg
        border border-[var(--border-2)]
        bg-[var(--surface)]
        px-3.5 py-3
        text-sm text-[var(--text)]
        outline-none
        transition
        focus:border-[#F04BA8]
        focus:ring-1 focus:ring-[#F04BA8]/30
        disabled:opacity-50
      "
    />
  );
}

export default function ProfileForm() {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(
    profile?.display_name || ""
  );

  const [username, setUsername] = useState(
    profile?.username || ""
  );

  const [bio, setBio] = useState(
    profile?.bio || ""
  );

  const [genres, setGenres] = useState(
    profile?.favorite_genres || []
  );

  const [artists, setArtists] = useState(
    profile?.favorite_artists || []
  );

  const [favoriteSong, setFavoriteSong] = useState(
    profile?.favorite_song || null
  );

  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({});
  const handleSave = async () => {
    try {
      setSaving(true);

      await updateUser({
        display_name: displayName,
        username,
        bio,
        favorite_genres: genres,
        favorite_artists: artists.map((artist) => artist.id),
        favorite_song_id: favoriteSong?.id || null,
      });

      navigate(`/collection`);
    } finally {
      setSaving(false);
    }
  };

  const removeGenre = (genre) => {
    setGenres((current) =>
      current.filter((item) => item !== genre)
    );
  };

  const removeArtist = (artistId) => {
    setArtists((current) =>
      current.filter((artist) => artist.id !== artistId)
    );
  };

    useEffect(() => {
  
      if (!user) {
        navigate("/login", {
          state: {
            message: "Log in to edit.",
            redirectTo: `/collectionAlbumForm/new`,
          },
        });
        return;
      }

      async function loadProfile() {
        try {
  
          
          const data = await getProfile(user.username);
          setProfile(data);
        } catch (error) {
          console.error(error);
        }
      }
  
      loadProfile();
  
    }, []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <main className="mx-auto max-w-[1450px] px-6 py-8 lg:px-10">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="
            flex items-center gap-2
            text-sm text-[var(--text-muted)]
            transition
            hover:text-[#F04BA8]
          "
        >
          <ArrowLeft size={17} />
          Back to Profile
        </button>

        {/* Header */}
        <div className="mt-5 mb-7">
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-[var(--text)] lg:text-5xl">
            Edit Profile
          </h1>

          <p className="mt-2 text-base text-[var(--text-muted)]">
            Update your information and preferences.
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-7 xl:grid-cols-2">

          {/* =========================
              LEFT COLUMN
          ========================== */}
          <section
            className="
              rounded-xl
              border border-[var(--border-2)]
              bg-[var(--surface)]
              p-6
              lg:p-7
            "
          >

            {/* Avatar */}
            <div className="flex items-center gap-6 mb-8">

              <div
                className="
                  relative
                  w-28 h-28
                  shrink-0
                  rounded-full
                  p-[2px]
                "
                style={{
                  background: ACCENT,
                }}
              >
                <img
                  src={
                    profile?.avatar_url ||
                    "/default-avatar.png"
                  }
                  alt={displayName}
                  className="
                    w-full h-full
                    rounded-full
                    object-cover
                    border-2 border-[var(--surface)]
                  "
                />
              </div>

              <div>
                <button
                  onClick={onChangePhoto}
                  className="
                    inline-flex items-center gap-2
                    rounded-full
                    border
                    px-5 py-2.5
                    text-sm font-medium
                    transition
                  "
                  style={{
                    borderColor: ACCENT,
                    color: ACCENT,
                  }}
                >
                  <Camera size={16} />
                  Change photo
                </button>

                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  JPG, PNG or WebP. Max 5MB.
                </p>
              </div>
            </div>

            {/* Display name */}
            <div className="mb-6">
              <Label>Display name</Label>

              <Input
                value={displayName}
                onChange={(e) =>
                  setDisplayName(e.target.value)
                }
              />
            </div>

            {/* Username */}
            <div className="mb-6">
              <Label>Username</Label>

              <Input
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
              />

              <p className="mt-2 text-xs text-[var(--text-muted)]">
                This is your public profile URL:
                {" "}
                spinrealm.com/users/{username}
              </p>
            </div>

            {/* Bio */}
            <div className="mb-7">
              <Label>Bio</Label>

              <textarea
                value={bio}
                onChange={(e) =>
                  setBio(e.target.value)
                }
                maxLength={500}
                rows={4}
                className="
                  w-full
                  resize-none
                  rounded-lg
                  border border-[var(--border-2)]
                  bg-[var(--surface)]
                  px-3.5 py-3
                  text-sm
                  text-[var(--text)]
                  outline-none
                  transition
                  focus:border-[#F04BA8]
                  focus:ring-1 focus:ring-[#F04BA8]/30
                "
              />

              <div className="mt-1 text-right text-xs text-[var(--text-muted)]">
                {bio.length}/500
              </div>
            </div>

            <div className="border-t border-[var(--border-2)] pt-7">

              {/* Email */}
              <div className="mb-8">
                <Label>
                  Email{" "}
                  <span className="font-normal text-[var(--text-muted)]">
                    (not public)
                  </span>
                </Label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-[var(--text-muted)]
                    "
                  />

                  <Input
                    value={profile?.email || ""}
                    disabled
                    onChange={() => {}}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="
                    rounded-full
                    px-7 py-3
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:brightness-110
                    disabled:opacity-50
                  "
                  style={{
                    background: ACCENT,
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  onClick={() => navigate(-1)}
                  className="
                    rounded-full
                    border border-[var(--border-2)]
                    px-7 py-3
                    text-sm
                    text-[var(--text-muted)]
                    transition
                    hover:border-[#F04BA8]
                    hover:text-[#F04BA8]
                  "
                >
                  Cancel
                </button>

              </div>
            </div>
          </section>


          {/* =========================
              RIGHT COLUMN
          ========================== */}
          <div className="space-y-5">

            {/* Favorite Genres */}
            <section
              className="
                rounded-xl
                border border-[var(--border-2)]
                bg-[var(--surface)]
                p-6
              "
            >
              <SectionTitle
                icon={Music2}
                title="Favorite Genres"
                description="Select the genres that best describe your taste in music."
              />

              <div className="flex flex-wrap gap-2">

                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => removeGenre(genre)}
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      bg-[#F04BA8]/10
                      px-3.5 py-2
                      text-xs
                      font-medium
                      text-[#F04BA8]
                      transition
                      hover:bg-[#F04BA8]/20
                    "
                  >
                    {genre}
                    <X size={13} />
                  </button>
                ))}

              </div>

              <button
                className="
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-4 py-2
                  text-xs
                  font-medium
                  transition
                  hover:bg-[#F04BA8]/10
                "
                style={{
                  borderColor: ACCENT,
                  color: ACCENT,
                }}
              >
                <Plus size={15} />
                Add Genre
              </button>
            </section>


            {/* Favorite Artists */}
            <section
              className="
                rounded-xl
                border border-[var(--border-2)]
                bg-[var(--surface)]
                p-6
              "
            >
              <SectionTitle
                icon={UserRound}
                title="Favorite Artists"
                description="Add your favorite artists (max 10)."
              />

              <div className="flex flex-wrap gap-7">

                {artists.map((artist) => (
                  <div
                    key={artist.id}
                    className="relative w-20 text-center"
                  >
                    <div className="relative mx-auto w-16">

                      <img
                        src={
                          artist.image_url ||
                          "/default-artist.png"
                        }
                        alt={artist.name}
                        className="
                          h-16 w-16
                          rounded-full
                          object-cover
                          border
                          border-[var(--border-2)]
                        "
                      />

                      <button
                        onClick={() =>
                          removeArtist(artist.id)
                        }
                        className="
                          absolute
                          -right-1
                          -top-1
                          flex
                          h-5 w-5
                          items-center
                          justify-center
                          rounded-full
                          bg-[#F04BA8]
                          text-white
                        "
                      >
                        <X size={12} />
                      </button>

                    </div>

                    <p className="mt-2 truncate text-xs text-[var(--text)]">
                      {artist.name}
                    </p>
                  </div>
                ))}

              </div>

              <button
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-4 py-2
                  text-xs
                  font-medium
                  transition
                  hover:bg-[#F04BA8]/10
                "
                style={{
                  borderColor: ACCENT,
                  color: ACCENT,
                }}
              >
                <Plus size={15} />
                Add Artist
              </button>
            </section>


            {/* Favorite Song */}
            <section
              className="
                rounded-xl
                border border-[var(--border-2)]
                bg-[var(--surface)]
                p-6
              "
            >
              <SectionTitle
                icon={Music2}
                title="Favorite Song"
                description="Choose a song that means a lot to you."
              />

              {favoriteSong ? (
                <div
                  className="
                    flex
                    items-center
                    gap-4
                    rounded-lg
                    border border-[var(--border-2)]
                    p-3
                  "
                >

                  <img
                    src={
                      favoriteSong.album_cover_url ||
                      "/default-album.png"
                    }
                    alt={favoriteSong.album_title}
                    className="
                      h-24 w-24
                      shrink-0
                      rounded-md
                      object-cover
                    "
                  />

                  <div className="min-w-0 flex-1">

                    <h3 className="truncate text-sm font-medium text-[var(--text)]">
                      {favoriteSong.title}
                    </h3>

                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {favoriteSong.artist?.name ||
                        favoriteSong.artist}
                    </p>

                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {favoriteSong.album_title}
                    </p>

                    <button
                      className="
                        mt-3
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        px-4 py-1.5
                        text-xs
                        font-medium
                        transition
                        hover:bg-[#F04BA8]/10
                      "
                      style={{
                        borderColor: ACCENT,
                        color: ACCENT,
                      }}
                    >
                      <Pencil size={13} />
                      Change song
                    </button>

                  </div>

                  <button
                    onClick={() => setFavoriteSong(null)}
                    className="
                      self-start
                      text-[#F04BA8]
                      transition
                      hover:opacity-70
                    "
                  >
                    <X size={18} />
                  </button>

                </div>
              ) : (
                <button
                  className="
                    flex w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border border-dashed
                    border-[var(--border-2)]
                    py-8
                    text-sm
                    text-[var(--text-muted)]
                    transition
                    hover:border-[#F04BA8]
                    hover:text-[#F04BA8]
                  "
                >
                  <Plus size={17} />
                  Choose a favorite song
                </button>
              )}

            </section>

          </div>
        </div>
      </main>
    </div>
  );
}