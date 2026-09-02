import api from "./api";

// ── Helpers ──────────────────────────────────────────────────────
const toId = (v, name = "ID") => {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`Invalid ${name}.`);
  return n;
};

const normalizeWishlist = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.wishlist)) return data.wishlist;
  if (Array.isArray(data?.items)) return data.items;
  return data;
};

// ── Get Wishlist ─────────────────────────────────────────────────
export const getWishlist = async (params = {}) => {
  const response = await api.get("wishlist/", { params });
  const data = normalizeWishlist(response.data);
  
  const count = Array.isArray(data) ? data.length : (response.data?.count || 0);
  window.dispatchEvent(new CustomEvent("wishlist-change", { detail: { count } }));
  
  return response.data;
};

// ── Add to Wishlist ──────────────────────────────────────────────
export const addToWishlist = async (productId) => {
  const pid = toId(productId, "product ID");

  const response = await api.post("wishlist/", {
    product: pid,
  });

  window.dispatchEvent(new Event("wishlist-change"));
  return response.data;
};

// ── Remove from Wishlist ─────────────────────────────────────────
export const removeFromWishlist = async (itemId) => {
  // itemId can be wishlist_item_id OR product_id - backend handles both
  const iid = toId(itemId, "wishlist item ID");

  const response = await api.delete(`wishlist/${iid}/`);
  window.dispatchEvent(new Event("wishlist-change"));
  return response.data;
};

// ── Check if in Wishlist (fast) ──────────────────────────────────
export const isInWishlist = async (productId) => {
  const pid = toId(productId, "product ID");
  try {
    const response = await api.get(`wishlist/check/${pid}/`);
    return Boolean(response.data?.in_wishlist ?? response.data?.exists ?? response.data);
  } catch {
    // Fallback: get full list and check
    try {
      const data = await getWishlist();
      const list = normalizeWishlist(data);
      if (Array.isArray(list)) {
        return list.some(item => 
          Number(item.product) === pid || 
          Number(item.product_id) === pid || 
          Number(item.product?.id) === pid ||
          Number(item.id) === pid
        );
      }
    } catch {}
    return false;
  }
};

// ── Toggle Wishlist (Flipkart heart button) ───────────────────────
export const toggleWishlist = async (productId) => {
  const pid = toId(productId, "product ID");
  
  const exists = await isInWishlist(pid);
  
  if (exists) {
    // Find wishlist item id to delete
    try {
      const data = await getWishlist();
      const list = normalizeWishlist(data);
      if (Array.isArray(list)) {
        const found = list.find(item => 
          Number(item.product) === pid || 
          Number(item.product_id) === pid ||
          Number(item.product?.id) === pid
        );
        if (found) {
          await removeFromWishlist(found.id);
          return { added: false, removed: true };
        }
      }
    } catch {}
    // Try direct delete by product id as fallback
    await removeFromWishlist(pid);
    return { added: false, removed: true };
  } else {
    const result = await addToWishlist(pid);
    return { added: true, removed: false, data: result };
  }
};

// ── Clear Wishlist ───────────────────────────────────────────────
export const clearWishlist = async () => {
  const response = await api.delete("wishlist/clear/");
  window.dispatchEvent(new CustomEvent("wishlist-change", { detail: { count: 0 } }));
  return response.data;
};

// ── Get Wishlist Count ───────────────────────────────────────────
export const getWishlistCount = async () => {
  try {
    const response = await api.get("wishlist/count/");
    return Number(response.data?.count || 0);
  } catch {
    try {
      const data = await getWishlist();
      const list = normalizeWishlist(data);
      return Array.isArray(list) ? list.length : 0;
    } catch {
      return 0;
    }
  }
};

// ── Move Wishlist to Cart (Flipkart) ─────────────────────────────
export const moveWishlistToCart = async (productId, quantity = 1) => {
  const pid = toId(productId, "product ID");
  const response = await api.post(`wishlist/${pid}/move-to-cart/`, {
    quantity: Number(quantity) || 1,
  });
  window.dispatchEvent(new Event("wishlist-change"));
  window.dispatchEvent(new Event("cart-change"));
  return response.data;
};