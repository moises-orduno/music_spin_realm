import { authenticatedFetch } from "./authService";

export async function getCart() {

  const response = await authenticatedFetch(
    `/cart`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Failed to fetch cart"
    );
  }

  return response.json();
}

export async function removeCartItem(listingId) {

  const response = await authenticatedFetch(
    `/cart/${listingId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Failed to delete collection"
    );
  }

  return response.json();
}

export async function addToMyCart(listingId) {
  const response = await authenticatedFetch("/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(listingId),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to add to cart");
  }

  return response.json();
}