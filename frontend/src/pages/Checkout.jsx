import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Disc3,
  LockKeyhole,
  MapPin,
  PencilIcon,
  Plus,
  ShieldCheck,
  Trash2,
  Truck,
} from "lucide-react";
import {
  validateCheckout,
} from "../services/checkoutService";
import {
  createOrder,
} from "../services/orderService";

// Keep these imports aligned with the paths already used in your project.
import { getCart } from "../services/cartService";
import { getShippingAddresses, deleteShippingAddress } from "../services/shippingAddressService";

import { getCurrentUser } from "../services/authService";

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressOptions, setShowAddressOptions] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    let cancelled = false;

    async function loadCheckout() {
      if (!user) {
        setItems([]);
        setShippingAddresses([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [cartData, addressesData] = await Promise.all([
          getCart(),
          getShippingAddresses(),
        ]);

        if (cancelled) return;

        const addresses = Array.isArray(addressesData)
          ? addressesData
          : addressesData?.addresses || [];

        setItems(cartData?.items || []);
        setShippingAddresses(addresses);

        const defaultAddress = addresses.find((address) => address.is_default);
        setSelectedAddressId(defaultAddress?.id || addresses[0]?.id || "");
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load checkout details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCheckout();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const getListingId = (item) =>
    item.listing_id ?? item.listing?.id ?? item.id;
  const getListing = (item) => item.listing ?? item;
  const getAlbum = (item) => item.album ?? item.listing?.album ?? {};

  const formatPrice = (price, currency = "MXN") =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
    }).format(Number(price) || 0);

  const availableItems = useMemo(
    () =>
      items.filter((item) => {
        const listing = getListing(item);
        return (
          item.available !== false &&
          listing.status !== "sold" &&
          listing.status !== "unavailable"
        );
      }),
    [items]
  );

  const currencies = [
    ...new Set(
      availableItems.map((item) => {
        const listing = getListing(item);
        return listing.currency || item.currency || "MXN";
      })
    ),
  ];

  const subtotalByCurrency = availableItems.reduce((totals, item) => {
    const listing = getListing(item);
    const currency = listing.currency || item.currency || "MXN";
    const price = Number(listing.price ?? item.price ?? 0);
    totals[currency] = (totals[currency] || 0) + price;
    return totals;
  }, {});

  const selectedAddress = shippingAddresses.find(
    (address) => address.id === selectedAddressId
  );

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      
      return;
    }

    try {
      setSubmitting(true);

      const summary = await validateCheckout(selectedAddressId);

      if (summary.valid) {

        await createOrder(selectedAddressId);

      }

    } catch (err) {
      
    } finally {
      setSubmitting(false);
      navigate("/orders/active");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center text-[var(--text-muted)]">
        Loading checkout...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card-panel max-w-xl mx-auto p-8 text-center">
        <Disc3 size={42} className="mx-auto mb-4 text-[var(--accent)]" />
        <h1 className="font-serif text-2xl mb-2">Log in to continue</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Sign in to check out the records in your crate.
        </p>
        <button
          onClick={() =>
            navigate("/login", {
              state: {
                message: "Log in to continue to checkout.",
                redirectTo: "/checkout",
              },
            })
          }
          className="btn-accent inline-flex items-center gap-2 px-5 py-3 rounded-full"
        >
          Log in <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card-panel max-w-xl mx-auto p-8 text-center">
        <Disc3 size={42} className="mx-auto mb-4 text-[var(--accent)]" />
        <h1 className="font-serif text-2xl mb-2">Your crate is empty</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Add some records before checking out.
        </p>
        <button
          onClick={() => navigate("/marketplace")}
          className="btn-accent inline-flex items-center gap-2 px-5 py-3 rounded-full"
        >
          Explore records <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in-up max-w-7xl mx-auto" data-testid="checkout-page">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] mb-2">
            SpinRealm · Secure checkout
          </p>
          <h1 className="font-serif text-[32px] sm:text-[40px] leading-tight">
            Checkout
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Almost there. Confirm your delivery and order details.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <ShieldCheck size={18} className="text-[var(--accent)]" />
          Secure checkout
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-500"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 lg:gap-8 items-start">
        {/* Checkout steps */}
        <div className="space-y-8 min-w-0">

          {/* Shipping address */}
          <section className="card-panel p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-[var(--accent)]" />
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl">
                    Shipping address
                  </h2>

                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Where should we send your records?
                  </p>
                </div>
              </div>

              {shippingAddresses.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowAddressOptions(!showAddressOptions)}
                  className="text-sm text-[var(--accent)] hover:underline"
                >
                  {showAddressOptions ? "Cancel" : "Change"}
                </button>
              )}
            </div>

            {shippingAddresses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border-2)] p-5 text-center">
                <p className="text-sm mb-3">
                  You haven't added a shipping address yet.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    navigate("/shippingAddressForm/new", {
                      state: { returnTo: "/cart" },
                    })
                  }
                  className="btn-accent inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm"
                >
                  <Plus size={15} /> Add a new address
                </button>
              </div>
            ) : (
              <>
                {shippingAddresses
                  .filter((address) => address.id === selectedAddressId)
                  .map((address) => (
                    <div
                      key={address.id}
                      className="rounded-xl border border-[var(--border)] bg-[var(--panel-2)] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Check size={17} className="text-[var(--accent)] mt-0.5" />
                        <div className="min-w-0 text-sm">
                          <p className="font-medium">{address.full_name}</p>
                          <p className="text-[var(--text-muted)] mt-1">
                            {address.address_line1}
                            {address.address_line2
                              ? `, ${address.address_line2}`
                              : ""}
                          </p>
                          <p className="text-[var(--text-muted)]">
                            {[address.neighborhood, address.city, address.state]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          <p className="text-[var(--text-muted)]">
                            {address.postal_code}, {address.country}
                          </p>
                          {address.phone && (
                            <p className="text-[var(--text-muted)] mt-1">
                              {address.phone}
                            </p>
                          )}
                          {address.is_default && (
                            <span className="inline-block mt-2 text-xs text-[var(--accent)]">
                              Default address
                            </span>
                          )}
                        </div>

                      </div>
                      <div className="space-y-4 " data-testid="shopping-cart-page">
                        <button
                          type="button"
                          onClick={() => navigate(`/shippingAddressForm/${address.id}/edit`)}
                          className="
                                      btn-ghost
                                      inline-flex
                                      items-center
                                      justify-center
                                      gap-1.5
                                      rounded-full
                                      border
                                      border-[var(--border)]
                                      px-4
                                      py-2
                                      text-[12px]
                                      whitespace-nowrap
                                      transition
                                      hover:border-[#3d85c6]
                                      hover:text-[#3d85c6]
                                    "
                        >
                          <PencilIcon size={13} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            const confirmed = window.confirm(
                              "Are you sure you want to delete this address?"
                            );

                            if (!confirmed) return;

                            try {
                              await deleteShippingAddress(address.id);

                              setShippingAddresses((prev) =>
                                prev.filter((item) => item.id !== address.id)
                              );


                            } catch (err) {
                              console.error(
                                "Failed to delete shippinh address",
                                err
                              );

                              alert(
                                err.message ||
                                "Failed to delete address"
                              );
                            }
                          }}
                          className="
                                                                  btn-ghost
                                                                  inline-flex
                                                                  items-center
                                                                  justify-center
                                                                  gap-1.5
                                                                  rounded-full
                                                                  border
                                                                  border-[var(--border)]
                                                                  px-4
                                                                  py-2
                                                                  text-[12px]
                                                                  whitespace-nowrap
                                                                  text-red-500
                                                                  transition
                                                                  hover:border-red-500/50
                                                                  hover:bg-red-500/10
                                                                  hover:text-red-500
                                                                "
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                {showAddressOptions && (
                  <div className="space-y-2 mt-3">
                    {shippingAddresses
                      .filter((address) => address.id !== selectedAddressId)
                      .map((address) => (
                        <button
                          type="button"
                          key={address.id}
                          onClick={() => {
                            setSelectedAddressId(address.id);
                            setShowAddressOptions(false);
                          }}
                          className="w-full text-left rounded-xl border border-[var(--border)] p-3 hover:border-[var(--accent)] transition"
                        >
                          <p className="font-medium text-sm">{address.full_name}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">
                            {address.address_line1}, {address.city},{" "}
                            {address.state} · {address.postal_code}
                          </p>
                        </button>
                      ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    navigate("/shippingAddressForm/new", {
                      state: { returnTo: "/cart" },
                    })
                  }
                  className="inline-flex items-center gap-2 mt-4 text-sm text-[var(--accent)] hover:underline"
                >
                  <Plus size={15} /> Add a new address
                </button>
              </>
            )}
          </section>


          {/* Payment method */}
          <section className="card-panel p-5 sm:p-7">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard size={20} className="text-[var(--accent)]" />
              <h2 className="font-serif text-xl sm:text-2xl">
                Payment method
              </h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-5">
              Choose a payment method. Payment details will be handled securely
              by your payment provider.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${paymentMethod === "card"
                  ? "border-[var(--accent)] bg-[var(--accent)]/5"
                  : "border-[var(--border)] hover:border-[var(--border-2)]"
                  }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${paymentMethod === "card"
                    ? "border-[var(--accent)]"
                    : "border-[var(--border-2)]"
                    }`}
                >
                  {paymentMethod === "card" && (
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                  )}
                </span>
                <span className="flex h-12 w-14 items-center justify-center rounded-lg bg-[var(--surface)]">
                  <CreditCard size={25} className="text-[var(--accent)]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">Credit or debit card</span>
                  <span className="block text-xs text-[var(--text-muted)] mt-1">
                    Visa, Mastercard, and other supported cards
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("paypal")}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${paymentMethod === "paypal"
                  ? "border-[var(--accent)] bg-[var(--accent)]/5"
                  : "border-[var(--border)] hover:border-[var(--border-2)]"
                  }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${paymentMethod === "paypal"
                    ? "border-[var(--accent)]"
                    : "border-[var(--border-2)]"
                    }`}
                >
                  {paymentMethod === "paypal" && (
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                  )}
                </span>
                <span className="flex h-12 w-14 items-center justify-center rounded-lg bg-[var(--surface)] font-bold italic text-blue-600">
                  PayPal
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">PayPal</span>
                  <span className="block text-xs text-[var(--text-muted)] mt-1">
                    Pay with your PayPal account
                  </span>
                </span>
              </button>
            </div>
          </section>

          {/* Place order */}
          <section className="card-panel p-5 sm:p-7">
            <div className="flex items-center gap-3 mb-2">
              <Check size={20} className="text-[var(--accent)]" />
              <h2 className="font-serif text-xl sm:text-2xl">Place order</h2>
            </div>
            <p className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-5">
              <LockKeyhole size={14} />
              Your payment information is handled securely by the payment provider.
            </p>
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={
                submitting ||
                !selectedAddressId ||
                availableItems.length === 0 ||
                currencies.length > 1
              }
              className="btn-accent w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LockKeyhole size={16} />
              {submitting ? "Preparing order..." : "Continue to payment"}
              {currencies.length === 1 && (
                <span>· {formatPrice(subtotalByCurrency[currencies[0]], currencies[0])}</span>
              )}
            </button>
            {currencies.length > 1 && (
              <p className="text-xs text-amber-600 mt-3">
                Your cart contains different currencies. Please check out items
                in the same currency together.
              </p>
            )}
          </section>
        </div>

        {/* Order summary */}
        <aside className="card-panel p-5 sm:p-6 lg:sticky lg:top-6">
          <h2 className="font-serif text-xl sm:text-2xl mb-6">Order summary</h2>

          <div className="space-y-5">
            {availableItems.map((item) => {
              const listing = getListing(item);
              const album = getAlbum(item);
              const listingId = getListingId(item);
              const title = album.title || listing.album_title || "Unknown album";
              const artist =
                typeof album.artist === "string"
                  ? album.artist
                  : album.artist?.name || "Unknown artist";
              const image =
                album.cover_url || album.image_url || listing.images?.[0];
              const currency = listing.currency || item.currency || "MXN";
              const price = Number(listing.price ?? item.price ?? 0);

              return (
                <div
                  key={listingId}
                  className="flex gap-3 border-b border-[var(--border)] pb-5 last:border-b-0"
                >
                  <div className="h-[76px] w-[76px] shrink-0 overflow-hidden rounded-lg bg-[var(--surface)]">
                    {image ? (
                      <img
                        src={image}
                        alt={`${title} album cover`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Disc3 size={30} className="text-[var(--text-dim)]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold leading-snug">{title}</h3>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{artist}</p>
                    {listing.seller_name && (
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Seller: {listing.seller_name}
                      </p>
                    )}
                    <p className="mt-2 text-sm font-semibold">
                      {formatPrice(price, currency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3 border-t border-[var(--border)] pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-muted)]">Subtotal</span>
              <div className="text-right">
                {Object.entries(subtotalByCurrency).map(([currency, amount]) => (
                  <div key={currency} className="font-medium">
                    {formatPrice(amount, currency)}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-muted)]">Shipping</span>
              <span className="text-right text-xs text-[var(--text-muted)]">
                Calculated before payment
              </span>
            </div>
            <div className="flex justify-between gap-4 border-t border-[var(--border)] pt-4">
              <span className="font-semibold">Total</span>
              <div className="text-right font-semibold">
                {Object.entries(subtotalByCurrency).map(([currency, amount]) => (
                  <div key={currency}>{formatPrice(amount, currency)}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[var(--accent)]/15 bg-[var(--accent)]/5 p-4">
            <div className="flex items-start gap-3">
              <Truck size={22} className="shrink-0 text-[var(--accent)]" />
              <div>
                <p className="text-sm font-semibold">Delivery estimate</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Confirmed once shipping is calculated.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 text-xs leading-relaxed text-[var(--text-muted)]">
            <ShieldCheck size={18} className="shrink-0 text-[var(--accent)]" />
            <p>
              Your payment is processed securely through the payment provider.
              SpinRealm does not store your card number or security code.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="mt-6 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)]"
          >
            <ArrowLeft size={14} /> Back to cart
          </button>
        </aside>
      </div>
    </div>
  );
}
