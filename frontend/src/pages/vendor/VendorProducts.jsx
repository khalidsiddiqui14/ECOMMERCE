import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getVendorProducts, deleteVendorProduct } from "../../services/vendorService";

function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await getVendorProducts();
      setProducts(Array.isArray(data)? data : data.results || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Products load nahi ho paaye.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try { await deleteVendorProduct(id); loadProducts(); }
    catch { alert("Delete failed"); }
  };

  if (loading) return <div className="bg-[#EAEDED] min-h-screen p-4"><div className="max-w- mx-auto h-20 bg-white border border-[#d5d9d9] rounded- animate-pulse" /></div>;

  return (
    <div className="bg-[#EAEDED] min-h-screen py-2">
      <div className="max-w- mx-auto px-2">
        <div className="bg-white border border-[#d5d9d9] rounded- p-4 flex justify-between items-center shadow-sm">
          <div>
            <div className="text- font-bold uppercase text-[#C45500]">SELLER CENTRAL • INVENTORY</div>
            <h1 className="text- font-bold">Manage Products 📦</h1>
            <p className="text- text-[#565959]">{products.length} products • Amazon Seller Central</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadProducts} className="h-8 px-3 bg-white border border-[#d5d9d9] rounded- text- shadow-sm">↻ Refresh</button>
            <Link to="/vendor/products/create" className="h-8 px-4 grid place-items-center bg-[#FFD814] border border-[#FCD200] rounded- text- font-bold shadow-sm">➕ Add Product</Link>
          </div>
        </div>

        {error && <div className="mt-2 bg-white border-l-4 border-[#c40000] p-3 text- text-[#c40000] shadow-sm">⚠ {error}</div>}

        <div className="mt-2 bg-white border border-[#d5d9d9] rounded- shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-">
              <thead className="bg-[#f0f2f2] border-b border-[#d5d9d9] text- uppercase font-bold text-[#565959]">
                <tr><th className="p-3 text-left">Product</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3">Action</th></tr>
              </thead>
              <tbody>
                {products.length===0? <tr><td colSpan={5} className="p-8 text-center text-[#565959]">No products yet. <Link to="/vendor/products/create" className="text-[#0066c0] font-bold">Add first product →</Link></td></tr> :
                products.map(p=>(
                  <tr key={p.id} className="border-b border-[#e7e7e7] hover:bg-[#f7f7f7]">
                    <td className="p-3 flex gap-2 items-center"><div className="w-10 h-10 bg-[#f0f2f2] border rounded- grid place-items-center">📦</div><div><strong className="block text-">{p.name}</strong><span className="text- text-[#565959]">SKU: {p.sku}</span></div></td>
                    <td className="p-3 font-bold">₹{Number(p.price).toLocaleString('en-IN')}</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded-full border text- font-bold ${Number(p.stock)>0?'bg-[#f0fdf4] border-[#bbf7d0] text-[#067D62]':'bg-[#fef2f2] border-[#fecaca] text-[#CC0C39]'}`}>{p.stock}</span></td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-[#f0f2f2] border border-[#d5d9d9] rounded-full text- font-bold">{p.status}</span></td>
                    <td className="p-3 flex gap-1"><Link to={`/vendor/products/${p.id}/edit`} className="h-7 px-2 bg-white border border-[#d5d9d9] rounded- grid place-items-center">Edit</Link><button onClick={()=>handleDelete(p.id)} className="h-7 px-2 bg-[#fef2f2] border border-[#fecaca] text-[#CC0C39] rounded-">Del</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
export default VendorProducts;