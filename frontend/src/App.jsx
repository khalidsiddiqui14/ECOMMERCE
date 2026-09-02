import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import ProtectedRoute from "./components/ProtectedRoute";
import VendorRoute from "./components/VendorRoute";

// ── Lazy Load for 11/10 Performance (Flipkart Code-Splitting) ─────
const Home = lazy(() => import("./pages/home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Settings = lazy(() => import("./pages/Settings"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));

// Vendor
const VendorDashboard = lazy(() => import("./pages/vendor/VendorDashboard"));
const VendorProducts = lazy(() => import("./pages/vendor/VendorProducts"));
const VendorOrders = lazy(() => import("./pages/vendor/VendorOrders"));
const VendorStore = lazy(() => import("./pages/vendor/VendorStore"));
const VendorProfile = lazy(() => import("./pages/vendor/VendorProfile"));
const VendorProductCreate = lazy(() => import("./pages/vendor/VendorProductCreate"));
const EditProduct = lazy(() => import("./pages/vendor/EditProduct"));

// ── Loader (Flipkart Skeleton) ───────────────────────────────────
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500 animate-pulse">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#f1f3f6]">
        <Navbar />

        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Public Routes ── */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />

              {/* ── Protected (Customer) ── */}
              <Route element={<ProtectedRoute />}>
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>

              {/* ── Vendor Routes ── */}
              <Route element={<VendorRoute />}>
                <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                <Route path="/vendor/products" element={<VendorProducts />} />
                <Route path="/vendor/products/create" element={<VendorProductCreate />} />
                <Route path="/vendor/products/:id/edit" element={<EditProduct />} />
                <Route path="/vendor/orders" element={<VendorOrders />} />
                <Route path="/vendor/store" element={<VendorStore />} />
                <Route path="/vendor/profile" element={<VendorProfile />} />
                {/* Redirect /vendor -> /vendor/dashboard */}
                <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />
              </Route>

              {/* ── 404 Fallback ── */}
              <Route
                path="*"
                element={
                  <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
                    <h1 className="text-6xl font-bold text-gray-300">404</h1>
                    <p className="mt-4 text-xl text-gray-600">Page not found</p>
                    <a href="/" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                      Go Home
                    </a>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;