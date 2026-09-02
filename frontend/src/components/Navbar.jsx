import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getCartCount } from "../services/cartService";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const t = localStorage.getItem("access_token");
      const s = localStorage.getItem("user");
      if (!t || !s) return null;
      return JSON.parse(s);
    } catch { return null; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartCount, setCartCountState] = useState(0);
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => {
    const loadUser = () => {
      try {
        const t = localStorage.getItem("access_token");
        const s = localStorage.getItem("user");
        if (!t || !s) { setUser(null); return; }
        setUser(JSON.parse(s));
      } catch { setUser(null); }
    };
    const onCart = async () => {
      try {
        const c = await getCartCount();
        setCartCountState(c);
        localStorage.setItem("cart_count", String(c));
      } catch {}
    };
    loadUser();
    onCart();
    window.addEventListener("auth-change", loadUser);
    window.addEventListener("cart-change", onCart);
    window.addEventListener("wishlist-change", onCart);
    return () => {
      window.removeEventListener("auth-change", loadUser);
      window.removeEventListener("cart-change", onCart);
      window.removeEventListener("wishlist-change", onCart);
    };
  }, []);

  const closeMenus = () => { setMobileOpen(false); setUserMenuOpen(false); };
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart_count");
    setUser(null);
    setCartCountState(0);
    closeMenus();
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login", { replace: true });
  };
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQ.trim()) return;
    closeMenus();
    navigate(`/products?search=${encodeURIComponent(searchQ.trim())}`);
  };

  // Build nav links cleanly - no spread bug
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
  ];
  if (user) {
    navLinks.push({ to: "/wishlist", label: "Wishlist" });
    navLinks.push({ to: "/cart", label: "Cart", badge: cartCount });
    navLinks.push({ to: "/orders", label: "Orders" });
  }
  if (user?.role === "VENDOR") {
    navLinks.push({ to: "/vendor/dashboard", label: "Vendor" });
  }

  return (
    <header style={{position:'sticky',top:0,zIndex:50,background:'rgba(255,255,255,.92)',backdropFilter:'blur(20px)',borderBottom:'1px solid #ece8de',boxShadow:'0 2px 20px rgba(0,0,0,.04)'}}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 24px',minHeight:64,display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
        <div style={{display:'flex',alignItems:'center',gap:28}}>
          <Link to="/" onClick={closeMenus} style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none'}}>
            <div style={{width:36,height:36,borderRadius:10,background:'#1a1816',color:'#fff',display:'grid',placeItems:'center',fontWeight:900}}>E</div>
            <span style={{fontWeight:900,color:'#1a1816',fontSize:18,letterSpacing:'-.02em'}}>E-SHOP</span>
            <span style={{padding:'2px 6px',borderRadius:999,background:'#f0fdf4',border:'1px solid #bbf7d0',color:'#166534',fontSize:8,fontWeight:800}}>● LIVE</span>
          </Link>
          <nav style={{display:'flex',alignItems:'center',gap:4}}>
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to} onClick={closeMenus} style={({isActive})=>({
                minHeight:36,padding:'0 14px',display:'inline-flex',alignItems:'center',gap:6,borderRadius:999,
                background: isActive?'#1a1816':'transparent', color: isActive?'#fff':'#3d3935',
                fontSize:13,fontWeight:isActive?700:500,textDecoration:'none'
              })}>
                {l.label}
                {l.badge > 0 && <span style={{minWidth:18,height:18,padding:'0 5px',borderRadius:999,background:'#facc15',color:'#1a1816',display:'grid',placeItems:'center',fontSize:10,fontWeight:900}}>{l.badge>99?'99+':l.badge}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <form onSubmit={handleSearch} style={{position:'relative',display:'flex',alignItems:'center'}}>
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search products..." style={{width:200,minHeight:38,padding:'0 16px 0 36px',border:'1px solid #ece8de',borderRadius:999,background:'#fafaf7',outline:'none',fontSize:13}} />
            <button type="submit" style={{position:'absolute',left:8,width:28,height:28,borderRadius:'50%',border:0,background:'transparent',display:'grid',placeItems:'center',fontSize:14,cursor:'pointer'}}>🔍</button>
          </form>

          {!user ? (
            <>
              <Link to="/login" onClick={closeMenus} style={{minHeight:38,padding:'0 16px',display:'inline-flex',alignItems:'center',borderRadius:999,border:'1px solid #ece8de',background:'#fff',color:'#1a1816',fontSize:13,fontWeight:600,textDecoration:'none'}}>Login</Link>
              <Link to="/register" onClick={closeMenus} style={{minHeight:38,padding:'0 18px',display:'inline-flex',alignItems:'center',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none'}}>Register →</Link>
            </>
          ) : (
            <div style={{position:'relative'}}>
              <button type="button" onClick={()=>{setUserMenuOpen(p=>!p); setMobileOpen(false);}} style={{minHeight:40,padding:'0 8px 0 6px',display:'flex',alignItems:'center',gap:8,borderRadius:999,border:'1px solid #ece8de',background:'#fff',cursor:'pointer'}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:'#1a1816',color:'#fff',display:'grid',placeItems:'center',fontSize:12,fontWeight:800}}>{(user.username||user.email||"A")[0].toUpperCase()}</div>
                <span style={{fontSize:13,fontWeight:700,maxWidth:80,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.username||"Account"}</span>
                <span style={{fontSize:10}}>{userMenuOpen?"▲":"▼"}</span>
              </button>
              {userMenuOpen && (
                <div style={{position:'absolute',top:'calc(100% + 8px)',right:0,width:220,background:'#fff',border:'1px solid #ece8de',borderRadius:16,boxShadow:'0 16px 40px rgba(0,0,0,.12)',padding:8,zIndex:20}}>
                  <div style={{padding:'10px 12px',borderBottom:'1px solid #f5f2eb',marginBottom:4}}>
                    <div style={{fontSize:12,fontWeight:800}}>{user.username}</div>
                    <div style={{fontSize:11,color:'#8c8881',overflow:'hidden',textOverflow:'ellipsis'}}>{user.email}</div>
                  </div>
                  <Link to="/profile" onClick={closeMenus} style={{display:'flex',minHeight:38,padding:'0 12px',alignItems:'center',borderRadius:10,textDecoration:'none',color:'#1a1816',fontSize:13,fontWeight:600}}>👤 Profile</Link>
                  <Link to="/settings" onClick={closeMenus} style={{display:'flex',minHeight:38,padding:'0 12px',alignItems:'center',borderRadius:10,textDecoration:'none',color:'#1a1816',fontSize:13,fontWeight:600}}>⚙ Settings</Link>
                  <button onClick={handleLogout} style={{width:'100%',minHeight:38,padding:'0 12px',display:'flex',alignItems:'center',borderRadius:10,border:'1px solid #fecaca',background:'#fef2f2',color:'#991b1b',fontWeight:700,cursor:'pointer',marginTop:4}}>↪ Logout</button>
                </div>
              )}
            </div>
          )}
          <button type="button" onClick={()=>{setMobileOpen(p=>!p); setUserMenuOpen(false);}} style={{width:40,height:40,borderRadius:10,border:'1px solid #ece8de',background:'#fff',display:'grid',placeItems:'center',fontSize:16,cursor:'pointer'}}>{mobileOpen?"✕":"☰"}</button>
        </div>
      </div>

      {mobileOpen && (
        <div style={{padding:'12px 24px 20px',borderTop:'1px solid #f5f2eb',background:'#fff',display:'grid',gap:6}}>
          <form onSubmit={handleSearch} style={{display:'flex',gap:8}}>
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search..." style={{flex:1,minHeight:40,padding:'0 14px',borderRadius:10,border:'1px solid #ece8de'}} />
            <button type="submit" style={{minHeight:40,padding:'0 16px',borderRadius:10,border:0,background:'#1a1816',color:'#fff',fontWeight:700}}>Go</button>
          </form>
          {navLinks.map(l=>(
            <Link key={l.to} to={l.to} onClick={closeMenus} style={{minHeight:44,padding:'0 14px',display:'flex',alignItems:'center',borderRadius:12,background:'#fafaf7',border:'1px solid #f5f2eb',textDecoration:'none',color:'#1a1816',fontSize:14,fontWeight:600}}>{l.label} {l.badge>0?`(${l.badge})`:''}</Link>
          ))}
          {!user && <>
            <Link to="/login" onClick={closeMenus} style={{minHeight:44,padding:'0 14px',display:'flex',alignItems:'center',borderRadius:12,background:'#fff',border:'1px solid #ece8de',textDecoration:'none',color:'#1a1816',fontWeight:600}}>Login</Link>
            <Link to="/register" onClick={closeMenus} style={{minHeight:44,padding:'0 14px',display:'flex',alignItems:'center',borderRadius:12,background:'#1a1816',color:'#fff',textDecoration:'none',fontWeight:700}}>Register →</Link>
          </>}
        </div>
      )}
    </header>
  );
}
export default Navbar;