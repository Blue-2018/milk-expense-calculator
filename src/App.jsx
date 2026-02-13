import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Constants ─── */
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

/* ─── Calendar Popup ─── */
function Calendar({ selectedDate, onSelect, onClose }) {
  const [viewMonth, setViewMonth] = useState(
    selectedDate ? selectedDate.getMonth() : new Date().getMonth()
  );
  const [viewYear, setViewYear] = useState(
    selectedDate ? selectedDate.getFullYear() : new Date().getFullYear()
  );
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [onClose]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const daysInMonth = getDaysInMonth(viewMonth, viewYear);
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  const isSelected = (d) =>
    selectedDate && d &&
    selectedDate.getDate() === d &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getFullYear() === viewYear;

  const isToday = (d) => {
    const t = new Date();
    return d === t.getDate() && viewMonth === t.getMonth() && viewYear === t.getFullYear();
  };

  return (
    <div ref={ref} style={{
      position: "absolute", top: "100%", left: 0, right: 0, zIndex: 999,
      background: "#12122a", border: "1px solid #2a2a4a", borderRadius: 16,
      padding: 16, boxShadow: "0 20px 50px rgba(0,0,0,0.6)", marginTop: 4
    }}>
      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button onClick={prevMonth} style={calNavBtn}>‹</button>
        <span style={{ color: "#e0e0e0", fontWeight: 600, fontFamily: "var(--font-body)", fontSize: 14 }}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} style={calNavBtn}>›</button>
      </div>
      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, textAlign: "center" }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} style={{ color: "#555", fontSize: 10, padding: 4, fontFamily: "var(--font-body)", fontWeight: 600 }}>{d}</div>
        ))}
        {cells.map((d, i) => (
          <button key={i} disabled={!d}
            onClick={() => { if (d) { onSelect(new Date(viewYear, viewMonth, d)); onClose(); } }}
            style={{
              background: isSelected(d)
                ? "linear-gradient(135deg, #f0c27a, #fc5c7d)"
                : isToday(d) ? "rgba(240,194,122,0.12)" : "transparent",
              border: "none", borderRadius: 8, padding: "7px 0", cursor: d ? "pointer" : "default",
              color: isSelected(d) ? "#0f0c29" : d ? "#d0d0d0" : "transparent",
              fontWeight: isSelected(d) ? 700 : 400, fontSize: 13,
              fontFamily: "var(--font-mono)", transition: "all 0.15s"
            }}>
            {d || "."}
          </button>
        ))}
      </div>
    </div>
  );
}
const calNavBtn = {
  background: "none", border: "none", color: "#f0c27a", fontSize: 22,
  cursor: "pointer", padding: "2px 10px", lineHeight: 1
};

/* ─── DatePicker Input ─── */
function DatePickerInput({ value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen(o => !o), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div style={{ position: "relative", flex: 1 }}>
      {label && <label style={styles.label}>{label}</label>}
      <button onClick={toggle} style={{
        ...styles.input, cursor: "pointer", textAlign: "left",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        color: value ? "#e0e0e0" : "#555", fontFamily: "var(--font-mono)", fontSize: 13
      }}>
        <span>{value ? value.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Pick a date"}</span>
        <span style={{ opacity: 0.5, fontSize: 16 }}>📅</span>
      </button>
      {open && <Calendar selectedDate={value} onSelect={onChange} onClose={close} />}
    </div>
  );
}

/* ─── Stepper (−/+) ─── */
function Stepper({ value, onChange, min = 0, max = 99 }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", background: "rgba(255,255,255,0.04)",
      borderRadius: 10, border: "1px solid #2a2a4a", overflow: "hidden"
    }}>
      <button onClick={() => onChange(Math.max(min, value - 1))} style={stepBtn}>−</button>
      <span style={{
        minWidth: 30, textAlign: "center", color: "#fff", fontWeight: 700,
        fontSize: 16, fontFamily: "var(--font-mono)"
      }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} style={stepBtn}>+</button>
    </div>
  );
}
const stepBtn = {
  width: 40, height: 40, background: "none", border: "none",
  color: "#f0c27a", fontSize: 20, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700
};

