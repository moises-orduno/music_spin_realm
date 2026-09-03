import { authenticatedFetch } from "./authService";

export async function getLists({ category, limit = 50, sort } = {}) {
  const params = new URLSearchParams();

  if (category) params.append("category", category);
  if (limit) params.append("limit", limit);
  if (sort) params.append("sort", sort);

  const response = await authenticatedFetch(
    `/lists?${params.toString()}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to fetch lists");
  }

  return response.json();
}

export async function getListById(id) {
  const response = await authenticatedFetch(`/lists/${id}`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to fetch list");
  }

  return response.json();
}

export async function getListRemixes(id) {
  const response = await authenticatedFetch(
    `/lists/${id}/remixes`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to fetch list remixes");
  }

  return response.json();
}

export async function toggleLikeById(id) {
  const response = await authenticatedFetch(
    `/lists/${id}/like`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to toggle like");
  }

  return response.json();
}

export async function toggleSaveById(id) {
  const response = await authenticatedFetch(
    `/lists/${id}/save`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to toggle save");
  }

  return response.json();
}

export async function createComment(listId, comment) {
  const response = await authenticatedFetch(
    `/comments/lists/${listId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(comment),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to create comment");
  }

  return response.json();
}

export async function getCommentsByListId(listId) {
  const response = await authenticatedFetch(
    `/comments/lists/${listId}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to fetch comments");
  }

  return response.json();
}

export async function createRemixList(listId, remixData) {
  const response = await authenticatedFetch(
    `/lists/${listId}/remix`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(remixData),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to create remix");
  }

  return response.json();
}

export async function createList(listData) {
  console.log(JSON.stringify(listData, null, 2));

  const response = await authenticatedFetch(
    "/lists",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(listData),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to create list");
  }

  return response.json();
}