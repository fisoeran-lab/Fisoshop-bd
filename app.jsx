const {useState,useEffect} = React;

const seedProducts = [
  {id:1,name:"Aurora Wireless Headphones",category:"Gaming",price:2890,emoji:"🎧",tag:"BEST SELLER"},
  {id:2,name:"Minimal Everyday Sneakers",category:"Shoes",price:2450,emoji:"👟",tag:"NEW"},
  {id:3,name:"Classic Round Sunglasses",category:"Sunglasses",price:890,emoji:"🕶️",tag:"HOT"},
  {id:4,name:"Smart Fitness Watch",category:"Watches",price:3190,emoji:"⌚",tag:"TRENDING"},
  {id:5,name:"Soft Cotton Hoodie",category:"Clothing",price:1650,emoji:"🧥",tag:"POPULAR"},
  {id:6,name:"Cozy Home Lamp",category:"Home",price:1250,emoji:"💡",tag:"DEAL"},
  {id:7,name:"RGB Gaming Controller",category:"Gaming",price:2190,emoji:"🎮",tag:"GAMER PICK"},
  {id:8,name:"Modern Travel Backpack",category:"Clothing",price:1890,emoji:"🎒",tag:"JUST IN"}
];
const initialOrders = [
  {id:"FS-1042",product:"Aurora Wireless Headphones",customer:"buyer@gmail.com",amount:2890,status:"Delivering"},
  {id:"FS-1041",product:"Minimal Everyday Sneakers",customer:"buyer@gmail.com",amount:2450,status:"Pending"},
  {id:"FS-1038",product:"Classic Round Sunglasses",customer:"buyer@gmail.com",amount:890,status:"Completed"}
];
const money = n => "৳"+Number(n).toLocaleString("en-BD");
function App(){
  const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem("fisoUser")||"null"));
  const [users,setUsers]=useState(()=>JSON.parse(localStorage.getItem("fisoUsers")||"[]"));
  const [orders,setOrders]=useState(()=>JSON.parse(localStorage.getItem("fisoOrders")||"null")||initialOrders);
  const [products,setProducts]=useState(()=>JSON.parse(localStorage.getItem("fisoProducts")||"null")||seedProducts);
  const [page,setPage]=useState("Home"),[category,setCategory]=useState("All"),[query,setQuery]=useState("");
  const [slide,setSlide]=useState(0),[toast,setToast]=useState(""),[message,setMessage]=useState("");
  const [messages,setMessages]=useState([]),[cart,setCart]=useState([]);
  const [authMode,setAuthMode]=useState("login"),[role,setRole]=useState("Customer");
  const [email,setEmail]=useState(""),[password,setPassword]=useState("");
  const [productName,setProductName]=useState(""),[productPrice,setProductPrice]=useState(""),[productCategory,setProductCategory]=useState("Gaming");
  const [settings,setSettings]=useState({notifications:true,compact:false});
  const categories=["All","Home","Gaming","Clothing","Shoes","Sunglasses","Watches"];
  useEffect(()=>{localStorage.setItem("fisoUsers",JSON.stringify(users))},[users]);
  useEffect(()=>{localStorage.setItem("fisoOrders",JSON.stringify(orders))},[orders]);
  useEffect(()=>{localStorage.setItem("fisoProducts",JSON.stringify(products))},[products]);
  useEffect(()=>{if(user)localStorage.setItem("fisoUser",JSON.stringify(user));else localStorage.removeItem("fisoUser")},[user]);
  useEffect(()=>{const t=setInterval(()=>setSlide(s=>(s+1)%3),5000);return()=>clearInterval(t)},[]);
  useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(""),2800);return()=>clearTimeout(t)}},[toast]);
  const notify=t=>setToast(t);
  const signIn=e=>{
    e.preventDefault();
    if(!/^[^\s@]+@gmail\.com$/i.test(email)){notify("Please use a valid Gmail address.");return}
    if(password.length<6){notify("Password must be at least 6 characters.");return}
    const existing=users.find(u=>u.email.toLowerCase()===email.toLowerCase()&&u.role===role);
    if(authMode==="register"){
      if(users.some(u=>u.email.toLowerCase()===email.toLowerCase()&&u.role===role)){notify("Account already exists. Please log in.");return}
      const u={email,role,password};setUsers(v=>[...v,u]);setUser({email,role});notify("Account created for demo.");
    }else if(existing&&existing.password===password){setUser({email,role});notify("Welcome back!")}
    else notify("Account not found or password is incorrect. Register first.");
  };
  const logout=()=>{setUser(null);setPage("Home");notify("You have logged out.")};
  const addToCart=p=>{setCart(c=>[...c,p]);notify("Added to your bag.")};
  const checkout=()=>{if(!cart.length)return;const newOrders=cart.map((p,i)=>({id:"FS-"+Math.floor(1000+Math.random()*8999),product:p.name,customer:user.email,amount:p.price,status:"Pending"}));setOrders(o=>[...newOrders,...o]);setCart([]);notify("Order placed! Your order is pending.");setPage("Orders")};
  const sendMessage=()=>{if(!message.trim())return;setMessages(m=>[{text:message,from:user.email,time:new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})},...m]);setMessage("");notify("Message sent to the store admin.")};
  const addProduct=()=>{if(!productName.trim()||!Number(productPrice))return notify("Enter a product name and valid price.");setProducts(p=>[{id:Date.now(),name:productName,category:productCategory,price:Number(productPrice),emoji:"🛍️",tag:"NEW"},...p]);setProductName("");setProductPrice("");notify("Product added to storefront.")};
  const updateStatus=(id,status)=>setOrders(o=>o.map(x=>x.id===id?{...x,status}:x));
  const filtered=products.filter(p=>(category==="All"||p.category===category)&&p.name.toLowerCase().includes(query.toLowerCase()));
  const mine=orders.filter(o=>user&&o.customer.toLowerCase()===user.email.toLowerCase());
  const slides=[{eyebrow:"FISO WEEKLY PICKS",title:"Good finds. Better prices.",sub:"Discover everyday essentials, gaming gear and style upgrades.",emoji:"🛍️",button:"Explore collection"},{eyebrow:"LEVEL UP YOUR SETUP",title:"Gear up and play on.",sub:"Fresh gaming picks selected for your next win.",emoji:"🎮",button:"Shop gaming"},{eyebrow:"STYLE YOUR EVERYDAY",title:"Small details. Big energy.",sub:"Find your next favourite look with Fiso Store.",emoji:"👟",button:"Discover style"}];
  if(!user)return <div className="auth-wrap"><form className="auth glass" onSubmit={signIn}>
    <div className="brand"><span>Fiso</span> <b>Store</b></div><div className="eyebrow" style={{marginTop:26}}>YOUR EVERYDAY MARKETPLACE</div>
    <h1>{authMode==="login"?"Welcome back":"Create your account"}</h1><p className="muted">Sign in to shop, track orders and manage your store.</p>
    <div className="field"><label>Account type</label><div className="rolepick"><button type="button" className={role==="Customer"?"selected":""} onClick={()=>setRole("Customer")}>🛍️ Customer</button><button type="button" className={role==="Admin"?"selected":""} onClick={()=>setRole("Admin")}>🏪 Admin</button></div></div>
    <div className="field"><label>Gmail address</label><input type="email" placeholder="you@gmail.com" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
    <div className="field"><label>Password</label><input type="password" placeholder="At least 6 characters" value={password} onChange={e=>setPassword(e.target.value)} required minLength="6"/></div>
    <button className="primary" type="submit">{authMode==="login"?"Log in":"Create account"}</button>
    <p className="tiny" style={{marginTop:17}}>Demo note: this front-end validates Gmail format and remembers accounts on this device. Real Gmail ownership verification and secure password authentication require a backend/auth provider before launch.</p>
    <p className="muted" style={{textAlign:"center",marginTop:20}}>{authMode==="login"?"New to Fiso Store?":"Already have an account?"} <a href="#" style={{color:"#8bcaff"}} onClick={e=>{e.preventDefault();setAuthMode(authMode==="login"?"register":"login")}}>{authMode==="login"?"Create account":"Log in"}</a></p>
  </form>{toast&&<div className="toast">{toast}</div>}</div>;
  const nav=[["Home","⌂"],["Explore","⌕"],["Orders","▤"],["Messages","✉"],["Settings","⚙"],...(user.role==="Admin"?[["Dashboard","▦"]]:[["Cart","🛒"]])];
  const counts={pending:orders.filter(o=>o.status==="Pending").length,delivering:orders.filter(o=>o.status==="Delivering").length,completed:orders.filter(o=>o.status==="Completed").length};
  return <><aside className="sidebar glass">{nav.map(([n,ic])=><button key={n} title={n} className={"navitem "+(page===n?"active":"")} onClick={()=>setPage(n)}>{ic}</button>)}</aside>
  <main className="app"><header className="topbar"><div className="brand"><span>Fiso</span> <b>Store</b></div><input className="search" placeholder="Search products, categories..." value={query} onChange={e=>{setQuery(e.target.value);setPage("Explore")}}/><div className="userpill glass"><div className="avatar">{user.email[0].toUpperCase()}</div><span>{user.email.split("@")[0]} · {user.role}</span><button onClick={logout} title="Log out">↪</button></div></header>
  <div className="content" key={page}>
  {page==="Home"&&<><section className="hero glass slide"><div className="hero-copy"><div className="eyebrow">{slides[slide].eyebrow}</div><h1>{slides[slide].title}</h1><p>{slides[slide].sub}</p><button className="primary" onClick={()=>{setCategory(slide===1?"Gaming":"All");setPage("Explore")}}>{slides[slide].button} →</button><div className="carousel-controls" style={{marginTop:19}}>{slides.map((s,i)=><button key={i} className="circlebtn" style={{width:i===slide?26:9,height:9,borderRadius:99,background:i===slide?"#8fd0ff":"#ffffff55"}} onClick={()=>setSlide(i)} />)}</div></div><div className="hero-art">{slides[slide].emoji}</div><span className="badge-float" style={{position:"absolute",right:22,top:20}}>✨ Curated for you</span></section>
  <div className="section-head"><h2>Shop by category</h2><span className="muted">Find your next favourite</span></div><div className="chips">{categories.map(c=><button key={c} className={"chip "+(category===c?"active":"")} onClick={()=>{setCategory(c);setPage("Explore")}}>{c==="All"?"✦ ":c==="Home"?"⌂ ":c==="Gaming"?"🎮 ":c==="Clothing"?"♧ ":c==="Shoes"?"👟 ":c==="Sunglasses"?"🕶️ ":"⌚ "}{c}</button>)}</div>
  <div className="section-head"><h2>Featured products</h2><button className="muted" onClick={()=>setPage("Explore")}>View all →</button></div><div className="grid">{products.slice(0,4).map(p=><ProductCard key={p.id} p={p} add={addToCart}/>)}</div>
  <div className="promo glass"><div><b>💬 Need a hand?</b><div className="muted">Send a message to the Fiso Store team.</div></div><button className="primary" onClick={()=>setPage("Messages")}>Message us</button></div></>}
  {page==="Explore"&&<><div className="section-head"><div><h2>Explore the store</h2><div className="muted">{filtered.length} products available</div></div></div><div className="chips">{categories.map(c=><button key={c} className={"chip "+(category===c?"active":"")} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="grid">{filtered.map(p=><ProductCard key={p.id} p={p} add={addToCart}/>)}</div>{!filtered.length&&<div className="empty">No products found. Try another search.</div>}</>}
  {page==="Dashboard"&&user.role==="Admin"&&<><div className="section-head"><div><h2>Store dashboard</h2><div className="muted">A quick view of your Fiso Store activity</div></div><span className="badge-float">ADMIN MODE</span></div><div className="statgrid"><div className="stat glass"><strong>{orders.length}</strong><small>Total orders</small></div><div className="stat glass"><strong>{counts.pending}</strong><small>Pending orders</small></div><div className="stat glass"><strong>{counts.completed}</strong><small>Completed orders</small></div></div><div className="layout-two" style={{marginTop:18}}><section className="panel glass"><h3>Order management</h3>{orders.map(o=><div className="order" key={o.id}><div><b>{o.product}</b><div className="muted">{o.id} · {o.customer}</div><div className="muted">{money(o.amount)}</div></div><div style={{display:"grid",gap:7,justifyItems:"end"}}><span className={"status "+(o.status==="Pending"?"pending":o.status==="Delivering"?"transit":"")}>{o.status}</span><select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)} style={{background:"#102b4b",color:"white",border:"1px solid #ffffff30",borderRadius:9,padding:6,fontSize:11}}><option>Pending</option><option>Delivering</option><option>Completed</option></select></div></div>)}</section><section className="panel glass"><h3>Add a product</h3><div className="field"><label>Product name</label><input value={productName} onChange={e=>setProductName(e.target.value)} placeholder="e.g. Wireless keyboard"/></div><div className="field"><label>Price (BDT)</label><input type="number" value={productPrice} onChange={e=>setProductPrice(e.target.value)} placeholder="1200"/></div><div className="field"><label>Category</label><select value={productCategory} onChange={e=>setProductCategory(e.target.value)}>{categories.filter(c=>c!=="All").map(c=><option>{c}</option>)}</select></div><button className="primary" onClick={addProduct}>＋ Add product</button><h3 style={{marginTop:27}}>Products sold</h3><div className="muted">{orders.filter(o=>o.status==="Completed").length} completed orders · {products.length} listed products</div></section></div></>}
  {page==="Orders"&&<><div className="section-head"><div><h2>My orders</h2><div className="muted">Track every step of your delivery</div></div></div><div className="statgrid"><div className="stat glass"><strong>{mine.length}</strong><small>Ordered</small></div><div className="stat glass"><strong>{mine.filter(o=>o.status==="Pending"||o.status==="Delivering").length}</strong><small>On the way / pending</small></div><div className="stat glass"><strong>{mine.filter(o=>o.status==="Completed").length}</strong><small>Received</small></div></div><section className="panel glass" style={{marginTop:18}}>{mine.length?mine.map(o=><div className="order" key={o.id}><div><b>{o.product}</b><div className="muted">{o.id} · {money(o.amount)}</div></div><span className={"status "+(o.status==="Pending"?"pending":o.status==="Delivering"?"transit":"")}>{o.status}</span></div>):<div className="empty">Your orders will appear here after checkout.</div>}</section></>}
  {page==="Cart"&&<><div className="section-head"><h2>Your shopping bag</h2><span className="muted">{cart.length} items</span></div><section className="panel glass">{cart.length?cart.map((p,i)=><div className="order" key={i}><b>{p.emoji} {p.name}</b><b>{money(p.price)}</b></div>):<div className="empty">Your bag is waiting for something good.</div>}<div className="order"><b>Total</b><b>{money(cart.reduce((a,p)=>a+p.price,0))}</b></div><button className="primary" onClick={checkout} disabled={!cart.length}>Place order</button></section></>}
  {page==="Messages"&&<><div className="section-head"><div><h2>Store messages</h2><div className="muted">Your messages are shown to the store admin in this demo.</div></div></div><section className="panel glass"><div className="notice">✦ Send a question about a product, delivery or your order.</div><div className="messagebox"><input value={message} onChange={e=>setMessage(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Write a message..."/><button className="primary" onClick={sendMessage}>Send</button></div><h3 style={{marginTop:24}}>Recent messages</h3>{messages.length?messages.map((m,i)=><div className="order" key={i}><div>{m.text}<div className="muted">{m.from} · {m.time}</div></div><span className="status">Sent</span></div>):<div className="empty">No messages yet.</div>}</section></>}
  {page==="Settings"&&<><div className="section-head"><h2>Settings</h2></div><section className="panel glass"><div className="settings-row"><div><b>Notifications</b><div className="muted">Show in-app activity notifications</div></div><input type="checkbox" checked={settings.notifications} onChange={e=>setSettings(s=>({...s,notifications:e.target.checked}))}/></div><div className="settings-row"><div><b>Compact product cards</b><div className="muted">A denser storefront layout preference</div></div><input type="checkbox" checked={settings.compact} onChange={e=>setSettings(s=>({...s,compact:e.target.checked}))}/></div><div className="settings-row"><div><b>Account</b><div className="muted">{user.email} · {user.role}</div></div><button className="primary" onClick={logout}>Log out</button></div></section></>}
  </div></main>
  <nav className="mobile-nav glass">{nav.map(([n,ic])=><button key={n} title={n} className={"navitem "+(page===n?"active":"")} onClick={()=>setPage(n)}>{ic}</button>)}</nav>
  {toast&&<div className="toast">{toast}</div>}</>;
}
function ProductCard({p,add}){return <article className="product glass"><div className="product-img"><span>{p.emoji}</span><span className="tag">{p.tag}</span></div><h3>{p.name}</h3><div className="muted">{p.category}</div><div className="price-row"><span className="price">{money(p.price)}</span><button className="add" onClick={()=>add(p)} aria-label={"Add "+p.name}>＋</button></div></article>}
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
