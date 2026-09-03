import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
  ShoppingCart,
  Zap,
  Star,
  ChevronRight,
  Disc3,
  Globe2,
  CalendarDays,
  Tag,
  Hash,
  Layers3,
  Gauge,
  Radio,
  CircleCheck,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

import { getMarketplaceListing } from "../services/marketplaceService";

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

export default function MarketplaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    async function loadListing() {
      try {
        setLoading(true);

        const data = await getMarketplaceListing(id);

        setListing(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load this marketplace listing.");
      } finally {
        setLoading(false);
      }
    }

      loadListing();
    
  }, [id]);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);

      // Replace this with your actual cart API call.
      // await addToCart(listing.id);

      setAddedToCart(true);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      setAddingToCart(true);

      // Add the item to cart first.
      // await addToCart(listing.id);

      navigate("/cart");
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToCart(false);
    }
  };

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

  if (error || !listing) {
    return (
      <div className="py-20 text-center">
        <p className="text-[14px] text-[var(--text-muted)]">
          {error || "Listing not found."}
        </p>

        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 mt-5 text-[13px] text-[var(--accent)] hover:opacity-80"
        >
          <ArrowLeft size={15} />
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const album = listing.album || {};
  const seller = listing.seller || {};

  const images =
    listing.images?.length > 0
      ? listing.images
      : album.cover_url
        ? [album.cover_url]
        : [];

  const currentImage = images[selectedImage] || album.cover_url;

  return (
    <div
      className="min-w-0 fade-in-up pb-12"
      data-testid="marketplace-detail-page"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft size={15} />
          Marketplace
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <Heart size={17} strokeWidth={1.7} />
          </button>

          <button
            type="button"
            className="w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <Share2 size={17} strokeWidth={1.7} />
          </button>
        </div>
      </div>

      {/* Main product section */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] gap-8 xl:gap-12">
        {/* Images */}
        <div className="min-w-0">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-[var(--surface)] border border-[var(--border)]">
            {currentImage ? (
              <img
                src={currentImage}
                alt={album.name || "Vinyl record"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                <Disc3 size={60} strokeWidth={1} />
              </div>
            )}

            {listing.is_hunt_match && (
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--accent)] text-white text-[11px] font-medium">
                <Zap size={12} />
                Matches your hunt
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`
                    w-16 h-16 shrink-0 rounded-md overflow-hidden border transition-all
                    ${
                      selectedImage === index
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
        </div>

        {/* Listing information */}
        <div className="min-w-0">
          <div className="mb-5">
            <h1 className="text-[26px] md:text-[30px] font-semibold tracking-tight text-[var(--text)] leading-tight">
              {album.name}
            </h1>

            <Link
              to={`/artist/${album.artist_id}`}
              className="inline-block mt-1.5 text-[15px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              {album.artist?.name || album.artist || "Unknown Artist"}
            </Link>
          </div>

          {/* Rating */}
          {album.rating && (
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-1 text-[var(--accent)]">
                <Star size={15} fill="currentColor" />
                <span className="text-[13px] font-medium">
                  {album.rating}
                </span>
              </div>

              {album.ratings_count && (
                <>
                  <span className="text-[var(--text-muted)]">·</span>
                  <span className="text-[12px] text-[var(--text-muted)]">
                    {album.ratings_count.toLocaleString()} ratings
                  </span>
                </>
              )}
            </div>
          )}

          {/* Price */}
          <div className="mb-5">
            <div className="text-[30px] font-semibold text-[var(--text)] tracking-tight">
              {listing.price?.toLocaleString()}{" "}
              <span className="text-[16px] font-medium">
                {listing.currency || "MXN"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1 text-[12px] text-emerald-400">
              <CircleCheck size={14} />
              Available
            </div>
          </div>

          {/* Quick specs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {listing.format && (
              <ConditionBadge>{listing.format}</ConditionBadge>
            )}

            {listing.speed && (
              <ConditionBadge>{listing.speed}</ConditionBadge>
            )}

            {listing.channels && (
              <ConditionBadge>{listing.channels}</ConditionBadge>
            )}

            {listing.pressing_country && (
              <ConditionBadge>{listing.pressing_country}</ConditionBadge>
            )}
          </div>

          {/* Conditions */}
          <div className="flex gap-2 mb-6">
            <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3">
              <p className="text-[11px] text-[var(--text-muted)] mb-1">
                Media
              </p>
              <p className="text-[14px] font-medium text-[var(--text)]">
                {listing.media_condition || "—"}
              </p>
            </div>

            <div className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3">
              <p className="text-[11px] text-[var(--text-muted)] mb-1">
                Sleeve
              </p>
              <p className="text-[14px] font-medium text-[var(--text)]">
                {listing.sleeve_condition || "—"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2.5 mb-7">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addingToCart}
              className={`
                h-11 rounded-lg border border-[var(--accent)]
                flex items-center justify-center gap-2
                text-[13px] font-medium transition-all
                ${
                  addedToCart
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
                }
                disabled:opacity-50
              `}
            >
              {addedToCart ? (
                <>
                  <CircleCheck size={16} />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  Add to Cart
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={addingToCart}
              className="h-11 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center gap-2 text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Zap size={16} />
              Buy Now
            </button>
          </div>

          {/* Seller */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--surface-hover)] shrink-0">
                  {seller.avatar_url ? (
                    <img
                      src={seller.avatar_url}
                      alt={seller.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-[13px]">
                      {seller.display_name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[var(--text)] truncate">
                    {seller.display_name || "Seller"}
                  </p>

                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--text-muted)]">
                    {seller.sales_count != null && (
                      <span>{seller.sales_count} sales</span>
                    )}

                    {seller.rating && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Star
                            size={11}
                            fill="currentColor"
                            className="text-[var(--accent)]"
                          />
                          {seller.rating}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <ChevronRight
                size={16}
                className="text-[var(--text-muted)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-8">
        {/* Pressing details */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-[15px] font-semibold text-[var(--text)] mb-3">
            Pressing Details
          </h2>

          <div>
            <DetailRow
              Icon={Disc3}
              label="Format"
              value={listing.format}
            />

            <DetailRow
              Icon={Gauge}
              label="Speed"
              value={listing.speed}
            />

            <DetailRow
              Icon={Radio}
              label="Channels"
              value={listing.channels}
            />

            <DetailRow
              Icon={Globe2}
              label="Country"
              value={listing.pressing_country}
            />

            <DetailRow
              Icon={CalendarDays}
              label="Year"
              value={listing.pressing_year}
            />

            <DetailRow
              Icon={Tag}
              label="Label"
              value={listing.label}
            />

            <DetailRow
              Icon={Hash}
              label="Catalog #"
              value={listing.catalog_number}
            />

            <DetailRow
              Icon={Layers3}
              label="Edition"
              value={listing.edition}
            />

            <DetailRow
              Icon={CircleCheck}
              label="Media Condition"
              value={listing.media_condition}
            />

            <DetailRow
              Icon={CircleCheck}
              label="Sleeve Condition"
              value={listing.sleeve_condition}
            />
          </div>
        </section>

        {/* Additional information */}
        <div className="space-y-5">
          {/* Description */}
          {(listing.pressing_description || listing.notes) && (
            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-[15px] font-semibold text-[var(--text)] mb-3">
                Seller Notes
              </h2>

              <p className="text-[13px] text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
                {listing.notes || listing.pressing_description}
              </p>
            </section>
          )}

          {/* Matrix */}
          {listing.matrix_runout && (
            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-[15px] font-semibold text-[var(--text)] mb-3">
                Matrix / Runout
              </h2>

              <p className="font-mono text-[12px] text-[var(--text-muted)] break-all">
                {listing.matrix_runout}
              </p>
            </section>
          )}

          {/* Shipping */}
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--surface-hover)] flex items-center justify-center shrink-0">
                <Truck
                  size={17}
                  className="text-[var(--text-muted)]"
                />
              </div>

              <div>
                <h2 className="text-[14px] font-medium text-[var(--text)]">
                  Shipping
                </h2>

                <p className="text-[12px] text-[var(--text-muted)] mt-1">
                  Ships from {listing.shipping_from || "Mexico"}
                </p>

                {listing.estimated_delivery && (
                  <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
                    Estimated delivery: {listing.estimated_delivery}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border)]">
              <ShieldCheck
                size={15}
                className="text-[var(--text-muted)]"
              />

              <span className="text-[11px] text-[var(--text-muted)]">
                Secure marketplace transaction
              </span>
            </div>
          </section>
        </div>
      </div>

      {/* Mobile sticky purchase bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-[var(--background)]/95 backdrop-blur-xl border-t border-[var(--border)]">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 h-11 rounded-lg border border-[var(--accent)] text-[var(--accent)] flex items-center justify-center gap-2 text-[13px] font-medium"
          >
            <ShoppingCart size={16} />
            Add to Cart
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 h-11 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center gap-2 text-[13px] font-medium"
          >
            <Zap size={16} />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}