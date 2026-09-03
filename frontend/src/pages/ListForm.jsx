import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shuffle, Plus, GripVertical, Trash2, Check, Sparkles,
  Lightbulb, Compass, ChevronUp, ChevronDown
} from "lucide-react";
import { createList } from "../services/listService";
import { Chip } from "../components/ui-bits";

function Toggle({ on, onClick, testid }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testid}
      className={`w-11 h-6 rounded-full relative transition ${on ? "bg-[var(--accent)]" : "bg-[var(--border-2)]"}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${on ? "left-[22px]" : "left-0.5"}`}
      />
    </button>
  );
}

function Checkbox({ checked, onChange, label, testid }) {
  return (
    <button type="button" onClick={onChange} data-testid={testid} className="flex items-center gap-2 text-[12.5px] text-[var(--text)]">
      <span className={`w-4 h-4 rounded flex items-center justify-center transition ${checked ? "bg-[var(--accent)] border border-[var(--accent)]" : "border border-[var(--border-2)]"}`}>
        {checked && <Check size={11} className="text-white" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}

function TipCard({ Icon, title, text, color }) {
  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
        <Icon size={16} style={{ color }} strokeWidth={1.7} />
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-medium mb-0.5">draft?.title</div>
        <p className="text-[11.5px] text-[var(--text-muted)] leading-snug">{text}</p>
      </div>
    </div>
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

export default function ListForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditing = Boolean(id);
  const [submitting, setSubmitting] = useState(false);

  const [showInCollection, setShowInCollection] = useState(true);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [titleError, setTitleError] = useState(null);
  const [itemsError, setItemsError] = useState(null);

  const [draft, setDraft] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
    is_public: true,
    items: [],
  });

  const handleAddAlbumClick = () => {
    setItemsError(null);
    navigate("/listAddAlbum", {
      state: {
        returnTo: `/listForm/new`,
        storageKey: `new-list-draft`,
      },
    });
  };

  const categories = [
    "Rock",
    "Pop",
    "Hip-Hop",
    "Jazz",
    "Indie",
    "Electronic",
    "Metal",
    "Classical",
    "Folk",
  ];

  const updateReason = (albumId, reason) => {
    saveDraft({
      ...draft,
      items: draft.items.map(item =>
        item.album.id === albumId
          ? {
            ...item,
            why_this_album: reason.slice(0, 150)
          }
          : item
      )
    });
  };

  const saveDraft = useCallback((nextDraft) => {
    setDraft(nextDraft);

    sessionStorage.setItem(
      `"new-list-draft"`,
      JSON.stringify(nextDraft)
    );
  }, [id]);

  const initializeDraft = async () => {

    const cached = sessionStorage.getItem(`new-list-draft`);

    if (cached) {
      const parsed = JSON.parse(cached);

      setDraft(parsed);
      return;
    }

  };

  const toggleOwned = (albumId) => {
    saveDraft({
      ...draft,
      items: draft.items.map(item =>
        item.album.id === albumId
          ? {
            ...item,
            owned: !item.owned,
            hunting: item.owned ? item.hunting : false
          }
          : item
      )
    });
  };

  const toggleHunting = (albumId) => {
    saveDraft({
      ...draft,
      items: draft.items.map(item =>
        item.album.id === albumId
          ? {
            ...item,
            hunting: !item.hunting,
            owned: item.hunting ? item.owned : false
          }
          : item
      )
    })
  };

  const removeItem = (albumId) => {
    const next = draft.items
      .filter(item => item.album.id !== albumId)
      .map((item, index) => ({
        ...item,
        position: index
      }));

    saveDraft({
      ...draft,
      items: next
    });
  };

  // Drag-and-drop handlers
  const handleDragStart = (idx) => (e) => {
    setDragIndex(idx);
    e.dataTransfer.effectAllowed = "move";
    // Firefox requires setData
    try { e.dataTransfer.setData("text/plain", String(idx)); } catch (_) { /* noop */ }
  };

  const handleDragOver = (idx) => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overIndex !== idx) setOverIndex(idx);
  };

  const handleDragLeave = () => setOverIndex(null);
  const handleDrop = (idx) => (e) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) {
      setDragIndex(null); setOverIndex(null); return;
    }
    const next = [...draft.items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(idx, 0, moved);
    saveDraft({
      ...draft,
      items: next.map((it, index) => ({
        ...it,
        position: index
      }))
    });
    setDragIndex(null); setOverIndex(null);
  };
  const handleDragEnd = () => { setDragIndex(null); setOverIndex(null); };

  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = [...draft.items];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    saveDraft({
      ...draft,
      items: next.map((it, index) => ({
        ...it,
        position: index
      }))
    });
  };
  const moveDown = (idx) => {

    if (idx === draft.items.length - 1) return;
    const next = [...draft.items];

    [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
    saveDraft({
      ...draft,
      items: next.map((it, index) => ({
        ...it,
        position: index
      }))
    });
  };

  const handleCreate = async () => {

    if (!draft.title?.trim()) {
      setTitleError("Please enter a list title.");
      return;
    }

    // Albums validation
    if (!draft.items || draft.items.length === 0) {
      setItemsError("Please add at least one album to your list.");
      return;
    }

    try {
      const payload = {
        title: draft.title,
        description: draft.description,
        category: draft.category,
        items: draft.items.map((item, index) => ({
          album_id: item.album.id,
          position: index,
          why_this_album: item.why_this_album,
          favorite_lyric: item.favorite_lyric,
          owned: item.owned,
          hunting: item.hunting,
        })),
      };

      const list = await createList(payload);

      sessionStorage.removeItem("new-list-draft");

      navigate(`/lists/${list.id}`);
    } catch (err) {
      console.error("Failed to create list:", err);
    }
  };

  const updateDescription = (value) => {

    console.log("description", value);
    saveDraft({

      ...draft,

      description: value.slice(0, 250)

    });

  };

  const handleTitleChange = (value) => {
    if (titleError) {
      setTitleError("");
    }

    updateTitle(value);
  };

  const updateTitle = (value) => {
    console.log("title", value);
    saveDraft({

      ...draft,

      title: value.slice(0, 250)

    });

  };

  const handlePrivacyToggle = () => {
    const updated = {
      ...draft,
      is_private: !draft.is_private,
    };

    setDraft(updated);
    sessionStorage.setItem(`new-list-draft`, JSON.stringify(updated));
  };

  /* ---------------------------
       Fetch list
    ----------------------------*/
  useEffect(() => {

    async function initialize() {

      try {
        await Promise.all([
          initializeDraft()
        ]);
      }
      catch (err) {
        console.error(err);
      }
      finally {

      }
    }
    initialize();

  }, [id]);

  const handleCategoryChange = (category) => {
    const updated = {
      ...draft,
      category,
    };

    setDraft(updated);

    sessionStorage.setItem(
      `new-list-draft`,
      JSON.stringify(updated)
    );
  };

  return (
    <div className="flex gap-6 min-w-0 fade-in-up" data-testid="create-list-page">
      <div className="flex-1 min-w-0 space-y-6">
        <Link to={`/lists/${id || "saddest-albums-ever"}`} className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] inline-flex items-center gap-1.5" data-testid="back-link">
          <ArrowLeft size={13} /> Back to list
        </Link>

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
              <Shuffle size={20} className="text-white" />
            </div>
            <h1 className="font-serif text-[34px] sm:text-[38px] leading-none">Create your list</h1>
          </div>
          <p className="text-[13px] text-[var(--text-muted)] ml-14">You&apos;re creating your own list.</p>
        </div>


        {/* List title */}
        <div data-testid="title-field">
          <Label>List title</Label>

          <input
            type="text"
            value={draft.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Give your list a title"
            maxLength={100}
            data-testid="title-input"
            className={`w-full bg-[var(--panel-2)] border rounded-lg px-4 py-3 text-[14px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 transition ${titleError
              ? "border-red-500/60 focus:ring-red-500/20"
              : "border-[var(--border)] focus:ring-[var(--accent)]"
              }`}
          />

          {titleError && (
            <p className="mt-1.5 text-[11px] text-red-400">
              {titleError}
            </p>
          )}
        </div>

        {/* Description */}
        <div data-testid="description-field">
          <Label>
            Your description <span className="text-[var(--text-muted)]">(optional)</span>
          </Label>

          <div className="relative">
            <textarea
              value={draft?.description ?? ""}
              onChange={(e) => updateDescription(e.target.value)}
              placeholder="Describe what makes this list special"
              rows={3}
              maxLength={250}
              data-testid="description-input"
              className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg px-4 py-3 text-[14px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition resize-none"
            />

            <span className="absolute bottom-2.5 right-3 text-[11px] text-[var(--text-dim)]">
              {draft?.description?.length ?? 0}/250
            </span>
          </div>
        </div>

        {/* Your Ranking */}
        <div data-testid="ranking-section">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
            <div>
              <Label>
                Your ranking
              </Label>

              <p className="text-[12px] text-[var(--text-muted)] mt-1">
                Add, remove or reorder albums to make it your own.
              </p>

              {itemsError && (
                <p className="text-[11px] text-red-400 mt-2">
                  {itemsError}
                </p>
              )}
            </div>

            <button
              onClick={handleAddAlbumClick}
              className="btn-accent inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
              data-testid="add-album-btn"
            >
              <Plus size={14} />
              Add album
            </button>
          </div>
          {/* Items */}
          <div className="space-y-4 mt-5">
            {draft?.items?.map((it, idx) => (
              <div
                key={it.id}
                draggable
                onDragStart={handleDragStart(idx)}
                onDragOver={handleDragOver(idx)}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop(idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-start gap-3 pt-4 border-t border-[var(--border)] first:border-t-0 first:pt-0 transition-all ${dragIndex === idx ? "opacity-40" : ""
                  } ${overIndex === idx && dragIndex !== idx ? "bg-[var(--accent-soft)] rounded-lg -mx-2 px-2 pb-2 border-t-[var(--accent)]" : ""}`}
                data-testid={`item-${it.position + 1}`}
              >
                <div className="flex flex-col items-center gap-1 mt-3 shrink-0">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    data-testid={`up-${it.position + 1}`}
                    className="text-[var(--text-dim)] hover:text-[var(--accent-2)] disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <div className="text-[var(--text-dim)] cursor-grab active:cursor-grabbing" title="Drag to reorder">
                    <GripVertical size={16} />
                  </div>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={!draft || idx === draft.items.length - 1}
                    data-testid={`down-${it.position + 1}`}
                    className="text-[var(--text-dim)] hover:text-[var(--accent-2)] disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                <div className="font-serif text-[22px] text-[var(--text-muted)] w-6 text-center shrink-0 mt-2">{it.position}</div>
                <img
                  src={it.album?.cover_url || "/placeholder-album.jpg"}
                  alt={it.album?.title || "Album cover"}
                  className="w-[70px] h-[70px] rounded shrink-0 object-cover"
                />

                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium">{it.album.title}</div>
                  <div className="text-[12px] text-[var(--text-muted)] mb-2">{it.album.artist.name}</div>
                  <div className="relative">
                    <textarea
                      value={it.why_this_album}
                      onChange={(e) => updateReason(it.album.id, e.target.value)}
                      rows={2}
                      placeholder="Why this album?"
                      data-testid={`reason-${it.position + 1}`}
                      className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg px-3 py-2 pr-14 text-[12.5px] focus:outline-none focus:border-[var(--accent)]/50 transition resize-none"
                    />
                    <span className="absolute right-3 bottom-2 text-[10.5px] text-[var(--text-dim)]">{it.why_this_album.length}/150</span>
                  </div>
                  <div className="flex items-center gap-5 mt-2.5">
                    <Checkbox checked={it.owned} onChange={() => toggleOwned(it.album.id)} label="Owned" testid={`owned-${it.position + 1}`} />
                    <Checkbox checked={it.hunting} onChange={() => toggleHunting(it.album.id)} label="Hunting" testid={`hunting-${it.position + 1}`} />
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 mt-2">
                  <button className="border border-[var(--border-2)] text-[12px] px-3 py-1.5 rounded-lg hover:border-[var(--accent)]/40 hover:text-[var(--accent-2)] transition" data-testid={`replace-${it.position + 1}`}>
                    Replace
                  </button>
                  <button
                    onClick={() => removeItem(it.album.id)}
                    className="w-8 h-8 rounded-lg border border-[var(--border-2)] flex items-center justify-center hover:border-[#ef4444]/40 hover:text-[#ef4444] transition"
                    data-testid={`delete-${it.album.id}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-5 w-full py-3 rounded-lg border border-dashed border-[var(--border-2)] text-[13px] text-[var(--text-muted)] hover:text-[var(--accent-2)] hover:border-[var(--accent)]/40 transition flex items-center justify-center gap-2" data-testid="add-another-btn">
            <Plus size={14} /> Add another album
          </button>
        </div>

        {/* Category */}
        <div data-testid="category-field">
          <Label>Category</Label>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Chip
                key={category}
                active={draft.category === category}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </Chip>
            ))}
          </div>
        </div>

        {/* Additional options */}
        <div className="card-panel p-5" data-testid="additional-options">
          <h3 className="font-serif text-[17px] mb-4">Additional options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start justify-between gap-3 p-4 rounded-lg border border-[var(--border)]">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium mb-0.5">Show in my collection</div>
                <p className="text-[11.5px] text-[var(--text-muted)] leading-snug">Display ownership status for these albums in my profile and collection.</p>
              </div>
              <Toggle
                on={showInCollection} onClick={() => setShowInCollection(!showInCollection)} testid="toggle-collection" />
            </div>
            <div className="flex items-start justify-between gap-3 p-4 rounded-lg border border-[var(--border)]">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium mb-0.5">Make this list private</div>
                <p className="text-[11.5px] text-[var(--text-muted)] leading-snug">Only you will be able to see this list.</p>
              </div>
              <Toggle
                on={draft.is_private}
                onClick={handlePrivacyToggle}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2">
          <button
            onClick={handleCreate}
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
              : (isEditing ? "Save Changes" : "Publish List")}
          </button>
        </div>
      </div>

      {/* Right sidebar */}

      {draft && (
        <aside className="hidden xl:block w-[290px] shrink-0 space-y-5">
          {/* Original list */}

          <h3 className="font-serif text-[16px] mb-4">
            Tips for a great list
          </h3>

          <div className="space-y-4">
            <TipCard
              Icon={Sparkles}
              color="#8b5cf6"
              title="Make it personal"
              text="Share why these albums matter to you. Your perspective is what makes the list interesting."
            />

            <TipCard
              Icon={Lightbulb}
              color="#f59e0b"
              title="Rank with intention"
              text="Every position tells a story. Think about what makes #1 different from #2."
            />

            <TipCard
              Icon={Compass}
              color="#10b981"
              title="Start conversations"
              text="Great lists inspire debate. Don't be afraid to include a surprising choice."
            />
          </div>

          {/* How remixes work */}
          <div className="card-panel p-5" data-testid="how-remixes-work">
            <h3 className="font-serif text-[16px] mb-4">How remixes work</h3>
            <svg viewBox="0 0 220 90" className="w-full h-[100px]">
              <circle cx="110" cy="15" r="8" fill="var(--accent)" />
              <line x1="110" y1="23" x2="40" y2="70" stroke="var(--border-2)" strokeWidth="1" />
              <line x1="110" y1="23" x2="110" y2="70" stroke="var(--border-2)" strokeWidth="1" />
              <line x1="110" y1="23" x2="180" y2="70" stroke="var(--border-2)" strokeWidth="1" />
              <circle cx="40" cy="75" r="6" fill="var(--accent-2)" opacity="0.7" />
              <circle cx="110" cy="75" r="6" fill="var(--accent-2)" opacity="0.7" />
              <circle cx="180" cy="75" r="6" fill="var(--accent-2)" opacity="0.7" />
            </svg>
            <p className="text-[11.5px] text-[var(--text-muted)] leading-relaxed mt-2">
              Your remix will be linked to the original list. People can discover all versions and see how everyone&apos;s taste is different.
            </p>
          </div>

        </aside>)}
    </div>
  );
}
