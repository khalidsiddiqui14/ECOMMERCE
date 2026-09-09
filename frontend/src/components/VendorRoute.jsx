import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, Link } from "react-router-dom";

function VendorRoute() {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState("checking"); // checking | unauth | not_vendor | pending | vendor
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const check = () => {
      try {
        const token = localStorage.getItem("access_token");
        const stored = localStorage.getItem("user");

        if (!token ||!stored) {
          setStatus("unauth");
          setChecking(false);
          return;
        }

        let user = null;
        try {
          user = JSON.parse(stored);
          setUserInfo(user);
        } catch {
          try { localStorage.removeItem("user"); } catch {}
          setStatus("unauth");
          setChecking(false);
          return;
        }

        // JWT expiry - safe
        try {
          const parts = token.split(".");
          if (parts.length===3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g,"+").replace(/_/g,"/")));
            if (payload.exp && Date.now()>= payload.exp*1000 - 5000) {
              try {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("user");
              } catch {}
              setStatus("unauth");
              setChecking(false);
              try { window.dispatchEvent(new Event("auth-change")); } catch {}
              return;
            }
          }
        } catch {}

        if (user.role!=="VENDOR" && user.role!=="ADMIN" &&!user.is_staff) {
          setStatus("not_vendor");
          setChecking(false);
          return;
        }

        if (user.vendor_status==="PENDING" || user.is_vendor_pending || user.vendor_approval==="pending") {
          setStatus("pending");
          setChecking(false);
          return;
        }

        setStatus("vendor");
        setChecking(false);
      } catch (err) {
        console.error("VendorRoute check error", err);
        setStatus("unauth");
        setChecking(false);
      }
    };

    check();
    const h = () => check();
    window.addEventListener("auth-change", h);
    window.addEventListener("storage", h);
    document.addEventListener("visibilitychange", h);
    return () => {
      window.removeEventListener("auth-change", h);
      window.removeEventListener("storage", h);
      document.removeEventListener("visibilitychange", h);
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h- grid place-items-center bg-[#EAEDED] p-4">
        <div className="text-center bg-white border border-[#d5d9d9] rounded- p-8 max-w- w-full shadow-sm">
          <div className="w-12 h-12 border-4 border-[#e7e7e7] border-t-[#131921] rounded-full mx-auto mb-4 animate-spin" />
          <h3 className="font-bold text- text-[#0F1111]">Verifying Seller Access</h3>
          <p className="text- text-[#565959] mt-1">Checking vendor permissions • Seller Central</p>
          <div className="mt-4 text- text-[#999]">ShopZone Seller Central</div>
        </div>
      </div>
    );
  }

  if (status==="unauth") {
    return <Navigate to="/login" replace state={{ from: location, message: "Please login as vendor to continue" }} />;
  }

  if (status==="not_vendor") {
    return (
      <div className="min-h- grid place-items-center bg-[#EAEDED] p-4">
        <div className="text-center bg-white border border-[#d5d9d9] rounded- p-8 max-w- w-full shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 grid place-items-center bg-[#fef2f2] border border-[#fecaca] rounded-full text-">🚫</div>
          <h2 className="text- font-bold text-[#0F1111]">Seller Access Only</h2>
          <p className="text- text-[#565959] mt-2 leading-">This area is reserved for registered sellers. You need a vendor account to access the seller dashboard. Start selling on ShopZone today!</p>
          <div className="bg-[#f7fafa] border border-[#d5d9d9] rounded- p-3 mt-4 text-left text-">
            <div className="font-bold">Benefits of Seller Account:</div>
            <ul className="list-disc ml-4 mt-1 space-y-0.5 text-[#565959]">
              <li>List unlimited products</li>
              <li>Prime badge & FREE Delivery</li>
              <li>Payments every 7 days</li>
            </ul>
          </div>
          <div className="flex gap-2 justify-center flex-wrap mt-5">
            <Link to="/" className="h-10 px-5 inline-flex items-center rounded- border border-[#d5d9d9] bg-white text- font-bold hover:bg-[#f0f2f2]">Go to Home</Link>
            <Link to="/profile" className="h-10 px-5 inline-flex items-center rounded- bg-[#FFD814] border border-[#FCD200] text- font-bold shadow-sm hover:bg-[#F7CA00]">Become a Seller →</Link>
          </div>
          <div className="mt-3 text- text-[#999]">Current role: {userInfo?.role || "CUSTOMER"} • Need VENDOR role</div>
        </div>
      </div>
    );
  }

  if (status==="pending") {
    return (
      <div className="min-h- grid place-items-center bg-[#EAEDED] p-4">
        <div className="text-center bg-white border border-[#d5d9d9] rounded- p-8 max-w- w-full shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 grid place-items-center bg-[#fefce8] border border-[#fde68a] rounded-full text-">⏳</div>
          <h2 className="text- font-bold text-[#0F1111]">Seller Approval Pending</h2>
          <p className="text- text-[#565959] mt-2 leading-">Your seller application is under review by ShopZone team. Usually approved within <b>24 hours</b>. You will get an email at <b>{userInfo?.email || "your email"}</b> once approved.</p>
          <div className="bg-[#fffbeb] border border-[#fde68a] rounded- p-3 mt-4 text-left text-">
            <div className="font-bold">Application Status: PENDING</div>
            <div className="text-[#565959] mt-1">Application ID: SZ-V-{userInfo?.id || "0001"} • Submitted: Today</div>
          </div>
          <div className="flex gap-2 justify-center mt-5">
            <Link to="/" className="h-10 px-6 inline-flex items-center rounded- bg-[#131921] text-white text- font-bold hover:bg-[#232f3e]">Back to Home</Link>
            <Link to="/profile" className="h-10 px-5 inline-flex items-center rounded- border border-[#d5d9d9] bg-white text- font-bold">Check Status</Link>
          </div>
        </div>
      </div>
    );
  }

  // vendor allowed
  return <Outlet context={{ vendorUser: userInfo }} />;
}

export default VendorRoute;