/* ─── Section Badge ─── */
function Badge({ n }) {
  return (
    <span style={{
      width: 22, height: 22, borderRadius: 7,
      background: "rgba(240,194,122,0.14)", display: "inline-flex",
      alignItems: "center", justifyContent: "center", fontSize: 11,
      color: "#f0c27a", fontWeight: 700, fontFamily: "var(--font-mono)"
    }}>{n}</span>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━ MAIN APP ━━━━━━━━━━━━━━━━━━━━ */
export default function App() {
  const [dailyPackets, setDailyPackets] = useState(2);
  const [pricePerPacket, setPricePerPacket] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [serviceCharge, setServiceCharge] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [extraPurchases, setExtraPurchases] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => { setTimeout(() => setReady(true), 80); }, []);

  const reset = () => setShowResult(false);

  const addExtra = () => {
    setExtraPurchases(prev => [...prev, {
      id: Date.now(), packets: 1,
      pricePerPacket: pricePerPacket || "", date: null
    }]);
    reset();
  };

  const updateExtra = (id, field, val) => {
    setExtraPurchases(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
    reset();
  };

  const removeExtra = (id) => {
    setExtraPurchases(prev => prev.filter(p => p.id !== id));
    reset();
  };

  /* ─── Calculations ─── */
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const price = parseFloat(pricePerPacket) || 0;
  const baseCost = daysInMonth * dailyPackets * price;
  const extraCost = extraPurchases.reduce((s, p) => s + p.packets * (parseFloat(p.pricePerPacket) || 0), 0);
  const svc = parseFloat(serviceCharge) || 0;
  const dlv = parseFloat(deliveryCharge) || 0;
  const total = baseCost + extraCost + svc + dlv;
  const totalPackets = daysInMonth * dailyPackets + extraPurchases.reduce((s, p) => s + p.packets, 0);

  return (
    <div style={{
      minHeight: "100vh", fontFamily: "var(--font-body)", color: "#e0e0e0",
      maxWidth: 480, margin: "0 auto", position: "relative", overflow: "hidden",
      background: "linear-gradient(165deg, #0f0c29 0%, #1a1a2e 45%, #16213e 100%)"
    }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        :root {
          --font-body: 'DM Sans', sans-serif;
          --font-mono: 'Space Mono', monospace;
          --font-display: 'Playfair Display', serif;
          --gold: #f0c27a;
          --pink: #fc5c7d;
          --bg-card: rgba(255,255,255,0.025);
          --border: rgba(255,255,255,0.06);
        }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100% { transform:scale(1) } 50% { transform:scale(1.04) } }
      `}</style>

      {/* Decorative orbs */}
      <div style={{ position:"absolute",top:-70,right:-70,width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(240,194,122,0.10) 0%,transparent 70%)",pointerEvents:"none" }}/>
      <div style={{ position:"absolute",top:350,left:-90,width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,rgba(252,92,125,0.06) 0%,transparent 70%)",pointerEvents:"none" }}/>

      {/* ── Header ── */}
      <header style={{
        padding: "48px 24px 16px", textAlign: "center",
        opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(-16px)",
        transition: "all 0.5s cubic-bezier(.16,1,.3,1)"
      }}>
        <div style={{ fontSize: 44, marginBottom: 6, filter: "drop-shadow(0 4px 12px rgba(240,194,122,0.3))" }}>🥛</div>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800,
          background: "linear-gradient(135deg, var(--gold), var(--pink))",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          margin: 0, letterSpacing: -0.5
        }}>Milk Expense</h1>
        <p style={{ color: "#555", fontSize: 11, marginTop: 5, letterSpacing: 3, textTransform: "uppercase" }}>Monthly Calculator</p>
      </header>

      {/* ── Body ── */}
      <main style={{
        padding: "0 18px 120px",
        opacity: ready ? 1 : 0, transform: ready ? "translateY(0)" : "translateY(16px)",
        transition: "all 0.7s cubic-bezier(.16,1,.3,1) 0.15s"
      }}>

        {/* ── 1. Period ── */}
        <section style={styles.card}>
          <h3 style={styles.sectionTitle}><Badge n={1} /> Select Period</h3>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 2 }}>
              <label style={styles.label}>Month</label>
              <select value={selectedMonth} onChange={e => { setSelectedMonth(+e.target.value); reset(); }} style={styles.select}>
                {MONTHS.map((m, i) => <option key={m} value={i} style={{ background: "#1a1a2e" }}>{m}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Year</label>
              <select value={selectedYear} onChange={e => { setSelectedYear(+e.target.value); reset(); }} style={styles.select}>
                {YEARS.map(y => <option key={y} value={y} style={{ background: "#1a1a2e" }}>{y}</option>)}
              </select>
            </div>
          </div>
          <div style={styles.hint}>
            📆&ensp;{MONTHS[selectedMonth]} {selectedYear} — <strong>{daysInMonth} days</strong>
          </div>
        </section>

        {/* ── 2. Daily Milk ── */}
        <section style={styles.card}>
          <h3 style={styles.sectionTitle}><Badge n={2} /> Daily Milk Order</h3>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Packets / Day</label>
              <Stepper value={dailyPackets} onChange={v => { setDailyPackets(v); reset(); }} min={1} max={20} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Price / Packet (₹)</label>
              <input type="number" inputMode="decimal" value={pricePerPacket}
                onChange={e => { setPricePerPacket(e.target.value); reset(); }}
                placeholder="0.00" style={styles.input} min="0" step="0.5" />
            </div>
          </div>
          {price > 0 && (
            <div style={{ ...styles.hint, background: "rgba(255,255,255,0.02)", color: "#888" }}>
              {daysInMonth} days × {dailyPackets} pkt × ₹{price.toFixed(2)} ={" "}
              <span style={{ color: "#e0e0e0", fontWeight: 600, fontFamily: "var(--font-mono)" }}>₹{baseCost.toFixed(2)}</span>
            </div>
          )}
        </section>

        {/* ── 3. Extra Charges ── */}
        <section style={styles.card}>
          <h3 style={styles.sectionTitle}><Badge n={3} /> Additional Charges</h3>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Service Charge (₹)</label>
              <input type="number" inputMode="decimal" value={serviceCharge}
                onChange={e => { setServiceCharge(e.target.value); reset(); }}
                placeholder="0.00" style={styles.input} min="0" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Delivery Charge (₹)</label>
              <input type="number" inputMode="decimal" value={deliveryCharge}
                onChange={e => { setDeliveryCharge(e.target.value); reset(); }}
                placeholder="0.00" style={styles.input} min="0" />
            </div>
          </div>
        </section>

        {/* ── 4. Extra Purchases ── */}
        <section style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ ...styles.sectionTitle, marginBottom: 0 }}><Badge n={4} /> Extra Purchases</h3>
            <button onClick={addExtra} style={styles.addBtn}>+ Add</button>
          </div>

          {extraPurchases.length === 0 && (
            <p style={{ textAlign: "center", padding: "18px 0 8px", color: "#444", fontSize: 13 }}>
              Tap <strong style={{ color: "#f0c27a" }}>+ Add</strong> for extra milk purchases
            </p>
          )}

          {extraPurchases.map((ep, idx) => (
            <div key={ep.id} style={{
              background: "rgba(255,255,255,0.025)", borderRadius: 14, padding: 14,
              marginBottom: 10, border: "1px solid rgba(255,255,255,0.04)",
              animation: "slideIn 0.3s ease-out"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#f0c27a", fontWeight: 600 }}>Purchase #{idx + 1}</span>
                <button onClick={() => removeExtra(ep.id)} style={styles.removeBtn}>✕</button>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...styles.label, fontSize: 10 }}>Packets</label>
                  <Stepper value={ep.packets} onChange={v => updateExtra(ep.id, "packets", v)} min={1} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ ...styles.label, fontSize: 10 }}>Price / Pkt (₹)</label>
                  <input type="number" inputMode="decimal" value={ep.pricePerPacket}
                    onChange={e => updateExtra(ep.id, "pricePerPacket", e.target.value)}
                    placeholder="0.00" style={{ ...styles.input, fontSize: 13, padding: "9px 10px" }} />
                </div>
              </div>
              <DatePickerInput label="Date of Purchase" value={ep.date} onChange={d => updateExtra(ep.id, "date", d)} />
              {(parseFloat(ep.pricePerPacket) || 0) > 0 && (
                <div style={{ marginTop: 8, fontSize: 11, color: "#777", fontFamily: "var(--font-mono)" }}>
                  Subtotal: ₹{(ep.packets * (parseFloat(ep.pricePerPacket) || 0)).toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </section>

        {/* ── Calculate Button ── */}
        <button onClick={() => setShowResult(true)} style={styles.calcBtn}>
          Calculate Total
        </button>

        {/* ── Result ── */}
        {showResult && (
          <section style={{
            background: "linear-gradient(160deg, rgba(240,194,122,0.08) 0%, rgba(252,92,125,0.06) 100%)",
            borderRadius: 22, padding: 24, border: "1px solid rgba(240,194,122,0.18)",
            animation: "fadeUp 0.45s ease-out"
          }}>
            <h3 style={{
              fontFamily: "var(--font-display)", fontSize: 19, color: "var(--gold)",
              margin: "0 0 4px", textAlign: "center"
            }}>💰 Bill Summary</h3>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "#666", textAlign: "center", marginBottom: 16 }}>
              {MONTHS[selectedMonth]} {selectedYear}
            </p>

            {/* Line items */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 14, marginBottom: 14 }}>
              <Row label={`Daily Milk (${daysInMonth}d × ${dailyPackets}pkt × ₹${price.toFixed(2)})`} amount={baseCost} />
              {extraPurchases.map((ep, i) => (
                <Row key={ep.id}
                  label={`Extra #${i + 1} (${ep.packets}pkt${ep.date ? ` · ${ep.date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}` : ""})`}
                  amount={ep.packets * (parseFloat(ep.pricePerPacket) || 0)} sub />
              ))}
              {svc > 0 && <Row label="Service Charge" amount={svc} sub />}
              {dlv > 0 && <Row label="Delivery Charge" amount={dlv} sub />}
            </div>

            {/* Total */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--gold)" }}>Total Amount</span>
              <span style={{
                fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800,
                background: "linear-gradient(135deg, var(--gold), var(--pink))",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>₹{total.toFixed(2)}</span>
            </div>

            {/* Packets summary */}
            <div style={{
              marginTop: 14, padding: "10px 14px", background: "rgba(255,255,255,0.03)",
              borderRadius: 10, fontSize: 11, color: "#666", lineHeight: 1.7
            }}>
              <strong style={{ color: "#999" }}>Total Packets:</strong> {totalPackets} &nbsp;|&nbsp;
              <strong style={{ color: "#999" }}>Daily:</strong> {daysInMonth * dailyPackets} &nbsp;|&nbsp;
              <strong style={{ color: "#999" }}>Extra:</strong> {extraPurchases.reduce((s, p) => s + p.packets, 0)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

/* ─── Tiny row component for the summary ─── */
function Row({ label, amount, sub }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: sub ? 12 : 13 }}>
      <span style={{ color: sub ? "#777" : "#aaa" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", color: sub ? "#bbb" : "#e0e0e0" }}>₹{amount.toFixed(2)}</span>
    </div>
  );
}

/* ━━━ Shared Styles ━━━ */
const styles = {
  card: {
    background: "var(--bg-card)", borderRadius: 20, padding: 20,
    border: "1px solid var(--border)", marginBottom: 16
  },
  sectionTitle: {
    fontSize: 13, color: "var(--gold)", margin: "0 0 14px", fontWeight: 600,
    display: "flex", alignItems: "center", gap: 8
  },
  label: {
    display: "block", color: "#888", fontSize: 11, marginBottom: 6,
    fontFamily: "var(--font-body)", textTransform: "uppercase", letterSpacing: 1.2
  },
  input: {
    width: "100%", padding: "11px 12px", background: "rgba(255,255,255,0.04)",
    border: "1px solid #2a2a4a", borderRadius: 10, color: "#e0e0e0",
    fontSize: 14, fontFamily: "var(--font-mono)", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s"
  },
  select: {
    width: "100%", padding: "11px 12px", background: "rgba(255,255,255,0.04)",
    border: "1px solid #2a2a4a", borderRadius: 10, color: "#e0e0e0",
    fontSize: 14, fontFamily: "var(--font-mono)", outline: "none",
    boxSizing: "border-box", appearance: "none", cursor: "pointer",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%23f0c27a'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center"
  },
  hint: {
    marginTop: 10, padding: "9px 12px", background: "rgba(240,194,122,0.07)",
    borderRadius: 8, fontSize: 12, color: "var(--gold)"
  },
  addBtn: {
    background: "linear-gradient(135deg, var(--gold), var(--pink))", border: "none",
    borderRadius: 8, color: "#0f0c29", fontWeight: 700, fontSize: 12,
    padding: "7px 16px", cursor: "pointer", fontFamily: "var(--font-body)"
  },
  removeBtn: {
    background: "rgba(252,92,125,0.12)", border: "none", borderRadius: 6,
    color: "#fc5c7d", fontSize: 13, cursor: "pointer", width: 26, height: 26,
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  calcBtn: {
    width: "100%", padding: "16px", border: "none", borderRadius: 14, cursor: "pointer",
    background: "linear-gradient(135deg, var(--gold) 0%, var(--pink) 100%)",
    color: "#0f0c29", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-body)",
    letterSpacing: 0.5, boxShadow: "0 8px 32px rgba(240,194,122,0.22)",
    transition: "transform 0.15s", marginBottom: 18
  }
};
