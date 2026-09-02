import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/productService";
import { addToCart } from "../services/cartService";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("latest");
  const [addingId, setAddingId] = useState(null);
  const [cartMessage, setCartMessage] = useState("");
  const [cartError, setCartError] = useState("");

  const loadProducts = useCallback(async (isMounted = true) => {
    setLoading(true); setError("");
    try {
      const data = await getProducts();
      if (!isMounted) return;
      const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
      setProducts(list);
    } catch (err) {
      if (!isMounted) return;
      setError(err.response?.data?.detail || "Products load nahi ho paaye.");
    } finally {
      if (isMounted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    loadProducts(mounted);
    return () => { mounted = false; };
  }, [loadProducts]);

  const categories = useMemo(() => {
    const vals = products.map(p => p.category_name || p.category).filter(Boolean);
    return [...new Set(vals)].sort((a,b)=>String(a).localeCompare(String(b)));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let res = [...products];
    const q = search.trim().toLowerCase();
    if (q) {
      res = res.filter(p => String(p.name||"").toLowerCase().includes(q) || String(p.description||"").toLowerCase().includes(q) || String(p.category_name||p.category||"").toLowerCase().includes(q));
    }
    if (category) {
      res = res.filter(p => String(p.category_name||p.category||"") === category);
    }
    if (sort==="price-low") res.sort((a,b)=>Number(a.price||0)-Number(b.price||0));
    if (sort==="price-high") res.sort((a,b)=>Number(b.price||0)-Number(a.price||0));
    if (sort==="latest") res.sort((a,b)=> new Date(b.created_at||0).getTime() - new Date(a.created_at||0).getTime());
    return res;
  }, [products, search, category, sort]);

  const hasFilters = Boolean(search.trim()) || Boolean(category) || sort!=="latest";
  const clearFilters = () => { setSearch(""); setCategory(""); setSort("latest"); setCartMessage(""); setCartError(""); };

  const handleAddToCart = async (product) => {
    if (!product?.id) return;
    const hasStock = product.stock===undefined || Number(product.stock)>0;
    if (!hasStock) return;
    setAddingId(product.id); setCartMessage(""); setCartError("");
    try {
      await addToCart(product.id, 1);
      setCartMessage(`${product.name || "Product"} cart mein add ho gaya.`);
      setTimeout(()=>setCartMessage(""), 3000);
    } catch (err) {
      setCartError(err.response?.data?.detail || "Product cart mein add nahi ho paaya.");
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <main style={{minHeight:'100vh',background:'#fafaf7',padding:'32px 24px'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{height:100,background:'#fff',border:'1px solid #ece8de',borderRadius:20,marginBottom:20,animation:'pulse 1.5s infinite'}} />
          <div style={{display:'grid',gridTemplateColumns:'240px 1fr',gap:20}}>
            <div style={{height:300,background:'#fff',border:'1px solid #ece8de',borderRadius:16,animation:'pulse 1.5s infinite'}} />
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
              {[1,2,3,4,5,6].map(i=>(<div key={i} style={{height:320,background:'#fff',border:'1px solid #ece8de',borderRadius:16,animation:'pulse 1.5s infinite'}} />))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{minHeight:'100vh',background:'#fafaf7',padding:'40px 24px',display:'grid',placeItems:'center'}}>
        <div style={{textAlign:'center',padding:40,background:'#fff',border:'1px solid #ece8de',borderRadius:24,maxWidth:420}}>
          <h2 style={{fontWeight:900}}>Unable to load products</h2>
          <p style={{color:'#8c8881'}}>{error}</p>
          <button onClick={()=>loadProducts()} style={{marginTop:16,minHeight:42,padding:'0 20px',borderRadius:999,background:'#1a1816',color:'#fff',border:0,fontWeight:700}}>Try Again</button>
        </div>
      </main>
    );
  }

  return (
    <main className="products-page" style={{minHeight:'100vh',background:'#fafaf7',padding:'32px 24px'}}>
      {/* Header */}
      <section className="products-header" style={{maxWidth:1200,margin:'0 auto 24px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:16}}>
          <div>
            <h1 style={{margin:'0 0 8px',fontSize:'clamp(28px,4vw,36px)',fontWeight:900,letterSpacing:'-.03em',color:'#1a1816'}}>All Products</h1>
            <p style={{margin:0,color:'#8c8881',fontSize:14}}>Discover our collection of quality products. <strong style={{color:'#1a1816'}}>{products.length} products</strong> available.</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:'#8c8881'}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#10b981',display:'inline-block'}} /> Live • Updated now
          </div>
        </div>
      </section>

      {cartMessage && (
        <div style={{maxWidth:1200,margin:'0 auto 16px',display:'flex',gap:10,padding:'12px 14px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,color:'#166534',fontSize:13,fontWeight:600}}>
          ✓ {cartMessage} <Link to="/cart" style={{marginLeft:'auto',fontWeight:800,textDecoration:'underline'}}>Go to Cart →</Link>
        </div>
      )}
      {cartError && (
        <div style={{maxWidth:1200,margin:'0 auto 16px',padding:'12px 14px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,color:'#991b1b',fontSize:13,fontWeight:600}}>
          ⚠️ {cartError}
        </div>
      )}

      <section className="products-content" style={{maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'260px 1fr',gap:24,alignItems:'start'}}>
        {/* Filters - Premium Sidebar */}
        <aside className="products-filter" style={{position:'sticky',top:88,background:'#fff',border:'1px solid #ece8de',borderRadius:20,padding:20,boxShadow:'0 2px 10px rgba(0,0,0,.04)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <h3 style={{margin:0,fontSize:14,fontWeight:900,letterSpacing:'.04em'}}>FILTERS</h3>
            {hasFilters && <button onClick={clearFilters} style={{fontSize:11,fontWeight:700,color:'#ef4444',background:'none',border:0,cursor:'pointer'}}>Clear ×</button>}
          </div>

          <div className="filter-group" style={{marginBottom:20}}>
            <label htmlFor="category" style={{display:'block',fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:8,color:'#1a1816'}}>Category</label>
            <select id="category" value={category} onChange={e=>setCategory(e.target.value)}
              style={{width:'100%',minHeight:42,padding:'0 14px',border:'1px solid #ece8de',borderRadius:999,background:'#fff',fontSize:13,outline:'none'}}>
              <option value="">All Categories</option>
              {categories.map(c=> <option key={String(c)} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="filter-group" style={{marginBottom:20}}>
            <label htmlFor="sort" style={{display:'block',fontSize:11,fontWeight:800,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:8,color:'#1a1816'}}>Sort By</label>
            <select id="sort" value={sort} onChange={e=>setSort(e.target.value)}
              style={{width:'100%',minHeight:42,padding:'0 14px',border:'1px solid #ece8de',borderRadius:999,background:'#fff',fontSize:13,outline:'none'}}>
              <option value="latest">Latest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          <div style={{padding:12,background:'#fafaf7',border:'1px dashed #ece8de',borderRadius:12,fontSize:11,lineHeight:1.5,color:'#8c8881'}}>
            <strong style={{color:'#1a1816',fontSize:11}}>💡 Tip:</strong> Use search to find products quickly.
          </div>
        </aside>

        <div className="products-area">
          {/* Topbar */}
          <div className="products-topbar" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,marginBottom:20,flexWrap:'wrap'}}>
            <span style={{fontSize:13,color:'#3d3935',fontWeight:600,padding:'8px 14px',background:'#fff',border:'1px solid #ece8de',borderRadius:999}}>
              Showing <strong>{filteredProducts.length}</strong> of {products.length} Products {category && <span style={{marginLeft:6,padding:'2px 8px',background:'#1a1816',color:'#fff',borderRadius:999,fontSize:11}}>{category}</span>}
            </span>

            <div className="product-search" style={{position:'relative',display:'flex',alignItems:'center'}}>
              <input id="product-search" type="search" placeholder="Search products..." value={search} onChange={e=>setSearch(e.target.value)} autoComplete="off"
                style={{width:280,minHeight:42,padding:'0 40px 0 16px',border:'1px solid #ece8de',borderRadius:999,background:'#fff',outline:'none',fontSize:13,boxShadow:'0 2px 8px rgba(0,0,0,.04)'}} />
              <span style={{position:'absolute',left:12,fontSize:14,color:'#b8b3a9',pointerEvents:'none'}}>🔍</span>
              {search && <button type="button" onClick={()=>setSearch("")} style={{position:'absolute',right:6,width:30,height:30,borderRadius:'50%',border:'1px solid #ece8de',background:'#fff',display:'grid',placeItems:'center',cursor:'pointer'}}>×</button>}
            </div>
          </div>

          {filteredProducts.length===0 ? (
            <div style={{textAlign:'center',padding:'80px 32px',background:'#fff',border:'1px solid #ece8de',borderRadius:20}}>
              <div style={{width:72,height:72,margin:'0 auto 16px',display:'grid',placeItems:'center',background:'#fafaf7',borderRadius:'50%',fontSize:32}}>🔍</div>
              <h2 style={{margin:'0 0 8px',fontSize:18,fontWeight:900}}>No Products Found</h2>
              <p style={{margin:'0 0 16px',color:'#8c8881',fontSize:13}}>Try changing your search or filters.</p>
              {hasFilters && <button onClick={clearFilters} style={{minHeight:40,padding:'0 18px',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontWeight:700,fontSize:13}}>Clear Filters</button>}
            </div>
          ) : (
            <div className="products-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18}}>
              {filteredProducts.map((product, idx)=>{
                const stock = Number(product.stock);
                const hasStock = product.stock===undefined || stock>0;
                const isAdding = addingId===product.id;
                const name = product.name || "Product";
                const cat = product.category_name || product.category || "Product";
                const price = Number(product.price||0);
                const mrp = Number(product.original_price || product.mrp || price*1.2);
                const disc = mrp>price ? Math.round((1-price/mrp)*100) : 0;
                return (
                  <article key={product.id} className="shop-product-card" style={{
                    background:'#fff',border:'1px solid #ece8de',borderRadius:20,overflow:'hidden',
                    boxShadow:'0 2px 10px rgba(0,0,0,.04)',transition:'.25s cubic-bezier(.16,1,.3,1)',
                    animation:`fadeIn .35s both`,animationDelay:`${idx*40}ms`,
                    display:'flex',flexDirection:'column'
                  }}>
                    <Link to={`/products/${product.id}`} style={{display:'block',position:'relative'}}>
                      <div className="shop-product-image" style={{aspectRatio:'1/1',background:'#fafaf7',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',position:'relative'}}>
                        {product.image ? <img src={product.image} alt={name} loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover',transition:'.4s'}} onError={e=>{e.currentTarget.style.display='none';}} /> : <span style={{fontSize:40}}>📦</span>}
                        {disc>0 && <span style={{position:'absolute',top:10,left:10,padding:'5px 9px',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:10,fontWeight:800}}>{disc}% OFF</span>}
                        {!hasStock && <span style={{position:'absolute',inset:0,background:'rgba(255,255,255,.7)',display:'grid',placeItems:'center',fontSize:12,fontWeight:800,color:'#991b1b'}}>OUT OF STOCK</span>}
                      </div>
                    </Link>

                    <div className="shop-product-info" style={{padding:14,display:'flex',flexDirection:'column',gap:8,flex:1}}>
                      <span style={{fontSize:10,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'#b8b3a9'}}>{cat}</span>
                      <h3 style={{margin:0,fontSize:14,fontWeight:700,lineHeight:1.3,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',minHeight:36}}>{name}</h3>
                      <div style={{display:'flex',alignItems:'baseline',gap:8}}>
                        <p style={{margin:0,fontSize:16,fontWeight:900,color:'#1a1816'}}>₹{price.toLocaleString("en-IN")}</p>
                        {mrp>price && <span style={{fontSize:11,color:'#b8b3a9',textDecoration:'line-through'}}>₹{mrp.toLocaleString("en-IN")}</span>}
                      </div>
                      <p style={{margin:0,fontSize:11,fontWeight:600,color: hasStock ? '#166534' : '#991b1b',display:'flex',alignItems:'center',gap:4}}>
                        <span style={{width:6,height:6,borderRadius:'50%',background: hasStock ? '#22c55e' : '#ef4444',display:'inline-block'}} />
                        {hasStock ? (product.stock!==undefined ? `${stock} items available` : "In Stock") : "Out of stock"}
                      </p>
                      <div className="product-actions" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:'auto',paddingTop:8}}>
                        <Link to={`/products/${product.id}`} style={{minHeight:38,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:12,fontWeight:700,color:'#1a1816'}}>View</Link>
                        <button type="button" disabled={!hasStock || isAdding} onClick={()=>handleAddToCart(product)}
                          style={{minHeight:38,borderRadius:999,background: hasStock ? '#1a1816' : '#f5f2eb',color: hasStock ? '#fff' : '#b8b3a9',border:`1px solid ${hasStock ? '#1a1816' : '#ece8de'}`,fontSize:12,fontWeight:700,cursor: hasStock ? 'pointer' : 'not-allowed',opacity: isAdding ? .7 : 1}}>
                          {isAdding ? '...' : hasStock ? 'Add to Cart' : 'Out'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1} 50%{opacity:.6}}
        .shop-product-card:hover{transform:translateY(-4px);box-shadow:0 12px 24px rgba(0,0,0,.08) !important;}
        .shop-product-card:hover img{transform:scale(1.05);}
        @media(max-width:1100px){.products-content{grid-template-columns:1fr !important;} .products-filter{position:static !important;} .products-grid{grid-template-columns:repeat(2,1fr) !important;}}
        @media(max-width:600px){.products-grid{grid-template-columns:1fr !important;} .products-topbar{flex-direction:column;align-items:stretch !important;}}
      `}</style>
    </main>
  );
}

export default Products;