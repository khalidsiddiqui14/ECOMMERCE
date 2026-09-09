import api, { resolveProductImage, IMAGE_BASE } from "./api";

// Cache - Amazon style - prevents repeat API calls
let productsCache = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 1000; // 1 min

// Helper: Normalize API response - handles all backend shapes - NO ERROR
const normalizeList = (data) => {
  try {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.products)) return data.products;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  } catch { return []; }
};

// GET ALL PRODUCTS - Amazon: with caching, filters
export const getProducts = async (params = {}) => {
  try {
    // Use cache if no params and cache valid
    const isDefault = Object.keys(params).length === 0 || (Object.keys(params).length===1 && params.page_size);
    if (isDefault && productsCache && (Date.now()-cacheTime < CACHE_DURATION)) {
      console.log("⚡ getProducts: from cache");
      return productsCache;
    }

    const res = await api.get("products/", { params });
    const list = normalizeList(res.data);
    console.log(`✅ getProducts: ${list.length} products from ${IMAGE_BASE}`);

    // Deduplicate by ID - Amazon style
    const unique = Array.from(new Map(list.map(p => [p.id, {
      ...p,
      _resolvedImage: resolveProductImage(p), // Pre-resolve image - NO ERROR
      _imageBase: IMAGE_BASE
    }])).values());

    if (isDefault) {
      productsCache = res.data.results? {...res.data, results: unique} : unique;
      cacheTime = Date.now();
    }

    // Return same shape as backend (paginated or array)
    if (res.data?.results) return { ...res.data, results: unique };
    return unique;

  } catch (err) {
    console.error("❌ getProducts Error:", err.response?.data || err.message, err.userMessage);
    throw err;
  }
};

// ALIAS for your pages - ProductDetail.jsx calls getProduct(id)
export const getProduct = async (id) => {
  return getProductById(id);
};

export const getProductById = async (id) => {
  try {
    if (!id) throw new Error("Product ID missing");
    const res = await api.get(`products/${id}/`);
    const product = res.data;
    console.log("✅ getProductById:", product?.name || id);
    
    // Enrich with Amazon helpers - NO ERROR
    if (product) {
      product._resolvedImage = resolveProductImage(product);
      product._allImages = (product.images || []).map(img => {
        try { 
          if (typeof img === "string") return img.startsWith("http")? img : `${IMAGE_BASE}${img.startsWith("/media")? img : `/media/${img}`}`;
          return img.image? (img.image.startsWith("http")? img.image : `${IMAGE_BASE}${img.image}`) : "";
        } catch { return ""; }
      }).filter(Boolean);
      // Price helpers
      const price = Number(product.price||0);
      const mrp = Number(product.original_price || product.mrp || price*1.25);
      product._discount = mrp>price? Math.round((1-price/mrp)*100) : 0;
      product._mrp = mrp;
      product._isPrime = price>=499 || product.is_prime;
    }

    return product;
  } catch (err) {
    console.error("❌ getProductById Error:", id, err.response?.data || err.message);
    throw err;
  }
};

// AMAZON SEARCH - with encoding - NO ERROR
export const searchProducts = async (query) => {
  try {
    if (!query || !String(query).trim()) return [];
    const safeQuery = String(query).trim();
    const res = await api.get("products/", { params: { search: safeQuery, page_size: 50 } });
    const list = normalizeList(res.data);
    console.log(`✅ searchProducts "${safeQuery}": ${list.length} found`);
    return res.data?.results? {...res.data, results: list} : list;
  } catch (err) {
    console.error("❌ searchProducts Error:", err.message);
    // NO ERROR - return empty, don't crash page
    return [];
  }
};

// AMAZON CATEGORIES - with fallback - NO ERROR
export const getCategories = async () => {
  try {
    const res = await api.get("categories/");
    const list = normalizeList(res.data);
    console.log(`✅ getCategories: ${list.length}`);
    if (list.length>0) return res.data?.results? {...res.data, results: list} : list;
    
    // Fallback - Amazon fixed categories
    return [
      { id: 1, name: "Electronics", slug: "electronics" },
      { id: 2, name: "Fashion", slug: "fashion" },
      { id: 3, name: "Home & Kitchen", slug: "home-kitchen" },
      { id: 4, name: "Beauty", slug: "beauty" },
    ];
  } catch (err) {
    console.error("❌ getCategories Error:", err.message);
    // NO ERROR - return fallback - NEVER CRASH
    return [
      { id: 1, name: "Electronics", slug: "electronics" },
      { id: 2, name: "Fashion", slug: "fashion" },
      { id: 3, name: "Home & Kitchen", slug: "home-kitchen" },
      { id: 4, name: "Beauty", slug: "beauty" },
    ];
  }
};

// --- AMAZON NEW FEATURES ---

export const getDeals = async () => {
  try {
    const all = await getProducts({ page_size: 100 });
    const list = normalizeList(all);
    return list.filter(p=>{
      const price = Number(p.price||0);
      const mrp = Number(p.original_price || p.mrp || 0);
      return (mrp>price) || p.is_deal || Number(p.discount_percent)>0;
    });
  } catch { return []; }
};

export const getRelatedProducts = async (productId, category) => {
  try {
    const res = await api.get("products/", { params: { category: category || "", page_size: 8, exclude: productId } });
    return normalizeList(res.data);
  } catch { return []; }
};

export const clearCache = () => {
  productsCache = null;
  cacheTime = 0;
};

// Default export - KEEP COMPATIBLE
export default {
  getProducts,
  getProduct,
  getProductById,
  searchProducts,
  getCategories,
  getDeals,
  getRelatedProducts,
  clearCache
};