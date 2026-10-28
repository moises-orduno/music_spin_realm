import { authenticatedFetch } from "./authService";

// Validate cart, address, availability, and totals
export async function validateCheckout(shippingAddressId) {
    console.log("validate",shippingAddressId);
  const response = await authenticatedFetch("/checkout/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      shipping_address_id: shippingAddressId,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : data.detail?.message || "Unable to validate checkout."
    );
  }

  return data;
}
