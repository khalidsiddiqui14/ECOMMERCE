import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart, updateCartItem, removeCartItem, saveForLater, getSavedForLater, moveToCart, getBuyAgain } from "../services/cartService";
import { getImageUrl, IMAGE_BASE } from "../services/api";

const getCartImageUrl = (item) => {
  try {
    const p = item?.product || {};
    const imgObj = p.images?.[0] || p.image || p.thumbnail || item?.product_image || item?.image || "";
    return getImageUrl(imgObj) || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop`;
  } catch {
    return `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop`;
  }
};

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [saved, setSaved] = useState([]);
  const [buyAgain, setBuyAgain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const loadCart = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const [cartData, savedData, buyData] = await Promise.allSettled([
        getCart(),
        getSavedForLater(),
        getBuyAgain()
      ]);
      if (cartData.status==="fulfilled") setCart(cartData.value);
      if (savedData.status==="fulfilled") {
        const s = savedData.value;
        setSaved(Array.isArray(s)? s : s?.items || s?.results || []);
      }
      if (buyData.status==="fulfilled") {
        const b = buyData.value;
        const list = Array.isArray(b)? b : b?.products || b?.results || [];
        setBuyAgain(list.slice(0,8));
      }
      try { window.dispatchEvent(new Event("cart-change")); } catch {}
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Cart load failed");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => { loadCart(); }, [loadCart]);

  const updateQuantity = async (itemId, newQty) => {
    const q = Number(newQty);
    if (!Number.isInteger(q) || q<1) return;
    setUpdatingId(itemId);
    setError("");
    try {
      const data = await updateCartItem(itemId, q);
      setCart(data);
      try { window.dispatchEvent(new Event("cart-change")); } catch {}
    } catch (err) {
      setError(err.response?.data?.detail || "Quantity update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId) => {
    if (removingId===itemId) return;
    setRemovingId(itemId);
    try {
      await removeCartItem(itemId);
      await loadCart(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Remove failed");
    } finally {
      setRemovingId(null);
    }
  };

  const handleSaveForLater = async (itemId) => {
    if (savingId===itemId) return;
    setSavingId(itemId);
    try {
      await saveForLater(itemId);
      await loadCart(false);
    } catch {
      setError("Save for later failed");
    } finally {
      setSavingId(null);
    }
  };

  const handleMoveToCart = async (savedId) => {
    setSavingId(savedId);
    try {
      await moveToCart(savedId);
      await loadCart(false);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#EAEDED] min-h-screen p-4">
        <div className="max-w- mx-auto space-y-3">
          {[1,2,3].map(i=>(<div key={i} className="h- bg-white shadow-sm animate-pulse rounded- border border-[#d5d9d9]" />))}
        </div>
      </div>
    );
  }

  if (error &&!cart) {
    return (
      <div className="bg-[#EAEDED] min-h-screen grid place-items-center p-4">
        <div className="bg-white p-8 shadow-sm text-center rounded- border border-[#d5d9d9] max-w- w-full">
          <div className="text-">🛒</div>
          <h2 className="font-bold text- mt-2">Unable to Load Cart</h2>
          <p className="text- text-[#565959] mt-2">{error}</p>
          <button className="mt-4 bg-[#FFD814] px-6 h-9 rounded- text- font-bold border border-[#FCD200] shadow-sm" onClick={()=>loadCart()}>Try Again</button>
          <Link to="/products" className="ml-2 inline-flex h-9 px-4 border border-[#d5d9d9] rounded- items-center text- bg-white">Browse Products</Link>
        </div>
      </div>
    );
  }

  const items = Array.isArray(cart?.items)? cart.items : cart?.cart_items || [];
  const subtotal = items.reduce((t,it)=>{
    const p = it.product || {};
    const price = Number(it.price?? it.product_price?? it.unit_price?? p.price?? 0);
    return t + price * Number(it.quantity || 0);
  },0);
  const totalItems = items.reduce((t,it)=> t + Number(it.quantity||0),0);
  const isBusy = updatingId!==null || removingId!==null || savingId!==null;

  return (
    <div className="bg-[#EAEDED] min-h-screen p-2 pb-6">
      <div className="max-w- mx-auto">
        <h1 className="text- font-medium p-4 bg-white shadow-sm mb-2 rounded- border border-[#d5d9d9] flex flex-wrap items-center gap-2">
          Shopping Cart {totalItems>0 && <span className="text- text-[#565959] font-normal">({totalItems} {totalItems===1? 'item':'items'})</span>}
          <span className="text- text-[#067D62] ml-2 px-2 py-0.5 bg-[#f0f2f2] border border-[#d5d9d9] rounded-full">{IMAGE_BASE?.includes("render")? "Render Deploy • Live" : "Local • Dev"}</span>
          <Link to="/products" className="ml-auto text- text-[#0066c0] hover:underline">Continue shopping</Link>
        </h1>

        {error && <div className="bg-white p-3 mb-2 border-l- border-[#CC0C39] text- text-[#CC0C39] shadow-sm rounded- flex justify-between">⚠ {error} <button onClick={()=>setError("")} className="text-[#0066c0] font-bold">Dismiss</button></div>}

        {items.length===0? (
          <div className="bg-white p-12 text-center shadow-sm rounded- border border-[#d5d9d9]">
            <div className="text- mb-4">🛒</div>
            <h2 className="text- font-bold">Your Amazon Cart is empty</h2>
            <p className="text- text-[#565959] mt-2 max-w- mx-auto">Your shopping cart lives to serve. Give it purpose — fill it with groceries, clothing, household supplies, electronics, and more.</p>
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              <Link to="/products" className="bg-[#FFD814] px-6 h-9 leading-9 rounded- text- font-bold border border-[#FCD200] shadow-sm">Browse Products</Link>
              <Link to="/deals" className="bg-white border border-[#d5d9d9] px-6 h-9 leading-9 rounded- text- shadow-sm">Today's Deals</Link>
              {saved.length>0 && <span className="text- leading-9 text-[#565959]">• {saved.length} saved for later below ↓</span>}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-3 items-start">
            <div className="bg-white shadow-sm rounded- border border-[#d5d9d9] overflow-hidden">
              <div className="p-3 text-right text- text-[#565959] hidden md:block border-b border-[#eaeaea]">Price</div>
              {items.map((item)=>{
                const product = item.product || {};
                const price = Number(item.price?? item.product_price?? product.price?? 0);
                const mrp = Number(product.original_price || product.mrp || price*1.2);
                const quantity = Number(item.quantity || 0);
                const name = item.product_name || product.name || `Product #${item.product}`;
                const image = getCartImageUrl(item);
                const isUpdating = updatingId===item.id;
                const isRemoving = removingId===item.id;
                const isSaving = savingId===item.id;

                return (
                  <div key={item.id} className={`p-4 flex gap-4 border-b border-[#eaeaea] last:border-0 ${isRemoving||isSaving?'opacity-50 pointer-events-none':''}`}>
                    <Link to={`/product/${product.id || item.product}`} className="shrink-0">
                      <img src={image} alt={name} className="w-24 h-24 object-contain bg-[#f7f7f7] border border-[#f0f2f2] rounded-" onError={(e)=>{ e.currentTarget.src=`https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200`; }} />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${product.id || item.product}`} className="text- text-[#0F1111] line-clamp-2 hover:text-[#C45500] leading-">{name}</Link>
                      <div className="text- text-[#067D62] mt-1">✓ In stock • Eligible for FREE Shipping • <span className="bg-[#067D62] text-white px-1 rounded-">Prime</span></div>
                      <div className="text- text-[#565959]">Sold by E-Shop • Gift options • Size: Free</div>
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <div className="flex items-center border border-[#d5d9d9] rounded- overflow-hidden h-8 shadow-sm bg-white">
                          <button disabled={isUpdating||isRemoving||quantity<=1} onClick={()=>updateQuantity(item.id,quantity-1)} className="w-8 bg-[#f0f2f2] hover:bg-[#e3e6e6] text- h-full disabled:opacity-40">−</button>
                          <span className="w-10 text-center text- font-medium border-x border-[#d5d9d9] h-full grid place-items-center">{isUpdating?'...':quantity}</span>
                          <button disabled={isUpdating||isRemoving} onClick={()=>updateQuantity(item.id,quantity+1)} className="w-8 bg-[#f0f2f2] hover:bg-[#e3e6e6] text- h-full">+</button>
                        </div>
                        <button disabled={isUpdating||isRemoving||isSaving} onClick={()=>handleRemove(item.id)} className="text- text-[#0066c0] hover:underline border-l border-[#d5d9d9] pl-3 hover:text-[#C45500]">{isRemoving?'Removing...':'Delete'}</button>
                        <button disabled={isSaving} onClick={()=>handleSaveForLater(item.id)} className="text- text-[#0066c0] hover:underline border-l border-[#d5d9d9] pl-3 hover:text-[#C45500]">{isSaving?'Saving...':'Save for later'}</button>
                        <button className="text- text-[#0066c0] hover:underline border-l border-[#d5d9d9] pl-3 hover:text-[#C45500]">Share</button>
                        <button className="text- text-[#0066c0] hover:underline border-l border-[#d5d9d9] pl-3 hover:text-[#C45500]">Compare</button>
                      </div>
                      {mrp>price && <div className="text- mt-2"><span className="bg-[#CC0C39] text-white px-1.5 py-0.5 rounded- font-bold">Limited time deal</span> <span className="text-[#CC0C39] ml-1 font-bold">{Math.round((1-price/mrp)*100)}% off</span> • Ends in 12h</div>}
                    </div>
                    <div className="text-right min-w-">
                      <div className="font-bold text-">₹{price.toLocaleString("en-IN")}.00</div>
                      {mrp>price && <div className="text- text-[#565959] line-through">M.R.P: ₹{mrp.toLocaleString("en-IN")}</div>}
                      <div className="text- text-[#565959] mt-1">Inclusive of taxes</div>
                    </div>
                  </div>
                );
              })}
              <div className="p-4 text-right text- bg-white border-t border-[#eaeaea]">Subtotal ({totalItems} items): <span className="font-bold">₹{subtotal.toLocaleString("en-IN")}.00</span></div>
            </div>

            <div className="bg-white p-4 shadow-sm border border-[#d5d9d9] rounded- sticky top-">
              <div className="text- text-[#067D62] flex gap-1.5 bg-[#f0f8f0] border border-[#d5e8d5] p-2 rounded-"><span>✓</span> <span>Your order is eligible for FREE Delivery. Select this option at checkout. <span className="text-[#0066c0] hover:underline cursor-pointer">Details</span></span></div>
              <div className="text- mt-3">Subtotal ({totalItems} items): <span className="font-bold">₹{subtotal.toLocaleString("en-IN")}.00</span></div>
              <div className="flex items-center gap-2 mt-3 text-">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#e77600]" /> <span>This order contains a gift</span>
              </div>
              <button onClick={()=>navigate("/checkout")} disabled={isBusy||items.length===0} className="w-full mt-4 h-10 bg-[#FFD814] hover:bg-[#F7CA00] rounded- text- shadow-sm border border-[#FCD200] disabled:opacity-50 font-medium">
                Proceed to Buy ({totalItems} {totalItems===1? 'item':'items'})
              </button>
              <div className="mt-3 text- text-[#067D62] border border-[#d5d9d9] p-2 rounded- flex gap-2 bg-[#f7fafa]">
                <span>🔒</span> <span>Secure transaction • EMI available • 10-day replacement • Cash on Delivery • UPI • Cards</span>
              </div>
              <div className="mt-3 text- text-[#565959] leading-">By placing your order, you agree to ShopZone's privacy notice and conditions of use.</div>
              <div className="mt-3 flex gap-2">
                <Link to="/wishlist" className="flex-1 h-8 border border-[#d5d9d9] rounded- grid place-items-center text- bg-white hover:bg-[#f7fafa]">Wishlist</Link>
                <Link to="/orders" className="flex-1 h-8 border border-[#d5d9d9] rounded- grid place-items-center text- bg-white hover:bg-[#f7fafa]">Orders</Link>
              </div>
            </div>
          </div>
        )}

        {saved.length>0 && (
          <div className="bg-white mt-3 shadow-sm rounded- border border-[#d5d9d9] p-4">
            <h2 className="font-bold text-">Saved for later ({saved.length} items) • Move to cart or delete</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              {saved.map((it)=>{
                const p = it.product || it;
                const name = p.name || it.product_name || "Product";
                const img = getCartImageUrl(it);
                return (
                  <div key={it.id} className="border border-[#d5d9d9] rounded- p-3 hover:shadow-sm">
                    <img src={img} alt="" className="w-full h-24 object-contain bg-[#f7f7f7] rounded-" />
                    <div className="text- line-clamp-2 mt-2 h-8 leading-">{name}</div>
                    <div className="font-bold text- mt-1">₹{Number(p.price||it.price||0).toLocaleString("en-IN")}</div>
                    <div className="text- text-[#067D62]">In stock • Prime</div>
                    <button disabled={savingId===it.id} onClick={()=>handleMoveToCart(it.id)} className="mt-2 w-full h-7 border border-[#d5d9d9] rounded- text- bg-white hover:bg-[#f7fafa] shadow-sm">{savingId===it.id?'Moving...':'Move to cart'}</button>
                    <button onClick={()=>handleRemove(it.id)} className="mt-1 w-full h-6 text- text-[#0066c0] hover:underline">Delete</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {buyAgain.length>0 && (
          <div className="bg-white mt-3 shadow-sm rounded- border border-[#d5d9d9] p-4">
            <h2 className="font-bold text-">Buy Again • Based on your orders • Inspired by your browsing</h2>
            <div className="flex gap-3 overflow-auto mt-3 pb-2">
              {buyAgain.map((p)=>(
                <Link key={p.id} to={`/product/${p.id}`} className="min-w- border border-[#d5d9d9] rounded- p-2 hover:shadow-sm bg-white">
                  <img src={getImageUrl(p) || PLACEHOLDER} alt="" className="w-full h-20 object-contain bg-[#f7fafa] rounded-" />
                  <div className="text- line-clamp-2 mt-1 h-8">{p.name}</div>
                  <div className="text- font-bold">₹{Number(p.price||0).toLocaleString("en-IN")}</div>
                  <div className="mt-1 h-6 bg-[#FFD814] border border-[#FCD200] rounded- grid place-items-center text-">Add to Cart</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;