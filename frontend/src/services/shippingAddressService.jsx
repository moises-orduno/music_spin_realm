import { authenticatedFetch, getToken } from "./authService";

export async function getShippingAddresses() {

  const response = await authenticatedFetch(
    `/users/me/addresses`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Failed to get shippping address"
    );
  }

  return response.json();
}

export async function createShippingAddress(adrress) {

  const response = await authenticatedFetch("/users/me/addresses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(adrress),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Failed to get shippping address"
    );
  }

  return response.json();
}

export async function getShippingAddressById(addressId) {

  const response = await authenticatedFetch(
    `/users/me/addresses/${addressId}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Failed to get shippping address"
    );
  }

  return response.json();
}

export async function updateShippingAddress(addressId, updates) {
  const response = await authenticatedFetch(
    `/users/me/addresses/${addressId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Failed to update shipping address"
    );
  }

  return response.json();
}

export async function deleteShippingAddress(addressId) {
  const response = await authenticatedFetch(
    `/users/me/addresses/${addressId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Failed to delete shipping address"
    );
  }

  return response.json();
}