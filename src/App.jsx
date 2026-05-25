import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const CATEGORIES = [
  { id: "vivienda", label: "Vivienda", emoji: "Casa", color: "#4f8ef7" },
  { id: "comida", label: "Comida", emoji: "Comida", color: "#f7874f" },
  { id: "transporte", label: "Transporte", emoji: "Auto", color: "#f7c84f" },
  { id: "salud", label: "Salud", emoji: "Salud", color: "#4ff7a0" },
  { id: "entretenimiento", label: "Ocio", emoji: "Ocio", color: "#c44ff7" },
  { id: "educacion", label: "Educacion", emoji: "Edu", color: "#4ff7f0" },
  { id: "ropa", label: "Ropa", emoji: "Ropa", color: "#f74f8e" },
  { id: "otros", label: "Otros", emoji: "Otros", color: "#a0a0a0" },
];

const ASSET_TYPES = [
  { id: "accion", label: "Accion" },
  { id: "etf", label: "ETF" },
  { id: "cripto", label: "Cripto" },
  { id: "bono", label: "Bono" },
  { id: "fondo", label: "Fondo" },
  { id: "cedear", label: "CEDEAR" },
  { id: "otro", label: "Otro" },
];

// Mapa de ticker/nombre a ID de CoinGecko
const CRYPTO_ID_MAP = {
  BTC: "bitcoin", ETH: "ethereum", BNB: "binancecoin", SOL: "solana",
  ADA: "cardano", XRP: "ripple", DOT: "polkadot", DOGE: "dogecoin",
  AVAX: "avalanche-2", MATIC: "matic-network", LINK: "chainlink",
  UNI: "uniswap", ATOM: "cosmos", LTC: "litecoin", NEAR: "near",
};

const BROKER_COLORS = ["#4f8ef7","#f7874f","#4ff7a0","#c44ff7","#f7c84f","#f74f8e","#4ff7f0","#a0a0a0"];

function formatCurrency(n) {
  return "$" + Number(n).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatPct(n) {
  const v = parseFloat(n);
  return (v >= 0 ? "+" : "") + v.toFixed(2) + "%";
}
function generateId() { return Math.random().toString(36).slice(2, 9); }

const SAMPLE_INVESTMENTS = [
  { id: "inv1", ticker: "AAPL", name: "Apple Inc", type: "accion", broker: "Interactive Brokers", invested: 5000, currentValue: 5820, shares: 28, currency: "USD", history: [
    { date: "2026-01", value: 5000 },{ date: "2026-02", value: 5200 },{ date: "2026-03", value: 4900 },{ date: "2026-04", value: 5500 },{ date: "2026-05", value: 5820 },
  ]},
  { id: "inv2", ticker: "VOO", name: "Vanguard S&P 500", type: "etf", broker: "Interactive Brokers", invested: 8000, currentValue: 8960, shares: 18, currency: "USD", history: [
    { date: "2026-01", value: 8000 },{ date: "2026-02", value: 8300 },{ date: "2026-03", value: 8100 },{ date: "2026-04", value: 8600 },{ date: "2026-05", value: 8960 },
  ]},
  { id: "inv3", ticker: "BTC", name: "Bitcoin", type: "cripto", broker: "Binance", invested: 3000, currentValue: 4100, shares: 0.04, currency: "USD", history: [
    { date: "2026-01", value: 3000 },{ date: "2026-02", value: 2600 },{ date: "2026-03", value: 3400 },{ date: "2026-04", value: 3800 },{ date: "2026-05", value: 4100 },
  ]},
  { id: "inv4", ticker: "GGAL", name: "Grupo Galicia", type: "cedear", broker: "Balanz", invested: 2000, currentValue: 2340, shares: 100, currency: "USD", history: [
    { date: "2026-01", value: 2000 },{ date: "2026-02", value: 2100 },{ date: "2026-03", value: 1950 },{ date: "2026-04", value: 2200 },{ date: "2026-05", value: 2340 },
  ]},
];

const SAMPLE_EXPENSES = [
  { id: "s1", desc: "Renta", amount: 8500, category: "vivienda", date: "2026-05-01", type: "expense" },
  { id: "s2", desc: "Super semana", amount: 1200, category: "comida", date: "2026-05-05", type: "expense" },
  { id: "s3", desc: "Gasolina", amount: 600, category: "transporte", date: "2026-05-08", type: "expense" },
  { id: "s4", desc: "Netflix", amount: 350, category: "entretenimiento", date: "2026-05-10", type: "expense" },
  { id: "s5", desc: "Farmacia", amount: 420, category: "salud", date: "2026-05-12", type: "expense" },
  { id: "s6", desc: "Restaurante", amount: 1800, category: "comida", date: "2026-05-15", type: "expense" },
  { id: "s7", desc: "Uber", amount: 280, category: "transporte", date: "2026-05-18", type: "expense" },
  { id: "s8", desc: "Curso online", amount: 499, category: "educacion", date: "2026-05-20", type: "expense" },
];
const SAMPLE_INCOME = [
  { id: "i1", desc: "Sueldo quincena 1", amount: 12000, category: "otros", date: "2026-05-15", type: "income" },
  { id: "i2", desc: "Sueldo quincena 2", amount: 12000, category: "otros", date: "2026-05-30", type: "income" },
];

const GOAL_EXAMPLES = [
  "Ahorrar $50,000 para un viaje en 12 meses",
  "Juntar $30,000 para enganche de un coche en 6 meses",
  "Crear un fondo de emergencia de 3 meses de gastos",
  "Pagar deuda de tarjeta de $15,000 en 8 meses",
];

const inputStyle = {
  width: "100%", background: "#0d0f14", border: "1px solid #1e2330",
  borderRadius: 10, padding: "12px 14px", color: "#e0e0e0", fontSize: 14,
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#1a1f2e", border: "1px solid #2a2f40", borderRadius: 10, padding: "8px 14px", fontSize: 12 }}>
        <div style={{ color: "#5a6478", marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => <div key={i} style={{ color: p.color, fontWeight: 700 }}>{p.name}: {formatCurrency(p.value)}</div>)}
      </div>
    );
  }
  return null;
};

