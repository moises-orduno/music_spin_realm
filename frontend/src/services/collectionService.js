import { API_BASE_URL } from "./api";
import { getToken } from "./authService";

export async function getMyCollection({
  search = "",
  sort = "recently_added",
  limit = 50,
  skip = 0,
} = {}) {
  const token = getToken();
    console.log("token",token);
  const params = new URLSearchParams();

  if (search) {
    params.append("search", search);
  }

  params.append("sort", sort);
  params.append("limit", limit);
  params.append("skip", skip);

  const response = await fetch(
    `${API_BASE_URL}/collection/me?${params.toString()}`,
    {
      method: "GET",
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get collection");
  }

  return response.json();
}

export async function addToMyCollection(payload) {
  const token = getToken();

  console.log("payload",payload);

  const response = await fetch(
    `${API_BASE_URL}/collection/me`,
    {
      method: "POST",
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
    throw new Error("Failed to add album to collection");
  }

  return response.json();
}