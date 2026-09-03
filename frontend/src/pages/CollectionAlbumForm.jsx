
const PRESSING = ["Any pressing", "Original", "First Press", "Reissue", "Promo", "Other"];
const CONDITIONS = [
    { code: "G", label: "Good" },
    { code: "VG", label: "Very Good" },
    { code: "VG+", label: "Very Good Plus" },
    { code: "NM", label: "Near Mint" },
    { code: "M", label: "Mint" },
];
const CURRENCIES = ["USD", "EUR", "GBP", "MXN", "JPY"];

const COUNTRIES = ["United Kingdom", "United States", "Japan", "Germany", "France", "Italy", "Mexico", "Spain", "Any"];
import { Link, useNavigate, useParams } from "react-router-dom";
import { addToMyCollection, getCollectionById, updateCollection } from "../services/collectionService";
import React, { useState, useEffect } from "react";

import {
    ArrowLeft, ChevronDown, Globe, Calendar, Info, Disc3, DollarSign
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

export default function CollectionAlbumForm() {

    const { id } = useParams();

    const isEditing = Boolean(id);
    const navigate = useNavigate();

    const [album, setAlbum] = useState(null);

    const [pressing, setPressing] = useState("First Press");
    const [countryPress, setCountryPress] = useState("United Kingdom");
    const [year, setYear] = useState("");
    const [barcode, setBarcode] = useState("");
    const [edition, setEdition] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [pricePaid, setPricePaid] = useState("");
    const [catalogNumber, setCatalogNumber] = useState("");
    const [mediaCondition, setMediaCondition] = useState("VG+");
    const [sleeveCondition, setSleeveCondition] = useState("VG+");
    const [label, setLabel] = useState("");
    const [notes, setNotes] = useState("Stereo preferred.\nNo writing on sleeve.\nNo seam splits.");
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleAddAlbumClick = () => {
        navigate("/listAddAlbum", {
            state: {
                returnTo: `/CollectionAlbumForm/new`,
                storageKey: `new-collection-album-draft`,
            },
        });
    };

    useEffect(() => {
        const initializeAlbum = async () => {
            try {
                setLoading(true);
                setError(null);

                if (isEditing) {
                    // EDIT MODE
                    const item = await getCollectionById(id);

                    setAlbum(item.album);

                    setPressing(item.pressing || "");
                    setCountryPress(item.pressing_country || "");
                    setYear(
                        item.pressing_year != null
                            ? String(item.pressing_year)
                            : ""
                    );

                    setMediaCondition(item.media_condition || "");
                    setSleeveCondition(item.sleeve_condition || "");

                    setCurrency(item.currency || "USD");

                    setPricePaid(
                        item.price_paid != null
                            ? String(item.price_paid)
                            : ""
                    );

                    setLabel(item.label || "");
                    setCatalogNumber(item.catalog_number || "");
                    setBarcode(item.barcode || "");
                    setEdition(item.edition || "");

                    setNotes(item.notes || "");
                } else {
                    // CREATE MODE
                    const cached = sessionStorage.getItem("new-collection-album-draft");

                    if (!cached) return;

                    const draft = JSON.parse(cached);
                    const selectedAlbum = draft.items?.[0]?.album;

                    if (selectedAlbum) {
                        setAlbum(selectedAlbum);
                    }
                }
            } catch (err) {
                console.error(err);

                setError(
                    err.message ||
                    `Failed to ${isEditing ? "load collection item" : "initialize collection item"}`
                );
            } finally {
                setLoading(false);
            }
        };

        initializeAlbum();
    }, [id, isEditing]);

    const handleSubmit = async () => {

        if (!album) return;

        setSubmitting(true);

        const payload = {
            album_id: album.id,

            // Release / pressing
            pressing: pressing || null,
            pressing_country: countryPress || null,
            pressing_year: year ? Number(year) : null,

            label: label || null,
            catalog_number: catalogNumber || null,
            barcode: barcode || null,
            edition: edition || null,

            // Condition
            media_condition: mediaCondition || null,
            sleeve_condition: sleeveCondition || null,

            // Purchase information
            price_paid: pricePaid
                ? Number(pricePaid)
                : null,
            currency: currency || "USD",

            // Personal information
            purchase_date: null,
            purchased_from: null,
            notes: notes || null,

            // Source
            source: "manual",
            source_release_id: null,
        };

        try {
            if (isEditing) {
                await updateCollection(id, payload);
            } else {
                await addToMyCollection({
                    album_id: album.id,
                    ...payload,
                });
            }

            // Only clear the draft after successful creation
            if (!isEditing) {
                sessionStorage.removeItem("new-collection-album-draft");
            }

            navigate("/collection");
        } catch (err) {
            console.error("Failed to add album to collection:", err);
        }
        setSubmitting(false);


    };

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

                {/* What pressing is this? */}
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
                            onChange={(e) =>
                                setYear(
                                    e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 4)
                                )
                            }
                            placeholder="e.g. 1966"
                            maxLength={4}
                            inputMode="numeric"
                            data-testid="year-input"
                            className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg px-4 py-3 pr-11 text-[13px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
                        />

                        <Calendar
                            size={15}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                        />
                    </div>
                </div>

                {/* Minimum Media condition */}
                <div data-testid="media-condition-section">
                    <Label hint="The physical condition of the record itself, not the sleeve.">
                        Media Condition
                    </Label>
                    <div className="flex flex-wrap gap-2">
                        {CONDITIONS.map((c) => (
                            <Chip key={c.code} active={mediaCondition === c.code} onClick={() => setMediaCondition(c.code)} testid={`condition-${c.code.toLowerCase()}`}>
                                {c.code}
                            </Chip>
                        ))}
                    </div>
                </div>

                {/* Minimum Sleeve condition */}
                <div data-testid="sleeve-condition-section">
                    <Label hint="Sleeve condition">Sleeve Condition</Label>
                    <div className="flex flex-wrap gap-2">
                        {CONDITIONS.map((c) => (
                            <Chip key={c.code} active={sleeveCondition === c.code} onClick={() => setSleeveCondition(c.code)} testid={`condition-${c.code.toLowerCase()}`}>
                                {c.code}
                            </Chip>
                        ))}
                    </div>
                </div>

                {/* Label */}
                <div data-testid="label-field">
                    <Label>Label (Optional)</Label>

                    <input
                        type="text"
                        value={label}
                        onChange={(e) =>
                            setLabel(e.target.value.slice(0, 100))
                        }
                        placeholder="e.g. Warner Bros."
                        maxLength={100}
                        data-testid="label-input"
                        className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg px-4 py-3 text-[14px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
                    />
                </div>

                {/* Catalog number */}
                <div data-testid="label-field">
                    <Label>Catalog number (optional)</Label>

                    <input
                        type="text"
                        value={catalogNumber}
                        onChange={(e) =>
                            setCatalogNumber(e.target.value.slice(0, 100))
                        }
                        placeholder="Give your album a catalog number"
                        maxLength={100}
                        data-testid="label-input"
                        className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg px-4 py-3 text-[14px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
                    />
                </div>

                {/*Barcode*/}
                <div data-testid="label-field">
                    <Label>Barcode (optional)</Label>
                    <input
                        type="text"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value.slice(0, 50))}
                        placeholder="e.g. 602547123456"
                        maxLength={50}
                        className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg px-4 py-3 text-[14px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"

                    />
                </div>

                {/* Edition */}
                <div data-testid="edition-field">
                    <Label>Edition (optional)</Label>

                    <input
                        type="text"
                        value={edition}
                        onChange={(e) =>
                            setEdition(e.target.value.slice(0, 100))
                        }
                        placeholder="e.g. First pressing, Limited edition"
                        maxLength={100}
                        data-testid="edition-input"
                        className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg px-4 py-3 text-[14px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
                    />
                </div>

                {/* Price Paid */}
                <div data-testid="price-paid-section">
                    <Label>Price paid (optional and only for you)</Label>

                    <div className="flex gap-2">
                        {/* Price Paid*/}
                        <div className="relative flex-1">
                            <DollarSign
                                size={15}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                            />

                            <input
                                type="text"
                                value={pricePaid}
                                onChange={(e) => {
                                    const value = e.target.value
                                        .replace(/[^0-9.]/g, "")
                                        .replace(/(\..*)\./g, "$1")
                                        .slice(0, 10);

                                    setPricePaid(value);
                                }}
                                placeholder="0.00"
                                inputMode="decimal"
                                maxLength={10}
                                data-testid="price-input"
                                className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg pl-11 pr-4 py-3 text-[13px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
                            />
                        </div>

                        {/* Currency */}
                        <div className="w-[110px]">
                            <Dropdown
                                value={currency}
                                onChange={setCurrency}
                                options={CURRENCIES}
                                testid="currency-dropdown"
                            />
                        </div>
                    </div>

                    <p className="text-[11px] text-[var(--text-dim)] mt-2">
                        The most you're willing to pay, including shipping.
                    </p>
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
                        onClick={handleSubmit}
                        disabled={submitting}
                        data-testid="continue-btn"
                        className="w-full rounded-xl py-3 font-semibold text-[13px] text-white transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: "linear-gradient(90deg, #8b5cf6, #6d28d9)",
                            boxShadow: "0 6px 20px var(--accent-glow)",
                        }}
                    >
                        {submitting
                            ? (isEditing ? "Saving..." : "Adding...")
                            : (isEditing ? "Save Changes" : "Add Album to your Collection")}
                    </button>
                </div>
            </div>
        </div>
    );
}
