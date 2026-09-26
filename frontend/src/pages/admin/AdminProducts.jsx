import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const BASE = (import.meta.env.VITE_API_URL?.replace(/\/api.*$/, "") || "http://127.0.0.1:8000").replace(/\/$/, "");
const API_URL = `${BASE}/api/products/`;
const BRANDS_URL = `${BASE}/api/brands/`;
const CATEGORIES_URL = `${BASE}/api/categories/`;
const STORES_URL = `${BASE}/api/stores/`;
const PH = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300";

const getToken = () => localStorage.getItem("access_token") || localStorage.getItem("access") || localStorage.getItem("token") || localStorage.getItem("shopzone_token") || localStorage.getItem("admin_token") || "";

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
  const [showAddStore, setShowAddStore] = useState(false);
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newStore, setNewStore] = useState("");
  const [addingBrand, setAddingBrand] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingStore, setAddingStore] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const r = await fetch(API_URL);
      const d = await r.json();
      setProducts(Array.isArray(d.results)? d.results : Array.isArray(d.products)? d.products : Array.isArray(d)? d : []);
    } catch { setProducts([]); } finally { setLoading(false); }
  };

  const fetchBrandsAndCategories = async () => {
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const [brandsRes, categoriesRes, storesRes] = await Promise.all([
        fetch(BRANDS_URL, { headers }),
        fetch(CATEGORIES_URL, { headers }),
        fetch(STORES_URL, { headers }),
      ]);
      const brandsData = await brandsRes.json().catch(() => ({}));
      const categoriesData = await categoriesRes.json().catch(() => ({}));
      const storesData = await storesRes.json().catch(() => ({}));

      const loadedBrands = Array.isArray(brandsData.results)? brandsData.results : Array.isArray(brandsData.brands)? brandsData.brands : Array.isArray(brandsData)? brandsData : [];
      const loadedCategories = Array.isArray(categoriesData.results)? categoriesData.results : Array.isArray(categoriesData.categories)? categoriesData.categories : Array.isArray(categoriesData)? categoriesData : [];
      const loadedStores = Array.isArray(storesData.results)? storesData.results : Array.isArray(storesData.stores)? storesData.stores : Array.isArray(storesData)? storesData : [];

      setBrands(loadedBrands);
      setCategories(loadedCategories);
      setStores(loadedStores);

      if (!storesRes.ok) {
        console.error("STORE API ERROR:", storesData);
        setMsg({ type: "error", text: `❌ Store API: ${storesData.detail || JSON.stringify(storesData)}` });
        return;
      }
      if (loadedStores.length > 0 &&!form.store) {
        setForm(prev => ({...prev, store: String(loadedStores[0].id) }));
      }
    } catch (err) {
      console.error("FETCH ERROR:", err);
      setMsg({ type: "error", text: `❌ ${err.message}` });
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchBrandsAndCategories();
  }, []);

  // Auto-generate slug & sku from exact admin name - but name stays exact
  useEffect(() => {
    if (form.name &&!showAdd) return;
    if (form.name) {
      const baseSlug = form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (!form.slug || form.slug.startsWith(form.name.slice(0,3).toLowerCase()) || form.slug === "") {
        setForm(prev => ({...prev, slug: baseSlug, sku: baseSlug.toUpperCase().replace(/-/g, "_") + "-" + Date.now().toString().slice(-4) }));
      }
    }
  }, [form.name]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images" && files && files.length) {
      const selectedImages = Array.from(files);
      previews.forEach(u => URL.revokeObjectURL(u));
      setForm({...form, images: selectedImages });
      setPreviews(selectedImages.map(file => URL.createObjectURL(file)));
    } else {
      setForm({...form, [name]: value });
    }
  };

  // EXACT ADMIN GIVEN NAME -.trim() only, no lowercase on name
  const handleAddBrand = async () => {
    const name = newBrand.trim(); // exact as admin typed
    if (!name) return setMsg({ type: "error", text: "❌ Enter brand name." });
    setAddingBrand(true);
    try {
      const res = await fetch(BRANDS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || data.name?.[0] || JSON.stringify(data));
      setBrands(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(prev => ({...prev, brand: String(data.id) }));
      setNewBrand(""); setShowAddBrand(false);
      setMsg({ type: "success", text: `✅ Brand added: ${data.name} — exact as you typed` });
    } catch (err) { setMsg({ type: "error", text: `❌ ${err.message}` }); }
    finally { setAddingBrand(false); }
  };

  const handleAddCategory = async () => {
    const name = newCategory.trim(); // exact as admin typed
    if (!name) return setMsg({ type: "error", text: "❌ Enter category name." });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setAddingCategory(true);
    try {
      const res = await fetch(CATEGORIES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name, slug, description: "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || data.name?.[0] || data.slug?.[0] || JSON.stringify(data));
      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(prev => ({...prev, category: String(data.id) }));
      setNewCategory(""); setShowAddCategory(false);
      setMsg({ type: "success", text: `✅ Category added: ${data.name}` });
    } catch (err) { setMsg({ type: "error", text: `❌ ${err.message}` }); }
    finally { setAddingCategory(false); }
  };

  const handleAddStore = async () => {
    const name = newStore.trim(); // exact as admin typed - THIS IS YOUR MAIN FIX
    if (!name) return setMsg({ type: "error", text: "❌ Enter store name." });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setAddingStore(true);
    try {
      const res = await fetch(STORES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name, slug, city: "Delhi", address: name, description: `${name} - Admin created` }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || data.name?.[0] || JSON.stringify(data));
      setStores(prev => [...prev, data]);
      setForm(prev => ({...prev, store: String(data.id) }));
      setNewStore(""); setShowAddStore(false);
      setMsg({ type: "success", text: `✅ Store added: ${data.name} — exact as you typed` });
    } catch (err) { setMsg({ type: "error", text: `❌ ${err.message}` }); }
    finally { setAddingStore(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    setMsg({ type: "", text: "" });
    try {
      const token = getToken();
      if (!form.store) throw new Error("Please select a Store.");
      if (!form.category) throw new Error("Please select a Category.");
      if (!form.brand) throw new Error("Please select a Brand.");

      const fd = new FormData();
      fd.append("name", form.name.trim()); // exact admin name
      fd.append("slug", form.slug.trim());
      fd.append("sku", form.sku.trim());
      fd.append("description", form.description || `${form.name} - Admin added - Prime delivery`);
      fd.append("price", form.price);
      if (form.original_price) fd.append("original_price", form.original_price);
      fd.append("stock", form.stock);
      fd.append("store", form.store);
      fd.append("category", form.category);
      fd.append("brand", form.brand);

      const res = await fetch(API_URL, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(err));
      }
      const data = await res.json();

      if (form.images.length) {
        for (let i = 0; i < form.images.length; i++) {
          const imageForm = new FormData();
          imageForm.append("image", form.images[i]);
          imageForm.append("is_primary", i === 0? "true" : "false");
          const imageRes = await fetch(`${API_URL}${data.id}/images/`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: imageForm });
          if (!imageRes.ok) {
            const imageErr = await imageRes.json().catch(() => ({}));
            throw new Error(`Product created ID ${data.id}, but image ${i+1} failed: ${JSON.stringify(imageErr)}`);
          }
        }
      }

      const s = stores.find(s => s.id === Number(form.store));
      const c = categories.find(c => c.id === Number(form.category));
      const b = brands.find(b => b.id === Number(form.brand));
      setMsg({ type: "success", text: `✅ Added! ID:${data.id} Name:${data.name} Store:${s?.name || form.store} Brand:${b?.name || form.brand} Category:${c?.name || form.category} Images:${form.images.length} - All exact as admin typed` });

      previews.forEach(u => URL.revokeObjectURL(u));
      setForm({ name: "", slug: "", sku: "", description: "", price: "", original_price: "", stock: 10, store: stores.length>0? String(stores[0].id) : "", category: "", brand: "", images: [] });
      setPreviews([]);
      setShowAdd(false);
      fetchProducts();
    } catch (err) { setMsg({ type: "error", text: `❌ ${err.message}` }); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete product ID " + id + "?")) return;
    try {
      const res = await fetch(`${API_URL}${id}/`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
      if (!res.ok) throw new Error("Delete failed");
      setMsg({ type: "success", text: `Deleted ID ${id}` });
      fetchProducts();
    } catch (err) { setMsg({ type: "error", text: err.message }); }
  };

  return (
    <div className="min-h-screen bg-[#EAEDED] p-4">
      <div className="max-w- mx-auto">
        <div className="bg-[#232F3E] text-white p-4 rounded-t-lg flex justify-between items-center flex-wrap gap-2">
          <div>
            <h1 className="text- font-bold">Admin - Products - Add Product Yourself - DISTINCT</h1>
            <p className="text- mt-1">File: src/pages/admin/AdminProducts.jsx - Total: {products.length} - Store/Brand/Category exact admin name</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(!showAdd)} className="bg-[#FFD814] text-black px-4 py-2 rounded-lg text- font-bold border border-[#FCD200]">{showAdd? "Cancel" : "+ Add Product"}</button>
            <Link to="/admin" className="bg-white text-black px-4 py-2 rounded-lg text- border">Back to Admin</Link>
          </div>
        </div>
        <div className="bg-white p-4 border border-t-0 rounded-b-lg">
          {msg.text && <div className={`${msg.type === "success"? "bg-[#E8F6EF] border-[#A4D4AE] text-[#067D62]" : "bg-[#FFF6F6] border-[#CC0C39]/30 text-[#CC0C39]"} border p-3 rounded-lg text- mb-4 break-all`}>{msg.text}</div>}
          {showAdd && (
            <div className="bg-[#f7fafa] border-2 border-[#FFD814] rounded-lg p-4 mb-6">
              <h2 className="font-bold text- mb-3">➕ Admin - Add Product - Exact Name Logic</h2>
              <form onSubmit={handleAdd} className="space-y-3">
                <div>
                  <label className="text- font-bold">Product Name * — exact as admin types</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Samsung Galaxy S24 Ultra" className="w-full mt-1 border border-[#888] rounded-lg px-3 h-10 text-" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text- font-bold">Slug * (auto from name)</label><input name="slug" value={form.slug} onChange={handleChange} required className="w-full mt-1 border rounded-lg px-3 h-10 text-" /></div>
                  <div><label className="text- font-bold">SKU * (auto)</label><input name="sku" value={form.sku} onChange={handleChange} required className="w-full mt-1 border rounded-lg px-3 h-10 text-" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text- font-bold">Price * Rs</label><input name="price" type="number" value={form.price} onChange={handleChange} required className="w-full mt-1 border rounded-lg px-3 h-10 text-" /></div>
                  <div><label className="text- font-bold">MRP</label><input name="original_price" type="number" value={form.original_price} onChange={handleChange} className="w-full mt-1 border rounded-lg px-3 h-10 text-" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text- font-bold">Stock *</label><input name="stock" type="number" value={form.stock} onChange={handleChange} required className="w-full mt-1 border rounded-lg px-3 h-10 text-" /></div>
                  <div>
                    <label className="text- font-bold">Store * — exact admin name</label>
                    <div className="flex gap-2 mt-1">
                      <select name="store" value={form.store} onChange={handleChange} required className="flex-1 border rounded-lg px-3 h-10 text- bg-white"><option value="">Select Store</option>{stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                      <button type="button" onClick={() => setShowAddStore(!showAddStore)} className="px-3 h-10 bg-[#232F3E] text-white rounded-lg text- font-bold">+ Add</button>
                    </div>
                    {showAddStore && <div className="flex gap-2 mt-2"><input value={newStore} onChange={e => setNewStore(e.target.value)} placeholder="e.g. My Delhi Shop - Exact Name" className="flex-1 border rounded-lg px-3 h-9 text-" /><button type="button" onClick={handleAddStore} disabled={addingStore} className="px-3 h-9 bg-[#FFD814] border rounded-lg text- font-bold">{addingStore? "..." : "Add Store"}</button></div>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text- font-bold">Brand * — exact</label>
                    <div className="flex gap-2 mt-1">
                      <select name="brand" value={form.brand} onChange={handleChange} required className="flex-1 border rounded-lg px-3 h-10 text- bg-white"><option value="">Select Brand</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
                      <button type="button" onClick={() => setShowAddBrand(!showAddBrand)} className="px-3 h-10 bg-[#232F3E] text-white rounded-lg text- font-bold">+ Add</button>
                    </div>
                    {showAddBrand && <div className="flex gap-2 mt-2"><input value={newBrand} onChange={e => setNewBrand(e.target.value)} placeholder="e.g. SAMSUNG - exact" className="flex-1 border rounded-lg px-3 h-9 text-" /><button type="button" onClick={handleAddBrand} disabled={addingBrand} className="px-3 h-9 bg-[#FFD814] border rounded-lg text- font-bold">{addingBrand? "..." : "Add Brand"}</button></div>}
                  </div>
                  <div>
                    <label className="text- font-bold">Category * — exact</label>
                    <div className="flex gap-2 mt-1">
                      <select name="category" value={form.category} onChange={handleChange} required className="flex-1 border rounded-lg px-3 h-10 text- bg-white"><option value="">Select Category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                      <button type="button" onClick={() => setShowAddCategory(!showAddCategory)} className="px-3 h-10 bg-[#232F3E] text-white rounded-lg text- font-bold">+ Add</button>
                    </div>
                    {showAddCategory && <div className="flex gap-2 mt-2"><input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="e.g. Mobile Phones - exact" className="flex-1 border rounded-lg px-3 h-9 text-" /><button type="button" onClick={handleAddCategory} disabled={addingCategory} className="px-3 h-9 bg-[#FFD814] border rounded-lg text- font-bold">{addingCategory? "..." : "Add Category"}</button></div>}
                  </div>
                </div>
                <div><label className="text- font-bold">Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={2} className="w-full mt-1 border rounded-lg px-3 py-2 text-"></textarea></div>
                <div>
                  <label className="text- font-bold">Product Images *</label>
                  <input name="images" type="file" accept="image/*" multiple onChange={handleChange} className="w-full mt-1 border rounded-lg px-3 py-2 text-" />
                  {previews.length > 0 && <div className="grid grid-cols-4 gap-2 mt-2">{previews.map((src, i) => <div key={i} className="relative border rounded bg-[#f7fafa] p-1"><img src={src} alt="" className="h- w-full object-contain" />{i===0 && <span className="absolute top-1 left-1 bg-[#FFD814] text-black px-1 rounded text- font-bold">PRIMARY</span>}</div>)}</div>}
                </div>
                <button disabled={adding} type="submit" className="w-full h-11 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-lg font-bold text-">{adding? "Adding..." : "Add Product - Exact Admin Name"}</button>
              </form>
            </div>
          )}
          {loading? <div className="grid grid-cols-4 gap-3">{Array.from({length:8}).map((_,i)=><div key={i} className="h- bg-gray-100 animate-pulse rounded" />)}</div> : (
            <>
              <div className="flex justify-between mb-3"><h2 className="font-bold">All Products - {products.length}</h2><span className="text- bg-[#f0f2f2] px-2 py-1 rounded">{BASE}</span></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {products.map(p => (
                  <div key={p.id} className="border rounded-lg p-2 bg-white">
                    <img src={p.images?.[0]?.image? (String(p.images[0].image).startsWith("http")? p.images[0].image : `${BASE}${p.images[0].image}`) : PH} alt={p.name} className="h- w-full object-contain bg-[#f7fafa] rounded" onError={e=>e.target.src=PH} />
                    <p className="text- mt-1 line-clamp-2 font-medium">{p.name}</p>
                    <p className="text- text-[#565959]">ID:{p.id} - Rs {p.price}</p>
                    <div className="flex gap-1 mt-2"><Link to={`/product/${p.id}`} className="flex-1 bg-[#f0f2f2] text-center py-1 rounded text-">View</Link><button onClick={()=>handleDelete(p.id)} className="flex-1 bg-[#FFF6F6] border text-[#CC0C39] py-1 rounded text-">Delete</button></div>
                  </div>
                ))}
              </div>
              {products.length===0 && <p className="text-center py-10 text- text-[#565959]">No products - Add first product using + Add Product</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}