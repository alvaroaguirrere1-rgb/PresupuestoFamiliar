import { useState, useEffect, useRef } from "react";

const CATEGORIES = [
  { id: "vivienda", label: "Vivienda", emoji: "ðŸ ", color: "#4f8ef7" },
  { id: "comida", label: "Comida", emoji: "ðŸ½ï¸", color: "#f7874f" },
  { id: "transporte", label: "Transporte", emoji: "ðŸš—", color: "#f7c84f" },
  { id: "salud", label: "Salud", emoji: "ðŸ’Š", color: "#4ff7a0" },
  { id: "entretenimiento", label: "Entretenimiento", emoji: "ðŸŽ¬", color: "#c44ff7" },
  { id: "educacion", label: "EducaciÃ³n", emoji: "ðŸ“š", color: "#4ff7f0" },
  { id: "ropa", label: "Ropa", emoji: "ðŸ‘•", color: "#f74f8e" },
  { id: "otros", label: "Otros", emoji: "ðŸ“¦", color: "#a0a0a0" },
];

function formatCurrency(n) {
  return "$" + Number(n).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function generateId() { return Math.random().toString(36).slice(2, 9); }

const SAMPLE_EXPENSES = [
  { id: "s1", desc: "Renta", amount: 8500, category: "vivienda", date: "2026-05-01", type: "expense" },
  { id: "s2", desc: "Super semana", amount: 1200, category: "comida", date: "2026-05-05", type: "expense" },
  { id: "s3", desc: "Gasolina", amount: 600, category: "transporte", date: "2026-05-08", type: "expense" },
  { id: "s4", desc: "Netflix + Spotify", amount: 350, category: "entretenimiento", date: "2026-05-10", type: "expense" },
  { id: "s5", desc: "Farmacia", amount: 420, category: "salud", date: "2026-05-12", type: "expense" },
  { id: "s6", desc: "Restaurante cumpleaÃ±os", amount: 1800, category: "comida", date: "2026-05-15", type: "expense" },
  { id: "s7", desc: "Uber trabajo", amount: 280, category: "transporte", date: "2026-05-18", type: "expense" },
  { id: "s8", desc: "Curso online", amount: 499, category: "educacion", date: "2026-05-20", type: "expense" },
];
const SAMPLE_INCOME = [
  { id: "i1", desc: "Sueldo quincena 1", amount: 12000, category: "otros", date: "2026-05-15", type: "income" },
  { id: "i2", desc: "Sueldo quincena 2", amount: 12000, category: "otros", date: "2026-05-30", type: "income" },
];

const GOAL_EXAMPLES = [
  "Quiero ahorrar $50,000 para un viaje a Europa en 12 meses",
  "Necesito juntar $30,000 para el enganche de un coche en 6 meses",
  "Quiero crear un fondo de emergencia de 3 meses de gastos",
  "Quiero pagar mi deuda de tarjeta de $15,000 en 8 meses",
];

const inputStyle = {
  width: "100%",
  background: "#0d0f14",
  border: "1px solid #1e2330",
  borderRadius: 10,
  padding: "12px 14px",
  color: "#e0e0e0",
  fontSize: 14,
};

export default function App() {
  const [view, setView] = useState("dashboard");
  const [transactions, setTransactions] = useState([...SAMPLE_EXPENSES, ...SAMPLE_INCOME]);
  const [form, setForm] = useState({ desc: "", amount: "", category: "comida", type: "expense", date: new Date().toISOString().slice(0,10) });
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [animIn, setAnimIn] = useState(false);

  // METAS
  const [goals, setGoals] = useState([]);
  const [goalForm, setGoalForm] = useState({ text: "", targetAmount: "", deadline: "", saved: "0" });
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalAdvice, setGoalAdvice] = useState({});
  const [goalLoading, setGoalLoading] = useState({});
  const [activeGoalId, setActiveGoalId] = useState(null);

  // CHAT DE META
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { setTimeout(() => setAnimIn(true), 100); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

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

  const topCategory = byCategory[0];
  const usedPct = totalIncome > 0 ? Math.min((totalExpenses / totalIncome) * 100, 100) : 0;
  const donutR = 52, donutCirc = 2 * Math.PI * donutR;
  const donutOffset = donutCirc - (usedPct / 100) * donutCirc;

  function addTransaction() {
    if (!form.desc || !form.amount) return;
    setTransactions(prev => [...prev, { ...form, id: generateId(), amount: parseFloat(form.amount) }]);
    setForm({ desc: "", amount: "", category: "comida", type: "expense", date: new Date().toISOString().slice(0,10) });
    setShowForm(false);
  }
  function deleteTransaction(id) { setTransactions(prev => prev.filter(t => t.id !== id)); }

  function addGoal() {
    if (!goalForm.text) return;
    const newGoal = { ...goalForm, id: generateId(), createdAt: new Date().toISOString().slice(0,10), saved: parseFloat(goalForm.saved) || 0, targetAmount: parseFloat(goalForm.targetAmount) || 0 };
    setGoals(prev => [...prev, newGoal]);
    setGoalForm({ text: "", targetAmount: "", deadline: "", saved: "0" });
    setShowGoalForm(false);
  }
  function deleteGoal(id) {
    setGoals(prev => prev.filter(g => g.id !== id));
    setGoalAdvice(prev => { const n = {...prev}; delete n[id]; return n; });
  }
  function updateGoalSaved(id, amount) {
    setGoals(prev => prev.map(g => g.id === id ? {...g, saved: Math.max(0, (g.saved || 0) + amount)} : g));
  }

  async function getGoalAdvice(goal) {
    setGoalLoading(prev => ({...prev, [goal.id]: true}));
    setGoalAdvice(prev => ({...prev, [goal.id]: ""}));
    setActiveGoalId(goal.id);
    // Init chat
    const systemMsg = buildGoalSystem(goal);
    const firstUserMsg = `Mi meta es: "${goal.text}". Monto objetivo: $${goal.targetAmount}. Fecha lÃ­mite: ${goal.deadline || "sin fecha"}. Ya tengo ahorrado: $${goal.saved}. Mi ingreso mensual es $${totalIncome} y mis gastos son $${totalExpenses}. Dame un plan concreto.`;
    setChatMessages([{ role: "user", content: firstUserMsg }]);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemMsg,
          messages: [{ role: "user", content: firstUserMsg }]
        })
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "Sin respuesta.";
      setChatMessages([{ role: "user", content: firstUserMsg }, { role: "assistant", content: text }]);
      setGoalAdvice(prev => ({...prev, [goal.id]: text}));
    } catch (e) {
      setChatMessages([{ role: "user", content: firstUserMsg }, { role: "assistant", content: "âŒ Error al conectar. Intenta de nuevo." }]);
    }
    setGoalLoading(prev => ({...prev, [goal.id]: false}));
  }

  function buildGoalSystem(goal) {
    return `Eres un coach financiero personal que habla espaÃ±ol latinoamericano. Ayudas a la persona a alcanzar su meta econÃ³mica especÃ­fica: "${goal.text}".
Eres directo, motivador y muy prÃ¡ctico. Das nÃºmeros concretos.
Cuando des un plan incluye: cuÃ¡nto ahorrar por mes, quÃ© gastos recortar, en cuÃ¡nto tiempo lo logra, y tips especÃ­ficos.
MÃ¡ximo 250 palabras por respuesta. Usa emojis con moderaciÃ³n.
Si el usuario hace preguntas de seguimiento, responde siempre en el contexto de esta meta.`;
  }

  async function sendChatMessage(goal) {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    const newMessages = [...chatMessages, { role: "user", content: userMsg }];
    setChatMessages(newMessages);
    setChatLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildGoalSystem(goal),
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "Sin respuesta.";
      setChatMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: "assistant", content: "âŒ Error. Intenta de nuevo." }]);
    }
    setChatLoading(false);
  }

  async function getAIAnalysis() {
    setAiLoading(true);
    setAiAnalysis("");
    setView("ai");
    const summary = {
      ingresoTotal: totalIncome, gastoTotal: totalExpenses, balance,
      tasaAhorro: savingsRate + "%",
      metas: goals.map(g => ({ meta: g.text, objetivo: g.targetAmount, ahorrado: g.saved })),
      porCategoria: byCategory.map(c => ({ categoria: c.label, monto: c.total })),
    };
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Eres un asesor financiero familiar amigable que habla espaÃ±ol latinoamericano. 
Analiza el presupuesto y da consejos CONCRETOS. Considera las metas econÃ³micas del usuario si las hay.
Estructura:
1. ðŸ” DIAGNÃ“STICO RÃPIDO (2-3 lÃ­neas)
2. âš ï¸ LO QUE MÃS ME PREOCUPA (1-2 puntos)
3. ðŸ’¡ 3 ACCIONES CONCRETAS ESTA SEMANA
4. ðŸŽ¯ META DEL MES PRÃ“XIMO
MÃ¡ximo 300 palabras.`,
          messages: [{ role: "user", content: `Analiza mi presupuesto: ${JSON.stringify(summary)}` }]
        })
      });
      const data = await response.json();
      setAiAnalysis(data.content?.map(b => b.text || "").join("") || "Sin respuesta.");
    } catch (e) { setAiAnalysis("âŒ Error al conectar. Intenta de nuevo."); }
    setAiLoading(false);
  }

  const activeGoal = goals.find(g => g.id === activeGoalId);

  return (
    <div style={{ minHeight: "100vh", background: "#0d0f14", color: "#e8e8e8", fontFamily: "'DM Sans','Segoe UI',sans-serif", maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#1a1f2e,#141820)", padding: "28px 24px 20px", borderBottom: "1px solid #1e2330", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: "#5a6478", fontWeight: 600, textTransform: "uppercase" }}>Mayo 2026</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginTop: 2 }}>Mi Presupuesto</div>
          </div>
          <button onClick={getAIAnalysis} style={{ background: "linear-gradient(135deg,#4f8ef7,#6c4ff7)", border: "none", borderRadius: 12, padding: "10px 16px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 20px rgba(79,142,247,0.35)" }}>
            âœ¨ Analizar
          </button>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 18 }}>
          {[["dashboard","ðŸ“Š"],["gastos","ðŸ’¸"],["ingresos","ðŸ’°"],["metas","ðŸŽ¯"],["ai","ðŸ¤–"]].map(([id, label]) => (
            <button key={id} onClick={() => setView(id)} style={{ flex: 1, padding: "8px 4px", borderRadius: 10, border: "none", background: view === id ? "linear-gradient(135deg,#4f8ef7,#6c4ff7)" : "#1e2330", color: view === id ? "#fff" : "#5a6478", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 20px 100px", opacity: animIn ? 1 : 0, transform: animIn ? "none" : "translateY(16px)", transition: "all 0.4s ease" }}>

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div>
            <div style={{ background: "linear-gradient(135deg,#1a1f2e,#141820)", borderRadius: 20, padding: 24, border: "1px solid #1e2330", marginBottom: 16, display: "flex", alignItems: "center", gap: 24 }}>
              <svg width={130} height={130} style={{ flexShrink: 0 }}>
                <circle cx={65} cy={65} r={donutR} fill="none" stroke="#1e2330" strokeWidth={14} />
                <circle cx={65} cy={65} r={donutR} fill="none" stroke={usedPct > 90 ? "#f74f4f" : usedPct > 70 ? "#f7c84f" : "#4f8ef7"} strokeWidth={14} strokeDasharray={donutCirc} strokeDashoffset={donutOffset} strokeLinecap="round" transform="rotate(-90 65 65)" style={{ transition: "stroke-dashoffset 1s ease" }} />
                <text x={65} y={60} textAnchor="middle" fill="#fff" fontSize={18} fontWeight={700}>{usedPct.toFixed(0)}%</text>
                <text x={65} y={76} textAnchor="middle" fill="#5a6478" fontSize={10}>gastado</text>
              </svg>
              <div style={{ flex: 1 }}>
                {[["INGRESOS", totalIncome, "#4ff7a0"], ["GASTOS", totalExpenses, "#f74f4f"], ["BALANCE", balance, balance >= 0 ? "#4ff7a0" : "#f74f4f"]].map(([l, v, c]) => (
                  <div key={l} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#5a6478", fontWeight: 600 }}>{l}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{formatCurrency(v)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ background: "#1a1f2e", borderRadius: 16, padding: 16, border: "1px solid #1e2330" }}>
                <div style={{ fontSize: 11, color: "#5a6478", fontWeight: 600 }}>TASA DE AHORRO</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: parseFloat(savingsRate) >= 20 ? "#4ff7a0" : parseFloat(savingsRate) >= 10 ? "#f7c84f" : "#f74f4f", marginTop: 4 }}>{savingsRate}%</div>
                <div style={{ fontSize: 11, color: "#5a6478", marginTop: 4 }}>Meta: 20%</div>
              </div>
              <div style={{ background: "#1a1f2e", borderRadius: 16, padding: 16, border: "1px solid #1e2330" }}>
                <div style={{ fontSize: 11, color: "#5a6478", fontWeight: 600 }}>METAS ACTIVAS</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#c44ff7", marginTop: 4 }}>{goals.length}</div>
                <div style={{ fontSize: 11, color: "#5a6478", marginTop: 4, cursor: "pointer", textDecoration: "underline" }} onClick={() => setView("metas")}>Ver metas â†’</div>
              </div>
            </div>
            <div style={{ background: "#1a1f2e", borderRadius: 20, padding: 20, border: "1px solid #1e2330" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Gastos por categorÃ­a</div>
              {byCategory.map(cat => (
                <div key={cat.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "#c0c0c0" }}>{cat.emoji} {cat.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{formatCurrency(cat.total)}</span>
                  </div>
                  <div style={{ height: 6, background: "#0d0f14", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: totalExpenses > 0 ? (cat.total / totalExpenses * 100) + "%" : "0%", background: cat.color, borderRadius: 99, transition: "width 0.8s ease" }} />
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
              <div style={{ fontSize: 16, fontWeight: 700 }}>{view === "gastos" ? "ðŸ’¸ Gastos" : "ðŸ’° Ingresos"}</div>
              <button onClick={() => setShowForm(true)} style={{ background: "linear-gradient(135deg,#4f8ef7,#6c4ff7)", border: "none", borderRadius: 10, padding: "8px 14px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Agregar</button>
            </div>
            {showForm && (
              <div style={{ background: "#1a1f2e", borderRadius: 16, padding: 20, border: "1px solid #4f8ef7", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Nueva transacciÃ³n</div>
                <div style={{ display: "grid", gap: 10 }}>
                  <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))} style={inputStyle}>
                    <option value="expense">ðŸ’¸ Gasto</option>
                    <option value="income">ðŸ’° Ingreso</option>
                  </select>
                  <input placeholder="DescripciÃ³n" value={form.desc} onChange={e => setForm(f => ({...f, desc: e.target.value}))} style={inputStyle} />
                  <input type="number" placeholder="Monto $" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} style={inputStyle} />
                  <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                  </select>
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
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: cat?.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{cat?.emoji || "ðŸ“¦"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e0e0e0" }}>{t.desc}</div>
                    <div style={{ fontSize: 11, color: "#5a6478", marginTop: 2 }}>{t.date} Â· {cat?.label}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: t.type === "expense" ? "#f74f4f" : "#4ff7a0" }}>{t.type === "expense" ? "-" : "+"}{formatCurrency(t.amount)}</div>
                    <button onClick={() => deleteTransaction(t.id)} style={{ background: "none", border: "none", color: "#3a3f50", fontSize: 11, cursor: "pointer", marginTop: 2 }}>âœ• borrar</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* METAS */}
        {view === "metas" && !activeGoalId && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>ðŸŽ¯ Mis Metas</div>
              <button onClick={() => setShowGoalForm(true)} style={{ background: "linear-gradient(135deg,#c44ff7,#6c4ff7)", border: "none", borderRadius: 10, padding: "8px 14px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Nueva Meta</button>
            </div>

            {showGoalForm && (
              <div style={{ background: "#1a1f2e", borderRadius: 16, padding: 20, border: "1px solid #c44ff7", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Â¿CuÃ¡l es tu meta?</div>
                <div style={{ fontSize: 12, color: "#5a6478", marginBottom: 14 }}>EscrÃ­bela con detalle, la IA la entenderÃ¡ mejor</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                  {GOAL_EXAMPLES.map((ex, i) => (
                    <button key={i} onClick={() => setGoalForm(f => ({...f, text: ex}))} style={{ background: "#0d0f14", border: "1px solid #2a2f40", borderRadius: 20, padding: "6px 12px", color: "#8a94a8", fontSize: 11, cursor: "pointer", textAlign: "left" }}>{ex}</button>
                  ))}
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  <textarea
                    placeholder="Ej: Quiero ahorrar $80,000 para comprar una moto en 10 meses"
                    value={goalForm.text}
                    onChange={e => setGoalForm(f => ({...f, text: e.target.value}))}
                    rows={3}
                    style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
                  />
                  <input type="number" placeholder="Monto objetivo $ (opcional)" value={goalForm.targetAmount} onChange={e => setGoalForm(f => ({...f, targetAmount: e.target.value}))} style={inputStyle} />
                  <input type="number" placeholder="Ya tengo ahorrado $ (opcional)" value={goalForm.saved} onChange={e => setGoalForm(f => ({...f, saved: e.target.value}))} style={inputStyle} />
                  <input type="date" value={goalForm.deadline} onChange={e => setGoalForm(f => ({...f, deadline: e.target.value}))} style={inputStyle} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={addGoal} style={{ flex: 1, background: "linear-gradient(135deg,#c44ff7,#6c4ff7)", border: "none", borderRadius: 10, padding: 12, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Crear Meta</button>
                    <button onClick={() => setShowGoalForm(false)} style={{ flex: 1, background: "#0d0f14", border: "1px solid #1e2330", borderRadius: 10, padding: 12, color: "#5a6478", fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}

            {goals.length === 0 && !showGoalForm && (
              <div style={{ textAlign: "center", padding: "40px 20px", background: "#1a1f2e", borderRadius: 20, border: "1px solid #1e2330" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>ðŸŽ¯</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Define tu primera meta</div>
                <div style={{ fontSize: 13, color: "#5a6478", marginBottom: 20 }}>La IA te darÃ¡ un plan concreto para alcanzarla con tu presupuesto actual</div>
                <button onClick={() => setShowGoalForm(true)} style={{ background: "linear-gradient(135deg,#c44ff7,#6c4ff7)", border: "none", borderRadius: 12, padding: "12px 24px", color: "#fff", fontWeight: 700, cursor: "pointer" }}>+ Crear Meta</button>
              </div>
            )}

            {goals.map(goal => {
              const pct = goal.targetAmount > 0 ? Math.min((goal.saved / goal.targetAmount) * 100, 100) : 0;
              const remaining = goal.targetAmount - (goal.saved || 0);
              return (
                <div key={goal.id} style={{ background: "#1a1f2e", borderRadius: 20, padding: 20, border: "1px solid #2a2f40", marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#e0e0e0", lineHeight: 1.5 }}>{goal.text}</div>
                    <button onClick={() => deleteGoal(goal.id)} style={{ background: "none", border: "none", color: "#3a3f50", fontSize: 16, cursor: "pointer", marginLeft: 8 }}>âœ•</button>
                  </div>

                  {goal.targetAmount > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: "#5a6478" }}>Ahorrado: {formatCurrency(goal.saved || 0)}</span>
                        <span style={{ fontSize: 12, color: "#c44ff7", fontWeight: 700 }}>{pct.toFixed(0)}%</span>
                      </div>
                      <div style={{ height: 8, background: "#0d0f14", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: pct + "%", background: "linear-gradient(90deg,#c44ff7,#6c4ff7)", borderRadius: 99, transition: "width 0.8s ease" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                        <span style={{ fontSize: 11, color: "#5a6478" }}>Faltan: {formatCurrency(remaining > 0 ? remaining : 0)}</span>
                        {goal.deadline && <span style={{ fontSize: 11, color: "#5a6478" }}>ðŸ“… {goal.deadline}</span>}
                      </div>
                    </div>
                  )}

                  {goal.targetAmount > 0 && (
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      {[500, 1000, 2000].map(amt => (
                        <button key={amt} onClick={() => updateGoalSaved(goal.id, amt)} style={{ flex: 1, background: "#0d0f14", border: "1px solid #1e2330", borderRadius: 8, padding: "6px 4px", color: "#4ff7a0", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+${amt}</button>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => { getGoalAdvice(goal); setView("chat"); }}
                    style={{ width: "100%", background: goalAdvice[goal.id] ? "#1e2330" : "linear-gradient(135deg,#c44ff7,#6c4ff7)", border: goalAdvice[goal.id] ? "1px solid #c44ff7" : "none", borderRadius: 12, padding: "12px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    {goalLoading[goal.id] ? "â³ Analizando..." : goalAdvice[goal.id] ? "ðŸ’¬ Continuar chat" : "âœ¨ Crear plan con IA"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* CHAT DE META */}
        {view === "chat" && activeGoal && (
          <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <button onClick={() => { setView("metas"); setActiveGoalId(null); }} style={{ background: "#1e2330", border: "none", borderRadius: 8, padding: "6px 12px", color: "#5a6478", cursor: "pointer", fontSize: 13 }}>â† Volver</button>
              <div style={{ fontSize: 13, color: "#c44ff7", fontWeight: 700 }}>ðŸŽ¯ Coach de Meta</div>
            </div>

            <div style={{ background: "#1a1f2e", borderRadius: 14, padding: "12px 14px", border: "1px solid #2a2f40", marginBottom: 14, fontSize: 12, color: "#8a94a8", lineHeight: 1.5 }}>
              {activeGoal.text}
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 8 }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "85%",
                    background: msg.role === "user" ? "linear-gradient(135deg,#4f8ef7,#6c4ff7)" : "#1e2330",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    padding: "12px 14px",
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: "#e0e0e0",
                    whiteSpace: "pre-wrap",
                    border: msg.role === "assistant" ? "1px solid #2a2f40" : "none",
                  }}>{msg.content}</div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{ background: "#1e2330", borderRadius: "16px 16px 16px 4px", padding: "14px 18px", border: "1px solid #2a2f40", display: "flex", gap: 6 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#c44ff7", animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChatMessage(activeGoal)}
                placeholder="Pregunta algo sobre tu meta..."
                style={{ ...inputStyle, flex: 1 }}
              />
              <button onClick={() => sendChatMessage(activeGoal)} disabled={chatLoading || !chatInput.trim()} style={{ background: "linear-gradient(135deg,#c44ff7,#6c4ff7)", border: "none", borderRadius: 10, padding: "12px 16px", color: "#fff", fontWeight: 700, cursor: "pointer", opacity: chatLoading || !chatInput.trim() ? 0.5 : 1 }}>âž¤</button>
            </div>
          </div>
        )}

        {/* AI GENERAL */}
        {view === "ai" && (
          <div>
            <div style={{ background: "linear-gradient(135deg,#1a1f2e,#141820)", borderRadius: 20, padding: 24, border: "1px solid #4f8ef7", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#4f8ef7,#6c4ff7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>ðŸ¤–</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>AnÃ¡lisis General</div>
                  <div style={{ fontSize: 11, color: "#5a6478" }}>Basado en tu presupuesto y metas</div>
                </div>
              </div>
              {aiLoading && (
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>â³</div>
                  <div style={{ color: "#5a6478", fontSize: 14 }}>Analizando tu presupuesto...</div>
                  <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 6 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#4f8ef7", animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                  </div>
                </div>
              )}
              {!aiLoading && !aiAnalysis && (
                <div style={{ textAlign: "center", padding: "30px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>âœ¨</div>
                  <div style={{ color: "#c0c0c0", fontSize: 14, marginBottom: 20 }}>Presiona "Analizar" arriba para obtener un diagnÃ³stico completo de tus finanzas.</div>
                  <button onClick={getAIAnalysis} style={{ background: "linear-gradient(135deg,#4f8ef7,#6c4ff7)", border: "none", borderRadius: 12, padding: "14px 28px", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>âœ¨ Analizar ahora</button>
                </div>
              )}
              {aiAnalysis && <div style={{ fontSize: 14, lineHeight: 1.7, color: "#d0d0d0", whiteSpace: "pre-wrap" }}>{aiAnalysis}</div>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[["Ingresos", formatCurrency(totalIncome), "#4ff7a0"], ["Gastos", formatCurrency(totalExpenses), "#f74f4f"], ["Ahorro", savingsRate + "%", "#4f8ef7"]].map(s => (
                <div key={s[0]} style={{ background: "#1a1f2e", borderRadius: 14, padding: "14px 10px", border: "1px solid #1e2330", textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: s[2] }}>{s[1]}</div>
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
