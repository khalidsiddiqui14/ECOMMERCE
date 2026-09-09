import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createVendorProduct, uploadVendorProductImage } from "../../services/vendorService";

const MAX_IMAGES = 4;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg","image/png","image/webp"];

function VendorProductCreate() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({ category:"", brand:"", name:"", slug:"", sku:"", description:"", price:"", stock:"", status:"DRAFT", is_active:true });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { return () => { previews.forEach(p=>URL.revokeObjectURL(p)); }; }, [previews]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({...prev, [name]: type==="checkbox"? checked : value}));
    if (error) setError("");
  };
  const handleNameChange = (e) => {
    setFormData(prev => ({...prev, name: e.target.value}));
    if (error) setError("");
  };
  const handleImageChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setError("");
    const invalid = selected.find(f=>!ALLOWED_IMAGE_TYPES.includes(f.type));
    if (invalid) { setError(`"${invalid.name}" is not supported. Use JPG, PNG or WEBP.`); e.target.value=""; return; }
    const oversized = selected.find(f=>f.size>MAX_IMAGE_SIZE);
    if (oversized) { setError(`"${oversized.name}" is larger than 5 MB.`); e.target.value=""; return; }
    const limited = selected.slice(0, MAX_IMAGES);
    if (selected.length>MAX_IMAGES) setError(`Only ${MAX_IMAGES} images can be selected.`);
    previews.forEach(p=>URL.revokeObjectURL(p));
    setImages(limited);
    setPreviews(limited.map(f=>URL.createObjectURL(f)));
    e.target.value="";
  };
  const removeImage = (idx) => {
    const p = previews[idx];
    if (p) URL.revokeObjectURL(p);
    setImages(prev=>prev.filter((_,i)=>i!==idx));
    setPreviews(prev=>prev.filter((_,i)=>i!==idx));
    if (error) setError("");
  };
  const validateForm = () => {
    const category = Number(formData.category);
    const price = Number(formData.price);
    const stock = Number(formData.stock);
    if (!Number.isInteger(category) || category<=0) return "Please enter a valid Category ID.";
    if (!formData.name.trim()) return "Product name is required.";
    if (!formData.slug.trim()) return "Product slug is required.";
    if (!formData.sku.trim()) return "SKU is required.";
    if (!formData.description.trim()) return "Product description is required.";
    if (!Number.isFinite(price) || price<0) return "Please enter a valid product price.";
    if (!Number.isInteger(stock) || stock<0) return "Stock must be whole number >=0.";
    if (!["DRAFT","PUBLISHED","OUT_OF_STOCK"].includes(formData.status)) return "Please select valid status.";
    return "";
  };
  const formatApiError = (err) => {
    const d = err.response?.data;
    if (!d) return err.message || "Product create nahi ho paaya.";
    if (typeof d==="string") return d;
    if (d.detail) return Array.isArray(d.detail)? d.detail.join(", ") : String(d.detail);
    return Object.entries(d).map(([f,m])=>`${f}: ${Array.isArray(m)?m.join(", "):String(m)}`).join(" | ");
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    const ve = validateForm();
    if (ve) { setError(ve); return; }
    setLoading(true);
    try {
      const productData = {
        category: Number(formData.category),
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        sku: formData.sku.trim(),
        description: formData.description.trim(),
        price: Number(formData.price).toFixed(2),
        stock: Number(formData.stock),
        status: formData.status,
        is_active: formData.is_active,
        brand: formData.brand? Number(formData.brand) : null,
      };
      const product = await createVendorProduct(productData);
      if (!product?.id) throw new Error("Product ID was not returned by server.");
      for (let i=0;i<images.length;i++) {
        const fd = new FormData();
        fd.append("image", images[i]);
        fd.append("is_primary", i===0? "true" : "false");
        await uploadVendorProductImage(product.id, fd);
      }
      setSuccess(images.length>0? "Product and images created successfully." : "Product created successfully.");
      setFormData({ category:"", brand:"", name:"", slug:"", sku:"", description:"", price:"", stock:"", status:"DRAFT", is_active:true });
      previews.forEach(p=>URL.revokeObjectURL(p));
      setImages([]); setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value="";
      setTimeout(()=>navigate("/vendor/products"), 1200);
    } catch (err) {
      setError(formatApiError(err));
    } finally { setLoading(false); }
  };

  const slugify = (v) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");

  return (
    <div className="bg-[#EAEDED] min-h-screen py-2">
      <div className="max-w-[900px] mx-auto px-2">
        <div className="bg-white border border-[#d5d9d9] rounded-[8px] p-4 flex justify-between items-center shadow-sm">
          <div>
            <div className="text-[10px] font-bold uppercase text-[#C45500]">SELLER CENTRAL • CREATE NEW LISTING</div>
            <h1 className="text-[18px] font-bold">Add a Product</h1>
            <p className="text-[12px] text-[#565959]">Add a new product to your store. Amazon quality images = more sales.</p>
          </div>
          <Link to="/vendor/products" className="h-8 px-3 bg-white border border-[#d5d9d9] rounded-[8px] text-[12px] grid place-items-center shadow-sm">← Back to Products</Link>
        </div>

        {error && <div className="mt-2 bg-white border-l-4 border-[#c40000] p-3 text-[13px] text-[#c40000] shadow-sm">⚠ {error}</div>}
        {success && <div className="mt-2 bg-white border-l-4 border-[#067D62] p-3 text-[13px] text-[#067D62] shadow-sm flex justify-between">✓ {success}<span className="text-[11px]">Redirecting...</span></div>}

        <div className="mt-2 bg-white border border-[#d5d9d9] rounded-[8px] shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex border-b border-[#e7e7e7]">
              {[{n:'1',t:'Information',active:true},{n:'2',t:'Images'},{n:'3',t:'Settings'}].map(s=>(
                <div key={s.n} className={`flex-1 p-3 flex items-center gap-2 text-[12px] font-bold border-r border-[#e7e7e7] ${s.active? 'bg-[#f0f2f2] text-[#0F1111]' : 'bg-[#fff] text-[#565959]'}`}>
                  <span className={`w-5 h-5 rounded-full grid place-items-center text-[10px] ${s.active? 'bg-[#131921] text-white' : 'bg-[#e7e7e7]'}`}>{s.n}</span>{s.t}
                </div>
              ))}
            </div>

            <div className="p-5">
              <div className="mb-6">
                <h2 className="font-bold text-[14px] flex items-center gap-2"><span className="w-6 h-6 rounded-[4px] bg-[#131921] text-white grid place-items-center text-[12px]">📦</span> Product Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold uppercase">Product Name *</label>
                    <input name="name" value={formData.name} onChange={handleNameChange} placeholder="Bluetooth Speaker" className="h-8 px-2 border border-[#a6a6a6] rounded-[3px] text-[12px] outline-none bg-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold uppercase">SKU *</label>
                    <input name="sku" value={formData.sku} onChange={handleChange} placeholder="BS-002" className="h-8 px-2 border border-[#a6a6a6] rounded-[3px] text-[12px] outline-none bg-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold uppercase">Slug *</label>
                    <div className="flex gap-2">
                      <input name="slug" value={formData.slug} onChange={handleChange} placeholder="bluetooth-speaker" className="flex-1 h-8 px-2 border border-[#a6a6a6] rounded-[3px] text-[12px] bg-white" />
                      <button type="button" onClick={()=>setFormData(p=>({...p, slug: slugify(p.name || p.slug)}))} className="h-8 px-2 bg-[#f0f2f2] border border-[#d5d9d9] rounded-[4px] text-[10px] font-bold">Auto</button>
                    </div>
                    <span className="text-[10px] text-[#565959]">/products/{formData.slug || 'slug'}</span>
                  </div>
                  <div className="flex flex-col gap-1"><label className="text-[11px] font-bold uppercase">Category ID *</label><input name="category" value={formData.category} onChange={handleChange} type="number" placeholder="1" className="h-8 px-2 border border-[#a6a6a6] rounded-[3px] text-[12px]" /></div>
                  <div className="flex flex-col gap-1"><label className="text-[11px] font-bold uppercase">Brand ID</label><input name="brand" value={formData.brand} onChange={handleChange} type="number" placeholder="Optional" className="h-8 px-2 border border-[#a6a6a6] rounded-[3px] text-[12px]" /></div>
                  <div className="flex flex-col gap-1"><label className="text-[11px] font-bold uppercase">Price *</label><input name="price" value={formData.price} onChange={handleChange} type="number" placeholder="2499.00" className="h-8 px-2 border border-[#a6a6a6] rounded-[3px] text-[12px]" /></div>
                  <div className="flex flex-col gap-1"><label className="text-[11px] font-bold uppercase">Stock *</label><input name="stock" value={formData.stock} onChange={handleChange} type="number" placeholder="15" className="h-8 px-2 border border-[#a6a6a6] rounded-[3px] text-[12px]" /></div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold uppercase">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} disabled={loading} className="h-8 px-2 border border-[#a6a6a6] rounded-[3px] bg-white text-[12px] outline-none">
                      <option value="DRAFT">Draft - Hidden</option>
                      <option value="PUBLISHED">Published - Live</option>
                      <option value="OUT_OF_STOCK">Out of Stock</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1 mt-3">
                  <label className="text-[11px] font-bold uppercase">Description *</label>
                  <textarea name="description" rows={5} placeholder="Enter product description..." value={formData.description} onChange={handleChange} disabled={loading} maxLength={5000} required className="p-2 border border-[#a6a6a6] rounded-[3px] text-[12px] outline-none resize-y" />
                  <div className="flex justify-between text-[11px] text-[#767676]"><span>{formData.description.length}/5000 characters</span><span>{formData.description.length<50? "Add more for SEO" : "✓ Good"}</span></div>
                </div>
              </div>

              <div className="mb-6 p-3 bg-[#f0f2f2] border border-[#d5d9d9] rounded-[8px]">
                <h2 className="font-bold text-[13px] flex items-center gap-2"><span className="w-5 h-5 rounded-[4px] bg-[#131921] text-white grid place-items-center text-[11px]">🖼</span> Product Images • {images.length}/{MAX_IMAGES} • First = Primary</h2>
                <label htmlFor="product-image" className="mt-3 flex flex-col items-center justify-center gap-2 p-6 bg-white border-2 border-dashed border-[#d5d9d9] rounded-[8px] cursor-pointer text-center">
                  <div className="w-10 h-10 rounded-[8px] bg-[#f0f2f2] border grid place-items-center">⬆</div>
                  <span className="text-[12px] font-bold">Choose Files or Drag & Drop</span>
                  <small className="text-[11px] text-[#565959]">Select up to {MAX_IMAGES} JPG, PNG or WEBP (max 5 MB each)</small>
                  <span className="mt-1 h-7 px-3 grid place-items-center bg-white border border-[#d5d9d9] rounded-[8px] text-[11px] shadow-sm">Browse Files</span>
                </label>
                <input ref={fileInputRef} id="product-image" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageChange} disabled={loading} className="hidden" />
                {previews.length>0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {previews.map((preview,index)=>(
                      <div key={preview} className="relative aspect-square rounded-[4px] overflow-hidden border border-[#d5d9d9] bg-white">
                        <img src={preview} alt={`Preview ${index+1}`} className="w-full h-full object-cover" />
                        {index===0 && <span className="absolute top-1 left-1 bg-[#131921] text-white text-[8px] font-bold px-1 rounded">PRIMARY</span>}
                        <button type="button" onClick={()=>removeImage(index)} className="absolute top-1 right-1 w-5 h-5 bg-black/70 text-white rounded-full text-[10px]">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-2 p-3 bg-white border border-[#d5d9d9] rounded-[8px] flex justify-between items-center">
                <div><h2 className="font-bold text-[12px]">Product Settings ⚙</h2><p className="text-[11px] text-[#565959]">Active products are visible immediately after publishing.</p></div>
                <label className={`flex items-center gap-2 px-3 py-1 rounded-full border cursor-pointer ${formData.is_active? 'bg-[#f0fdf4] border-[#bbf7d0]' : 'bg-[#fef2f2] border-[#fecaca]'}`}>
                  <input name="is_active" type="checkbox" checked={formData.is_active} onChange={handleChange} disabled={loading} className="w-4 h-4 accent-[#e77600]" />
                  <span className="text-[11px] font-bold">{formData.is_active? "✓ Active & Visible" : "✕ Hidden"}</span>
                </label>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#f0f2f2] border-t border-[#d5d9d9]">
              <div className="text-[11px] text-[#565959]">💡 Tip: HD images + detailed desc = +40% more sales.</div>
              <div className="flex gap-2">
                <button type="button" onClick={()=>navigate("/vendor/products")} disabled={loading} className="h-8 px-4 bg-white border border-[#d5d9d9] rounded-[8px] text-[12px] shadow-sm">Cancel</button>
                <button type="submit" disabled={loading} className="h-8 px-5 bg-[#FFD814] border border-[#FCD200] rounded-[8px] text-[13px] font-bold shadow-sm disabled:opacity-50">
                  {loading? "Creating..." : "➕ Add Product"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default VendorProductCreate;