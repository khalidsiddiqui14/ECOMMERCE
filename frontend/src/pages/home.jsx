import { useState } from "react";
import { Link } from "react-router-dom";
import { addToWishlist } from "../services/wishlistService";

const categories = [
  { name: "Smartphones", icon: "📱", text: "Latest smartphones", count: "120+" },
  { name: "Laptops", icon: "💻", text: "Powerful laptops", count: "85+" },
  { name: "Smart Watches", icon: "⌚", text: "Wearable tech", count: "60+" },
  { name: "Audio", icon: "🎧", text: "Premium sound", count: "200+" },
];

const products = [
  { id: 1, name: "Wireless Headphones", category: "Audio", icon: "🎧", price: "3,999", oldPrice: "4,999", rating: "4.8", badge: "BEST SELLER" },
  { id: 2, name: "Premium Smartphone", category: "Electronics", icon: "📱", price: "29,999", oldPrice: "34,999", rating: "4.9", badge: "NEW" },
  { id: 3, name: "Performance Laptop", category: "Computers", icon: "💻", price: "59,999", oldPrice: "69,999", rating: "4.8", badge: "30% OFF" },
  { id: 4, name: "Smart Watch Pro", category: "Wearables", icon: "⌚", price: "4,999", oldPrice: "6,499", rating: "4.7", badge: "HOT" },
  { id: 5, name: "Bluetooth Speaker", category: "Audio", icon: "🔊", price: "2,499", oldPrice: "3,299", rating: "4.8", badge: "SALE" },
];

const productTabs = ["All Products", "Electronics", "Accessories", "Fashion"];

