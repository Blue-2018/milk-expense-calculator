import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Constants ─── */
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);
const getPrevMonth = (m, y) => m === 0 ? { month: 11, year: y - 1 } : { month: m - 1, year: y };

/* ─── Themes ─── */
const THEMES = [
  { id:"midnight",  name:"Midnight",      bg:"linear-gradient(165deg,#0f0c29 0%,#1a1a2e 45%,#16213e 100%)", card:"rgba(255,255,255,0.025)", text:"#e0e0e0", sub:"#888", bdr:"rgba(255,255,255,0.06)", inp:"rgba(255,255,255,0.04)", inpB:"#2a2a4a", cal:"#12122a", side:"#0d0b24", div:"#151530", light:false },
  { id:"seablue",   name:"Sea Blue",      bg:"linear-gradient(165deg,#e8f4f8 0%,#d1ecf1 45%,#bee3eb 100%)", card:"rgba(255,255,255,0.6)",  text:"#1a3c4d", sub:"#4a7a8a", bdr:"rgba(0,80,120,0.12)",  inp:"rgba(255,255,255,0.7)",  inpB:"#a8d4e0", cal:"#ddf0f5", side:"#d0e8ef", div:"#c8e2eb", light:true },
  { id:"skyblue",   name:"Sky Blue",      bg:"linear-gradient(165deg,#e0f0ff 0%,#cce5ff 45%,#b8daff 100%)", card:"rgba(255,255,255,0.55)", text:"#1a3355", sub:"#5577a0", bdr:"rgba(0,60,150,0.10)",  inp:"rgba(255,255,255,0.65)", inpB:"#a0c8e8", cal:"#d5eafc", side:"#c8e0f8", div:"#bed8f2", light:true },
  { id:"mint",      name:"Mint Green",    bg:"linear-gradient(165deg,#e8f8f0 0%,#d0f0e0 45%,#b8e8d0 100%)", card:"rgba(255,255,255,0.55)", text:"#1a3d2a", sub:"#4a8a6a", bdr:"rgba(0,120,60,0.10)",  inp:"rgba(255,255,255,0.65)", inpB:"#a0d8b8", cal:"#d8f2e4", side:"#ccecd8", div:"#c0e4d0", light:true },
  { id:"lavender",  name:"Lavender",      bg:"linear-gradient(165deg,#f0e8f8 0%,#e4d8f2 45%,#d8c8ec 100%)", card:"rgba(255,255,255,0.55)", text:"#2d1a4d", sub:"#7a5aa0", bdr:"rgba(80,0,160,0.10)",  inp:"rgba(255,255,255,0.65)", inpB:"#c8b0e0", cal:"#eae0f5", side:"#e0d4f0", div:"#d8ccea", light:true },
  { id:"peach",     name:"Peach",         bg:"linear-gradient(165deg,#fff0e8 0%,#ffe4d4 45%,#ffd8c0 100%)", card:"rgba(255,255,255,0.55)", text:"#4d2a1a", sub:"#a07050", bdr:"rgba(160,60,0,0.10)",  inp:"rgba(255,255,255,0.65)", inpB:"#e8c0a0", cal:"#fce8d8", side:"#f8e0d0", div:"#f0d8c8", light:true },
  { id:"rose",      name:"Rose Pink",     bg:"linear-gradient(165deg,#fce8ee 0%,#f8d4de 45%,#f2c0d0 100%)", card:"rgba(255,255,255,0.55)", text:"#4d1a2a", sub:"#a05070", bdr:"rgba(160,0,60,0.10)",  inp:"rgba(255,255,255,0.65)", inpB:"#e8a8c0", cal:"#f8dce4", side:"#f2d0dc", div:"#ecc8d4", light:true },
  { id:"cream",     name:"Cream",         bg:"linear-gradient(165deg,#f8f4e8 0%,#f0ead8 45%,#e8e0c8 100%)", card:"rgba(255,255,255,0.55)", text:"#3d3520", sub:"#8a7a58", bdr:"rgba(100,80,0,0.10)",  inp:"rgba(255,255,255,0.65)", inpB:"#d8ccaa", cal:"#f2ecdc", side:"#ece4d2", div:"#e4dcc8", light:true },
  { id:"sage",      name:"Sage",          bg:"linear-gradient(165deg,#e8ede8 0%,#dae2d8 45%,#ccd8ca 100%)", card:"rgba(255,255,255,0.55)", text:"#2a3328", sub:"#6a7a68", bdr:"rgba(40,80,30,0.10)",  inp:"rgba(255,255,255,0.65)", inpB:"#b8c8b4", cal:"#e0e8dc", side:"#d6e0d4", div:"#ced8cc", light:true },
];

const FONTS = [
  { id:"dm",   name:"DM Sans",    body:"'DM Sans',sans-serif",    mono:"'Space Mono',monospace",     disp:"'Playfair Display',serif", url:"https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&family=Playfair+Display:wght@700;800&display=swap" },
  { id:"pop",  name:"Poppins",    body:"'Poppins',sans-serif",    mono:"'Fira Code',monospace",      disp:"'Poppins',sans-serif",     url:"https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Fira+Code:wght@400;700&display=swap" },
  { id:"nun",  name:"Nunito",     body:"'Nunito',sans-serif",     mono:"'Source Code Pro',monospace", disp:"'Nunito',sans-serif",     url:"https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Source+Code+Pro:wght@400;700&display=swap" },
  { id:"lat",  name:"Lato",       body:"'Lato',sans-serif",       mono:"'IBM Plex Mono',monospace",  disp:"'Lato',sans-serif",       url:"https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&family=IBM+Plex+Mono:wght@400;700&display=swap" },
  { id:"qs",   name:"Quicksand",  body:"'Quicksand',sans-serif",  mono:"'JetBrains Mono',monospace", disp:"'Quicksand',sans-serif",  url:"https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" },
];

