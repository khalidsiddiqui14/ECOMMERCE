import { Link } from "react-router-dom";

// FINAL REAL E-COMMERCE - 100% REAL PRODUCTS - NO FOREST/MOUNTAIN - AMAZON LIKE
const IMG = {
  // Bazaar Top 9 - Real products
  b1_watch: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=400&fit=crop",
  b2_jacket: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop",
  b3_cooker: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&h=400&fit=crop",
  b4_bag: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
  b5_decor: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=400&fit=crop",
  b6_table: "https://images.unsplash.com/photo-1533090484-07cc94c8a6f2?w=400&h=400&fit=crop",
  b7_shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
  b8_shirt: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
  b9_bottle: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
  plants: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop",
  deal_cooker: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&h=400&fit=crop",
  deal_fan: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
  deal_earbud: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop",
  deal_shoe: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
  tshirts: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
  // REAL E-COMMERCE PRODUCTS - 16
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
  // Dry fruits - EXACT REAL
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
};

const Card = ({ title, children }) => (
  <div className="bg-white p-4 shadow-[0_2px_5px_rgba(15,17,17,0.15)] h-[460px] flex flex-col">
    <div className="flex justify-between items-start mb-1">
      <h2 className="text-[18px] font-bold leading-[22px] line-clamp-2 flex-1">{title}</h2>
      <span className="text-[#067D62] ml-2 text-[14px]">→</span>
    </div>
    <div className="flex-1 mt-3">{children}</div>
  </div>
);
const Item = ({ img, label }) => (
  <Link to="/products" className="block">
    <div className="bg-[#F7F7F7] h-[115px] flex items-center justify-center overflow-hidden">
      <img src={img} alt={label} className="w-full h-full object-cover hover:scale-105 transition" loading="lazy" />
    </div>
    <p className="text-[11px] mt-1.5 leading-[12px] line-clamp-2 h-[24px]">{label}</p>
  </Link>
);
const PriceItem = ({ img, price, mrp }) => (
  <Link to="/products" className="bg-white p-2 border rounded-lg flex flex-col">
    <div className="h-[100px] flex items-center justify-center"><img src={img} alt="" className="max-h-full object-contain" /></div>
    <p className="text-[13px] font-bold mt-1">₹{price}</p>
    <p className="text-[10px] text-[#565959] line-through">₹{mrp}</p>
  </Link>
);

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
              <div className="bg-white p-1 h-[85px]"><img src={IMG.b1_watch} className="w-full h-full object-cover" alt=""/></div>
              <div className="bg-white p-1 h-[85px]"><img src={IMG.b2_jacket} className="w-full h-full object-cover" alt=""/></div>
              <div className="bg-white p-1 h-[85px]"><img src={IMG.b3_cooker} className="w-full h-full object-cover" alt=""/></div>
              <div className="bg-white p-1 h-[85px]"><img src={IMG.b4_bag} className="w-full h-full object-cover" alt=""/></div>
              <div className="bg-white p-1 h-[85px]"><img src={IMG.b5_decor} className="w-full h-full object-cover" alt=""/></div>
              <div className="bg-white p-1 h-[85px]"><img src={IMG.b6_table} className="w-full h-full object-cover" alt=""/></div>
              <div className="bg-white p-1 h-[85px]"><img src={IMG.b7_shoes} className="w-full h-full object-cover" alt=""/></div>
              <div className="bg-white p-1 h-[85px]"><img src={IMG.b8_shirt} className="w-full h-full object-cover" alt=""/></div>
              <div className="bg-white p-1 h-[85px]"><img src={IMG.b9_bottle} className="w-full h-full object-cover" alt=""/></div>
            </div>
          </div>
          <Card title="Up to 70% off Pots & planters"><img src={IMG.plants} alt="" className="w-full h-[300px] object-cover rounded-lg"/></Card>
          <div className="bg-[#FCAFA6] p-4 h-[460px] flex flex-col shadow"><h2 className="text-[18px] font-bold">Shop popular deals</h2><div className="grid grid-cols-2 gap-2 mt-3 flex-1"><PriceItem img={IMG.deal_cooker} price="869" mrp="1,889" /><PriceItem img={IMG.deal_fan} price="2,849" mrp="5,499" /><PriceItem img={IMG.deal_earbud} price="1,007" mrp="1,185" /><PriceItem img={IMG.deal_shoe} price="3,099" mrp="4,999" /></div></div>
          <div className="bg-black p-5 h-[460px] flex flex-col shadow"><h2 className="text-[22px] font-black text-white leading-[22px]">3 months FREE</h2><p className="text-white text-[13px] mt-1">Unlimited music, ad-free</p><p className="text-white font-bold mt-3">amazon music</p><p className="text-white/60 text-[11px] mt-auto">Terms apply.</p></div>
          <div className="hidden xl:flex bg-white p-4 h-[460px] flex-col shadow"><h2 className="text-[18px] font-bold leading-[22px]">Under ₹399<br/>T-shirts & polos</h2><img src={IMG.tshirts} alt="" className="w-full h-[240px] object-contain mt-3 bg-[#F7F7F7]" /><Link to="/products" className="text-[#007185] text-[12px] mt-auto">See all offers</Link></div>
        </div>

        <div className="max-w-[1480px] mx-auto px-3 mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card title="Lowest prices on Amazon + Extra 15% cashback">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.cleaning} label="Under ₹499 | Cleaning supplies" />
              <Item img={IMG.oil_ghee} label="Starting ₹199 | Oil & ghee" />
              <Item img={IMG.tea_coffee} label="Under ₹299 | Tea & coffee" />
              <Item img={IMG.baby_care} label="Under ₹499 | Baby care" />
            </div>
          </Card>
          <Card title="Starting ₹99 | Kitchen deals | Amazon Brands & more">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.water_bottles} label="Starting ₹149 | Water bottles" />
              <Item img={IMG.cookware} label="Starting ₹299 | Cookware" />
              <Item img={IMG.kitchen_tools} label="Min. 40% off | Kitchen tools" />
              <Item img={IMG.storage} label="Starting ₹199 | Storage" />
            </div>
          </Card>
          <Card title="Up to 80% off on Home improvements + 10% Assured...">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.electrical} label="Electrical & accessories" />
              <Item img={IMG.ladders} label="Ladders | Up to 50% off" />
              <Item img={IMG.security_camera} label="Security cameras | Up to 60% off" />
              <Item img={IMG.business} label="For business purchases" />
            </div>
          </Card>
          <Card title="Starting ₹149 | Headphones from most loved brands">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.boat_349} label="Boat | Starting ₹349" />
              <Item img={IMG.hungama} label="Hungama HiLife | Starting ₹399" />
              <Item img={IMG.boult_399} label="Boult Audio | Starting ₹399" />
              <Item img={IMG.zebronics_399} label="Zebronics | Starting ₹399" />
            </div>
          </Card>
        </div>

        <div className="max-w-[1480px] mx-auto px-3 mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card title="Starting ₹199 | Dry fruits & seeds">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.almonds} label="Almonds" />
              <Item img={IMG.dates} label="Dates" />
              <Item img={IMG.cashews} label="Cashews" />
              <Item img={IMG.chia} label="Chia seeds" />
            </div>
          </Card>
          <Card title="Deals on smart gaming controls">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.gaming_monitor} label="Lenovo Legion Gaming Monitor" />
              <Item img={IMG.sony_controller} label="Sony DualSense Wireless Controller" />
              <Item img={IMG.fire_tv_hd} label="Fire TV Stick HD" />
              <Item img={IMG.fire_xbox} label="Fire TV Stick Xbox Game Pass" />
            </div>
          </Card>
          <Card title="Under ₹499 | Best of home products">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.wall_clocks} label="Wall clocks" />
              <Item img={IMG.pillows} label="Pillows" />
              <Item img={IMG.floor_mats} label="Floor mats" />
              <Item img={IMG.candles} label="Candles" />
            </div>
          </Card>
          <Card title="Buy office electronics at wholesale prices + 10% cashb...">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.desktop} label="Up to 50% off on Desktop & more" />
              <Item img={IMG.laptops} label="Up to 40% off on Laptops & more" />
              <Item img={IMG.pc_access} label="Up to 40% off | PC & accessories" />
              <Item img={IMG.business2} label="For business purchases" />
            </div>
          </Card>
        </div>

        <div className="max-w-[1480px] mx-auto px-3 mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card title="Starting ₹169 | Must-have home buys">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.home_furnishing} label="Min. 50% off | Home furnishing" />
              <Item img={IMG.home_storage} label="Min. 50% off | Home storage" />
              <Item img={IMG.lighting} label="Starting ₹199 | Lighting" />
              <Item img={IMG.home_decor} label="Starting ₹129 | Home decor" />
            </div>
          </Card>
          <Card title="Starting ₹149 | Bestselling headphones, earbuds & more">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.truly_wireless} label="Truly wireless earbuds" />
              <Item img={IMG.over_ear} label="Over ear headphones" />
              <Item img={IMG.neckbands} label="Neckbands" />
              <Item img={IMG.wired_earphones} label="Wired earphones" />
            </div>
          </Card>
          <Card title="Starting ₹149 | Your favourite headphone brands">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.boat_brand} label="boAt" />
              <Item img={IMG.boult_audio} label="Boult Audio" />
              <Item img={IMG.noise_brand} label="Noise" />
              <Item img={IMG.zebronics_brand} label="Zebronics" />
            </div>
          </Card>
          <Card title="Up to 60% off | Back to school essentials">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.drawing} label="Drawing & painting supplies" />
              <Item img={IMG.rulers} label="Rulers & set squares" />
              <Item img={IMG.pencil_cases} label="Pencil cases" />
              <Item img={IMG.lunch_boxes} label="Lunch boxes" />
            </div>
          </Card>
        </div>

        <div className="max-w-[1480px] mx-auto px-3 mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card title="Up to 60% off | Bestselling Printers & routers">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.printers} label="Printers" />
              <Item img={IMG.routers} label="Routers" />
            </div>
          </Card>
          <Card title="Voice control your smart home">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.echo_spot} label="Echo Spot with Alexa" />
              <Item img={IMG.echo_dot_max} label="Echo Dot Max with Alexa" />
              <Item img={IMG.echo_studio} label="Echo Studio with Alexa" />
              <Item img={IMG.echo_dot} label="Echo Dot with Alexa" />
            </div>
          </Card>
          <Card title="Starting ₹99 | Handpicked sports & fitness essentials">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.racquets} label="Starting ₹299 | Racquets" />
              <Item img={IMG.fitness} label="Starting ₹149 | Fitness" />
            </div>
          </Card>
          <Card title="Under ₹499 | Top offers on top styles">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.kurtas} label="Kurtas & sets" />
              <Item img={IMG.dresses} label="Dresses & jumpsuits" />
            </div>
          </Card>
        </div>

        <div className="max-w-[1480px] mx-auto px-3 mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card title="Smartphones curated just for you">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.budget_phone} label="Budget | Below ₹10,000" />
              <Item img={IMG.mid_phone} label="Mid range | ₹10,000 - ₹25,000" />
              <Item img={IMG.samsung} label="Premium | ₹25,000 - ..." />
              <Item img={IMG.redmi} label="Ultra premium | Above..." />
            </div>
          </Card>
          <Card title="Popular smartphone brands">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.samsung} label="Samsung | Starting ₹..." />
              <Item img={IMG.redmi} label="Redmi | Starting ₹26,..." />
              <Item img={IMG.budget_phone} label="Realme | Starting ₹15..." />
              <Item img={IMG.mid_phone} label="Vivo | Starting ₹29,999" />
            </div>
          </Card>
          <Card title="Bestselling Devices">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.kindle} label="Kindle paperwhite | ₹..." />
              <Item img={IMG.echo_show} label="Amazon Echo Show..." />
              <Item img={IMG.echo_spot} label="Echo Spot | ₹8,499" />
              <Item img={IMG.fire_tv_hd} label="Fire TV Cube | ₹12,999" />
            </div>
          </Card>
          <Card title="Home entertainment smart solutions">
            <div className="grid grid-cols-2 gap-3">
              <Item img={IMG.tv} label="Samsung Ultra HD Smart TVs" />
              <Item img={IMG.fire_tv_hd} label="Fire TV Stick HD" />
              <Item img={IMG.tv} label="Xiaomi QLED Ultra HD..." />
              <Item img={IMG.fire_tv_hd} label="Fire TV Cube" />
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