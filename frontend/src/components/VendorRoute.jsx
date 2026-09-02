import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

function VendorRoute() {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState("checking"); // checking | unauth | not_vendor | pending | vendor

  useEffect(() => {
    const check = () => {
      const token = localStorage.getItem("access_token");
      const stored = localStorage.getItem("user");

      if (!token || !stored) {
        setStatus("unauth");
        setChecking(false);
        return;
      }

      let user = null;
      try {
        user = JSON.parse(stored);
      } catch {
        localStorage.removeItem("user");
        setStatus("unauth");
        setChecking(false);
        return;
      }

      // Check JWT expiry
      try {
        const payload = JSON.parse(atob(token.split(".")[1] || ""));
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          setStatus("unauth");
          setChecking(false);
          window.dispatchEvent(new Event("auth-change"));
          return;
        }
      } catch {}

      if (user.role !== "VENDOR") {
        setStatus("not_vendor");
        setChecking(false);
        return;
      }

      // Optional: check vendor approval status if you store it
      // if (user.vendor_status === "PENDING") => show pending screen
      if (user.vendor_status === "PENDING" || user.is_vendor_pending) {
        setStatus("pending");
        setChecking(false);
        return;
      }

      setStatus("vendor");
      setChecking(false);
    };

    check();
    const h = () => check();
    window.addEventListener("auth-change", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("auth-change", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  if (checking) {
    return (
      <main style={{minHeight:'70vh',display:'grid',placeItems:'center',background:'#fafaf7',padding:24}}>
        <div style={{textAlign:'center',background:'#fff',border:'1px solid #ece8de',borderRadius:24,padding:40,maxWidth:360,width:'100%'}}>
          <div style={{width:48,height:48,border:'3px solid #ece8de',borderTopColor:'#1a1816',borderRadius:'50%',margin:'0 auto 16px',animation:'spin .8s linear infinite'}} />
          <h3 style={{margin:'0 0 6px',fontWeight:900}}>Verifying Seller Access</h3>
          <p style={{margin:0,fontSize:13,color:'#8c8881'}}>Checking vendor permissions...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </main>
    );
  }

  if (status === "unauth") {
    return <Navigate to="/login" replace state={{ from: location, message: "Please login as vendor to continue" }} />;
  }

  if (status === "not_vendor") {
    return (
      <main style={{minHeight:'70vh',display:'grid',placeItems:'center',background:'#fafaf7',padding:24}}>
        <div style={{textAlign:'center',background:'#fff',border:'1px solid #ece8de',borderRadius:24,padding:40,maxWidth:420,width:'100%',boxShadow:'0 8px 32px rgba(0,0,0,.06)'}}>
          <div style={{width:64,height:64,margin:'0 auto 16px',display:'grid',placeItems:'center',background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'50%',fontSize:28}}>🚫</div>
          <h2 style={{margin:'0 0 8px',fontSize:20,fontWeight:900}}>Seller Access Only</h2>
          <p style={{margin:'0 0 20px',fontSize:13,color:'#8c8881',lineHeight:1.5}}>This area is reserved for registered sellers. You need a vendor account to access the seller dashboard.</p>
          <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
            <a href="/" style={{minHeight:40,padding:'0 18px',display:'inline-flex',alignItems:'center',borderRadius:999,border:'1px solid #ece8de',background:'#fff',fontSize:13,fontWeight:700,textDecoration:'none',color:'#1a1816'}}>Go to Home</a>
            <a href="/profile" style={{minHeight:40,padding:'0 18px',display:'inline-flex',alignItems:'center',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none'}}>Become a Seller →</a>
          </div>
        </div>
      </main>
    );
  }

  if (status === "pending") {
    return (
      <main style={{minHeight:'70vh',display:'grid',placeItems:'center',background:'#fafaf7',padding:24}}>
        <div style={{textAlign:'center',background:'#fff',border:'1px solid #ece8de',borderRadius:24,padding:40,maxWidth:420,width:'100%'}}>
          <div style={{width:64,height:64,margin:'0 auto 16px',display:'grid',placeItems:'center',background:'#fefce8',border:'1px solid #fde68a',borderRadius:'50%',fontSize:28}}>⏳</div>
          <h2 style={{margin:'0 0 8px',fontSize:18,fontWeight:900}}>Seller Approval Pending</h2>
          <p style={{margin:'0 0 20px',fontSize:13,color:'#8c8881',lineHeight:1.5}}>Your seller application is under review. Usually approved within 24 hours. You will get an email once approved.</p>
          <a href="/" style={{minHeight:40,padding:'0 18px',display:'inline-flex',alignItems:'center',borderRadius:999,background:'#1a1816',color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none'}}>Back to Home</a>
        </div>
      </main>
    );
  }

  return <Outlet />;
}

export default VendorRoute;