const SIZES = [
  { id:"s", name:"Small",  sc:0.9 },
  { id:"m", name:"Medium", sc:1.0 },
  { id:"l", name:"Large",  sc:1.25 },
  { id:"x", name:"X-Large",sc:1.5 },
];

/* ─── Storage ─── */
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch { return d; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

/* ─── Calendar ─── */
function Calendar({ selectedDate, onSelect, onClose, initialMonth, initialYear, th }) {
  const [vm, setVm] = useState(initialMonth ?? (selectedDate ? selectedDate.getMonth() : new Date().getMonth()));
  const [vy, setVy] = useState(initialYear ?? (selectedDate ? selectedDate.getFullYear() : new Date().getFullYear()));
  const ref = useRef();
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h); document.addEventListener("touchstart", h);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("touchstart", h); };
  }, [onClose]);
  const pM = () => { if (vm === 0) { setVm(11); setVy(y => y-1); } else setVm(m => m-1); };
  const nM = () => { if (vm === 11) { setVm(0); setVy(y => y+1); } else setVm(m => m+1); };
  const dim = getDaysInMonth(vm, vy), fd = new Date(vy, vm, 1).getDay();
  const cells = []; for (let i=0;i<fd;i++) cells.push(null); for (let i=1;i<=dim;i++) cells.push(i);
  const isSel = d => selectedDate && d && selectedDate.getDate()===d && selectedDate.getMonth()===vm && selectedDate.getFullYear()===vy;
  const isTod = d => { const t=new Date(); return d===t.getDate() && vm===t.getMonth() && vy===t.getFullYear(); };
  const navBtn = { background:"none", border:"none", color:"var(--gold)", fontSize:22, cursor:"pointer", padding:"2px 10px" };
  return (
    <div ref={ref} style={{ position:"absolute",top:"100%",left:0,right:0,zIndex:999,background:th.cal,border:`1px solid ${th.inpB}`,borderRadius:16,padding:16,boxShadow:"0 20px 50px rgba(0,0,0,0.6)",marginTop:4 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
        <button onClick={pM} style={navBtn}>‹</button>
        <span style={{ color:th.text,fontWeight:600,fontFamily:"var(--fb)",fontSize:14 }}>{MONTHS[vm]} {vy}</span>
        <button onClick={nM} style={navBtn}>›</button>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,textAlign:"center" }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d} style={{ color:th.sub,fontSize:10,padding:4,fontFamily:"var(--fb)",fontWeight:600 }}>{d}</div>)}
        {cells.map((d,i) => (
          <button key={i} disabled={!d} onClick={() => { if(d){onSelect(new Date(vy,vm,d));onClose();} }}
            style={{ background:isSel(d)?"linear-gradient(135deg,var(--gold),var(--pink))":isTod(d)?"rgba(240,194,122,0.12)":"transparent",border:"none",borderRadius:8,padding:"7px 0",cursor:d?"pointer":"default",color:isSel(d)?"#fff":d?th.text:"transparent",fontWeight:isSel(d)?700:400,fontSize:13,fontFamily:"var(--fm)",transition:"all 0.15s" }}>
            {d||"."}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── DatePicker ─── */
function DPick({ value, onChange, label, initialMonth, initialYear, th, st }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:"relative",flex:1 }}>
      {label && <label style={st.label}>{label}</label>}
      <button onClick={() => setOpen(o=>!o)} style={{ ...st.input,cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",color:value?th.text:th.sub,fontFamily:"var(--fm)" }}>
        <span>{value ? value.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "Pick a date"}</span>
        <span style={{ opacity:0.5 }}>📅</span>
      </button>
      {open && <Calendar selectedDate={value} onSelect={onChange} onClose={()=>setOpen(false)} initialMonth={initialMonth} initialYear={initialYear} th={th} />}
    </div>
  );
}

/* ─── Stepper ─── */
function Stepper({ value, onChange, min=0, max=99 }) {
  const b = { width:40,height:40,background:"none",border:"none",color:"var(--gold)",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 };
  return (
    <div style={{ display:"flex",alignItems:"center",background:"var(--inp)",borderRadius:10,border:"1px solid var(--inpB)",overflow:"hidden" }}>
      <button onClick={()=>onChange(Math.max(min,value-1))} style={b}>−</button>
      <span style={{ minWidth:30,textAlign:"center",color:"var(--text)",fontWeight:700,fontSize:"calc(16px * var(--sc))",fontFamily:"var(--fm)" }}>{value}</span>
      <button onClick={()=>onChange(Math.min(max,value+1))} style={b}>+</button>
    </div>
  );
}

function Badge({ n, color }) {
  return <span style={{ width:22,height:22,borderRadius:7,background:color==="red"?"rgba(252,92,125,0.14)":"rgba(240,194,122,0.14)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,color:color==="red"?"var(--pink)":"var(--gold)",fontWeight:700,fontFamily:"var(--fm)" }}>{n}</span>;
}

function Row({ label, amount, sub, neg }) {
  return (
    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:sub?"calc(12px * var(--sc))":"calc(13px * var(--sc))" }}>
      <span style={{ color:neg?"var(--pink)":(sub?"var(--sub)":"var(--text)"),flex:1,paddingRight:8 }}>{label}</span>
      <span style={{ fontFamily:"var(--fm)",color:neg?"var(--pink)":"var(--text)",whiteSpace:"nowrap",opacity:sub&&!neg?0.7:1 }}>
        {neg ? `−₹${Math.abs(amount).toFixed(2)}` : `₹${amount.toFixed(2)}`}
      </span>
    </div>
  );
}

/* ═══════════════ SIDEBAR ═══════════════ */
function Sidebar({ open, onClose, settings, onSettings, reports, onDelReport, th }) {
  const [tab, setTab] = useState("settings");
  return (<>
    {open && <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:998 }} />}
    <div style={{ position:"fixed",top:0,left:0,bottom:0,width:300,zIndex:999,background:th.side,borderRight:`1px solid ${th.bdr}`,transform:open?"translateX(0)":"translateX(-100%)",transition:"transform 0.3s cubic-bezier(.16,1,.3,1)",display:"flex",flexDirection:"column",overflow:"hidden" }}>
      <div style={{ padding:"20px 18px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${th.bdr}` }}>
        <span style={{ fontFamily:"var(--fd)",fontSize:18,fontWeight:700,color:"var(--gold)" }}>⚙️ Menu</span>
        <button onClick={onClose} style={{ background:"none",border:"none",color:th.sub,fontSize:22,cursor:"pointer" }}>✕</button>
      </div>
      <div style={{ display:"flex",borderBottom:`1px solid ${th.bdr}` }}>
        {[["settings","🎨 Settings"],["reports","📊 Reports"]].map(([id,lb]) => (
          <button key={id} onClick={()=>setTab(id)} style={{ flex:1,padding:"12px 0",background:tab===id?th.card:"transparent",border:"none",color:tab===id?"var(--gold)":th.sub,fontSize:12,fontWeight:600,fontFamily:"var(--fb)",cursor:"pointer",borderBottom:tab===id?"2px solid var(--gold)":"2px solid transparent" }}>{lb}</button>
        ))}
      </div>
      <div style={{ flex:1,overflowY:"auto",padding:18 }}>
        {tab === "settings" ? <SettingsPanel settings={settings} onSettings={onSettings} th={th} /> : <ReportsPanel reports={reports} onDel={onDelReport} th={th} />}
      </div>
    </div>
  </>);
}

function SettingsPanel({ settings, onSettings, th }) {
  const lbl = { display:"block",color:"var(--gold)",fontSize:11,marginBottom:8,fontFamily:"var(--fb)",textTransform:"uppercase",letterSpacing:1.5,fontWeight:600 };
  return (<>
    <div style={{ marginBottom:24 }}>
      <label style={lbl}>Background Theme</label>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8 }}>
        {THEMES.map(t => (
          <button key={t.id} onClick={()=>onSettings({...settings,themeId:t.id})}
            style={{ padding:"10px 4px",borderRadius:10,border:settings.themeId===t.id?"2px solid var(--gold)":`1px solid ${th.bdr}`,background:t.bg,cursor:"pointer",textAlign:"center",fontSize:10,color:t.text,fontFamily:"var(--fb)",fontWeight:600 }}>
            {t.name}
          </button>
        ))}
      </div>
    </div>
    <div style={{ marginBottom:24 }}>
      <label style={lbl}>Font Style</label>
      <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
        {FONTS.map(f => (
          <button key={f.id} onClick={()=>onSettings({...settings,fontId:f.id})}
            style={{ padding:"10px 14px",borderRadius:10,textAlign:"left",border:settings.fontId===f.id?"2px solid var(--gold)":`1px solid ${th.bdr}`,background:settings.fontId===f.id?"rgba(240,194,122,0.08)":"transparent",color:th.text,cursor:"pointer",fontFamily:f.body,fontSize:13 }}>
            {f.name} <span style={{ float:"right",fontFamily:f.mono,fontSize:11,opacity:0.5 }}>Aa 123</span>
          </button>
        ))}
      </div>
    </div>
    <div style={{ marginBottom:24 }}>
      <label style={lbl}>Font Size</label>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6 }}>
        {SIZES.map(sz => (
          <button key={sz.id} onClick={()=>onSettings({...settings,sizeId:sz.id})}
            style={{ padding:"10px 4px",borderRadius:10,border:settings.sizeId===sz.id?"2px solid var(--gold)":`1px solid ${th.bdr}`,background:settings.sizeId===sz.id?"rgba(240,194,122,0.08)":"transparent",color:th.text,cursor:"pointer",fontSize:11*sz.sc,fontFamily:"var(--fb)",fontWeight:600 }}>
            {sz.name}
          </button>
        ))}
      </div>
    </div>
  </>);
}

