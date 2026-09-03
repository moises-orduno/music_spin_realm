import { authenticatedFetch } from "./authService";

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


export async function addToMyCollection(data) {
  const response = await authenticatedFetch(
    "/collection/me",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Failed to add to collection"
    );
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
  payload
) {
  const response = await authenticatedFetch(
    `/collection/${collectionId}`,
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
      error.detail || "Failed to update collection"
    );
  }

  return response.json();
}