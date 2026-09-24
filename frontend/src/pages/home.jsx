import { Link } from "react-router-dom";
import { useRef } from "react";

// FINAL REAL E-COMMERCE - 100% REAL PRODUCTS - NO FOREST/MOUNTAIN - AMAZON LIKE
const IMG = {
  // Bazaar Top 9 - Real products
  b1_watch: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=400&fit=crop",
  b2_jacket: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop",
  b3_cooker: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&h=400&fit=crop",
  b4_bag: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
  b5_decor: "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=400&h=400&fit=crop",
  b6_table: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop",
  b7_shoes: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&h=400&fit=crop",
  b8_shirt: "https://images.unsplash.com/photo-1618354691373-d851c5c3c3ab?w=400&h=400&fit=crop",
  b9_bottle: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop",
  plants: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop",
  deal_cooker: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&h=400&fit=crop",
  deal_fan: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
  deal_earbud: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop",
  deal_shoe: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
  tshirts: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
  cleaning: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=400&fit=crop",
  oil_ghee: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop",
  tea_coffee: "https://images.unsplash.com/photo-1544787219-7f47cc556762?w=400&h=400&fit=crop",
  baby_care: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=400&fit=crop",
  water_bottles: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
  cookware: "https://images.unsplash.com/photo-1585515656627-3c6e0a67d31c?w=400&h=400&fit=crop",
  kitchen_tools: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop",
  storage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
  electrical: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop",
  ladders: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop",
  security_camera: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop",
  business: "https://images.unsplash.com/photo-1497366216548-37526070297b?w=400&h=400&fit=crop",
  boat_349: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop",
  hungama: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop",
  boult_399: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400&h=400&fit=crop",
  zebronics_399: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop",
  almonds: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&h=400&fit=crop",
  dates: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop",
  cashews: "https://images.unsplash.com/photo-1559620192-032c4bc4674e?w=400&h=400&fit=crop",
  chia: "https://images.unsplash.com/photo-1515543237350-bbf6d80d68be?w=400&h=400&fit=crop",
  gaming_monitor: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop",
  sony_controller: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=400&h=400&fit=crop",
  fire_tv_hd: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
  fire_xbox: "https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=400&h=400&fit=crop",
  wall_clocks: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400&h=400&fit=crop",
  pillows: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop",
  floor_mats: "https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=400&h=400&fit=crop",
  candles: "https://images.unsplash.com/photo-1603006905003-be475563bc45?w=400&h=400&fit=crop",
  desktop: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=400&fit=crop",
  laptops: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
  pc_access: "https://images.unsplash.com/photo-1593642532400-2682810df593?w=400&h=400&fit=crop",
  business2: "https://images.unsplash.com/photo-1497366811353-26cc3f223fae?w=400&h=400&fit=crop",
  home_furnishing: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop",
  home_storage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
  lighting: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=400&fit=crop",
  home_decor: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=400&fit=crop",
  truly_wireless: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop",
  over_ear: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop",
  neckbands: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400&h=400&fit=crop",
  wired_earphones: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop",
  boat_brand: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop",
  boult_audio: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=400&h=400&fit=crop",
  noise_brand: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop",
  zebronics_brand: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop",
  drawing: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop",
  rulers: "https://images.unsplash.com/photo-1583485088034-697b5d33f1a6?w=400&h=400&fit=crop",
  pencil_cases: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=400&h=400&fit=crop",
  lunch_boxes: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=400&fit=crop",
  printers: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&h=400&fit=crop",
  routers: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=400&fit=crop",
  echo_spot: "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=400&h=400&fit=crop",
  echo_dot_max: "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=400&h=400&fit=crop",
  echo_studio: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=400&fit=crop",
  echo_dot: "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=400&h=400&fit=crop",
  racquets: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400&h=400&fit=crop",
  fitness: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop",
  kurtas: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
  dresses: "https://images.unsplash.com/photo-1495385794356-15371f348c31?w=400&h=400&fit=crop",
  notebooks: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop",
  stationery: "https://images.unsplash.com/photo-1583485088034-697b5d33f1a6?w=400&h=400&fit=crop",
  bedsheet: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop",
  vase: "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=400&h=400&fit=crop",
  zebronics_bt: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=400&fit=crop",
  kindle: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop",
  echo_show: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
  budget_phone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
  mid_phone: "https://images.unsplash.com/photo-1592899677977-9bb10ba128a5?w=400&h=400&fit=crop",
  samsung: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
  redmi: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop",
  tv: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
  deal_cooker_alt: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop",
  deal_fan_alt: "https://images.unsplash.com/photo-1598301257982-0cf014dabbcd?w=400&h=400&fit=crop",
  deal_shoe_alt: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop",
  home_decor_alt: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=400&fit=crop",
  water_alt: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=400&fit=crop",
  storage_alt: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop",
  earbud_alt: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
  lunch_alt: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=400&h=400&fit=crop",
  hungama_alt: "https://images.unsplash.com/photo-1517705008128-361805f42e86?w=400&h=400&fit=crop",
  neckband_alt: "https://images.unsplash.com/photo-1600086827875-a63b01f1335c?w=400&h=400&fit=crop",
  boult_alt: "https://images.unsplash.com/photo-1518441313301-1f2b8e5a4a9f?w=400&h=400&fit=crop",
  brand_alt: "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=400&h=400&fit=crop",
  brand_alt2: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop",
  brand_alt3: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=400&h=400&fit=crop",
  echo_alt: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=400&h=400&fit=crop",
  echo_show_alt: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop",
  tv_alt2: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=400&fit=crop",
  tv_alt3: "https://images.unsplash.com/photo-1558888401-3cc1de77652d?w=400&h=400&fit=crop",
  wired_alt: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
  boat_349_alt: "https://images.unsplash.com/photo-1578319439584-104c94d37305?w=400&h=400&fit=crop",
  fire_tv_hd_2: "https://images.unsplash.com/photo-1601944177325-f8867652837f?w=400&h=400&fit=crop",
  fire_tv_hd_3: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=400&fit=crop",
  echo_spot_2: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=400&h=400&fit=crop",
  budget_phone_2: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&h=400&fit=crop",
  mid_phone_2: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&h=400&fit=crop",
  samsung_2: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop",
  redmi_2: "https://images.unsplash.com/photo-1592286927505-2fd6b0c1f9d8?w=400&h=400&fit=crop",
  pillow_alt: "https://images.unsplash.com/photo-1578898887932-dce23a595e8c?w=400&h=400&fit=crop",
};


