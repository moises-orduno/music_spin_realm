import { API_BASE_URL } from "./api";

export async function getDebates() {
  const response = await fetch(
    `${API_BASE_URL}/debates`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch debates");
  }

  return response.json();
}