import { authenticatedFetch, getToken } from "./authService";
import { API_BASE_URL } from "./api";

export async function getMyCollection({
  search = "",
  sort = "recently_added",
  limit = 50,
  skip = 0,
} = {}) {
  const params = new URLSearchParams();

  if (search) {
    params.append("search", search);
  }

  params.append("sort", sort);
  params.append("limit", limit);
  params.append("skip", skip);

  const response = await authenticatedFetch(
    `/collection/me?${params.toString()}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Failed to get collection"
    );
  }

  return response.json();
}

export async function addToMyCollection(formData) {
  const token = getToken();
  const response = await fetch(
    `${API_BASE_URL}/collection/me`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    console.log(await response.text());
    throw new Error("Failed to add collection");
  }

  return response.json();
}

export async function deleteCollection(collectionId) {
  const response = await authenticatedFetch(
    `/collection/${collectionId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Failed to delete collection"
    );
  }

  return response.json();
}

export async function getCollectionById(collectionId) {
  const response = await authenticatedFetch(
    `/collection/${collectionId}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Failed to fetch collection item"
    );
  }

  return response.json();
}

export async function updateCollection(
  collectionId,
  formData
) {
  const token = getToken();
  const response = await fetch(
    `${API_BASE_URL}/collection/${collectionId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    console.log(await response.text());
    throw new Error("Failed to update collection");
  }

  return response.json();
}
