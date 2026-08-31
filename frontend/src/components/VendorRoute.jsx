import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

function VendorRoute() {
  const location = useLocation();

  const accessToken = localStorage.getItem(
    "access_token"
  );

  const storedUser = localStorage.getItem(
    "user"
  );

  let user = null;

  try {
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error(
      "INVALID STORED USER:",
      error
    );

    localStorage.removeItem("user");
  }

  if (!accessToken || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  if (user.role !== "VENDOR") {
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