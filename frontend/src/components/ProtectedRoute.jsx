import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute({ allowedRoles = null }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [roleError, setRoleError] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("access_token");
        const stored = localStorage.getItem("user");

        if (!token) {
          setIsAuth(false);
          setUser(null);
          setRoleError(false);
          setChecking(false);
          return;
        }

        // JWT expiry check - safe
        try {
          const parts = token.split(".");
          if (parts.length===3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
            const isExpired = payload.exp && Date.now()>= payload.exp*1000 - 5000; // 5 sec buffer
            if (isExpired) {
              console.warn("Token expired - logging out");
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              localStorage.removeItem("user");
              setIsAuth(false);
              setUser(null);
              setChecking(false);
              try { window.dispatchEvent(new Event("auth-change")); } catch {}
              return;
            }
          }
        } catch (e) {
          console.warn("Token parse failed, allowing as opaque token", e.message);
          // If not JWT, just allow if token exists - your logic kept
        }

        let parsedUser = null;
        if (stored) {
          try {
            parsedUser = JSON.parse(stored);
            setUser(parsedUser);

            // Role check - Amazon Seller Central style
            if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length>0) {
              const userRole = parsedUser.role || parsedUser.user_role || (parsedUser.is_staff? "ADMIN" : "CUSTOMER");
              const hasRole = allowedRoles.includes(userRole) || (parsedUser.is_staff && allowedRoles.includes("ADMIN"));
              if (!hasRole) {
                console.warn(`Role ${userRole} not allowed for ${allowedRoles}`);
                setIsAuth(false);
                setRoleError(true);
                setChecking(false);
                return;
              }
            }
          } catch {
            try { localStorage.removeItem("user"); } catch {}
            parsedUser = null;
          }
        }

        setIsAuth(true);
        setRoleError(false);
        if (parsedUser) setUser(parsedUser);
        setChecking(false);
      } catch (err) {
        console.error("Auth check error", err);
        setIsAuth(false);
        setUser(null);
        setChecking(false);
      }
    };

    checkAuth();

    const handleAuthChange = () => checkAuth();
    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    // Also check when tab becomes visible - Amazon does
    document.addEventListener("visibilitychange", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
      document.removeEventListener("visibilitychange", handleAuthChange);
    };
  }, [allowedRoles]);

  if (checking) {
    return (
      <div className="min-h- grid place-items-center bg-[#EAEDED] p-4">
        <div className="text-center bg-white border border-[#d5d9d9] rounded- p-8 shadow-sm max-w- w-full">
          <div className="w-10 h-10 border-4 border-[#e7e7e7] border-t-[#131921] rounded-full mx-auto mb-3 animate-spin" />
          <p className="m-0 text- font-bold text-[#0F1111]">Checking authentication...</p>
          <p className="m-0 mt-1 text- text-[#565959]">ShopZone Secure Login • Protected Route</p>
          <div className="mt-3 h-1 w-full bg-[#f0f2f2] rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-[#febd69] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    if (roleError && user) {
      // Amazon: Show access denied but stay on page with message
      return <Navigate to="/" replace state={{ error: `Access denied: ${user.role||"CUSTOMER"} cannot access ${allowedRoles?.join(",")}.` }} />;
    }
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          message: "Please login to continue shopping",
          redirect: location.pathname + location.search
        }}
      />
    );
  }

  return <Outlet context={{ user }} />;
}

export default ProtectedRoute;