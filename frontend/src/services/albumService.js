import { API_BASE_URL } from "./api";

export async function getAlbumSuggestions(albumIds, limit = 10) {

  const response = await fetch(
    `${API_BASE_URL}/albums/suggestions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        album_ids: albumIds,
        limit,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get album suggestions");
  }

  return response.json();
}

export async function getSearch(query, limit = 10, listId = null) {
  const url = `${API_BASE_URL}/albums/search`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      limit,
      list_id: listId,
    }),
  });

  if (!response.ok) {
    console.log(await response.text());
    throw new Error("Failed to search albums");
  }

  return response.json();
}

export async function getAlbumById(id) {
  const response = await fetch(
    `${API_BASE_URL}/albums/${id}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch album");
  }

  return response.json();
}

export async function getSimilarAlbumsById(id) {
  const response = await fetch(
    `${API_BASE_URL}/albums/${id}/similar`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch similar albums");
  }

  return response.json();
}