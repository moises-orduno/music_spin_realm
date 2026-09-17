import { authenticatedFetch } from "./authService";

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

export async function updateUser(
  payload
) {
  const response = await authenticatedFetch(
    `/users/me`,
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
      error.detail || "Failed to update user"
    );
  }

  return response.json();
}

export async function getProfiles() {
  const response = await authenticatedFetch(
    `/users/users`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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