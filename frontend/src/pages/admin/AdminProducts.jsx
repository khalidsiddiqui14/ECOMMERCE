import { useState, useEffect } from "react";

import { Link } from "react-router-dom";

const BASE = (import.meta.env.VITE_API_URL?.replace(/\/api.*$/, "") || "http://127.0.0.1:8000").replace(/\/$/, "");
const API_URL = `${BASE}/api/products/`;
const BRANDS_URL = `${BASE}/api/brands/`;
const CATEGORIES_URL = `${BASE}/api/categories/`;
const STORES_URL = `${BASE}/api/stores/`;
const PH = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", sku: "", description: "", price: "", original_price: "", stock: 10, store: "", category: "", brand: "", images: [] });
  const [previews, setPreviews] = useState([]);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [addingBrand, setAddingBrand] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const r = await fetch(API_URL);
      const d = await r.json();
      setProducts(d.results || d.products || []);
    } catch {
      setProducts([]);
    } finally { setLoading(false); }
  };

  const fetchBrandsAndCategories = async () => {
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("access") || localStorage.getItem("token") || localStorage.getItem("shopzone_token") || localStorage.getItem("admin_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [brandsRes, categoriesRes, storesRes] = await Promise.all([
        fetch(BRANDS_URL, { headers }),
        fetch(CATEGORIES_URL, { headers }),
        fetch(STORES_URL, { headers }),
      ]);
      const brandsData = await brandsRes.json();
      const categoriesData = await categoriesRes.json();
      const storesData = await storesRes.json();
      setBrands(brandsData.results || brandsData.brands || brandsData || []);
      setCategories(categoriesData.results || categoriesData.categories || categoriesData || []);
      const loadedStores = storesData.results || storesData.stores || storesData || [];
      setStores(loadedStores);
      if (loadedStores.length > 0) {
        setForm(prev => ({ ...prev, store: prev.store || String(loadedStores[0].id) }));
      }
    } catch (err) {
      console.error("BRAND/CATEGORY/STORE FETCH ERROR:", err);
      setBrands([]);
      setCategories([]);
      setStores([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchBrandsAndCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images" && files && files.length) {
      const selectedImages = Array.from(files);
      setForm({ ...form, images: selectedImages });
      setPreviews(selectedImages.map(file => URL.createObjectURL(file)));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleAddBrand = async () => {
    const name = newBrand.trim();
    if (!name) return setMsg({ type: "error", text: "❌ Enter brand name." });
    setAddingBrand(true);
    setMsg({ type: "", text: "" });
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("access") || localStorage.getItem("token") || localStorage.getItem("shopzone_token") || localStorage.getItem("admin_token");
      const res = await fetch(BRANDS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || data.name?.[0] || JSON.stringify(data));
      setBrands(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(prev => ({ ...prev, brand: data.id }));
      setNewBrand("");
      setShowAddBrand(false);
      setMsg({ type: "success", text: `✅ Brand added: ${data.name}` });
    } catch (err) {
      setMsg({ type: "error", text: `❌ ${err.message}` });
    } finally { setAddingBrand(false); }
  };

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return setMsg({ type: "error", text: "❌ Enter category name." });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setAddingCategory(true);
    setMsg({ type: "", text: "" });
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("access") || localStorage.getItem("token") || localStorage.getItem("shopzone_token") || localStorage.getItem("admin_token");
      const res = await fetch(CATEGORIES_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name, slug, description: "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || data.name?.[0] || data.slug?.[0] || JSON.stringify(data));
      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(prev => ({ ...prev, category: data.id }));
      setNewCategory("");
      setShowAddCategory(false);
      setMsg({ type: "success", text: `✅ Category added: ${data.name}` });
    } catch (err) {
      setMsg({ type: "error", text: `❌ ${err.message}` });
    } finally { setAddingCategory(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    setMsg({ type: "", text: "" });
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("access") || localStorage.getItem("token") || localStorage.getItem("shopzone_token") || localStorage.getItem("admin_token");
      if (!form.store) throw new Error("Please select a Store.");
      if (!form.category) throw new Error("Please select a Category.");
      if (!form.brand) throw new Error("Please select a Brand.");
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("slug", form.slug);
      fd.append("sku", form.sku);
      fd.append("description", form.description || `${form.name} - Admin added - Prime delivery`);
      fd.append("price", form.price);
      if (form.original_price) fd.append("original_price", form.original_price);
      fd.append("stock", form.stock);
      fd.append("store", form.store);
      fd.append("category", form.category);
      fd.append("brand", form.brand);
      const res = await fetch(API_URL, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("PRODUCT CREATE ERROR:", err);
        throw new Error(typeof err === "object" ? JSON.stringify(err) : String(err));
      }
      const data = await res.json();
      if (form.images.length) {
        for (let i = 0; i < form.images.length; i++) {
          const imageForm = new FormData();
          imageForm.append("image", form.images[i]);
          imageForm.append("is_primary", i === 0 ? "true" : "false");
          const imageRes = await fetch(`${API_URL}${data.id}/images/`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: imageForm,
          });
          if (!imageRes.ok) {
            const imageErr = await imageRes.json().catch(() => ({}));
            console.error("PRODUCT IMAGE UPLOAD ERROR:", imageErr);
            throw new Error(`Product created, but image ${i + 1} failed: ${typeof imageErr === "object" ? JSON.stringify(imageErr) : String(imageErr)}`);
          }
        }
      }
      const selectedStore = stores.find(s => s.id === Number(form.store));
      const selectedCategory = categories.find(c => c.id === Number(form.category));
      const selectedBrand = brands.find(b => b.id === Number(form.brand));
      setMsg({ type: "success", text: `✅ Admin - Product Added! ID: ${data.id} - ${data.name} - Store: ${selectedStore?.name || form.store} - Brand: ${selectedBrand?.name || form.brand} - Category: ${selectedCategory?.name || form.category} - Images: ${form.images.length}` });
      setForm({ name: "", slug: "", sku: "", description: "", price: "", original_price: "", stock: 10, store: stores.length > 0 ? String(stores[0].id) : "", category: "", brand: "", images: [] });
      setPreviews([]);
      setShowAdd(false);
      fetchProducts();
    } catch (err) {
      setMsg({ type: "error", text: `❌ ${err.message}` });
    } finally { setAdding(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete product ID " + id + "?")) return;
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("access") || localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}${id}/`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Delete failed");
      setMsg({ type: "success", text: `Deleted ID ${id}` });
      fetchProducts();
    } catch (err) { setMsg({ type: "error", text: err.message }); }
  };

  return (
    <div className="min-h-screen bg-[#EAEDED] p-4">
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-[#232F3E] text-white p-4 rounded-t-lg flex justify-between items-center flex-wrap gap-2">
          <div>
            <h1 className="text-[20px] font-bold">Admin - Products - Add Product Yourself - DISTINCT</h1>
            <p className="text-[11px] mt-1">Admin Panel - File: src/pages/admin/AdminProducts.jsx - Total: {products.length} products</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(!showAdd)} className="bg-[#FFD814] text-black px-4 py-2 rounded-lg text-[13px] font-bold border border-[#FCD200]">{showAdd ? "Cancel" : "+ Add Product"}</button>
            <Link to="/admin" className="bg-white text-black px-4 py-2 rounded-lg text-[12px] border">Back to Admin</Link>
          </div>
        </div>
        <div className="bg-white p-4 border border-t-0 rounded-b-lg">
          {msg.text && <div className={`${msg.type === "success" ? "bg-[#E8F6EF] border-[#A4D4AE] text-[#067D62]" : "bg-[#FFF6F6] border-[#CC0C39]/30 text-[#CC0C39]"} border p-3 rounded-lg text-[12px] mb-4`}>{msg.text}</div>}
          {showAdd && (
            <div className="bg-[#f7fafa] border-2 border-[#FFD814] rounded-lg p-4 mb-6">
              <h2 className="font-bold text-[16px] mb-3">➕ Admin - Add Product - DISTINCT Category Logic</h2>
              <form onSubmit={handleAdd} className="space-y-3">
                <div>
                  <label className="text-[12px] font-bold">Product Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Samsung Galaxy S24 Ultra Mobile - 512GB - For /mobiles DISTINCT" className="w-full mt-1 border border-[#888] rounded-lg px-3 h-10 text-[13px] outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-bold">Slug *</label>
                    <input name="slug" value={form.slug} onChange={handleChange} required placeholder="asus-tuf-gaming-a15-fa506ncg-hn192ws" className="w-full mt-1 border rounded-lg px-3 h-10 text-[13px]" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold">SKU *</label>
                    <input name="sku" value={form.sku} onChange={handleChange} required placeholder="ASUS-TUF-A15-FA506NCG-HN192WS" className="w-full mt-1 border rounded-lg px-3 h-10 text-[13px]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-bold">Price * Rs</label>
                    <input name="price" type="number" value={form.price} onChange={handleChange} required placeholder="129999" className="w-full mt-1 border rounded-lg px-3 h-10 text-[13px]" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold">MRP (for discount)</label>
                    <input name="original_price" type="number" value={form.original_price} onChange={handleChange} placeholder="149999" className="w-full mt-1 border rounded-lg px-3 h-10 text-[13px]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-bold">Stock *</label>
                    <input name="stock" type="number" value={form.stock} onChange={handleChange} required className="w-full mt-1 border rounded-lg px-3 h-10 text-[13px]" />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold">Store *</label>
                    <select name="store" value={form.store} onChange={handleChange} required className="w-full mt-1 border rounded-lg px-3 h-10 text-[13px] bg-white">
                      <option value="">Select Store</option>
                      {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-bold">Brand *</label>
                    <div className="flex gap-2 mt-1">
                      <select name="brand" value={form.brand} onChange={handleChange} required className="flex-1 border rounded-lg px-3 h-10 text-[13px] bg-white">
                        <option value="">Select Brand</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                      <button type="button" onClick={() => setShowAddBrand(!showAddBrand)} className="px-3 h-10 bg-[#232F3E] text-white rounded-lg text-[12px] font-bold">+ Add</button>
                    </div>
                    {showAddBrand && (
                      <div className="flex gap-2 mt-2">
                        <input value={newBrand} onChange={e => setNewBrand(e.target.value)} placeholder="e.g. ASUS" className="flex-1 border rounded-lg px-3 h-9 text-[12px]" />
                        <button type="button" onClick={handleAddBrand} disabled={addingBrand} className="px-3 h-9 bg-[#FFD814] border border-[#FCD200] rounded-lg text-[11px] font-bold">{addingBrand ? "Adding..." : "Add Brand"}</button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[12px] font-bold">Category *</label>
                    <div className="flex gap-2 mt-1">
                      <select name="category" value={form.category} onChange={handleChange} required className="flex-1 border rounded-lg px-3 h-10 text-[13px] bg-white">
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <button type="button" onClick={() => setShowAddCategory(!showAddCategory)} className="px-3 h-10 bg-[#232F3E] text-white rounded-lg text-[12px] font-bold">+ Add</button>
                    </div>
                    {showAddCategory && (
                      <div className="flex gap-2 mt-2">
                        <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="e.g. Laptop" className="flex-1 border rounded-lg px-3 h-9 text-[12px]" />
                        <button type="button" onClick={handleAddCategory} disabled={addingCategory} className="px-3 h-9 bg-[#FFD814] border border-[#FCD200] rounded-lg text-[11px] font-bold">{addingCategory ? "Adding..." : "Add Category"}</button>
                      </div>
                    )}
                    <div className="bg-[#FFF3CD] border border-[#FFE69C] p-2 rounded mt-2 text-[11px]">
                      <p className="font-bold">📌 Admin - Category Mapping:</p>
                      <p>Select Laptop for laptops and Mobile Phones for phones.</p>
                      <p>Database IDs are handled automatically.</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-bold">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Premium quality - Admin added - Prime delivery" className="w-full mt-1 border rounded-lg px-3 py-2 text-[13px]"></textarea>
                </div>
                <div>
                  <label className="text-[12px] font-bold">Product Images *</label>
                  <input name="images" type="file" accept="image/*" multiple onChange={handleChange} className="w-full mt-1 border rounded-lg px-3 py-2 text-[12px]" />
                  {previews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {previews.map((src, i) => (
                        <div key={i} className="relative border rounded bg-[#f7fafa] p-1">
                          <img src={src} alt={`preview-${i + 1}`} className="h-[100px] w-full object-contain" />
                          {i === 0 && <span className="absolute top-1 left-1 bg-[#FFD814] text-black px-1 py-0.5 rounded text-[9px] font-bold">PRIMARY</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-[#565959] mt-1">Select multiple images at once. The first image will be the primary product image.</p>
                </div>
                <button disabled={adding} type="submit" className="w-full h-11 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-lg font-bold text-[14px] disabled:opacity-50">{adding ? "Adding Product & Images..." : "Add Product as Admin - DISTINCT"}</button>
              </form>
            </div>
          )}
          {loading ? (
            <div className="grid grid-cols-4 gap-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-[200px] bg-gray-100 animate-pulse rounded" />)}</div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-[16px]">All Products - {products.length} - Admin View - DISTINCT Check</h2>
                <span className="text-[11px] bg-[#f0f2f2] px-2 py-1 rounded">Backend: {BASE}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {products.map(p => (
                  <div key={p.id} className="border rounded-lg p-2 bg-white">
                    <img src={p.images?.[0]?.image ? (String(p.images[0].image).startsWith("http") ? p.images[0].image : `${BASE}${p.images[0].image}`) : PH} alt={p.name} className="h-[100px] w-full object-contain bg-[#f7fafa] rounded" onError={e => e.target.src = PH} />
                    <p className="text-[12px] mt-1 line-clamp-2 font-medium">{p.name}</p>
                    <p className="text-[11px] text-[#565959]">ID: {p.id} - Cat: {p.category} - Rs {p.price} - Images: {p.images?.length || 0}</p>
                    <div className="flex gap-1 mt-2">
                      <Link to={`/product/${p.id}`} className="flex-1 bg-[#f0f2f2] text-center py-1 rounded text-[10px]">View</Link>
                      <button onClick={() => handleDelete(p.id)} className="flex-1 bg-[#FFF6F6] border border-[#CC0C39]/20 text-[#CC0C39] py-1 rounded text-[10px]">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
              {products.length === 0 && <p className="text-center py-10 text-[13px] text-[#565959]">No products - Add first product using + Add Product button - Then it will show DISTINCT in categories</p>}
            </>
          )}
        </div>
        <div className="mt-4 bg-white border rounded-lg p-3 text-[11px]">
          <p className="font-bold">🎯 Admin - How to Add DISTINCT Products - Steps:</p>
          <p>1. Click + Add Product - Form khulega</p>
          <p>2. Select Store from the dropdown</p>
          <p>3. Select Brand from the dropdown or click + Add to create a new brand</p>
          <p>4. Select Category from the dropdown or click + Add to create a new category</p>
          <p>5. Select multiple product images at once - first image becomes primary</p>
          <p>6. Add Product - One product will be created with all selected images</p>
        </div>
      </div>
    </div>
  );
}