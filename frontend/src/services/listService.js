import { API_BASE_URL } from "./api";
import { getToken } from "./authService";

export async function getLists({ category, limit = 50, sort } = {}) {
  const params = new URLSearchParams();

  if (category) params.append("category", category);
  if (limit) params.append("limit", limit);
  if (sort) params.append("sort", sort);

  const response = await fetch(
    `${API_BASE_URL}/lists?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch lists");
  }

  return response.json();
}

export async function getListById(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/lists/${id}`,
    {
      headers: token
        ? {
          Authorization: `Bearer ${token}`,
        }
        : {},
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch list");
  }

  return response.json();
}

export async function getListRemixes(id) {

  const response = await fetch(
    `${API_BASE_URL}/lists/${id}/remixes`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch list remixes");
  }

  return response.json();
}

export async function toggleLikeById(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/lists/${id}/like`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to toggle like");
  }

  return response.json();
}

export async function toggleSaveById(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/lists/${id}/save`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to toggle save");
  }

  return response.json();
}

export async function createComment(listId, comment) {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/comments/lists/${listId}`,
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

export async function getCommentsByListId(listId) {
  const response = await fetch(
    `${API_BASE_URL}/comments/lists/${listId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch debate");
  }

  return response.json();
}

export async function createRemixList(listId, remixData) {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/lists/${listId}/remix`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(remixData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create remix");
  }

  return response.json();
}

export async function createList(listData) {
  const token = getToken();
console.log(JSON.stringify(listData, null, 2));

  const response = await fetch(
    `${API_BASE_URL}/lists`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(listData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create list");
  }

  return response.json();
}