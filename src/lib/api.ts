const API_URL = import.meta.env.API_URL || "http://localhost:3000";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  stock: number;
  status: string;
  images: Array<{ url: string; alt: string }>;
  deliveryTime: { name: string; minDays: number; maxDays: number } | null;
  basePrice: { quantity: number; unit: string; referenceQuantity: number; pricePerUnit: number } | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  children?: Category[];
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image: string | null;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  itemCount: number;
}

export async function fetchProducts(params: {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
}): Promise<{ products: Product[]; total: number }> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.categoryId) query.set("category", params.categoryId);
  if (params.search) query.set("search", params.search);

  const response = await fetch(`${API_URL}/api/products?${query}`);
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  const response = await fetch(`${API_URL}/api/products/${slug}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Failed to fetch product");
  return response.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/api/categories`);
  if (!response.ok) throw new Error("Failed to fetch categories");
  const data = await response.json();
  return data.categories;
}

export async function fetchCategory(slug: string): Promise<Category | null> {
  const response = await fetch(`${API_URL}/api/categories/${slug}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Failed to fetch category");
  return response.json();
}

export async function getCart(cartId: string | null): Promise<Cart> {
  const url = cartId ? `${API_URL}/api/cart?cartId=${cartId}` : `${API_URL}/api/cart`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch cart");
  return response.json();
}

export async function addToCart(cartId: string | null, productId: string, quantity: number): Promise<Cart> {
  const response = await fetch(`${API_URL}/api/cart/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartId, productId, quantity }),
  });
  if (!response.ok) throw new Error("Failed to add to cart");
  return response.json();
}

export async function updateCartItem(cartId: string, itemId: string, quantity: number): Promise<Cart> {
  const response = await fetch(`${API_URL}/api/cart/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartId, itemId, quantity }),
  });
  if (!response.ok) throw new Error("Failed to update cart");
  return response.json();
}

export async function removeFromCart(cartId: string, itemId: string): Promise<Cart> {
  const response = await fetch(`${API_URL}/api/cart/remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartId, itemId }),
  });
  if (!response.ok) throw new Error("Failed to remove from cart");
  return response.json();
}
