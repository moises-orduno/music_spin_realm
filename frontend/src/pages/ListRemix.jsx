import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shuffle, Plus, GripVertical, Trash2, Check, Sparkles,
  Lightbulb, Compass, Users, ArrowRight, ChevronUp, ChevronDown,
} from "lucide-react";
import { listDetail } from "../data/listDetail";

const INITIAL_ITEMS = [
  { rank: 1, title: "Unknown Pleasures", artist: "Joy Division", cover: "linear-gradient(135deg, #3a3a3a, #050505)", reason: "This album feels like loneliness in the most beautiful way.", owned: true, hunting: false },
  { rank: 2, title: "The Queen Is Dead", artist: "The Smiths", cover: "linear-gradient(135deg, #6a6a3a, #2a2a15)", reason: "Romance and despair. Nothing hits me like this record.", owned: false, hunting: true },
  { rank: 3, title: "OK Computer", artist: "Radiohead", cover: "linear-gradient(135deg, #8a8575, #3a3630)", reason: "The sound of realizing the world is not what it seems.", owned: true, hunting: false },
  { rank: 4, title: "Pink Moon", artist: "Nick Drake", cover: "linear-gradient(135deg, #c2a876, #5a4b2a)", reason: "So sparse, so intimate, so devastating.", owned: false, hunting: true },
  { rank: 5, title: "Either/Or", artist: "Elliott Smith", cover: "linear-gradient(135deg, #4a4a5a, #1a1a25)", reason: "Pain this honest is rare.", owned: true, hunting: false },
];

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
        <div className="text-[13px] font-medium mb-0.5">{title}</div>
        <p className="text-[11.5px] text-[var(--text-muted)] leading-snug">{text}</p>
      </div>
    </div>
  );
}

