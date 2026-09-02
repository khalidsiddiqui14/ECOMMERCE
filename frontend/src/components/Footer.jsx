import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer" style={{background:'#0f0e0d',color:'#fff',marginTop:60,position:'relative',overflow:'hidden'}}>
      {/* Top newsletter like Flipkart */}
      <div style={{background:'#1a1816',borderBottom:'1px solid rgba(255,255,255,.08)',padding:'20px 24px'}}>
        <div style={{maxWidth:1200,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:40,height:40,borderRadius:12,background:'#fff',color:'#1a1816',display:'grid',placeItems:'center',fontWeight:900,fontSize:18}}>E</div>
            <div>
              <div style={{fontSize:14,fontWeight:800}}>Get 10% OFF on first order</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.5)'}}>Join 50,000+ happy shoppers</div>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <input placeholder="Enter your email" style={{minWidth:240,minHeight:40,padding:'0 14px',borderRadius:999,border:'1px solid rgba(255,255,255,.15)',background:'rgba(255,255,255,.06)',color:'#fff',outline:'none',fontSize:13}} />
            <button style={{minHeight:40,padding:'0 18px',borderRadius:999,background:'#fff',color:'#1a1816',border:0,fontWeight:800,fontSize:12,cursor:'pointer'}}>Subscribe</button>
          </div>
        </div>
      </div>

      <div className="footer-container" style={{maxWidth:1200,margin:'0 auto',padding:'40px 24px 24px',display:'grid',gridTemplateColumns:'1.5fr .8fr .8fr 1.2fr',gap:32}}>
        <section className="footer-section footer-brand">
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
            <div style={{width:36,height:36,borderRadius:10,background:'#fff',color:'#1a1816',display:'grid',placeItems:'center',fontWeight:900}}>E</div>
            <h2 style={{margin:0,fontSize:18,fontWeight:900,letterSpacing:'-.02em'}}>E-SHOP</h2>
            <span style={{padding:'3px 8px',borderRadius:999,background:'rgba(255,255,255,.1)',fontSize:9,fontWeight:700}}>EST. 2026</span>
          </div>
          <p style={{margin:'0 0 16px',color:'rgba(255,255,255,.6)',fontSize:13,lineHeight:1.6,maxWidth:300}}>
            Your trusted online store for quality products at great prices. Fast delivery across India.
          </p>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {[
              {t:'4.9★ Rated',s:'2.4k reviews'},
              {t:'Free Delivery',s:'Above ₹999'},
              {t:'COD Available',s:'Pan India'},
            ].map(b=>(
              <div key={b.t} style={{padding:'6px 10px',borderRadius:999,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',fontSize:10}}>
                <strong style={{fontSize:11}}>{b.t}</strong><span style={{color:'rgba(255,255,255,.5)',marginLeft:4}}>{b.s}</span>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:8,marginTop:16}}>
            {['𝕏','IG','FB','YT'].map(s=>(
              <a key={s} href="#" style={{width:32,height:32,borderRadius:10,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',display:'grid',placeItems:'center',fontSize:11,fontWeight:700,color:'#fff',textDecoration:'none'}}>{s}</a>
            ))}
          </div>
        </section>

        <nav className="footer-section" aria-label="Quick links" style={{display:'flex',flexDirection:'column',gap:4}}>
          <h3 style={{margin:'0 0 12px',fontSize:12,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.4)'}}>Quick Links</h3>
          {[
            {to:'/',label:'Home'},
            {to:'/products',label:'Products'},
            {to:'/wishlist',label:'Wishlist'},
            {to:'/cart',label:'Cart'},
          ].map(l=>(
            <Link key={l.to} to={l.to} style={{padding:'6px 0',color:'rgba(255,255,255,.7)',textDecoration:'none',fontSize:13,fontWeight:500,display:'flex',alignItems:'center',gap:8,transition:'.2s'}}>
              <span style={{width:4,height:4,borderRadius:'50%',background:'rgba(255,255,255,.3)',display:'inline-block'}} />{l.label}
            </Link>
          ))}
        </nav>

        <nav className="footer-section" aria-label="Customer links" style={{display:'flex',flexDirection:'column',gap:4}}>
          <h3 style={{margin:'0 0 12px',fontSize:12,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.4)'}}>Customer</h3>
          {[
            {to:'/orders',label:'My Orders'},
            {to:'/profile',label:'My Profile'},
            {to:'/settings',label:'Settings'},
            {to:'/login',label:'Login'},
            {to:'/register',label:'Register'},
          ].map(l=>(
            <Link key={l.to} to={l.to} style={{padding:'6px 0',color:'rgba(255,255,255,.7)',textDecoration:'none',fontSize:13,fontWeight:500,display:'flex',alignItems:'center',gap:8}}>
              <span style={{width:4,height:4,borderRadius:'50%',background:'rgba(255,255,255,.3)',display:'inline-block'}} />{l.label}
            </Link>
          ))}
        </nav>

        <section className="footer-section footer-contact">
          <h3 style={{margin:'0 0 12px',fontSize:12,fontWeight:800,letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,.4)'}}>Contact Us</h3>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
              <div style={{width:32,height:32,borderRadius:8,background:'rgba(255,255,255,.06)',display:'grid',placeItems:'center',fontSize:14}}>✉</div>
              <div><div style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>Email</div><a href="mailto:support@eshop.com" style={{color:'#fff',fontSize:13,fontWeight:600,textDecoration:'none'}}>support@eshop.com</a></div>
            </div>
            <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
              <div style={{width:32,height:32,borderRadius:8,background:'rgba(255,255,255,.06)',display:'grid',placeItems:'center',fontSize:14}}>📞</div>
              <div><div style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>Phone</div><a href="tel:+919876543210" style={{color:'#fff',fontSize:13,fontWeight:600,textDecoration:'none'}}>+91 98765 43210</a><div style={{fontSize:10,color:'rgba(255,255,255,.4)',marginTop:2}}>Mon-Sat 9AM-9PM</div></div>
            </div>
            <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
              <div style={{width:32,height:32,borderRadius:8,background:'rgba(255,255,255,.06)',display:'grid',placeItems:'center',fontSize:14}}>📍</div>
              <div><div style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>Address</div><p style={{margin:0,fontSize:12,color:'rgba(255,255,255,.7)',lineHeight:1.5}}>E-Shop HQ, Connaught Place,<br/>New Delhi, India - 110001</p></div>
            </div>
          </div>
        </section>
      </div>

      <div style={{borderTop:'1px solid rgba(255,255,255,.08)',padding:'16px 24px'}}>
        <div style={{maxWidth:1200,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
          <div className="footer-bottom" style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
            <p style={{margin:0,fontSize:11,color:'rgba(255,255,255,.4)'}}>© 2026 E-Shop. All rights reserved.</p>
            <div style={{display:'flex',gap:12,fontSize:11}}>
              <a href="#" style={{color:'rgba(255,255,255,.5)',textDecoration:'none'}}>Privacy</a>
              <a href="#" style={{color:'rgba(255,255,255,.5)',textDecoration:'none'}}>Terms</a>
              <a href="#" style={{color:'rgba(255,255,255,.5)',textDecoration:'none'}}>Sitemap</a>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:10,color:'rgba(255,255,255,.4)',fontWeight:700,letterSpacing:'.06em'}}>WE ACCEPT</span>
            <div style={{display:'flex',gap:6}}>
              {['UPI','VISA','MC','COD'].map(m=>(
                <span key={m} style={{padding:'4px 8px',borderRadius:6,background:'#fff',color:'#1a1816',fontSize:9,fontWeight:900}}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{position:'absolute',width:400,height:400,left:-100,top:-100,background:'radial-gradient(circle,rgba(255,255,255,.04),transparent 70%)',borderRadius:'50%',pointerEvents:'none'}} />
    </footer>
  );
}

export default Footer;