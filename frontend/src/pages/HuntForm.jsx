
const PRESSING = ["Any pressing", "Original", "First Press", "Reissue", "Promo", "Other"];
const CONDITIONS = [
  { code: "G", label: "Good" },
  { code: "VG", label: "Very Good" },
  { code: "VG+", label: "Very Good Plus" },
  { code: "NM", label: "Near Mint" },
  { code: "M", label: "Mint" },
];
const SELLER_LOC = ["Worldwide", "My country only", "Specific country"];
const CURRENCIES = ["USD", "EUR", "GBP", "MXN", "JPY"];
const COUNTRIES = ["United Kingdom", "United States", "Japan", "Germany", "France", "Italy", "Mexico", "Spain","Any"];
import { Link, useNavigate, useParams } from "react-router-dom";
import { createHunt, updateHunt, getHuntById } from "../services/huntService";
import React, { useState, useEffect } from "react";

import {
  ArrowLeft, ChevronDown, Globe, Calendar, DollarSign, MapPin, Info, Shuffle
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

export default function HuntForm() {

  const { id } = useParams();

  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [album, setAlbum] = useState(null);
  const [submitting, setSubmitting] = useState(false);


  const [pressing, setPressing] = useState("First Press");
  const [countryPress, setCountryPress] = useState("United Kingdom");
  const [year, setYear] = useState("1966");
  const [condition, setCondition] = useState("VG+");
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("250");
  const [currency, setCurrency] = useState("USD");
  const [sellerLoc, setSellerLoc] = useState("Worldwide");
  const [shipTo, setShipTo] = useState("Mexico");
  const [notes, setNotes] = useState("Stereo preferred.\nNo writing on sleeve.\nNo seam splits.");


  const handleAddAlbumClick = () => {
    navigate("/listAddAlbum", {
      state: {
        returnTo: `/huntForm/new`,
        storageKey: `new-hunt-draft`,
      },
    });
  };

  useEffect(() => {
    const initializeForm = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isEditing) {
          // EDIT MODE
          const hunt = await getHuntById(id);

          setAlbum(hunt.album);

          setPressing(hunt.pressing || "");
          setCountryPress(hunt.country_pressing || "");
          setYear(hunt.year ? String(hunt.year) : "");
          setCondition(hunt.condition || "");
          setSellerLoc(hunt.seller_location || "");
          setShipTo(hunt.ship_to || "");

          setMinPrice(
            hunt.price?.min != null
              ? String(hunt.price.min)
              : ""
          );

          setMaxPrice(
            hunt.price?.max != null
              ? String(hunt.price.max)
              : ""
          );

          setCurrency(hunt.price?.currency || "USD");
          setNotes(hunt.details || "");

        } else {
          // CREATE MODE
          const cached = sessionStorage.getItem("new-hunt-draft");

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
          `Failed to ${isEditing ? "load hunt" : "initialize hunt"}`
        );
      } finally {
        setLoading(false);
      }
    };

    initializeForm();
  }, [id, isEditing]);

  const handleSubmit = async () => {

    if (!album) return;

    setSubmitting(true);

    const payload = {
      pressing,
      country_pressing: countryPress,
      year: year ? Number(year) : null,
      condition,
      seller_location: sellerLoc,
      ship_to: shipTo,
      price: {
        min: minPrice ? Number(minPrice) : null,
        max: maxPrice ? Number(maxPrice) : null,
        currency,
      },
      details: notes,
    };

    try {
      if (isEditing) {
        await updateHunt(id, payload);
      } else {
        await createHunt({
          album_id: album.id,
          ...payload,
        });
      }

      // Only clear the draft after successful creation
      if (!isEditing) {
        sessionStorage.removeItem("new-hunt-draft");
      }

      navigate("/hunt");
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
        `Failed to ${isEditing ? "update" : "create"} hunt`
      );
    }
    setSubmitting(false);

  };

  const sellerHelper = {
    "Worldwide": "You'll see offers from sellers anywhere in the world.",
    "My country only": "You'll only see offers from sellers in your country.",
    "Specific country": "Choose the country you want to buy from.",
  }[sellerLoc];

  return (
    <div className="flex gap-6 min-w-0 fade-in-up" data-testid="list-remix-page">
      <div className="flex-1 min-w-0 space-y-6">
        <Link to={`/hunt`} className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] inline-flex items-center gap-1.5" data-testid="back-link">
          <ArrowLeft size={13} /> Back to hunt
        </Link>

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
              <Shuffle size={20} className="text-white" />
            </div>
            <h1 className="font-serif text-[34px] sm:text-[38px] leading-none"> {(isEditing ? "Edit your Hunt" : "Create your Hunt")}</h1>
          </div>
          <p className="text-[13px] text-[var(--text-muted)] ml-14"> {(isEditing ? "You're editing your hunt." : "You're creating your own hunt.")}</p>
        </div>

        {/* Selected album */}
        {album ? (
          <div
            className="card-panel p-4 flex items-center gap-4"
            data-testid="selected-album"
          >
            <div
              className="w-[82px] h-[82px] rounded-md shrink-0 cover"
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
          <Label>What are you looking for?</Label>
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
          <Label hint="What's this?">Minimum condition</Label>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map((c) => (
              <Chip key={c.code} active={condition === c.code} onClick={() => setCondition(c.code)} testid={`condition-${c.code.toLowerCase()}`}>
                {c.code}
              </Chip>
            ))}
          </div>
        </div>

        {/* Maximum price */}
        <div data-testid="price-section">
          <Label>Maximum price</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <DollarSign size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="0"
                data-testid="price-input"
                className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg pl-11 pr-4 py-3 text-[13px] focus:outline-none focus:border-[var(--accent)]/50 transition"
              />
            </div>
            <div className="w-[110px]">
              <Dropdown value={currency} onChange={setCurrency} options={CURRENCIES} testid="currency-dropdown" />
            </div>
          </div>
          <p className="text-[11px] text-[var(--text-dim)] mt-2">The most you&apos;re willing to pay (including shipping).</p>
        </div>

        {/* Seller location */}
        <div data-testid="seller-loc-section">
          <Label>Where should sellers be?</Label>
          <div className="flex flex-wrap gap-2">
            {SELLER_LOC.map((s) => (
              <Chip key={s} active={sellerLoc === s} onClick={() => setSellerLoc(s)} testid={`seller-${s.toLowerCase().replace(/\s/g, "-")}`}>
                {s}
              </Chip>
            ))}
          </div>
          <div className="mt-3 card-panel px-4 py-3 flex items-center gap-3" data-testid="seller-helper">
            <Globe size={14} className="text-[var(--accent-2)] shrink-0" />
            <p className="text-[11.5px] text-[var(--text-muted)]">{sellerHelper}</p>
          </div>
        </div>

        {/* Ship to */}
        <div data-testid="ship-to-section">
          <Label>Country of residency (shipping to)</Label>
          <Dropdown value={shipTo} onChange={setShipTo} options={COUNTRIES} icon={MapPin} testid="ship-to-dropdown" />
          <p className="text-[11px] text-[var(--text-dim)] mt-2">Sellers will ship to this country.</p>
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
              ? (isEditing ? "Saving..." : "Creating...")
              : (isEditing ? "Save Changes" : "Create Hunt")}
          </button>
        </div>
      </div>
    </div>
  );
}
