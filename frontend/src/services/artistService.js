import { API_BASE_URL } from "./api";

export async function getSearch(name, limit = 10) {
  const params = new URLSearchParams({
    name,
    limit: String(limit),
  });

  const url = `${API_BASE_URL}/artists/search?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.log(await response.text());
    throw new Error("Failed to search artists");
  }

  return response.json();
}