import { authenticatedFetch } from "./authService";

// Create a pending order and reserve its listings
export async function createOrder(shippingAddressId) {
  const response = await authenticatedFetch("/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      shipping_address_id: shippingAddressId,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : data.detail?.message || "Unable to create your order."
    );
  }

  return data.order;
}

export async function getActiveOrders() {
  const response = await authenticatedFetch("/order/active", {
    method: "GET"
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to fetch active orders");
  }

  return response.json();
}

export async function getCompletedOrders() {
  const response = await authenticatedFetch("/order/completed", {
    method: "GET"
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to fetch completed orders");
  }

  return response.json();
}

export async function getCancelledOrders() {
  const response = await authenticatedFetch("/order/cancelled", {
    method: "GET"
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to fetch cancelled orders");
  }

  return response.json();
}