import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";


function VendorRoute() {
  const location = useLocation();

  const token =
    localStorage.getItem("access_token");

  const storedUser =
    localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error(
      "INVALID STORED USER:",
      error
    );

    localStorage.removeItem("user");
  }


  if (!token) {
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


  if (!user) {
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