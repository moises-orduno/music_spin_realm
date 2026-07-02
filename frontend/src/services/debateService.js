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

export async function getDebateById(id) {
  const response = await fetch(
    `${API_BASE_URL}/debates/${id}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch debate");
  }

  return response.json();
}

export async function getCommentsByDebateId(debateId) {
  const response = await fetch(
    `${API_BASE_URL}/comments/${debateId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch debate");
  }

  return response.json();
}

export async function createComment(debateId, comment) {
  const response = await fetch(
    `${API_BASE_URL}/comments/${debateId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(comment),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create comment");
  }

  return response.json();
}