const FALLBACK = {
  electronics: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='400'%3E%3Crect width='500' height='400' fill='%23eef2f6'/%3E%3Crect x='145' y='95' width='210' height='145' rx='12' fill='%23cbd5e1'/%3E%3Crect x='185' y='260' width='130' height='12' rx='6' fill='%2394a3b8'/%3E%3C/svg%3E",
  home: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='400'%3E%3Crect width='500' height='400' fill='%23f5f0e8'/%3E%3Crect x='90' y='210' width='320' height='75' rx='12' fill='%23d6c4ae'/%3E%3Ccircle cx='250' cy='170' r='55' fill='%23eadcc9'/%3E%3C/svg%3E",
  fashion: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='400'%3E%3Crect width='500' height='400' fill='%23f8e9ee'/%3E%3Cpath d='M175 90h150l55 110-55 28v115H175V228l-55-28z' fill='%23d9a4b5'/%3E%3C/svg%3E",
  grocery: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='400'%3E%3Crect width='500' height='400' fill='%23edf6e9'/%3E%3Ccircle cx='200' cy='205' r='90' fill='%23a8c98f'/%3E%3Ccircle cx='315' cy='225' r='75' fill='%23d7b36a'/%3E%3C/svg%3E",
  general: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='400'%3E%3Crect width='500' height='400' fill='%23f1f3f5'/%3E%3Crect x='130' y='100' width='240' height='200' rx='18' fill='%23cbd5e1'/%3E%3C/svg%3E",
};

const SafeImage = ({ src, alt, type = "general", className = "" }) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    className={className}
    onError={(event) => {
      event.currentTarget.onerror = null;
      event.currentTarget.src = FALLBACK[type] || FALLBACK.general;
    }}
  />
);

