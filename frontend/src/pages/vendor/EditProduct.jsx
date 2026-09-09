import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getVendorProducts, updateVendorProduct } from "../../services/vendorService";

const INITIAL_FORM = { category:"", brand:"", name:"", slug:"", sku:"", description:"", price:"", stock:"", status:"PUBLISHED", is_active:true };

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true); setError("");
      try {
        const data = await getVendorProducts();
        const products = Array.isArray(data)? data : Array.isArray(data?.results)? data.results : [];
        const product = products.find(item => String(item.id) === String(id));
        if (!product) { if (!cancelled) setError("Product not found."); return; }
        if (cancelled) return;
        setForm({
          category: product.category?? "",
          brand: product.brand?? "",
          name: product.name?? "",
          slug: product.slug?? "",
          sku: product.sku?? "",
          description: product.description?? "",
          price: product.price?? "",
          stock: product.stock?? "",
          status: product.status?? "PUBLISHED",
          is_active: product.is_active?? true,
        });
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || "Product load nahi ho paaya.");
      } finally { if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({...p, [name]: type==="checkbox"? checked : value }));
    setError(""); setSuccess("");
  };

  const slugify = (v) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm(p => {
      const gen = slugify(name);
      const prevGen = slugify(p.name);
      const should =!p.slug || p.slug===prevGen;
      return {...p, name, slug: should? gen : p.slug };
    });
    setError(""); setSuccess("");
  };

  const validateForm = () => {
    const category = Number(form.category);
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!Number.isInteger(category) || category<=0) return "Please enter a valid Category ID.";
    if (!form.name.trim()) return "Product name is required.";
    if (!form.slug.trim()) return "Product slug is required.";
    if (!form.sku.trim()) return "SKU is required.";
    if (!form.description.trim()) return "Product description is required.";
    if (!Number.isFinite(price) || price<0) return "Please enter a valid product price.";
    if (!Number.isInteger(stock) || stock<0) return "Stock must be whole number >=0.";
    if (!["DRAFT","PUBLISHED","OUT_OF_STOCK"].includes(form.status)) return "Please select valid status.";
    if (form.brand!=="" && (!Number.isInteger(Number(form.brand)) || Number(form.brand)<=0)) return "Please enter valid Brand ID.";
    return "";
  };

  const formatApiError = (err) => {
    const data = err.response?.data;
    if (!data) return err.message || "Product update nahi ho paaya.";
    if (typeof data==="string") return data;
    if (data.detail) return Array.isArray(data.detail)? data.detail.join(", ") : String(data.detail);
    return Object.entries(data).map(([f,m])=>`${f}: ${Array.isArray(m)? m.join(", ") : String(m)}`).join(" | ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    const v = validateForm();
    if (v) { setError(v); return; }
    setSaving(true);
    try {
      const productData = {
        category: Number(form.category),
        name: form.name.trim(),
        slug: form.slug.trim(),
        sku: form.sku.trim(),
        description: form.description.trim(),
        price: Number(form.price).toFixed(2),
        stock: Number(form.stock),
        status: form.status,
        is_active: form.is_active,
        brand: form.brand!==""? Number(form.brand) : null,
      };
      await updateVendorProduct(id, productData);
      setSuccess("Product updated successfully.");
      setTimeout(()=>navigate("/vendor/products"), 1000);
    } catch (err) {
      setError(formatApiError(err));
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="bg-[#EAEDED] min-h-screen p-4">
        <div className="max-w- mx-auto">
          <div className="h-16 bg-white border border-[#d5d9d9] rounded- mb-3 animate-pulse" />
          <div className="h- bg-white border border-[#d5d9d9] rounded- animate-pulse" />
        </div>
      </div>
    );
  }

  if (error &&!form.name) {
    return (
      <div className="bg-[#EAEDED] min-h-screen p-4 grid place-items-center">
        <div className="bg-white border border-[#d5d9d9] rounded- p-8 text-center max-w- shadow-sm">
          <div className="text-4xl mb-2">📦</div>
          <h2 className="font-bold">Product Not Found</h2>
          <p className="text- text-[#565959] mt-1">{error}</p>
          <Link to="/vendor/products" className="mt-4 inline-flex h-8 px-4 bg-[#131921] text-white rounded- text- items-center">Back to Products</Link>
        </div>
      </div>
    );
  }

  const Input = ({ label, id, required,...props }) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text- font-bold uppercase">{label}{required && <span className="text-[#CC0C39] ml-0.5">*</span>}</label>
      <input id={id} {...props} className="h-8 px-2 border border-[#a6a6a6] rounded- text- outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,.5)]" />
    </div>
  );

  return (
    <div className="bg-[#EAEDED] min-h-screen py-2">
      <div className="max-w- mx-auto px-2">
        <div className="bg-white border border-[#d5d9d9] rounded- p-4 flex justify-between items-center shadow-sm">
          <div>
            <div className="text- font-bold uppercase text-[#C45500]">AMAZON SELLER CENTRAL • EDIT MODE</div>
            <h1 className="text- font-bold">Edit Product #{id}</h1>
            <p className="text- text-[#565959]">Update your product information.</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/vendor/products/${id}`} className="h-8 px-3 bg-white border border-[#d5d9d9] rounded- text- grid place-items-center shadow-sm">View Live</Link>
            <Link to="/vendor/products" className="h-8 px-3 bg-white border border-[#d5d9d9] rounded- text- grid place-items-center shadow-sm">← Back</Link>
          </div>
        </div>

        {error && <div className="mt-2 bg-white border-l-4 border-[#c40000] p-3 text- text-[#c40000] shadow-sm">⚠ {error}</div>}
        {success && <div className="mt-2 bg-white border-l-4 border-[#067D62] p-3 text- text-[#067D62] shadow-sm flex justify-between">✓ {success}<span className="text-">Redirecting...</span></div>}

        <div className="mt-2 bg-white border border-[#d5d9d9] rounded- p-5 shadow-sm">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text- font-bold uppercase">Product Name *</label>
                <input name="name" type="text" value={form.name} onChange={handleNameChange} disabled={saving} maxLength={255} required className="h-8 px-2 border border-[#a6a6a6] rounded- text- font-medium outline-none" />
                <span className="text- text-[#767676]">{form.name.length}/255</span>
              </div>
              <Input label="SKU" id="sku" name="sku" type="text" value={form.sku} onChange={handleChange} disabled={saving} maxLength={100} required placeholder="IPHONE15-128-BLK" />
              <Input label="Category ID" id="category" name="category" type="number" min="1" step="1" value={form.category} onChange={handleChange} disabled={saving} required />
              <Input label="Brand ID" id="brand" name="brand" type="number" min="1" step="1" value={form.brand} onChange={handleChange} disabled={saving} placeholder="Optional" />
              <Input label="Price (₹)" id="price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} disabled={saving} required />
              <Input label="Stock Qty" id="stock" name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} disabled={saving} required />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text- font-bold uppercase">Slug (URL) *</label>
              <div className="flex gap-2">
                <input name="slug" type="text" value={form.slug} onChange={handleChange} disabled={saving} maxLength={255} required className="flex-1 h-8 px-2 border border-[#a6a6a6] rounded- text- bg-[#f0f2f2] outline-none" />
                <button type="button" onClick={()=>setForm(p=>({...p, slug: form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")}))} className="h-8 px-3 bg-white border border-[#d5d9d9] rounded- text- shadow-sm">Regenerate</button>
              </div>
              <span className="text- text-[#565959]">Preview: <code className="bg-[#f0f2f2] px-1 rounded">/products/{form.slug || "your-product-slug"}</code></span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text- font-bold uppercase">Description *</label>
              <textarea name="description" rows={5} value={form.description} onChange={handleChange} disabled={saving} maxLength={5000} required placeholder="Describe features, material, warranty..." className="p-2 border border-[#a6a6a6] rounded- text- outline-none resize-y" />
              <div className="flex justify-between text- text-[#767676]"><span>{form.description.length}/5000 characters</span><span>{form.description.length<50? "Add more details" : "✓ Good length"}</span></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-[#f0f2f2] border border-[#d5d9d9] rounded-">
              <div className="flex flex-col gap-1">
                <label className="text- font-bold uppercase">Status</label>
                <select name="status" value={form.status} onChange={handleChange} disabled={saving} className="h-8 px-2 border border-[#a6a6a6] rounded- bg-white text- outline-none">
                  <option value="PUBLISHED">Published - Live on store</option>
                  <option value="DRAFT">Draft - Hidden</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>
              <label className="flex items-center gap-2 h-8 px-3 bg-white border border-[#d5d9d9] rounded- mt-5 cursor-pointer">
                <input name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} disabled={saving} className="w-4 h-4 accent-[#e77600]" />
                <span className="text- font-bold">Product is active & visible</span>
              </label>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#e7e7e7]">
              <div className="text- text-[#767676]">Last updated: Just now</div>
              <div className="flex gap-2">
                <Link to="/vendor/products" className="h-8 px-4 grid place-items-center bg-white border border-[#d5d9d9] rounded- text- shadow-sm">Cancel</Link>
                <button type="submit" disabled={saving} className="h-8 px-5 bg-[#FFD814] border border-[#FCD200] rounded- text- shadow-sm disabled:opacity-50 font-bold">
                  {saving? "Saving..." : "💾 Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-2 p-3 bg-[#fef8f2] border border-[#f3a847] rounded- text- text-[#C45500]">💡 <strong>Amazon Seller Tip:</strong> Good slug + detailed description improves ranking. Keep price competitive.</div>
      </div>
    </div>
  );
}

export default EditProduct;