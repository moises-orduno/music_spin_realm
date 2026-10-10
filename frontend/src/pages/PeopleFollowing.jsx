
import { React, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, UserCheck } from "lucide-react";
import { getProfilesFollowing, toggleFollowById } from "../services/userService";

export default function PeopleFollowing() {

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfilesFollowing = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getProfilesFollowing();
        setProfiles(data);

      } catch (err) {
        setError(err.message || "Failed to load profiles");
      } finally {
        setLoading(false);
      }
    };

    loadProfilesFollowing();
  }, []);

  const handleFollowClick = async (userId) => {
    try {
      const result = await toggleFollowById(userId);

      setProfiles((prevProfiles) =>
        prevProfiles.map((profile) =>
          profile.id === userId
            ? {
              ...profile,
              is_following: result.following,
              followers_count: result.followers_count,
            }
            : profile
        )
      );
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="space-y-8 fade-in-up" data-testid="people-page">
      <div>
        <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] mb-3">The Community</div>
        <h1 className="font-serif text-[32px] sm:text-[40px] leading-tight mb-3">People</h1>
        <p className="text-[14px] text-[var(--text-muted)] max-w-[560px]">
          Discover collectors who share your taste — and others who will open your ears to something new.
        </p>
      </div>

      {loading ? (
        <p>Loading profiles...</p>

      ) :

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((s) => (
            <Link
              key={s.id}
              to={`/collection/${s.username}`}
              className="card-panel hover-lift p-6 cursor-pointer block"
              data-testid={`person-${s.id}`}
            >
              <div className="flex items-start gap-4 mb-4">

                {/* Avatar */}
                <div
                  className="w-[64px] h-[64px] rounded-full shrink-0 border border-[var(--border-2)]"
                  style={{
                    background: `linear-gradient(135deg, ${s.avatarColor}, #1a1612)`
                  }}
                />

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">

                    <div className="min-w-0">
                      <div className="text-[14px] font-medium truncate">
                        {s.display_name}
                      </div>

                      <div className="text-[10.5px] text-[var(--text-dim)] mt-0.5">
                        {s.followers_count} followers
                      </div>
                    </div>

                    {/* Follow button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFollowClick(s.id);
                      }}
                      className={`shrink-0 border text-[11.5px] px-3 py-1.5 rounded-full transition flex items-center gap-1.5 ${s.is_following
                        ? "border-[var(--border)] text-[var(--text-muted)]"
                        : "border-[var(--accent)]/40 text-[var(--accent-2)] hover:bg-[var(--accent-soft)]"
                        }`}
                      data-testid={`follow-btn-${s.id}`}
                    >
                      {s.is_following ? (
                        <>
                          <UserCheck size={11} />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus size={11} />
                          Follow
                        </>
                      )}
                    </button>

                  </div>
                </div>
              </div>

              <p className="font-serif text-[15px] italic text-[var(--text)]/85 leading-snug mb-4">
                "{s.bio}"
              </p>

              {(() => {
                const album = s.collection_album;

                if (!album) {
                  return (
                    <div className="text-[11px] text-[var(--text-muted)]">
                      No albums in the collection yet
                    </div>
                  );
                }

                return (
                  <div className="flex items-center gap-3">
                    <img
                      src={album.cover_url}
                      alt={album.title}
                      className="w-[44px] h-[44px] rounded object-cover border border-[var(--border)]"
                    />

                    <div className="min-w-0">
                      <div className="text-[12px] font-medium truncate">
                        {album.title}
                      </div>

                      <div className="text-[10px] text-[var(--text-muted)]">
                        Collection
                      </div>
                    </div>
                  </div>
                );
              })()}
            </Link>
          ))}
        </div>}
    </div>
  );
}
