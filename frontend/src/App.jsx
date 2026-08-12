import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import ProtectedRoute from "./components/ProtectedRoute";
import VendorRoute from "./components/VendorRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorProducts from "./pages/vendor/VendorProducts";
import VendorOrders from "./pages/vendor/VendorOrders";
import VendorStore from "./pages/vendor/VendorStore";
import VendorProfile from "./pages/vendor/VendorProfile";
import VendorProductCreate from "./pages/vendor/VendorProductCreate";

import OrderDetail from "./pages/OrderDetail";
import EditProduct from "./pages/vendor/EditProduct";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/products/:id"
          element={<ProductDetail />}
        />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/wishlist"
            element={<Wishlist />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />

          <Route
            path="/orders/:id"
            element={<OrderDetail />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />
        </Route>

        <Route element={<VendorRoute />}>
          <Route
            path="/vendor/dashboard"
            element={<VendorDashboard />}
          />

          <Route
            path="/vendor/products"
            element={<VendorProducts />}
          />

          <Route
            path="/vendor/products/create"
            element={<VendorProductCreate />}
          />

          <Route
            path="/vendor/products/:id/edit"
            element={<EditProduct />}
          />

          <Route
            path="/vendor/orders"
            element={<VendorOrders />}
          />

          <Route
            path="/vendor/store"
            element={<VendorStore />}
          />

          <Route
            path="/vendor/profile"
            element={<VendorProfile />}
          />
        </Route>
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;