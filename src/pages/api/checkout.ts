import type { APIRoute } from "astro";

const API_URL = import.meta.env.API_URL || "http://localhost:3000";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const cartId = cookies.get("cartId")?.value;

  if (!cartId) {
    return redirect("/cart");
  }

  const orderData = {
    cartId,
    email: formData.get("email"),
    phone: formData.get("phone"),
    shippingAddress: {
      firstName: formData.get("shippingFirstName"),
      lastName: formData.get("shippingLastName"),
      company: formData.get("shippingCompany"),
      street: formData.get("shippingStreet"),
      zip: formData.get("shippingZip"),
      city: formData.get("shippingCity"),
      country: formData.get("shippingCountry"),
    },
    billingAddress: formData.get("differentBilling") === "on" ? {
      firstName: formData.get("billingFirstName"),
      lastName: formData.get("billingLastName"),
      company: formData.get("billingCompany"),
      street: formData.get("billingStreet"),
      zip: formData.get("billingZip"),
      city: formData.get("billingCity"),
      country: formData.get("billingCountry"),
    } : undefined,
    shippingMethod: formData.get("shippingMethod"),
    paymentMethod: formData.get("paymentMethod"),
  };

  try {
    const response = await fetch(`${API_URL}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return redirect(`/checkout?error=${encodeURIComponent(error.message || "Checkout failed")}`);
    }

    const result = await response.json();

    // Clear cart cookie after successful order
    cookies.delete("cartId", { path: "/" });

    // Redirect to confirmation or payment page
    if (result.paymentUrl) {
      return redirect(result.paymentUrl);
    }

    return redirect(`/checkout/success?order=${result.orderNumber}`);
  } catch (error) {
    return redirect("/checkout?error=Ein+Fehler+ist+aufgetreten");
  }
};
