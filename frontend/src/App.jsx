import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import VendorRoute from "./components/VendorRoute";

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
const VendorDashboard = lazy(() => import("./pages/vendor/VendorDashboard"));
const VendorProducts = lazy(() => import("./pages/vendor/VendorProducts"));
const VendorOrders = lazy(() => import("./pages/vendor/VendorOrders"));
const VendorStore = lazy(() => import("./pages/vendor/VendorStore"));
const VendorProfile = lazy(() => import("./pages/vendor/VendorProfile"));
const VendorProductCreate = lazy(() => import("./pages/vendor/VendorProductCreate"));
const EditProduct = lazy(() => import("./pages/vendor/EditProduct"));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
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
              <Route element={<VendorRoute />}>
                <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                <Route path="/vendor/products" element={<VendorProducts />} />
                <Route path="/vendor/products/create" element={<VendorProductCreate />} />
                <Route path="/vendor/products/:id/edit" element={<EditProduct />} />
                <Route path="/vendor/orders" element={<VendorOrders />} />
                <Route path="/vendor/store" element={<VendorStore />} />
                <Route path="/vendor/profile" element={<VendorProfile />} />
                <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />
              </Route>
              <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
export default App;