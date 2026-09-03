import { authenticatedFetch } from "./authService";

export async function getHunts(status = "hunting") {
  const response = await authenticatedFetch(
    `/hunts/me?status=${encodeURIComponent(status)}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to fetch hunts");
  }

  return response.json();
}

export async function createHunt(hunt) {
  const response = await authenticatedFetch("/hunts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(hunt),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to create hunt");
  }

  return response.json();
}

export async function updateHunt(huntId, payload) {
  const response = await authenticatedFetch(
    `/hunts/${huntId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to update hunt");
  }

  return response.json();
}

export async function deleteHunt(huntId) {
  const response = await authenticatedFetch(
    `/hunts/${huntId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to delete hunt");
  }

  return response.json();
}

export async function getHuntById(huntId) {
  const response = await authenticatedFetch(
    `/hunts/${huntId}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to fetch hunt");
  }

  return response.json();
}