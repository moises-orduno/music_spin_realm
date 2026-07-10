import { API_BASE_URL } from "./api";
import { getToken } from "./authService";

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
    `${API_BASE_URL}/comments/debates/${debateId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch debate");
  }

  return response.json();
}

export async function createComment(debateId, comment) {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/comments/debates/${debateId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(comment),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create comment");
  }

  return response.json();
}

export async function voteDebate(debateId, optionIndex) {
  const response = await fetch(
    `${API_BASE_URL}/debates/${debateId}/vote`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        option_index: optionIndex
      })
    }
  );

  if (!response.ok) {
    throw new Error("Failed to vote");
  }

  return response.json();
}