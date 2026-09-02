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
        const products = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
        const product = products.find(item => String(item.id) === String(id));
        if (!product) { if (!cancelled) setError("Product not found."); return; }
        if (cancelled) return;
        setForm({
          category: product.category ?? "",
          brand: product.brand ?? "",
          name: product.name ?? "",
          slug: product.slug ?? "",
          sku: product.sku ?? "",
          description: product.description ?? "",
          price: product.price ?? "",
          stock: product.stock ?? "",
          status: product.status ?? "PUBLISHED",
          is_active: product.is_active ?? true,
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
    setForm(p => ({ ...p, [name]: type==="checkbox" ? checked : value }));
    setError(""); setSuccess("");
  };

  const slugify = (v) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm(p => {
      const gen = slugify(name);
      const prevGen = slugify(p.name);
      const should = !p.slug || p.slug===prevGen;
      return { ...p, name, slug: should ? gen : p.slug };
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
    if (data.detail) return Array.isArray(data.detail) ? data.detail.join(", ") : String(data.detail);
    return Object.entries(data).map(([f,m])=>`${f}: ${Array.isArray(m) ? m.join(", ") : String(m)}`).join(" | ");
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
        brand: form.brand!=="" ? Number(form.brand) : null,
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
      <main style={{minHeight:'100vh',background:'#fafaf7',padding:'24px'}}>
        <div style={{maxWidth:900,margin:'0 auto'}}>
          <div style={{height:80,background:'#fff',border:'1px solid #ece8de',borderRadius:20,marginBottom:16,animation:'pulse 1.5s infinite'}} />
          <div style={{height:500,background:'#fff',border:'1px solid #ece8de',borderRadius:20,animation:'pulse 1.5s infinite'}} />
        </div>
      </main>
    );
  }

  if (error && !form.name) {
    return (
      <main style={{minHeight:'100vh',background:'#fafaf7',padding:'40px 24px',display:'grid',placeItems:'center'}}>
        <div style={{textAlign:'center',padding:40,background:'#fff',border:'1px solid #ece8de',borderRadius:24,maxWidth:420}}>
          <div style={{width:64,height:64,margin:'0 auto 12px',display:'grid',placeItems:'center',background:'#fef2f2',borderRadius:'50%',fontSize:28}}>📦</div>
          <h2 style={{margin:'0 0 8px',fontWeight:900}}>Product Not Found</h2>
          <p style={{color:'#8c8881',fontSize:13}}>{error}</p>
          <Link to="/vendor/products" style={{marginTop:16,minHeight:40,padding:'0 18px',display:'inline-flex',alignItems:'center',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none'}}>Back to Products</Link>
        </div>
      </main>
    );
  }

  const Input = ({ label, id, required, ...props }) => (
    <div className="form-group" style={{display:'flex',flexDirection:'column',gap:6}}>
      <label htmlFor={id} style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#1a1816'}}>{label}{required && <span style={{color:'#ef4444',marginLeft:2}}>*</span>}</label>
      <input id={id} {...props} style={{minHeight:44,padding:'0 14px',border:'1px solid #ece8de',borderRadius:12,background:'#fff',outline:'none',fontSize:13,transition:'.2s'}} />
    </div>
  );

  return (
    <main className="vendor-create-product-page" style={{minHeight:'100vh',background:'#fafaf7',padding:'24px'}}>
      <div className="vendor-container" style={{maxWidth:900,margin:'0 auto'}}>
        {/* Header like Flipkart Seller */}
        <div className="vendor-products-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16,marginBottom:20}}>
          <div>
            <span style={{display:'inline-flex',padding:'4px 10px',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:10,fontWeight:800,letterSpacing:'.06em',marginBottom:8}}>VENDOR PANEL • EDIT MODE</span>
            <h1 style={{margin:'0 0 6px',fontSize:'clamp(22px,3vw,28px)',fontWeight:900,letterSpacing:'-.02em'}}>Edit Product</h1>
            <p style={{margin:0,color:'#8c8881',fontSize:13}}>Update your product information. ID: <strong>#{id}</strong></p>
          </div>
          <div style={{display:'flex',gap:8}}>
            <Link to={`/vendor/products/${id}`} style={{minHeight:40,padding:'0 16px',display:'inline-flex',alignItems:'center',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:13,fontWeight:600,textDecoration:'none',color:'#1a1816'}}>View Live</Link>
            <Link to="/vendor/products" style={{minHeight:40,padding:'0 18px',display:'inline-flex',alignItems:'center',borderRadius:999,background:'#fff',border:'1px solid #ece8de',fontSize:13,fontWeight:600,textDecoration:'none',color:'#1a1816'}}>← Back to Products</Link>
          </div>
        </div>

        {error && <div role="alert" style={{padding:'12px 16px',marginBottom:16,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,color:'#991b1b',fontSize:13,fontWeight:600}}>⚠️ {error}</div>}
        {success && <div role="status" style={{padding:'12px 16px',marginBottom:16,background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,color:'#166534',fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:8}}>✓ {success}<span style={{marginLeft:'auto',fontSize:11}}>Redirecting...</span></div>}

        <div className="vendor-form-card" style={{background:'#fff',border:'1px solid #ece8de',borderRadius:20,padding:28,boxShadow:'0 4px 20px rgba(0,0,0,.04)'}}>
          <form onSubmit={handleSubmit} noValidate style={{display:'flex',flexDirection:'column',gap:20}}>
            {/* Top grid */}
            <div className="vendor-form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                <label htmlFor="name" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase'}}>Product Name *</label>
                <input id="name" name="name" type="text" value={form.name} onChange={handleNameChange} disabled={saving} maxLength={255} required style={{minHeight:44,padding:'0 14px',border:'1px solid #ece8de',borderRadius:12,outline:'none',fontSize:14,fontWeight:600}} />
                <span style={{fontSize:10,color:'#b8b3a9'}}>{form.name.length}/255</span>
              </div>
              <Input label="SKU" id="sku" name="sku" type="text" value={form.sku} onChange={handleChange} disabled={saving} maxLength={100} required placeholder="IPHONE15-128-BLK" />
              <Input label="Category ID" id="category" name="category" type="number" min="1" step="1" value={form.category} onChange={handleChange} disabled={saving} required />
              <Input label="Brand ID" id="brand" name="brand" type="number" min="1" step="1" value={form.brand} onChange={handleChange} disabled={saving} placeholder="Optional" />
              <Input label="Price (₹)" id="price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} disabled={saving} required />
              <Input label="Stock Qty" id="stock" name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} disabled={saving} required />
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              <label htmlFor="slug" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase'}}>Slug (URL) *</label>
              <div style={{display:'flex',gap:8}}>
                <input id="slug" name="slug" type="text" value={form.slug} onChange={handleChange} disabled={saving} maxLength={255} required style={{flex:1,minHeight:44,padding:'0 14px',border:'1px solid #ece8de',borderRadius:12,outline:'none',fontSize:13,background:'#fafaf7'}} />
                <button type="button" onClick={()=>setForm(p=>({...p, slug: form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")}))} style={{minHeight:44,padding:'0 14px',borderRadius:12,border:'1px solid #ece8de',background:'#fff',fontSize:12,fontWeight:700,cursor:'pointer'}}>Regenerate</button>
              </div>
              <span style={{fontSize:11,color:'#8c8881'}}>Preview: <code style={{background:'#fafaf7',padding:'2px 6px',borderRadius:6,fontSize:11}}>/products/{form.slug || "your-product-slug"}</code></span>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              <label htmlFor="description" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase'}}>Description *</label>
              <textarea id="description" name="description" rows={6} value={form.description} onChange={handleChange} disabled={saving} maxLength={5000} required style={{padding:14,border:'1px solid #ece8de',borderRadius:12,outline:'none',fontSize:13,lineHeight:1.5,resize:'vertical'}} placeholder="Describe features, material, warranty..." />
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <small style={{fontSize:11,color: form.description.length>4500 ? '#ef4444' : '#8c8881'}}>{form.description.length}/5000 characters</small>
                <small style={{fontSize:11,color:'#8c8881'}}>{form.description.length<50 ? "Add more details for better ranking" : "✓ Good length"}</small>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,padding:16,background:'#fafaf7',border:'1px dashed #ece8de',borderRadius:12}}>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                <label htmlFor="status" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase'}}>Status</label>
                <select id="status" name="status" value={form.status} onChange={handleChange} disabled={saving} style={{minHeight:44,padding:'0 14px',border:'1px solid #ece8de',borderRadius:12,background:'#fff',fontSize:13,outline:'none'}}>
                  <option value="PUBLISHED">🟢 Published - Live on store</option>
                  <option value="DRAFT">🟡 Draft - Hidden</option>
                  <option value="OUT_OF_STOCK">🔴 Out of Stock</option>
                </select>
              </div>
              <label style={{display:'flex',alignItems:'center',gap:12,padding:'0 16px',minHeight:44,background:'#fff',border:'1px solid #ece8de',borderRadius:12,cursor:'pointer',marginTop:18}}>
                <input id="is_active" name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} disabled={saving} style={{width:18,height:18,accentColor:'#1a1816'}} />
                <span style={{fontSize:13,fontWeight:700}}>Product is active & visible</span>
              </label>
            </div>

            <div className="vendor-form-actions" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,paddingTop:12,borderTop:'1px solid #f5f2eb'}}>
              <div style={{fontSize:11,color:'#8c8881'}}>Last updated: Just now • Auto-save draft enabled</div>
              <div style={{display:'flex',gap:8}}>
                <Link to="/vendor/products" style={{minHeight:44,padding:'0 20px',display:'inline-flex',alignItems:'center',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:13,fontWeight:600,textDecoration:'none',color:'#1a1816'}}>Cancel</Link>
                <button type="submit" disabled={saving} style={{minHeight:44,padding:'0 24px',borderRadius:999,background:'#1a1816',color:'#fff',border:'1px solid #1a1816',fontSize:13,fontWeight:800,cursor: saving ? 'not-allowed' : 'pointer',opacity: saving ? .7 : 1,boxShadow:'0 6px 18px rgba(0,0,0,.18)',display:'flex',alignItems:'center',gap:8}}>
                  {saving ? (<><span style={{width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin .8s linear infinite'}} /> Saving...</>) : "💾 Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div style={{marginTop:16,padding:12,background:'#fffbeb',border:'1px solid #fde68a',borderRadius:12,fontSize:11,color:'#92400e',lineHeight:1.5}}>
          💡 <strong>Flipkart Seller Tip:</strong> Good slug + detailed description improves SEO ranking. Keep price competitive, stock updated for better visibility.
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1} 50%{opacity:.6}} @keyframes spin{to{transform:rotate(360deg)}} @media(max-width:700px){.vendor-form-grid{grid-template-columns:1fr !important;}}`}</style>
    </main>
  );
}

export default EditProduct;