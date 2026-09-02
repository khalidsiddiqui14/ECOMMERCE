import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/productService";
import { addToCart } from "../services/cartService";
import { addToWishlist } from "../services/wishlistService";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("latest");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [addingId, setAddingId] = useState(null);
  const [wishId, setWishId] = useState(null);
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
    if (q) res = res.filter(p => String(p.name||"").toLowerCase().includes(q) || String(p.description||"").toLowerCase().includes(q) || String(p.category_name||p.category||"").toLowerCase().includes(q));
    if (category) res = res.filter(p => String(p.category_name||p.category||"") === category);
    res = res.filter(p => {
      const price = Number(p.price||0);
      return price >= priceRange[0] && price <= priceRange[1];
    });
    if (sort==="price-low") res.sort((a,b)=>Number(a.price||0)-Number(b.price||0));
    if (sort==="price-high") res.sort((a,b)=>Number(b.price||0)-Number(a.price||0));
    if (sort==="latest") res.sort((a,b)=> new Date(b.created_at||0).getTime() - new Date(a.created_at||0).getTime());
    return res;
  }, [products, search, category, sort, priceRange]);

  const hasFilters = Boolean(search.trim()) || Boolean(category) || sort!=="latest" || priceRange[0]!==0 || priceRange[1]!==100000;
  const clearFilters = () => { setSearch(""); setCategory(""); setSort("latest"); setPriceRange([0,100000]); setCartMessage(""); setCartError(""); };

  const handleAddToCart = async (product) => {
    if (!product?.id) return;
    if (product.stock!==undefined && Number(product.stock)<=0) return;
    setAddingId(product.id); setCartMessage(""); setCartError("");
    try {
      await addToCart(product.id, 1);
      setCartMessage(`${product.name || "Product"} cart mein add ho gaya.`);
      setTimeout(()=>setCartMessage(""), 3500);
    } catch (err) {
      setCartError(err.response?.data?.detail || "Cart mein add nahi ho paaya.");
    } finally {
      setAddingId(null);
    }
  };

  const handleWishlist = async (product) => {
    if (!product?.id) return;
    setWishId(product.id);
    try {
      await addToWishlist(product.id);
      setCartMessage(`♡ ${product.name} wishlist mein add ho gaya.`);
      setTimeout(()=>setCartMessage(""), 3000);
    } catch (err) {
      setCartError(err.response?.data?.detail || "Wishlist mein add nahi ho paaya.");
    } finally {
      setWishId(null);
    }
  };

  if (loading) {
    return (
      <main style={{minHeight:'100vh',background:'#fafaf7',padding:'32px 24px'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{height:100,background:'#fff',border:'1px solid #ece8de',borderRadius:20,marginBottom:20,animation:'pulse 1.5s infinite'}} />
          <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:20}}>
            <div style={{height:400,background:'#fff',border:'1px solid #ece8de',borderRadius:20,animation:'pulse 1.5s infinite'}} />
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18}}>
              {[1,2,3,4,5,6].map(i=>(<div key={i} style={{height:340,background:'#fff',border:'1px solid #ece8de',borderRadius:20,animation:'pulse 1.5s infinite'}} />))}
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
    <main className="products-page" style={{minHeight:'100vh',background:'#fafaf7',padding:'24px'}}>
      {/* Hero Header */}
      <section style={{maxWidth:1200,margin:'0 auto 20px',background:'#1a1816',borderRadius:24,padding:'28px 24px',color:'#fff',position:'relative',overflow:'hidden'}}>
        <div style={{position:'relative',zIndex:1,display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:16}}>
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 12px',background:'rgba(255,255,255,.1)',borderRadius:999,fontSize:10,fontWeight:800,letterSpacing:'.08em',marginBottom:12}}>✦ NEW COLLECTION 2026</div>
            <h1 style={{margin:'0 0 8px',fontSize:'clamp(28px,4vw,38px)',fontWeight:900,letterSpacing:'-.03em'}}>All Products</h1>
            <p style={{margin:0,color:'rgba(255,255,255,.6)',fontSize:14}}>Curated quality • <strong style={{color:'#fff'}}>{products.length} products</strong> • Free delivery above ₹999</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'rgba(255,255,255,.08)',borderRadius:999,fontSize:12}}>
              <span style={{width:8,height:8,borderRadius:'50%',background:'#10b981',display:'inline-block',boxShadow:'0 0 0 3px rgba(16,185,129,.3)'}} /> Live Stock
            </div>
            <div style={{display:'flex',border:'1px solid rgba(255,255,255,.15)',borderRadius:999,overflow:'hidden'}}>
              <button onClick={()=>setViewMode("grid")} style={{width:36,height:36,display:'grid',placeItems:'center',background: viewMode==="grid" ? '#fff' : 'transparent',color: viewMode==="grid" ? '#1a1816' : 'rgba(255,255,255,.6)',border:0,cursor:'pointer',fontSize:14}}>⊞</button>
              <button onClick={()=>setViewMode("list")} style={{width:36,height:36,display:'grid',placeItems:'center',background: viewMode==="list" ? '#fff' : 'transparent',color: viewMode==="list" ? '#1a1816' : 'rgba(255,255,255,.6)',border:0,cursor:'pointer',fontSize:14}}>☰</button>
            </div>
          </div>
        </div>
        <div style={{position:'absolute',width:300,height:300,right:-50,top:-50,background:'radial-gradient(circle,rgba(255,255,255,.08),transparent 70%)',borderRadius:'50%'}} />
      </section>

      {cartMessage && (
        <div style={{maxWidth:1200,margin:'0 auto 16px',display:'flex',gap:10,alignItems:'center',padding:'12px 16px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:14,color:'#166534',fontSize:13,fontWeight:600,animation:'slideDown .3s'}}>
          ✓ {cartMessage} <Link to="/cart" style={{marginLeft:'auto',padding:'6px 12px',borderRadius:999,background:'#166534',color:'#fff',fontSize:11,fontWeight:800}}>Go to Cart →</Link>
        </div>
      )}
      {cartError && (
        <div style={{maxWidth:1200,margin:'0 auto 16px',padding:'12px 16px',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:14,color:'#991b1b',fontSize:13,fontWeight:600}}>
          ⚠ {cartError}
        </div>
      )}

      <section style={{maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'280px 1fr',gap:20,alignItems:'start'}}>
        {/* Ultra Filter Sidebar */}
        <aside style={{position:'sticky',top:88,background:'#fff',border:'1px solid #ece8de',borderRadius:20,overflow:'hidden',boxShadow:'0 4px 20px rgba(0,0,0,.04)'}}>
          <div style={{padding:20,borderBottom:'1px solid #f5f2eb',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <h3 style={{margin:0,fontSize:13,fontWeight:900,letterSpacing:'.06em',display:'flex',alignItems:'center',gap:8}}>☰ FILTERS {hasFilters && <span style={{width:6,height:6,borderRadius:'50%',background:'#ef4444',display:'inline-block'}} />}</h3>
            {hasFilters && <button onClick={clearFilters} style={{fontSize:11,fontWeight:800,color:'#ef4444',background:'#fef2f2',border:'1px solid #fecaca',padding:'4px 10px',borderRadius:999,cursor:'pointer'}}>Clear All ×</button>}
          </div>

          <div style={{padding:20,display:'flex',flexDirection:'column',gap:22}}>
            {/* Search */}
            <div>
              <label style={{display:'block',fontSize:10,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:8,color:'#8c8881'}}>Search</label>
              <div style={{position:'relative'}}>
                <input type="search" placeholder="Search products..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%',minHeight:42,padding:'0 36px 0 36px',border:'1px solid #ece8de',borderRadius:999,background:'#fafaf7',outline:'none',fontSize:13}} />
                <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14}}>🔍</span>
                {search && <button onClick={()=>setSearch("")} style={{position:'absolute',right:6,top:6,width:30,height:30,borderRadius:'50%',border:'1px solid #ece8de',background:'#fff',display:'grid',placeItems:'center',cursor:'pointer'}}>×</button>}
              </div>
            </div>

            {/* Category Pills */}
            <div>
              <label style={{display:'block',fontSize:10,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:10,color:'#8c8881'}}>Category</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                <button onClick={()=>setCategory("")} style={{padding:'6px 12px',borderRadius:999,border:`1px solid ${!category ? '#1a1816' : '#ece8de'}`,background: !category ? '#1a1816' : '#fff',color: !category ? '#fff' : '#1a1816',fontSize:11,fontWeight:700,cursor:'pointer'}}>All</button>
                {categories.map(c=>(
                  <button key={String(c)} onClick={()=>setCategory(String(c))} style={{padding:'6px 12px',borderRadius:999,border:`1px solid ${category===c ? '#1a1816' : '#ece8de'}`,background: category===c ? '#1a1816' : '#fff',color: category===c ? '#fff' : '#1a1816',fontSize:11,fontWeight:700,cursor:'pointer'}}>{String(c)}</button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label style={{display:'block',fontSize:10,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:10,color:'#8c8881'}}>Price Range • ₹{priceRange[0]} - ₹{priceRange[1].toLocaleString()}</label>
              <div style={{display:'flex',gap:10}}>
                <input type="number" placeholder="Min" value={priceRange[0]} onChange={e=>setPriceRange([Number(e.target.value)||0, priceRange[1]])} style={{flex:1,minHeight:38,padding:'0 12px',border:'1px solid #ece8de',borderRadius:999,background:'#fafaf7',fontSize:12}} />
                <input type="number" placeholder="Max" value={priceRange[1]} onChange={e=>setPriceRange([priceRange[0], Number(e.target.value)||100000])} style={{flex:1,minHeight:38,padding:'0 12px',border:'1px solid #ece8de',borderRadius:999,background:'#fafaf7',fontSize:12}} />
              </div>
              <input type="range" min={0} max={100000} step={500} value={priceRange[1]} onChange={e=>setPriceRange([priceRange[0], Number(e.target.value)])} style={{width:'100%',marginTop:10,accentColor:'#1a1816'}} />
            </div>

            {/* Sort */}
            <div>
              <label style={{display:'block',fontSize:10,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:8,color:'#8c8881'}}>Sort By</label>
              <select value={sort} onChange={e=>setSort(e.target.value)} style={{width:'100%',minHeight:42,padding:'0 14px',border:'1px solid #ece8de',borderRadius:999,background:'#fff',fontSize:13,outline:'none'}}>
                <option value="latest">✨ Latest First</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💎 Price: High to Low</option>
              </select>
            </div>

            <div style={{padding:12,background:'#fafaf7',border:'1px dashed #ece8de',borderRadius:12,fontSize:11,lineHeight:1.5,color:'#8c8881'}}>
              Showing <strong style={{color:'#1a1816'}}>{filteredProducts.length}</strong> of {products.length} products
            </div>
          </div>
        </aside>

        {/* Products */}
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:12}}>
            <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
              <span style={{fontSize:12,fontWeight:700,padding:'8px 14px',background:'#fff',border:'1px solid #ece8de',borderRadius:999}}>
                Showing <strong>{filteredProducts.length}</strong> results
              </span>
              {category && <span style={{padding:'6px 12px',background:'#1a1816',color:'#fff',borderRadius:999,fontSize:11,fontWeight:700,display:'inline-flex',alignItems:'center',gap:6}}>{category} <button onClick={()=>setCategory("")} style={{background:'rgba(255,255,255,.2)',border:0,color:'#fff',width:16,height:16,borderRadius:'50%',display:'grid',placeItems:'center',cursor:'pointer'}}>×</button></span>}
            </div>
          </div>

          {filteredProducts.length===0 ? (
            <div style={{textAlign:'center',padding:'80px 32px',background:'#fff',border:'1px solid #ece8de',borderRadius:20}}>
              <div style={{width:72,height:72,margin:'0 auto 16px',display:'grid',placeItems:'center',background:'#fafaf7',borderRadius:'50%',fontSize:32}}>🔍</div>
              <h2 style={{margin:'0 0 8px',fontSize:18,fontWeight:900}}>No Products Found</h2>
              <p style={{margin:'0 0 16px',color:'#8c8881',fontSize:13}}>Try adjusting filters or search terms.</p>
              {hasFilters && <button onClick={clearFilters} style={{minHeight:40,padding:'0 18px',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontWeight:700,fontSize:13}}>Clear All Filters</button>}
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns: viewMode==="grid" ? 'repeat(3,1fr)' : '1fr',gap:16}}>
              {filteredProducts.map((product, idx)=>{
                const stock = Number(product.stock);
                const hasStock = product.stock===undefined || stock>0;
                const isAdding = addingId===product.id;
                const isWishing = wishId===product.id;
                const name = product.name || "Product";
                const cat = product.category_name || product.category || "Product";
                const price = Number(product.price||0);
                const mrp = Number(product.original_price || product.mrp || price*1.25);
                const disc = mrp>price ? Math.round((1-price/mrp)*100) : 0;

                if (viewMode==="list") {
                  return (
                    <article key={product.id} style={{display:'grid',gridTemplateColumns:'120px 1fr auto',gap:16,background:'#fff',border:'1px solid #ece8de',borderRadius:16,padding:12,alignItems:'center',animation:`fadeIn .35s both`,animationDelay:`${idx*30}ms`}}>
                      <Link to={`/products/${product.id}`} style={{width:120,height:120,background:'#fafaf7',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                        {product.image ? <img src={product.image} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span style={{fontSize:32}}>📦</span>}
                      </Link>
                      <div style={{minWidth:0}}>
                        <span style={{fontSize:10,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'#b8b3a9'}}>{cat}</span>
                        <h3 style={{margin:'4px 0 6px',fontSize:15,fontWeight:700,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{name}</h3>
                        <div style={{display:'flex',alignItems:'baseline',gap:8}}>
                          <span style={{fontSize:16,fontWeight:900}}>₹{price.toLocaleString("en-IN")}</span>
                          {mrp>price && <><span style={{fontSize:12,color:'#b8b3a9',textDecoration:'line-through'}}>₹{mrp.toLocaleString("en-IN")}</span><span style={{fontSize:10,fontWeight:800,color:'#166534',background:'#f0fdf4',padding:'2px 6px',borderRadius:999}}>{disc}% OFF</span></>}
                        </div>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:8}}>
                        <Link to={`/products/${product.id}`} style={{minHeight:36,padding:'0 16px',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:12,fontWeight:700}}>View</Link>
                        <button disabled={!hasStock || isAdding} onClick={()=>handleAddToCart(product)} style={{minHeight:36,padding:'0 16px',borderRadius:999,background: hasStock ? '#1a1816' : '#f5f2eb',color: hasStock ? '#fff' : '#b8b3a9',border:0,fontSize:12,fontWeight:700,cursor:'pointer'}}>{isAdding ? '...' : 'Add'}</button>
                      </div>
                    </article>
                  );
                }

                return (
                  <article key={product.id} style={{
                    background:'#fff',border:'1px solid #ece8de',borderRadius:20,overflow:'hidden',
                    boxShadow:'0 2px 12px rgba(0,0,0,.04)',transition:'.3s cubic-bezier(.16,1,.3,1)',
                    animation:`fadeIn .4s both`,animationDelay:`${idx*35}ms`,
                    display:'flex',flexDirection:'column',position:'relative'
                  }}>
                    <Link to={`/products/${product.id}`} style={{display:'block',position:'relative'}}>
                      <div style={{aspectRatio:'1/1',background:'#fafaf7',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',position:'relative'}}>
                        {product.image ? <img src={product.image} alt={name} loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover',transition:'.5s'}} /> : <span style={{fontSize:44}}>📦</span>}
                        {disc>0 && <span style={{position:'absolute',top:12,left:12,padding:'6px 10px',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:10,fontWeight:800,letterSpacing:'.04em',boxShadow:'0 4px 12px rgba(0,0,0,.15)'}}>{disc}% OFF</span>}
                        <button onClick={(e)=>{e.preventDefault(); handleWishlist(product);}} disabled={isWishing} style={{position:'absolute',top:12,right:12,width:36,height:36,borderRadius:'50%',background:'#fff',border:'1px solid #ece8de',display:'grid',placeItems:'center',fontSize:16,cursor:'pointer',boxShadow:'0 2px 8px rgba(0,0,0,.08)',transition:'.2s'}}>{isWishing ? '...' : '♡'}</button>
                        {!hasStock && <span style={{position:'absolute',inset:0,background:'rgba(255,255,255,.75)',backdropFilter:'blur(4px)',display:'grid',placeItems:'center',fontSize:12,fontWeight:800,color:'#991b1b'}}>OUT OF STOCK</span>}
                      </div>
                    </Link>

                    <div style={{padding:14,display:'flex',flexDirection:'column',gap:8,flex:1}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <span style={{fontSize:10,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'#b8b3a9'}}>{cat}</span>
                        <span style={{display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:700}}><span style={{width:6,height:6,borderRadius:'50%',background: hasStock ? '#22c55e' : '#ef4444',display:'inline-block'}} />{hasStock ? 'In Stock' : 'Out'}</span>
                      </div>
                      <h3 style={{margin:0,fontSize:14,fontWeight:700,lineHeight:1.3,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',minHeight:36}}>{name}</h3>
                      <div style={{display:'flex',alignItems:'baseline',gap:8,flexWrap:'wrap'}}>
                        <p style={{margin:0,fontSize:17,fontWeight:900,color:'#1a1816'}}>₹{price.toLocaleString("en-IN")}</p>
                        {mrp>price && <><span style={{fontSize:11,color:'#b8b3a9',textDecoration:'line-through'}}>₹{mrp.toLocaleString("en-IN")}</span><span style={{fontSize:10,fontWeight:800,color:'#166534'}}>Save ₹{(mrp-price).toLocaleString("en-IN")}</span></>}
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:'auto',paddingTop:10}}>
                        <Link to={`/products/${product.id}`} style={{minHeight:40,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:12,fontWeight:700,color:'#1a1816',transition:'.2s'}}>View Details</Link>
                        <button disabled={!hasStock || isAdding} onClick={()=>handleAddToCart(product)} style={{minHeight:40,borderRadius:999,background: hasStock ? '#1a1816' : '#f5f2eb',color: hasStock ? '#fff' : '#b8b3a9',border:`1px solid ${hasStock ? '#1a1816' : '#ece8de'}`,fontSize:12,fontWeight:800,cursor: hasStock ? 'pointer' : 'not-allowed',opacity: isAdding ? .7 : 1,transition:'.2s',boxShadow: hasStock ? '0 4px 12px rgba(0,0,0,.15)' : 'none'}}>
                          {isAdding ? 'Adding...' : hasStock ? 'Add to Cart' : 'Out of Stock'}
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
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1} 50%{opacity:.6}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)}}
        .shop-product-card:hover{transform:translateY(-6px);box-shadow:0 16px 32px rgba(0,0,0,.1) !important;}
        @media(max-width:1100px){section{grid-template-columns:1fr !important;} aside{position:static !important;}}
        @media(max-width:640px){div[style*="gridTemplateColumns: repeat(3"]{grid-template-columns:1fr !important;}}
      `}</style>
    </main>
  );
}

export default Products;