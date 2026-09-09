import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getVendorDashboard } from "../../services/vendorService";

function VendorDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const data = await getVendorDashboard();
      setDashboard(data || {});
    } catch (err) {
      setError(err.response?.data?.detail || "Dashboard load nahi ho paaya.");
    } finally {
      if (isRefresh) setRefreshing(false); else setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setError("");
      try {
        const data = await getVendorDashboard();
        if (!cancelled) setDashboard(data || {});
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.detail || "Dashboard load nahi ho paaya.");
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const stats = dashboard?.stats || {};
  const recentOrders = Array.isArray(dashboard?.recent_orders)? dashboard.recent_orders : [];
  const storeName = dashboard?.store?.name || "Your Store";
  const totalProducts = Number(stats.total_products || 0);
  const totalOrders = Number(stats.total_orders || 0);
  const pendingOrders = Number(stats.pending_orders || 0);
  const revenue = Number(stats.revenue || 0);
  const formatCurrency = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;
  const formatDate = (v) => { if (!v) return "-"; const d = new Date(v); return isNaN(d.getTime())? "-" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); };

  if (loading) {
    return (
      <div className="bg-[#EAEDED] min-h-screen p-4">
        <div className="max-w- mx-auto grid gap-3">
          <div className="h- bg-white border border-[#d5d9d9] rounded- animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[1,2,3,4].map(i => <div key={i} className="h- bg-white border border-[#d5d9d9] rounded- animate-pulse" />)}</div>
        </div>
      </div>
    );
  }

  if (error &&!dashboard) {
    return (
      <div className="bg-[#EAEDED] min-h-screen p-4 grid place-items-center">
        <div className="bg-white border border-[#d5d9d9] rounded- p-8 text-center shadow-sm max-w-">
          <h2 className="font-bold">Dashboard Error</h2>
          <p className="text- text-[#565959] mt-1">{error}</p>
          <button onClick={()=>loadDashboard(true)} disabled={refreshing} className="mt-4 h-8 px-4 bg-[#FFD814] border border-[#FCD200] rounded- text- shadow-sm">{refreshing? "Retrying..." : "Try Again"}</button>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon, label, value, trend, color }) => (
    <div className="bg-white border border-[#d5d9d9] rounded- p-4 relative overflow-hidden shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="w-10 h-10 rounded- grid place-items-center text- border" style={{ background: color.bg, borderColor: color.border }}>{icon}</div>
        {trend && <span className="px-2 py-0.5 rounded-full text- font-bold border" style={{ background: trend.startsWith('+')? '#f0fdf4' : '#fef2f2', borderColor: trend.startsWith('+')? '#bbf7d0' : '#fecaca', color: trend.startsWith('+')? '#067D62' : '#CC0C39' }}>{trend}</span>}
      </div>
      <div className="text- font-bold uppercase text-[#565959]">{label}</div>
      <div className="text- font-bold text-[#0F1111]">{value}</div>
    </div>
  );

  return (
    <div className="bg-[#EAEDED] min-h-screen py-2">
      <div className="max-w- mx-auto px-2">
        <div className="bg-white border border-[#d5d9d9] rounded- p-4 flex justify-between items-start shadow-sm">
          <div>
            <div className="text- font-bold uppercase text-[#C45500]">SELLER CENTRAL • LIVE</div>
            <h1 className="text- font-bold">Welcome to {storeName} 👋</h1>
            <p className="text- text-[#565959] mt-1">Manage your store, products and orders • <strong className="text-[#067D62]">● {totalProducts} products active</strong></p>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>loadDashboard(true)} disabled={refreshing} className="h-8 px-3 bg-white border border-[#d5d9d9] rounded- text- shadow-sm">↻ {refreshing? "Refreshing..." : "Refresh"}</button>
            <Link to="/vendor/products" className="h-8 px-4 grid place-items-center bg-[#FFD814] border border-[#FCD200] rounded- text- font-bold shadow-sm">Manage Products →</Link>
          </div>
        </div>

        {error && <div className="mt-2 bg-white border-l-4 border-[#c40000] p-3 text- text-[#c40000] shadow-sm">⚠ {error}</div>}

        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
          <StatCard icon="📦" label="Total Products" value={totalProducts} trend="+12%" color={{ bg: '#f0fdf4', border: '#bbf7d0' }} />
          <StatCard icon="🛒" label="Total Orders" value={totalOrders} trend="+8%" color={{ bg: '#eff6ff', border: '#bfdbfe' }} />
          <StatCard icon="⏳" label="Pending Orders" value={pendingOrders} color={{ bg: '#fefce8', border: '#fde68a' }} />
          <StatCard icon="💰" label="Revenue" value={formatCurrency(revenue)} trend="+23%" color={{ bg: '#fdf2f8', border: '#fbcfe8' }} />
        </div>

        <div className="mt-2 grid grid-cols-1 md:grid-cols-[1fr_300px] gap-2 items-start">
          <div className="bg-white border border-[#d5d9d9] rounded- p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <div><h2 className="font-bold text-">Recent Orders</h2><p className="text- text-[#565959]">Latest orders containing your products.</p></div>
              <Link to="/vendor/orders" className="h-7 px-3 grid place-items-center bg-[#f0f2f2] border border-[#d5d9d9] rounded- text-">View All →</Link>
            </div>

            {recentOrders.length===0? (
              <div className="text-center py-8 bg-[#f0f2f2] border border-dashed border-[#d5d9d9] rounded-">
                <div className="text-">📦</div>
                <h3 className="font-bold mt-1 text-">No orders yet</h3>
                <p className="text- text-[#565959] mt-1">Orders containing your products will appear here.</p>
                <Link to="/vendor/products" className="mt-3 inline-flex h-7 px-3 bg-[#131921] text-white rounded- text- items-center">Manage Products</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {recentOrders.map(order => {
                  const items = Array.isArray(order?.items)? order.items : [];
                  return (
                    <div key={order.id} className="border border-[#e7e7e7] rounded- p-3 bg-white">
                      <div className="flex justify-between items-center mb-2">
                        <div><span className="text- uppercase text-[#565959] font-bold">Order</span><br /><strong className="text-">{order.order_number || `#${order.id}`}</strong></div>
                        <span className="px-2 py-1 rounded-full text- font-bold border" style={{ background: order.status==="DELIVERED"? '#f0fdf4' : '#fefce8', borderColor: order.status==="DELIVERED"? '#bbf7d0' : '#fde68a' }}>{order.status || "PLACED"}</span>
                      </div>
                      <div className="flex flex-col gap-1 mb-2">
                        {items.length===0? <span className="text- text-[#767676]">No item details available.</span> : items.slice(0,2).map(item => (
                          <div key={item.id} className="flex items-center gap-2 p-2 bg-[#f7f7f7] rounded-">
                            <div className="w-8 h-8 rounded- bg-white border grid place-items-center text-">📦</div>
                            <div className="flex-1 min-w-0">
                              <strong className="block text- truncate">{item.product_name || `Product #${item.product || "-"}`}</strong>
                              <span className="text- text-[#565959]">SKU: {item.sku || "-"} • Qty: {Number(item.quantity || 0)}</span>
                            </div>
                            <strong className="text-">{formatCurrency(item.total_price)}</strong>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#f0f2f2]">
                        <div><span className="text- text-[#767676] block">Payment</span><strong className="text-">{order.payment_status || "-"}</strong></div>
                        <div><span className="text- text-[#767676] block">Total</span><strong className="text-">{formatCurrency(order.total_amount)}</strong></div>
                        <div><span className="text- text-[#767676] block">Date</span><strong className="text-">{formatDate(order.created_at)}</strong></div>
                      </div>
                      <Link to={`/orders/${order.id}`} className="text- font-bold text-[#0066c0] hover:underline mt-2 inline-block">View Order →</Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sticky top-2">
            <div className="bg-[#131921] text-white rounded- p-4 shadow-sm">
              <h2 className="font-bold text-">Quick Actions ⚡</h2>
              <div className="flex flex-col gap-1.5 mt-3">
                {[
                  { to: '/vendor/products', icon: '📦', t: 'Products', s: 'Manage your products' },
                  { to: '/vendor/products/create', icon: '➕', t: 'Add Product', s: 'Create a new product', highlight: true },
                  { to: '/vendor/orders', icon: '🛒', t: 'Orders', s: 'Manage customer orders' },
                  { to: '/vendor/store', icon: '🏪', t: 'Store', s: 'Manage store info' },
                  { to: '/vendor/profile', icon: '👤', t: 'Vendor Profile', s: 'Manage profile' },
                ].map(a => (
                  <Link key={a.to} to={a.to} className={`flex items-center gap-2 p-2.5 rounded- border ${a.highlight? 'bg-[#FFD814] border-[#FCD200] text-[#0F1111]' : 'bg-[#232f3e] border-[#37475a] text-white hover:border-white'}`}>
                    <span className={`w-8 h-8 rounded- grid place-items-center text- ${a.highlight? 'bg-[#0F1111] text-white' : 'bg-[#37475a]'}`}>{a.icon}</span>
                    <div><strong className="block text-">{a.t}</strong><small className="text- opacity-80">{a.s}</small></div>
                    <span className="ml-auto text-">→</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="bg-white border border-[#d5d9d9] rounded- p-3 shadow-sm">
              <h3 className="text- font-bold">💡 Seller Tips</h3>
              <ul className="mt-1 ml-4 text- text-[#565959] leading-5 list-disc">
                <li>Update stock daily for better ranking</li>
                <li>Add HD images = +40% sales</li>
                <li>Respond to orders within 2hrs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorDashboard;