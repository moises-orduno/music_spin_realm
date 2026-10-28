import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Camera,
  X,
  Plus,
  Music2,
  UserRound,
  Pencil,
  Search,
  Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../lib/utils";
import { getProfile, updateUser } from "../services/userService";
const ACCENT = "#8b5cf6";
import { getCurrentUser } from "../services/authService";
import { getSearch } from "../services/artistService";

const GENRES = [
  "Alternative",
  "Alternative Rock",
  "Blues",
  "Classical",
  "Country",
  "Electronic",
  "Folk",
  "Funk",
  "Grunge",
  "Hip-Hop",
  "Indie",
  "Jazz",
  "Metal",
  "Pop",
  "Punk",
  "R&B",
  "Reggae",
  "Rock",
  "Soul",
];

function ArtistPicker({
  onChange,
  onClose,
  pickedArtists
}) {
  const MAX_ARTISTS = 5;

  const [search, setSearch] = useState("");
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const value = search.trim();

    if (!value) {
      setArtists([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const data = await getSearch(value);
        setArtists(data);
      } catch (error) {
        console.error("Artist search error:", error);
        setArtists([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const selectArtist = (artist) => {
    // Maximum of 5 artists
    if (pickedArtists.length >= MAX_ARTISTS) {
      return;
    }

    // Prevent duplicates
    if (pickedArtists.some((picked) => picked.id === artist.id)) {
      return;
    }

    // Don't mutate pickedArtists directly
    onChange([...pickedArtists, artist]);

    onClose();
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black
        px-4
      "
      onClick={onClose}
    >
      <div
        className="
          w-full max-w-md
          rounded-2xl
          border
          bg-[var(--background)]
          p-5
          shadow-xl
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">
              Add artist
            </h2>

            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Select up to {MAX_ARTISTS} artists ({pickedArtists.length}/{MAX_ARTISTS})
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-full
              p-2
              transition
              hover:bg-[var(--surface-hover)]
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-5">
          <Search
            size={16}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-[var(--text-muted)]
            "
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search artist..."
            autoFocus
            className="
              w-full
              rounded-xl
              border
              bg-transparent
              py-2.5
              pl-9
              pr-3
              text-sm
              outline-none
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            disabled={pickedArtists.length >= MAX_ARTISTS}
          />
        </div>

        {/* Maximum reached */}
        {pickedArtists.length >= MAX_ARTISTS && (
          <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
            You've reached the maximum of {MAX_ARTISTS} artists.
          </p>
        )}

        {/* Results */}
        <div className="mt-4 max-h-80 overflow-y-auto">
          {loading && (
            <p className="py-8 text-center text-sm text-[var(--text-muted)]">
              Searching...
            </p>
          )}

          {!loading &&
            pickedArtists.length < MAX_ARTISTS &&
            search.trim() &&
            artists.length === 0 && (
              <p className="py-8 text-center text-sm text-[var(--text-muted)]">
                No artists found
              </p>
            )}

          {!loading && artists.length > 0 && (
            <div className="space-y-1">
              {artists.map((artist) => {
                const isSelected = pickedArtists.some(
                  (picked) => picked.id === artist.id
                );

                const isDisabled =
                  isSelected ||
                  pickedArtists.length >= MAX_ARTISTS;

                return (
                  <button
                    key={artist.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => selectArtist(artist)}
                    className="
                      flex w-full
                      items-center
                      gap-3
                      rounded-xl
                      p-2.5
                      text-left
                      transition
                      hover:bg-[var(--surface-hover)]
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {/* Artist image */}
                    <div
                      className="
                        h-11 w-11
                        flex-shrink-0
                        overflow-hidden
                        rounded-full
                        bg-[var(--surface-hover)]
                      "
                    >
                      {artist.image_url ? (
                        <img
                          src={artist.image_url}
                          alt={artist.name}
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                        />
                      ) : (
                        <div
                          className="
                            flex h-full w-full
                            items-center justify-center
                            text-sm font-semibold
                          "
                          style={{
                            color: ACCENT,
                          }}
                        >
                          {artist.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Artist information */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {artist.name}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                        {[
                          artist.country,
                          artist.genres?.slice(0, 2).join(" · "),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>

                    {/* Selected state */}
                    {isSelected && (
                      <span className="flex-shrink-0 text-xs text-[var(--text-muted)]">
                        Added
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GenrePicker({
  selectedGenres,
  onChange,
  onClose,
}) {
  const [search, setSearch] = useState("");

  const filteredGenres = GENRES.filter((genre) =>
    genre.toLowerCase().includes(search.toLowerCase())
  );

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      onChange(selectedGenres.filter((g) => g !== genre));
    } else {
      onChange([...selectedGenres, genre]);
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black
        px-4
      "
      onClick={onClose}
    >
      <div
        className="
          w-full max-w-md
          rounded-2xl
          border
          bg-[var(--background)]
          p-5
          shadow-xl
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">
              Add genres
            </h2>

            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Select one or more genres
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-full
              p-2
              transition
              hover:bg-[var(--surface-hover)]
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-5">
          <Search
            size={16}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-[var(--text-muted)]
            "
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search genres..."
            className="
              w-full
              rounded-xl
              border
              bg-transparent
              py-2.5
              pl-9
              pr-3
              text-sm
              outline-none
            "
          />
        </div>

        {/* Selected */}
        {selectedGenres.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">
              Selected
            </p>

            <div className="flex flex-wrap gap-2">
              {selectedGenres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className="
                    inline-flex
                    items-center
                    gap-1
                    rounded-full
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                  "
                  style={{
                    backgroundColor: `${ACCENT}15`,
                    color: ACCENT,
                  }}
                >
                  {genre}
                  <X size={12} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Genre list */}
        <div className="mt-5 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {filteredGenres.map((genre) => {
              const selected = selectedGenres.includes(genre);

              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className="
                    flex items-center justify-between
                    rounded-xl
                    border
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    transition
                    hover:bg-[var(--surface-hover)]
                  "
                  style={{
                    borderColor: selected
                      ? ACCENT
                      : "var(--border)",
                    color: selected
                      ? ACCENT
                      : "var(--text)",
                  }}
                >
                  {genre}

                  {selected && (
                    <Check size={15} />
                  )}
                </button>
              );
            })}
          </div>

          {filteredGenres.length === 0 && (
            <p className="py-8 text-center text-sm text-[var(--text-muted)]">
              No genres found
            </p>
          )}
        </div>

        {/* Done */}
        <button
          type="button"
          onClick={onClose}
          className="
            mt-5
            w-full
            rounded-xl
            py-2.5
            text-sm
            font-medium
            text-white
          "
          style={{
            backgroundColor: ACCENT,
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

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

export default function ProfileForm() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [displayName, setDisplayName] = useState("");

  const [username, setUsername] = useState("");

  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");

  const [genres, setGenres] = useState([]);

  const [artists, setArtists] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [currentlyListeningAlbum, setCurrentlyListeningAlbum] = useState(null);
  const [showGenrePicker, setShowGenrePicker] = useState(false);
  const [showArtistPicker, setShowArtistPicker] = useState(false);

  const user = getCurrentUser();
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const [photoPreview, setPhotoPreview] = useState(null);

  const onPhotoSelected = (file) => {
    setSelectedPhoto(file);

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("display_name", displayName);
      formData.append("username", username);
      formData.append("bio", bio);

      formData.append(
        "favorite_genres",
        JSON.stringify(genres)
      );

      formData.append(
        "favorite_artists",
        JSON.stringify(artists.map((artist) => artist.id))
      );

      if (currentlyListeningAlbum?.id) {
        formData.append(
          "currently_listening_album_id",
          currentlyListeningAlbum?.id
        );
      }

      if (selectedPhoto) {
        formData.append(
          "avatar",
          selectedPhoto
        );
      }

      await updateUser(formData);

      sessionStorage.removeItem("profile-form");

      navigate(`/profile`);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
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

  const handleAddAlbumClick = () => {

    navigate("/listAddAlbum", {
      state: {
        returnTo: `/profileForm/edit`,
        storageKey: `profile-form`,
      },
    });
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

        setBio(data.bio);
        setUsername(data.username);
        setDisplayName(data.display_name);
        setEmail(data.email);
        setGenres(data.favorite_genres);
        setArtists(data.favorite_artists);
        setAvatarUrl(data.avatar_url);

        if (data.currentlyListeningAlbum) {
          setCurrentlyListeningAlbum(data.currentlyListeningAlbum);
        } else {
          const cached = sessionStorage.getItem("profile-form");

          if (!cached) return;

          const draft = JSON.parse(cached);
          const selectedAlbum = draft.items?.[0]?.album;

          if (selectedAlbum) {
            setCurrentlyListeningAlbum(selectedAlbum);
          }

        }

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
            hover:text-[#8b5cf6]
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
                {photoPreview ? (
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Profile preview"
                        className="h-32 w-32 rounded-full object-cover border"
                        style={{
                          borderColor: `${ACCENT}80`,
                        }}
                      />
                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <img
                      src={getImageUrl(avatarUrl, `default_user_image.png`)}
                      alt={displayName}
                      className="
                    w-full h-full
                    rounded-full
                    object-cover
                    border-2 border-[var(--surface)]
                  "
                    />
                  </div>
                )}
              </div>

              <div>
                <input
                  id="photo-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      onPhotoSelected(file);
                    }

                    // Allows selecting the same file again later
                    e.target.value = "";
                  }}
                />
                <label
                  htmlFor="photo-upload"
                  className="
                      flex flex-col items-center justify-center
                      rounded-2xl
                      border border-dashed
                      px-6 py-8
                      text-center
                      cursor-pointer
                      transition
                      hover:bg-[var(--surface-hover)]
                      "
                  style={{
                    borderColor: `${ACCENT}80`,
                  }}
                >
                  <Camera size={22} style={{ color: ACCENT }} />

                  <p className="mt-3 text-sm font-medium">
                    Drag & drop your photo here
                  </p>

                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    or click to choose a file
                  </p>

                  <span
                    className="mt-3 inline-flex items-center rounded-full border px-5 py-2.5 text-sm font-medium"
                    style={{
                      borderColor: ACCENT,
                      color: ACCENT,
                    }}
                  >
                    Choose photo
                  </span>

                  <p className="mt-3 text-xs text-[var(--text-muted)]">
                    JPG, PNG or WebP · Max 5MB
                  </p>
                </label>
              </div>
            </div>


            {/* Username */}
            <div className="card-panel p-5" data-testid="username-field">
              <Label className="text-[12.5px] font-medium mb-2 block">
                Username
              </Label>

              <div className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg px-4 py-3 text-[14px] text-[var(--text)]">
                {username}
              </div>
            </div>

            {/* Email */}
            <div className="card-panel p-5" data-testid="email-field">
              <Label className="text-[12.5px] font-medium mb-2 block">
                Email
              </Label>

              <div className="w-full bg-[var(--panel-2)] border border-[var(--border)] 
              rounded-lg px-4 py-3 text-[14px] text-[var(--text)]">
                {email}
              </div>
            </div>

            {/* Display name */}
            <div data-testid="display-name-field">
              <Label>Display name</Label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value.slice(0, 50))}
                maxLength={50}
                className="w-full bg-[var(--panel)] border rounded-xl px-4 py-3.5 pr-11 text-[13.5px] 
                            placeholder:text-[var(--text-dim)] 
                            focus:outline-none focus:ring-2 transition border-[var(--border)] focus:ring-[var(--accent)]"

              />
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
                className="w-full bg-[var(--panel)] border rounded-xl px-4 py-3.5 pr-11 text-[13.5px] 
                            placeholder:text-[var(--text-dim)] 
                            focus:outline-none focus:ring-2 transition border-[var(--border)] focus:ring-[var(--accent)]"
              />

              <div className="mt-1 text-right text-xs text-[var(--text-muted)]">
                {bio.length}/500
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
                      bg-[#8b5cf6]/10
                      px-3.5 py-2
                      text-xs
                      font-medium
                      text-[#8b5cf6]
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
                onClick={() => setShowGenrePicker(true)}
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

              {showGenrePicker && (
                <GenrePicker
                  selectedGenres={genres}
                  onChange={setGenres}
                  onClose={() => setShowGenrePicker(false)}
                />
              )}
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
                description="Add your favorite artists."
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
                onClick={() => setShowArtistPicker(true)}
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

              {showArtistPicker && (
                <ArtistPicker
                  onChange={setArtists}
                  onClose={() => setShowArtistPicker(false)}
                  pickedArtists={artists}
                />
              )}
            </section>


            {/* Album currently listing to */}
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
                title="I'm listening to"
                description="Choose the album you are listening to now."
              />

              {currentlyListeningAlbum ? (
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
                      currentlyListeningAlbum.cover_url ||
                      "/default-album.png"
                    }
                    alt={currentlyListeningAlbum.title}
                    className="
                      h-24 w-24
                      shrink-0
                      rounded-md
                      object-cover
                    "
                  />

                  <div className="min-w-0 flex-1">

                    <h3 className="truncate text-sm font-medium text-[var(--text)]">
                      {currentlyListeningAlbum.title}
                    </h3>

                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {currentlyListeningAlbum.artist.name}
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
                      Change album
                    </button>

                  </div>

                  <button
                    onClick={handleAddAlbumClick}
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
                  onClick={handleAddAlbumClick}
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
                    hover:border-[#8b5cf6]
                    hover:text-[#8b5cf6]
                  "
                >
                  <Plus size={17} />
                  Choose an album
                </button>
              )}

            </section>

          </div>
        </div>
        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] px-6 py-3 text-sm transition hover:border-[var(--accent)] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            data-testid="continue-btn"
            className="btn-accent inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={17} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}