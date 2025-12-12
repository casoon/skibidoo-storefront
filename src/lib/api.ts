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
  if (params.page) query.set("page[number]", String(params.page));
  if (params.limit) query.set("page[size]", String(params.limit));
  if (params.categoryId) query.set("filter[category]", params.categoryId);
  if (params.search) query.set("filter[search]", params.search);

  try {
    const response = await fetch(`${API_URL}/api/v1/products?${query}`);
    if (!response.ok) {
      console.error(`API error: ${response.status}`);
      return { products: [], total: 0 };
    }
    const data = await response.json();
    return { 
      products: data.data || [], 
      total: data.meta?.total || 0 
    };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { products: [], total: 0 };
  }
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_URL}/api/v1/products/${slug}`);
    if (response.status === 404) return null;
    if (!response.ok) return null;
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_URL}/api/v1/categories`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function fetchCategory(slug: string): Promise<Category | null> {
  try {
    const response = await fetch(`${API_URL}/api/v1/categories/${slug}`);
    if (response.status === 404) return null;
    if (!response.ok) return null;
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return null;
  }
}

export async function getCart(cartId: string | null): Promise<Cart> {
  const url = cartId 
    ? `${API_URL}/api/v1/cart/${cartId}` 
    : `${API_URL}/api/v1/cart`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { id: "", items: [], subtotal: 0, shipping: 0, discount: 0, total: 0, itemCount: 0 };
    }
    return response.json();
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return { id: "", items: [], subtotal: 0, shipping: 0, discount: 0, total: 0, itemCount: 0 };
  }
}

export async function addToCart(cartId: string | null, productId: string, quantity: number): Promise<Cart> {
  const url = cartId 
    ? `${API_URL}/api/v1/cart/${cartId}/items`
    : `${API_URL}/api/v1/cart`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity }),
  });
  if (!response.ok) throw new Error("Failed to add to cart");
  return response.json();
}

export async function updateCartItem(cartId: string, itemId: string, quantity: number): Promise<Cart> {
  const response = await fetch(`${API_URL}/api/v1/cart/${cartId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: itemId, quantity }),
  });
  if (!response.ok) throw new Error("Failed to update cart");
  return response.json();
}

export async function removeFromCart(cartId: string, itemId: string): Promise<Cart> {
  const response = await fetch(`${API_URL}/api/v1/cart/${cartId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: itemId, quantity: 0 }),
  });
  if (!response.ok) throw new Error("Failed to remove from cart");
  return response.json();
}
