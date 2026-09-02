import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWishlist, removeFromWishlist } from "../services/wishlistService";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");

  const loadWishlist = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const data = await getWishlist();
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.items)
        ? data.items
        : [];
      setWishlist(items);
    } catch (err) {
      console.error("WISHLIST ERROR:", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          "Wishlist load nahi ho paayi."
      );
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleRemove = async (itemId) => {
    if (!itemId || removingId === itemId) return;
    setRemovingId(itemId);
    setError("");
    try {
      await removeFromWishlist(itemId);
      setWishlist((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error("REMOVE ERROR:", err);
      setError(err.response?.data?.detail || "Item remove nahi ho paaya.");
    } finally {
      setRemovingId(null);
    }
  };

  // Loading Skeleton - 10/10
  if (loading) {
    return (
      <main className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-header">
            <div>
              <div className="skeleton" style={{width:180,height:36,borderRadius:12,background:'#f1eee8'}} />
              <div className="skeleton" style={{width:120,height:14,marginTop:10,borderRadius:8,background:'#f1eee8'}} />
            </div>
          </div>
          <div className="wishlist-grid">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="wishlist-card" style={{animationDelay:`${i*80}ms`}}>
                <div className="wishlist-image" style={{background:'linear-gradient(100deg,#f5f2eb 30%,#fafaf7 50%,#f5f2eb 70%)',backgroundSize:'200% 100%',animation:'shimmer 1.5s infinite'}} />
                <div className="wishlist-info">
                  <div style={{height:18,background:'#f1eee8',borderRadius:8,marginBottom:10}} />
                  <div style={{height:14,width:'60%',background:'#f1eee8',borderRadius:8}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error && wishlist.length === 0) {
    return (
      <main className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">⚠️</div>
            <h2>Unable to Load Wishlist</h2>
            <p>{error}</p>
            <button type="button" className="btn btn-primary" onClick={() => loadWishlist()}>
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="wishlist-page">
      <div className="wishlist-container">
        {/* Header - Premium */}
        <div className="wishlist-header">
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <h1>My Wishlist</h1>
              {wishlist.length > 0 && (
                <span style={{
                  minWidth:28,height:28,display:'grid',placeItems:'center',
                  background:'var(--ink)',color:'#fff',borderRadius:999,
                  fontSize:12,fontWeight:800
                }}>
                  {wishlist.length}
                </span>
              )}
            </div>
            <p>
              {wishlist.length === 0
                ? "Save products you love"
                : `${wishlist.length} saved product${wishlist.length === 1 ? "" : "s"} • Updated just now`}
            </p>
          </div>
          <Link to="/products" className="btn btn-secondary">
            Continue Shopping →
          </Link>
        </div>

        {error && (
          <div className="auth-error" role="alert" style={{
            background:'#fef2f2',border:'1px solid #fecaca',color:'#991b1b',
            padding:'12px 16px',borderRadius:12,marginBottom:20,fontSize:13,fontWeight:600
          }}>
            {error}
          </div>
        )}

        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon" aria-hidden="true">
              <span style={{
                width:80,height:80,display:'grid',placeItems:'center',
                background:'var(--bg-2)',border:'1px solid var(--line)',borderRadius:'50%',
                fontSize:36
              }}>♡</span>
            </div>
            <h2>Your Wishlist is Empty</h2>
            <p>
              Save products you love and find them here later.<br />
              Start exploring our new collection 2026.
            </p>
            <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:24}}>
              <Link to="/products" className="btn btn-primary">
                Browse Products
              </Link>
              <Link to="/" className="btn btn-secondary">
                Go Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((item, index) => {
              const product = item.product || item;
              const productId = product.id || item.product;
              const productName = product.name || `Product #${productId}`;
              const productPrice = Number(product.price || 0);
              const originalPrice = Number(product.original_price || product.mrp || 0);
              const hasDiscount = originalPrice > productPrice && originalPrice > 0;
              const discount = hasDiscount ? Math.round(((originalPrice - productPrice) / originalPrice) * 100) : 0;
              const image = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : product.image;
              const isRemoving = removingId === item.id;

              return (
                <article
                  className="wishlist-card"
                  key={item.id || productId}
                  style={{
                    animation:`fadeIn .5s var(--ease) both`,
                    animationDelay:`${index * 60}ms`,
                    opacity: isRemoving ? 0.6 : 1,
                    transform: isRemoving ? 'scale(0.97)' : 'scale(1)',
                    transition:'all .35s var(--ease)'
                  }}
                >
                  <div className="wishlist-image">
                    {image ? (
                      <img
                        src={image}
                        alt={productName}
                        loading="lazy"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <span style={{fontSize:48}}>📦</span>
                    )}

                    {/* Top badges */}
                    <div style={{position:'absolute',top:12,left:12,display:'flex',gap:6}}>
                      {hasDiscount && (
                        <span style={{
                          padding:'5px 9px',borderRadius:999,
                          background:'var(--ink)',color:'#fff',
                          fontSize:10,fontWeight:800,letterSpacing:'.04em'
                        }}>
                          {discount}% OFF
                        </span>
                      )}
                    </div>

                    {/* Remove */}
                    <button
                      className="wishlist-remove"
                      onClick={() => handleRemove(item.id)}
                      disabled={isRemoving}
                      aria-label={`Remove ${productName}`}
                      title="Remove"
                    >
                      {isRemoving ? '...' : '✕'}
                    </button>
                  </div>

                  <div className="wishlist-info">
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                      <span style={{fontSize:10,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--muted-2)'}}>
                        {product.category || 'E-SHOP'}
                      </span>
                      {product.rating && (
                        <span style={{
                          display:'inline-flex',alignItems:'center',gap:3,
                          padding:'2px 6px',background:'var(--amber-soft)',borderRadius:999,
                          fontSize:11,fontWeight:700,color:'#92400e'
                        }}>
                          ★ {product.rating}
                        </span>
                      )}
                    </div>

                    <h3 style={{
                      display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',
                      overflow:'hidden',minHeight:44,lineHeight:1.35
                    }}>
                      {productName}
                    </h3>

                    <div style={{display:'flex',alignItems:'baseline',gap:8,margin:'8px 0 16px'}}>
                      <p className="wishlist-price" style={{margin:0}}>
                        ₹{productPrice.toLocaleString("en-IN")}
                      </p>
                      {hasDiscount && (
                        <span style={{fontSize:12,color:'var(--muted-2)',textDecoration:'line-through'}}>
                          ₹{originalPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <div className="wishlist-actions">
                      <Link
                        to={`/products/${productId}`}
                        className="btn btn-secondary"
                        style={{flex:1}}
                      >
                        View
                      </Link>
                      <Link
                        to={`/products/${productId}`}
                        className="btn btn-primary"
                        style={{flex:1.3}}
                      >
                        Buy Now
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(12px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position:-200% 0; }
          100% { background-position:200% 0; }
        }
        .wishlist-card:hover .wishlist-image img {
          transform:scale(1.06);
          transition:transform .6s var(--ease);
        }
        .wishlist-image img {
          transition:transform .6s var(--ease);
        }
      `}</style>
    </main>
  );
}

export default Wishlist;