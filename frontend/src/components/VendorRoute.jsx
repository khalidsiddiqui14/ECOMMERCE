import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

function VendorRoute() {
  const location = useLocation();

  const token =
    localStorage.getItem("access_token");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (user?.role !== "VENDOR") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
}

export default VendorRoute;