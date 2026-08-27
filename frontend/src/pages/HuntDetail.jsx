import { Link, useNavigate, useParams } from "react-router-dom";
import { getHuntById } from "../services/huntService";
import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";

import {
    getAlbumListings
}
    from "../services/marketplaceService";

import {
    ArrowLeft, ChevronDown, Globe, Calendar, Target, MapPin, Info, Pencil, Disc3, BadgeCheck, Wallet
} from "lucide-react";

function Label({ children, hint }) {
    return (
        <div className="flex items-center justify-between mb-3">
            <label className="text-[10.5px] tracking-[0.15em] uppercase text-[var(--text-muted)]">{children}</label>
            {hint && (
                <button type="button" className="text-[11px] text-[var(--accent-2)] hover:underline flex items-center gap-1">
                    <Info size={11} /> {hint}
                </button>
            )}
        </div>
    );
}

function DetailRow({ Icon, label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 px-7 py-3.5 border-b border-[var(--border)] last:border-b-0">
            <div className="flex items-center gap-3 shrink-0">
                <Icon
                    size={16}
                    className="text-[var(--text-muted)]"
                    strokeWidth={1.7}
                />
                <span className="text-[13px] text-[var(--text-muted)]">
                    {label}
                </span>
            </div>

            <span className="text-[13px] text-right text-[var(--text)] whitespace-pre-line">
                {value}
            </span>
        </div>
    );
}