const Card = ({ title, children, linkTo = "/products" }) => (
  <div className="bg-white p-4 shadow-[0_2px_5px_rgba(15,17,17,0.15)] h-[460px] flex flex-col transition-shadow hover:shadow-[0_4px_12px_rgba(15,17,17,0.25)]">
    <div className="flex justify-between items-start mb-1">
      <h2 className="text-[18px] font-bold leading-[22px] line-clamp-2 flex-1 text-[#0F1111]">{title}</h2>
    </div>
    <div className="flex-1 mt-3">{children}</div>
    <Link
      to={linkTo}
      className="text-[#007185] text-[13px] mt-3 pt-2 border-t border-[#E7E7E7] hover:text-[#C7511F] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007185] focus-visible:outline-offset-2 rounded-sm"
    >
      See more
    </Link>
  </div>
);
const Item = ({ img, label, type = "general" }) => (
  <Link
    to="/products"
    className="block group rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007185] focus-visible:outline-offset-2"
  >
    <div className="bg-[#F7F7F7] h-[115px] flex items-center justify-center overflow-hidden rounded-sm">
      <SafeImage
        src={img}
        alt={label}
        type={type}
        className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
      />
    </div>
    <p className="text-[11px] mt-1.5 leading-[12px] line-clamp-2 h-[24px] text-[#0F1111] group-hover:text-[#C7511F] group-hover:underline">
      {label}
    </p>
  </Link>
);
const Stars = ({ rating, reviews }) => {
  const pct = Math.max(0, Math.min(5, rating)) / 5 * 100;
  return (
    <div className="flex items-center gap-1">
      <div className="relative inline-block leading-none">
        <span className="text-[13px] tracking-[1px] text-[#CCCCCC]">★★★★★</span>
        <span
          className="absolute inset-0 overflow-hidden text-[13px] tracking-[1px] text-[#FFA41C]"
          style={{ width: `${pct}%` }}
        >
          ★★★★★
        </span>
      </div>
      <span className="text-[12px] text-[#007185]">{reviews.toLocaleString("en-IN")}</span>
    </div>
  );
};

const PrimeBadge = () => (
  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#007185]">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8l4 8 4-8 4 8 4-8" stroke="#00A8E1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    prime
  </span>
);

const ProductCard = ({ img, type, title, rating, reviews, price, mrp, delivery }) => {
  const numPrice = Number(String(price).replace(/,/g, ""));
  const numMrp = Number(String(mrp).replace(/,/g, ""));
  const off = numMrp > numPrice ? Math.round(((numMrp - numPrice) / numMrp) * 100) : 0;
  return (
    <Link
      to="/products"
      className="group shrink-0 w-[220px] bg-white border border-[#E7E7E7] rounded-lg p-3 flex flex-col transition-shadow hover:shadow-[0_4px_12px_rgba(15,17,17,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007185] focus-visible:outline-offset-2"
    >
      <div className="h-[160px] flex items-center justify-center bg-[#F7F7F7] rounded-sm overflow-hidden">
        <SafeImage
          src={img}
          alt={title}
          type={type}
          className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
        />
      </div>
      <p className="text-[13px] mt-2.5 leading-[17px] line-clamp-2 h-[34px] text-[#0F1111] group-hover:text-[#C7511F]">
        {title}
      </p>
      <div className="mt-1"><Stars rating={rating} reviews={reviews} /></div>
      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="text-[10px] mt-1">₹</span>
        <span className="text-[19px] font-bold text-[#0F1111]">{price}</span>
        {off > 0 && (
          <>
            <span className="text-[12px] text-[#565959] line-through">₹{mrp}</span>
            <span className="text-[12px] font-bold text-[#CC0C39]">-{off}%</span>
          </>
        )}
      </div>
      <div className="mt-1.5"><PrimeBadge /></div>
      <p className="text-[11px] text-[#565959] mt-0.5">{delivery}</p>
    </Link>
  );
};

