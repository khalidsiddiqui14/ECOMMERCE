import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import VendorRoute from "./components/VendorRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";

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
const Addresses = lazy(() => import("./pages/Addresses"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Settings = lazy(() => import("./pages/Settings"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const StoreDetail = lazy(() => import("./pages/StoreDetail"));
const BrandProducts = lazy(() => import("./pages/BrandProducts"));
const CategoryProducts = lazy(() => import("./pages/CategoryProducts"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const Deals = lazy(() => import("./pages/Deals"));
const Fresh = lazy(() => import("./pages/Fresh"));
const PrimeVideo = lazy(() => import("./pages/PrimeVideo"));
const Bestsellers = lazy(() => import("./pages/Bestsellers"));
const NewReleases = lazy(() => import("./pages/NewReleases"));
const Prime = lazy(() => import("./pages/Prime"));
const AmazonPay = lazy(() => import("./pages/AmazonPay"));
const GiftCards = lazy(() => import("./pages/GiftCards"));
const Sell = lazy(() => import("./pages/Sell"));
const CustomerService = lazy(() => import("./pages/CustomerService"));

const VendorDashboard = lazy(() => import("./pages/vendor/VendorDashboard"));
const VendorProducts = lazy(() => import("./pages/vendor/VendorProducts"));
const VendorOrders = lazy(() => import("./pages/vendor/VendorOrders"));
const VendorReturns = lazy(() => import("./pages/vendor/VendorReturns"));
const VendorStore = lazy(() => import("./pages/vendor/VendorStore"));
const VendorProfile = lazy(() => import("./pages/vendor/VendorProfile"));
const VendorProductCreate = lazy(() => import("./pages/vendor/VendorProductCreate"));
const EditProduct = lazy(() => import("./pages/vendor/EditProduct"));
const VendorPayments = lazy(() => import("./pages/vendor/VendorPayments"));
const VendorReviews = lazy(() => import("./pages/vendor/VendorReviews"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminVendors = lazy(() => import("./pages/admin/AdminVendors"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminStores = lazy(() => import("./pages/admin/AdminStores"));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-[#EAEDED]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 border-4 border-[#FFD814] border-t-transparent rounded-full animate-spin" />
      <span className="text-[13px] text-[#565959] font-medium">Loading ShopZone - Amazon style...</span>
    </div>
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

function App() {
  useEffect(() => {
    console.log("ShopZone Final - All Navbar Fixed - Customer Service + Sell + All - Delhi 110059");
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#EAEDED]">
        <Header />
        <main className="flex-1">
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/brands/:slug" element={<BrandProducts />} />
              <Route path="/brand/:slug" element={<BrandProducts />} />
              <Route path="/stores/:slug" element={<StoreDetail />} />
              <Route path="/store/:slug" element={<StoreDetail />} />

              {/* Category Routes - Fixed 0 products bug - ID mapping - Mobiles fixed */}
              <Route path="/category/:slug" element={<CategoryProducts />} />
              <Route path="/categories/:slug" element={<CategoryProducts />} />
              <Route path="/electronics" element={<Navigate to="/category/electronics" replace />} />
              <Route path="/fashion" element={<Navigate to="/category/fashion" replace />} />
              <Route path="/home-kitchen" element={<Navigate to="/category/home-kitchen" replace />} />
              <Route path="/home" element={<Navigate to="/category/home-kitchen" replace />} />
              <Route path="/kitchen" element={<Navigate to="/category/home-kitchen" replace />} />
              <Route path="/beauty" element={<Navigate to="/category/beauty" replace />} />
              <Route path="/mobiles" element={<Navigate to="/category/mobiles" replace />} />
              <Route path="/mobile" element={<Navigate to="/category/mobiles" replace />} />

              {/* 9 Amazon Features - All Working - Including Customer Service */}
              <Route path="/fresh" element={<Fresh />} />
              <Route path="/prime-video" element={<PrimeVideo />} />
              <Route path="/bestsellers" element={<Bestsellers />} />
              <Route path="/new-releases" element={<NewReleases />} />
              <Route path="/prime" element={<Prime />} />
              <Route path="/amazon-pay" element={<AmazonPay />} />
              <Route path="/gift-cards" element={<GiftCards />} />
              <Route path="/sell" element={<Sell />} />
              <Route path="/customer-service" element={<CustomerService />} />
              <Route path="/customer" element={<CustomerService />} />
              <Route path="/help" element={<CustomerService />} />
              <Route path="/todays-deals" element={<Deals />} />
              <Route path="/today-deals" element={<Deals />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/returns" element={<VendorReturns />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/addresses" element={<Addresses />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>

              <Route element={<VendorRoute />}>
                <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />
                <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                <Route path="/vendor/products" element={<VendorProducts />} />
                <Route path="/vendor/products/create" element={<VendorProductCreate />} />
                <Route path="/vendor/products/:id/edit" element={<EditProduct />} />
                <Route path="/vendor/orders" element={<VendorOrders />} />
                <Route path="/vendor/returns" element={<VendorReturns />} />
                <Route path="/vendor/payments" element={<VendorPayments />} />
                <Route path="/vendor/reviews" element={<VendorReviews />} />
                <Route path="/vendor/store" element={<VendorStore />} />
                <Route path="/vendor/profile" element={<VendorProfile />} />
              </Route>

              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="vendors" element={<AdminVendors />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="stores" element={<AdminStores />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Route>
              </Route>

              <Route path="*" element={
                <div className="bg-white min-h-[70vh] grid place-items-center p-10">
                  <div className="text-center max-w-[500px]">
                    <div className="text-[48px] mt-4">Dog</div>
                    <h1 className="text-[24px] font-bold mt-4 text-[#0F1111]">Looking for something?</h1>
                    <p className="text-[14px] text-[#565959] mt-2">We are sorry. The Web address you entered is not a functioning page on ShopZone.</p>
                    <div className="flex gap-2 justify-center mt-6 flex-wrap">
                      <a href="/" className="h-9 px-6 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-lg text-[13px] font-bold grid place-items-center shadow-sm">Go to Homepage</a>
                      <a href="/products" className="h-9 px-6 bg-white border border-[#d5d9d9] rounded-lg text-[13px] grid place-items-center shadow-sm">Browse Products</a>
                    </div>
                  </div>
                </div>
              } />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;