import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Heart, MapPin, Search, Calendar, Trash2, ChevronUp, ChevronDown,
  X, Sparkles, Edit2, Loader2, Map, LocateFixed, MessageCircle,
  Send, Route, Plus, ChevronRight, Navigation, Check, RefreshCw,
  Share2, Clock, Layers
} from "lucide-react";

// ══ Cloud ════════════════════════════════════════════════════════════
const MASTER_KEY = "$2a$10$xa5kAeKx6bQc1Le458t8cuFXUQVmuDxf5j369h2w2YlRWDvP8RyPS";
const BIN_NAME   = "seoul-2026-travel";
const API_BASE   = "https://api.jsonbin.io/v3";

// ══ Design Tokens ════════════════════════════════════════════════════
const T = {
  bg:"#FAF6F3", surface:"#FFFFFF", card:"#FFFFFF", border:"#EDE0D8",
  rose:"#C85C68", roseDark:"#A8454F", roseDeep:"#F5E0E2",
  roseGlow:"rgba(200,92,104,0.10)", roseFaint:"rgba(200,92,104,0.05)",
  text:"#2D1F1F", textSoft:"#6B4C4C", muted:"#A08080",
  gold:"#B07D3A", goldFaint:"rgba(176,125,58,0.08)",
  green:"#3A7A5C", blue:"#4A7FA8", shadow:"rgba(180,120,120,0.15)",
  glow:"rgba(200,92,104,0.2)",
};

const CATEGORIES   = ["咖啡廳","酒吧","景點","逛街","鞋子","美妝生活","餐廳","其他"];
const AREAS        = ["聖水洞","弘大","明洞","漢南洞","安國","廣藏市場","島山/江南","梨泰院","鐘路","其他"];
const PRICE_LEVELS = ["₩","₩₩","₩₩₩","₩₩₩₩"];
const EMOJI = {"咖啡廳":"☕","酒吧":"🍶","逛街":"🛍","餐廳":"🍜","景點":"🏛","鞋子":"👟","美妝生活":"🕯","其他":"📍"};
const TC    = {"咖啡廳":"#C49A6C","酒吧":"#6B9AC4","逛街":"#D4737E","餐廳":"#5BA882","景點":"#9B8EC4","鞋子":"#C4A87A","美妝生活":"#C47AAA","其他":"#7A8C9B"};

// ══ Data ═════════════════════════════════════════════════════════════
const LOCS = [
  {id:1, name:"祖傳三代馬鈴薯排骨湯",area:"聖水洞",   type:"餐廳",    desc:"24小時營業，招牌馬鈴薯排骨湯入口即化，湯頭香濃。",     rating:4.8,price:"₩₩",   lat:37.5445,lng:127.0559,mapsId:"",hours:"24小時"},
  {id:2, name:"大林倉庫",            area:"聖水洞",   type:"咖啡廳",  desc:"百年工廠改造的超大藝術空間，必拍網美打卡點。",           rating:4.6,price:"₩₩₩",  lat:37.5424,lng:127.0573,mapsId:"",hours:""},
  {id:3, name:"Matin Kim 旗艦店",    area:"聖水洞",   type:"逛街",    desc:"韓國潮流龍頭品牌，限量聯名款必搶。",                    rating:4.7,price:"₩₩₩₩", lat:37.5431,lng:127.0545,mapsId:"",hours:""},
  {id:4, name:"Mardi Mercredi",      area:"漢南洞",   type:"逛街",    desc:"時尚雛菊 LOGO 系列，限定色必買。",                      rating:4.5,price:"₩₩₩",  lat:37.5367,lng:127.0011,mapsId:"",hours:""},
  {id:5, name:"廣藏市場",            area:"廣藏市場", type:"餐廳",    desc:"韓國最古老傳統市場，綠豆煎餅、麻藥紫菜捲必吃。",        rating:4.9,price:"₩",    lat:37.5700,lng:126.9994,mapsId:"",hours:""},
  {id:6, name:"益善洞韓屋村",        area:"安國",     type:"景點",    desc:"百年韓屋改造咖啡廳聚集地，傳統與現代融合。",            rating:4.7,price:"₩₩",   lat:37.5741,lng:126.9873,mapsId:"",hours:""},
  {id:7, name:"Zest Coffee",         area:"漢南洞",   type:"咖啡廳",  desc:"首爾精品咖啡名店，豆子嚴選，手沖一絕。",                rating:4.8,price:"₩₩₩",  lat:37.5373,lng:127.0006,mapsId:"",hours:""},
  {id:8, name:"Club Octagon",        area:"島山/江南",type:"酒吧",    desc:"亞洲頂級夜店，週五週六入場，建議提前預約。",            rating:4.5,price:"₩₩₩₩", lat:37.5048,lng:127.0261,mapsId:"",hours:"Fri-Sat"},
  {id:9, name:"N首爾塔",             area:"明洞",     type:"景點",    desc:"夜景必去制高點，纜車上山，情侶鎖心愛橋。",             rating:4.6,price:"₩₩₩",  lat:37.5512,lng:126.9882,mapsId:"",hours:""},
  {id:10,name:"梨泰院精品街",        area:"梨泰院",   type:"逛街",    desc:"各國設計師選品店林立，異國美食一條街。",                rating:4.4,price:"₩₩₩",  lat:37.5345,lng:126.9946,mapsId:"",hours:""},
  {id:11,name:"延南洞咖啡街",        area:"弘大",     type:"咖啡廳",  desc:"弘大旁的文青小巷，獨立咖啡廳密度超高。",                rating:4.6,price:"₩₩",   lat:37.5637,lng:126.9218,mapsId:"",hours:""},
  {id:12,name:"ADER error 弘大",     area:"弘大",     type:"逛街",    desc:"前衛概念設計師品牌，必逛旗艦概念店。",                  rating:4.7,price:"₩₩₩₩", lat:37.5543,lng:126.9220,mapsId:"ChIJdzYiL8WYfDURRZIG2YFosJo",hours:"每天 11–21:00"},
  {id:13,name:"The Barnnet",         area:"梨泰院",   type:"逛街",    desc:"梨泰院低調選品店，五~日才開，入場前需在 iPad 登記。",   rating:3.6,price:"₩₩₩",  lat:37.5331,lng:126.9902,mapsId:"ChIJ32LXtBmjfDUROUpG8wAsrCA",hours:"五~日 11–20:00"},
  {id:14,name:"Cueren",              area:"明洞",     type:"鞋子",    desc:"韓國高質感鞋履品牌，樂天百貨本店 B1，評分完美 5.0。",   rating:5.0,price:"₩₩₩",  lat:37.5645,lng:126.9817,mapsId:"ChIJxUxS__GifDURi3Gw0aAjfIY",hours:"每天 10:30–20:30"},
  {id:15,name:"Smoothmood",          area:"聖水洞",   type:"逛街",    desc:"聖水洞女裝選品，極簡設計，包包配件也很精緻。",           rating:4.0,price:"₩₩₩",  lat:37.5477,lng:127.0543,mapsId:"ChIJB3LGXAClfDURJdCCvxtHVMs",hours:"三~日 12–20:00"},
  {id:16,name:"Alo Yoga",            area:"島山/江南",type:"逛街",    desc:"美國瑜伽運動品牌，道山公園旗艦店，限定款必搶。",         rating:3.0,price:"₩₩₩₩", lat:37.5231,lng:127.0352,mapsId:"ChIJg5MhdACjfDURTJDFR8KnGTs",hours:"每天 11–20:00"},
  {id:17,name:"Stand Oil",           area:"聖水洞",   type:"逛街",    desc:"韓國包包品牌，2F 旋轉包包輸送帶超獵奇，工業風空間。",   rating:3.8,price:"₩₩₩",  lat:37.5437,lng:127.0575,mapsId:"ChIJD2VJISalfDURtpyXI9tuuys",hours:"每天 11–20:00"},
  {id:18,name:"ADER error 聖水",     area:"聖水洞",   type:"逛街",    desc:"聖水洞旗艦店，比弘大店更大，裝潢更藝術，服務更好。",    rating:4.3,price:"₩₩₩₩", lat:37.5440,lng:127.0560,mapsId:"",hours:"每天 11–21:00"},
  {id:19,name:"Raive",               area:"聖水洞",   type:"逛街",    desc:"色彩豐富女裝，同款不同色必入，聖水洞 Studio。",          rating:2.0,price:"₩₩₩",  lat:37.5438,lng:127.0514,mapsId:"ChIJ-2qxVMWlfDUR6Z_IUJzzdY8",hours:"每天 11–20:00"},
  {id:20,name:"Rest & Recreation",   area:"聖水洞",   type:"逛街",    desc:"評分超高 4.9，質感穿搭必逛，自動退稅。",                rating:4.9,price:"₩₩₩",  lat:37.5451,lng:127.0485,mapsId:"ChIJH8owxIOlfDURRRPhvWWYh0o",hours:"每天 11–19:30"},
  {id:21,name:"Musinsa Standard",    area:"聖水洞",   type:"逛街",    desc:"韓國最大潮流平台實體店，極簡韓系，CP值超高。",           rating:4.9,price:"₩₩",   lat:37.5415,lng:127.0585,mapsId:"ChIJZ6Xm4tqlfDURBeOe6r8ebOA",hours:"每天 11–22:00"},
  {id:22,name:"Emis",                area:"聖水洞",   type:"逛街",    desc:"韓系帽子配件品牌，聖水洞旗艦，色彩超多選擇。",          rating:4.4,price:"₩₩₩",  lat:37.5436,lng:127.0527,mapsId:"ChIJma1vfgClfDUR7AcMKTP9R8w",hours:"一~四 12–19:30 / 五~日 12–20:00"},
  {id:23,name:"Kith Seoul",          area:"聖水洞",   type:"逛街",    desc:"Kith 亞洲首家旗艦，4層樓，NB 美英製款齊全，限定必搶。", rating:4.1,price:"₩₩₩₩", lat:37.5418,lng:127.0570,mapsId:"ChIJJXs5FoWlfDURTSFCTq10BJ8",hours:"每天 11–21:00"},
  {id:24,name:"Polo Ralph Lauren",   area:"島山/江南",type:"逛街",    desc:"加羅樹길旗艦，Double RL 系列齊全，附設咖啡廳超好拍。",  rating:4.1,price:"₩₩₩₩", lat:37.5200,lng:127.0229,mapsId:"ChIJaShinuujfDURiP6oDJaDI64",hours:"每天 10:30–21:00"},
  {id:25,name:"Sappun",              area:"島山/江南",type:"鞋子",    desc:"韓系鞋履品牌，加羅樹길店，款式超多尺碼齊。",            rating:4.8,price:"₩₩₩",  lat:37.5202,lng:127.0224,mapsId:"ChIJ8fxO0bujfDURKQeroYc3la8",hours:"每天 11–21:00"},
  {id:26,name:"EPT",                 area:"島山/江南",type:"鞋子",    desc:"首爾滑板鞋品牌，道山旗艦，評分超高 4.9，必試超舒適。",  rating:4.9,price:"₩₩₩",  lat:37.5262,lng:127.0357,mapsId:"ChIJBeOcLcWjfDURuCgoFDo4L80",hours:"一~三 11–20:00 / 四~日 11–21:00"},
  {id:27,name:"Hetras",              area:"鐘路",     type:"美妝生活",desc:"昌德宮旁香氛品牌，護手霜 3 入₩25000 超划算，GD 聯名。", rating:4.8,price:"₩₩",   lat:37.5794,lng:126.9868,mapsId:"ChIJ7Y0fhyCjfDUR2LGZC68gYX4",hours:"每天 9–20:00"},
];

const ITIN0 = [
  {day:1,date:"2026-03-20",label:"抵達首爾",emoji:"✈️",color:"#6B9AC4",items:[
    {id:901,instanceId:101,name:"IT602 臺灣虎航",area:"桃園機場",type:"其他",desc:"20:00 起飛 → 23:30 抵達仁川 ICN",time:"20:00",rating:null,price:"",lat:0,lng:0,mapsId:"",hours:""},
    {id:902,instanceId:102,name:"入住飯店 & 宵夜",area:"明洞",type:"餐廳",desc:"深夜 Check-in，附近覓食",time:"",rating:null,price:"",lat:0,lng:0,mapsId:"",hours:""},
  ]},
  {day:2,date:"2026-03-21",label:"聖水洞文青日",emoji:"🎨",color:"#D4737E",items:[]},
  {day:3,date:"2026-03-22",label:"弘大 & 漢南洞",emoji:"🛍",color:"#C49A6C",items:[]},
  {day:4,date:"2026-03-23",label:"自由探索日",emoji:"🌃",color:"#9B8EC4",items:[]},
  {day:5,date:"2026-03-24",label:"回程日",emoji:"✈️",color:"#6B9AC4",items:[
    {id:903,instanceId:501,name:"IT603 臺灣虎航",area:"仁川機場",type:"其他",desc:"00:30 起飛 → 02:15 抵台 TPE",time:"00:30",rating:null,price:"",lat:0,lng:0,mapsId:"",hours:""},
  ]},
];

const INIT = {locations:LOCS, favorites:[1,2,3,5], itinerary:ITIN0, route:[], favNotes:{}};

// ══ Cloud helpers ════════════════════════════════════════════════════
const getBinId  = () => { try{return localStorage.getItem("seoul-bin-id")||"";}catch{return "";} };
const saveBinId = (id) => { try{localStorage.setItem("seoul-bin-id",id);}catch{} };
const createBin = async(d) => { const r=await fetch(`${API_BASE}/b`,{method:"POST",headers:{"Content-Type":"application/json","X-Master-Key":MASTER_KEY,"X-Bin-Name":BIN_NAME,"X-Private":"false"},body:JSON.stringify(d)}); return (await r.json()).metadata?.id||null; };
const readBin   = async(id) => { const r=await fetch(`${API_BASE}/b/${id}/latest`,{headers:{"X-Master-Key":MASTER_KEY,"X-Access-Key":MASTER_KEY}}); return (await r.json()).record||null; };
const writeBin  = async(id,d) => { await fetch(`${API_BASE}/b/${id}`,{method:"PUT",headers:{"Content-Type":"application/json","X-Master-Key":MASTER_KEY},body:JSON.stringify(d)}); };
const getDist   = (a,b,c,d) => { if(!a||!b||!c||!d)return null; const R=6371,dL=(c-a)*Math.PI/180,dl=(d-b)*Math.PI/180,x=Math.sin(dL/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dl/2)**2; return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)); };
const callAI    = async(msgs,sys) => { const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:msgs,system:sys||"你是首爾旅遊達人，熟悉2026年最新首爾潮流、美食、購物與景點。用繁體中文回答，語氣友善，回答精簡有實用建議。"})}); return (await r.json()).content?.[0]?.text||"暫時無法回應。"; };

// ══ Shared UI ════════════════════════════════════════════════════════
const INP = {padding:"10px 14px",border:`1px solid ${T.border}`,borderRadius:12,fontSize:12,background:T.surface,color:T.text,outline:"none",width:"100%",boxSizing:"border-box"};

const Overlay = ({children,onClose}) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",backdropFilter:"blur(14px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{background:T.card,borderRadius:24,padding:24,maxWidth:440,width:"100%",maxHeight:"90vh",overflowY:"auto",position:"relative",boxShadow:`0 32px 80px ${T.shadow}`,border:`1px solid ${T.border}`}}>
      <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:T.surface,border:`1px solid ${T.border}`,borderRadius:9,padding:7,cursor:"pointer",color:T.muted,display:"flex"}}><X size={14}/></button>
      {children}
    </div>
  </div>
);

