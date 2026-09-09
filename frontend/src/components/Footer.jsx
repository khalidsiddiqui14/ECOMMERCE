import { Link } from "react-router-dom";

function Footer() {
  const scrollTop = () => {
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { window.scrollTo(0,0); }
  };

  return (
    <footer className="bg-[#131A22] text-[#DDDDDD] mt-2">
      {/* Back to top - Amazon */}
      <button onClick={scrollTop} className="w-full h-12 bg-[#37475A] hover:bg-[#485769] text-white text- font-medium transition">
        Back to top
      </button>

      {/* Links - Amazon */}
      <div className="bg-[#232F3E] border-b border-[#3a4553]">
        <div className="max-w- mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 text-">
          <div>
            <h3 className="font-bold text-white mb-3 text-">Get to Know Us</h3>
            <div className="flex flex-col gap-2 text-[#DDDDDD]">
              <Link to="/" className="hover:underline hover:text-white">About Us</Link>
              <Link to="/" className="hover:underline hover:text-white">Careers</Link>
              <Link to="/" className="hover:underline hover:text-white">Press Releases</Link>
              <Link to="/" className="hover:underline hover:text-white">ShopZone Cares</Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white mb-3 text-">Connect with Us</h3>
            <div className="flex flex-col gap-2">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:underline hover:text-white">Facebook</a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:underline hover:text-white">Twitter</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:underline hover:text-white">Instagram</a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:underline hover:text-white">YouTube</a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white mb-3 text-">Make Money with Us</h3>
            <div className="flex flex-col gap-2">
              <Link to="/vendor/dashboard" className="hover:underline hover:text-white">Sell on ShopZone</Link>
              <Link to="/" className="hover:underline hover:text-white">Sell under Accelerator</Link>
              <Link to="/vendor/register" className="hover:underline hover:text-white">Become a Seller</Link>
              <Link to="/" className="hover:underline hover:text-white">Advertise Your Products</Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-white mb-3 text-">Let Us Help You</h3>
            <div className="flex flex-col gap-2">
              <Link to="/profile" className="hover:underline hover:text-white">Your Account</Link>
              <Link to="/orders" className="hover:underline hover:text-white">Returns Centre</Link>
              <Link to="/" className="hover:underline hover:text-white">100% Purchase Protection</Link>
              <Link to="/help" className="hover:underline hover:text-white">Help</Link>
              <Link to="/cart" className="hover:underline hover:text-white">Cart ({JSON.parse(localStorage.getItem("recent_searches")||"[]").length} recent)</Link>
            </div>
          </div>

          <div className="col-span-2 md:col-span-2 border-t md:border-t-0 md:border-l border-[#3a4553] pt-6 md:pt-0 md:pl-6">
            <h3 className="font-bold text-white mb-3 text-">Mail Us:</h3>
            <p className="leading-5 text- text-[#DDDDDD]">
              ShopZone Internet Pvt Ltd,<br/>
              Connaught Place,<br/>
              New Delhi - 110001,<br/>
              Delhi, India<br/>
              <span className="text-[#febd69]">📍 Deliver to 110059</span>
            </p>
            <h3 className="font-bold text-white mt-6 mb-3 text-">Registered Office:</h3>
            <p className="leading-5 text- text-[#DDDDDD]">
              ShopZone HQ, Outer Ring Road,<br/>
              Devarabeesanahalli Village,<br/>
              Bengaluru - 560103, Karnataka, India<br/>
              CIN: U51109KA2024PTC123456
            </p>
          </div>
        </div>
      </div>

      {/* Language / Currency - Amazon */}
      <div className="bg-[#232F3E] py-4 border-b border-[#3a4553]">
        <div className="max-w- mx-auto px-4 flex flex-wrap justify-center gap-2 text-">
          {["Australia","Brazil","Canada","China","France","Germany","Italy","Japan","Mexico","Netherlands","Poland","Singapore","Spain","Turkey","UAE","UK","USA"].map(c=>(
            <span key={c} className="hover:underline cursor-pointer px-1">{c}</span>
          ))}
        </div>
      </div>

      {/* Bottom - Amazon */}
      <div className="bg-[#131A22] py-6">
        <div className="max-w- mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-">
          <div className="flex gap-4 md:gap-6 flex-wrap justify-center">
            <span className="hover:text-white cursor-pointer">🛍 Become a Seller</span>
            <span className="hover:text-white cursor-pointer">⭐ Advertise</span>
            <span className="hover:text-white cursor-pointer">🎁 Gift Cards</span>
            <span className="hover:text-white cursor-pointer">❓ Help Center</span>
            <span className="hidden md:inline text-[#999]">|</span>
            <span className="text-[#999]">100% Secure Payments</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="text-">© 1996-2026, ShopZone.com, Inc. or its affiliates</span>
            <div className="hidden md:flex gap-2">
              <span className="bg-white text-black px-2 py-0.5 rounded- text- font-black">VISA</span>
              <span className="bg-white text-black px-2 py-0.5 rounded- text- font-black">MASTERCARD</span>
              <span className="bg-white text-black px-2 py-0.5 rounded- text- font-black">UPI</span>
              <span className="bg-white text-black px-2 py-0.5 rounded- text- font-black">COD</span>
              <span className="bg-[#febd69] text-black px-2 py-0.5 rounded- text- font-bold">PRIME</span>
            </div>
          </div>
        </div>
        <div className="text-center text- text-[#999] mt-3">Made with ❤️ in India • Deployed on Render • API: {import.meta.env.VITE_API_URL? "Custom" : "Default"}</div>
      </div>
    </footer>
  );
}

export default Footer;