function Home() {
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  const filteredProducts =
    activeCategory === "All Products"
      ? products
      : activeCategory === "Electronics"
      ? products.filter((p) => p.category === "Electronics" || p.category === "Computers")
      : activeCategory === "Accessories"
      ? products.filter((p) => p.category === "Audio" || p.category === "Wearables")
      : [];

  const handleAddToWishlist = async (product) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setWishlistMessage("Please login to add products to your wishlist.");
      return;
    }
    setWishlistLoadingId(product.id);
    setWishlistMessage("");
    try {
      await addToWishlist(product.id);
      setWishlistMessage(`${product.name} added to your wishlist.`);
      setTimeout(() => setWishlistMessage(""), 3000);
    } catch (error) {
      console.error("HOME WISHLIST ERROR:", error);
      setWishlistMessage(error.response?.data?.detail || error.response?.data?.message || "Product wishlist me add nahi ho paaya.");
    } finally {
      setWishlistLoadingId(null);
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterMessage("Thanks for subscribing! We'll keep you updated.");
    setNewsletterEmail("");
    setTimeout(() => setNewsletterMessage(""), 4000);
  };

  return (
    <main className="home">
      {/* Top Bar */}
      <div className="home-top-bar">
        <div className="home-container home-top-inner">
          <span style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#10b981',display:'inline-block',boxShadow:'0 0 0 3px rgba(16,185,129,.2)'}} />
            Free shipping on orders above ₹999 • COD available
          </span>
          <div className="home-top-links">
            <span>🇮🇳 India</span>
            <span>English</span>
            <Link to="/notifications">Help & Updates</Link>
          </div>
        </div>
      </div>

      {/* Hero - 10/10 */}
      <section className="home-hero">
        <div className="home-container home-hero-grid">
          <div className="home-hero-content">
            <span className="home-hero-badge">
              <b style={{width:20,height:20,borderRadius:'50%',background:'#10b981',color:'#fff',display:'grid',placeItems:'center',fontSize:10}}>✦</b>
              NEW COLLECTION · 2026
            </span>

            <h1>
              Discover a New<br />
              <span>Shopping Experience</span>
            </h1>

            <p>
              Premium electronics, smart accessories and <b style={{color:'#1a1816'}}>everyday essentials</b> from trusted vendors across India.
            </p>

            <div className="home-hero-buttons">
              <Link to="/products" className="home-primary-button">
                Shop Now <span>→</span>
              </Link>
              <Link to="/products" className="home-outline-button">
                Explore Products
              </Link>
            </div>

            <div className="home-hero-stats">
              <div><strong>1000+</strong><span>Products</span></div>
              <div><strong>50+</strong><span>Vendors</span></div>
              <div><strong>4.8★</strong><span>Rating</span></div>
            </div>
          </div>

          <div className="home-hero-product">
            <div className="home-hero-glow" aria-hidden="true" />
            <div className="home-hero-product-image" role="img" aria-label="Wireless headphones">
              🎧
            </div>
            <div className="home-hero-product-info">
              <span>FEATURED PRODUCT</span>
              <h2>Wireless<br />Headphones</h2>
              <div className="home-hero-price">₹3,999 <small style={{fontSize:13,textDecoration:'line-through',color:'#b8b3a9',marginLeft:8}}>₹4,999</small></div>
              <Link to="/products/1" className="home-primary-button" style={{marginTop:16,minHeight:44,padding:'0 20px',fontSize:14}}>
                Buy Now <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - Premium */}
      <section className="home-benefits" style={{background:'#fff',borderBottom:'1px solid #ece8de'}}>
        <div className="home-container home-benefits-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:24,padding:'22px 0'}}>
          {[
            {icon:'🚚',title:'Fast Delivery',sub:'Across India'},
            {icon:'🔒',title:'Secure Payments',sub:'Protected checkout'},
            {icon:'✓',title:'Trusted Vendors',sub:'Verified sellers'},
            {icon:'↩',title:'Easy Returns',sub:'30 days policy'},
          ].map((b)=>(
            <div key={b.title} className="home-benefit" style={{display:'flex',alignItems:'center',gap:12}}>
              <div className="home-benefit-icon" style={{width:44,height:44,display:'grid',placeItems:'center',background:'#fafaf7',border:'1px solid #ece8de',borderRadius:12,fontSize:18}}>{b.icon}</div>
              <div><strong style={{display:'block',fontSize:14,color:'#1a1816'}}>{b.title}</strong><span style={{fontSize:12,color:'#8c8881'}}>{b.sub}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories - Bento 10/10 */}
      <section className="home-section">
        <div className="home-container">
          <div className="home-section-heading">
            <div>
              <span className="home-label" style={{fontSize:11,fontWeight:800,letterSpacing:'.12em',color:'#8c8881'}}>EXPLORE</span>
              <h2>Shop by Category</h2>
              <p>Find everything you need in one place.</p>
            </div>
            <Link to="/products" className="home-view-all">View All <span>→</span></Link>
          </div>

          <div className="home-category-grid">
            {categories.map((cat, i)=>(
              <Link to="/products" className="home-category-card" key={cat.name} style={{position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:16,right:16,padding:'4px 8px',background:'#fafaf7',border:'1px solid #ece8de',borderRadius:999,fontSize:10,fontWeight:800}}>{cat.count}</div>
                <div className="home-category-icon">{cat.icon}</div>
                <div>
                  <span style={{fontSize:12,color:'#8c8881'}}>{cat.text}</span>
                  <h3 style={{margin:'6px 0 12px'}}>{cat.name}</h3>
                  <strong style={{fontSize:13,display:'inline-flex',gap:6}}>Shop Now <span>→</span></strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - 10/10 */}
      <section className="home-section home-products-section" style={{background:'#fafaf7'}}>
        <div className="home-container">
          <div className="home-section-heading">
            <div>
              <span className="home-label" style={{fontSize:11,fontWeight:800,letterSpacing:'.12em',color:'#8c8881'}}>TRENDING NOW</span>
              <h2>Featured Products</h2>
              <p>Discover our most popular products.</p>
            </div>
            <Link to="/products" className="home-view-all">View All <span>→</span></Link>
          </div>

          <div className="home-product-tabs" role="tablist" style={{display:'flex',gap:8,marginBottom:24,overflowX:'auto',paddingBottom:4}}>
            {productTabs.map((tab)=>(
              <button
                key={tab}
                role="tab"
                aria-selected={activeCategory===tab}
                onClick={()=>setActiveCategory(tab)}
                style={{
                  minHeight:40,padding:'0 18px',borderRadius:999,border:'1px solid',
                  borderColor: activeCategory===tab ? '#1a1816' : '#ece8de',
                  background: activeCategory===tab ? '#1a1816' : '#fff',
                  color: activeCategory===tab ? '#fff' : '#3d3935',
                  fontSize:13,fontWeight:700,whiteSpace:'nowrap',transition:'.2s',cursor:'pointer'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {wishlistMessage && (
            <div role="status" style={{
              padding:'12px 16px',marginBottom:20,borderRadius:12,
              background: wishlistMessage.includes('added') ? '#f0fdf4' : '#fffbeb',
              border:`1px solid ${wishlistMessage.includes('added') ? '#bbf7d0' : '#fde68a'}`,
              color: wishlistMessage.includes('added') ? '#166534' : '#92400e',
              fontSize:13,fontWeight:600,display:'flex',alignItems:'center',gap:8
            }}>
              <span>{wishlistMessage.includes('added') ? '✓' : 'ℹ️'}</span> {wishlistMessage}
            </div>
          )}

          {filteredProducts.length===0 ? (
            <div className="products-empty" style={{textAlign:'center',padding:'60px 24px',background:'#fff',border:'1px solid #ece8de',borderRadius:24}}>
              <h2>No Products Found</h2>
              <p>No products are available in this category right now.</p>
              <Link to="/products" className="btn btn-primary" style={{display:'inline-flex',marginTop:16,padding:'0 20px',minHeight:42,background:'#1a1816',color:'#fff',borderRadius:999,fontWeight:700}}>Browse All Products</Link>
            </div>
          ) : (
            <div className="home-product-grid">
              {filteredProducts.map((product,i)=>{
                const isLoading = wishlistLoadingId===product.id;
                return (
                  <article key={product.id} className="home-product-card" style={{animationDelay:`${i*60}ms`}}>
                    <div className="home-product-image">
                      <span className="home-sale-badge" style={{
                        position:'absolute',top:12,left:12,padding:'6px 10px',borderRadius:999,
                        background:'#1a1816',color:'#fff',fontSize:10,fontWeight:800,letterSpacing:'.04em',zIndex:2
                      }}>
                        {product.badge}
                      </span>
                      <button
                        type="button"
                        className="home-heart"
                        onClick={()=>handleAddToWishlist(product)}
                        disabled={isLoading}
                        aria-label={`Add ${product.name} to wishlist`}
                        style={{
                          position:'absolute',top:12,right:12,width:38,height:38,
                          background:'rgba(255,255,255,.9)',backdropFilter:'blur(10px)',
                          border:'1px solid #ece8de',borderRadius:'50%',display:'grid',placeItems:'center',
                          fontSize:16,cursor:'pointer',zIndex:2,transition:'.2s'
                        }}
                      >
                        {isLoading ? '...' : '♡'}
                      </button>
                      <div className="home-product-emoji">{product.icon}</div>
                    </div>
                    <div className="home-product-content">
                      <span className="home-product-category" style={{fontSize:10,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'#b8b3a9'}}>{product.category}</span>
                      <h3 style={{margin:'6px 0 8px'}}>{product.name}</h3>
                      <div className="home-product-rating" style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
                        <span style={{color:'#f59e0b',fontSize:12}}>★★★★★</span>
                        <small style={{fontSize:11,fontWeight:700,background:'#fffbeb',padding:'2px 6px',borderRadius:999}}>{product.rating}</small>
                      </div>
                      <div className="home-product-price" style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:14}}>
                        <strong style={{fontSize:18}}>₹{product.price}</strong>
                        <del style={{fontSize:12,color:'#b8b3a9'}}>₹{product.oldPrice}</del>
                      </div>
                      <Link to={`/products/${product.id}`} className="home-cart-button" style={{
                        display:'flex',alignItems:'center',justifyContent:'center',gap:6,
                        minHeight:42,background:'#1a1816',color:'#fff',borderRadius:999,
                        fontSize:13,fontWeight:700,transition:'.3s'
                      }}>
                        View Product <span>→</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Deal - 10/10 */}
      <section className="home-deal" style={{background:'#1a1816',color:'#fff',padding:'80px 0',position:'relative',overflow:'hidden'}}>
        <div className="home-container home-deal-grid" style={{display:'grid',gridTemplateColumns:'1.1fr .9fr',gap:40,alignItems:'center',position:'relative',zIndex:1}}>
          <div>
            <span className="home-label" style={{background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.15)',padding:'6px 12px',borderRadius:999,fontSize:11,fontWeight:800,letterSpacing:'.08em'}}>LIMITED TIME OFFER</span>
            <h2 style={{margin:'20px 0 16px',fontSize:'clamp(32px,4vw,48px)',lineHeight:.95,fontWeight:900,letterSpacing:'-.04em'}}>
              Big Savings.<br />Better Shopping.
            </h2>
            <p style={{margin:'0 0 28px',color:'rgba(255,255,255,.65)',fontSize:16,lineHeight:1.6}}>
              Get up to 30% off on selected electronics and accessories. Limited time only.
            </p>
            <Link to="/products" className="home-primary-button" style={{background:'#fff',color:'#1a1816',borderColor:'#fff'}}>
              Shop Deals <span>→</span>
            </Link>
          </div>
          <div className="home-deal-visual" aria-hidden="true" style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',minHeight:320}}>
            <div className="home-discount-circle" style={{
              width:180,height:180,borderRadius:'50%',background:'#fff',color:'#1a1816',
              display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
              boxShadow:'0 20px 60px rgba(0,0,0,.3)',transform:'rotate(-6deg)'
            }}>
              <span style={{fontSize:11,fontWeight:800,letterSpacing:'.1em'}}>UP TO</span>
              <strong style={{fontSize:48,fontWeight:900,lineHeight:.9}}>30%</strong>
              <span style={{fontSize:11,fontWeight:800,letterSpacing:'.1em'}}>OFF</span>
            </div>
            <div className="home-deal-icons" style={{position:'absolute',fontSize:32,opacity:.2,display:'flex',gap:16,top:'10%',right:'10%'}}>📱 💻 🎧 ⌚</div>
          </div>
        </div>
        <div style={{position:'absolute',width:600,height:600,right:'-10%',top:'-20%',background:'radial-gradient(circle,rgba(124,58,237,.35),transparent 70%)',filter:'blur(30px)',pointerEvents:'none'}} />
      </section>

      {/* Trending */}
      <section className="home-section">
        <div className="home-container">
          <div className="home-section-heading">
            <div>
              <span className="home-label" style={{fontSize:11,fontWeight:800,letterSpacing:'.12em',color:'#8c8881'}}>BEST SELLERS</span>
              <h2>Trending Products</h2>
              <p>Products customers are loving right now.</p>
            </div>
            <Link to="/products" className="home-view-all">Explore All <span>→</span></Link>
          </div>
          <div className="home-trending-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
            {products.slice(0,4).map((p)=>(
              <Link to={`/products/${p.id}`} key={p.id} className="home-trending-card" style={{
                display:'flex',alignItems:'center',gap:16,padding:16,
                background:'#fff',border:'1px solid #ece8de',borderRadius:16,transition:'.2s'
              }}>
                <div className="home-trending-image" style={{width:56,height:56,display:'grid',placeItems:'center',background:'#fafaf7',border:'1px solid #ece8de',borderRadius:12,fontSize:24}}>{p.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <span style={{fontSize:10,fontWeight:800,letterSpacing:'.08em',color:'#b8b3a9',textTransform:'uppercase'}}>{p.category}</span>
                  <h3 style={{margin:'2px 0',fontSize:14,fontWeight:700,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</h3>
                  <strong style={{fontSize:14}}>₹{p.price}</strong>
                </div>
                <b style={{fontSize:14}}>→</b>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews - Premium */}
      <section className="home-reviews" style={{background:'#fafaf7',padding:'88px 0',borderTop:'1px solid #ece8de',borderBottom:'1px solid #ece8de'}}>
        <div className="home-container">
          <div className="home-section-heading centered" style={{textAlign:'center',justifyContent:'center'}}>
            <div>
              <span className="home-label" style={{fontSize:11,fontWeight:800,letterSpacing:'.12em',color:'#8c8881'}}>CUSTOMER REVIEWS</span>
              <h2>What Our Customers Say</h2>
              <p>Real experiences from our customers.</p>
            </div>
          </div>
          <div className="home-review-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20,marginTop:24}}>
            {[
              {name:'Rahul Sharma',initial:'R',text:'Great products and very fast delivery. The shopping experience was excellent.'},
              {name:'Aman Khan',initial:'A',text:'Product quality was better than expected. I will definitely shop again.'},
              {name:'Sara Ali',initial:'S',text:'Easy ordering, good prices and excellent customer support.'},
            ].map((r)=>(
              <article key={r.name} className="home-review-card" style={{padding:24,background:'#fff',border:'1px solid #ece8de',borderRadius:20,boxShadow:'0 2px 10px rgba(0,0,0,.04)'}}>
                <div className="home-review-stars" style={{color:'#f59e0b',fontSize:14,marginBottom:12}}>★★★★★</div>
                <p style={{margin:'0 0 16px',color:'#3d3935',lineHeight:1.6}}>"{r.text}"</p>
                <div className="home-review-user" style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:'#1a1816',color:'#fff',display:'grid',placeItems:'center',fontSize:12,fontWeight:800}}>{r.initial}</div>
                  <strong style={{fontSize:13}}>{r.name}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter - 10/10 */}
      <section className="home-newsletter" style={{padding:'72px 0',background:'#fff'}}>
        <div className="home-container home-newsletter-inner" style={{display:'grid',gridTemplateColumns:'1.1fr .9fr',gap:40,alignItems:'center',padding:32,background:'#1a1816',borderRadius:24,color:'#fff'}}>
          <div>
            <span className="home-label" style={{background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.15)',padding:'6px 12px',borderRadius:999,fontSize:11,fontWeight:800}}>STAY UPDATED</span>
            <h2 style={{margin:'16px 0 10px',fontSize:28,fontWeight:900,letterSpacing:'-.03em'}}>Get the Latest Deals</h2>
            <p style={{margin:0,color:'rgba(255,255,255,.65)',lineHeight:1.6}}>Subscribe for new products, exclusive offers and special deals.</p>
          </div>
          <div>
            <form onSubmit={handleNewsletterSubmit} className="home-newsletter-form" style={{display:'flex',gap:8}}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e)=>setNewsletterEmail(e.target.value)}
                required
                style={{flex:1,minHeight:48,padding:'0 16px',borderRadius:999,border:'1px solid rgba(255,255,255,.15)',background:'rgba(255,255,255,.08)',color:'#fff',outline:'none',fontSize:14}}
              />
              <button type="submit" style={{minHeight:48,padding:'0 20px',borderRadius:999,background:'#fff',color:'#1a1816',border:0,fontWeight:800,fontSize:13,cursor:'pointer'}}>
                Subscribe →
              </button>
            </form>
            {newsletterMessage && (
              <p role="status" style={{margin:'12px 0 0',padding:'10px 12px',background:'rgba(16,185,129,.15)',border:'1px solid rgba(16,185,129,.3)',borderRadius:10,color:'#6ee7b7',fontSize:12,fontWeight:600}}>
                ✓ {newsletterMessage}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;