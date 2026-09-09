import api from "./api";

// ── Helpers ──────────────────────────────────────────────────────
const toId = (v, name = "ID") => {
  try {
    const n = Number(v);
    if (!Number.isInteger(n) || n <=0) throw new Error(`Invalid ${name}.`);
    return n;
  } catch { throw new Error(`Invalid ${name}.`); }
};

const normalizeWishlist = (data) => {
  try {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.wishlist)) return data.wishlist;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    return data;
  } catch { return []; }
};

const safeDispatch = (name, detail) => {
  try {
    if (detail!==undefined) window.dispatchEvent(new CustomEvent(name, { detail }));
    else window.dispatchEvent(new Event(name));
  } catch {}
};

// ── Get Wishlist ─────────────────────────────────────────────────
export const getWishlist = async (params = {}) => {
  try {
    const response = await api.get("wishlist/", { params });
    const data = normalizeWishlist(response.data);
    const count = Array.isArray(data)? data.length : (response.data?.count || response.data?.total || 0);
    safeDispatch("wishlist-change", { count });
    return response.data;
  } catch (err) {
    console.error("getWishlist error:", err?.message);
    safeDispatch("wishlist-change", { count: 0 });
    return { results: [], items: [], count: 0 };
  }
};

// ── Add to Wishlist ──────────────────────────────────────────────
export const addToWishlist = async (productId, listId=null) => {
  try {
    const pid = toId(productId, "product ID");
    const payload = { product: pid };
    if (listId) payload.wishlist_id = toId(listId, "list ID");
    // Also support list_name for Amazon multiple lists
    if (typeof listId==="string" && isNaN(Number(listId))) payload.list_name = listId;

    const response = await api.post("wishlist/", payload);
    safeDispatch("wishlist-change");
    return response.data;
  } catch (err) {
    console.error("addToWishlist error:", err?.response?.data || err?.message);
    // Duplicate handling - Amazon shows "Already in list"
    if (err?.response?.status===400 && JSON.stringify(err?.response?.data).toLowerCase().includes("already")) {
      return { already_exists: true, ...err.response.data };
    }
    throw err;
  }
};

// ── Remove from Wishlist ─────────────────────────────────────────
export const removeFromWishlist = async (itemId) => {
  try {
    const iid = toId(itemId, "wishlist item ID");
    const response = await api.delete(`wishlist/${iid}/`);
    safeDispatch("wishlist-change");
    return response.data || { success: true };
  } catch (err) {
    console.error("removeFromWishlist error:", err?.response?.data || err?.message);
    // Try alternative endpoints - Amazon fallback
    try {
      const response = await api.delete(`wishlist/remove/${toId(itemId)}/`);
      safeDispatch("wishlist-change");
      return response.data;
    } catch {
      throw err;
    }
  }
};

// ── Check if in Wishlist (fast) ──────────────────────────────────
export const isInWishlist = async (productId) => {
  const pid = (()=>{ try{ return toId(productId,"product ID"); }catch{return 0;} })();
  if (!pid) return false;
  try {
    const response = await api.get(`wishlist/check/${pid}/`);
    return Boolean(response.data?.in_wishlist ?? response.data?.exists ?? response.data?.is_in_wishlist ?? response.data);
  } catch {
    try {
      const data = await getWishlist();
      const list = normalizeWishlist(data);
      if (Array.isArray(list)) {
        return list.some(item =>
          Number(item.product)===pid ||
          Number(item.product_id)===pid ||
          Number(item.product?.id)===pid ||
          Number(item.id)===pid
        );
      }
    } catch {}
    return false;
  }
};

// ── Toggle Wishlist (Amazon + Flipkart heart button) ─────────────
export const toggleWishlist = async (productId) => {
  try {
    const pid = toId(productId, "product ID");
    const exists = await isInWishlist(pid);
    if (exists) {
      try {
        const data = await getWishlist();
        const list = normalizeWishlist(data);
        if (Array.isArray(list)) {
          const found = list.find(item =>
            Number(item.product)===pid ||
            Number(item.product_id)===pid ||
            Number(item.product?.id)===pid
          );
          if (found) {
            await removeFromWishlist(found.id);
            return { added: false, removed: true, inWishlist: false };
          }
        }
      } catch {}
      await removeFromWishlist(pid);
      return { added: false, removed: true, inWishlist: false };
    } else {
      const result = await addToWishlist(pid);
      if (result?.already_exists) return { added: false, removed: false, inWishlist: true, already_exists: true };
      return { added: true, removed: false, inWishlist: true, data: result };
    }
  } catch (err) {
    console.error("toggleWishlist error", err);
    throw err;
  }
};

