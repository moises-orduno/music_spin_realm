import { API_BASE_URL } from "./api";
import { getToken } from "./authService";

export async function getHunts(status = "hunting") {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/hunts/me?status=${status}`,
    {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch hunts");
  }

  return response.json();
}

export async function createHunt(hunt) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/hunts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
    body: JSON.stringify(hunt),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Failed to create hunt");
  }

  return response.json();
}

export async function updateHunt(huntId, payload) {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/hunts/${huntId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update hunt");
  }

  return response.json();
}

export async function getHuntById(huntId) {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/hunts/${huntId}`,
    {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch hunt");
  }

  return response.json();
}