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
        list_id: albumIds,
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

  console.log("status:", response.status);

  if (!response.ok) {
    console.log(await response.text());
    throw new Error("Failed to search albums");
  }

  return response.json();
}