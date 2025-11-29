import type { APIRoute } from "astro";

const API_URL = import.meta.env.API_URL || "http://localhost:3000";

export const POST: APIRoute = async ({ request, cookies }) => {
  const formData = await request.formData();
  const itemId = formData.get("itemId") as string;
  const quantity = Number(formData.get("quantity") || 0);

  const cartId = cookies.get("cartId")?.value;
  if (!cartId) {
    return new Response("Cart not found", { status: 404 });
  }

  if (quantity <= 0) {
    const response = await fetch(`${API_URL}/api/cart/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartId, itemId }),
    });
    if (!response.ok) {
      return new Response("Failed to remove item", { status: 500 });
    }
  } else {
    const response = await fetch(`${API_URL}/api/cart/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartId, itemId, quantity }),
    });
    if (!response.ok) {
      return new Response("Failed to update cart", { status: 500 });
    }
  }

  return Response.redirect(new URL("/cart", request.url).toString(), 303);
};
