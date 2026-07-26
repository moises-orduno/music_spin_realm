import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Search, Plus, TrendingUp, ArrowRight } from "lucide-react";
import { getAlbumSuggestions } from "../services/albumService";

function AlbumTile({ a, onAdd }) {
    return (
        <div
            className="card-panel overflow-hidden group hover-lift"
            data-testid={`suggestion-${a.id}`}
        >
            <div className="aspect-square relative overflow-hidden">
                <img
                    src={a.cover_url || "/placeholder-album.png"}
                    alt={a.title}
                    className="w-full h-full object-cover"
                />

                {a.genres?.length > 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9.5px] tracking-wider uppercase font-semibold bg-[var(--accent)] text-white">
                        {a.genres[0]}
                    </span>
                )}
            </div>

            <div className="p-3">
                <div className="text-[13px] font-medium truncate">
                    {a.title}
                </div>

                <div className="text-[11.5px] text-[var(--text-muted)] truncate mb-3">
                    {a.artist.name} · {a.year}
                </div>

                <button
                    onClick={() => onAdd(a)}
                    data-testid={`add-btn-${a.id}`}
                    className="w-full rounded-lg py-2 text-[11.5px] font-medium bg-[var(--accent-soft)] text-[var(--accent-2)] border border-[var(--accent)]/30 hover:bg-[var(--accent)] hover:text-white transition flex items-center justify-center gap-1.5"
                >
                    <Plus size={12} />
                    Add to list
                </button>
            </div>
        </div>
    );
}

export default function ListAddAlbum() {
    const { id } = useParams();
    const navigate = useNavigate();
    const listId = id || "saddest-albums-ever";
    const suggestionCategories = ["Similar Albums"];
    const [loading, setLoading] = useState(true);

    /* ---------------------------
          Fetch list
       ----------------------------*/
    const [albumSuggestions, setAlbumSuggestions] = useState([]);

    useEffect(() => {

        async function fetchSuggestions() {
            setLoading(true);
            console.log("id", id);

            try {
                const data = await getAlbumSuggestions(id);

                setAlbumSuggestions(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchSuggestions();
    }, [id]);


    const handleAdd = (album) => {
        const payload = {
            listId,
            albums: [album],
        };

        const draft = JSON.parse(sessionStorage.getItem(`remix-${id}`));

        draft.items.push({
            id: crypto.randomUUID(),
            position: draft.items.length,
            album,
            why_this_album: "",
            favorite_lyric: "",
            owned: false,
            hunting: false,
        });

        sessionStorage.setItem(
            `remix-${id}`,
            JSON.stringify(draft)
        );

        navigate(`/listsRemix/${id}`); navigate(`/listsRemix/${id}`);
    };

    return (
        <div className="max-w-[1100px] mx-auto fade-in-up space-y-8" data-testid="album-picker-page">
            <Link to={`/lists/${listId}/remix`} className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] inline-flex items-center gap-1.5" data-testid="back-link">
                <ArrowLeft size={13} /> Back to remix
            </Link>

            <div>
                <h1 className="font-serif text-[34px] sm:text-[40px] leading-none mb-2">Add an album</h1>
                <p className="text-[13px] text-[var(--text-muted)]">Pick from our suggestions, or search for anything.</p>
            </div>

            <Link
                to={`/listsRemixSearch/${listId}`}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] hover:border-[var(--accent)]/40 hover:bg-[var(--panel-2)] transition group"
                data-testid="open-search-link"
            >
                <Search size={17} className="text-[var(--text-dim)] group-hover:text-[var(--accent-2)] transition" strokeWidth={1.8} />
                <span className="flex-1 text-[13.5px] text-[var(--text-dim)] group-hover:text-[var(--text)] transition">
                    Search any album or artist...
                </span>
                <span className="text-[11px] text-[var(--text-dim)] hidden sm:flex items-center gap-1">
                    Open search <ArrowRight size={11} />
                </span>
            </Link>

            {suggestionCategories.map((cat) => (
                <section key={cat.id} data-testid={`category-${cat.id}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            {cat.id === "trending" && <TrendingUp size={16} className="text-[var(--accent-2)]" />}
                            <h2 className="font-serif text-[20px]">{cat.label}</h2>
                        </div>
                        <button className="text-[12px] text-[var(--text-muted)] hover:text-[var(--accent-2)] flex items-center gap-1">
                            See more <ArrowRight size={11} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {albumSuggestions.map((a) => (
                            <AlbumTile
                                key={a.id}
                                a={a}
                                onAdd={handleAdd}
                            />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