function ReportsPanel({ reports, onDel, th }) {
  if (!reports.length) return (
    <div style={{ textAlign:"center",padding:"40px 0",color:th.sub }}>
      <div style={{ fontSize:32,marginBottom:8 }}>📋</div>
      <p style={{ fontSize:13 }}>No saved reports yet.</p>
      <p style={{ fontSize:11,marginTop:4,opacity:0.6 }}>Calculate and tap "💾 Save as Report"</p>
    </div>
  );
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
      {reports.map(r => (
        <div key={r.id} style={{ background:th.card,borderRadius:12,padding:14,border:`1px solid ${th.bdr}` }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
            <span style={{ fontFamily:"var(--fd)",fontSize:14,fontWeight:700,color:"var(--gold)" }}>{r.monthName} {r.year}</span>
            <button onClick={()=>onDel(r.id)} style={{ background:"rgba(252,92,125,0.12)",border:"none",borderRadius:6,color:"var(--pink)",fontSize:11,cursor:"pointer",padding:"4px 8px" }}>Delete</button>
          </div>
          <div style={{ fontSize:11,color:th.sub,lineHeight:1.6 }}>
            <div>Daily: {r.daysInMonth}d × {r.dailyPackets}pkt × ₹{r.pricePerPacket}</div>
            {r.extraCost > 0 && <div>Extras: ₹{r.extraCost.toFixed(2)}</div>}
            {r.charges > 0 && <div>Charges: ₹{r.charges.toFixed(2)}</div>}
            {r.deductions > 0 && <div style={{ color:"var(--pink)" }}>Deductions: −₹{r.deductions.toFixed(2)}</div>}
          </div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8,paddingTop:8,borderTop:`1px solid ${th.bdr}` }}>
            <span style={{ fontSize:10,color:th.sub }}>{new Date(r.savedAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</span>
            <span style={{ fontFamily:"var(--fm)",fontSize:15,fontWeight:700,color:"var(--gold)" }}>₹{r.total.toFixed(2)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════ MAIN APP ═══════════════ */
export default function App() {
  const [settings, setSettings] = useState(() => load("milk_settings", { themeId:"midnight", fontId:"dm", sizeId:"m" }));
  const [reports, setReports] = useState(() => load("milk_reports", []));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dailyPackets, setDailyPackets] = useState(2);
  const [pricePerPacket, setPricePerPacket] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [serviceCharge, setServiceCharge] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [extraPurchases, setExtraPurchases] = useState([]);
  const [noMilkDays, setNoMilkDays] = useState([]);
  const [lowMilkDays, setLowMilkDays] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => { setTimeout(() => setReady(true), 80); }, []);
  useEffect(() => { save("milk_settings", settings); }, [settings]);
  useEffect(() => { save("milk_reports", reports); }, [reports]);

  const th = THEMES.find(t => t.id === settings.themeId) || THEMES[0];
  const ft = FONTS.find(f => f.id === settings.fontId) || FONTS[0];
  const sz = SIZES.find(s => s.id === settings.sizeId) || SIZES[1];

  const reset = () => { setShowResult(false); setSaved(false); };
  const prev = getPrevMonth(selectedMonth, selectedYear);
  const prevMName = MONTHS[prev.month];
  const prevY = prev.year;

  const addExtra = () => { setExtraPurchases(p => [...p, { id:Date.now(), packets:1, pricePerPacket:pricePerPacket||"", date:null }]); reset(); };
  const updateExtra = (id,f,v) => { setExtraPurchases(p => p.map(x => x.id===id?{...x,[f]:v}:x)); reset(); };
  const removeExtra = id => { setExtraPurchases(p => p.filter(x => x.id!==id)); reset(); };

  const addNoMilk = () => { setNoMilkDays(p => [...p, { id:Date.now(), packets:dailyPackets, pricePerPacket:pricePerPacket||"", date:null }]); reset(); };
  const updateNoMilk = (id,f,v) => { setNoMilkDays(p => p.map(x => x.id===id?{...x,[f]:v}:x)); reset(); };
  const removeNoMilk = id => { setNoMilkDays(p => p.filter(x => x.id!==id)); reset(); };

  const addLowMilk = () => { setLowMilkDays(p => [...p, { id:Date.now(), actualPackets:dailyPackets>1?dailyPackets-1:0, orderedPackets:dailyPackets, pricePerPacket:pricePerPacket||"", date:null }]); reset(); };
  const updateLowMilk = (id,f,v) => { setLowMilkDays(p => p.map(x => x.id===id?{...x,[f]:v}:x)); reset(); };
  const removeLowMilk = id => { setLowMilkDays(p => p.filter(x => x.id!==id)); reset(); };

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const price = parseFloat(pricePerPacket) || 0;
  const baseCost = daysInMonth * dailyPackets * price;
  const extraCost = extraPurchases.reduce((s,p) => s + p.packets * (parseFloat(p.pricePerPacket)||0), 0);
  const svc = parseFloat(serviceCharge) || 0;
  const dlv = parseFloat(deliveryCharge) || 0;
  const noMilkCredit = noMilkDays.reduce((s,d) => s + d.packets * (parseFloat(d.pricePerPacket)||0), 0);
  const lowMilkCredit = lowMilkDays.reduce((s,d) => { const df=d.orderedPackets-d.actualPackets; return s+(df>0?df:0)*(parseFloat(d.pricePerPacket)||0); }, 0);
  const totalDed = noMilkCredit + lowMilkCredit;
  const subtotal = baseCost + extraCost + svc + dlv;
  const total = subtotal - totalDed;
  const totalPkts = daysInMonth * dailyPackets + extraPurchases.reduce((s,p) => s+p.packets, 0);

  const saveReport = () => {
    const r = { id:Date.now(), monthName:MONTHS[selectedMonth], month:selectedMonth, year:selectedYear, daysInMonth, dailyPackets, pricePerPacket:price.toFixed(2), baseCost, extraCost, charges:svc+dlv, deductions:totalDed, subtotal, total, totalPackets:totalPkts, savedAt:new Date().toISOString() };
    setReports(prev => { const f = prev.filter(x => !(x.month===selectedMonth && x.year===selectedYear)); return [r,...f]; });
    setSaved(true);
  };

  const st = {
    card: { background:th.card, borderRadius:20, padding:20, border:`1px solid ${th.bdr}`, marginBottom:16 },
    sTitle: { fontSize:`calc(13px * ${sz.sc})`, color:"var(--gold)", margin:"0 0 14px", fontWeight:600, display:"flex", alignItems:"center", gap:8 },
    label: { display:"block", color:th.sub, fontSize:`calc(11px * ${sz.sc})`, marginBottom:6, fontFamily:"var(--fb)", textTransform:"uppercase", letterSpacing:1.2 },
    input: { width:"100%", padding:"11px 12px", background:th.inp, border:`1px solid ${th.inpB}`, borderRadius:10, color:th.text, fontSize:`calc(14px * ${sz.sc})`, fontFamily:"var(--fm)", outline:"none", boxSizing:"border-box" },
    select: { width:"100%", padding:"11px 12px", background:th.inp, border:`1px solid ${th.inpB}`, borderRadius:10, color:th.text, fontSize:`calc(14px * ${sz.sc})`, fontFamily:"var(--fm)", outline:"none", boxSizing:"border-box", appearance:"none", cursor:"pointer", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%23f0c27a'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center" },
    hint: { marginTop:10, padding:"9px 12px", background:"rgba(240,194,122,0.07)", borderRadius:8, fontSize:`calc(12px * ${sz.sc})`, color:"var(--gold)" },
    addBtn: { background:"linear-gradient(135deg,var(--gold),var(--pink))", border:"none", borderRadius:8, color:"#fff", fontWeight:700, fontSize:`calc(13px * ${sz.sc})`, padding:"7px 16px", cursor:"pointer", fontFamily:"var(--fb)" },
    addBtnR: { background:"linear-gradient(135deg,var(--pink),#e44d6e)", border:"none", borderRadius:8, color:"#fff", fontWeight:700, fontSize:`calc(13px * ${sz.sc})`, padding:"7px 16px", cursor:"pointer", fontFamily:"var(--fb)" },
    rmBtn: { background:"rgba(252,92,125,0.12)", border:"none", borderRadius:6, color:"var(--pink)", fontSize:13, cursor:"pointer", width:26, height:26, display:"flex", alignItems:"center", justifyContent:"center" },
  };
  const dedCard = { ...st.card, background:th.light?"rgba(220,60,90,0.06)":"rgba(252,92,125,0.03)", border:th.light?"1px solid rgba(220,60,90,0.15)":"1px solid rgba(252,92,125,0.10)" };

  return (
    <div style={{ minHeight:"100vh", fontFamily:"var(--fb)", color:th.text, maxWidth:480, margin:"0 auto", position:"relative", overflow:"hidden", background:th.bg, fontSize:`calc(14px * ${sz.sc})` }}>
      <link href={ft.url} rel="stylesheet" />
      <style>{`:root{--fb:${ft.body};--fm:${ft.mono};--fd:${ft.disp};--gold:${th.light?"#c4903a":"#f0c27a"};--pink:${th.light?"#d94468":"#fc5c7d"};--text:${th.text};--sub:${th.sub};--inp:${th.inp};--inpB:${th.inpB};--sc:${sz.sc}}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} settings={settings} onSettings={setSettings} reports={reports} onDelReport={id => setReports(p => p.filter(r => r.id !== id))} th={th} />

      <div style={{ position:"absolute",top:-70,right:-70,width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(240,194,122,0.10) 0%,transparent 70%)",pointerEvents:"none" }}/>

      {/* ── Header with hamburger ── */}
      <header style={{ padding:"20px 18px 16px",display:"flex",alignItems:"center",gap:14, opacity:ready?1:0,transform:ready?"translateY(0)":"translateY(-16px)",transition:"all 0.5s cubic-bezier(.16,1,.3,1)" }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background:"none",border:"none",cursor:"pointer",padding:6,display:"flex",flexDirection:"column",gap:4 }}>
          <span style={{ display:"block",width:22,height:2,background:"var(--gold)",borderRadius:2 }}/>
          <span style={{ display:"block",width:16,height:2,background:"var(--gold)",borderRadius:2 }}/>
          <span style={{ display:"block",width:22,height:2,background:"var(--gold)",borderRadius:2 }}/>
        </button>
        <div style={{ flex:1,textAlign:"center" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
            <span style={{ fontSize:30,filter:"drop-shadow(0 4px 12px rgba(240,194,122,0.3))" }}>🥛</span>
            <h1 style={{ fontFamily:"var(--fd)",fontSize:`calc(24px * ${sz.sc})`,fontWeight:800,background:"linear-gradient(135deg,var(--gold),var(--pink))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",margin:0 }}>Milk Expense</h1>
          </div>
          <p style={{ color:th.sub,fontSize:`calc(11px * ${sz.sc})`,marginTop:3,letterSpacing:3,textTransform:"uppercase" }}>Monthly Calculator</p>
        </div>
        <div style={{ width:34 }}/>
      </header>

      <main style={{ padding:"0 18px 120px", opacity:ready?1:0,transform:ready?"translateY(0)":"translateY(16px)",transition:"all 0.7s cubic-bezier(.16,1,.3,1) 0.15s" }}>

        {/* 1. Period */}
        <section style={st.card}>
          <h3 style={st.sTitle}><Badge n={1}/> Select Period</h3>
          <div style={{ display:"flex",gap:10 }}>
            <div style={{ flex:2 }}>
              <label style={st.label}>Month</label>
              <select value={selectedMonth} onChange={e=>{setSelectedMonth(+e.target.value);reset();}} style={st.select}>
                {MONTHS.map((m,i)=><option key={m} value={i} style={{background:th.cal}}>{m}</option>)}
              </select>
            </div>
            <div style={{ flex:1 }}>
              <label style={st.label}>Year</label>
              <select value={selectedYear} onChange={e=>{setSelectedYear(+e.target.value);reset();}} style={st.select}>
                {YEARS.map(y=><option key={y} value={y} style={{background:th.cal}}>{y}</option>)}
              </select>
            </div>
          </div>
          <div style={st.hint}>📆 {MONTHS[selectedMonth]} {selectedYear} — <strong>{daysInMonth} days</strong></div>
        </section>

        {/* 2. Daily Milk */}
        <section style={st.card}>
          <h3 style={st.sTitle}><Badge n={2}/> Daily Milk Order</h3>
          <div style={{ display:"flex",gap:14,alignItems:"flex-end" }}>
            <div style={{ flex:1 }}>
              <label style={st.label}>Packets / Day</label>
              <Stepper value={dailyPackets} onChange={v=>{setDailyPackets(v);reset();}} min={1} max={20}/>
            </div>
            <div style={{ flex:1 }}>
              <label style={st.label}>Price / Packet (₹)</label>
              <input type="number" inputMode="decimal" value={pricePerPacket} onChange={e=>{setPricePerPacket(e.target.value);reset();}} placeholder="0.00" style={st.input} min="0" step="0.5"/>
            </div>
          </div>
          {price>0 && <div style={{...st.hint,background:"rgba(255,255,255,0.02)",color:th.sub}}>{daysInMonth}d × {dailyPackets}pkt × ₹{price.toFixed(2)} = <span style={{color:th.text,fontWeight:600,fontFamily:"var(--fm)"}}>₹{baseCost.toFixed(2)}</span></div>}
        </section>

        {/* 3. Additional Charges */}
        <section style={st.card}>
          <h3 style={st.sTitle}><Badge n={3}/> Additional Charges</h3>
          <div style={{ display:"flex",gap:10 }}>
            <div style={{ flex:1 }}><label style={st.label}>Service Charge (₹)</label><input type="number" inputMode="decimal" value={serviceCharge} onChange={e=>{setServiceCharge(e.target.value);reset();}} placeholder="0.00" style={st.input} min="0"/></div>
            <div style={{ flex:1 }}><label style={st.label}>Delivery Charge (₹)</label><input type="number" inputMode="decimal" value={deliveryCharge} onChange={e=>{setDeliveryCharge(e.target.value);reset();}} placeholder="0.00" style={st.input} min="0"/></div>
          </div>
        </section>

        {/* 4. Extra Purchases */}
        <section style={st.card}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <h3 style={{...st.sTitle,marginBottom:0}}><Badge n={4}/> Extra Purchases</h3>
            <button onClick={addExtra} style={st.addBtn}>+ Add</button>
          </div>
          {!extraPurchases.length && <p style={{textAlign:"center",padding:"18px 0 8px",color:th.sub,fontSize:`calc(14px * ${sz.sc})`}}>Tap <strong style={{color:"var(--gold)"}}>+ Add</strong> for extra purchases</p>}
          {extraPurchases.map((ep,idx) => (
            <div key={ep.id} style={{background:"rgba(255,255,255,0.025)",borderRadius:14,padding:14,marginBottom:10,border:`1px solid ${th.bdr}`,animation:"slideIn 0.3s ease-out"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontSize:`calc(13px * ${sz.sc})`,color:"var(--gold)",fontWeight:600}}>Purchase #{idx+1}</span>
                <button onClick={()=>removeExtra(ep.id)} style={st.rmBtn}>✕</button>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <div style={{flex:1}}><label style={{...st.label,fontSize:`calc(11px * ${sz.sc})`}}>Packets</label><Stepper value={ep.packets} onChange={v=>updateExtra(ep.id,"packets",v)} min={1}/></div>
                <div style={{flex:1}}><label style={{...st.label,fontSize:`calc(11px * ${sz.sc})`}}>Price/Pkt (₹)</label><input type="number" inputMode="decimal" value={ep.pricePerPacket} onChange={e=>updateExtra(ep.id,"pricePerPacket",e.target.value)} placeholder="0.00" style={{...st.input,fontSize:13,padding:"9px 10px"}}/></div>
              </div>
              <DPick label="Date of Purchase" value={ep.date} onChange={d=>updateExtra(ep.id,"date",d)} th={th} st={st}/>
              {(parseFloat(ep.pricePerPacket)||0)>0 && <div style={{marginTop:8,fontSize:`calc(13px * ${sz.sc})`,color:th.sub,fontFamily:"var(--fm)"}}>Subtotal: ₹{(ep.packets*(parseFloat(ep.pricePerPacket)||0)).toFixed(2)}</div>}
            </div>
          ))}
        </section>

        {/* Deductions divider */}
        <div style={{textAlign:"center",margin:"8px 0 16px",position:"relative"}}>
          <div style={{position:"absolute",top:"50%",left:0,right:0,height:1,background:"rgba(252,92,125,0.2)"}}/>
          <span style={{position:"relative",background:th.div,padding:"4px 16px",fontSize:`calc(12px * ${sz.sc})`,color:"var(--pink)",textTransform:"uppercase",letterSpacing:2,fontWeight:600}}>Last Month Deductions ({prevMName} {prevY})</span>
        </div>

        {/* 5. No Milk Days */}
        <section style={dedCard}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <h3 style={{...st.sTitle,marginBottom:0,color:"var(--pink)"}}><Badge n={5} color="red"/> No Milk Days</h3>
            <button onClick={addNoMilk} style={st.addBtnR}>+ Add</button>
          </div>
          <p style={{fontSize:`calc(13px * ${sz.sc})`,color:th.sub,marginBottom:14,lineHeight:1.5}}>Days in <strong style={{color:th.text}}>{prevMName}</strong> when milk was NOT delivered but already paid.</p>
          {!noMilkDays.length && <p style={{textAlign:"center",padding:"12px 0 4px",color:th.sub,fontSize:`calc(14px * ${sz.sc})`}}>No entries — tap <strong style={{color:"var(--pink)"}}>+ Add</strong> if applicable</p>}
          {noMilkDays.map((nd,idx) => (
            <div key={nd.id} style={{background:"rgba(252,92,125,0.04)",borderRadius:14,padding:14,marginBottom:10,border:"1px solid rgba(252,92,125,0.08)",animation:"slideIn 0.3s ease-out"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontSize:`calc(13px * ${sz.sc})`,color:"var(--pink)",fontWeight:600}}>🚫 No Milk #{idx+1}</span>
                <button onClick={()=>removeNoMilk(nd.id)} style={st.rmBtn}>✕</button>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <div style={{flex:1}}><label style={{...st.label,fontSize:`calc(11px * ${sz.sc})`}}>Packets</label><Stepper value={nd.packets} onChange={v=>updateNoMilk(nd.id,"packets",v)} min={1} max={20}/></div>
                <div style={{flex:1}}><label style={{...st.label,fontSize:`calc(11px * ${sz.sc})`}}>Price/Pkt (₹)</label><input type="number" inputMode="decimal" value={nd.pricePerPacket} onChange={e=>updateNoMilk(nd.id,"pricePerPacket",e.target.value)} placeholder="0.00" style={{...st.input,fontSize:13,padding:"9px 10px"}}/></div>
              </div>
              <DPick label={`Date (${prevMName} ${prevY})`} value={nd.date} onChange={d=>updateNoMilk(nd.id,"date",d)} initialMonth={prev.month} initialYear={prevY} th={th} st={st}/>
              {(parseFloat(nd.pricePerPacket)||0)>0 && <div style={{marginTop:8,fontSize:`calc(13px * ${sz.sc})`,color:"var(--pink)",fontFamily:"var(--fm)"}}>Credit: −₹{(nd.packets*(parseFloat(nd.pricePerPacket)||0)).toFixed(2)}</div>}
            </div>
          ))}
          {noMilkCredit>0 && <div style={{padding:"8px 12px",background:"rgba(252,92,125,0.06)",borderRadius:8,fontSize:`calc(14px * ${sz.sc})`,color:"var(--pink)",marginTop:4}}>Total No-Milk Credit: <strong style={{fontFamily:"var(--fm)"}}>−₹{noMilkCredit.toFixed(2)}</strong></div>}
        </section>

        {/* 6. Low Milk Days */}
        <section style={dedCard}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <h3 style={{...st.sTitle,marginBottom:0,color:"var(--pink)"}}><Badge n={6} color="red"/> Low Milk Days</h3>
            <button onClick={addLowMilk} style={st.addBtnR}>+ Add</button>
          </div>
          <p style={{fontSize:`calc(13px * ${sz.sc})`,color:th.sub,marginBottom:14,lineHeight:1.5}}>Days in <strong style={{color:th.text}}>{prevMName}</strong> when fewer packets were delivered than ordered. The difference is deducted.</p>
          {!lowMilkDays.length && <p style={{textAlign:"center",padding:"12px 0 4px",color:th.sub,fontSize:`calc(14px * ${sz.sc})`}}>No entries — tap <strong style={{color:"var(--pink)"}}>+ Add</strong> if applicable</p>}
          {lowMilkDays.map((ld,idx) => (
            <div key={ld.id} style={{background:"rgba(252,92,125,0.04)",borderRadius:14,padding:14,marginBottom:10,border:"1px solid rgba(252,92,125,0.08)",animation:"slideIn 0.3s ease-out"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontSize:`calc(13px * ${sz.sc})`,color:"var(--pink)",fontWeight:600}}>📉 Low Milk #{idx+1}</span>
                <button onClick={()=>removeLowMilk(ld.id)} style={st.rmBtn}>✕</button>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <div style={{flex:1}}><label style={{...st.label,fontSize:`calc(11px * ${sz.sc})`}}>Ordered (Pkts)</label><Stepper value={ld.orderedPackets} onChange={v=>{updateLowMilk(ld.id,"orderedPackets",v);if(ld.actualPackets>=v)updateLowMilk(ld.id,"actualPackets",Math.max(0,v-1));}} min={1} max={20}/></div>
                <div style={{flex:1}}><label style={{...st.label,fontSize:`calc(11px * ${sz.sc})`}}>Actually Got</label><Stepper value={ld.actualPackets} onChange={v=>updateLowMilk(ld.id,"actualPackets",v)} min={0} max={Math.max(0,ld.orderedPackets-1)}/></div>
              </div>
              <div style={{marginBottom:10}}><label style={{...st.label,fontSize:`calc(11px * ${sz.sc})`}}>Price/Pkt (₹)</label><input type="number" inputMode="decimal" value={ld.pricePerPacket} onChange={e=>updateLowMilk(ld.id,"pricePerPacket",e.target.value)} placeholder="0.00" style={{...st.input,fontSize:13,padding:"9px 10px"}}/></div>
              <DPick label={`Date (${prevMName} ${prevY})`} value={ld.date} onChange={d=>updateLowMilk(ld.id,"date",d)} initialMonth={prev.month} initialYear={prevY} th={th} st={st}/>
              {(parseFloat(ld.pricePerPacket)||0)>0 && (ld.orderedPackets-ld.actualPackets)>0 && <div style={{marginTop:8,fontSize:`calc(13px * ${sz.sc})`,color:"var(--pink)",fontFamily:"var(--fm)"}}>Diff: {ld.orderedPackets}−{ld.actualPackets}={ld.orderedPackets-ld.actualPackets}pkt → Credit: −₹{((ld.orderedPackets-ld.actualPackets)*(parseFloat(ld.pricePerPacket)||0)).toFixed(2)}</div>}
            </div>
          ))}
          {lowMilkCredit>0 && <div style={{padding:"8px 12px",background:"rgba(252,92,125,0.06)",borderRadius:8,fontSize:`calc(14px * ${sz.sc})`,color:"var(--pink)",marginTop:4}}>Total Low-Milk Credit: <strong style={{fontFamily:"var(--fm)"}}>−₹{lowMilkCredit.toFixed(2)}</strong></div>}
        </section>

        {/* Calculate */}
        <button onClick={()=>setShowResult(true)} style={{width:"100%",padding:"16px",border:"none",borderRadius:14,cursor:"pointer",background:"linear-gradient(135deg,var(--gold) 0%,var(--pink) 100%)",color:"#fff",fontSize:`calc(16px * ${sz.sc})`,fontWeight:700,fontFamily:"var(--fb)",letterSpacing:0.5,boxShadow:"0 8px 32px rgba(240,194,122,0.22)",marginBottom:18}}>
          Calculate Total
        </button>

        {/* Result */}
        {showResult && (
          <section style={{background:"linear-gradient(160deg,rgba(240,194,122,0.08) 0%,rgba(252,92,125,0.06) 100%)",borderRadius:22,padding:24,border:"1px solid rgba(240,194,122,0.18)",animation:"fadeUp 0.45s ease-out"}}>
            <h3 style={{fontFamily:"var(--fd)",fontSize:`calc(19px * ${sz.sc})`,color:"var(--gold)",margin:"0 0 4px",textAlign:"center"}}>💰 Bill Summary</h3>
            <p style={{fontSize:`calc(12px * ${sz.sc})`,textTransform:"uppercase",letterSpacing:2,color:th.sub,textAlign:"center",marginBottom:16}}>{MONTHS[selectedMonth]} {selectedYear}</p>

            <div style={{borderBottom:`1px solid ${th.bdr}`,paddingBottom:14,marginBottom:10}}>
              <div style={{fontSize:`calc(11px * ${sz.sc})`,textTransform:"uppercase",letterSpacing:1.5,color:th.sub,marginBottom:8,fontWeight:600}}>Current Month Charges</div>
              <Row label={`Daily Milk (${daysInMonth}d × ${dailyPackets}pkt × ₹${price.toFixed(2)})`} amount={baseCost}/>
              {extraPurchases.map((ep,i) => <Row key={ep.id} label={`Extra #${i+1} (${ep.packets}pkt${ep.date?` · ${ep.date.toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}`:""})` } amount={ep.packets*(parseFloat(ep.pricePerPacket)||0)} sub/>)}
              {svc>0 && <Row label="Service Charge" amount={svc} sub/>}
              {dlv>0 && <Row label="Delivery Charge" amount={dlv} sub/>}
              <div style={{display:"flex",justifyContent:"space-between",marginTop:6,paddingTop:6,borderTop:`1px dashed ${th.bdr}`}}>
                <span style={{fontSize:`calc(13px * ${sz.sc})`,color:th.text,fontWeight:600,opacity:0.8}}>Subtotal</span>
                <span style={{fontFamily:"var(--fm)",color:th.text,fontSize:`calc(14px * ${sz.sc})`,fontWeight:600}}>₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            {totalDed>0 && (
              <div style={{borderBottom:`1px solid ${th.bdr}`,paddingBottom:14,marginBottom:14}}>
                <div style={{fontSize:`calc(11px * ${sz.sc})`,textTransform:"uppercase",letterSpacing:1.5,color:"var(--pink)",marginBottom:8,fontWeight:600}}>Last Month Deductions ({prevMName})</div>
                {noMilkDays.map((nd,i) => <Row key={nd.id} label={`🚫 No Milk #${i+1} (${nd.packets}pkt${nd.date?` · ${nd.date.toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}`:""})` } amount={-(nd.packets*(parseFloat(nd.pricePerPacket)||0))} sub neg/>)}
                {lowMilkDays.map((ld,i) => { const df=ld.orderedPackets-ld.actualPackets; return df>0?<Row key={ld.id} label={`📉 Low #${i+1} (${df}pkt diff${ld.date?` · ${ld.date.toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}`:""})` } amount={-(df*(parseFloat(ld.pricePerPacket)||0))} sub neg/>:null; })}
                <div style={{display:"flex",justifyContent:"space-between",marginTop:6,paddingTop:6,borderTop:"1px dashed rgba(252,92,125,0.15)"}}>
                  <span style={{fontSize:`calc(13px * ${sz.sc})`,color:"var(--pink)",fontWeight:600}}>Total Deduction</span>
                  <span style={{fontFamily:"var(--fm)",color:"var(--pink)",fontSize:`calc(14px * ${sz.sc})`,fontWeight:600}}>−₹{totalDed.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <span style={{fontSize:`calc(14px * ${sz.sc})`,fontWeight:600,color:"var(--gold)",display:"block"}}>Amount to Pay</span>
                <span style={{fontSize:`calc(11px * ${sz.sc})`,color:th.sub}}>{MONTHS[selectedMonth]} {selectedYear}</span>
              </div>
              <span style={{fontFamily:"var(--fd)",fontSize:`calc(30px * ${sz.sc})`,fontWeight:800,background:"linear-gradient(135deg,var(--gold),var(--pink))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>₹{total.toFixed(2)}</span>
            </div>

            <div style={{marginTop:14,padding:"10px 14px",background:th.card,borderRadius:10,fontSize:`calc(12px * ${sz.sc})`,color:th.sub,lineHeight:1.7}}>
              <strong style={{color:th.text,opacity:0.7}}>Packets:</strong> {totalPkts} | <strong style={{color:th.text,opacity:0.7}}>Daily:</strong> {daysInMonth*dailyPackets} | <strong style={{color:th.text,opacity:0.7}}>Extra:</strong> {extraPurchases.reduce((s,p)=>s+p.packets,0)}
              {totalDed>0 && <><br/><strong style={{color:"var(--pink)"}}>Credits:</strong> No-Milk: {noMilkDays.reduce((s,d)=>s+d.packets,0)}pkt | Low-Milk: {lowMilkDays.reduce((s,d)=>s+Math.max(0,d.orderedPackets-d.actualPackets),0)}pkt diff</>}
            </div>

            {/* Save Report Button */}
            <button onClick={saveReport} disabled={saved} style={{width:"100%",marginTop:16,padding:"12px",border:"none",borderRadius:10,cursor:saved?"default":"pointer",background:saved?"rgba(100,200,100,0.15)":"rgba(240,194,122,0.12)",color:saved?"#6ddc6d":"var(--gold)",fontSize:`calc(14px * ${sz.sc})`,fontWeight:600,fontFamily:"var(--fb)",transition:"all 0.3s"}}>
              {saved ? "✅ Report Saved!" : "💾 Save as Report"}
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