const Carousel = ({ title, children }) => {
  const trackRef = useRef(null);
  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: "smooth" });
  };
  return (
    <div className="bg-white p-4 shadow-[0_2px_5px_rgba(15,17,17,0.15)]">
      <div className="max-w-[1480px] mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[21px] font-bold text-[#0F1111]">{title}</h2>
          <div className="flex gap-1.5">
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scrollBy(-1)}
              className="w-8 h-8 rounded-full border border-[#D5D9D9] flex items-center justify-center hover:bg-[#F7F8F8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007185]"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollBy(1)}
              className="w-8 h-8 rounded-full border border-[#D5D9D9] flex items-center justify-center hover:bg-[#F7F8F8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007185]"
            >
              ›
            </button>
          </div>
        </div>
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const PriceItem = ({ img, price, mrp, type = "general" }) => {
  const numPrice = Number(String(price).replace(/,/g, ""));
  const numMrp = Number(String(mrp).replace(/,/g, ""));
  const off = numMrp > numPrice ? Math.round(((numMrp - numPrice) / numMrp) * 100) : 0;
  return (
    <Link
      to="/products"
      className="bg-white p-2 border border-[#E7E7E7] rounded-lg flex flex-col relative transition-shadow hover:shadow-[0_2px_8px_rgba(15,17,17,0.2)]"
    >
      <div className="h-[100px] flex items-center justify-center">
        <SafeImage src={img} alt="" type={type} className="max-h-full max-w-full object-contain" />
      </div>
      <p className="text-[13px] font-bold mt-1 text-[#0F1111]">₹{price}</p>
      <div className="flex items-center gap-1.5">
        <p className="text-[10px] text-[#565959] line-through">₹{mrp}</p>
        {off > 0 && <span className="text-[10px] font-bold text-[#CC0C39]">-{off}%</span>}
      </div>
    </Link>
  );
};