export default function HuntDetail() {

    const { huntId } = useParams();

    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [step, setStep] = useState("form");

    const [hunt, setHunt] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copies, setCopies] = useState([]);


    useEffect(() => {
        const initializeForm = async () => {
            try {
                setLoading(true);
                setError(null);
                // EDIT MODE
                const hunt = await getHuntById(huntId);
                setHunt(hunt);


            } catch (err) {
                console.error(err);
                setError(
                    err.message ||
                    `Failed to load hunt`
                );
            } finally {
                setLoading(false);
            }
        };

        async function fetchCopies() {

            try {
                const data = await getAlbumListings(id);
                setCopies(data);
            } catch (err) {
                console.error("Failed to load debate:", err);
            } finally {
            }
        }

        fetchCopies();

        initializeForm();
    }, [huntId]);


    if (loading || !hunt) {
        return <div className="p-6">Loading Hunt...</div>;
    }

    return (

        <div
            className="flex gap-6 min-w-0 fade-in-up"
            data-testid="hunt-details-page"
        >
            <div className="flex-1 min-w-0 max-w-3xl space-y-6">

                {/* Back */}
                <Link
                    to="/hunt"
                    className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] inline-flex items-center gap-1.5"
                >
                    <ArrowLeft size={13} />
                    Back to hunts
                </Link>

                {/* Header / Album */}
                <div className="card-panel p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-5">

                        {/* Cover */}
                        <div
                            className="w-full sm:w-[180px] aspect-square sm:h-[180px] rounded-lg shrink-0 cover"
                            style={{
                                backgroundImage: hunt.album?.cover_url
                                    ? `url(${hunt.album.cover_url})`
                                    : undefined,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col">

                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span
                                            className="px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wide"
                                            style={{
                                                background: "var(--accent-soft)",
                                                color: "var(--accent-2)",
                                            }}
                                        >
                                            {hunt.status || "Hunting"}
                                        </span>

                                        <span className="text-[11px] text-[var(--text-dim)]">
                                            Looking for
                                        </span>
                                    </div>

                                    <h1 className="font-serif text-[28px] sm:text-[34px] leading-tight">
                                        {hunt.album?.title}
                                    </h1>

                                    <p className="text-[14px] text-[var(--text-muted)] mt-1">
                                        {hunt.album?.artist}
                                    </p>
                                </div>

                                {/* Edit button */}

                                <button
                                    onClick={() => navigate(`/huntForm/${hunt.id}/edit`)}
                                    className="btn-ghost border border-[var(--border)] px-3 py-2 rounded-lg text-[12px] flex items-center gap-2 shrink-0"
                                >
                                    <Pencil size={13} />
                                    Edit
                                </button>

                            </div>

                            <div className="mt-auto pt-6">
                                <div className="flex flex-wrap gap-2">

                                    {hunt.pressing && (
                                        <span className="px-3 py-1.5 rounded-full bg-[var(--panel-2)] border border-[var(--border)] text-[11px]">
                                            {hunt.pressing}
                                        </span>
                                    )}

                                    {hunt.country_pressing && (
                                        <span className="px-3 py-1.5 rounded-full bg-[var(--panel-2)] border border-[var(--border)] text-[11px]">
                                            {hunt.country_pressing} pressing
                                        </span>
                                    )}

                                    {hunt.year && (
                                        <span className="px-3 py-1.5 rounded-full bg-[var(--panel-2)] border border-[var(--border)] text-[11px]">
                                            {hunt.year}
                                        </span>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Hunt requirements */}
                <div className="card-panel overflow-hidden">

                    <div className="px-5 py-4 border-b border-[var(--border)]">
                        <div className="flex items-center gap-2">
                            <Target size={15} className="text-[var(--accent-2)]" />
                            <h2 className="font-serif text-[20px]">
                                Hunt requirements
                            </h2>
                        </div>
                    </div>

                    <div className="divide-y divide-[var(--border)]">

                        {/* Pressing */}
                        <DetailRow
                            Icon={Disc3}
                            label="Looking for"
                            value={hunt.pressing || "Any pressing"}
                        />

                        {/* Country */}
                        <DetailRow
                            Icon={Globe}
                            label="Country of pressing"
                            value={hunt.country_pressing || "Any country"}
                        />

                        {/* Year */}
                        <DetailRow
                            Icon={Calendar}
                            label="Year"
                            value={hunt.year || "Any year"}
                        />

                        {/* Condition */}
                        <DetailRow
                            Icon={BadgeCheck}
                            label="Minimum condition"
                            value={hunt.condition || "Any condition"}
                        />

                    </div>
                </div>


                {/* Price */}
                <div className="card-panel p-5">

                    <div className="flex items-center gap-2 mb-4">
                        <Wallet size={15} className="text-[var(--accent-2)]" />
                        <h2 className="font-serif text-[20px]">
                            Budget
                        </h2>
                    </div>

                    <div className="text-[28px] font-serif">
                        {hunt.price?.max
                            ? `Up to ${hunt.price.currency || "USD"} ${hunt.price.max}`
                            : "No maximum price specified"}
                    </div>

                    <p className="text-[11.5px] text-[var(--text-muted)] mt-1">
                        Maximum price including shipping.
                    </p>
                </div>


                {/* Location */}
                <div className="card-panel overflow-hidden">

                    <div className="px-5 py-4 border-b border-[var(--border)]">
                        <div className="flex items-center gap-2">
                            <MapPin size={15} className="text-[var(--accent-2)]" />
                            <h2 className="font-serif text-[20px]">
                                Location & shipping
                            </h2>
                        </div>
                    </div>

                    <div className="divide-y divide-[var(--border)]">

                        <DetailRow
                            Icon={Globe}
                            label="Seller location"
                            value={hunt.seller_location || "Anywhere"}
                        />

                        <DetailRow
                            Icon={MapPin}
                            label="Shipping to"
                            value={hunt.ship_to || "Not specified"}
                        />

                    </div>
                </div>


                {/* Notes */}
                {hunt.details && (
                    <div className="card-panel p-5">

                        <div className="flex items-center gap-2 mb-4">
                            <FileText size={15} className="text-[var(--accent-2)]" />
                            <h2 className="font-serif text-[20px]">
                                Additional details
                            </h2>
                        </div>

                        <p className="text-[13px] text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">
                            {hunt.details}
                        </p>
                    </div>
                )}


                {/* Owner */}
                {hunt.owner && (
                    <div className="card-panel p-5 flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--panel-2)]">
                            {hunt.owner.avatar_url ? (
                                <img
                                    src={hunt.owner.avatar_url}
                                    alt={hunt.owner.display_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[13px]">
                                    {hunt.owner.display_name?.[0]}
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider">
                                Hunt created by
                            </div>

                            <div className="text-[13px] font-medium">
                                {hunt.owner.display_name}
                            </div>
                        </div>
                    </div>
                )}


                {/* Future: matching listings */}
                <div className="card-panel p-6 text-center border border-dashed border-[var(--border)]">
                    <div className="text-3xl mb-3">🔎</div>

                    <h3 className="font-serif text-[20px] mb-2">
                        Matching records
                    </h3>

                    {copies.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="text-3xl mb-3">💿</div>

                            <h3 className="font-serif text-[18px] mb-1">
                                No copies available
                            </h3>

                            <p className="text-[12px] text-[var(--text-muted)]">
                                There are no copies of this album for sale right now.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2.5">
                                {copies.slice(0, 5).map((c) => (
                                    <CopyRow key={c.id} c={c} />
                                ))}
                            </div>

                            {copies.length > 5 && (
                                <div className="text-center mt-5">
                                    <button
                                        className="text-[12.5px] text-[var(--accent-2)] hover:underline inline-flex items-center gap-1.5"
                                        data-testid="view-all-copies"
                                    >
                                        View all {copies.length} copies
                                        <ArrowRight size={12} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}
