import React from "react";
import { collectionAlbums } from "../data/mock";
import { Chip } from "../components/ui-bits";
import { Grid2x2, List, Plus } from "lucide-react";

export default function Collection() {
  return (
    <div className="space-y-8 fade-in-up" data-testid="collection-page">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] mb-3">The Shelf</div>
          <h1 className="font-serif text-[32px] sm:text-[40px] leading-tight mb-3">My Collection</h1>
          <div className="flex items-center gap-6 text-[13px] text-[var(--text-muted)]">
            <span><span className="text-[var(--text)] font-medium">142</span> albums</span>
            <span><span className="text-[var(--text)] font-medium">38</span> artists</span>
            <span><span className="text-[var(--text)] font-medium">$4,820</span> value</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-lg border border-[var(--border-2)] flex items-center justify-center btn-ghost text-[var(--accent)]">
            <Grid2x2 size={14} />
          </button>
          <button className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center btn-ghost">
            <List size={14} />
          </button>
          <button className="btn-accent px-4 py-2 rounded-full text-[12.5px] flex items-center gap-1.5 ml-2" data-testid="add-album-btn">
            <Plus size={14} /> Add album
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip active>All</Chip>
        <Chip>Recently added</Chip>
        <Chip>Favorites</Chip>
        <Chip>Original press</Chip>
        <Chip>Reissue</Chip>
        <Chip>By genre</Chip>
        <Chip>By decade</Chip>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {collectionAlbums.map((a) => (
          <div key={a.id} className="cursor-pointer group" data-testid={`collection-item-${a.id}`}>
            <div
              className="cover cover-placeholder aspect-square w-full hover-lift mb-3"
              style={{ background: a.cover }}
            >
              <div className="text-center">
                <div className="font-serif text-[14px] opacity-90">{a.title}</div>
                <div className="text-[9.5px] mt-1 opacity-60">{a.artist}</div>
              </div>
            </div>
            <div className="text-[13px] truncate">{a.title}</div>
            <div className="text-[11px] text-[var(--text-muted)] truncate">{a.artist} · {a.year}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
