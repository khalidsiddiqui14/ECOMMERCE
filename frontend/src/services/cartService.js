import api from "./api";
const toId = (v) => { const n = Number(v); if (!Number.isInteger(n) || n <= 0) throw new Error("Invalid product ID."); return n; };
export const getProducts = async (params = {}) => {
  const clean = {}; Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== "") clean[k] = v; });
  const res = await api.get("products/", { params: clean }); return res.data;
};
export const getProduct = async (id) => { const res = await api.get(`products/${toId(id)}/`); return res.data; };
export const getProductBySlug = async (slug) => { if (!slug?.trim()) throw new Error("Slug required"); const res = await api.get(`products/slug/${String(slug).trim()}/`); return res.data; };
export const searchProducts = async (query, params = {}) => { if (!query?.trim()) return { results: [] }; const res = await api.get("products/", { params: { search: String(query).trim(), ...params } }); return res.data; };
export const getFeaturedProducts = async () => { try { const res = await api.get("products/featured/"); return res.data; } catch { const res = await api.get("products/", { params: { ordering: "-created_at", page_size: 12 } }); return res.data; } };
export const getTrendingProducts = async () => { try { const res = await api.get("products/trending/"); return res.data; } catch { const res = await api.get("products/", { params: { ordering: "-views", page_size: 12 } }); return res.data; } };
export const getProductsByCategory = async (categoryId, params = {}) => { const cid = Number(categoryId); if (!Number.isInteger(cid) || cid <= 0) throw new Error("Invalid category ID."); const res = await api.get("products/", { params: { category: cid, ...params } }); return res.data; };
export const getRelatedProducts = async (productId, limit = 6) => {
  const pid = toId(productId);
  try { const res = await api.get(`products/${pid}/related/`, { params: { limit } }); return res.data; }
  catch { try { const prod = await getProduct(pid); if (prod?.category) { const data = await getProductsByCategory(prod.category, { page_size: limit + 1 }); const list = Array.isArray(data) ? data : data.results || []; return list.filter((p) => p.id !== pid).slice(0, limit); } } catch {} return []; }
};
export const getProductReviews = async (productId, params = {}) => { const res = await api.get(`products/${toId(productId)}/reviews/`, { params }); return res.data; };
export const getCategories = async () => { const res = await api.get("categories/"); return res.data; };
export const getBrands = async () => { try { const res = await api.get("brands/"); return res.data; } catch { return []; } };
export const getDealsOfTheDay = async () => { try { const res = await api.get("products/", { params: { has_discount: true, ordering: "-discount", page_size: 8 } }); return res.data; } catch { return { results: [] }; } };
export const getProductsByPriceRange = async (min, max, params = {}) => getProducts({ min_price: min, max_price: max, ...params });

export const getCart = async () => { const res = await api.get("cart/"); return res.data; };
export const getCartCount = async () => { try { const cart = await getCart(); const items = Array.isArray(cart) ? cart : cart?.items || []; return items.reduce((total, item) => total + Number(item.quantity || 0), 0); } catch { return 0; } };
export const addToCart = async (productId, quantity = 1) => { const res = await api.post("cart/", { product: toId(productId), quantity: Number(quantity) || 1 }); return res.data; };
export const updateCartItem = async (itemId, quantity) => { const res = await api.patch(`cart/${toId(itemId)}/`, { quantity: Number(quantity) }); return res.data; };
export const removeCartItem = async (itemId) => { const res = await api.delete(`cart/${toId(itemId)}/`); return res.data; };