export default function Home() {
  return (
    <div className="bg-[#E3E6E6] min-h-screen">
      <div className="relative">
        <div className="absolute top-0 w-full h-[600px] bg-gradient-to-b from-[#FFD8B0] via-[#F5D0FF] to-[#E3E6E6]" />
        <div className="relative max-w-[1480px] mx-auto px-3 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          <div className="bg-[#FF4D6E] p-4 h-[460px] flex flex-col shadow">
            <h2 className="text-[20px] font-extrabold text-white leading-[22px]">Get up to ₹100<br/>cashback*</h2>
            <p className="text-white text-[12px] mt-1">Lowest prices on Amazon</p>
            <div className="grid grid-cols-3 gap-1.5 mt-3 flex-1">
              <div className="bg-white p-1 h-[85px]"><SafeImage src={IMG.b1_watch} alt="b1_watch" type="electronics" className="w-full h-full object-cover"/></div>
              <div className="bg-white p-1 h-[85px]"><SafeImage src={IMG.b2_jacket} alt="b2_jacket" type="fashion" className="w-full h-full object-cover"/></div>
              <div className="bg-white p-1 h-[85px]"><SafeImage src={IMG.b3_cooker} alt="b3_cooker" type="home" className="w-full h-full object-cover"/></div>
              <div className="bg-white p-1 h-[85px]"><SafeImage src={IMG.b4_bag} alt="b4_bag" type="fashion" className="w-full h-full object-cover"/></div>
              <div className="bg-white p-1 h-[85px]"><SafeImage src={IMG.b5_decor} alt="b5_decor" type="home" className="w-full h-full object-cover"/></div>
              <div className="bg-white p-1 h-[85px]"><SafeImage src={IMG.b6_table} alt="b6_table" type="home" className="w-full h-full object-cover"/></div>
              <div className="bg-white p-1 h-[85px]"><SafeImage src={IMG.b7_shoes} alt="b7_shoes" type="fashion" className="w-full h-full object-cover"/></div>
              <div className="bg-white p-1 h-[85px]"><SafeImage src={IMG.b8_shirt} alt="b8_shirt" type="fashion" className="w-full h-full object-cover"/></div>
              <div className="bg-white p-1 h-[85px]"><SafeImage src={IMG.b9_bottle} alt="b9_bottle" type="general" className="w-full h-full object-cover"/></div>
            </div>
          </div>
          <Card title="Up to 70% off Pots & planters"><SafeImage src={IMG.plants} alt="Pots and planters" type="home" className="w-full h-[300px] object-cover rounded-lg"/></Card>
          <div className="bg-[#FCAFA6] p-4 h-[460px] flex flex-col shadow"><h2 className="text-[18px] font-bold">Shop popular deals</h2><div className="grid grid-cols-2 gap-2 mt-3 flex-1"><PriceItem img={IMG.deal_cooker_alt} price="869" mrp="1,889" type="home" /><PriceItem img={IMG.deal_fan_alt} price="2,849" mrp="5,499" type="home" /><PriceItem img={IMG.deal_earbud} price="1,007" mrp="1,185" type="electronics" /><PriceItem img={IMG.deal_shoe_alt} price="3,099" mrp="4,999" type="fashion" /></div></div>
          <div className="bg-black p-5 h-[460px] flex flex-col shadow"><h2 className="text-[22px] font-black text-white leading-[22px]">3 months FREE</h2><p className="text-white text-[13px] mt-1">Unlimited music, ad-free</p><p className="text-white font-bold mt-3">amazon music</p><p className="text-white/60 text-[11px] mt-auto">Terms apply.</p></div>
          <div className="hidden xl:flex bg-white p-4 h-[460px] flex-col shadow"><h2 className="text-[18px] font-bold leading-[22px]">Under ₹399<br/>T-shirts & polos</h2><SafeImage src={IMG.tshirts} alt="T-shirts and polos" type="fashion" className="w-full h-[240px] object-contain mt-3 bg-[#F7F7F7]" /><Link to="/products" className="text-[#007185] text-[12px] mt-auto">See all offers</Link></div>
        </div>

        <div className="mt-5">
          <Carousel title="Keep shopping for">
            <ProductCard
              img={IMG.notebooks}
              type="general"
              title="Classmate Pulse Ruled Notebook, Pack of 6"
              rating={4.3}
              reviews={12453}
              price="249"
              mrp="349"
              delivery="Get it by Tomorrow"
            />
            <ProductCard
              img={IMG.water_bottles}
              type="general"
              title="Milton Thermosteel Insulated Water Bottle, 1L"
              rating={4.4}
              reviews={8317}
              price="599"
              mrp="999"
              delivery="Get it by Tomorrow"
            />
            <ProductCard
              img={IMG.deal_shoe}
              type="fashion"
              title="Men's Lightweight Running Sports Shoes"
              rating={4.2}
              reviews={15602}
              price="1,299"
              mrp="2,499"
              delivery="Get it in 2 days"
            />
            <ProductCard
              img={IMG.wall_clocks}
              type="home"
              title="Wooden Wall Clock, Silent Sweep, 12-inch"
              rating={4.5}
              reviews={6708}
              price="599"
              mrp="1,199"
              delivery="Get it by Tomorrow"
            />
            <ProductCard
              img={IMG.home_decor}
              type="home"
              title="Handcrafted Ceramic Table Vase, White"
              rating={4.1}
              reviews={2104}
              price="449"
              mrp="799"
              delivery="Get it in 3 days"
            />
            <ProductCard
              img={IMG.fitness}
              type="general"
              title="Resistance Bands Set for Home Workout"
              rating={4.3}
              reviews={9421}
              price="399"
              mrp="899"
              delivery="Get it by Tomorrow"
            />
          </Carousel>
        </div>

        <div className="max-w-[1480px] mx-auto px-3 mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card title="Lowest prices on Amazon + Extra 15% cashback">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.cleaning} label="Under ₹499 | Cleaning supplies" type="home" />
              <Item img={IMG.oil_ghee} label="Starting ₹199 | Oil & ghee" type="grocery" />
              <Item img={IMG.tea_coffee} label="Under ₹299 | Tea & coffee" type="grocery" />
              <Item img={IMG.baby_care} label="Under ₹499 | Baby care" type="general" />
            </div>
          </Card>
          <Card title="Starting ₹99 | Kitchen deals | Amazon Brands & more">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.water_alt} label="Starting ₹149 | Water bottles" type="general" />
              <Item img={IMG.cookware} label="Starting ₹299 | Cookware" type="home" />
              <Item img={IMG.kitchen_tools} label="Min. 40% off | Kitchen tools" type="home" />
              <Item img={IMG.storage_alt} label="Starting ₹199 | Storage" type="home" />
            </div>
          </Card>
          <Card title="Up to 80% off on Home improvements + 10% Assured...">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.electrical} label="Electrical & accessories" type="electronics" />
              <Item img={IMG.ladders} label="Ladders | Up to 50% off" type="general" />
              <Item img={IMG.security_camera} label="Security cameras | Up to 60% off" type="electronics" />
              <Item img={IMG.business} label="For business purchases" type="general" />
            </div>
          </Card>
          <Card title="Starting ₹149 | Headphones from most loved brands">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.boat_349_alt} label="Boat | Starting ₹349" type="electronics" />
              <Item img={IMG.hungama_alt} label="Hungama HiLife | Starting ₹399" type="electronics" />
              <Item img={IMG.boult_399} label="Boult Audio | Starting ₹399" type="electronics" />
              <Item img={IMG.zebronics_399} label="Zebronics | Starting ₹399" type="electronics" />
            </div>
          </Card>
        </div>

        <div className="max-w-[1480px] mx-auto px-3 mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card title="Starting ₹199 | Dry fruits & seeds">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.almonds} label="Almonds" type="grocery" />
              <Item img={IMG.dates} label="Dates" type="grocery" />
              <Item img={IMG.cashews} label="Cashews" type="grocery" />
              <Item img={IMG.chia} label="Chia seeds" type="grocery" />
            </div>
          </Card>
          <Card title="Deals on smart gaming controls">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.gaming_monitor} label="Lenovo Legion Gaming Monitor" type="electronics" />
              <Item img={IMG.sony_controller} label="Sony DualSense Wireless Controller" type="electronics" />
              <Item img={IMG.fire_tv_hd} label="Fire TV Stick HD" type="electronics" />
              <Item img={IMG.fire_xbox} label="Fire TV Stick Xbox Game Pass" type="electronics" />
            </div>
          </Card>
          <Card title="Under ₹499 | Best of home products">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.wall_clocks} label="Wall clocks" type="home" />
              <Item img={IMG.pillow_alt} label="Pillows" type="home" />
              <Item img={IMG.floor_mats} label="Floor mats" type="home" />
              <Item img={IMG.candles} label="Candles" type="home" />
            </div>
          </Card>
          <Card title="Buy office electronics at wholesale prices + 10% cashb...">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.desktop} label="Up to 50% off on Desktop & more" type="electronics" />
              <Item img={IMG.laptops} label="Up to 40% off on Laptops & more" type="electronics" />
              <Item img={IMG.pc_access} label="Up to 40% off | PC & accessories" type="electronics" />
              <Item img={IMG.business2} label="For business purchases" type="general" />
            </div>
          </Card>
        </div>

        <div className="max-w-[1480px] mx-auto px-3 mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card title="Starting ₹169 | Must-have home buys">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.home_furnishing} label="Min. 50% off | Home furnishing" type="home" />
              <Item img={IMG.home_storage} label="Min. 50% off | Home storage" type="home" />
              <Item img={IMG.lighting} label="Starting ₹199 | Lighting" type="home" />
              <Item img={IMG.home_decor_alt} label="Starting ₹129 | Home decor" type="home" />
            </div>
          </Card>
          <Card title="Starting ₹149 | Bestselling headphones, earbuds & more">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.earbud_alt} label="Truly wireless earbuds" type="electronics" />
              <Item img={IMG.over_ear} label="Over ear headphones" type="electronics" />
              <Item img={IMG.neckband_alt} label="Neckbands" type="electronics" />
              <Item img={IMG.wired_alt} label="Wired earphones" type="electronics" />
            </div>
          </Card>
          <Card title="Starting ₹149 | Your favourite headphone brands">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.brand_alt2} label="boAt" type="electronics" />
              <Item img={IMG.boult_alt} label="Boult Audio" type="electronics" />
              <Item img={IMG.brand_alt3} label="Noise" type="electronics" />
              <Item img={IMG.brand_alt} label="Zebronics" type="electronics" />
            </div>
          </Card>
          <Card title="Up to 60% off | Back to school essentials">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.drawing} label="Drawing & painting supplies" type="general" />
              <Item img={IMG.rulers} label="Rulers & set squares" type="general" />
              <Item img={IMG.pencil_cases} label="Pencil cases" type="general" />
              <Item img={IMG.lunch_alt} label="Lunch boxes" type="general" />
            </div>
          </Card>
        </div>

        <div className="max-w-[1480px] mx-auto px-3 mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card title="Up to 60% off | Bestselling Printers & routers">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.printers} label="Printers" type="electronics" />
              <Item img={IMG.routers} label="Routers" type="electronics" />
            </div>
          </Card>
          <Card title="Voice control your smart home">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.echo_spot} label="Echo Spot with Alexa" type="electronics" />
              <Item img={IMG.echo_dot_max} label="Echo Dot Max with Alexa" type="electronics" />
              <Item img={IMG.echo_studio} label="Echo Studio with Alexa" type="electronics" />
              <Item img={IMG.echo_alt} label="Echo Dot with Alexa" type="electronics" />
            </div>
          </Card>
          <Card title="Starting ₹99 | Handpicked sports & fitness essentials">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.racquets} label="Starting ₹299 | Racquets" type="general" />
              <Item img={IMG.fitness} label="Starting ₹149 | Fitness" type="general" />
            </div>
          </Card>
          <Card title="Under ₹499 | Top offers on top styles">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.kurtas} label="Kurtas & sets" type="fashion" />
              <Item img={IMG.dresses} label="Dresses & jumpsuits" type="fashion" />
            </div>
          </Card>
        </div>

        <div className="max-w-[1480px] mx-auto px-3 mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card title="Smartphones curated just for you">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.budget_phone} label="Budget | Below ₹10,000" type="electronics" />
              <Item img={IMG.mid_phone} label="Mid range | ₹10,000 - ₹25,000" type="electronics" />
              <Item img={IMG.samsung} label="Premium | ₹25,000 - ..." type="electronics" />
              <Item img={IMG.redmi} label="Ultra premium | Above..." type="electronics" />
            </div>
          </Card>
          <Card title="Popular smartphone brands">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.samsung_2} label="Samsung | Starting ₹..." type="electronics" />
              <Item img={IMG.redmi_2} label="Redmi | Starting ₹26,..." type="electronics" />
              <Item img={IMG.budget_phone_2} label="Realme | Starting ₹15..." type="electronics" />
              <Item img={IMG.mid_phone_2} label="Vivo | Starting ₹29,999" type="electronics" />
            </div>
          </Card>
          <Card title="Bestselling Devices">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.kindle} label="Kindle paperwhite | ₹..." type="electronics" />
              <Item img={IMG.echo_show_alt} label="Amazon Echo Show..." type="electronics" />
              <Item img={IMG.echo_spot} label="Echo Spot | ₹8,499" type="electronics" />
              <Item img={IMG.fire_tv_hd_2} label="Fire TV Cube | ₹12,999" type="electronics" />
            </div>
          </Card>
          <Card title="Home entertainment smart solutions">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.tv_alt3} label="Samsung Ultra HD Smart TVs" type="electronics" />
              <Item img={IMG.fire_tv_hd} label="Fire TV Stick HD" type="electronics" />
              <Item img={IMG.tv_alt2} label="Xiaomi QLED Ultra HD..." type="electronics" />
              <Item img={IMG.fire_tv_hd_2} label="Fire TV Cube" type="electronics" />
            </div>
          </Card>
        </div>

        <div className="bg-white border-y mt-6 py-6">
          <div className="max-w-[1480px] mx-auto text-center">
            <h2 className="text-[21px] font-bold">See personalized recommendations</h2>
            <Link to="/login" className="inline-block mt-3 bg-[#FFD814] border border-[#FCD200] rounded-lg px-24 py-1.5 text-[12px] font-bold">Sign in</Link>
            <p className="text-[11px] mt-2">New customer? <Link to="/register" className="text-[#0066c0] underline">Start here.</Link></p>
          </div>
        </div>
        <div className="bg-[#37475A] text-center py-4 text-white text-[13px]">Back to top</div>
        <div className="bg-[#232F3E] text-[#DDD] py-8">
          <div className="max-w-[1000px] mx-auto grid grid-cols-4 gap-8 px-4 text-[13px]">
            <div><h4 className="font-bold text-white mb-2">Get to Know Us</h4><p>About Amazon</p><p>Careers</p></div>
            <div><h4 className="font-bold text-white mb-2">Connect with Us</h4><p>Facebook</p><p>Twitter</p><p>Instagram</p></div>
            <div><h4 className="font-bold text-white mb-2">Make Money with Us</h4><p>Sell on Amazon</p></div>
            <div><h4 className="font-bold text-white mb-2">Let Us Help You</h4><p>Your Account</p><p>Returns Centre</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}