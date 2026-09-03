import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Disc3,
  Globe2,
  CalendarDays,
  Tag,
  Hash,
  Layers3,
  CircleCheck,
  Trash2,
  DollarSign,
  Store
} from "lucide-react";
import { useEffect, useState } from "react";

import { getCollectionById, deleteCollection } from "../services/collectionService";

function DetailRow({ Icon, label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 border-b border-[var(--border)] last:border-b-0">
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

      <span className="text-[13px] text-[var(--text)] text-right">
        {value || "—"}
      </span>
    </div>
  );
}

function ConditionBadge({ children }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[var(--surface-hover)] border border-[var(--border)] text-[12px] text-[var(--text)]">
      {children}
    </span>
  );
}

export default function CollectionAlbumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  const images = item?.images || [];
  const currentImage = images[selectedImage];

  useEffect(() => {
    async function loadItem() {
      try {
        setLoading(true);

        const data = await getCollectionById(id);

        // Album cover first, then user's photos
        const images = [
          ...(data.album?.cover_url ? [data.album.cover_url] : []),
          ...(data.images || []),
        ];

        setItem({
          ...data,
          images,
        });

      } catch (err) {
        console.error(err);
        setError("Unable to load this item.");
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen fade-in-up">
        <div className="h-6 w-32 rounded bg-[var(--surface)] animate-pulse mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)] gap-8">
          <div className="aspect-square rounded-xl bg-[var(--surface)] animate-pulse" />

          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded bg-[var(--surface)] animate-pulse" />
            <div className="h-5 w-1/3 rounded bg-[var(--surface)] animate-pulse" />
            <div className="h-10 w-1/2 rounded bg-[var(--surface)] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="py-20 text-center">
        <p className="text-[14px] text-[var(--text-muted)]">
          {error || "item not found."}
        </p>

        <Link
          to="/collection"
          className="inline-flex items-center gap-2 mt-5 text-[13px] text-[var(--accent)] hover:opacity-80"
        >
          <ArrowLeft size={15} />
          Back to Collection
        </Link>
      </div>
    );
  }

  const album = item.album || {};

  return (
    <div
      className="min-w-0 fade-in-up pb-12"
      data-testid="collection-detail-page"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/collection"
          className="inline-flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft size={15} />
          My Collection
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/collectionAlbumForm/${item.id}/edit`)}
            className="btn-ghost px-4 py-2 rounded-lg border border-[var(--border)] text-[12px]"
          >
            Edit
          </button>

          <button
            onClick={async () => {
              const confirmed = window.confirm(
                "Are you sure you want to delete this item of your collection?"
              );

              if (!confirmed) return;

              try {
                await deleteCollection(item.id);

                // Go back to hunts list
                navigate("/collection");

              } catch (err) {
                console.error(
                  "Failed to delete item",
                  err
                );

                alert(
                  err.message ||
                  "Failed to delete item"
                );
              }
            }}
            className="btn-ghost border border-[var(--border)] px-3 py-2 rounded-lg text-[12px] flex items-center gap-2 text-red-500 hover:text-red-600"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] gap-8 xl:gap-12">

        {/* Album cover */}
        <div className="min-w-0">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-[var(--surface)] border border-[var(--border)]">
            {currentImage ? (
              <img
                src={currentImage}
                alt={item.album?.title || "Album"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                <Disc3 size={60} strokeWidth={1} />
              </div>
            )}
          </div>
        </div>

        {images.length > 1 && (
          <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedImage(index)}
                className={`
          w-16 h-16 shrink-0 rounded-md overflow-hidden border transition-all
          ${selectedImage === index
                    ? "border-[var(--accent)] ring-1 ring-[var(--accent)]"
                    : "border-[var(--border)] opacity-70 hover:opacity-100"
                  }
        `}
              >
                <img
                  src={image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}



        {/* Collection information */}
        <div className="min-w-0">

          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent-2)] text-[10px] font-medium uppercase tracking-wide mb-3">
              <Disc3 size={12} />
              In your collection
            </div>

            <h1 className="text-[28px] md:text-[34px] font-serif leading-tight">
              {album.title}
            </h1>

            <p className="mt-1.5 text-[15px] text-[var(--text-muted)]">
              {album.artist?.name || album.artist || "Unknown Artist"}
            </p>
          </div>

          {/* Quick specs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {item.pressing && (
              <ConditionBadge>
                {item.pressing}
              </ConditionBadge>
            )}

            {item.pressing_country && (
              <ConditionBadge>
                {item.pressing_country}
              </ConditionBadge>
            )}

            {item.pressing_year && (
              <ConditionBadge>
                {item.pressing_year}
              </ConditionBadge>
            )}

            {item.edition && (
              <ConditionBadge>
                {item.edition}
              </ConditionBadge>
            )}
          </div>

          {/* Condition */}
          <div className="flex gap-2 mb-6">
            <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3">
              <p className="text-[11px] text-[var(--text-muted)] mb-1">
                Media
              </p>

              <p className="text-[14px] font-medium">
                {item.media_condition || "—"}
              </p>
            </div>

            <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3">
              <p className="text-[11px] text-[var(--text-muted)] mb-1">
                Sleeve
              </p>

              <p className="text-[14px] font-medium">
                {item.sleeve_condition || "—"}
              </p>
            </div>
          </div>

          {/* Collection summary */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] flex items-center justify-center">
                <Disc3
                  size={18}
                  className="text-[var(--accent)]"
                />
              </div>

              <div>
                <p className="text-[13px] font-medium">
                  Personal Collection
                </p>

                <p className="text-[11px] text-[var(--text-muted)]">
                  Added{" "}
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-8">

        {/* Pressing details */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-[15px] font-semibold mb-3">
            Pressing Details
          </h2>

          <DetailRow
            Icon={Disc3}
            label="Pressing"
            value={item.pressing}
          />

          <DetailRow
            Icon={Globe2}
            label="Country"
            value={item.pressing_country}
          />

          <DetailRow
            Icon={CalendarDays}
            label="Year"
            value={item.pressing_year}
          />

          <DetailRow
            Icon={Tag}
            label="Label"
            value={item.label}
          />

          <DetailRow
            Icon={Hash}
            label="Catalog #"
            value={item.catalog_number}
          />

          <DetailRow
            Icon={Hash}
            label="Barcode"
            value={item.barcode}
          />

          <DetailRow
            Icon={Layers3}
            label="Edition"
            value={item.edition}
          />

          <DetailRow
            Icon={CircleCheck}
            label="Media Condition"
            value={item.media_condition}
          />

          <DetailRow
            Icon={CircleCheck}
            label="Sleeve Condition"
            value={item.sleeve_condition}
          />

          <DetailRow
            Icon={Hash}
            label="Matrix / Runout"
            value={item.matrix_runout}
          />
        </section>

        {/* Personal information */}
        <div className="space-y-5">

          {/* Purchase information */}
          {(item.price_paid != null ||
            item.purchase_date ||
            item.purchased_from) && (
              <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <h2 className="text-[15px] font-semibold mb-3">
                  Purchase Information
                </h2>

                <DetailRow
                  Icon={DollarSign}
                  label="Price Paid"
                  value={
                    item.price_paid != null
                      ? `${item.price_paid.toLocaleString()} ${item.currency || ""}`
                      : null
                  }
                />

                <DetailRow
                  Icon={CalendarDays}
                  label="Purchase Date"
                  value={
                    item.purchase_date
                      ? new Date(item.purchase_date).toLocaleDateString()
                      : null
                  }
                />

                <DetailRow
                  Icon={Store}
                  label="Purchased From"
                  value={item.purchased_from}
                />
              </section>
            )}

          {/* Notes */}
          {item.notes && (
            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-[15px] font-semibold mb-3">
                My Notes
              </h2>

              <p className="text-[13px] text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
                {item.notes}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );

}