const MHdr = ({icon,title,sub}) => (
  <div style={{display:"flex",gap:12,marginBottom:20,alignItems:"center"}}>
    <div style={{width:42,height:42,borderRadius:13,background:T.roseGlow,border:`1px solid ${T.roseDeep}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{icon}</div>
    <div><div style={{fontWeight:900,fontSize:15,color:T.rose}}>{title}</div><div style={{fontSize:11,color:T.muted,marginTop:1}}>{sub}</div></div>
  </div>
);

const SHdr = ({icon,title,sub}) => (
  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
    <div style={{width:34,height:34,borderRadius:11,background:T.roseGlow,border:`1px solid ${T.roseDeep}`,display:"flex",alignItems:"center",justifyContent:"center",color:T.rose,flexShrink:0}}>{icon}</div>
    <div><div style={{fontWeight:900,fontSize:15,color:T.text}}>{title}</div>{sub&&<div style={{fontSize:10,color:T.muted}}>{sub}</div>}</div>
  </div>
);

const PrimaryBtn = ({onClick,children,disabled}) => (
  <button onClick={onClick} disabled={disabled} style={{width:"100%",padding:"12px",background:disabled?T.muted:T.rose,color:"#fff",border:"none",borderRadius:13,fontWeight:900,fontSize:13,cursor:disabled?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
    {children}
  </button>
);

const SpinBox = () => <div style={{textAlign:"center",padding:40}}><Loader2 size={30} style={{color:T.rose,animation:"spin 1s linear infinite",display:"inline-block"}}/></div>;
const AIBox   = ({text}) => <div style={{fontSize:13,lineHeight:1.9,color:T.text,background:T.surface,padding:16,borderRadius:14,whiteSpace:"pre-wrap",border:`1px solid ${T.border}`}}>{text}</div>;
const Empty   = ({icon,text}) => <div style={{textAlign:"center",padding:"50px 0",color:T.muted}}><div style={{fontSize:40,marginBottom:10}}>{icon}</div><div style={{fontWeight:700,fontSize:13}}>{text}</div></div>;

const MapBtns = ({loc}) => {
  const g = loc.mapsId?`https://www.google.com/maps/place/?q=place_id:${loc.mapsId}`:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.name+" 首爾")}`;
  return <div style={{display:"flex",gap:5,flexShrink:0}}>
    <button onClick={()=>window.open(`https://map.naver.com/v5/search/${encodeURIComponent(loc.name)}`,"_blank")} style={{background:"#03C75A22",color:"#03C75A",border:"1px solid #03C75A44",borderRadius:8,padding:"5px 9px",fontSize:9,fontWeight:800,cursor:"pointer"}}>N</button>
    <button onClick={()=>window.open(g,"_blank")} style={{background:T.roseGlow,color:T.rose,border:`1px solid ${T.roseDeep}`,borderRadius:8,padding:"5px 9px",fontSize:9,fontWeight:800,cursor:"pointer"}}>G</button>
  </div>;
};

// ══ Main App ═════════════════════════════════════════════════════════

const RouteSearch = ({locations, route, toggleRoute}) => {
  const [q, setQ] = React.useState("");
  const filtered = q.trim()
    ? locations.filter(l=>l.name.includes(q)||l.area.includes(q)||l.type.includes(q))
    : locations;
  return (
    <>
      <div style={{position:"relative",marginBottom:8}}>
        <Search size={11} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#A08080"}}/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="搜尋地點加入路線…"
          style={{width:"100%",boxSizing:"border-box",padding:"8px 10px 8px 28px",borderRadius:10,border:"1px solid #EDE0D8",background:"#FAF6F3",fontSize:10,outline:"none"}}/>
      </div>
      <div style={{maxHeight:320,overflowY:"auto",display:"flex",flexDirection:"column",gap:5}}>
        {filtered.map(loc=>(
          <div key={loc.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 11px",background:route.includes(loc.id)?"#F5E0E2":"#FFFFFF",borderRadius:11,border:`1px solid ${route.includes(loc.id)?"#C85C68":"#EDE0D8"}`}}>
            <span style={{fontSize:13}}>{EMOJI[loc.type]}</span>
            <div style={{flex:1,minWidth:0}}><div style={{fontWeight:800,fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{loc.name}</div><div style={{fontSize:9,color:"#A08080"}}>{loc.area}</div></div>
            <button onClick={()=>toggleRoute(loc.id)} style={{padding:"5px 11px",borderRadius:9,border:"none",fontWeight:800,fontSize:9,cursor:"pointer",background:route.includes(loc.id)?"#C85C68":"#FAF6F3",color:route.includes(loc.id)?"#fff":"#A08080",flexShrink:0}}>{route.includes(loc.id)?"✓":"＋"}</button>
          </div>
        ))}
        {filtered.length===0&&<div style={{textAlign:"center",padding:16,color:"#A08080",fontSize:10}}>找不到符合的地點</div>}
      </div>
    </>
  );
};

export default function App() {
  const [binId,   setBinId]   = useState(()=>getBinId());
  const [ready,   setReady]   = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncOk,  setSyncOk]  = useState(false);
  const [syncErr, setSyncErr] = useState(false);
  const [tab,     setTab]     = useState("explore");

  const [locations, setLocations] = useState(LOCS);
  const [favorites, setFavorites] = useState([1,2,3,5]);
  const [itinerary, setItinerary] = useState(ITIN0);
  const [route,     setRoute]     = useState([]);
  const [favNotes,  setFavNotes]  = useState({});
  const ref = useRef({locations,favorites,itinerary,route,favNotes});
  useEffect(()=>{ref.current={locations,favorites,itinerary,route,favNotes};});

  const [search,    setSearch]    = useState("");
  const [catFilter, setCatFilter] = useState("全部");
  const [areaFilter,setAreaFilter]= useState("全部");
  const [groupBy,   setGroupBy]   = useState("area");
  const [toast,     setToast]     = useState("");
  const [userCoords,setUserCoords]= useState(null);
  const [isLocating,setIsLocating]= useState(false);
  const [openDay,   setOpenDay]   = useState(null);
  const [binInput,  setBinInput]  = useState("");

  const [showShare,    setShowShare]    = useState(false);
  const [aiInsight,    setAiInsight]    = useState({show:false,title:"",content:"",loading:false});
  const [routeAI,      setRouteAI]      = useState({show:false,content:"",loading:false});
  const [addModal,     setAddModal]     = useState(false);
  const [importModal,  setImportModal]  = useState(false);
  const [editItem,     setEditItem]     = useState(null);
  const [noteModal,    setNoteModal]    = useState(null);
  const [editDayIdx,   setEditDayIdx]   = useState(null);

  const [chatMsgs,   setChatMsgs]    = useState([{role:"assistant",content:"嗨！我是你的首爾旅遊達人 ✨\n問我任何首爾問題！行程、美食、交通、購物攻略都可以～"}]);
  const [chatInput,  setChatInput]   = useState("");
  const [chatLoading,setChatLoading] = useState(false);
  const chatEnd = useRef(null);
  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"});},[chatMsgs]);

  // Cloud init
  useEffect(()=>{
    (async()=>{
      const id=getBinId(); if(!id){setReady(true);return;}
      setSyncing(true);
      try{
        const d=await readBin(id);
        if(d){
          if(d.locations?.length) setLocations(d.locations);
          if(d.favorites)         setFavorites(d.favorites);
          if(d.itinerary?.length) setItinerary(d.itinerary);
          if(d.route)             setRoute(d.route);
          if(d.favNotes)          setFavNotes(d.favNotes);
        }
        setBinId(id); setSyncOk(true);
      }catch{setSyncErr(true);}
      finally{setSyncing(false);setReady(true);}
    })();
  },[]);

  useEffect(()=>{
    if(!binId||!ready) return;
    const t=setInterval(async()=>{
      try{
        const d=await readBin(binId); if(!d)return;
        if(d.locations?.length) setLocations(d.locations);
        if(d.favorites)         setFavorites(d.favorites);
        if(d.itinerary?.length) setItinerary(d.itinerary);
        if(d.route)             setRoute(d.route);
        if(d.favNotes)          setFavNotes(d.favNotes);
        setSyncOk(true); setSyncErr(false);
      }catch{setSyncErr(true);}
    },20000);
    return()=>clearInterval(t);
  },[binId,ready]);

  const save = useCallback(async(patch)=>{
    if(!binId)return;
    setSyncing(true); setSyncOk(false); setSyncErr(false);
    try{
      const c=ref.current;
      await writeBin(binId,{locations:patch.locations??c.locations,favorites:patch.favorites??c.favorites,itinerary:patch.itinerary??c.itinerary,route:patch.route??c.route,favNotes:patch.favNotes??c.favNotes});
      setSyncOk(true);
    }catch{setSyncErr(true);}
    finally{setSyncing(false);}
  },[binId]);

  const notify = (m)=>{setToast(m);setTimeout(()=>setToast(""),2500);};

  // Mutations
  const toggleFav = id=>{const u=favorites.includes(id)?favorites.filter(f=>f!==id):[...favorites,id];setFavorites(u);save({favorites:u});notify(favorites.includes(id)?"已移除收藏":"已加入收藏 ♥");};
  const addToDay  = (loc,di)=>{const ni=itinerary.map((d,i)=>i!==di?d:{...d,items:[...d.items,{...loc,instanceId:Date.now()+Math.random(),time:""}]});setItinerary(ni);save({itinerary:ni});notify(`✅ 已加入 Day ${di+1}！`);};
  const removeItem= (di,iid)=>{const ni=itinerary.map((d,i)=>i!==di?d:{...d,items:d.items.filter(it=>it.instanceId!==iid)});setItinerary(ni);save({itinerary:ni});};
  const moveItem  = (fd,iid,td)=>{const item=itinerary[fd].items.find(i=>i.instanceId===iid);const ni=itinerary.map((d,i)=>{if(i===fd)return{...d,items:d.items.filter(it=>it.instanceId!==iid)};if(i===td)return{...d,items:[...d.items,item]};return d;});setItinerary(ni);save({itinerary:ni});notify(`已移至 Day ${td+1}`);};
  const reorderIt = (di,iid,dir)=>{const ni=itinerary.map((d,i)=>{if(i!==di)return d;const its=[...d.items],idx=its.findIndex(it=>it.instanceId===iid);if(dir==="up"&&idx>0)[its[idx],its[idx-1]]=[its[idx-1],its[idx]];if(dir==="down"&&idx<its.length-1)[its[idx],its[idx+1]]=[its[idx+1],its[idx]];return{...d,items:its};});setItinerary(ni);save({itinerary:ni});};
  const setTime   = (di,iid,t)=>{const ni=itinerary.map((d,i)=>i!==di?d:{...d,items:d.items.map(it=>it.instanceId===iid?{...it,time:t}:it)});setItinerary(ni);save({itinerary:ni});};
  const updateDay = (di,label,emoji,color)=>{const ni=itinerary.map((d,i)=>i!==di?d:{...d,label,emoji:emoji||d.emoji,color:color||d.color});setItinerary(ni);save({itinerary:ni});setEditDayIdx(null);};
  const toggleRoute  = id=>{const u=route.includes(id)?route.filter(r=>r!==id):[...route,id];setRoute(u);save({route:u});};
  const reorderRoute = (id,dir)=>{const r=[...route],idx=r.indexOf(id);if(dir==="up"&&idx>0)[r[idx],r[idx-1]]=[r[idx-1],r[idx]];if(dir==="down"&&idx<r.length-1)[r[idx],r[idx+1]]=[r[idx+1],r[idx]];setRoute(r);save({route:r});};

  const manualSync = async()=>{if(!binId){notify("⚠️ 尚未設定 Bin ID");return;}setSyncing(true);try{const d=await readBin(binId);if(d){if(d.locations?.length)setLocations(d.locations);if(d.favorites)setFavorites(d.favorites);if(d.itinerary?.length)setItinerary(d.itinerary);if(d.route)setRoute(d.route);if(d.favNotes)setFavNotes(d.favNotes);}setSyncOk(true);setSyncErr(false);notify("✅ 已同步");}catch{setSyncErr(true);notify("⚠️ 同步失敗");}finally{setSyncing(false);};};
  const connectBin  = async(id)=>{const t=id.trim();if(!t)return;setSyncing(true);try{const d=await readBin(t);if(d){if(d.locations?.length)setLocations(d.locations);if(d.favorites)setFavorites(d.favorites);if(d.itinerary?.length)setItinerary(d.itinerary);if(d.route)setRoute(d.route);if(d.favNotes)setFavNotes(d.favNotes);}saveBinId(t);setBinId(t);setSyncOk(true);setSyncErr(false);setShowShare(false);notify("✅ 已連接雲端！");}catch{setSyncErr(true);notify("⚠️ Bin ID 無效");}finally{setSyncing(false);};};
  const createNewBin= async()=>{setSyncing(true);try{const id=await createBin(ref.current);if(id){saveBinId(id);setBinId(id);setSyncOk(true);notify("✅ 雲端建立完成！把 Bin ID 傳給旅伴");}}catch{setSyncErr(true);notify("⚠️ 建立失敗");}finally{setSyncing(false);};};

  // Derived
  const filtered = useMemo(()=>locations.filter(l=>(catFilter==="全部"||l.type===catFilter)&&(areaFilter==="全部"||l.area===areaFilter)&&l.name.toLowerCase().includes(search.toLowerCase())),[locations,catFilter,areaFilter,search]);
  const grouped  = useMemo(()=>{const g={};filtered.forEach(l=>{(g[groupBy==="area"?l.area:l.type]=g[groupBy==="area"?l.area:l.type]||[]).push(l);});return g;},[filtered,groupBy]);
  const favLocs    = useMemo(()=>locations.filter(l=>favorites.includes(l.id)),[locations,favorites]);
  const routeLocs  = useMemo(()=>route.map(id=>locations.find(l=>l.id===id)).filter(Boolean),[route,locations]);
  const nearbyFavs = useMemo(()=>{if(!userCoords)return[];return favLocs.map(l=>({...l,dist:getDist(userCoords.lat,userCoords.lng,l.lat,l.lng)})).filter(l=>l.dist!==null).sort((a,b)=>a.dist-b.dist);},[userCoords,favLocs]);

  // AI
  const openInsight = async(loc)=>{setAiInsight({show:true,title:loc.name,content:"",loading:true});try{const r=await callAI([{role:"user",content:`請用3段介紹首爾「${loc.name}」（${loc.area}，${loc.type}）。① 2026年必去理由 ② 最推薦品項/體驗 ③ 實用提示（交通/時間/注意）`}]);setAiInsight(p=>({...p,content:r,loading:false}));}catch{setAiInsight(p=>({...p,content:"連線錯誤，請稍後再試。",loading:false}));}};
  const genRoute    = async()=>{if(routeLocs.length<2){notify("請至少加入2個路線點");return;}setRouteAI({show:true,content:"",loading:true});const names=routeLocs.map((l,i)=>`${i+1}. ${l.name}（${l.area}）`).join("\n");try{const r=await callAI([{role:"user",content:`我想遊覽首爾這些地點：\n${names}\n\n請幫我：① 依地理位置重新排列最省路的順序 ② 說明各地點間的交通方式和距離 ③ 預估各段所需時間 ④ 推薦附近可以順路加入的景點`}]);setRouteAI({show:true,content:r,loading:false});}catch{setRouteAI({show:true,content:"連線錯誤，請稍後再試。",loading:false});}};
  const handleChat  = async(override)=>{const msg=override||chatInput.trim();if(!msg||chatLoading)return;const u={role:"user",content:msg};setChatMsgs(p=>[...p,u]);setChatInput("");setChatLoading(true);try{const r=await callAI([...chatMsgs,u]);setChatMsgs(p=>[...p,{role:"assistant",content:r}]);}catch{setChatMsgs(p=>[...p,{role:"assistant",content:"連線錯誤，請稍後再試。"}]);}setChatLoading(false);};

  if(!ready) return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14}}>
      <div style={{fontSize:52}}>✈️</div>
      <div style={{fontWeight:900,fontSize:22,color:T.rose,letterSpacing:3}}>SEOUL 2026</div>
      <Loader2 size={22} style={{color:T.rose,animation:"spin 1s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const NAV=[{id:"explore",icon:<Search size={19}/>,label:"探索"},{id:"favorites",icon:<Heart size={19}/>,label:"收藏",badge:favLocs.length},{id:"plan",icon:<Calendar size={19}/>,label:"行程"},{id:"route",icon:<Route size={19}/>,label:"路線",badge:route.length},{id:"map",icon:<Map size={19}/>,label:"地圖"},{id:"chat",icon:<MessageCircle size={19}/>,label:"AI"}];

  return(
    <div style={{fontFamily:"'Noto Sans TC','PingFang TC',sans-serif",background:T.bg,minHeight:"100vh",color:T.text,paddingBottom:76}}>
      {/* Toast */}
      {toast&&<div style={{position:"fixed",top:18,left:"50%",transform:"translateX(-50%)",zIndex:999,background:T.rose,color:"#fff",padding:"9px 22px",borderRadius:30,fontSize:12,fontWeight:800,boxShadow:`0 8px 32px ${T.glow}`,whiteSpace:"nowrap",pointerEvents:"none"}}>{toast}</div>}

      {/* Share Modal */}
      {showShare&&<Overlay onClose={()=>setShowShare(false)}>
        <MHdr icon="☁️" title="雲端共享" sub="把 Bin ID 傳給旅伴即可共享行程"/>
        {binId?(<>
          <div style={{background:T.surface,borderRadius:12,padding:"12px 14px",marginBottom:12,border:`1px solid ${T.border}`}}>
            <div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:5}}>你的 Bin ID</div>
            <div style={{fontSize:13,fontWeight:900,color:T.rose,wordBreak:"break-all"}}>{binId}</div>
          </div>
          <PrimaryBtn onClick={()=>navigator.clipboard.writeText(binId).then(()=>notify("✅ 已複製！")).catch(()=>notify("請手動複製"))}>📋 複製 Bin ID</PrimaryBtn>
          <div style={{borderTop:`1px solid ${T.border}`,paddingTop:14,marginTop:14}}>
            <div style={{fontSize:11,color:T.muted,marginBottom:8}}>旅伴輸入 Bin ID 連線</div>
            <div style={{display:"flex",gap:8}}>
              <input value={binInput} onChange={e=>setBinInput(e.target.value)} placeholder="貼上 Bin ID…" style={{...INP,flex:1}}/>
              <button onClick={()=>connectBin(binInput)} style={{padding:"10px 14px",background:T.roseDark,color:"#fff",border:"none",borderRadius:11,fontWeight:800,fontSize:11,cursor:"pointer"}}>連線</button>
            </div>
          </div>
        </>):(<>
          <div style={{background:T.goldFaint,borderRadius:12,padding:14,marginBottom:14,fontSize:12,color:T.gold,lineHeight:1.7}}>⚠️ 尚未建立雲端。點下方建立，或輸入旅伴 Bin ID 連接。</div>
          <PrimaryBtn onClick={createNewBin}>✨ 建立雲端資料庫</PrimaryBtn>
          <div style={{marginTop:12,display:"flex",gap:8}}>
            <input value={binInput} onChange={e=>setBinInput(e.target.value)} placeholder="或輸入旅伴 Bin ID…" style={{...INP,flex:1}}/>
            <button onClick={()=>connectBin(binInput)} style={{padding:"10px 14px",background:T.roseDark,color:"#fff",border:"none",borderRadius:11,fontWeight:800,fontSize:11,cursor:"pointer"}}>連線</button>
          </div>
        </>)}
      </Overlay>}

      {/* AI Insight */}
      {aiInsight.show&&<Overlay onClose={()=>setAiInsight({show:false,title:"",content:"",loading:false})}><MHdr icon="✨" title="AI 景點洞察" sub={aiInsight.title}/>{aiInsight.loading?<SpinBox/>:<AIBox text={aiInsight.content}/>}</Overlay>}

      {/* Route AI */}
      {routeAI.show&&<Overlay onClose={()=>setRouteAI({show:false,content:"",loading:false})}><MHdr icon="🗺" title="AI 路線建議" sub={`${routeLocs.length} 個停靠點`}/>{routeAI.loading?<SpinBox/>:<><AIBox text={routeAI.content}/><button onClick={()=>window.open(`https://map.naver.com/v5/search/${encodeURIComponent(routeLocs[0]?.name||"")}`, "_blank")} style={{width:"100%",marginTop:12,padding:"12px",background:"#03C75A",color:"#fff",border:"none",borderRadius:13,fontWeight:800,fontSize:12,cursor:"pointer"}}>在 Naver Maps 開啟導航</button></>}</Overlay>}

      {/* Note */}
      {noteModal!==null&&<Overlay onClose={()=>setNoteModal(null)}><NoteModal locName={locations.find(l=>l.id===noteModal)?.name||""} note={favNotes[noteModal]||""} onSave={n=>{const u={...favNotes,[noteModal]:n};setFavNotes(u);save({favNotes:u});setNoteModal(null);notify("✅ 筆記已儲存");}}/></Overlay>}

      {/* Add */}
      {addModal&&<Overlay onClose={()=>setAddModal(false)}><AddForm onAdd={loc=>{const u=[{...loc,id:Date.now(),lat:37.54+Math.random()*0.05,lng:126.99+Math.random()*0.1,mapsId:""},...locations];setLocations(u);save({locations:u});setAddModal(false);notify("✅ 已新增！");}}/></Overlay>}

      {/* Import */}
      {importModal&&<Overlay onClose={()=>setImportModal(false)}><ImportModal onImport={locs=>{const u=[...locations,...locs.map((l,i)=>({...l,id:Date.now()+i,lat:37.54+Math.random()*0.05,lng:126.99+Math.random()*0.1,mapsId:"",hours:l.hours||""}))];setLocations(u);save({locations:u});setImportModal(false);notify(`✅ 已匯入 ${locs.length} 個地點！`);}}/></Overlay>}

      {/* Edit item */}
      {editItem&&<Overlay onClose={()=>setEditItem(null)}><EditItemForm item={editItem.item} onSave={u=>{const ni=itinerary.map((d,i)=>i!==editItem.di?d:{...d,items:d.items.map(it=>it.instanceId===u.instanceId?u:it)});setItinerary(ni);save({itinerary:ni});setEditItem(null);notify("✅ 已更新");}}/></Overlay>}

      {/* Edit day */}
      {editDayIdx!==null&&<Overlay onClose={()=>setEditDayIdx(null)}><EditDayForm day={itinerary[editDayIdx]} onSave={(l,e,c)=>updateDay(editDayIdx,l,e,c)}/></Overlay>}

      {/* ── Header ── */}
      <header style={{background:`${T.surface}f2`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`,padding:"11px 16px",position:"sticky",top:0,zIndex:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:15,fontWeight:900,color:T.rose,letterSpacing:2.5}}>SEOUL 2026</div>
          <div style={{display:"flex",alignItems:"center",gap:4,marginTop:1}}>
            {syncing?<><Loader2 size={8} style={{color:T.gold,animation:"spin 1s linear infinite"}}/><span style={{fontSize:8,color:T.gold,fontWeight:700}}>同步中…</span></>
            :syncErr?<span style={{fontSize:8,color:"#E57373",fontWeight:700}}>⚠ 離線</span>
            :syncOk?<><Check size={8} style={{color:T.green}}/><span style={{fontSize:8,color:T.green,fontWeight:700}}>已同步</span></>
            :<span style={{fontSize:8,color:T.muted,fontWeight:600}}>Mar 20–24 · 5 Days</span>}
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {[{icon:<Share2 size={12}/>,label:"分享",fn:()=>setShowShare(true)},{icon:<RefreshCw size={12}/>,label:"同步",fn:manualSync}].map(b=>(
            <button key={b.label} onClick={b.fn} style={{display:"flex",alignItems:"center",gap:4,background:T.card,border:`1px solid ${T.border}`,borderRadius:9,padding:"6px 11px",fontSize:10,fontWeight:800,color:T.textSoft,cursor:"pointer"}}>{b.icon}{b.label}</button>
          ))}
        </div>
      </header>

      <main style={{maxWidth:740,margin:"0 auto",padding:"0 12px"}}>

        {/* ══ EXPLORE ══ */}
        {tab==="explore"&&<div style={{paddingTop:16}}>
          <div style={{display:"flex",alignItems:"center",marginBottom:10,gap:8}}>
            <span style={{fontSize:11,fontWeight:900,color:T.rose}}>📍 共 {locations.length} 個地點</span>
            <span style={{fontSize:10,color:T.muted}}>· 收藏 {favorites.length} 個</span>
          </div>
          <div style={{display:"flex",gap:7,marginBottom:12}}>
            <div style={{flex:1,position:"relative"}}>
              <Search size={13} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:T.muted}}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜尋店家…" style={{...INP,paddingLeft:34}}/>
            </div>
            <button onClick={()=>setImportModal(true)} title="AI 批量匯入" style={{background:T.rose,color:"#fff",border:"none",borderRadius:12,width:42,height:42,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 4px 16px ${T.glow}`}}><Sparkles size={16}/></button>
            <button onClick={()=>setAddModal(true)} title="手動新增" style={{background:T.card,color:T.muted,border:`1px solid ${T.border}`,borderRadius:12,width:42,height:42,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Plus size={16}/></button>
          </div>

          {/* Category pills */}
          <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:7,marginBottom:5}}>
            {["全部",...CATEGORIES].map(c=>(
              <button key={c} onClick={()=>setCatFilter(c)} style={{padding:"6px 13px",borderRadius:18,border:"none",fontWeight:800,fontSize:10,cursor:"pointer",whiteSpace:"nowrap",background:catFilter===c?T.rose:T.card,color:catFilter===c?"#fff":T.muted,boxShadow:catFilter===c?`0 4px 16px ${T.glow}`:"none",transition:"all 0.15s",flexShrink:0}}>
                {c!=="全部"&&EMOJI[c]} {c}
              </button>
            ))}
          </div>

          {/* Area pills */}
          <div style={{display:"flex",gap:4,overflowX:"auto",paddingBottom:9}}>
            {["全部",...AREAS].map(a=>(
              <button key={a} onClick={()=>setAreaFilter(a)} style={{padding:"4px 10px",borderRadius:10,border:`1px solid ${areaFilter===a?T.rose:T.border}`,fontWeight:700,fontSize:9,cursor:"pointer",whiteSpace:"nowrap",background:areaFilter===a?T.roseDeep:"transparent",color:areaFilter===a?T.text:T.muted,flexShrink:0}}>
                {a}
              </button>
            ))}
          </div>

          {/* Group by */}
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
            <button onClick={()=>setGroupBy(g=>g==="area"?"type":"area")} style={{display:"flex",alignItems:"center",gap:5,background:T.card,border:`1px solid ${T.border}`,borderRadius:9,padding:"5px 11px",fontSize:10,fontWeight:800,color:T.muted,cursor:"pointer"}}>
              <Layers size={11}/> {groupBy==="area"?"依地區":"依類型"}
            </button>
          </div>

          {Object.entries(grouped).map(([grp,items])=>(
            <div key={grp} style={{marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{width:groupBy==="type"?8:3,height:groupBy==="type"?8:16,borderRadius:groupBy==="type"?"50%":2,background:groupBy==="type"?(TC[grp]||T.rose):T.rose,flexShrink:0}}/>
                <span style={{fontSize:13,fontWeight:900,color:groupBy==="type"?(TC[grp]||T.rose):T.rose}}>{groupBy==="type"&&EMOJI[grp]} {grp}</span>
                <span style={{fontSize:10,color:T.muted}}>{items.length}</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:9}}>
                {items.map(loc=>(
                  <LocCard key={loc.id} loc={loc} isFav={favorites.includes(loc.id)} inRoute={route.includes(loc.id)}
                    onToggleFav={()=>toggleFav(loc.id)} onToggleRoute={()=>toggleRoute(loc.id)}
                    onAddToDay={addToDay} onAIInsight={()=>openInsight(loc)}/>
                ))}
              </div>
            </div>
          ))}
          {filtered.length===0&&<Empty icon="🔍" text="找不到符合的地點"/>}
        </div>}

        {/* ══ FAVORITES ══ */}
        {tab==="favorites"&&<div style={{paddingTop:16}}>
          <SHdr icon={<Heart size={15}/>} title="我的收藏" sub={`${favLocs.length} 個地點`}/>
          {favLocs.length===0?<Empty icon="💝" text="還沒有收藏，去探索頁加入吧"/>:<>
            {/* Type counts */}
            <div style={{display:"flex",gap:7,marginBottom:16,overflowX:"auto",paddingBottom:3}}>
              {CATEGORIES.map(cat=>{const n=favLocs.filter(l=>l.type===cat).length;if(!n)return null;return(
                <div key={cat} style={{background:T.card,borderRadius:12,padding:"9px 12px",border:`1px solid ${T.border}`,flexShrink:0,textAlign:"center",minWidth:52}}>
                  <div style={{fontSize:18}}>{EMOJI[cat]}</div>
                  <div style={{fontSize:11,fontWeight:900,color:TC[cat]||T.rose,marginTop:1}}>{n}</div>
                  <div style={{fontSize:8,color:T.muted}}>{cat}</div>
                </div>
              );})}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {favLocs.map(loc=><FavCard key={loc.id} loc={loc} note={favNotes[loc.id]||""} inRoute={route.includes(loc.id)} onRemoveFav={()=>toggleFav(loc.id)} onToggleRoute={()=>toggleRoute(loc.id)} onAddToDay={addToDay} onAIInsight={()=>openInsight(loc)} onEditNote={()=>setNoteModal(loc.id)}/>)}
            </div>
            <button onClick={()=>{const ids=favLocs.map(l=>l.id);setRoute(ids);save({route:ids});setTab("route");notify("✅ 全部加入路線！");}} style={{width:"100%",marginTop:12,padding:"12px",background:T.roseDeep,color:T.rose,border:`1px solid ${T.rose}`,borderRadius:13,fontWeight:800,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <Route size={13}/> 全部加入路線
            </button>
          </>}
        </div>}

        {/* ══ PLAN ══ */}
        {tab==="plan"&&<div style={{paddingTop:16}}>
          <SHdr icon={<Calendar size={15}/>} title="行程規劃" sub="時間 · 排序 · 跨天搬移"/>

          {/* Quick add */}
          {favLocs.length>0&&<div style={{background:T.card,borderRadius:16,padding:14,marginBottom:12,border:`1px solid ${T.border}`}}>
            <div style={{fontSize:9,fontWeight:900,color:T.muted,marginBottom:9,letterSpacing:1.5}}>⚡ 快速加入收藏</div>
            <div style={{maxHeight:190,overflowY:"auto",display:"flex",flexDirection:"column",gap:5}}>
              {favLocs.map(fav=>(
                <div key={fav.id} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 9px",background:T.surface,borderRadius:9}}>
                  <span style={{fontSize:15,flexShrink:0}}>{EMOJI[fav.type]}</span>
                  <span style={{flex:1,fontWeight:700,fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fav.name}</span>
                  <div style={{display:"flex",gap:3,flexShrink:0}}>
                    {[0,1,2,3,4].map(i=>(
                      <button key={i} onClick={()=>addToDay(fav,i)} style={{width:24,height:24,borderRadius:7,border:`1px solid ${T.border}`,background:T.card,color:T.rose,fontSize:8,fontWeight:900,cursor:"pointer"}}>D{i+1}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>}

          {/* Days */}
          {itinerary.map((day,di)=>{
            const isOpen=openDay===di;
            const totalItems=day.items.length;
            return(
              <div key={di} style={{background:T.card,borderRadius:18,marginBottom:8,border:`1px solid ${T.border}`,overflow:"hidden"}}>
                <div onClick={()=>setOpenDay(isOpen?null:di)} style={{display:"flex",alignItems:"center",padding:"13px 14px",cursor:"pointer",gap:10,borderBottom:isOpen?`1px solid ${T.border}`:"none"}}>
                  <div style={{width:36,height:36,borderRadius:11,background:day.color||T.roseDeep,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{day.emoji||"📅"}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:900,fontSize:13}}>{day.label}</div>
                    <div style={{fontSize:9,color:T.muted,marginTop:1}}>{day.date} · {totalItems} 個行程</div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();setEditDayIdx(di);}} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,padding:4,display:"flex"}}><Edit2 size={12}/></button>
                  <ChevronRight size={14} style={{color:T.muted,transform:isOpen?"rotate(90deg)":"none",transition:"transform 0.2s",flexShrink:0}}/>
                </div>
                {isOpen&&<div style={{padding:"10px 12px"}}>
                  {totalItems===0
                    ?<div style={{padding:"18px 0",textAlign:"center",color:T.muted,fontSize:11}}>尚未安排 — 從上方快速加入收藏</div>
                    :<div style={{display:"flex",flexDirection:"column",gap:7}}>
                      {day.items.map((item,ii)=>(
                        <div key={item.instanceId} style={{display:"flex",gap:8,padding:"10px 11px",background:T.surface,borderRadius:13,alignItems:"flex-start"}}>
                          {/* order */}
                          <div style={{display:"flex",flexDirection:"column",gap:2,alignItems:"center",paddingTop:2}}>
                            <button onClick={()=>reorderIt(di,item.instanceId,"up")} style={{background:"none",border:"none",cursor:"pointer",color:T.muted}}><ChevronUp size={12}/></button>
                            <div style={{width:20,height:20,borderRadius:6,background:T.roseDeep,color:T.rose,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900}}>{ii+1}</div>
                            <button onClick={()=>reorderIt(di,item.instanceId,"down")} style={{background:"none",border:"none",cursor:"pointer",color:T.muted}}><ChevronDown size={12}/></button>
                          </div>
                          <span style={{fontSize:17,paddingTop:1,flexShrink:0}}>{EMOJI[item.type]||"📍"}</span>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:800,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</div>
                            <div style={{fontSize:9,color:T.muted,marginBottom:6}}>{item.area}</div>
                            {/* time */}
                            <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
                              <Clock size={9} style={{color:T.muted}}/>
                              <input type="time" value={item.time||""} onChange={e=>setTime(di,item.instanceId,e.target.value)}
                                style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:7,padding:"2px 7px",fontSize:10,color:T.text,outline:"none",cursor:"pointer"}}/>
                            </div>
                            {/* move to day */}
                            <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                              {[0,1,2,3,4].map(i=>(
                                <button key={i} onClick={()=>moveItem(di,item.instanceId,i)} style={{padding:"3px 7px",borderRadius:6,border:"none",fontSize:8,fontWeight:900,cursor:"pointer",background:i===di?T.rose:T.card,color:i===di?"#fff":T.muted}}>D{i+1}</button>
                              ))}
                            </div>
                          </div>
                          <div style={{display:"flex",flexDirection:"column",gap:4}}>
                            <button onClick={()=>setEditItem({di,item:{...item}})} style={{padding:5,background:T.card,border:`1px solid ${T.border}`,borderRadius:8,cursor:"pointer",color:T.muted,display:"flex"}}><Edit2 size={11}/></button>
                            <button onClick={()=>removeItem(di,item.instanceId)} style={{padding:5,background:T.card,border:`1px solid ${T.border}`,borderRadius:8,cursor:"pointer",color:"#E57373",display:"flex"}}><Trash2 size={11}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  }
                </div>}
              </div>
            );
          })}
        </div>}

        {/* ══ ROUTE ══ */}
        {tab==="route"&&<div style={{paddingTop:16}}>
          <div style={{display:"flex",alignItems:"center",marginBottom:10,gap:8}}>
            <span style={{fontSize:11,fontWeight:900,color:T.rose}}>🗺 共 {locations.length} 個地點</span>
            <span style={{fontSize:10,color:T.muted}}>· 路線 {routeLocs.length} 個</span>
          </div>
          <div style={{background:T.card,borderRadius:18,padding:16,marginBottom:12,border:`1px solid ${T.border}`}}>
            {routeLocs.length===0
              ?<Empty icon="🗺" text="從下方加入路線點"/>
              :<>
                <div style={{position:"relative",paddingLeft:30,marginBottom:12}}>
                  <div style={{position:"absolute",left:13,top:18,bottom:18,width:2,background:`linear-gradient(to bottom,${T.rose},${T.roseDeep})`,borderRadius:2}}/>
                  {routeLocs.map((loc,i)=>(
                    <div key={loc.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",position:"relative"}}>
                      <div style={{position:"absolute",left:-18,width:18,height:18,borderRadius:"50%",background:i===0?T.rose:i===routeLocs.length-1?T.green:T.roseDeep,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:900}}>
                        {i===0?"S":i===routeLocs.length-1?"E":i+1}
                      </div>
                      <div style={{flex:1,background:T.surface,borderRadius:11,padding:"8px 11px",display:"flex",alignItems:"center",gap:7}}>
                        <span style={{fontSize:14}}>{EMOJI[loc.type]}</span>
                        <div style={{flex:1,minWidth:0}}><div style={{fontWeight:800,fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{loc.name}</div><div style={{fontSize:9,color:T.muted}}>{loc.area}</div></div>
                        <div style={{display:"flex",gap:2}}>
                          <button onClick={()=>reorderRoute(loc.id,"up")} style={{background:"none",border:"none",cursor:"pointer",color:T.muted}}><ChevronUp size={12}/></button>
                          <button onClick={()=>reorderRoute(loc.id,"down")} style={{background:"none",border:"none",cursor:"pointer",color:T.muted}}><ChevronDown size={12}/></button>
                          <button onClick={()=>toggleRoute(loc.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#E57373",marginLeft:3}}><X size={12}/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:7}}>
                  <button onClick={genRoute} style={{flex:1,padding:"11px",background:T.roseDeep,color:T.rose,border:`1px solid ${T.rose}`,borderRadius:12,fontWeight:800,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><Sparkles size={12}/> AI 最佳路線</button>
                  <button onClick={()=>window.open(`https://map.naver.com/v5/search/${encodeURIComponent(routeLocs[0]?.name||"")}`, "_blank")} style={{flex:1,padding:"11px",background:"#03C75A",color:"#fff",border:"none",borderRadius:12,fontWeight:800,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><Navigation size={12}/> Naver</button>
                </div>
              </>
            }
          </div>
          <div style={{background:T.card,borderRadius:16,padding:12,border:`1px solid ${T.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
              <div style={{fontSize:9,fontWeight:900,color:T.muted,letterSpacing:1.5,flex:1}}>＋ 加入路線點</div>
            </div>
            <RouteSearch locations={locations} route={route} toggleRoute={toggleRoute}/>
          </div>
        </div>}

        {/* ══ MAP ══ */}
        {tab==="map"&&<MapTab userCoords={userCoords} isLocating={isLocating} setIsLocating={setIsLocating} setUserCoords={setUserCoords} nearbyFavs={nearbyFavs} locations={locations} favorites={favorites} notify={notify} onImport={(locs)=>{const u=[...locations,...locs.map((l,i)=>({...l,id:Date.now()+i,mapsId:""}))];setLocations(u);save({locations:u});notify(`✅ 已匯入 ${locs.length} 個地點！`);}}/>}

        {/* ══ CHAT ══ */}
        {tab==="chat"&&<div style={{paddingTop:16,display:"flex",flexDirection:"column",height:"calc(100vh - 196px)"}}>
          <SHdr icon={<MessageCircle size={15}/>} title="AI 旅遊助理" sub="首爾達人 24hr"/>
          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:9,paddingBottom:8}}>
            {chatMsgs.map((msg,i)=>(
              <div key={i} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start",alignItems:"flex-end",gap:7}}>
                {msg.role==="assistant"&&<div style={{width:26,height:26,borderRadius:"50%",background:`linear-gradient(135deg,${T.rose},${T.roseDeep})`,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>✨</div>}
                <div style={{maxWidth:"78%",padding:"9px 13px",borderRadius:msg.role==="user"?"16px 16px 3px 16px":"16px 16px 16px 3px",background:msg.role==="user"?T.rose:T.card,color:msg.role==="user"?"#fff":T.text,fontSize:12,lineHeight:1.8,border:msg.role==="assistant"?`1px solid ${T.border}`:"none",whiteSpace:"pre-wrap"}}>{msg.content}</div>
              </div>
            ))}
            {chatLoading&&<div style={{display:"flex",gap:7}}><div style={{width:26,height:26,borderRadius:"50%",background:`linear-gradient(135deg,${T.rose},${T.roseDeep})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>✨</div><div style={{background:T.card,padding:"10px 14px",borderRadius:"16px 16px 16px 3px",border:`1px solid ${T.border}`}}><Loader2 size={13} style={{color:T.rose,animation:"spin 1s linear infinite"}}/></div></div>}
            <div ref={chatEnd}/>
          </div>
          <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:7}}>
            {["聖水洞必去？","弘大美食","交通攻略","購物退稅","3月穿搭"].map(q=>(
              <button key={q} onClick={()=>handleChat(q)} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:"5px 11px",fontSize:9,fontWeight:800,color:T.rose,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{q}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:7,paddingTop:7,borderTop:`1px solid ${T.border}`}}>
            <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleChat()} placeholder="問我任何首爾問題…" style={{...INP,flex:1}}/>
            <button onClick={()=>handleChat()} disabled={chatLoading} style={{width:42,height:42,borderRadius:"50%",background:T.rose,color:"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Send size={15}/></button>
          </div>
        </div>}
      </main>

      {/* ── Bottom Nav ── */}
      <nav style={{position:"fixed",bottom:0,left:0,right:0,height:68,background:`${T.surface}f8`,backdropFilter:"blur(24px)",borderTop:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-around",zIndex:100}}>
        {NAV.map(({id,icon,label,badge})=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,background:"none",border:"none",cursor:"pointer",color:tab===id?T.rose:T.muted,padding:"5px 0",position:"relative"}}>
            <div style={{padding:5,borderRadius:10,background:tab===id?T.roseGlow:"transparent",position:"relative",transition:"background 0.2s"}}>
              {icon}
              {badge>0&&<div style={{position:"absolute",top:-1,right:-1,width:13,height:13,borderRadius:"50%",background:T.rose,color:"#fff",fontSize:7,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>{badge}</div>}
            </div>
            <span style={{fontSize:8,fontWeight:800,letterSpacing:0.2}}>{label}</span>
          </button>
        ))}
      </nav>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{-webkit-tap-highlight-color:transparent;} body{background:#FAF6F3;} ::-webkit-scrollbar{width:3px;height:3px;} ::-webkit-scrollbar-thumb{background:#E8D0C8;border-radius:3px;} input[type=time]::-webkit-calendar-picker-indicator{filter:none;cursor:pointer;}`}</style>
    </div>
  );
}

// ══ Location Card ════════════════════════════════════════════════════
const LocCard=({loc,isFav,inRoute,onToggleFav,onToggleRoute,onAddToDay,onAIInsight})=>{
  const [showDP,setShowDP]=useState(false);
  const tc=TC[loc.type]||T.rose;
  const g=loc.mapsId?`https://www.google.com/maps/place/?q=place_id:${loc.mapsId}`:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.name+" 首爾")}`;
  return(
    <div style={{background:T.card,borderRadius:16,overflow:"hidden",border:`1px solid ${T.border}`,display:"flex",flexDirection:"column"}}>
      <div style={{height:5,background:`linear-gradient(90deg,${tc}90,${tc}15)`}}/>
      <div style={{padding:"11px 12px 12px",flex:1,display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <span style={{fontSize:15}}>{EMOJI[loc.type]}</span>
            <span style={{fontSize:8,fontWeight:800,color:tc,background:`${tc}18`,padding:"2px 6px",borderRadius:8}}>{loc.type}</span>
          </div>
          <button onClick={onToggleFav} style={{background:isFav?T.roseDeep:"none",border:`1px solid ${isFav?T.rose:T.border}`,borderRadius:7,width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <Heart size={12} fill={isFav?"#fff":"none"} color={isFav?"#fff":T.muted}/>
          </button>
        </div>
        <div style={{fontWeight:900,fontSize:12,lineHeight:1.3,marginBottom:3}}>{loc.name}</div>
        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
          <MapPin size={8} style={{color:T.muted,flexShrink:0}}/>
          <span style={{fontSize:9,color:T.muted,fontWeight:600}}>{loc.area}</span>
          
          {loc.rating&&<span style={{fontSize:8,color:T.gold,fontWeight:700}}>★{loc.rating}</span>}
        </div>
        {loc.hours&&<div style={{fontSize:8,color:T.green,fontWeight:700,marginBottom:5,display:"flex",alignItems:"center",gap:3}}><Clock size={8}/>{loc.hours}</div>}
        {loc.desc&&<div style={{fontSize:10,color:T.muted,lineHeight:1.5,marginBottom:9,flex:1}}>{loc.desc}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
            <button onClick={()=>window.open(`https://map.naver.com/v5/search/${encodeURIComponent(loc.name)}`,"_blank")} style={{padding:"6px 0",background:"#03C75A1A",color:"#03C75A",border:"1px solid #03C75A40",borderRadius:8,fontSize:8,fontWeight:800,cursor:"pointer"}}>Naver</button>
            <button onClick={()=>window.open(g,"_blank")} style={{padding:"6px 0",background:T.roseGlow,color:T.rose,border:`1px solid ${T.roseDeep}`,borderRadius:8,fontSize:8,fontWeight:800,cursor:"pointer"}}>Google</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4}}>
            <button onClick={onAIInsight} style={{padding:"6px 0",background:T.roseGlow,color:T.rose,border:`1px solid ${T.roseDeep}`,borderRadius:8,fontSize:8,fontWeight:800,cursor:"pointer"}}>✨ AI</button>
            <button onClick={onToggleRoute} style={{padding:"6px 0",background:inRoute?T.roseDeep:T.surface,color:inRoute?T.rose:T.muted,border:`1px solid ${inRoute?T.rose:T.border}`,borderRadius:8,fontSize:8,fontWeight:800,cursor:"pointer"}}>{inRoute?"✓路線":"路線+"}</button>
            <button onClick={()=>setShowDP(p=>!p)} style={{padding:"6px 0",background:showDP?T.roseDeep:T.surface,color:showDP?T.rose:T.muted,border:`1px solid ${showDP?T.rose:T.border}`,borderRadius:8,fontSize:8,fontWeight:800,cursor:"pointer"}}>{showDP?"▲":"排程+"}</button>
          </div>
          {showDP&&<div style={{display:"flex",gap:3}}>{[0,1,2,3,4].map(i=><button key={i} onClick={()=>{onAddToDay(loc,i);setShowDP(false);}} style={{flex:1,padding:"6px 0",background:T.roseDeep,color:T.rose,border:`1px solid ${T.rose}`,borderRadius:8,fontSize:8,fontWeight:900,cursor:"pointer"}}>D{i+1}</button>)}</div>}
        </div>
      </div>
    </div>
  );
};

// ══ Fav Card ═════════════════════════════════════════════════════════
const FavCard=({loc,note,inRoute,onRemoveFav,onToggleRoute,onAddToDay,onAIInsight,onEditNote})=>{
  const [exp,setExp]=useState(false);
  const [showDP,setShowDP]=useState(false);
  const tc=TC[loc.type]||T.rose;
  const g=loc.mapsId?`https://www.google.com/maps/place/?q=place_id:${loc.mapsId}`:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.name+" 首爾")}`;
  return(
    <div style={{background:T.card,borderRadius:14,border:`1px solid ${T.border}`,overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:9,padding:"11px 13px",cursor:"pointer"}} onClick={()=>setExp(p=>!p)}>
        <div style={{width:36,height:36,borderRadius:11,background:`${tc}18`,border:`1px solid ${tc}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{EMOJI[loc.type]}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:900,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{loc.name}</div>
          <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
            <span style={{fontSize:9,color:T.muted}}>{loc.area}</span>
            
            {loc.rating&&<span style={{fontSize:8,color:T.gold,fontWeight:700}}>★{loc.rating}</span>}
            {inRoute&&<span style={{fontSize:8,background:T.roseGlow,color:T.rose,fontWeight:800,padding:"1px 5px",borderRadius:5}}>路線中</span>}
          </div>
        </div>
        <ChevronRight size={13} style={{color:T.muted,flexShrink:0,transform:exp?"rotate(90deg)":"none",transition:"transform 0.2s"}}/>
      </div>
      {note&&<div style={{marginInline:13,marginBottom:8,padding:"6px 10px",background:T.goldFaint,borderRadius:9,fontSize:10,color:T.gold,fontStyle:"italic"}}>📝 {note}</div>}
      {!exp&&loc.desc&&<div style={{marginInline:13,marginBottom:10,fontSize:10,color:T.muted,lineHeight:1.55}}>{loc.desc}</div>}
      {exp&&<div style={{padding:"0 13px 12px",display:"flex",flexDirection:"column",gap:6}}>
        {loc.desc&&<div style={{fontSize:10,color:T.muted,lineHeight:1.6}}>{loc.desc}</div>}
        {loc.hours&&<div style={{fontSize:9,color:T.green,fontWeight:700,display:"flex",alignItems:"center",gap:3}}><Clock size={9}/>{loc.hours}</div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
          <button onClick={()=>window.open(`https://map.naver.com/v5/search/${encodeURIComponent(loc.name)}`,"_blank")} style={{padding:"7px 0",background:"#03C75A1A",color:"#03C75A",border:"1px solid #03C75A40",borderRadius:9,fontSize:9,fontWeight:800,cursor:"pointer"}}>Naver Maps</button>
          <button onClick={()=>window.open(g,"_blank")} style={{padding:"7px 0",background:T.roseGlow,color:T.rose,border:`1px solid ${T.roseDeep}`,borderRadius:9,fontSize:9,fontWeight:800,cursor:"pointer"}}>Google Maps</button>
          <button onClick={onAIInsight} style={{padding:"7px 0",background:T.roseGlow,color:T.rose,border:`1px solid ${T.roseDeep}`,borderRadius:9,fontSize:9,fontWeight:800,cursor:"pointer"}}>✨ AI 洞察</button>
          <button onClick={onEditNote} style={{padding:"7px 0",background:T.goldFaint,color:T.gold,border:"1px solid rgba(196,154,108,0.25)",borderRadius:9,fontSize:9,fontWeight:800,cursor:"pointer"}}>📝 筆記</button>
          <button onClick={onToggleRoute} style={{padding:"7px 0",background:inRoute?T.roseDeep:T.surface,color:inRoute?T.rose:T.muted,border:`1px solid ${inRoute?T.rose:T.border}`,borderRadius:9,fontSize:9,fontWeight:800,cursor:"pointer"}}>{inRoute?"✓ 已在路線":"➕ 加入路線"}</button>
          <button onClick={()=>setShowDP(p=>!p)} style={{padding:"7px 0",background:T.surface,color:T.muted,border:`1px solid ${T.border}`,borderRadius:9,fontSize:9,fontWeight:800,cursor:"pointer"}}>{showDP?"▲":"📅 排入行程"}</button>
        </div>
        {showDP&&<div style={{display:"flex",gap:3}}>{[0,1,2,3,4].map(i=><button key={i} onClick={()=>{onAddToDay(loc,i);setShowDP(false);}} style={{flex:1,padding:"7px 0",background:T.roseDeep,color:T.rose,border:`1px solid ${T.rose}`,borderRadius:9,fontSize:8,fontWeight:900,cursor:"pointer"}}>D{i+1}</button>)}</div>}
        <button onClick={onRemoveFav} style={{padding:"7px 0",background:"rgba(229,115,115,0.07)",color:"#E57373",border:"1px solid rgba(229,115,115,0.2)",borderRadius:9,fontSize:9,fontWeight:800,cursor:"pointer"}}>移除收藏</button>
      </div>}
    </div>
  );
};

// ══ Forms ════════════════════════════════════════════════════════════
const NoteModal=({locName,note,onSave})=>{const[v,setV]=useState(note);return(<><MHdr icon="📝" title="備忘筆記" sub={locName}/><textarea value={v} onChange={e=>setV(e.target.value)} placeholder="記下心得、品項、注意事項…" style={{...INP,minHeight:120,resize:"none",marginBottom:10}}/><PrimaryBtn onClick={()=>onSave(v)}>儲存筆記</PrimaryBtn></>);};

const AddForm=({onAdd})=>{
  const[f,setF]=useState({name:"",area:"聖水洞",type:"咖啡廳",desc:"",price:"₩₩",rating:"",hours:""});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  return(<><MHdr icon="➕" title="新增自訂地點" sub="手動輸入店家資訊"/>
    <div style={{display:"flex",flexDirection:"column",gap:9}}>
      <input placeholder="店家名稱 *" value={f.name} onChange={e=>s("name",e.target.value)} style={INP}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
        <select value={f.area} onChange={e=>s("area",e.target.value)} style={{...INP,cursor:"pointer"}}>{AREAS.map(a=><option key={a}>{a}</option>)}</select>
        <select value={f.type} onChange={e=>s("type",e.target.value)} style={{...INP,cursor:"pointer"}}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
        <select value={f.price} onChange={e=>s("price",e.target.value)} style={{...INP,cursor:"pointer"}}>{PRICE_LEVELS.map(p=><option key={p}>{p}</option>)}</select>
        <input placeholder="評分 (如 4.5)" value={f.rating} onChange={e=>s("rating",e.target.value)} style={INP}/>
      </div>
      <input placeholder="營業時間 (如 每天 11–21:00)" value={f.hours} onChange={e=>s("hours",e.target.value)} style={INP}/>
      <textarea placeholder="備註說明" value={f.desc} onChange={e=>s("desc",e.target.value)} style={{...INP,minHeight:70,resize:"none"}}/>
      <PrimaryBtn onClick={()=>{if(!f.name.trim())return;onAdd({...f,rating:parseFloat(f.rating)||null,priceLevel:f.price});}}>新增地點</PrimaryBtn>
    </div>
  </>);
};

const EditItemForm=({item,onSave})=>{const[f,setF]=useState({...item});return(<><MHdr icon="✏️" title="編輯行程項目" sub={item.name}/>
  <div style={{display:"flex",flexDirection:"column",gap:9}}>
    <input value={f.name} onChange={e=>setF(p=>({...p,name:e.target.value}))} style={INP}/>
    <input placeholder="地區" value={f.area||""} onChange={e=>setF(p=>({...p,area:e.target.value}))} style={INP}/>
    <div style={{display:"flex",alignItems:"center",gap:7}}><Clock size={13} style={{color:T.muted,flexShrink:0}}/><input type="time" value={f.time||""} onChange={e=>setF(p=>({...p,time:e.target.value}))} style={{...INP,flex:1}}/></div>
    <textarea placeholder="備註說明" value={f.desc||""} onChange={e=>setF(p=>({...p,desc:e.target.value}))} style={{...INP,minHeight:80,resize:"none"}}/>
    <PrimaryBtn onClick={()=>onSave(f)}>儲存</PrimaryBtn>
  </div>
</>);};

const DCOLORS=["#D4737E","#C49A6C","#9B8EC4","#5BA882","#6B9AC4","#C47AAA","#7A9B6B"];
const EditDayForm=({day,onSave})=>{
  const[label,setLabel]=useState(day.label);
  const[emoji,setEmoji]=useState(day.emoji||"📅");
  const[color,setColor]=useState(day.color||"#D4737E");
  return(<><MHdr icon={emoji} title={`Day ${day.day} 設定`} sub="標題、圖示、顏色"/>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{display:"flex",gap:7}}>
        <input value={emoji} onChange={e=>setEmoji(e.target.value)} placeholder="圖示" style={{...INP,width:52,flex:"none",textAlign:"center",fontSize:20}}/>
        <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="天標題" style={{...INP,flex:1}}/>
      </div>
      <div><div style={{fontSize:10,color:T.muted,marginBottom:7}}>主題色</div><div style={{display:"flex",gap:7}}>{DCOLORS.map(c=><button key={c} onClick={()=>setColor(c)} style={{width:28,height:28,borderRadius:"50%",background:c,border:color===c?`3px solid ${T.text}`:"3px solid transparent",cursor:"pointer"}}/>)}</div></div>
      <PrimaryBtn onClick={()=>onSave(label,emoji,color)}>儲存</PrimaryBtn>
    </div>
  </>);
};

// ══ AI Import ════════════════════════════════════════════════════════
const ImportModal=({onImport})=>{
  const[text,setText]=useState("");
  const[parsed,setParsed]=useState(null);
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState("");
  const parse=async()=>{
    if(!text.trim())return;
    setLoading(true);setErr("");setParsed(null);
    try{
      const raw=await callAI([{role:"user",content:`請解析這些店家：\n${text}`}],`你是資料解析助手。把使用者提供的店家清單解析成 JSON 陣列。每個店家輸出：{"name":string,"area":string,"type":string,"desc":string,"priceLevel":string,"rating":number|null,"hours":string}。area 只能是：聖水洞、弘大、明洞、漢南洞、安國、廣藏市場、島山/江南、梨泰院、鐘路、其他。type 只能是：咖啡廳、酒吧、景點、逛街、鞋子、美妝生活、餐廳、其他。priceLevel 只能是 ₩ ₩₩ ₩₩₩ ₩₩₩₩。desc 用繁體中文寫1句簡短介紹。hours 有就填，否則空字串。只輸出純 JSON 陣列，不要說明或 markdown。`);
      setParsed(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    }catch(e){setErr("解析失敗："+e.message);console.error("AI parse error",e);}
    setLoading(false);
  };
  return(<><MHdr icon="✨" title="AI 批量匯入" sub="貼上任何格式，AI 自動解析"/>
    {!parsed?(<>
      <div style={{fontSize:10,color:T.muted,marginBottom:9,lineHeight:1.8,background:T.surface,padding:"9px 13px",borderRadius:10,border:`1px solid ${T.border}`}}>
        支援任何格式：<br/>
        <span style={{color:T.rose}}>Cafe Bora 安國 咖啡</span><br/>
        <span style={{color:T.rose}}>Nudake・聖水・甜點・₩₩₩</span><br/>
        <span style={{color:T.rose}}>益善洞韓屋村（必去景點）</span>
      </div>
      <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={"貼上你的店家清單…"} style={{...INP,minHeight:150,resize:"none",marginBottom:9,lineHeight:1.7}}/>
      {err&&<div style={{color:"#E57373",fontSize:10,marginBottom:9}}>{err}</div>}
      <PrimaryBtn onClick={parse} disabled={loading}>
        {loading?<><Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>解析中…</>:<><Sparkles size={14}/>AI 解析</>}
      </PrimaryBtn>
    </>):(<>
      <div style={{fontWeight:800,fontSize:12,color:T.rose,marginBottom:10}}>✅ 解析完成，共 {parsed.length} 個地點</div>
      <div style={{maxHeight:310,overflowY:"auto",display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
        {parsed.map((loc,i)=>(
          <div key={i} style={{background:T.surface,borderRadius:11,padding:"9px 12px",display:"flex",gap:9,border:`1px solid ${T.border}`}}>
            <span style={{fontSize:18,flexShrink:0}}>{EMOJI[loc.type]||"📍"}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:800,fontSize:12}}>{loc.name}</div>
              <div style={{fontSize:9,color:T.muted,marginTop:2}}>{loc.area} · {loc.type} · {loc.priceLevel}{loc.rating?` · ★${loc.rating}`:""}</div>
              {loc.desc&&<div style={{fontSize:9,color:T.muted,marginTop:3,lineHeight:1.5}}>{loc.desc}</div>}
              {loc.hours&&<div style={{fontSize:8,color:T.green,marginTop:2,fontWeight:700}}>🕐 {loc.hours}</div>}
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
        <button onClick={()=>setParsed(null)} style={{padding:"11px",background:T.surface,color:T.muted,border:`1px solid ${T.border}`,borderRadius:12,fontWeight:800,fontSize:11,cursor:"pointer"}}>← 重新輸入</button>
        <PrimaryBtn onClick={()=>onImport(parsed)}>✅ 全部匯入</PrimaryBtn>
      </div>
    </>)}
  </>);
};

// ══ MapTab ═══════════════════════════════════════════════════════════
const MapTab = ({userCoords, isLocating, setIsLocating, setUserCoords, nearbyFavs, locations, favorites, notify, onImport}) => {
  const [mapType,      setMapType]      = useState("naver");
  const [selectedLoc,  setSelectedLoc]  = useState(null);
  const [importUrl,    setImportUrl]    = useState("");
  const [importing,    setImporting]    = useState(false);
  const [importResult, setImportResult] = useState(null);
  const favLocs = locations.filter(l => favorites.includes(l.id));

  const center = selectedLoc || userCoords || {lat:37.5410, lng:127.0555};
  const naverEmbedUrl  = `https://map.naver.com/v5/?c=${center.lng},${center.lat},15,0,0,0,dh`;
  const googleEmbedUrl = `https://maps.google.com/maps?q=${center.lat},${center.lng}&z=15&output=embed&hl=zh-TW`;

  const locateMe = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setUserCoords({lat:pos.coords.latitude,lng:pos.coords.longitude}); setIsLocating(false); notify("📍 定位成功！"); },
      () => { notify("定位失敗，請允許位置存取"); setIsLocating(false); },
      {enableHighAccuracy:true}
    );
  };

  const openNav = (loc) => {
    const url = mapType==="naver"
      ? `https://map.naver.com/v5/search/${encodeURIComponent(loc.name)}`
      : (loc.mapsId ? `https://www.google.com/maps/place/?q=place_id:${loc.mapsId}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.name+" 首爾")}`);
    window.open(url,"_blank");
  };

  const importFromUrl = async () => {
    if(!importUrl.trim()) return;
    setImporting(true); setImportResult(null);
    try {
      const raw = await callAI(
        [{role:"user", content:`這是一個地圖網址或店家名稱：\n${importUrl}\n\n請根據你的知識解析這個首爾店家資訊。`}],
        `你是首爾店家資料解析助手。輸出純 JSON（無 markdown）：{"name":string,"area":string,"type":string,"desc":string,"priceLevel":string,"rating":number|null,"hours":string,"lat":number,"lng":number}。area 只能是：聖水洞、弘大、明洞、漢南洞、安國、廣藏市場、島山/江南、梨泰院、鐘路、其他。type 只能是：咖啡廳、酒吧、景點、逛街、鞋子、美妝生活、餐廳、其他。priceLevel 只能是 ₩ ₩₩ ₩₩₩ ₩₩₩₩。lat/lng 填首爾的準確座標。`
      );
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setImportResult(parsed);
    } catch { notify("⚠️ 解析失敗，請試試直接貼店家名稱"); }
    setImporting(false);
  };

  return (
    <div style={{paddingTop:16}}>
      <SHdr icon={<Map size={15}/>} title="地圖 & 導航" sub="定位 · 收藏店家 · 匯入"/>

      {/* Controls row */}
      <div style={{display:"flex",gap:7,marginBottom:10,alignItems:"center"}}>
        <div style={{display:"flex",background:T.card,borderRadius:12,border:`1px solid ${T.border}`,overflow:"hidden",flexShrink:0}}>
          {[{id:"naver",label:"Naver",color:"#03C75A"},{id:"google",label:"Google",color:"#4285F4"}].map(m=>(
            <button key={m.id} onClick={()=>setMapType(m.id)}
              style={{padding:"8px 14px",border:"none",fontWeight:900,fontSize:11,cursor:"pointer",
                background:mapType===m.id?m.color:"transparent",
                color:mapType===m.id?"#fff":T.muted,transition:"all 0.15s"}}>
              {m.label}
            </button>
          ))}
        </div>
        <button onClick={locateMe} disabled={isLocating}
          style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,
            background:userCoords?T.green:T.rose,color:"#fff",border:"none",borderRadius:12,
            padding:"9px 14px",fontWeight:900,fontSize:11,cursor:"pointer"}}>
          {isLocating?<Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>:<LocateFixed size={13}/>}
          {isLocating?"定位中…":userCoords?"已定位 ✓":"定位我的位置"}
        </button>
      </div>

      {/* ── 地圖 + 收藏側欄 並排 ── */}
      <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"stretch"}}>

        {/* 地圖 iframe */}
        <div style={{flex:"0 0 58%",borderRadius:14,overflow:"hidden",border:`1px solid ${T.border}`,position:"relative",minHeight:340}}>
          <iframe
            key={`${mapType}-${center.lat.toFixed(4)}-${center.lng.toFixed(4)}`}
            src={mapType==="naver" ? naverEmbedUrl : googleEmbedUrl}
            width="100%" height="340"
            style={{border:"none",display:"block"}}
            title={mapType==="naver"?"Naver Map":"Google Map"}
            allow="geolocation" loading="lazy"
          />
          {selectedLoc&&(
            <div style={{position:"absolute",bottom:8,left:8,right:8,background:"rgba(255,255,255,0.96)",backdropFilter:"blur(10px)",borderRadius:10,padding:"7px 10px",border:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:16}}>{EMOJI[selectedLoc.type]}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:900,fontSize:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selectedLoc.name}</div>
                <div style={{fontSize:8,color:T.muted}}>{selectedLoc.area}</div>
              </div>
              <button onClick={()=>openNav(selectedLoc)}
                style={{background:mapType==="naver"?"#03C75A":T.blue,color:"#fff",border:"none",borderRadius:8,padding:"5px 9px",fontSize:9,fontWeight:900,cursor:"pointer",flexShrink:0}}>
                導航
              </button>
              <button onClick={()=>setSelectedLoc(null)} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,padding:2}}><X size={12}/></button>
            </div>
          )}
        </div>

        {/* 收藏側欄 */}
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:5,overflowY:"auto",maxHeight:340}}>
          {favLocs.length===0
            ? <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:T.muted,fontSize:10,textAlign:"center",padding:12}}>還沒有收藏<br/>去探索頁加入</div>
            : favLocs.map((loc,i)=>{
              const isSel = selectedLoc?.id===loc.id;
              const dist = nearbyFavs.find(n=>n.id===loc.id)?.dist;
              return (
                <button key={loc.id}
                  onClick={()=>{ setSelectedLoc(isSel?null:loc); if(!isSel) openNav(loc); }}
                  style={{display:"flex",alignItems:"center",gap:6,padding:"8px 9px",borderRadius:11,
                    border:`1.5px solid ${isSel?T.rose:T.border}`,
                    background:isSel?T.roseDeep:T.card,
                    cursor:"pointer",textAlign:"left",width:"100%"}}>
                  <div style={{width:22,height:22,borderRadius:7,background:isSel?T.rose:T.bg,color:isSel?"#fff":T.muted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:800,fontSize:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:T.text}}>{loc.name}</div>
                    <div style={{fontSize:8,color:T.muted,marginTop:1}}>{EMOJI[loc.type]} {loc.area}{dist!=null?` · ${dist.toFixed(1)}km`:""}</div>
                  </div>
                  <Navigation size={11} style={{color:isSel?T.rose:T.muted,flexShrink:0}}/>
                </button>
              );
            })
          }
        </div>
      </div>

      {/* Import box */}
      <div style={{background:T.card,borderRadius:16,padding:14,marginBottom:12,border:`1px solid ${T.border}`}}>
        <div style={{fontWeight:900,fontSize:12,color:T.text,marginBottom:3}}>📥 匯入店家</div>
        <div style={{fontSize:10,color:T.muted,marginBottom:9}}>貼 Naver / Google Maps 網址，或直接輸入店名，AI 自動解析</div>
        <div style={{display:"flex",gap:7,marginBottom:8}}>
          <input value={importUrl} onChange={e=>setImportUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&importFromUrl()}
            placeholder="naver.me/... · maps.app.goo.gl/... · 或店家名稱"
            style={{...INP,flex:1,fontSize:11}}/>
          <button onClick={importFromUrl} disabled={importing}
            style={{padding:"10px 14px",background:T.rose,color:"#fff",border:"none",borderRadius:11,fontWeight:900,fontSize:11,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",gap:5}}>
            {importing?<Loader2 size={12} style={{animation:"spin 1s linear infinite"}}/>:<Sparkles size={12}/>}
            {importing?"解析中":"解析"}
          </button>
        </div>
        {importResult&&(
          <div style={{background:T.bg,borderRadius:12,padding:12,border:`1px solid ${T.border}`}}>
            <div style={{display:"flex",gap:9,marginBottom:10}}>
              <span style={{fontSize:22,flexShrink:0}}>{EMOJI[importResult.type]||"📍"}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:900,fontSize:13}}>{importResult.name}</div>
                <div style={{fontSize:10,color:T.muted,marginTop:2}}>{importResult.area} · {importResult.type} · {importResult.priceLevel}{importResult.rating?` · ★${importResult.rating}`:""}</div>
                {importResult.desc&&<div style={{fontSize:10,color:T.textSoft,marginTop:4,lineHeight:1.5}}>{importResult.desc}</div>}
                {importResult.hours&&<div style={{fontSize:9,color:T.green,marginTop:3,fontWeight:700}}>🕐 {importResult.hours}</div>}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
              <button onClick={()=>{setImportResult(null);setImportUrl("");}}
                style={{padding:"9px",background:T.surface,color:T.muted,border:`1px solid ${T.border}`,borderRadius:10,fontWeight:800,fontSize:11,cursor:"pointer"}}>取消</button>
              <button onClick={()=>{onImport([importResult]);setImportResult(null);setImportUrl("");}}
                style={{padding:"9px",background:T.rose,color:"#fff",border:"none",borderRadius:10,fontWeight:900,fontSize:11,cursor:"pointer"}}>✅ 加入清單</button>
            </div>
          </div>
        )}
      </div>

      {/* All locations */}
      <div style={{fontWeight:900,fontSize:12,color:T.rose,marginBottom:8}}>🗺 所有地點</div>
      {locations.map(loc=>(
        <div key={loc.id} style={{background:T.card,borderRadius:12,padding:"9px 12px",marginBottom:5,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:14}}>{EMOJI[loc.type]}</span>
          <div style={{flex:1,minWidth:0}}><div style={{fontWeight:800,fontSize:11}}>{loc.name}</div><div style={{fontSize:9,color:T.muted}}>{loc.area}</div></div>
          <MapBtns loc={loc}/>
        </div>
      ))}
    </div>
  );
};
