import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getVendorProducts, deleteVendorProduct } from "../../services/vendorService";

function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [view, setView] = useState("grid"); // grid | table

  const loadProducts = useCallback(async (isRefresh=false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const data = await getVendorProducts();
      const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      setProducts(list);
    } catch (err) {
      setError(err.response?.data?.detail || "Products load nahi ho paaye.");
    } finally {
      if (isRefresh) setRefreshing(false); else setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(false); }, [loadProducts]);

  const handleDelete = async (productId, productName) => {
    if (deletingId) return;
    const confirmed = window.confirm(`Are you sure you want to delete "${productName}"? This cannot be undone.`);
    if (!confirmed) return;
    setDeletingId(productId); setError("");
    try {
      await deleteVendorProduct(productId);
      setProducts(prev => prev.filter(p=>p.id!==productId));
    } catch (err) {
      setError(err.response?.data?.detail || "Product delete nahi ho paaya.");
    } finally { setDeletingId(null); }
  };

  const filtered = useMemo(() => {
    const sv = search.toLowerCase().trim();
    return products.filter(p=>{
      const name = String(p.name||"").toLowerCase();
      const sku = String(p.sku||"").toLowerCase();
      const desc = String(p.description||"").toLowerCase();
      const pStatus = String(p.status||"").toLowerCase();
      const matchesSearch = !sv || name.includes(sv) || sku.includes(sv) || desc.includes(sv);
      const matchesCategory = !category || String(p.category)===String(category);
      const matchesStatus = !status || pStatus===status.toLowerCase();
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, category, status]);

  const categories = useMemo(() => {
    const s = new Set();
    products.forEach(p=>{ if(p.category!==null && p.category!=="" && p.category!==undefined) s.add(String(p.category)); });
    return Array.from(s).sort((a,b)=>Number(a)-Number(b));
  }, [products]);

  const totalProducts = products.length;
  const publishedProducts = products.filter(p=>String(p.status||"").toLowerCase()==="published").length;
  const outOfStockProducts = products.filter(p=>Number(p.stock||0)<=0).length;
  const formatPrice = (v) => `₹${Number(v||0).toLocaleString("en-IN")}`;
  const formatStatus = (v) => v ? String(v).replaceAll("_"," ").toLowerCase().replace(/^\w/,(c)=>c.toUpperCase()) : "Unknown";

  const statusPill = (s) => {
    const map = {
      published:{bg:'#f0fdf4',border:'#bbf7d0',color:'#166534',dot:'#22c55e'},
      draft:{bg:'#fefce8',border:'#fde68a',color:'#854d0e',dot:'#eab308'},
      out_of_stock:{bg:'#fef2f2',border:'#fecaca',color:'#991b1b',dot:'#ef4444'},
    };
    return map[String(s||"").toLowerCase()] || map.draft;
  };

  if (loading) {
    return (
      <main style={{minHeight:'100vh',background:'#fafaf7',padding:24}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'grid',gap:16}}>
          <div style={{height:80,background:'#fff',border:'1px solid #ece8de',borderRadius:20,animation:'pulse 1.5s infinite'}} />
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>{[1,2,3,4].map(i=><div key={i} style={{height:80,background:'#fff',border:'1px solid #ece8de',borderRadius:16,animation:'pulse 1.5s infinite'}} />)}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="vendor-products-page" style={{minHeight:'100vh',background:'#fafaf7',padding:24}}>
      <div className="vendor-container" style={{maxWidth:1100,margin:'0 auto'}}>
        {/* Header */}
        <div className="vendor-products-header" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16,marginBottom:20}}>
          <div>
            <span style={{display:'inline-flex',padding:'4px 10px',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:10,fontWeight:800,letterSpacing:'.06em',marginBottom:8}}>VENDOR PANEL • {totalProducts} PRODUCTS</span>
            <h1 style={{margin:'0 0 6px',fontSize:'clamp(22px,3vw,28px)',fontWeight:900}}>My Products</h1>
            <p style={{margin:0,color:'#8c8881',fontSize:13}}>Manage the products in your store. Flipkart style inventory.</p>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>loadProducts(true)} disabled={refreshing} style={{minHeight:40,padding:'0 16px',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'}}>{refreshing ? "↻ Refreshing..." : "↻ Refresh"}</button>
            <Link to="/vendor/products/create" style={{minHeight:40,padding:'0 18px',display:'inline-flex',alignItems:'center',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none',boxShadow:'0 4px 12px rgba(0,0,0,.15)'}}>+ Add Product</Link>
          </div>
        </div>

        {error && <div role="alert" style={{padding:'12px 16px',marginBottom:16,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,color:'#991b1b',fontSize:13,fontWeight:600,display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}><span>⚠️ {error}</span><button onClick={()=>loadProducts(true)} style={{minHeight:32,padding:'0 12px',borderRadius:999,background:'#fff',border:'1px solid #fecaca',fontSize:12,fontWeight:700}}>Try Again</button></div>}

        {/* Summary */}
        <div className="vendor-products-summary" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12,marginBottom:20}}>
          {[
            {k:'Total Products',v:totalProducts,sub:`${filtered.length} showing`},
            {k:'Published',v:publishedProducts,sub:'Live on store',color:'#166534',bg:'#f0fdf4'},
            {k:'Out of Stock',v:outOfStockProducts,sub:'Needs restock',color:'#991b1b',bg:'#fef2f2'},
            {k:'Draft',v:totalProducts - publishedProducts - outOfStockProducts >0 ? totalProducts - publishedProducts : 0,sub:'Hidden'},
          ].map(s=>(
            <div key={s.k} style={{background: s.bg || '#fff',border:'1px solid #ece8de',borderRadius:16,padding:14}}>
              <span style={{fontSize:10,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',color:'#8c8881'}}>{s.k}</span>
              <div style={{display:'flex',alignItems:'baseline',gap:8,marginTop:4}}>
                <strong style={{fontSize:22,fontWeight:900,color:s.color || '#1a1816'}}>{s.v}</strong>
                <span style={{fontSize:11,color:'#8c8881'}}>{s.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar like Flipkart Seller */}
        <div className="vendor-products-toolbar" style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',marginBottom:16,background:'#fff',border:'1px solid #ece8de',borderRadius:16,padding:12}}>
          <div style={{position:'relative',flex:'1 1 280px',minWidth:200}}>
            <input type="search" placeholder="Search by name, SKU or description..." value={search} onChange={e=>setSearch(e.target.value)} aria-label="Search products" style={{width:'100%',minHeight:40,padding:'0 14px 0 36px',border:'1px solid #ece8de',borderRadius:999,background:'#fafaf7',outline:'none',fontSize:13}} />
            <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14,color:'#b8b3a9'}}>🔍</span>
          </div>
          <select value={category} onChange={e=>setCategory(e.target.value)} aria-label="Filter by category" style={{minHeight:40,padding:'0 32px 0 14px',border:'1px solid #ece8de',borderRadius:999,background:'#fff',fontSize:13,fontWeight:600}}>
            <option value="">All Categories</option>
            {categories.map(cid=><option key={cid} value={cid}>Category #{cid}</option>)}
          </select>
          <select value={status} onChange={e=>setStatus(e.target.value)} aria-label="Filter by status" style={{minHeight:40,padding:'0 32px 0 14px',border:'1px solid #ece8de',borderRadius:999,background:'#fff',fontSize:13,fontWeight:600}}>
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          {(search||category||status) && <button onClick={()=>{setSearch(""); setCategory(""); setStatus("");}} style={{minHeight:40,padding:'0 16px',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>✕ Clear Filters</button>}
          <div style={{marginLeft:'auto',display:'flex',gap:4,padding:3,background:'#fafaf7',borderRadius:999,border:'1px solid #ece8de'}}>
            <button onClick={()=>setView("grid")} style={{width:32,height:32,borderRadius:999,border:0,background: view==="grid" ? '#1a1816' : 'transparent',color: view==="grid" ? '#fff' : '#8c8881',cursor:'pointer'}}>⊞</button>
            <button onClick={()=>setView("table")} style={{width:32,height:32,borderRadius:999,border:0,background: view==="table" ? '#1a1816' : 'transparent',color: view==="table" ? '#fff' : '#8c8881',cursor:'pointer'}}>☰</button>
          </div>
        </div>

        {/* Content */}
        <div className="vendor-products-table-wrapper" style={{background:'#fff',border:'1px solid #ece8de',borderRadius:20,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,.04)'}}>
          {filtered.length===0 ? (
            <div className="products-empty" style={{padding:60,textAlign:'center'}}>
              <div style={{width:72,height:72,margin:'0 auto 16px',display:'grid',placeItems:'center',background:'#fafaf7',borderRadius:'50%',fontSize:32}}>📦</div>
              <h2 style={{margin:'0 0 8px',fontSize:18,fontWeight:900}}>No Products Found</h2>
              <p style={{margin:'0 0 16px',color:'#8c8881',fontSize:13}}>{products.length===0 ? "You haven't created any products yet." : "No products match your search or filters."}</p>
              {products.length===0 ? <Link to="/vendor/products/create" style={{minHeight:40,padding:'0 18px',display:'inline-flex',alignItems:'center',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none'}}>+ Add Your First Product</Link>
              : (search||category||status) && <button onClick={()=>{setSearch(""); setCategory(""); setStatus("");}} style={{minHeight:40,padding:'0 18px',borderRadius:999,background:'#fff',border:'1px solid #ece8de',fontSize:13,fontWeight:600}}>Clear Filters</button>}
            </div>
          ) : view==="grid" ? (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16,padding:16}}>
              {filtered.map(product=>{
                const isDeleting = deletingId===product.id;
                const stock = Number(product.stock||0);
                const pill = statusPill(product.status);
                return (
                  <div key={product.id} style={{border:'1px solid #f5f2eb',borderRadius:16,overflow:'hidden',background:'#fff',transition:'.2s'}}>
                    <div style={{aspectRatio:'4/3',background:'#fafaf7',position:'relative',display:'grid',placeItems:'center',fontSize:40}}>📦
                      <span style={{position:'absolute',top:10,left:10,padding:'4px 10px',borderRadius:999,background:pill.bg,border:`1px solid ${pill.border}`,fontSize:10,fontWeight:800,color:pill.color,display:'flex',alignItems:'center',gap:4}}><span style={{width:6,height:6,borderRadius:'50%',background:pill.dot,display:'inline-block'}} />{formatStatus(product.status)}</span>
                      <span style={{position:'absolute',top:10,right:10,padding:'4px 8px',borderRadius:8,background: stock<=0 ? '#fef2f2' : '#fff',border:'1px solid #ece8de',fontSize:11,fontWeight:800,color: stock<=0 ? '#991b1b' : '#1a1816'}}>{stock} stock</span>
                    </div>
                    <div style={{padding:14}}>
                      <div style={{fontWeight:800,fontSize:13,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',marginBottom:4}}>{product.name || `Product #${product.id}`}</div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                        <span style={{fontSize:11,color:'#8c8881'}}>SKU: {product.sku || "-"}</span>
                        <strong style={{fontSize:13}}>{formatPrice(product.price)}</strong>
                      </div>
                      <div style={{fontSize:11,color:'#8c8881',marginBottom:12}}>Category #{product.category || "-"}</div>
                      <div className="product-table-actions" style={{display:'flex',gap:6}}>
                        <Link to={`/products/${product.id}`} style={{flex:1,minHeight:32,display:'inline-flex',alignItems:'center',justifyContent:'center',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:11,fontWeight:700,textDecoration:'none',color:'#1a1816'}}>View</Link>
                        <Link to={`/vendor/products/${product.id}/edit`} style={{flex:1,minHeight:32,display:'inline-flex',alignItems:'center',justifyContent:'center',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:11,fontWeight:700,textDecoration:'none'}}>Edit</Link>
                        <button onClick={()=>handleDelete(product.id, product.name || `Product #${product.id}`)} disabled={isDeleting || deletingId!==null} style={{flex:1,minHeight:32,borderRadius:999,border:'1px solid #fecaca',background:'#fef2f2',color:'#991b1b',fontSize:11,fontWeight:700,cursor:'pointer'}}>{isDeleting ? "..." : "Delete"}</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{overflowX:'auto'}}>
              <table className="vendor-products-table" style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead><tr style={{background:'#fafaf7',borderBottom:'1px solid #ece8de',textAlign:'left'}}>
                  <th style={{padding:'14px 16px',fontSize:11,fontWeight:800,color:'#8c8881'}}>Product</th>
                  <th style={{padding:'14px 16px',fontSize:11,fontWeight:800,color:'#8c8881'}}>SKU</th>
                  <th style={{padding:'14px 16px',fontSize:11,fontWeight:800,color:'#8c8881'}}>Category</th>
                  <th style={{padding:'14px 16px',fontSize:11,fontWeight:800,color:'#8c8881'}}>Price</th>
                  <th style={{padding:'14px 16px',fontSize:11,fontWeight:800,color:'#8c8881'}}>Stock</th>
                  <th style={{padding:'14px 16px',fontSize:11,fontWeight:800,color:'#8c8881'}}>Status</th>
                  <th style={{padding:'14px 16px',fontSize:11,fontWeight:800,color:'#8c8881'}}>Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map(product=>{
                    const isDeleting = deletingId===product.id;
                    const stock = Number(product.stock||0);
                    const pill = statusPill(product.status);
                    return (
                      <tr key={product.id} style={{borderBottom:'1px solid #f5f2eb'}}>
                        <td style={{padding:'14px 16px',fontWeight:700}}>{product.name || `Product #${product.id}`}</td>
                        <td style={{padding:'14px 16px',color:'#8c8881'}}>{product.sku || "-"}</td>
                        <td style={{padding:'14px 16px'}}>{product.category ? `#${product.category}` : "-"}</td>
                        <td style={{padding:'14px 16px',fontWeight:700}}>{formatPrice(product.price)}</td>
                        <td style={{padding:'14px 16px'}}><span style={{padding:'4px 8px',borderRadius:8,background: stock<=0 ? '#fef2f2' : '#f0fdf4',border:'1px solid #ece8de',fontSize:12,fontWeight:800,color: stock<=0 ? '#991b1b' : '#166534'}}>{stock}</span></td>
                        <td style={{padding:'14px 16px'}}><span style={{padding:'4px 10px',borderRadius:999,background:pill.bg,border:`1px solid ${pill.border}`,fontSize:11,fontWeight:800,color:pill.color,display:'inline-flex',alignItems:'center',gap:4}}><span style={{width:6,height:6,borderRadius:'50%',background:pill.dot,display:'inline-block'}} />{formatStatus(product.status)}</span></td>
                        <td style={{padding:'14px 16px'}}>
                          <div style={{display:'flex',gap:6}}>
                            <Link to={`/products/${product.id}`} style={{minHeight:28,padding:'0 10px',display:'inline-flex',alignItems:'center',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:11,fontWeight:700,textDecoration:'none',color:'#1a1816'}}>View</Link>
                            <Link to={`/vendor/products/${product.id}/edit`} style={{minHeight:28,padding:'0 10px',display:'inline-flex',alignItems:'center',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:11,fontWeight:700,textDecoration:'none'}}>Edit</Link>
                            <button onClick={()=>handleDelete(product.id, product.name || `Product #${product.id}`)} disabled={isDeleting || deletingId!==null} style={{minHeight:28,padding:'0 10px',borderRadius:999,border:'1px solid #fecaca',background:'#fef2f2',color:'#991b1b',fontSize:11,fontWeight:700,cursor:'pointer'}}>{isDeleting ? "Deleting..." : "Delete"}</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1} 50%{opacity:.6}}`}</style>
    </main>
  );
}

export default VendorProducts;