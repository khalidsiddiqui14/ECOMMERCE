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
    setFormData(prev => ({...prev, [name]: type==="checkbox" ? checked : value}));
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
    if (d.detail) return Array.isArray(d.detail) ? d.detail.join(", ") : String(d.detail);
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
        brand: formData.brand ? Number(formData.brand) : null,
      };
      const product = await createVendorProduct(productData);
      if (!product?.id) throw new Error("Product ID was not returned by server.");
      for (let i=0;i<images.length;i++) {
        const fd = new FormData();
        fd.append("image", images[i]);
        fd.append("is_primary", i===0 ? "true" : "false");
        await uploadVendorProductImage(product.id, fd);
      }
      setSuccess(images.length>0 ? "Product and images created successfully." : "Product created successfully.");
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
    <main className="vendor-product-create-page" style={{minHeight:'100vh',background:'#fafaf7',padding:'24px'}}>
      <div className="vendor-container" style={{maxWidth:900,margin:'0 auto'}}>
        <div className="vendor-products-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16,marginBottom:20}}>
          <div>
            <span style={{display:'inline-flex',padding:'4px 10px',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:10,fontWeight:800,letterSpacing:'.06em',marginBottom:8}}>VENDOR PANEL • CREATE NEW</span>
            <h1 style={{margin:'0 0 6px',fontSize:'clamp(24px,3vw,30px)',fontWeight:900}}>Add Product 🛍️</h1>
            <p style={{margin:0,color:'#8c8881',fontSize:13}}>Add a new product to your store. Flipkart quality images = more sales.</p>
          </div>
          <Link to="/vendor/products" style={{minHeight:40,padding:'0 18px',display:'inline-flex',alignItems:'center',borderRadius:999,background:'#fff',border:'1px solid #ece8de',fontSize:13,fontWeight:600,textDecoration:'none',color:'#1a1816'}}>← Back to Products</Link>
        </div>

        {error && <div role="alert" style={{padding:'12px 16px',marginBottom:16,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,color:'#991b1b',fontSize:13,fontWeight:600}}>⚠️ {error}</div>}
        {success && <div role="status" style={{padding:'12px 16px',marginBottom:16,background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,color:'#166534',fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:8}}>✓ {success}<span style={{marginLeft:'auto',fontSize:11}}>Redirecting...</span></div>}

        <section className="vendor-product-form-card" style={{background:'#fff',border:'1px solid #ece8de',borderRadius:20,boxShadow:'0 4px 20px rgba(0,0,0,.04)',overflow:'hidden'}}>
          <form onSubmit={handleSubmit} noValidate>
            {/* Progress */}
            <div style={{display:'flex',gap:0,borderBottom:'1px solid #f5f2eb'}}>
              {[{n:'1',t:'Information',active:true},{n:'2',t:'Images'},{n:'3',t:'Settings'}].map(s=>(
                <div key={s.n} style={{flex:1,padding:'14px 16px',display:'flex',alignItems:'center',gap:8,background: s.active ? '#1a1816' : '#fafaf7',color: s.active ? '#fff' : '#8c8881',fontSize:12,fontWeight:800,borderRight:'1px solid #f5f2eb'}}>
                  <span style={{width:20,height:20,borderRadius:'50%',background: s.active ? '#fff' : '#ece8de',color: s.active ? '#1a1816' : '#8c8881',display:'grid',placeItems:'center',fontSize:11}}>{s.n}</span>{s.t}
                </div>
              ))}
            </div>

            <div style={{padding:24}}>
            {/* Product Information */}
            <div className="vendor-product-form-section" style={{marginBottom:28}}>
              <h2 style={{margin:'0 0 16px',fontSize:14,fontWeight:900,display:'flex',alignItems:'center',gap:8}}><span style={{width:28,height:28,borderRadius:8,background:'#1a1816',color:'#fff',display:'grid',placeItems:'center',fontSize:14}}>📦</span> Product Information</h2>
              <div className="vendor-product-form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                {[
                  {id:'name',label:'Product Name',ph:'Bluetooth Speaker',max:255,value:formData.name,onChange:handleNameChange},
                  {id:'sku',label:'SKU',ph:'BS-002',max:100,value:formData.sku},
                  {id:'slug',label:'Slug',ph:'bluetooth-speaker',max:255,value:formData.slug,extra:(
                    <div style={{display:'flex',gap:6,marginTop:6}}>
                      <button type="button" onClick={()=>setFormData(p=>({...p, slug: slugify(p.name || p.slug)}))} style={{minHeight:28,padding:'0 10px',borderRadius:999,border:'1px solid #ece8de',background:'#fafaf7',fontSize:10,fontWeight:700,cursor:'pointer'}}>Auto Generate</button>
                      <span style={{fontSize:10,color:'#8c8881'}}>/products/{formData.slug || 'slug'}</span>
                    </div>
                  )},
                  {id:'category',label:'Category ID',ph:'1',type:'number',value:formData.category},
                  {id:'brand',label:'Brand ID (Optional)',ph:'Optional',type:'number',value:formData.brand},
                  {id:'price',label:'Price (₹)',ph:'2499.00',type:'number',value:formData.price},
                  {id:'stock',label:'Stock',ph:'15',type:'number',value:formData.stock},
                  {id:'status',label:'Status',type:'select',value:formData.status,options:[
                    {v:'DRAFT',l:'🟡 Draft - Hidden'},
                    {v:'PUBLISHED',l:'🟢 Published - Live'},
                    {v:'OUT_OF_STOCK',l:'🔴 Out of Stock'},
                  ]},
                ].map(f=>(
                  <div key={f.id} className="form-group" style={{display:'flex',flexDirection:'column',gap:6}}>
                    <label htmlFor={f.id} style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase'}}>{f.label}</label>
                    {f.type==='select' ? (
                      <select id={f.id} name={f.id} value={f.value} onChange={handleChange} disabled={loading} style={{minHeight:44,padding:'0 14px',border:'1px solid #ece8de',borderRadius:12,background:'#fff',fontSize:13,outline:'none'}}>
                        {f.options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    ) : (
                      <input id={f.id} name={f.id} type={f.type||'text'} placeholder={f.ph} value={f.value} onChange={f.onChange||handleChange} disabled={loading} maxLength={f.max} required={f.label!=='Brand ID (Optional)'} style={{minHeight:44,padding:'0 14px',border:'1px solid #ece8de',borderRadius:12,outline:'none',fontSize:13,background:'#fff'}} />
                    )}
                    {f.extra}
                  </div>
                ))}
              </div>

              <div className="form-group" style={{display:'flex',flexDirection:'column',gap:6,marginTop:16}}>
                <label htmlFor="description" style={{fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase'}}>Description *</label>
                <textarea id="description" name="description" rows={6} placeholder="Enter product description... features, warranty, material" value={formData.description} onChange={handleChange} disabled={loading} maxLength={5000} required style={{padding:14,border:'1px solid #ece8de',borderRadius:12,outline:'none',fontSize:13,lineHeight:1.5,resize:'vertical'}} />
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <small style={{fontSize:11,color: formData.description.length>4500 ? '#ef4444' : '#8c8881'}}>{formData.description.length}/5000 characters</small>
                  <small style={{fontSize:11,color:'#8c8881'}}>{formData.description.length<50 ? "Add more for SEO" : "✓ Good"}</small>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="vendor-product-form-section" style={{marginBottom:28,padding:20,background:'#fafaf7',border:'1px dashed #ece8de',borderRadius:16}}>
              <h2 style={{margin:'0 0 16px',fontSize:14,fontWeight:900,display:'flex',alignItems:'center',gap:8}}><span style={{width:28,height:28,borderRadius:8,background:'#1a1816',color:'#fff',display:'grid',placeItems:'center',fontSize:14}}>🖼</span> Product Images • {images.length}/{MAX_IMAGES} • First = Primary</h2>
              
              <div className="product-upload-area">
                <label htmlFor="product-image" className="product-upload-label" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,padding:'24px 16px',background:'#fff',border:'2px dashed #ece8de',borderRadius:12,cursor:'pointer',textAlign:'center',transition:'.2s'}}>
                  <div style={{width:48,height:48,borderRadius:12,background:'#1a1816',color:'#fff',display:'grid',placeItems:'center',fontSize:20}}>⬆</div>
                  <span style={{fontSize:13,fontWeight:800}}>Choose Files or Drag & Drop</span>
                  <small style={{fontSize:11,color:'#8c8881'}}>Select up to {MAX_IMAGES} JPG, PNG or WEBP images (max 5 MB each)</small>
                  <span style={{marginTop:4,padding:'6px 12px',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:11,fontWeight:700}}>Browse Files</span>
                </label>

                <input ref={fileInputRef} id="product-image" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageChange} disabled={loading} style={{display:'none'}} />

                {images.length>0 && (
                  <div className="product-selected-images" style={{display:'flex',flexDirection:'column',gap:8,marginTop:16}}>
                    {images.map((image,index)=>(
                      <div key={`${image.name}-${image.lastModified}-${index}`} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',background:'#fff',border:'1px solid #ece8de',borderRadius:10}}>
                        <div style={{width:40,height:40,borderRadius:8,background:'#fafaf7',display:'grid',placeItems:'center',fontSize:16}}>🖼</div>
                        <div style={{flex:1,minWidth:0}}>
                          <strong style={{display:'block',fontSize:12,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{image.name}</strong>
                          <span style={{fontSize:11,color:'#8c8881'}}>{(image.size/1024/1024).toFixed(2)} MB • {image.type.split('/')[1].toUpperCase()}</span>
                        </div>
                        {index===0 && <span style={{padding:'3px 8px',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:9,fontWeight:800}}>PRIMARY</span>}
                        <button type="button" onClick={()=>removeImage(index)} disabled={loading} style={{minWidth:32,minHeight:32,borderRadius:8,border:'1px solid #fecaca',background:'#fef2f2',color:'#991b1b',cursor:'pointer'}}>✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {previews.length>0 && (
                  <div className="product-image-preview-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:12,marginTop:16}}>
                    {previews.map((preview,index)=>(
                      <div key={preview} style={{position:'relative',aspectRatio:'1',borderRadius:12,overflow:'hidden',border:'1px solid #ece8de',background:'#fff'}}>
                        <img src={preview} alt={`Preview ${index+1}`} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                        {index===0 && <span style={{position:'absolute',top:6,left:6,padding:'2px 6px',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:9,fontWeight:800}}>PRIMARY</span>}
                        <button type="button" onClick={()=>removeImage(index)} style={{position:'absolute',top:6,right:6,width:24,height:24,borderRadius:'50%',background:'rgba(0,0,0,.7)',color:'#fff',border:0,cursor:'pointer',fontSize:12}}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className="vendor-product-form-section" style={{marginBottom:24,padding:16,background:'#fff',border:'1px solid #ece8de',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
              <div>
                <h2 style={{margin:'0 0 4px',fontSize:13,fontWeight:900}}>Product Settings ⚙️</h2>
                <p style={{margin:0,fontSize:11,color:'#8c8881'}}>Active products are visible to customers immediately after publishing.</p>
              </div>
              <label className="product-active-checkbox" style={{display:'flex',alignItems:'center',gap:10,padding:'8px 14px',background: formData.is_active ? '#f0fdf4' : '#fef2f2',border:`1px solid ${formData.is_active ? '#bbf7d0' : '#fecaca'}`,borderRadius:999,cursor:'pointer'}}>
                <input name="is_active" type="checkbox" checked={formData.is_active} onChange={handleChange} disabled={loading} style={{width:18,height:18,accentColor:'#1a1816'}} />
                <span style={{fontSize:12,fontWeight:800}}>{formData.is_active ? "✓ Active & Visible" : "✕ Hidden"}</span>
              </label>
            </div>

            </div>

            {/* Actions */}
            <div className="vendor-product-form-actions" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 24px',background:'#fafaf7',borderTop:'1px solid #f5f2eb',flexWrap:'wrap',gap:12}}>
              <div style={{fontSize:11,color:'#8c8881'}}>💡 Tip: HD images + detailed desc = +40% more sales. Flipkart standard.</div>
              <div style={{display:'flex',gap:8}}>
                <button type="button" onClick={()=>navigate("/vendor/products")} disabled={loading} style={{minHeight:44,padding:'0 20px',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancel</button>
                <button type="submit" disabled={loading} style={{minHeight:44,padding:'0 24px',borderRadius:999,background:'#1a1816',color:'#fff',border:'1px solid #1a1816',fontSize:13,fontWeight:800,cursor: loading ? 'not-allowed' : 'pointer',opacity: loading ? .7 : 1,display:'flex',alignItems:'center',gap:8,boxShadow:'0 6px 18px rgba(0,0,0,.18)'}}>
                  {loading ? (<><span style={{width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin .8s linear infinite'}} /> Creating...</>) : "➕ Add Product"}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @media(max-width:700px){.vendor-product-form-grid{grid-template-columns:1fr !important;}}`}</style>
    </main>
  );
}

export default VendorProductCreate;