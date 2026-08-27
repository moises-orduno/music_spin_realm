
const PRESSING = ["Any pressing", "Original", "First Press", "Reissue", "Promo", "Other"];
const CONDITIONS = [
    { code: "G", label: "Good" },
    { code: "VG", label: "Very Good" },
    { code: "VG+", label: "Very Good Plus" },
    { code: "NM", label: "Near Mint" },
    { code: "M", label: "Mint" },
];

const COUNTRIES = ["United Kingdom", "United States", "Japan", "Germany", "France", "Italy", "Mexico", "Spain"];
import { Link, useNavigate } from "react-router-dom";
import { addToMyCollection } from "../services/collectionService";
import React, { useState, useEffect } from "react";

import {
    ArrowLeft, ChevronDown, Globe, Calendar, Info, Disc3
} from "lucide-react";

function Chip({ children, active, onClick, testid }) {
    return (
        <button
            type="button"
            onClick={onClick}
            data-testid={testid}
            className={`px-4 py-1.5 rounded-full text-[12.5px] border transition ${active
                ? "bg-[var(--accent-soft)] text-[var(--accent-2)] border-[var(--accent)]"
                : "border-[var(--border-2)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent)]/40"
                }`}
        >
            {children}
        </button>
    );
}

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

function Dropdown({ value, onChange, options, icon: Icon, testid }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative" data-testid={testid}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-2.5 bg-[var(--panel-2)] border border-[var(--border)] rounded-lg px-4 py-3 text-[13px] hover:border-[var(--border-2)] transition"
            >
                {Icon && <Icon size={14} className="text-[var(--text-muted)]" />}
                <span className="flex-1 text-left">{value}</span>
                <ChevronDown size={14} className={`text-[var(--text-muted)] transition ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="absolute left-0 right-0 top-full mt-1 card-panel py-1.5 z-30 max-h-[220px] overflow-auto">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => { onChange(opt); setOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-[12.5px] hover:bg-[var(--accent-soft)] ${opt === value ? "text-[var(--accent-2)]" : "text-[var(--text-muted)]"}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function DetailRow({ Icon, label, value, testid }) {
    return (
        <div className="flex items-start justify-between gap-4 py-3.5 border-b border-[var(--border)] last:border-b-0" data-testid={testid}>
            <div className="flex items-center gap-3 shrink-0">
                <Icon size={16} className="text-[var(--text-muted)]" strokeWidth={1.7} />
                <span className="text-[13px] text-[var(--text-muted)]">{label}</span>
            </div>
            <span className="text-[13px] text-right text-[var(--text)] whitespace-pre-line">{value}</span>
        </div>
    );
}

export default function CreateCollectionAlbum() {
    const navigate = useNavigate();
    const [step, setStep] = useState("form"); // "form" | "review"

    const [album, setAlbum] = useState(null);

    const [pressing, setPressing] = useState("First Press");
    const [countryPress, setCountryPress] = useState("United Kingdom");
    const [year, setYear] = useState("1966");
    const [condition, setCondition] = useState("VG+");
    const [notes, setNotes] = useState("Stereo preferred.\nNo writing on sleeve.\nNo seam splits.");

    const handleAddAlbumClick = () => {
        navigate("/listAddAlbum", {
            state: {
                returnTo: `/createCollectionAlbum`,
                storageKey: `new-collection-album-draft`,
            },
        });
    };

    const initializeAlbum = () => {
        const cached = sessionStorage.getItem(`new-collection-album-draft`);

        if (!cached) return;

        const draft = JSON.parse(cached);

        const album = draft.items?.[0]?.album;

        if (album) {
            setAlbum(album);
        }
    };

    useEffect(() => {
        initializeAlbum();
    }, []);

    const handleCreate = async () => {

        console.log("album",album);
        if (!album) return;

        try {
            await addToMyCollection({
                album_id: album.id,

                pressing: pressing || null,
                pressing_country: countryPress || null,
                pressing_year: year ? Number(year) : null,

                media_condition: condition || null,
                sleeve_condition: null,
                notes: notes || null,

                source: "manual",
            });

            navigate("/collection");
        } catch (err) {
            console.error("Failed to add album to collection:", err);
        }
    };

    if (step === "review") {
        return (
            <div className="max-w-[560px] mx-auto fade-in-up space-y-6" data-testid="review-hunt-page">
                {/* Illustration */}
                <div className="flex flex-col items-center text-center pt-4">
                    <div className="w-[130px] h-[130px] rounded-full flex items-center justify-center relative" style={{ background: "radial-gradient(circle at 30% 30%, rgba(139,92,246,0.35), rgba(139,92,246,0.05) 70%)" }}>
                        <div className="w-[86px] h-[86px] rounded-full bg-[var(--panel)] border-4 border-[var(--accent)] flex items-center justify-center relative">
                            <div className="w-3 h-3 rounded-full bg-[var(--accent)]" />
                            <SearchIcon size={30} className="absolute -bottom-3 -right-3 text-[var(--accent-2)]" strokeWidth={2} />
                        </div>
                        {/* Sparkles */}
                        <span className="absolute top-3 right-5 text-[var(--accent-2)] text-[14px]">✦</span>
                        <span className="absolute bottom-6 left-3 text-[var(--accent-2)] text-[10px]">✦</span>
                    </div>
                    <h1 className="font-serif text-[30px] leading-none mt-6 mb-2">Almost there!</h1>
                    <p className="text-[13px] text-[var(--text-muted)] max-w-xs">Review your album details before creating it.</p>
                </div>

                {album ? (
                    <div
                        className="card-panel p-4 flex items-center gap-4"
                        data-testid="review-album"
                    >
                        <div
                            className="w-[70px] h-[70px] rounded-md shrink-0 cover"
                            style={{
                                backgroundImage: album.cover_url
                                    ? `url(${album.cover_url})`
                                    : undefined,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                        />

                        <div className="min-w-0 flex-1">
                            <div className="font-serif text-[19px] leading-tight">
                                {album.title}
                            </div>

                            <div className="text-[12.5px] text-[var(--text-muted)]">
                                {album.artist?.name}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="card-panel p-4 text-center text-[var(--text-muted)]">
                        No album selected.
                    </div>
                )}

                {/* Details */}
                <div className="card-panel px-5 py-1" data-testid="review-details">
                    <DetailRow Icon={Package} label="Pressing type" value={pressing} testid="row-pressing" />
                    <DetailRow Icon={Globe} label="Country of pressing" value={countryPress} testid="row-country" />
                    <DetailRow Icon={Calendar} label="Year" value={year || "—"} testid="row-year" />
                    <DetailRow Icon={XCircle} label="Minimum condition" value={`${condition} or better`} testid="row-condition" />
                    <DetailRow Icon={FileText} label="Notes" value={notes || "—"} testid="row-notes" />
                </div>

                {/* Notification banner */}
                <div className="card-panel p-4 flex items-center gap-3" data-testid="review-notification">
                    <Bell size={16} className="text-[var(--accent-2)] shrink-0" />
                    <p className="text-[12.5px] text-[var(--text-muted)]">
                        You&apos;ll be notified when matches are found that fit your hunt.
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                    <button
                        onClick={() => navigate("/hunt")}
                        data-testid="confirm-create-btn"
                        className="w-full py-3.5 rounded-xl font-semibold text-[13.5px] text-white transition hover:-translate-y-0.5"
                        style={{ background: "linear-gradient(90deg, #8b5cf6, #6d28d9)", boxShadow: "0 10px 30px var(--accent-glow)" }}
                    >
                        Create Hunt
                    </button>
                    <button
                        onClick={() => setStep("form")}
                        data-testid="review-goback-btn"
                        className="w-full py-3 rounded-xl text-[13px] text-[var(--text-muted)] hover:text-[var(--accent-2)] transition"
                    >
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-6 min-w-0 fade-in-up" data-testid="list-remix-page">
            <div className="flex-1 min-w-0 space-y-6">
                <Link to={`/hunt`} className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] inline-flex items-center gap-1.5" data-testid="back-link">
                    <ArrowLeft size={13} /> Back to my collection
                </Link>

                {/* Header */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
                            <Disc3 size={20} className="text-white" />
                        </div>
                        <h1 className="font-serif text-[34px] sm:text-[38px] leading-none">Add albums to your collection</h1>
                    </div>
                    <p className="text-[13px] text-[var(--text-muted)] ml-14">You&apos;re creating your own collection.</p>
                </div>

                {/* Selected album */}
                {album ? (
                    <div
                        className="card-panel p-4 flex items-center gap-4"
                        data-testid="selected-album"
                    >
                        {album.cover_url ? (
                            <img
                                src={album.cover_url}
                                alt={album.title}
                                className="w-[82px] h-[82px] rounded-md shrink-0 object-cover"
                            />
                        ) : (
                            <div className="w-[82px] h-[82px] rounded-md shrink-0 cover" />
                        )}

                        <div className="min-w-0 flex-1">
                            <div className="font-serif text-[19px] leading-tight">
                                {album.title}
                            </div>

                            <div className="text-[12.5px] text-[var(--text-muted)] mb-3">
                                {album.artist?.name}
                            </div>

                            <button
                                onClick={handleAddAlbumClick}
                                data-testid="change-album-btn"
                                className="border border-[var(--accent)]/40 text-[var(--accent-2)] text-[11.5px] px-3.5 py-1.5 rounded-full hover:bg-[var(--accent-soft)] transition"
                            >
                                Change Album
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className="card-panel p-6 text-center"
                        data-testid="selected-album-empty"
                    >
                        <p className="text-[var(--text-muted)] mb-4">
                            No album selected.
                        </p>
                        <button
                            className="btn-accent px-5 py-2.5 rounded-full"
                            onClick={handleAddAlbumClick}
                        >
                            Select Album
                        </button>
                    </div>
                )}

                {/* What are you looking for? */}
                <div data-testid="pressing-section">
                    <Label>What is the pressing?</Label>
                    <div className="flex flex-wrap gap-2">
                        {PRESSING.map((p) => (
                            <Chip key={p} active={pressing === p} onClick={() => setPressing(p)} testid={`pressing-${p.toLowerCase().replace(/\s/g, "-")}`}>
                                {p}
                            </Chip>
                        ))}
                    </div>
                </div>

                {/* Country of pressing */}
                <div data-testid="country-press-section">
                    <Label>Country of pressing</Label>
                    <Dropdown value={countryPress} onChange={setCountryPress} options={COUNTRIES} icon={Globe} testid="country-press-dropdown" />
                </div>

                {/* Year */}
                <div data-testid="year-section">
                    <Label>Year (optional)</Label>
                    <div className="relative">
                        <input
                            type="text"
                            value={year}
                            onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="e.g. 1966"
                            data-testid="year-input"
                            className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg px-4 py-3 pr-11 text-[13px] focus:outline-none focus:border-[var(--accent)]/50 transition"
                        />
                        <Calendar size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    </div>
                </div>

                {/* Minimum condition */}
                <div data-testid="condition-section">
                    <Label hint="What's this?">What's the condition?</Label>
                    <div className="flex flex-wrap gap-2">
                        {CONDITIONS.map((c) => (
                            <Chip key={c.code} active={condition === c.code} onClick={() => setCondition(c.code)} testid={`condition-${c.code.toLowerCase()}`}>
                                {c.code}
                            </Chip>
                        ))}
                    </div>
                </div>

                {/* Additional notes */}
                <div data-testid="notes-section">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-[10.5px] tracking-[0.15em] uppercase text-[var(--text-muted)]">
                            Additional notes <span className="text-[var(--text-dim)] normal-case tracking-normal text-[11px]">(optional)</span>
                        </label>
                        <span className="text-[11px] text-[var(--text-dim)]">{notes.length}/300</span>
                    </div>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value.slice(0, 300))}
                        rows={4}
                        placeholder="Any specific details, condition preferences, etc."
                        data-testid="notes-input"
                        className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg px-4 py-3 text-[13px] focus:outline-none focus:border-[var(--accent)]/50 transition resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="pt-2">
                    <button
                        onClick={() => handleCreate()}
                        data-testid="continue-btn"
                        className="w-full rounded-xl py-3 font-semibold text-[13px] text-white transition hover:-translate-y-0.5"
                        style={{
                            background: "linear-gradient(90deg, #8b5cf6, #6d28d9)",
                            boxShadow: "0 6px 20px var(--accent-glow)",
                        }}
                    >
                        Create Album for my collection
                    </button>
                </div>
            </div>
        </div>
    );
}