// ── Clear Wishlist ───────────────────────────────────────────────
export const clearWishlist = async () => {
  try {
    const response = await api.delete("wishlist/clear/");
    safeDispatch("wishlist-change", { count: 0 });
    return response.data || { success: true };
  } catch {
    try {
      const data = await getWishlist();
      const list = normalizeWishlist(data);
      if (Array.isArray(list) && list.length>0) {
        await Promise.allSettled(list.map(i=> removeFromWishlist(i.id).catch(()=>{})));
      }
      safeDispatch("wishlist-change", { count: 0 });
      return { success: true };
    } catch (err) {
      console.error("clearWishlist error", err);
      return { success: false };
    }
  }
};

// ── Get Wishlist Count ───────────────────────────────────────────
export const getWishlistCount = async () => {
  try {
    const response = await api.get("wishlist/count/");
    return Number(response.data?.count ?? response.data?.total ?? 0);
  } catch {
    try {
      const data = await getWishlist();
      const list = normalizeWishlist(data);
      return Array.isArray(list)? list.length : (data?.count || 0);
    } catch { return 0; }
  }
};

// ── Move Wishlist to Cart (Amazon) ───────────────────────────────
export const moveWishlistToCart = async (productId, quantity = 1) => {
  try {
    const pid = toId(productId, "product ID");
    const response = await api.post(`wishlist/${pid}/move-to-cart/`, {
      quantity: Number(quantity)||1,
    });
    safeDispatch("wishlist-change");
    safeDispatch("cart-change");
    return response.data;
  } catch (err) {
    console.error("moveWishlistToCart endpoint failed, fallback to manual", err?.message);
    try {
      const { addToCart } = await import("./cartService");
      await addToCart(productId, quantity);
      try {
        const data = await getWishlist();
        const list = normalizeWishlist(data);
        const found = Array.isArray(list)? list.find(i=> Number(i.product)===Number(productId) || Number(i.product?.id)===Number(productId)) : null;
        if (found) await removeFromWishlist(found.id);
      } catch {}
      safeDispatch("wishlist-change");
      safeDispatch("cart-change");
      return { success: true, fallback: true };
    } catch (e) { throw e; }
  }
};

// ── AMAZON NEW: Multiple Wishlists ───────────────────────────────
export const getWishlistLists = async () => {
  try {
    const res = await api.get("wishlist/lists/");
    return res.data?.results || res.data || [];
  } catch {
    // Fallback local
    try {
      return JSON.parse(localStorage.getItem("amazon_wishlist_lists")||"[]") || [{ id: "default", name: "Default List", is_default: true }];
    } catch { return [{ id: "default", name: "Default List" }]; }
  }
};

export const createWishlistList = async (name, isPrivate=false) => {
  try {
    const res = await api.post("wishlist/lists/", { name, is_private: isPrivate });
    return res.data;
  } catch {
    try {
      const lists = JSON.parse(localStorage.getItem("amazon_wishlist_lists")||"[]");
      const newList = { id: Date.now(), name, is_private: isPrivate, items: [] };
      lists.push(newList);
      localStorage.setItem("amazon_wishlist_lists", JSON.stringify(lists));
      return newList;
    } catch { return { id: Date.now(), name }; }
  }
};

export const shareWishlist = async (listId) => {
  try {
    const res = await api.get(`wishlist/lists/${toId(listId)}/share/`);
    return res.data?.share_url || res.data?.url || "";
  } catch {
    return `${window.location.origin}/wishlist/shared/${listId}`;
  }
};

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  toggleWishlist,
  clearWishlist,
  getWishlistCount,
  moveWishlistToCart,
  getWishlistLists,
  createWishlistList,
  shareWishlist
};