export default function ListRemix() {
  const { id } = useParams();
  const navigate = useNavigate();
  const original = listDetail;

  const [title, setTitle] = useState("My Saddest Albums Ever");
  const [description, setDescription] = useState("These albums hit different. They've been with me in the hardest moments.");
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [showInCollection, setShowInCollection] = useState(true);
  const [privateList, setPrivateList] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const updateReason = (rank, val) => {
    setItems(items.map((it) => it.rank === rank ? { ...it, reason: val.slice(0, 150) } : it));
  };
  const toggleOwned = (rank) => setItems(items.map((it) => it.rank === rank ? { ...it, owned: !it.owned, hunting: it.owned ? it.hunting : false } : it));
  const toggleHunting = (rank) => setItems(items.map((it) => it.rank === rank ? { ...it, hunting: !it.hunting, owned: it.hunting ? it.owned : false } : it));
  const removeItem = (rank) => setItems(items.filter((it) => it.rank !== rank).map((it, i) => ({ ...it, rank: i + 1 })));

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
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(idx, 0, moved);
    setItems(next.map((it, i) => ({ ...it, rank: i + 1 })));
    setDragIndex(null); setOverIndex(null);
  };
  const handleDragEnd = () => { setDragIndex(null); setOverIndex(null); };

  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = [...items];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setItems(next.map((it, i) => ({ ...it, rank: i + 1 })));
  };
  const moveDown = (idx) => {
    if (idx === items.length - 1) return;
    const next = [...items];
    [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
    setItems(next.map((it, i) => ({ ...it, rank: i + 1 })));
  };

  return (
    <div className="flex gap-6 min-w-0 fade-in-up" data-testid="list-remix-page">
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
            <h1 className="font-serif text-[34px] sm:text-[38px] leading-none">Remix this list</h1>
          </div>
          <p className="text-[13px] text-[var(--text-muted)] ml-14">You&apos;re creating your own version of a list.</p>
        </div>

        {/* Title input */}
        <div className="card-panel p-5" data-testid="title-field">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[12.5px] font-medium">Your remix title <span className="text-[var(--accent-2)]">*</span></label>
            <span className="text-[11px] text-[var(--text-dim)]">{title.length}/80</span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 80))}
            data-testid="title-input"
            className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg px-4 py-3 text-[14px] focus:outline-none focus:border-[var(--accent)]/50 transition"
          />
        </div>

        {/* Description */}
        <div className="card-panel p-5" data-testid="description-field">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[12.5px] font-medium">Your description <span className="text-[var(--text-muted)]">(optional)</span></label>
            <span className="text-[11px] text-[var(--text-dim)]">{description.length}/250</span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 250))}
            rows={3}
            data-testid="description-input"
            className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg px-4 py-3 text-[13.5px] focus:outline-none focus:border-[var(--accent)]/50 transition resize-none"
          />
        </div>

        {/* Your Ranking */}
        <div className="card-panel p-5" data-testid="ranking-section">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
            <div>
              <h2 className="font-serif text-[22px] leading-tight">Your ranking</h2>
              <p className="text-[12px] text-[var(--text-muted)] mt-1">Add, remove or reorder albums to make it your own.</p>
            </div>
            <button className="btn-accent rounded-lg px-4 py-2 text-[12.5px] flex items-center gap-2" data-testid="add-album-btn">
              <Plus size={13} /> Add album
            </button>
          </div>

          {/* Items */}
          <div className="space-y-4 mt-5">
            {items.map((it, idx) => (
              <div
                key={it.rank + "-" + it.title}
                draggable
                onDragStart={handleDragStart(idx)}
                onDragOver={handleDragOver(idx)}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop(idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-start gap-3 pt-4 border-t border-[var(--border)] first:border-t-0 first:pt-0 transition-all ${
                  dragIndex === idx ? "opacity-40" : ""
                } ${overIndex === idx && dragIndex !== idx ? "bg-[var(--accent-soft)] rounded-lg -mx-2 px-2 pb-2 border-t-[var(--accent)]" : ""}`}
                data-testid={`item-${it.rank}`}
              >
                <div className="flex flex-col items-center gap-1 mt-3 shrink-0">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    data-testid={`up-${it.rank}`}
                    className="text-[var(--text-dim)] hover:text-[var(--accent-2)] disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <div className="text-[var(--text-dim)] cursor-grab active:cursor-grabbing" title="Drag to reorder">
                    <GripVertical size={16} />
                  </div>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === items.length - 1}
                    data-testid={`down-${it.rank}`}
                    className="text-[var(--text-dim)] hover:text-[var(--accent-2)] disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                <div className="font-serif text-[22px] text-[var(--text-muted)] w-6 text-center shrink-0 mt-2">{it.rank}</div>
                <div className="w-[70px] h-[70px] rounded shrink-0 cover" style={{ background: it.cover }} />

                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium">{it.title}</div>
                  <div className="text-[12px] text-[var(--text-muted)] mb-2">{it.artist}</div>
                  <div className="relative">
                    <textarea
                      value={it.reason}
                      onChange={(e) => updateReason(it.rank, e.target.value)}
                      rows={2}
                      placeholder="Why this album?"
                      data-testid={`reason-${it.rank}`}
                      className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg px-3 py-2 pr-14 text-[12.5px] focus:outline-none focus:border-[var(--accent)]/50 transition resize-none"
                    />
                    <span className="absolute right-3 bottom-2 text-[10.5px] text-[var(--text-dim)]">{it.reason.length}/150</span>
                  </div>
                  <div className="flex items-center gap-5 mt-2.5">
                    <Checkbox checked={it.owned} onChange={() => toggleOwned(it.rank)} label="Owned" testid={`owned-${it.rank}`} />
                    <Checkbox checked={it.hunting} onChange={() => toggleHunting(it.rank)} label="Hunting" testid={`hunting-${it.rank}`} />
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 mt-2">
                  <button className="border border-[var(--border-2)] text-[12px] px-3 py-1.5 rounded-lg hover:border-[var(--accent)]/40 hover:text-[var(--accent-2)] transition" data-testid={`replace-${it.rank}`}>
                    Replace
                  </button>
                  <button
                    onClick={() => removeItem(it.rank)}
                    className="w-8 h-8 rounded-lg border border-[var(--border-2)] flex items-center justify-center hover:border-[#ef4444]/40 hover:text-[#ef4444] transition"
                    data-testid={`delete-${it.rank}`}
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

        {/* Additional options */}
        <div className="card-panel p-5" data-testid="additional-options">
          <h3 className="font-serif text-[17px] mb-4">Additional options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start justify-between gap-3 p-4 rounded-lg border border-[var(--border)]">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium mb-0.5">Show in my collection</div>
                <p className="text-[11.5px] text-[var(--text-muted)] leading-snug">Display ownership status for these albums in my profile and collection.</p>
              </div>
              <Toggle on={showInCollection} onClick={() => setShowInCollection(!showInCollection)} testid="toggle-collection" />
            </div>
            <div className="flex items-start justify-between gap-3 p-4 rounded-lg border border-[var(--border)]">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium mb-0.5">Make this list private</div>
                <p className="text-[11.5px] text-[var(--text-muted)] leading-snug">Only you will be able to see this list.</p>
              </div>
              <Toggle on={privateList} onClick={() => setPrivateList(!privateList)} testid="toggle-private" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2" data-testid="remix-actions">
          <button className="border border-[var(--border-2)] rounded-lg px-6 py-3 text-[13px] hover:border-[var(--accent)]/40 hover:text-[var(--accent-2)] transition" data-testid="save-draft-btn">
            Save as draft
          </button>
          <button
            onClick={() => navigate(`/lists/${id || "saddest-albums-ever"}`)}
            data-testid="publish-btn"
            className="rounded-lg px-8 py-3 font-semibold text-[13px] text-white transition hover:-translate-y-0.5 flex flex-col items-center leading-tight"
            style={{ background: "linear-gradient(90deg, #8b5cf6, #6d28d9)", boxShadow: "0 8px 24px var(--accent-glow)" }}
          >
            <span>Publish remix</span>
            <span className="text-[10px] font-normal opacity-80 mt-0.5">Your remix will be visible to everyone</span>
          </button>
        </div>
      </div>

      {/* Right sidebar */}
      <aside className="hidden xl:block w-[290px] shrink-0 space-y-5">
        {/* Original list */}
        <div className="card-panel p-5" data-testid="original-list-card">
          <div className="text-[13.5px] font-medium mb-3">Original list</div>
          <div className="flex gap-3 mb-4">
            <div className="w-14 h-14 rounded-md shrink-0 cover" style={{ background: original.cover }} />
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium truncate">{original.title}</div>
              <div className="text-[11px] text-[var(--text-muted)]">by @{original.author.handle.toLowerCase().replace(/\s|\./g, "")}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-4 text-[11.5px] text-[var(--text-muted)]">
            <span>♥ {original.likes}</span>
            <span>💬 {original.comments}</span>
            <span>⤴ {original.remixes}</span>
          </div>
          <p className="text-[11.5px] text-[var(--text-muted)] leading-snug mb-4">{original.aboutText.slice(0, 100)}...</p>
          <Link
            to={`/lists/${original.id}`}
            className="w-full block text-center border border-[var(--accent)]/40 text-[var(--accent-2)] py-2 rounded-lg text-[12px] hover:bg-[var(--accent-soft)] transition"
            data-testid="view-original-btn"
          >
            View original list
          </Link>
        </div>

        {/* Remix tips */}
        <div className="card-panel p-5" data-testid="tips-card">
          <h3 className="font-serif text-[16px] mb-4">Remix tips</h3>
          <div className="space-y-4">
            <TipCard Icon={Sparkles} color="#8b5cf6" title="Make it yours" text={"Add your personal stories and reasons. That\u2019s what makes your list unique."} />
            <TipCard Icon={Lightbulb} color="#f59e0b" title="Explain your picks" text="People love to know why an album means something to you." />
            <TipCard Icon={Compass} color="#10b981" title="Discover more" text="Your remix might inspire others to create their own versions." />
          </div>
        </div>

        {/* How remixes work */}
        <div className="card-panel p-5" data-testid="how-remixes-work">
          <h3 className="font-serif text-[16px] mb-4">How remixes work</h3>
          <svg viewBox="0 0 220 90" className="w-full h-[100px]">
            <circle cx="110" cy="15" r="8" fill="var(--accent)" />
            <line x1="110" y1="23" x2="40" y2="70" stroke="var(--border-2)" strokeWidth="1"/>
            <line x1="110" y1="23" x2="110" y2="70" stroke="var(--border-2)" strokeWidth="1"/>
            <line x1="110" y1="23" x2="180" y2="70" stroke="var(--border-2)" strokeWidth="1"/>
            <circle cx="40" cy="75" r="6" fill="var(--accent-2)" opacity="0.7" />
            <circle cx="110" cy="75" r="6" fill="var(--accent-2)" opacity="0.7" />
            <circle cx="180" cy="75" r="6" fill="var(--accent-2)" opacity="0.7" />
          </svg>
          <p className="text-[11.5px] text-[var(--text-muted)] leading-relaxed mt-2">
            Your remix will be linked to the original list. People can discover all versions and see how everyone&apos;s taste is different.
          </p>
        </div>

        {/* Community */}
        <div className="card-panel p-5" data-testid="community-card">
          <h3 className="font-serif text-[16px] mb-4">Community</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex -space-x-2">
              {["#c2a876", "#6b3fa0", "#e85a6f", "#4a8a5a"].map((c, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-[var(--panel)]" style={{ background: `linear-gradient(135deg, ${c}, #1a1612)` }} />
              ))}
            </div>
            <span className="text-[11.5px] text-[var(--accent-2)] font-medium">+117</span>
          </div>
          <p className="text-[11.5px] text-[var(--text-muted)] mb-4">117 people have already remixed this list!</p>
          <button className="w-full border border-[var(--border-2)] py-2 rounded-lg text-[12px] hover:border-[var(--accent)]/40 hover:text-[var(--accent-2)] transition flex items-center justify-center gap-1" data-testid="see-all-remixes">
            See all remixes <ArrowRight size={11} />
          </button>
        </div>
      </aside>
    </div>
  );
}
