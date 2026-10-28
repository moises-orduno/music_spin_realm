import React, { useEffect, useState } from "react";
import {
  ShoppingCart as CartIcon,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Disc3,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import {
  getCart,
  removeCartItem,
} from "../services/cartService";

import {
  getShippingAddresses
} from "../services/shippingAddressService";

export default function ShoppingCart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getCart();
        setItems(data.items || []);
      } catch (err) {
        setError(err.message || "Failed to load your shopping cart.");
      } finally {
        setLoading(false);
      }
    };

    loadCart();

    const loadShippingAddress = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const addresses = await getShippingAddresses();

        const defaultAddress = addresses.find(
          (address) => address.is_default
        );

        setSelectedAddressId(
          defaultAddress?.id || addresses[0]?.id || ""
        );
      } catch (err) {
        setError(err.message || "Failed to load your shipping list.");
      } finally {
        setLoading(false);
      }
    };

    loadShippingAddress();
  }, [user?.id]);

  const getListingId = (item) =>
    item.listing_id ?? item.listing?.id ?? item.id;

  const getListing = (item) => item.listing ?? item;
  const getAlbum = (item) => item.album ?? item.listing?.album ?? {};

  const formatPrice = (price, currency = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(Number(price) || 0);

  const availableItems = items.filter((item) => {
    const listing = getListing(item);

    return (
      item.available !== false &&
      listing.status !== "sold" &&
      listing.status !== "unavailable"
    );
  });

  const subtotalByCurrency = availableItems.reduce((totals, item) => {
    const listing = getListing(item);
    const currency = listing.currency || item.currency || "USD";
    const price = Number(listing.price ?? item.price ?? 0);

    totals[currency] = (totals[currency] || 0) + price;
    return totals;
  }, {});

  const handleCheckout = () => {
    if (!user) {
      navigate("/login", {
        state: {
          message: "Log in to continue to checkout.",
          redirectTo: "/checkout",
        },
      });
      return;
    }

    navigate("/checkout");
  };

  const handleContinueShopping = () => {
    navigate("/marketplace");
  };

  if (loading) {
    return (
      <div className="space-y-8 fade-in-up">
        <div>
          <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] mb-3">
            Your next favorite record
          </div>
          <h1 className="font-serif text-[32px] sm:text-[40px] leading-tight mb-3">
            Shopping Cart
          </h1>
        </div>

        <div className="text-center py-16 text-[var(--text-muted)]">
          Loading your records...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in-up" data-testid="shopping-cart-page">
      {/* Header */}
      <div>
        <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] mb-3">
          Your next favorite record
        </div>

        <h1 className="font-serif text-[32px] sm:text-[40px] leading-tight mb-3">
          Shopping Cart
        </h1>

        <p className="text-[14px] text-[var(--text-muted)] max-w-[560px]">
          Your records are waiting for you. Find the records of your dreams.
        </p>
      </div>

      {error && (
        <div className="card-panel p-4 text-sm text-red-500 flex items-center justify-between gap-4">
          <span>{error}</span>
          <button
            onClick={() => window.location.reload()}
            className="underline shrink-0"
          >
            Try again
          </button>
        </div>
      )}

      {!user ? (
        <div className="card-panel text-center py-16 px-6">
          <CartIcon
            size={42}
            className="mx-auto mb-4 text-[var(--accent)]"
          />

          <h2 className="font-serif text-2xl mb-2">
            Log in to see your cart
          </h2>

          <p className="text-sm text-[var(--text-muted)] mb-6">
            Sign in to view the records you've added.
          </p>

          <button
            onClick={() =>
              navigate("/login", {
                state: {
                  message: "Log in to view your shopping cart.",
                  redirectTo: "/cart",
                },
              })
            }
            className="btn-accent inline-flex items-center gap-2 px-5 py-3 rounded-full"
          >
            Log in <ArrowRight size={15} />
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="card-panel text-center py-16 px-6">
          <div className="mb-5 flex justify-center">
            <div className="rounded-full p-5 bg-[var(--surface)]">
              <Disc3 size={42} className="text-[var(--accent)]" />
            </div>
          </div>

          <h2 className="font-serif text-2xl mb-2">
            Your crate is empty
          </h2>

          <p className="text-[14px] text-[var(--text-muted)] max-w-[420px] mx-auto mb-6">
            There are plenty of records waiting to join your collection.
            Start digging and discover something special.
          </p>

          <button
            onClick={handleContinueShopping}
            className="btn-accent inline-flex items-center gap-2 px-5 py-3 rounded-full"
          >
            Explore records <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
          {/* Cart items */}
          <section className="card-panel p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3 pb-5 border-b border-[var(--border)]">
              <h2 className="font-serif text-xl">
                In your crate
              </h2>

              <span className="text-[12px] text-[var(--text-muted)]">
                {items.length} {items.length === 1 ? "record" : "records"}
              </span>
            </div>

            <div>
              {items.map((item) => {
                const listing = getListing(item);
                const album = getAlbum(item);
                const listingId = getListingId(item);

                const title =
                  album.title || listing.album_title || "Unknown album";

                const artist =
                  typeof album.artist === "string"
                    ? album.artist
                    : album.artist?.name || "Unknown artist";

                const image =
                  album.cover_url ||
                  album.image_url ||
                  listing.images?.[0];

                const currency =
                  listing.currency || item.currency || "USD";

                const price = Number(
                  listing.price ?? item.price ?? 0
                );

                const isAvailable =
                  item.available !== false &&
                  listing.status !== "sold" &&
                  listing.status !== "unavailable";

                return (
                  <div
                    key={listingId}
                    className="grid grid-cols-[88px_minmax(0,1fr)] sm:grid-cols-[112px_minmax(0,1fr)_auto] gap-4 sm:gap-5 py-6 border-b border-[var(--border)] last:border-b-0"
                  >
                    {/* Album artwork */}
                    <div className="aspect-square w-[88px] sm:w-[112px] rounded-lg overflow-hidden bg-[var(--surface)]">
                      {image ? (
                        <img
                          src={image}
                          alt={`${title} album cover`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Disc3
                            size={36}
                            className="text-[var(--text-dim)]"
                          />
                        </div>
                      )}
                    </div>

                    {/* Record details */}
                    <div className="min-w-0">
                      <h3 className="font-medium text-[15px] sm:text-base leading-snug">
                        {title}
                      </h3>

                      <p className="text-[13px] text-[var(--text-muted)] mt-1">
                        {artist}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {listing.pressing_year && (
                          <span className="text-[10px] px-2 py-1 rounded-md bg-[var(--surface)] text-[var(--text-muted)]">
                            {listing.pressing_year}
                          </span>
                        )}

                        {listing.pressing_country && (
                          <span className="text-[10px] px-2 py-1 rounded-md bg-[var(--surface)] text-[var(--text-muted)]">
                            {listing.pressing_country}
                          </span>
                        )}

                        {listing.format && (
                          <span className="text-[10px] px-2 py-1 rounded-md bg-[var(--surface)] text-[var(--text-muted)]">
                            {listing.format}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[var(--text-muted)] mt-3">
                        Media: {listing.media_condition || "Not specified"}
                        {listing.sleeve_condition &&
                          ` · Sleeve: ${listing.sleeve_condition}`}
                      </p>

                      {!isAvailable && (
                        <p className="text-[11px] text-red-500 mt-2">
                          This record is no longer available.
                        </p>
                      )}

                      <button
                        onClick={async () => {
                          const confirmed = window.confirm(
                            "Are you sure you want to remove this item from your cart?"
                          );

                          if (!confirmed) return;

                          try {
                            setRemovingId(listingId);
                            setError(null);

                            await removeCartItem(listingId);

                            setItems((currentItems) =>
                              currentItems.filter(
                                (item) => getListingId(item) !== listingId
                              )
                            );
                          } catch (err) {
                            setError(err.message || "Failed to remove this record.");
                          } finally {
                            setRemovingId(null);
                          }
                        }}
                        disabled={removingId === listingId}
                        className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-red-500 mt-3 disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                        {removingId === listingId
                          ? "Removing..."
                          : "Remove"}
                      </button>

                      <div className="sm:hidden mt-3 font-medium text-sm">
                        {formatPrice(price, currency)}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="hidden sm:block text-right whitespace-nowrap">
                      <div className="font-medium text-[15px]">
                        {formatPrice(price, currency)}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-1">
                        One copy
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleContinueShopping}
              className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] mt-5"
            >
              <ArrowLeft size={14} />
              Continue shopping
            </button>
          </section>

          {/* Order summary */}
          <section className="card-panel p-5 sm:p-6 lg:sticky lg:top-6">
            <h2 className="font-serif text-xl mb-6">
              Order summary
            </h2>

            <div className="space-y-4 text-[13px]">
              <div className="flex justify-between gap-4">
                <span className="text-[var(--text-muted)]">
                  Records ({availableItems.length})
                </span>

                <div className="text-right space-y-1">
                  {Object.entries(subtotalByCurrency).map(
                    ([currency, amount]) => (
                      <div key={currency} className="font-medium">
                        {formatPrice(amount, currency)}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-[var(--text-muted)]">
                  Shipping
                </span>
                <span className="text-[11px] text-[var(--text-muted)] text-right">
                  Calculated at checkout
                </span>
              </div>

              <div className="border-t border-[var(--border)] pt-5">
                <div className="flex justify-between gap-4 items-start">
                  <span className="font-medium">Subtotal</span>

                  <div className="text-right space-y-1">
                    {Object.entries(subtotalByCurrency).map(
                      ([currency, amount]) => (
                        <div key={currency} className="font-semibold">
                          {formatPrice(amount, currency)}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-5 mb-5">
              Shipping and final payment details will be confirmed at
              checkout. Prices are shown in each listing's currency.
            </p>

            <button
              onClick={handleCheckout}
              disabled={availableItems.length === 0}
              className="btn-accent w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to checkout <ArrowRight size={15} />
            </button>

            <div className="border-t border-[var(--border)] mt-6 pt-5 space-y-4">
              <div className="flex gap-3 items-start">
                <ShieldCheck
                  size={19}
                  className="text-[var(--accent)] shrink-0"
                />
                <div>
                  <p className="text-[12px] font-medium">
                    Review before you buy
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">
                    Confirm your order details at checkout.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Disc3
                  size={19}
                  className="text-[var(--accent)] shrink-0"
                />
                <div>
                  <p className="text-[12px] font-medium">
                    Find the records of your dreams
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">
                    Build a collection that sounds like you.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}