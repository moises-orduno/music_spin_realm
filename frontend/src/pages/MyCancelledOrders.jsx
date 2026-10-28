
import React, { useEffect, useState } from "react";
import {
    CheckCircle2,
    CircleX,
    Clock3,
    Package,
    Disc3,
    Truck,
    Target
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { getCancelledOrders } from "../services/orderService";

const STATUS_CONFIG = {
    cancelled: {
        label: "Cancelled",
        className: "bg-rose-50 text-rose-500",
        icon: CircleX,
    },
    expired: {
        label: "Expired",
        className: "bg-rose-50 text-rose-500",
        icon: CircleX,
    },
};

function formatPrice(amount, currency = "MXN") {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(Number(amount || 0));
}

function formatDate(date) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function StatusBadge({ status }) {
    const config =
        STATUS_CONFIG[String(status || "").toLowerCase()] ||
        STATUS_CONFIG.processing;

    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium ${config.className}`}
        >
            <Icon size={15} />
            {config.label}
        </span>
    );
}

function OrderCard({ order, expanded, onToggle, onAction }) {
  const items = order.items || [];
  const firstItem = items[0] || {};
  const status = String(order.status || "processing").toLowerCase();
  const currency = order.currency || firstItem.currency || "MXN";
  const total = order.total ?? order.subtotal ?? 0;
  const orderNumber =
    order.order_number || `SR-${String(order.id || "").slice(-4).toUpperCase()}`;

  const action =
    status === "pending_payment"
      ? { label: "Complete payment", type: "payment" }
      : status === "shipped"
        ? { label: "Track package", type: "tracking" }
        : { label: "Details", type: "details" };

  const firstImage =
    firstItem.cover_url ||
    firstItem.album?.cover_url ||
    firstItem.image ||
    "";

  return (
    <article
      className="card-panel hover-lift p-4 sm:p-5 flex gap-4 sm:gap-5 cursor-pointer"
      onClick={onToggle}
    >
      {/* Main album cover */}
      <div
        className="cover cover-placeholder w-[88px] h-[88px] sm:w-[110px] sm:h-[110px] shrink-0"
        style={{
          backgroundImage: firstImage ? `url(${firstImage})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!firstImage && (
          <div className="flex h-full items-center justify-center font-serif text-[11px] opacity-80">
            {firstItem.title || firstItem.album?.title || "SpinRealm"}
          </div>
        )}
      </div>

      {/* Order content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-serif text-[20px] leading-tight truncate">
              #{orderNumber}
            </h3>

            <div className="mt-1 text-[12.5px] text-[var(--text-muted)]">
              {formatDate(order.created_at)} <span className="mx-1">·</span>
              {items.length} {items.length === 1 ? "item" : "items"}
            </div>
          </div>

          <div className="shrink-0">
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Album items */}
        <div className="mt-3 space-y-3">
          {items.slice(0, 2).map((item, index) => (
            <div
              key={item.listing_id || item.id || index}
              className="flex min-w-0 items-center gap-3"
            >
              <div
                className="cover cover-placeholder w-[48px] h-[48px] shrink-0"
                style={{
                  backgroundImage: (
                    item.cover_url ||
                    item.album?.cover_url ||
                    item.image
                  )
                    ? `url(${
                        item.cover_url ||
                        item.album?.cover_url ||
                        item.image
                      })`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {!(
                  item.cover_url ||
                  item.album?.cover_url ||
                  item.image
                ) && (
                  <div className="flex h-full items-center justify-center">
                    <Disc3 size={18} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="truncate text-[12.5px] font-medium">
                  {item.title || item.album?.title || "Vinyl record"}
                </div>

                <div className="truncate text-[11.5px] text-[var(--text-muted)]">
                  {item.artist || item.album?.artist || ""}
                </div>

                <div className="mt-0.5 text-[12px] text-[var(--accent)]">
                  {formatPrice(
                    item.unit_price ?? item.price,
                    item.currency || currency
                  )}
                </div>
              </div>
            </div>
          ))}

          {items.length > 2 && (
            <p className="text-[11.5px] text-[var(--text-muted)]">
              +{items.length - 2} more{" "}
              {items.length - 2 === 1 ? "item" : "items"}
            </p>
          )}
        </div>

        {/* Total and actions */}
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-[var(--border-2)] pt-3">
          <div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Order total
            </div>

            <div className="font-serif text-[18px] text-[var(--accent)]">
              {formatPrice(total, currency)}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggle();
              }}
              className="border border-[var(--border-2)] text-[12px] px-3 py-1.5 rounded-full btn-ghost"
            >
              {expanded ? "Hide details" : "Details"}
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onAction(action.type, order);
              }}
              className={
                action.type === "payment"
                  ? "bg-[var(--accent)] border border-[var(--accent)] text-white text-[12px] px-3 py-1.5 rounded-full hover:opacity-90 transition"
                  : "bg-[var(--accent-soft)] border border-[var(--accent)]/30 text-[var(--accent)] text-[12px] px-3 py-1.5 rounded-full hover:bg-[var(--accent)]/20 transition"
              }
            >
              {action.label}
            </button>
          </div>
        </div>

        {/* Expandable details */}
        {expanded && (
          <div
            className="mt-4 border-t border-[var(--border-2)] pt-4"
            onClick={(event) => event.stopPropagation()}
          >
            <h4 className="font-serif text-base">Order details</h4>

            <div className="mt-3 grid gap-3 text-[12px] sm:grid-cols-2">
              <div>
                <div className="text-[var(--text-muted)]">
                  Payment status
                </div>
                <div className="mt-1 capitalize">
                  {(order.payment_status || "pending").replaceAll("_", " ")}
                </div>
              </div>

              <div>
                <div className="text-[var(--text-muted)]">
                  Shipping address
                </div>
                <div className="mt-1">
                  {order.shipping_address
                    ? [
                        order.shipping_address.address_line1,
                        order.shipping_address.city,
                        order.shipping_address.state,
                        order.shipping_address.postal_code,
                      ]
                        .filter(Boolean)
                        .join(", ")
                    : "Address unavailable"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default function MyCancelledOrders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [expandedOrders, setExpandedOrders] = useState({});
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadOrders = async () => {
            try {
              
                setLoadingOrders(true);

                const response = await getCancelledOrders();
                setOrders(response || []);
            } catch (err) {

                setError(err.message || "Unable to load your orders.");

            } finally {
                setLoadingOrders(false);

            }
        }

        loadOrders();

    }, []);

    function toggleExpanded(orderId) {
        setExpandedOrders((previous) => ({
            ...previous,
            [orderId]: !previous[orderId],
        }));
    }

    function handleAction(type, order) {
        if (type === "payment") {
            navigate(`/checkout/payment/${order.id}`);
            return;
        }

        if (type === "tracking") {
            navigate(`/orders/${order.id}`);
            return;
        }

        navigate(`/orders/${order.id}`);
    }

    return (
        <div className="space-y-8 fade-in-up" data-testid="cancelled-orders-page">
            <div className="flex items-start justify-between gap-6 flex-wrap">
                <div>
                    <div className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] mb-3">Your orders</div>
                    <h1 className="font-serif text-[40px] leading-tight mb-3">Cancelled Orders</h1>
                    <p className="text-[14px] text-[var(--text-muted)] max-w-[560px]">
                        See your cancelled purchases, view details.
                    </p>
                </div>
            </div>

            {/* Loading state */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loadingOrders ? (
                    <p>Loading...</p>
                ) : orders.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                        <div className="text-5xl mb-4">🎯</div>

                        <h2 className="font-serif text-2xl mb-2">
                            No Orders have been cancelled yet
                        </h2>

                        <p className="text-[var(--text-muted)] mb-6">
                            Go to the marketplace and find records you love.
                        </p>

                        <button
                            onClick={() => navigate("/marketplace")}
                            className="btn-accent inline-flex items-center gap-2 px-5 py-3 rounded-full"
                        >
                            <Target size={14} />
                            Go to Marketplace
                        </button>
                    </div>
                ) : (

                    orders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            expanded={!!expandedOrders[order.id]}
                            onToggle={() => toggleExpanded(order.id)}
                            onAction={handleAction}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
