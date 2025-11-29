import type { APIRoute } from "astro";

const API_URL = import.meta.env.API_URL || "http://localhost:3000";

export const POST: APIRoute = async ({ request, cookies }) => {
  const formData = await request.formData();
  const productId = formData.get("productId") as string;
  const quantity = Number(formData.get("quantity") || 1);

  let cartId = cookies.get("cartId")?.value;

  const response = await fetch(`${API_URL}/api/cart/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartId, productId, quantity }),
  });

  if (!response.ok) {
    return new Response("0", { status: 200 });
  }

  const cart = await response.json();

  if (!cartId && cart.id) {
    cookies.set("cartId", cart.id, {
      path: "/",
      httpOnly: true,
      secure: import.meta.env.PROD,
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return new Response(String(cart.itemCount || 0), {
    status: 200,
    headers: {
      "HX-Trigger": JSON.stringify({
        showToast: { message: "Produkt hinzugefuegt", type: "success" }
      }),
    },
  });
};
