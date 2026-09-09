import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const BASE = (import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://127.0.0.1:8000").replace(/\/$/, "");
const API_URL = `${BASE}/api/products/`;
const PH = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300";

const CATEGORIES = [
  { id: 1, name: "Electronics - ID 1 - Mobiles, Laptops, TV, Headphones", slug: "electronics" },
  { id: 2, name: "Fashion - ID 2 - Jeans, T-Shirts, Shoes, Bags", slug: "fashion" },
  { id: 3, name: "Home & Kitchen - ID 3 - Table, Bedsheet, Knife, Cooker", slug: "home-kitchen" },
  { id: 4, name: "Beauty - ID 4 - Lipstick, Shampoo, Perfume", slug: "beauty" },
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", original_price: "", stock: 10, category: 1, brand: "ShopZone", image: null });
  const [preview, setPreview] = useState("");
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

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

  useEffect(() => { fetchProducts(); }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      setForm({ ...form, image: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    setMsg({ type: "", text: "" });
    try {
      const token = localStorage.getItem("access") || localStorage.getItem("token") || localStorage.getItem("shopzone_token") || localStorage.getItem("admin_token");
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description || `${form.name} - Admin added - Prime delivery`);
      fd.append("price", form.price);
      if (form.original_price) fd.append("original_price", form.original_price);
      fd.append("stock", form.stock);
      fd.append("category", form.category);
      fd.append("brand", form.brand);
      if (form.image) fd.append("image", form.image);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.message || JSON.stringify(err) || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setMsg({ type: "success", text: `✅ Admin - Product Added! ID: ${data.id} - ${data.name} - Category ID ${form.category} - Will show in /category/${CATEGORIES.find(c => c.id === Number(form.category))?.slug} DISTINCT!` });
      setForm({ name: "", description: "", price: "", original_price: "", stock: 10, category: 1, brand: "ShopZone", image: null });
      setPreview("");
      setShowAdd(false);
      fetchProducts();
    } catch (err) {
      setMsg({ type: "error", text: `❌ ${err.message}` });
    } finally { setAdding(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete product ID " + id + "?")) return;
    try {
      const token = localStorage.getItem("access") || localStorage.getItem("token") || "";
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
                  <label className="text-[12px] font-bold">Product Name * - For Mobiles include word Mobile/Phone</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Samsung Galaxy S24 Ultra Mobile - 512GB - For /mobiles DISTINCT" className="w-full mt-1 border border-[#888] rounded-lg px-3 h-10 text-[13px] outline-none" />
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
                    <label className="text-[12px] font-bold">Brand</label>
                    <input name="brand" value={form.brand} onChange={handleChange} placeholder="Samsung, Nike" className="w-full mt-1 border rounded-lg px-3 h-10 text-[13px]" />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-bold">Category * - DISTINCT Logic</label>
                  <select name="category" value={form.category} onChange={handleChange} className="w-full mt-1 border rounded-lg px-3 h-10 text-[13px] bg-white">
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <div className="bg-[#FFF3CD] border border-[#FFE69C] p-2 rounded mt-2 text-[11px]">
                    <p className="font-bold">📌 Admin - Category Mapping:</p>
                    <p>ID 1 = Electronics + Mobiles - Name me Mobile/Phone likho toh /mobiles me DISTINCT ayega</p>
                    <p>ID 2 = Fashion - /category/fashion me DISTINCT</p>
                    <p>ID 3 = Home & Kitchen - /category/home-kitchen me DISTINCT</p>
                    <p>ID 4 = Beauty - /category/beauty me DISTINCT</p>
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-bold">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Premium quality - Admin added - Prime delivery" className="w-full mt-1 border rounded-lg px-3 py-2 text-[13px]"></textarea>
                </div>
                <div>
                  <label className="text-[12px] font-bold">Image *</label>
                  <input name="image" type="file" accept="image/*" onChange={handleChange} className="w-full mt-1 border rounded-lg px-3 py-2 text-[12px]" />
                  {preview && <img src={preview} alt="preview" className="mt-2 h-[100px] object-contain bg-[#f7fafa] border rounded" />}
                </div>
                <button disabled={adding} type="submit" className="w-full h-11 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-lg font-bold text-[14px] disabled:opacity-50">{adding ? "Adding..." : "Add Product as Admin - DISTINCT"}</button>
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
                    <img src={p.image ? (String(p.image).startsWith("http") ? p.image : `${BASE}${p.image}`) : PH} alt={p.name} className="h-[100px] w-full object-contain bg-[#f7fafa] rounded" onError={e => e.target.src = PH} />
                    <p className="text-[12px] mt-1 line-clamp-2 font-medium">{p.name}</p>
                    <p className="text-[11px] text-[#565959]">ID: {p.id} - Cat: {p.category} - Rs {p.price}</p>
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
          <p>2. Electronics ke liye: Name: Samsung Galaxy Mobile, Category: ID 1, Price: 129999</p>
          <p>3. Fashion ke liye: Name: Levis Jeans, Category: ID 2, Price: 3499</p>
          <p>4. Home ke liye: Name: Wooden Table, Category: ID 3, Price: 8999</p>
          <p>5. Add karne ke baad: /category/electronics me only ID 1 wale - DISTINCT from Fashion/Home</p>
          <p>6. /mobiles me only name me Mobile/Phone wale - DISTINCT</p>
          <p>7. Django Admin alternative: http://127.0.0.1:8000/admin/ - Products - Add</p>
        </div>
      </div>
    </div>
  );
}