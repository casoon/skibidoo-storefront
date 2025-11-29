import type { APIRoute } from "astro";

const API_URL = import.meta.env.API_URL || "http://localhost:3000";

export const POST: APIRoute = async ({ request, cookies }) => {
  const formData = await request.formData();
  const itemId = formData.get("itemId") as string;

  const cartId = cookies.get("cartId")?.value;
  if (!cartId) {
    return new Response("Cart not found", { status: 404 });
  }

  await fetch(`${API_URL}/api/cart/remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartId, itemId }),
  });

  return Response.redirect(new URL("/cart", request.url).toString(), 303);
};