export default function App() {
  const [view, setView] = useState("dashboard");
  const [transactions, setTransactions] = useState([...SAMPLE_EXPENSES, ...SAMPLE_INCOME]);
  const [form, setForm] = useState({ desc: "", amount: "", category: "comida", type: "expense", date: new Date().toISOString().slice(0,10) });
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [animIn, setAnimIn] = useState(false);

  // Inversiones
  const [investments, setInvestments] = useState(SAMPLE_INVESTMENTS);
  const [showInvForm, setShowInvForm] = useState(false);
  const [invForm, setInvForm] = useState({ ticker: "", name: "", type: "accion", broker: "", invested: "", currentValue: "", shares: "", currency: "USD" });
  const [selectedInv, setSelectedInv] = useState(null);
  const [updateForm, setUpdateForm] = useState({ currentValue: "" });
  const [invFilter, setInvFilter] = useState("todos");
  const [pricesLoading, setPricesLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [priceErrors, setPriceErrors] = useState({});

  // Metas
  const [goals, setGoals] = useState([]);
  const [goalForm, setGoalForm] = useState({ text: "", targetAmount: "", deadline: "", saved: "0" });
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalAdvice, setGoalAdvice] = useState({});
  const [goalLoading, setGoalLoading] = useState({});
  const [activeGoalId, setActiveGoalId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { setTimeout(() => setAnimIn(true), 100); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  // Auto-fetch precios al cargar y cada 5 minutos
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchPrices() {
    setPricesLoading(true);
    setPriceErrors({});

    const stockTickers = investments.filter(i => i.type !== "cripto").map(i => i.ticker);
    const cryptoInvs = investments.filter(i => i.type === "cripto");
    const cryptoIds = cryptoInvs.map(i => CRYPTO_ID_MAP[i.ticker] || i.ticker.toLowerCase()).filter(Boolean);

    try {
      const res = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers: stockTickers, cryptos: cryptoIds }),
      });

      if (!res.ok) throw new Error("API error");
      const { prices } = await res.json();
      const today = new Date().toISOString().slice(0, 7);

      setInvestments(prev => prev.map(inv => {
        let priceData = null;

        if (inv.type === "cripto") {
          const cryptoId = CRYPTO_ID_MAP[inv.ticker] || inv.ticker.toLowerCase();
          priceData = prices[cryptoId];
        } else {
          priceData = prices[inv.ticker];
        }

        if (!priceData || !priceData.price) {
          setPriceErrors(e => ({...e, [inv.id]: "Sin datos"}));
          return inv;
        }

        const newPrice = priceData.price;
        const newValue = inv.shares ? inv.shares * newPrice : newPrice;

        // Actualizar historial
        let newHistory = [...inv.history];
        if (priceData.history && priceData.history.length > 0) {
          // Usar historial real de la API
          const baseValue = inv.invested;
          const basePrice = priceData.history[0]?.close || newPrice;
          newHistory = priceData.history.map(h => ({
            date: h.date,
            value: inv.shares ? inv.shares * h.close : (h.close / basePrice) * baseValue,
          }));
        } else {
          // Agregar punto actual
          const last = newHistory[newHistory.length - 1];
          if (last?.date !== today) {
            newHistory = [...newHistory, { date: today, value: newValue }];
          } else {
            newHistory = [...newHistory.slice(0, -1), { date: today, value: newValue }];
          }
        }

        return { ...inv, currentValue: newValue, pricePerUnit: newPrice, history: newHistory };
      }));

      setLastUpdated(new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      console.error("fetchPrices error:", e);
    }
    setPricesLoading(false);
  }

  const expenses = transactions.filter(t => t.type === "expense");
  const income = transactions.filter(t => t.type === "income");
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

  const byCategory = CATEGORIES.map(cat => ({
    ...cat,
    total: expenses.filter(t => t.category === cat.id).reduce((s, t) => s + t.amount, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const usedPct = totalIncome > 0 ? Math.min((totalExpenses / totalIncome) * 100, 100) : 0;
  const donutR = 52, donutCirc = 2 * Math.PI * donutR;
  const donutOffset = donutCirc - (usedPct / 100) * donutCirc;

  const totalInvested = investments.reduce((s, i) => s + i.invested, 0);
  const totalCurrent = investments.reduce((s, i) => s + i.currentValue, 0);
  const totalGain = totalCurrent - totalInvested;
  const totalGainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  const brokers = [...new Set(investments.map(i => i.broker))];
  const byBroker = brokers.map((broker, idx) => {
    const invs = investments.filter(i => i.broker === broker);
    const invested = invs.reduce((s, i) => s + i.invested, 0);
    const current = invs.reduce((s, i) => s + i.currentValue, 0);
    return { broker, invested, current, gain: current - invested, gainPct: invested > 0 ? ((current - invested) / invested) * 100 : 0, color: BROKER_COLORS[idx % BROKER_COLORS.length] };
  });

  const allDates = [...new Set(investments.flatMap(i => i.history.map(h => h.date)))].sort();
  const portfolioHistory = allDates.map(date => ({
    date,
    valor: investments.reduce((s, inv) => {
      const h = inv.history.find(h => h.date === date);
      return s + (h ? h.value : 0);
    }, 0),
  }));

  const filteredInvestments = invFilter === "todos" ? investments : investments.filter(i => i.broker === invFilter || i.type === invFilter);

  function addTransaction() {
    if (!form.desc || !form.amount) return;
    setTransactions(prev => [...prev, { ...form, id: generateId(), amount: parseFloat(form.amount) }]);
    setForm({ desc: "", amount: "", category: "comida", type: "expense", date: new Date().toISOString().slice(0,10) });
    setShowForm(false);
  }
  function deleteTransaction(id) { setTransactions(prev => prev.filter(t => t.id !== id)); }

  function addInvestment() {
    if (!invForm.ticker || !invForm.invested || !invForm.broker) return;
    const today = new Date().toISOString().slice(0, 7);
    const inv = parseFloat(invForm.invested);
    const cur = parseFloat(invForm.currentValue) || inv;
    const newInv = { ...invForm, id: generateId(), invested: inv, currentValue: cur, shares: parseFloat(invForm.shares) || 0, history: [{ date: today, value: inv }] };
    setInvestments(prev => [...prev, newInv]);
    setInvForm({ ticker: "", name: "", type: "accion", broker: "", invested: "", currentValue: "", shares: "", currency: "USD" });
    setShowInvForm(false);
    setTimeout(fetchPrices, 500);
  }

  function updateInvestmentValue(id) {
    if (!updateForm.currentValue) return;
    const today = new Date().toISOString().slice(0, 7);
    setInvestments(prev => prev.map(inv => {
      if (inv.id !== id) return inv;
      const newVal = parseFloat(updateForm.currentValue);
      const last = inv.history[inv.history.length - 1];
      const newHistory = last?.date === today ? [...inv.history.slice(0,-1), { date: today, value: newVal }] : [...inv.history, { date: today, value: newVal }];
      return { ...inv, currentValue: newVal, history: newHistory };
    }));
    setUpdateForm({ currentValue: "" });
    setSelectedInv(null);
  }

  function deleteInvestment(id) { setInvestments(prev => prev.filter(i => i.id !== id)); }

  function buildGoalSystem(goal) {
    return `Eres un coach financiero personal que habla espanol latinoamericano. Ayudas a la persona a alcanzar su meta: "${goal.text}". Eres directo y practico. Das numeros concretos. Maximo 250 palabras por respuesta.`;
  }

  async function getGoalAdvice(goal) {
    setGoalLoading(prev => ({...prev, [goal.id]: true}));
    setActiveGoalId(goal.id);
    const firstUserMsg = `Mi meta: "${goal.text}". Objetivo: $${goal.targetAmount}. Fecha: ${goal.deadline || "sin fecha"}. Ahorrado: $${goal.saved}. Ingreso mensual: $${totalIncome}. Gastos: $${totalExpenses}. Dame un plan concreto.`;
    setChatMessages([{ role: "user", content: firstUserMsg }]);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: buildGoalSystem(goal), messages: [{ role: "user", content: firstUserMsg }] }) });
      const data = await r.json();
      const text = data.content?.map(b => b.text || "").join("") || "Sin respuesta.";
      setChatMessages([{ role: "user", content: firstUserMsg }, { role: "assistant", content: text }]);
      setGoalAdvice(prev => ({...prev, [goal.id]: text}));
    } catch (e) { setChatMessages([{ role: "user", content: firstUserMsg }, { role: "assistant", content: "Error al conectar." }]); }
    setGoalLoading(prev => ({...prev, [goal.id]: false}));
  }

  async function sendChatMessage(goal) {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    const newMessages = [...chatMessages, { role: "user", content: userMsg }];
    setChatMessages(newMessages);
    setChatLoading(true);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: buildGoalSystem(goal), messages: newMessages }) });
      const data = await r.json();
      setChatMessages(prev => [...prev, { role: "assistant", content: data.content?.map(b => b.text || "").join("") || "Sin respuesta." }]);
    } catch (e) { setChatMessages(prev => [...prev, { role: "assistant", content: "Error." }]); }
    setChatLoading(false);
  }

  async function getAIAnalysis() {
    setAiLoading(true); setAiAnalysis(""); setView("ai");
    const summary = { ingresoTotal: totalIncome, gastoTotal: totalExpenses, balance, tasaAhorro: savingsRate + "%", metas: goals.map(g => ({ meta: g.text, objetivo: g.targetAmount, ahorrado: g.saved })), porCategoria: byCategory.map(c => ({ categoria: c.label, monto: c.total })), inversiones: { totalInvertido: totalInvested, valorActual: totalCurrent, ganancia: totalGain, rendimiento: totalGainPct.toFixed(2) + "%" } };
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: `Eres un asesor financiero que habla espanol latinoamericano. Analiza presupuesto e inversiones. Estructura: 1. DIAGNOSTICO RAPIDO 2. LO QUE MAS ME PREOCUPA 3. 3 ACCIONES CONCRETAS 4. OPINION SOBRE SUS INVERSIONES. Maximo 350 palabras.`, messages: [{ role: "user", content: `Analiza mis finanzas: ${JSON.stringify(summary)}` }] }) });
      const data = await r.json();
      setAiAnalysis(data.content?.map(b => b.text || "").join("") || "Sin respuesta.");
    } catch (e) { setAiAnalysis("Error al conectar."); }
    setAiLoading(false);
  }

  function addGoal() {
    if (!goalForm.text) return;
    setGoals(prev => [...prev, { ...goalForm, id: generateId(), createdAt: new Date().toISOString().slice(0,10), saved: parseFloat(goalForm.saved) || 0, targetAmount: parseFloat(goalForm.targetAmount) || 0 }]);
    setGoalForm({ text: "", targetAmount: "", deadline: "", saved: "0" });
    setShowGoalForm(false);
  }
  function deleteGoal(id) { setGoals(prev => prev.filter(g => g.id !== id)); }
  function updateGoalSaved(id, amt) { setGoals(prev => prev.map(g => g.id === id ? {...g, saved: Math.max(0, (g.saved||0)+amt)} : g)); }

  const activeGoal = goals.find(g => g.id === activeGoalId);

  const NAV = [
    { id: "dashboard", label: "Inicio" },
    { id: "gastos", label: "Gastos" },
    { id: "ingresos", label: "Ingresos" },
    { id: "inversiones", label: "Cartera" },
    { id: "metas", label: "Metas" },
    { id: "ai", label: "IA" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0d0f14", color: "#e8e8e8", fontFamily: "'DM Sans','Segoe UI',sans-serif", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg,#1a1f2e,#141820)", padding: "24px 20px 16px", borderBottom: "1px solid #1e2330", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, color: "#5a6478", fontWeight: 600, textTransform: "uppercase" }}>Mayo 2026</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginTop: 2 }}>Mi Presupuesto</div>
          </div>
          <button onClick={getAIAnalysis} style={{ background: "linear-gradient(135deg,#4f8ef7,#6c4ff7)", border: "none", borderRadius: 12, padding: "9px 14px", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Analizar IA</button>
        </div>
        <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 2 }}>
          {NAV.map(({ id, label }) => (
            <button key={id} onClick={() => setView(id)} style={{ flexShrink: 0, padding: "7px 12px", borderRadius: 10, border: "none", background: view === id ? "linear-gradient(135deg,#4f8ef7,#6c4ff7)" : "#1e2330", color: view === id ? "#fff" : "#5a6478", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 20px 100px", opacity: animIn ? 1 : 0, transform: animIn ? "none" : "translateY(16px)", transition: "all 0.4s ease" }}>

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div>
            <div style={{ background: "linear-gradient(135deg,#1a1f2e,#141820)", borderRadius: 20, padding: 20, border: "1px solid #1e2330", marginBottom: 14, display: "flex", alignItems: "center", gap: 20 }}>
              <svg width={120} height={120} style={{ flexShrink: 0 }}>
                <circle cx={60} cy={60} r={donutR} fill="none" stroke="#1e2330" strokeWidth={12} />
                <circle cx={60} cy={60} r={donutR} fill="none" stroke={usedPct > 90 ? "#f74f4f" : usedPct > 70 ? "#f7c84f" : "#4f8ef7"} strokeWidth={12} strokeDasharray={donutCirc} strokeDashoffset={donutOffset} strokeLinecap="round" transform="rotate(-90 60 60)" style={{ transition: "stroke-dashoffset 1s ease" }} />
                <text x={60} y={56} textAnchor="middle" fill="#fff" fontSize={16} fontWeight={700}>{usedPct.toFixed(0)}%</text>
                <text x={60} y={70} textAnchor="middle" fill="#5a6478" fontSize={9}>gastado</text>
              </svg>
              <div style={{ flex: 1 }}>
                {[["INGRESOS", totalIncome, "#4ff7a0"], ["GASTOS", totalExpenses, "#f74f4f"], ["BALANCE", balance, balance >= 0 ? "#4ff7a0" : "#f74f4f"]].map(([l, v, c]) => (
                  <div key={l} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: "#5a6478", fontWeight: 600 }}>{l}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: c }}>{formatCurrency(v)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div onClick={() => setView("inversiones")} style={{ background: "linear-gradient(135deg,#0d1a10,#141820)", borderRadius: 16, padding: 16, border: "1px solid #1e3320", marginBottom: 14, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 10, color: "#5a6478", fontWeight: 600 }}>CARTERA DE INVERSIONES</div>
                    {pricesLoading && <div style={{ fontSize: 9, color: "#4ff7a0", background: "#0d2010", borderRadius: 20, padding: "2px 8px" }}>Actualizando...</div>}
                    {lastUpdated && !pricesLoading && <div style={{ fontSize: 9, color: "#5a6478", background: "#1e2330", borderRadius: 20, padding: "2px 8px" }}>Actualizado {lastUpdated}</div>}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#4ff7a0" }}>{formatCurrency(totalCurrent)}</div>
                  <div style={{ fontSize: 12, color: totalGain >= 0 ? "#4ff7a0" : "#f74f4f", marginTop: 2 }}>{formatPct(totalGainPct)} ({formatCurrency(Math.abs(totalGain))})</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#5a6478", marginBottom: 4 }}>INVERTIDO</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#c0c0c0" }}>{formatCurrency(totalInvested)}</div>
                  <div style={{ fontSize: 11, color: "#4f8ef7", marginTop: 6 }}>Ver cartera</div>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div style={{ background: "#1a1f2e", borderRadius: 16, padding: 16, border: "1px solid #1e2330" }}>
                <div style={{ fontSize: 10, color: "#5a6478", fontWeight: 600 }}>TASA DE AHORRO</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: parseFloat(savingsRate) >= 20 ? "#4ff7a0" : parseFloat(savingsRate) >= 10 ? "#f7c84f" : "#f74f4f", marginTop: 4 }}>{savingsRate}%</div>
                <div style={{ fontSize: 10, color: "#5a6478", marginTop: 4 }}>Meta: 20%</div>
              </div>
              <div onClick={() => setView("metas")} style={{ background: "#1a1f2e", borderRadius: 16, padding: 16, border: "1px solid #1e2330", cursor: "pointer" }}>
                <div style={{ fontSize: 10, color: "#5a6478", fontWeight: 600 }}>METAS ACTIVAS</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#c44ff7", marginTop: 4 }}>{goals.length}</div>
                <div style={{ fontSize: 10, color: "#5a6478", marginTop: 4, textDecoration: "underline" }}>Ver metas</div>
              </div>
            </div>
            <div style={{ background: "#1a1f2e", borderRadius: 20, padding: 18, border: "1px solid #1e2330" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Gastos por categoria</div>
              {byCategory.map(cat => (
                <div key={cat.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "#c0c0c0" }}>{cat.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{formatCurrency(cat.total)}</span>
                  </div>
                  <div style={{ height: 6, background: "#0d0f14", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: totalExpenses > 0 ? (cat.total/totalExpenses*100)+"%" : "0%", background: cat.color, borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GASTOS / INGRESOS */}
        {(view === "gastos" || view === "ingresos") && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{view === "gastos" ? "Gastos" : "Ingresos"}</div>
              <button onClick={() => setShowForm(true)} style={{ background: "linear-gradient(135deg,#4f8ef7,#6c4ff7)", border: "none", borderRadius: 10, padding: "8px 14px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Agregar</button>
            </div>
            {showForm && (
              <div style={{ background: "#1a1f2e", borderRadius: 16, padding: 20, border: "1px solid #4f8ef7", marginBottom: 16 }}>
                <div style={{ display: "grid", gap: 10 }}>
                  <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} style={inputStyle}><option value="expense">Gasto</option><option value="income">Ingreso</option></select>
                  <input placeholder="Descripcion" value={form.desc} onChange={e => setForm(f => ({...f, desc: e.target.value}))} style={inputStyle} />
                  <input type="number" placeholder="Monto $" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} style={inputStyle} />
                  <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} style={inputStyle}>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} style={inputStyle} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={addTransaction} style={{ flex: 1, background: "linear-gradient(135deg,#4f8ef7,#6c4ff7)", border: "none", borderRadius: 10, padding: 12, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Guardar</button>
                    <button onClick={() => setShowForm(false)} style={{ flex: 1, background: "#0d0f14", border: "1px solid #1e2330", borderRadius: 10, padding: 12, color: "#5a6478", fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}
            {transactions.filter(t => t.type === (view === "gastos" ? "expense" : "income")).sort((a,b) => new Date(b.date)-new Date(a.date)).map(t => {
              const cat = CATEGORIES.find(c => c.id === t.category);
              return (
                <div key={t.id} style={{ background: "#1a1f2e", borderRadius: 14, padding: "14px 16px", border: "1px solid #1e2330", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: cat?.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: cat?.color, flexShrink: 0 }}>{cat?.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e0e0e0" }}>{t.desc}</div>
                    <div style={{ fontSize: 11, color: "#5a6478", marginTop: 2 }}>{t.date} Â· {cat?.label}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: t.type === "expense" ? "#f74f4f" : "#4ff7a0" }}>{t.type === "expense" ? "-" : "+"}{formatCurrency(t.amount)}</div>
                    <button onClick={() => deleteTransaction(t.id)} style={{ background: "none", border: "none", color: "#3a3f50", fontSize: 11, cursor: "pointer" }}>borrar</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* INVERSIONES */}
        {view === "inversiones" && (
          <div>
            {/* Header con boton de refresh */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Mi Cartera</div>
                {lastUpdated && <div style={{ fontSize: 11, color: "#5a6478", marginTop: 2 }}>Precios actualizados: {lastUpdated}</div>}
              </div>
              <button onClick={fetchPrices} disabled={pricesLoading} style={{ background: pricesLoading ? "#1e2330" : "linear-gradient(135deg,#4ff7a0,#4f8ef7)", border: "none", borderRadius: 10, padding: "8px 14px", color: pricesLoading ? "#5a6478" : "#0d0f14", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                {pricesLoading ? "Actualizando..." : "Actualizar precios"}
              </button>
            </div>

            <div style={{ background: "linear-gradient(135deg,#0d1a10,#141820)", borderRadius: 20, padding: 20, border: "1px solid #1e3320", marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#5a6478", fontWeight: 600, marginBottom: 8 }}>CARTERA TOTAL</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: "#4ff7a0" }}>{formatCurrency(totalCurrent)}</div>
              <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                <div><div style={{ fontSize: 10, color: "#5a6478" }}>Invertido</div><div style={{ fontSize: 14, fontWeight: 700, color: "#c0c0c0" }}>{formatCurrency(totalInvested)}</div></div>
                <div><div style={{ fontSize: 10, color: "#5a6478" }}>Ganancia</div><div style={{ fontSize: 14, fontWeight: 700, color: totalGain >= 0 ? "#4ff7a0" : "#f74f4f" }}>{formatCurrency(totalGain)}</div></div>
                <div><div style={{ fontSize: 10, color: "#5a6478" }}>Rendimiento</div><div style={{ fontSize: 14, fontWeight: 700, color: totalGainPct >= 0 ? "#4ff7a0" : "#f74f4f" }}>{formatPct(totalGainPct)}</div></div>
              </div>
            </div>

            <div style={{ background: "#1a1f2e", borderRadius: 20, padding: 18, border: "1px solid #1e2330", marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Evolucion de la cartera</div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={portfolioHistory} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2330" />
                  <XAxis dataKey="date" tick={{ fill: "#5a6478", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#5a6478", fontSize: 10 }} tickFormatter={v => "$" + (v/1000).toFixed(0) + "k"} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="valor" name="Cartera" stroke="#4ff7a0" strokeWidth={2} dot={{ fill: "#4ff7a0", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: "#1a1f2e", borderRadius: 20, padding: 18, border: "1px solid #1e2330", marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Por broker</div>
              {byBroker.map(b => (
                <div key={b.broker} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "#c0c0c0", fontWeight: 600 }}>{b.broker}</span>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{formatCurrency(b.current)}</span>
                      <span style={{ fontSize: 11, color: b.gainPct >= 0 ? "#4ff7a0" : "#f74f4f", marginLeft: 8 }}>{formatPct(b.gainPct)}</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: "#0d0f14", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: totalCurrent > 0 ? (b.current/totalCurrent*100)+"%" : "0%", background: b.color, borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
              {["todos", ...brokers].map(f => (
                <button key={f} onClick={() => setInvFilter(f)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: "none", background: invFilter === f ? "#4f8ef7" : "#1e2330", color: invFilter === f ? "#fff" : "#5a6478", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{f === "todos" ? "Todos" : f}</button>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Instrumentos</div>
              <button onClick={() => setShowInvForm(true)} style={{ background: "linear-gradient(135deg,#4ff7a0,#4f8ef7)", border: "none", borderRadius: 10, padding: "7px 14px", color: "#0d0f14", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>+ Agregar</button>
            </div>

            {showInvForm && (
              <div style={{ background: "#1a1f2e", borderRadius: 16, padding: 20, border: "1px solid #4ff7a0", marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Nueva inversion</div>
                <div style={{ fontSize: 11, color: "#5a6478", marginBottom: 14 }}>Para acciones/ETFs usa el ticker de Yahoo Finance (AAPL, VOO). Para cripto usa BTC, ETH, SOL, etc.</div>
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <input placeholder="Ticker (AAPL, BTC...)" value={invForm.ticker} onChange={e => setInvForm(f => ({...f, ticker: e.target.value.toUpperCase()}))} style={inputStyle} />
                    <select value={invForm.type} onChange={e => setInvForm(f => ({...f, type: e.target.value}))} style={inputStyle}>{ASSET_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
                  </div>
                  <input placeholder="Nombre (Apple Inc...)" value={invForm.name} onChange={e => setInvForm(f => ({...f, name: e.target.value}))} style={inputStyle} />
                  <input placeholder="Broker (Interactive Brokers...)" value={invForm.broker} onChange={e => setInvForm(f => ({...f, broker: e.target.value}))} style={inputStyle} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <input type="number" placeholder="Monto invertido $" value={invForm.invested} onChange={e => setInvForm(f => ({...f, invested: e.target.value}))} style={inputStyle} />
                    <input type="number" placeholder="Cantidad (shares)" value={invForm.shares} onChange={e => setInvForm(f => ({...f, shares: e.target.value}))} style={inputStyle} />
                  </div>
                  <select value={invForm.currency} onChange={e => setInvForm(f => ({...f, currency: e.target.value}))} style={inputStyle}>
                    <option value="USD">USD</option><option value="ARS">ARS</option><option value="MXN">MXN</option><option value="EUR">EUR</option>
                  </select>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={addInvestment} style={{ flex: 1, background: "linear-gradient(135deg,#4ff7a0,#4f8ef7)", border: "none", borderRadius: 10, padding: 12, color: "#0d0f14", fontWeight: 700, cursor: "pointer" }}>Guardar y actualizar precio</button>
                    <button onClick={() => setShowInvForm(false)} style={{ background: "#0d0f14", border: "1px solid #1e2330", borderRadius: 10, padding: 12, color: "#5a6478", fontWeight: 700, cursor: "pointer" }}>X</button>
                  </div>
                </div>
              </div>
            )}

            {filteredInvestments.map(inv => {
              const gain = inv.currentValue - inv.invested;
              const gainPct = inv.invested > 0 ? (gain / inv.invested) * 100 : 0;
              const isSelected = selectedInv === inv.id;
              const hasError = priceErrors[inv.id];
              return (
                <div key={inv.id} style={{ background: "#1a1f2e", borderRadius: 16, padding: 16, border: `1px solid ${isSelected ? "#4ff7a0" : "#1e2330"}`, marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: gainPct >= 0 ? "#4ff7a022" : "#f74f4f22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: gainPct >= 0 ? "#4ff7a0" : "#f74f4f" }}>{inv.ticker}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#e0e0e0" }}>{inv.name || inv.ticker}</div>
                      <div style={{ fontSize: 11, color: "#5a6478" }}>{inv.broker} Â· {ASSET_TYPES.find(t => t.id === inv.type)?.label} Â· {inv.currency}</div>
                      {inv.pricePerUnit && <div style={{ fontSize: 10, color: "#4f8ef7", marginTop: 2 }}>Precio: {formatCurrency(inv.pricePerUnit)} Â· {inv.shares} unidades</div>}
                      {hasError && <div style={{ fontSize: 10, color: "#f7c84f", marginTop: 2 }}>Precio manual (ticker no encontrado)</div>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{formatCurrency(inv.currentValue)}</div>
                      <div style={{ fontSize: 12, color: gainPct >= 0 ? "#4ff7a0" : "#f74f4f", fontWeight: 700 }}>{formatPct(gainPct)}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 12, borderTop: "1px solid #1e2330" }}>
                    <div><div style={{ fontSize: 10, color: "#5a6478" }}>Invertido</div><div style={{ fontSize: 12, fontWeight: 700, color: "#c0c0c0" }}>{formatCurrency(inv.invested)}</div></div>
                    <div><div style={{ fontSize: 10, color: "#5a6478" }}>Ganancia</div><div style={{ fontSize: 12, fontWeight: 700, color: gain >= 0 ? "#4ff7a0" : "#f74f4f" }}>{formatCurrency(gain)}</div></div>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                      <button onClick={() => setSelectedInv(isSelected ? null : inv.id)} style={{ background: "#1e2330", border: "none", borderRadius: 8, padding: "5px 10px", color: "#4f8ef7", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Manual</button>
                      <button onClick={() => deleteInvestment(inv.id)} style={{ background: "none", border: "none", color: "#3a3f50", fontSize: 11, cursor: "pointer" }}>borrar</button>
                    </div>
                  </div>

                  {isSelected && (
                    <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                      <input type="number" placeholder="Nuevo valor total $" value={updateForm.currentValue} onChange={e => setUpdateForm({ currentValue: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                      <button onClick={() => updateInvestmentValue(inv.id)} style={{ background: "linear-gradient(135deg,#4ff7a0,#4f8ef7)", border: "none", borderRadius: 10, padding: "10px 16px", color: "#0d0f14", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>OK</button>
                    </div>
                  )}

                  {inv.history.length > 1 && (
                    <div style={{ marginTop: 12 }}>
                      <ResponsiveContainer width="100%" height={60}>
                        <LineChart data={inv.history} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                          <Line type="monotone" dataKey="value" stroke={gainPct >= 0 ? "#4ff7a0" : "#f74f4f"} strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* METAS */}
        {view === "metas" && !activeGoalId && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Mis Metas</div>
              <button onClick={() => setShowGoalForm(true)} style={{ background: "linear-gradient(135deg,#c44ff7,#6c4ff7)", border: "none", borderRadius: 10, padding: "8px 14px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Nueva</button>
            </div>
            {showGoalForm && (
              <div style={{ background: "#1a1f2e", borderRadius: 16, padding: 20, border: "1px solid #c44ff7", marginBottom: 16 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                  {GOAL_EXAMPLES.map((ex, i) => <button key={i} onClick={() => setGoalForm(f => ({...f, text: ex}))} style={{ background: "#0d0f14", border: "1px solid #2a2f40", borderRadius: 20, padding: "5px 10px", color: "#8a94a8", fontSize: 11, cursor: "pointer" }}>{ex}</button>)}
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  <textarea placeholder="Describe tu meta..." value={goalForm.text} onChange={e => setGoalForm(f => ({...f, text: e.target.value}))} rows={3} style={{ ...inputStyle, resize: "none" }} />
                  <input type="number" placeholder="Monto objetivo $" value={goalForm.targetAmount} onChange={e => setGoalForm(f => ({...f, targetAmount: e.target.value}))} style={inputStyle} />
                  <input type="number" placeholder="Ya tengo ahorrado $" value={goalForm.saved} onChange={e => setGoalForm(f => ({...f, saved: e.target.value}))} style={inputStyle} />
                  <input type="date" value={goalForm.deadline} onChange={e => setGoalForm(f => ({...f, deadline: e.target.value}))} style={inputStyle} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={addGoal} style={{ flex: 1, background: "linear-gradient(135deg,#c44ff7,#6c4ff7)", border: "none", borderRadius: 10, padding: 12, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Crear</button>
                    <button onClick={() => setShowGoalForm(false)} style={{ flex: 1, background: "#0d0f14", border: "1px solid #1e2330", borderRadius: 10, padding: 12, color: "#5a6478", fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}
            {goals.length === 0 && !showGoalForm && (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "#1a1f2e", borderRadius: 20, border: "1px solid #1e2330" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Define tu primera meta</div>
                <div style={{ fontSize: 13, color: "#5a6478", marginBottom: 20 }}>La IA te dara un plan concreto basado en tu presupuesto</div>
                <button onClick={() => setShowGoalForm(true)} style={{ background: "linear-gradient(135deg,#c44ff7,#6c4ff7)", border: "none", borderRadius: 12, padding: "12px 24px", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Crear Meta</button>
              </div>
            )}
            {goals.map(goal => {
              const pct = goal.targetAmount > 0 ? Math.min((goal.saved/goal.targetAmount)*100, 100) : 0;
              return (
                <div key={goal.id} style={{ background: "#1a1f2e", borderRadius: 20, padding: 18, border: "1px solid #2a2f40", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#e0e0e0", lineHeight: 1.5 }}>{goal.text}</div>
                    <button onClick={() => deleteGoal(goal.id)} style={{ background: "none", border: "none", color: "#3a3f50", fontSize: 14, cursor: "pointer", marginLeft: 8 }}>X</button>
                  </div>
                  {goal.targetAmount > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "#5a6478" }}>{formatCurrency(goal.saved||0)} de {formatCurrency(goal.targetAmount)}</span>
                        <span style={{ fontSize: 12, color: "#c44ff7", fontWeight: 700 }}>{pct.toFixed(0)}%</span>
                      </div>
                      <div style={{ height: 8, background: "#0d0f14", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: pct+"%", background: "linear-gradient(90deg,#c44ff7,#6c4ff7)", borderRadius: 99 }} />
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        {[500,1000,2000].map(amt => <button key={amt} onClick={() => updateGoalSaved(goal.id, amt)} style={{ flex: 1, background: "#0d0f14", border: "1px solid #1e2330", borderRadius: 8, padding: "6px 4px", color: "#4ff7a0", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+${amt}</button>)}
                      </div>
                    </div>
                  )}
                  <button onClick={() => { getGoalAdvice(goal); setView("chat"); }} style={{ width: "100%", background: goalAdvice[goal.id] ? "#1e2330" : "linear-gradient(135deg,#c44ff7,#6c4ff7)", border: goalAdvice[goal.id] ? "1px solid #c44ff7" : "none", borderRadius: 12, padding: 12, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    {goalLoading[goal.id] ? "Analizando..." : goalAdvice[goal.id] ? "Continuar chat" : "Crear plan con IA"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* CHAT META */}
        {view === "chat" && activeGoal && (
          <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <button onClick={() => { setView("metas"); setActiveGoalId(null); }} style={{ background: "#1e2330", border: "none", borderRadius: 8, padding: "6px 12px", color: "#5a6478", cursor: "pointer", fontSize: 13 }}>Volver</button>
              <div style={{ fontSize: 13, color: "#c44ff7", fontWeight: 700 }}>Coach de Meta</div>
            </div>
            <div style={{ background: "#1a1f2e", borderRadius: 12, padding: "10px 14px", border: "1px solid #2a2f40", marginBottom: 12, fontSize: 12, color: "#8a94a8" }}>{activeGoal.text}</div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "85%", background: msg.role === "user" ? "linear-gradient(135deg,#4f8ef7,#6c4ff7)" : "#1e2330", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding: "12px 14px", fontSize: 13, lineHeight: 1.6, color: "#e0e0e0", whiteSpace: "pre-wrap", border: msg.role === "assistant" ? "1px solid #2a2f40" : "none" }}>{msg.content}</div>
                </div>
              ))}
              {chatLoading && <div style={{ display: "flex", gap: 6, padding: "12px 16px", background: "#1e2330", borderRadius: "16px 16px 16px 4px", width: "fit-content" }}>{[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#c44ff7", animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}</div>}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChatMessage(activeGoal)} placeholder="Pregunta sobre tu meta..." style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => sendChatMessage(activeGoal)} disabled={chatLoading || !chatInput.trim()} style={{ background: "linear-gradient(135deg,#c44ff7,#6c4ff7)", border: "none", borderRadius: 10, padding: "12px 16px", color: "#fff", fontWeight: 700, cursor: "pointer", opacity: chatLoading || !chatInput.trim() ? 0.5 : 1 }}>Enviar</button>
            </div>
          </div>
        )}

        {/* AI */}
        {view === "ai" && (
          <div>
            <div style={{ background: "linear-gradient(135deg,#1a1f2e,#141820)", borderRadius: 20, padding: 24, border: "1px solid #4f8ef7", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#4f8ef7,#6c4ff7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>IA</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Analisis General</div>
                  <div style={{ fontSize: 11, color: "#5a6478" }}>Presupuesto + inversiones + metas</div>
                </div>
              </div>
              {aiLoading && <div style={{ textAlign: "center", padding: "30px 0" }}><div style={{ color: "#5a6478", fontSize: 14, marginBottom: 16 }}>Analizando tus finanzas...</div><div style={{ display: "flex", justifyContent: "center", gap: 6 }}>{[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#4f8ef7", animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}</div></div>}
              {!aiLoading && !aiAnalysis && <div style={{ textAlign: "center", padding: "30px 0" }}><div style={{ color: "#c0c0c0", fontSize: 14, marginBottom: 20 }}>Presiona "Analizar IA" para un diagnostico completo.</div><button onClick={getAIAnalysis} style={{ background: "linear-gradient(135deg,#4f8ef7,#6c4ff7)", border: "none", borderRadius: 12, padding: "14px 28px", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Analizar ahora</button></div>}
              {aiAnalysis && <div style={{ fontSize: 14, lineHeight: 1.7, color: "#d0d0d0", whiteSpace: "pre-wrap" }}>{aiAnalysis}</div>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[["Ahorro", savingsRate+"%", "#4f8ef7"], ["Cartera", formatCurrency(totalCurrent), "#4ff7a0"], ["Rend.", formatPct(totalGainPct), totalGainPct >= 0 ? "#4ff7a0" : "#f74f4f"]].map(s => (
                <div key={s[0]} style={{ background: "#1a1f2e", borderRadius: 14, padding: "14px 10px", border: "1px solid #1e2330", textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: s[2] }}>{s[1]}</div>
                  <div style={{ fontSize: 10, color: "#5a6478", marginTop: 4, fontWeight: 600 }}>{s[0]}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#0d0f14}
        ::-webkit-scrollbar-thumb{background:#1e2330;border-radius:99px}
        input,select,textarea{outline:none}
        input::placeholder,textarea::placeholder{color:#3a4050}
      `}</style>
    </div>
  );
}
