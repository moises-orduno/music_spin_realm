import { Chip } from "../components/ui-bits";
import { Tag, Search,ArrowRight, SlidersHorizontal } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getRecommended } from "../services/marketplaceService";
import { useNavigate } from "react-router-dom";

export default function Marketplace() {
    const [listings, setListings] = useState([]);
    const [loadingListings, setLoadingListings] = useState(true);
    const [error, setError] = useState(null);

    const [filter, setFilter] = useState("all");

    const navigate = useNavigate();

    useEffect(() => {
        const loadListings = async () => {
            try {
                setLoadingListings(true);
                setError(null);

                const data = await getRecommended();
                console.log("data", data);
                setListings(data);
            } catch (err) {
                console.error("Failed to load marketplace", err);
                setError(err.message || "Failed to load marketplace");
            } finally {
                setLoadingListings(false);
            }
        };

        loadListings();
    }, []);

    const handleSearchAlbumClick = () => {

        navigate(
            "/listsSearch",
            {
                state: {
                    returnTo: "/albums/",
                    storageKey: `album-detail`,
                },
            }
        );
    };

    const filteredListings = listings.filter((listing) => {
        if (filter === "all") return true;

        return listing.status === filter;
    });

    const formatPrice = (price, currency = "USD") => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
        }).format(price);
    };

    return (
        <div className="space-y-8 fade-in-up" data-testid="marketplace-page">

            {/* Header */}
            <div className="flex items-start justify-between gap-6 flex-wrap">
                <div>
                    <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] mb-3">
                        Records for the collection
                    </div>

                    <h1 className="font-serif text-[40px] leading-tight mb-3">
                        Marketplace
                    </h1>

                    <p className="text-[14px] text-[var(--text-muted)] max-w-[560px]">
                        Discover records available from collectors and sellers.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                    <Chip
                        active={filter === "all"}
                        onClick={() => setFilter("all")}
                    >
                        All ({listings.length})
                    </Chip>

                    <Chip
                        active={filter === "available"}
                        onClick={() => setFilter("available")}
                    >
                        🟢 Available
                    </Chip>
                </div>

                <button className="btn-ghost inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm">
                    <SlidersHorizontal size={14} />
                    Filters
                </button>
            </div>

            <button
                onClick={handleSearchAlbumClick}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] hover:border-[var(--accent)]/40 hover:bg-[var(--panel-2)] transition group text-left"
                data-testid="open-search-link"
            >
                <Search
                    size={17}
                    className="text-[var(--text-dim)] group-hover:text-[var(--accent-2)] transition"
                    strokeWidth={1.8}
                />
                <span className="flex-1 text-[13.5px] text-[var(--text-dim)] group-hover:text-[var(--text)] transition">
                    Search any album or artist...
                </span>
                <span className="text-[11px] text-[var(--text-dim)] hidden sm:flex items-center gap-1">
                    Open search <ArrowRight size={11} />
                </span>
            </button>

            {/* Listings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {loadingListings ? (
                    <p>Loading marketplace...</p>

                ) : error ? (
                    <div className="col-span-full text-center py-16">
                        <p className="text-[var(--text-muted)]">
                            {error}
                        </p>
                    </div>

                ) : filteredListings.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                        <div className="text-5xl mb-4">💿</div>

                        <h2 className="font-serif text-2xl mb-2">
                            No records for sale
                        </h2>

                        <p className="text-[var(--text-muted)]">
                            Check back soon for new listings.
                        </p>
                    </div>

                ) : (
                    filteredListings.map((listing) => (
                        <div
                            key={listing.album?.id}
                            onClick={() =>
                                navigate(`/albums/${listing.album?.id}`)
                            }
                            className="card-panel hover-lift p-4 sm:p-5 flex gap-4 sm:gap-5 cursor-pointer"
                        >
                            {/* Cover */}
                            <div
                                className="cover cover-placeholder w-[88px] h-[88px] sm:w-[110px] sm:h-[110px] shrink-0"
                                style={{
                                    backgroundImage: listing.album?.cover_url
                                        ? `url(${listing.album.cover_url})`
                                        : undefined,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                }}
                            >
                                {!listing.album?.cover_url && (
                                    <div className="font-serif opacity-80 text-[11px]">
                                        {listing.album?.title}
                                    </div>
                                )}
                            </div>

                            {/* Information */}
                            <div className="flex-1 min-w-0">

                                <div className="flex items-start justify-between gap-3 mb-2">

                                    <div className="min-w-0">
                                        <h3 className="font-serif text-[20px] leading-tight truncate">
                                            {listing.album?.title}
                                        </h3>

                                        <div className="text-[12.5px] text-[var(--text-muted)]">
                                            {listing.album?.artist?.name ||
                                                listing.album?.artist ||
                                                "Unknown Artist"}
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <div className="text-[18px] font-serif text-[var(--accent)]">
                                            {formatPrice(
                                                listing.price,
                                                listing.currency
                                            )}
                                        </div>

                                        <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider">
                                            price
                                        </div>
                                    </div>

                                </div>

                                {/* Pressing information */}
                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-[var(--text-muted)] mt-3">

                                    <span className="flex items-center gap-1.5">
                                        <Tag size={11} />

                                        {[
                                            listing.pressing_year,
                                            listing.pressing_country,
                                            listing.format,
                                        ]
                                            .filter(Boolean)
                                            .join(" • ")}
                                    </span>

                                </div>

                                {/* Condition */}
                                <div className="mt-2 text-sm text-[var(--text-muted)]">
                                    {listing.media_condition &&
                                        `Media: ${listing.media_condition}`}

                                    {listing.media_condition &&
                                        listing.sleeve_condition &&
                                        " · "}

                                    {listing.sleeve_condition &&
                                        `Sleeve: ${listing.sleeve_condition}`}
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/albums/${listing.album?.id}`);
                                        }}
                                        className="border border-[var(--border-2)] text-[12px] px-3 py-1.5 rounded-full btn-ghost"
                                    >
                                        Details
                                    </button>

                                    <button
                                        onClick={() =>
                                            navigate(`/albums/${listing.album?.id}`)
                                        }
                                        className="bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-[var(--accent)] text-[12px] px-3 py-1.5 rounded-full hover:bg-[var(--accent)]/20 transition"
                                    >
                                        View Listing
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