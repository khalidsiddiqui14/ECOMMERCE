import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute({ allowedRoles = null }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      const stored = localStorage.getItem("user");

      if (!token) {
        setIsAuth(false);
        setUser(null);
        setChecking(false);
        return;
      }

      // Optional: check token expiry (JWT decode)
      try {
        const payload = JSON.parse(atob(token.split(".")[1] || ""));
        const isExpired = payload.exp && Date.now() >= payload.exp * 1000;
        if (isExpired) {
          // Try refresh token exists? For now logout
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          setIsAuth(false);
          setUser(null);
          setChecking(false);
          window.dispatchEvent(new Event("auth-change"));
          return;
        }
      } catch {
        // If not JWT, just allow if token exists
      }

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          
          // Role check if provided
          if (allowedRoles && parsed.role && !allowedRoles.includes(parsed.role)) {
            setIsAuth(false);
            setChecking(false);
            return;
          }
        } catch {
          localStorage.removeItem("user");
        }
      }

      setIsAuth(true);
      setChecking(false);
    };

    checkAuth();

    // Listen to auth changes (logout from other tab)
    const handleAuthChange = () => checkAuth();
    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [allowedRoles]);

  if (checking) {
    return (
      <main style={{minHeight:'60vh',display:'grid',placeItems:'center',background:'#fafaf7'}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:40,height:40,border:'3px solid #ece8de',borderTopColor:'#1a1816',borderRadius:'50%',margin:'0 auto 12px',animation:'spin .8s linear infinite'}} />
          <p style={{margin:0,fontSize:13,fontWeight:600,color:'#8c8881'}}>Checking authentication...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </main>
    );
  }

  if (!isAuth) {
    // If role not allowed, redirect to home with message
    if (user && allowedRoles) {
      return <Navigate to="/" replace state={{ error: "You don't have permission to access this page." }} />;
    }
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          message: "Please login to continue",
        }}
      />
    );
  }

  return <Outlet context={{ user }} />;
}

export default ProtectedRoute;