import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function AdminRoute() {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [tokenExists, setTokenExists] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
      const userStr = localStorage.getItem("user");
      let parsed = null;
      try { parsed = userStr? JSON.parse(userStr) : null; } catch {}

      setUser(parsed);
      setTokenExists(!!token);

      if (!token) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      // JWT expiry check
      try {
        const parts = token.split(".");
        if (parts.length===3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g,"+").replace(/_/g,"/")));
          if (payload.exp && Date.now()>= payload.exp*1000 - 5000) {
            try {
              localStorage.removeItem("access_token");
              localStorage.removeItem("accessToken");
              localStorage.removeItem("token");
              localStorage.removeItem("refresh_token");
              localStorage.removeItem("user");
            } catch {}
            setIsAdmin(false);
            setTokenExists(false);
            setChecking(false);
            return;
          }
        }
      } catch {}

      const admin = parsed?.role==="ADMIN" || parsed?.is_staff===true || parsed?.is_superuser===true || localStorage.getItem("is_admin")==="true" || parsed?.role==="SUPERUSER";
      setIsAdmin(!!admin);
      setChecking(false);
    } catch {
      setIsAdmin(false);
      setChecking(false);
    }
  }, []);

  if (checking) {
    return (
      <div className="min-h- grid place-items-center bg-[#EAEDED] p-4">
        <div className="bg-white border border-[#d5d9d9] rounded- p-6 shadow-sm text-center max-w- w-full">
          <div className="w-8 h-8 border-4 border-[#e7e7e7] border-t-[#131921] rounded-full animate-spin mx-auto mb-2" />
          <div className="text- font-bold">Verifying Admin Access...</div>
        </div>
      </div>
    );
  }

  if (!tokenExists) {
    return <Navigate to="/login" replace state={{ from: location, message: "Admin login required" }} />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h- grid place-items-center bg-[#EAEDED] p-4">
        <div className="text-center bg-white border border-[#d5d9d9] rounded- p-8 max-w- w-full shadow-sm">
          <div className="w-20 h-20 mx-auto mb-4 bg-[#fef2f2] border-2 border-[#fecaca] rounded-full grid place-items-center text-">🛡️</div>
          <h1 className="text- font-bold text-[#0F1111]">403 - Admin Only</h1>
          <p className="text- text-[#565959] mt-2 leading-">You need <b>admin privileges</b> to access this area. This is ShopZone Seller Central admin panel.</p>

          <div className="bg-[#f7fafa] border border-[#d5d9d9] rounded- p-3 mt-4 text-left text-">
            <div className="font-bold">Current user:</div>
            <div className="mt-1 space-y-0.5 font-mono text-">
              <div>Email: <b>{user?.email || "unknown"}</b></div>
              <div>Role: <b className="text-[#CC0C39]">{user?.role || "CUSTOMER"}</b> (need ADMIN)</div>
              <div>is_staff: <b>{String(user?.is_staff || false)}</b> | is_superuser: <b>{String(user?.is_superuser || false)}</b></div>
              <div>Username: {user?.username || "-"}</div>
            </div>
          </div>

          <div className="bg-[#fffbeb] border border-[#fde68a] rounded- p-3 mt-3 text-left text-">
            <div className="font-bold">💡 How to create admin (Django):</div>
            <div className="mt-1 font-mono bg-black text-[#00ff00] p-2 rounded text- leading-">
              python manage.py createsuperuser<br/>
              # OR in Django admin → Users → Edit →<br/>
              # ☑ is_staff=True, is_superuser=True, role=ADMIN
            </div>
          </div>

          <div className="flex gap-2 justify-center mt-5 flex-wrap">
            <Link to="/" className="h-9 px-5 inline-flex items-center rounded- border border-[#d5d9d9] bg-white text- font-bold hover:bg-[#f0f2f2]">Go to Store</Link>
            <Link to="/login" className="h-9 px-5 inline-flex items-center rounded- bg-[#FFD814] border border-[#FCD200] text- font-bold">Login as Admin</Link>
          </div>
          <div className="mt-3 text- text-[#999]">ShopZone Admin • Secure Area • {location.pathname}</div>
        </div>
      </div>
    );
  }

  return <Outlet context={{ adminUser: user }} />;
}