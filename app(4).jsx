const {useState,useEffect,useRef} = React;
const readStore=(key,fallback)=>{try{const value=localStorage.getItem(key);return value===null?fallback:JSON.parse(value)}catch{return fallback}};

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
  const [user,setUser]=useState(()=>readStore("fisoUser",null));
  const [users,setUsers]=useState(()=>readStore("fisoUsers",[]));
  const [orders,setOrders]=useState(()=>readStore("fisoOrders",initialOrders));
  const [products,setProducts]=useState(()=>readStore("fisoProducts",seedProducts));
  const [page,setPage]=useState("Home"),[category,setCategory]=useState("All"),[query,setQuery]=useState("");
  const [slide,setSlide]=useState(0),[toast,setToast]=useState(""),[message,setMessage]=useState("");
  const [messages,setMessages]=useState(()=>readStore("fisoMessages",[])),[cart,setCart]=useState(()=>readStore("fisoCart",[]));
  const [selectedConversation,setSelectedConversation]=useState("");
  const [recording,setRecording]=useState(false),[notificationReady,setNotificationReady]=useState(typeof Notification!=="undefined"&&Notification.permission==="granted");
  const mediaRecorderRef=useRef(null),audioChunksRef=useRef([]);
  const [authMode,setAuthMode]=useState("login"),[role,setRole]=useState("Customer");
  const [email,setEmail]=useState(""),[password,setPassword]=useState("");
  const [productName,setProductName]=useState(""),[productPrice,setProductPrice]=useState(""),[productCategory,setProductCategory]=useState("Gaming");
  const [productDescription,setProductDescription]=useState(""),[productImages,setProductImages]=useState([]),[showAddModal,setShowAddModal]=useState(false);
  const [settings,setSettings]=useState(()=>readStore("fisoSettings",{notifications:true,compact:false}));
  const categories=["All","Home","Gaming","Clothing","Shoes","Sunglasses","Watches"];
  useEffect(()=>{localStorage.setItem("fisoUsers",JSON.stringify(users))},[users]);
  useEffect(()=>{localStorage.setItem("fisoOrders",JSON.stringify(orders))},[orders]);
  useEffect(()=>{localStorage.setItem("fisoProducts",JSON.stringify(products))},[products]);
  useEffect(()=>{localStorage.setItem("fisoCart",JSON.stringify(cart))},[cart]);
  useEffect(()=>{localStorage.setItem("fisoMessages",JSON.stringify(messages))},[messages]);
  useEffect(()=>{localStorage.setItem("fisoSettings",JSON.stringify(settings))},[settings]);
  useEffect(()=>{if(user)localStorage.setItem("fisoUser",JSON.stringify(user));else localStorage.removeItem("fisoUser")},[user]);
  useEffect(()=>{const t=setInterval(()=>setSlide(s=>(s+1)%3),5000);return()=>clearInterval(t)},[]);
  useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(""),2800);return()=>clearTimeout(t)}},[toast]);
  // Same-origin tabs can exchange updates instantly. Cross-device delivery needs a shared backend.
  useEffect(()=>{
    const onStorage=e=>{if(e.key==="fisoMessages"&&e.newValue){try{setMessages(JSON.parse(e.newValue))}catch{}}};
    window.addEventListener("storage",onStorage);
    let channel=null;
    try{channel=new BroadcastChannel("fiso-store-chat");channel.onmessage=e=>{if(e.data?.type==="messages"){setMessages(e.data.messages);const m=e.data.latest;if(m&&m.from!==user?.email){notify("New message from "+m.from);if(document.hidden&&typeof Notification!=="undefined"&&Notification.permission==="granted")new Notification("Fiso Store message",{body:m.text||"You received a voice message."});}}};}catch{}
    return()=>{window.removeEventListener("storage",onStorage);if(channel)channel.close()};
  },[user?.email]);
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
  const addToCart=p=>{setCart(c=>[...c,{...p,cartId:Date.now()+Math.random()}]);notify("Added to your bag.")};
  const removeFromCart=id=>{setCart(c=>c.filter(p=>p.cartId!==id));notify("Item removed from your bag.")};
  const checkout=()=>{if(!cart.length)return;const newOrders=cart.map((p)=>({id:"FS-"+Date.now().toString().slice(-6)+Math.floor(Math.random()*9),product:p.name,customer:user.email,amount:p.price,status:"Pending"}));setOrders(o=>[...newOrders,...o]);setCart([]);notify("Order placed! Your order is pending.");setPage("Orders")};
  const conversationFor=()=>user?.role==="Admin"?selectedConversation:user?.email.toLowerCase();
  const persistMessage=(payload)=>{
    const conversationId=conversationFor();
    if(!conversationId)return notify("Select a customer conversation first.");
    const item={id:Date.now()+"-"+Math.random().toString(16).slice(2),conversationId,from:user.email,fromRole:user.role,text:payload.text||"",audioData:payload.audioData||"",kind:payload.audioData?"voice":"text",time:new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}),createdAt:Date.now(),read:false};
    setMessages(prev=>{const next=[...prev,item];try{localStorage.setItem("fisoMessages",JSON.stringify(next));const ch=new BroadcastChannel("fiso-store-chat");ch.postMessage({type:"messages",messages:next,latest:item});ch.close()}catch{notify("Message could not be saved. Storage may be full.")}return next});
    setMessage("");
  };
  const sendMessage=()=>{if(!message.trim())return;persistMessage({text:message.trim()});notify("Message sent.")};
  const enableNotifications=async()=>{if(typeof Notification==="undefined")return notify("This browser does not support notifications.");const result=await Notification.requestPermission();setNotificationReady(result==="granted");notify(result==="granted"?"Notifications enabled.":"Notification permission was not granted.")};
  const startVoiceNote=async()=>{if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)return notify("Voice notes are not supported in this browser.");try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});const recorder=new MediaRecorder(stream);audioChunksRef.current=[];recorder.ondataavailable=e=>{if(e.data.size)audioChunksRef.current.push(e.data)};recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());const blob=new Blob(audioChunksRef.current,{type:recorder.mimeType||"audio/webm"});if(blob.size>900000){notify("Voice note is too large. Please record a shorter note.");return}const reader=new FileReader();reader.onload=()=>{persistMessage({audioData:reader.result});notify("Voice note sent.")};reader.readAsDataURL(blob)};mediaRecorderRef.current=recorder;recorder.start();setRecording(true);setTimeout(()=>{if(recorder.state==="recording"){recorder.stop();setRecording(false);notify("Voice note stopped at 30 seconds.")}},30000)}catch{notify("Microphone access was not granted.")}};
  const stopVoiceNote=()=>{if(mediaRecorderRef.current?.state==="recording"){mediaRecorderRef.current.stop();setRecording(false)}};
  const addProduct=()=>{if(user?.role!=="Admin")return notify("Only admins can add products.");if(!productName.trim()||!Number(productPrice))return notify("Enter a product name and valid price.");setProducts(p=>[{id:Date.now(),name:productName,description:productDescription,images:productImages,category:productCategory,price:Number(productPrice),emoji:"🛍️",tag:"NEW"},...p]);setProductName("");setProductPrice("");setProductDescription("");setProductImages([]);setShowAddModal(false);notify("Product added to storefront.")};
  const handleProductImages=async e=>{const files=Array.from(e.target.files||[]).slice(0,7);const processed=await Promise.all(files.map(file=>new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const canvas=document.createElement("canvas");const scale=Math.min(1,1000/Math.max(img.width,img.height));canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL("image/jpeg",.78));};img.onerror=()=>resolve("");img.src=reader.result;};reader.onerror=()=>resolve("");reader.readAsDataURL(file);})));setProductImages(processed.filter(Boolean));};
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
  <main className={"app "+(settings.compact?"compact-mode":"")}><header className="topbar"><div className="brand"><span>Fiso</span> <b>Store</b></div><input className="search" placeholder="Search products, categories..." value={query} onChange={e=>{setQuery(e.target.value);setPage("Explore")}}/><div className="userpill glass"><div className="avatar">{user.email[0].toUpperCase()}</div><span>{user.email.split("@")[0]} · {user.role}</span><button onClick={logout} title="Log out">↪</button></div></header>
  <div className="content" key={page}>
  {page==="Home"&&<><section className="hero glass slide"><div className="hero-copy" key={"hero-copy-"+slide}><div className="eyebrow">{slides[slide].eyebrow}</div><h1>{slides[slide].title}</h1><p>{slides[slide].sub}</p><button className="primary" onClick={()=>{setCategory(slide===1?"Gaming":"All");setPage("Explore")}}>{slides[slide].button} →</button><div className="carousel-controls" style={{marginTop:19}}>{slides.map((s,i)=><button key={i} className="circlebtn" style={{width:i===slide?26:9,height:9,borderRadius:99,background:i===slide?"#8fd0ff":"#ffffff55"}} onClick={()=>setSlide(i)} />)}</div></div><div className="hero-art">{slides[slide].emoji}</div><span className="badge-float" style={{position:"absolute",right:22,top:20}}>✨ Curated for you</span></section>
  <div className="section-head"><h2>Shop by category</h2><span className="muted">Find your next favourite</span></div><div className="chips">{categories.map(c=><button key={c} className={"chip "+(category===c?"active":"")} onClick={()=>{setCategory(c);setPage("Explore")}}>{c==="All"?"✦ ":c==="Home"?"⌂ ":c==="Gaming"?"🎮 ":c==="Clothing"?"♧ ":c==="Shoes"?"👟 ":c==="Sunglasses"?"🕶️ ":"⌚ "}{c}</button>)}</div>
  <div className="section-head"><h2>Featured products</h2><button className="muted" onClick={()=>setPage("Explore")}>View all →</button></div><div className="grid">{products.slice(0,4).map(p=><ProductCard key={p.id} p={p} add={addToCart}/>)}</div>
  <div className="promo glass"><div><b>💬 Need a hand?</b><div className="muted">Send a message to the Fiso Store team.</div></div><button className="primary" onClick={()=>setPage("Messages")}>Message us</button></div></>}
  {page==="Explore"&&<><div className="section-head"><div><h2>Explore the store</h2><div className="muted">{filtered.length} products available</div></div></div><div className="chips">{categories.map(c=><button key={c} className={"chip "+(category===c?"active":"")} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="grid">{filtered.map(p=><ProductCard key={p.id} p={p} add={addToCart}/>)}</div>{!filtered.length&&<div className="empty">No products found. Try another search.</div>}</>}
  {page==="Dashboard"&&user.role==="Admin"&&<><div className="section-head"><div><h2>Store dashboard</h2><div className="muted">A quick view of your Fiso Store activity</div></div><span className="badge-float">ADMIN MODE</span></div><div className="statgrid"><div className="stat glass"><strong>{orders.length}</strong><small>Total orders</small></div><div className="stat glass"><strong>{counts.pending}</strong><small>Pending orders</small></div><div className="stat glass"><strong>{counts.completed}</strong><small>Completed orders</small></div></div><div className="layout-two" style={{marginTop:18}}><section className="panel glass"><h3>Order management</h3>{orders.map(o=><div className="order" key={o.id}><div><b>{o.product}</b><div className="muted">{o.id} · {o.customer}</div><div className="muted">{money(o.amount)}</div></div><div style={{display:"grid",gap:7,justifyItems:"end"}}><span className={"status "+(o.status==="Pending"?"pending":o.status==="Delivering"?"transit":"")}>{o.status}</span><select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)} style={{background:"#102b4b",color:"white",border:"1px solid #ffffff30",borderRadius:9,padding:6,fontSize:11}}><option>Pending</option><option>Delivering</option><option>Completed</option></select></div></div>)}</section><section className="panel glass"><h3>Add a product</h3><div className="field"><label>Product name</label><input value={productName} onChange={e=>setProductName(e.target.value)} placeholder="e.g. Wireless keyboard"/></div><div className="field"><label>Price (BDT)</label><input type="number" value={productPrice} onChange={e=>setProductPrice(e.target.value)} placeholder="1200"/></div><div className="field"><label>Category</label><select value={productCategory} onChange={e=>setProductCategory(e.target.value)}>{categories.filter(c=>c!=="All").map(c=><option>{c}</option>)}</select></div><button className="primary" onClick={addProduct}>＋ Add product</button><h3 style={{marginTop:27}}>Products sold</h3><div className="muted">{orders.filter(o=>o.status==="Completed").length} completed orders · {products.length} listed products</div></section></div></>}
  {page==="Orders"&&<><div className="section-head"><div><h2>My orders</h2><div className="muted">Track every step of your delivery</div></div></div><div className="statgrid"><div className="stat glass"><strong>{mine.length}</strong><small>Ordered</small></div><div className="stat glass"><strong>{mine.filter(o=>o.status==="Pending"||o.status==="Delivering").length}</strong><small>On the way / pending</small></div><div className="stat glass"><strong>{mine.filter(o=>o.status==="Completed").length}</strong><small>Received</small></div></div><section className="panel glass" style={{marginTop:18}}>{mine.length?mine.map(o=><div className="order" key={o.id}><div><b>{o.product}</b><div className="muted">{o.id} · {money(o.amount)}</div></div><span className={"status "+(o.status==="Pending"?"pending":o.status==="Delivering"?"transit":"")}>{o.status}</span></div>):<div className="empty">Your orders will appear here after checkout.</div>}</section></>}
  {page==="Cart"&&<><div className="section-head"><h2>Your shopping bag</h2><span className="muted">{cart.length} items</span></div><section className="panel glass">{cart.length?cart.map((p)=><div className="order" key={p.cartId}><b>{p.emoji} {p.name}</b><div className="cart-actions"><b>{money(p.price)}</b><button className="remove-btn" onClick={()=>removeFromCart(p.cartId)} aria-label={"Remove "+p.name}>Remove</button></div></div>):<div className="empty">Your bag is waiting for something good.</div>}<div className="order"><b>Total</b><b>{money(cart.reduce((a,p)=>a+p.price,0))}</b></div><button className="primary" onClick={checkout} disabled={!cart.length}>Place order</button></section></>}
  {page==="Messages"&&(()=>{
    const conversations=[...new Set(messages.map(m=>m.conversationId).filter(Boolean))];
    const activeId=user.role==="Admin"?(selectedConversation||conversations[0]||""):user.email.toLowerCase();
    const thread=messages.filter(m=>m.conversationId===activeId).sort((a,b)=>a.createdAt-b.createdAt);
    const customerName=id=>id||"Customer";
    return <><div className="section-head"><div><h2>{user.role==="Admin"?"Inbox":"Chat with Fiso Store"}</h2><div className="muted">Instant chat · product questions · price discussion</div></div><button className="glass notify-btn" onClick={enableNotifications}>{notificationReady?"🔔 Notifications on":"Enable notifications"}</button></div>
      <section className="chat-shell glass">
        {user.role==="Admin"&&<aside className="chat-people"><h3>Customer chats</h3>{conversations.length?conversations.map(id=><button key={id} className={activeId===id?"person active":"person"} onClick={()=>setSelectedConversation(id)}><span className="person-avatar">{id[0]?.toUpperCase()||"C"}</span><span><b>{customerName(id).split("@")[0]}</b><small>{messages.filter(m=>m.conversationId===id).slice(-1)[0]?.text||"Voice message"}</small></span></button>):<div className="empty">No customer messages yet.</div>}</aside>}
        <div className="chat-main"><div className="chat-top"><span className="online-dot"></span><div><b>{user.role==="Admin"?(activeId||"Choose a customer").split("@")[0]:"Fiso Store Support"}</b><small>{user.role==="Admin"?"Customer conversation":"We usually reply as soon as possible"}</small></div><span className="chat-lock">🔒 Private demo chat</span></div>
          <div className="chat-thread">{thread.length?thread.map(m=><div key={m.id} className={"bubble-row "+(m.from===user.email?"mine":"theirs")}><div className="chat-bubble">{m.kind==="voice"?<audio controls src={m.audioData}/> : <div>{m.text}</div>}<small>{m.fromRole} · {m.time}</small></div></div>):<div className="chat-empty"><div className="chat-empty-icon">✦</div><b>Start a conversation</b><span>Ask about products, prices, orders or delivery.</span></div>}</div>
          <div className="chat-compose"><button className={recording?"voice-btn recording":"voice-btn"} onClick={recording?stopVoiceNote:startVoiceNote} title={recording?"Stop recording":"Record voice note"}>{recording?"■":"🎙"}</button><input value={message} onChange={e=>setMessage(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Message or ask about a price…" disabled={user.role==="Admin"&&!activeId}/><button className="send-btn" onClick={sendMessage} disabled={!message.trim()||(user.role==="Admin"&&!activeId)}>➤</button></div>
        </div>
      </section><p className="chat-footnote">Voice notes need microphone permission and a secure HTTPS site. This version syncs between tabs on the same browser/device. For real-time chat and notifications between different customers and devices, connect a backend such as Supabase or Firebase.</p>
    </>;
  })()}
  {page==="Settings"&&<><div className="section-head"><h2>Settings</h2></div><section className="panel glass"><div className="settings-row"><div><b>Notifications</b><div className="muted">Show in-app activity notifications</div></div><button className="primary" onClick={enableNotifications}>{notificationReady?"Enabled":"Enable browser alerts"}</button></div><div className="settings-row"><div><b>Compact product cards</b><div className="muted">A denser storefront layout preference</div></div><input type="checkbox" checked={settings.compact} onChange={e=>setSettings(s=>({...s,compact:e.target.checked}))}/></div><div className="settings-row"><div><b>Account</b><div className="muted">{user.email} · {user.role}</div></div><button className="primary" onClick={logout}>Log out</button></div></section></>}
  </div></main>
  <nav className="mobile-nav glass">{nav.slice(0,2).map(([n,ic])=><button key={n} title={n} className={"navitem "+(page===n?"active":"")} onClick={()=>setPage(n)}>{ic}</button>)}{user.role==="Admin"&&<button className="nav-plus" title="Add product" aria-label="Add product" onClick={()=>setShowAddModal(true)}>＋</button>}{nav.slice(2).map(([n,ic])=><button key={n} title={n} className={"navitem "+(page===n?"active":"")} onClick={()=>setPage(n)}>{ic}</button>)}</nav>
  {showAddModal&&user.role==="Admin"&&<div className="modal-backdrop" onClick={e=>{if(e.target===e.currentTarget)setShowAddModal(false)}}><form className="add-modal glass" onSubmit={e=>{e.preventDefault();addProduct()}}><div className="modal-head"><div><div className="eyebrow">ADMIN TOOL</div><h2>Add a product</h2></div><button type="button" className="modal-close" onClick={()=>setShowAddModal(false)}>×</button></div><div className="field"><label>Product title</label><input value={productName} onChange={e=>setProductName(e.target.value)} placeholder="Product name" required/></div><div className="field"><label>Price (BDT)</label><input type="number" min="1" value={productPrice} onChange={e=>setProductPrice(e.target.value)} placeholder="1200" required/></div><div className="field"><label>Category</label><select value={productCategory} onChange={e=>setProductCategory(e.target.value)}>{categories.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}</select></div><div className="field"><label>Description</label><textarea value={productDescription} onChange={e=>setProductDescription(e.target.value)} placeholder="Describe the product..." rows="3"/></div><div className="field"><label>Product photos (up to 7)</label><input type="file" accept="image/*" multiple onChange={handleProductImages}/><small className="muted">{productImages.length} of 7 images selected. Images are resized before local storage.</small></div>{productImages.length>0&&<div className="upload-preview">{productImages.map((src,i)=><img key={i} src={src} alt={"Preview "+(i+1)}/>)}</div>}<button className="primary" type="submit">Save product</button></form></div>}
  {toast&&<div className="toast">{toast}</div>}</>;
}
function ProductCard({p,add}){return <article className="product glass"><div className="product-img">{p.images?.[0]?<img src={p.images[0]} alt={p.name}/>:<span>{p.emoji}</span>}<span className="tag">{p.tag}</span></div><h3>{p.name}</h3><div className="muted">{p.category}</div>{p.description&&<p className="product-description">{p.description}</p>}<div className="price-row"><span className="price">{money(p.price)}</span><button className="add" onClick={()=>add(p)} aria-label={"Add "+p.name}>＋</button></div></article>}
ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
