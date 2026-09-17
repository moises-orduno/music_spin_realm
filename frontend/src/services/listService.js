import { authenticatedFetch } from "./authService";
import { API_BASE_URL } from "./api";

export async function getLists({ category, limit = 50, sort } = {}) {
 
    const response = await fetch(
      `${API_BASE_URL}/lists`
    );
  
    if (!response.ok) {
      throw new Error("Failed to fetch lists");
    }
  
    return response.json();
}

export async function getListById(id) {
  const response = await authenticatedFetch(`/lists/${id}`, {
    method: "GET",
  },false);

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

export async function getMyLists() {
  const response = await authenticatedFetch(
    `/lists/me`,
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

export async function getMySavedLists() {
  const response = await authenticatedFetch(
    `/lists/saved`,
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

export async function getMyLikedLists() {
  const response = await authenticatedFetch(
    `/lists/liked`,
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

export async function updateList(
  listId,
  payload
) {
  const response = await authenticatedFetch(
    `/lists/${listId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Failed to update list"
    );
  }

  return response.json();
}

export async function deleteList(listId) {
  const response = await authenticatedFetch(
    `/lists/${listId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Failed to delete list"
    );
  }

  return response.json();
}