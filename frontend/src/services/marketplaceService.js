import { API_BASE_URL } from "./api";
import { getToken } from "./authService";

export async function getRecommended() {
  const response = await fetch(
    `${API_BASE_URL}/marketplace/recommended-listings`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recommended listings");
  }

  return response.json();
}

export async function getAlbumListings(huntId, limit = 10) {

  const response = await fetch(
    `${API_BASE_URL}/marketplace/albums/${huntId}/listings?limit=${limit}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch album listings");
  }

  return response.json();
}

export async function getMarketplaceListing(listingId) {
  const response = await fetch(
    `${API_BASE_URL}/marketplace/recommended-listings/${listingId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch marketplace listing");
  }

  return response.json();
}

export async function getMarketplaceHuntMatches() {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/marketplace/hunt-matches`,
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