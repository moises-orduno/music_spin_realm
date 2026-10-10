import { authenticatedFetch, getToken } from "./authService";
import { API_BASE_URL } from "./api";

export async function getProfile(username) {
    const response = await authenticatedFetch(
        `/users/${username}`,
        {
            method: "GET",
        }
        , false);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));

        throw new Error(
            error.detail || "Failed to get profile"
        );
    }

    return response.json();
}

export async function updateUser(formData) {
  const token = getToken();
  const response = await fetch(
    `${API_BASE_URL}/users/me`,
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
    throw new Error("Failed to update user");
  }

  return response.json();
}

export async function getProfiles() {
  const response = await authenticatedFetch(
    `/users`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
    false
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Failed to get user"
    );
  }

  return response.json();
}

export async function getProfilesFollowing() {
  const response = await authenticatedFetch(
    `/users/following`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
    false
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Failed to get users"
    );
  }

  return response.json();
}

export async function getProfilesFollowers() {
  const response = await authenticatedFetch(
    `/users/followers`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
    false
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(
      error.detail || "Failed to get users"
    );
  }

  return response.json();
}

export async function toggleFollowById(id) {
  const response = await authenticatedFetch(
    `/users/${id}/follow`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to toggle follow");
  }

  return response.json();
}