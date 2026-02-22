import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AthenaCodeWalkthrough } from './AthenaCodeDemo';

/* ══════════════════════════════════════════════════════════════
   GaiaExperience — Full-screen guided tour
   
   Each slide occupies 100vh with scroll-snap.
   GAIA narrates each section with audio + subtitles.
   Mini-demos recreate REAL product views from mercuria-cortex-miss.
   ══════════════════════════════════════════════════════════════ */

// ── Types ──
interface GaiaAudio {
  play: (id: string) => Promise<void>;
  playSequence: (ids: string[], delay?: number) => Promise<void>;
  stop: () => void;
  enable: () => void;
  preload: (id: string) => void;
  preloadMany: (ids: string[]) => void;
  isPlaying: boolean;
  currentClip: string | null;
  enabled: boolean;
  getClip: (id: string) => { text: string; duration: number } | null;
}

interface SlideConfig {
  id: string;
  narration: string[];
  color: string; // accent color
}

const SLIDES: SlideConfig[] = [
  { id: 'slide-ceo', narration: ['athena_code_1', 'athena_code_2', 'athena_code_3', 'athena_code_4'], color: '#06b6d4' },
  { id: 'slide-problema', narration: ['pain_intro', 'pain_solucion'], color: '#ef4444' },
  { id: 'slide-hermes', narration: ['mod_hermes_titulo', 'mod_hermes_desc', 'mod_hermes_dato'], color: '#10b981' },
  { id: 'slide-mercuria', narration: ['mod_commerce_titulo', 'mod_commerce_desc'], color: '#f59e0b' },
  { id: 'slide-hephaestus', narration: ['mod_hephaestus_titulo', 'mod_hephaestus_desc'], color: '#a855f7' },
  { id: 'slide-iris', narration: ['mod_iris_titulo', 'mod_iris_desc'], color: '#0ea5e9' },
  { id: 'slide-comparacion', narration: ['comp_intro', 'comp_precio'], color: '#8b5cf6' },
  { id: 'slide-precio', narration: ['precio_titulo', 'precio_core', 'precio_cierre'], color: '#f59e0b' },
  { id: 'slide-final', narration: ['cierre_pregunta', 'cierre_accion'], color: '#06b6d4' },
];

// ── Utility Hooks ──
function useCountUp(target: number, duration = 1500, active = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) { setValue(0); return; }
    const start = performance.now();
    let raf: number;
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(Math.round(target * ease));
      if (t < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return value;
}

function useStaggerReveal(count: number, active: boolean, staggerMs = 150) {
  const [revealed, setRevealed] = useState<boolean[]>(Array(count).fill(false));
  useEffect(() => {
    if (!active) { setRevealed(Array(count).fill(false)); return; }
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < count; i++) {
      timers.push(setTimeout(() => {
        setRevealed(prev => { const next = [...prev]; next[i] = true; return next; });
      }, i * staggerMs));
    }
    return () => timers.forEach(clearTimeout);
  }, [active, count, staggerMs]);
  return revealed;
}

// ══════════════════════════════════════
// ── MINI-DEMO: Score Arc (CEO Pulse) ──
// ══════════════════════════════════════
function ScoreArc({ score, active }: { score: number; active: boolean }) {
  const animatedScore = useCountUp(score, 1800, active);
  const r = 38;
  const circumference = 2 * Math.PI * r;
  const arcLength = circumference * 0.75;
  const progress = active ? (animatedScore / 100) : 0;
  const offset = arcLength - (arcLength * progress);
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  const glow = score >= 70 ? 'rgba(16,185,129,0.4)' : score >= 40 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.5)';

  return (
    <div className="exp-score-arc">
      <svg viewBox="0 0 100 100" className="w-24 h-24" style={{ transform: 'rotate(-135deg)' }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`} />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.8s ease-out', filter: `drop-shadow(${glow})` }} />
      </svg>
      <div className="exp-score-value" style={{ color }}>
        <span className="text-2xl font-bold tabular-nums">{animatedScore}</span>
        <span className="text-[9px] uppercase tracking-widest text-white/40">pulse</span>
      </div>
    </div>
  );
}

// ── Mini KPI Card ──
function MiniKPI({ label, value, trend, color, active, delay = 0 }: {
  label: string; value: string; trend: string; color: string; active: boolean; delay?: number;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!active) { setShow(false); return; }
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [active, delay]);

  return (
    <div className={`exp-kpi-card ${show ? 'exp-kpi-visible' : ''}`} style={{ borderLeftColor: color }}>
      <div className="text-[10px] text-white/50 uppercase tracking-wider">{label}</div>
      <div className="text-lg font-bold tabular-nums" style={{ color }}>{value}</div>
      <div className={`text-[10px] font-medium ${trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{trend}</div>
      {/* Mini sparkline */}
      <svg viewBox="0 0 60 16" className="w-full h-3 mt-1 opacity-60">
        <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"
          points="0,12 8,10 16,13 24,8 32,11 40,6 48,9 56,4 60,7"
          style={{ strokeDasharray: show ? 'none' : '100', strokeDashoffset: show ? '0' : '100',
            transition: 'stroke-dashoffset 1.5s ease-out' }} />
      </svg>
    </div>
  );
}

// ══════════════════════════════════════
// ── MINI-DEMO: CEO Dashboard ──
// ══════════════════════════════════════
function DemoCEO({ active }: { active: boolean }) {
  return (
    <div className="exp-demo-frame exp-demo-ceo">
      {/* Header bar */}
      <div className="exp-demo-header">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-white/80">CEO PULSE</span>
        </div>
        <span className="text-[9px] text-white/40 font-mono">LIVE</span>
      </div>

      {/* Score + KPIs row */}
      <div className="flex items-start gap-4 p-4">
        <ScoreArc score={87} active={active} />
        <div className="flex-1 grid grid-cols-1 gap-2">
          <MiniKPI label="Revenue" value="$142,800" trend="+8.5%" color="#00f6ff" active={active} delay={400} />
          <MiniKPI label="Margen" value="34.2%" trend="+2.1%" color="#00ff88" active={active} delay={600} />
          <MiniKPI label="Anomalías" value="2" trend="-3" color="#ff6b00" active={active} delay={800} />
        </div>
      </div>

      {/* Anomaly alert */}
      <div className={`exp-anomaly-card ${active ? 'exp-anomaly-visible' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-amber-400">ANOMALÍA DETECTADA</span>
        </div>
        <p className="text-[10px] text-white/70 leading-relaxed">
          Ventas de "Tornillo HEX M8" cayeron 45% vs promedio. Stock alto (340 unidades). 
          <span className="text-cyan-400"> Recomendación: promoción o ajuste de precio.</span>
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// ── MINI-DEMO: Hermes ERP ──
// ══════════════════════════════════════
function DemoHermes({ active }: { active: boolean }) {
  const items = useStaggerReveal(4, active, 200);
  const revenue = useCountUp(48500, 1500, active);
  const products = [
    { sku: 'MDA-5T', name: 'Motor DC 5V', stock: 4, price: '$3,200', status: 'warning' },
    { sku: 'CBT-HD', name: 'Cable HDMI 2m', stock: 128, price: '$189', status: 'ok' },
    { sku: 'PLB-CNC', name: 'Placa CNC v3', stock: 0, price: '$1,450', status: 'critical' },
    { sku: 'RES-1K', name: 'Resistencia 1KΩ', stock: 2340, price: '$2.50', status: 'ok' },
  ];

  return (
    <div className="exp-demo-frame exp-demo-hermes">
      {/* Hermes hero banner */}
      <div className="exp-hermes-hero">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[9px] text-emerald-200/60 uppercase tracking-widest font-medium">Hermes · ERP</div>
            <div className="text-base font-bold text-white mt-0.5">Panel de Control</div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[9px] text-emerald-100/80">Conectado</span>
          </div>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-2 gap-2 p-3">
        {[
          { label: 'Venta Hoy', value: `$${revenue.toLocaleString()}`, color: 'text-emerald-400' },
          { label: 'Productos', value: '1,247', color: 'text-emerald-400' },
          { label: 'Stock Bajo', value: '8', color: 'text-amber-400' },
          { label: 'Facturas Pend.', value: '3', color: 'text-rose-400' },
        ].map((kpi, i) => (
          <div key={i} className={`exp-hermes-kpi ${items[i] ? 'exp-hermes-kpi-visible' : ''}`}>
            <div className="text-[9px] text-white/40 uppercase tracking-wider">{kpi.label}</div>
            <div className={`text-lg font-bold tabular-nums ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Product table */}
      <div className="px-3 pb-3">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="text-white/30 uppercase tracking-wider">
              <th className="text-left pb-1 font-medium">SKU</th>
              <th className="text-left pb-1 font-medium">Producto</th>
              <th className="text-right pb-1 font-medium">Stock</th>
              <th className="text-right pb-1 font-medium">Precio</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={i} className={`border-t border-white/5 ${items[i] ? 'opacity-100' : 'opacity-0'}`}
                style={{ transition: `opacity 0.4s ease ${i * 0.15}s` }}>
                <td className="py-1.5 text-white/60 font-mono">{p.sku}</td>
                <td className="py-1.5 text-white/80">{p.name}</td>
                <td className={`py-1.5 text-right font-mono ${p.status === 'critical' ? 'text-rose-400' : p.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {p.stock}
                </td>
                <td className="py-1.5 text-right text-white/60">{p.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// ── MINI-DEMO: Mercuria Commerce ──
// ══════════════════════════════════════
function DemoMercuria({ active }: { active: boolean }) {
  const cards = useStaggerReveal(6, active, 180);
  const productos = [
    { name: 'Motor DC 5V', price: '$3,200', initial: 'M', gradient: 'from-amber-600 to-orange-500' },
    { name: 'Cable HDMI', price: '$189', initial: 'C', gradient: 'from-cyan-600 to-blue-500' },
    { name: 'Placa Arduino', price: '$450', initial: 'P', gradient: 'from-emerald-600 to-teal-500' },
    { name: 'Sensor PIR', price: '$125', initial: 'S', gradient: 'from-violet-600 to-purple-500' },
    { name: 'LED RGB 5mm', price: '$8', initial: 'L', gradient: 'from-rose-600 to-pink-500' },
    { name: 'Fuente 12V', price: '$285', initial: 'F', gradient: 'from-sky-600 to-indigo-500' },
  ];

  return (
    <div className="exp-demo-frame exp-demo-mercuria">
      {/* Store hero */}
      <div className="exp-mercuria-hero">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm">🛍️</div>
            <div>
              <div className="text-xs font-bold text-amber-50">ElectroTech MX</div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[9px] text-green-300">En línea</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-amber-200/60">Venta Hoy</div>
            <div className="text-base font-bold font-mono text-amber-400">$8,400</div>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-3 gap-2 p-3">
        {productos.map((p, i) => (
          <div key={i} className={`exp-product-card ${cards[i] ? 'exp-product-visible' : ''}`}>
            <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${p.gradient} flex items-center justify-center`}>
              <span className="text-lg font-bold text-white/80">{p.initial}</span>
            </div>
            <div className="mt-1.5">
              <div className="text-[9px] text-white/70 truncate">{p.name}</div>
              <div className="text-[10px] font-bold text-amber-400">{p.price}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Notification */}
      <div className={`exp-mercuria-notif ${active ? 'exp-mercuria-notif-show' : ''}`}>
        <span className="text-[10px]">🛒</span>
        <span className="text-[10px] text-white/80">Nuevo pedido · <span className="text-amber-400 font-medium">$1,250</span></span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// ── MINI-DEMO: Hephaestus Work Graph ──
// ══════════════════════════════════════
function DemoWorkGraph({ active }: { active: boolean }) {
  const nodes = useMemo(() => [
    { x: 200, y: 40, label: 'Proyecto Alpha', type: 'category', status: 'active', w: 110, h: 30 },
    { x: 80, y: 100, label: 'Recibir Material', type: 'task', status: 'completed', w: 100, h: 28 },
    { x: 220, y: 95, label: 'Corte CNC', type: 'task', status: 'completed', w: 80, h: 28 },
    { x: 340, y: 100, label: 'Ensamblaje', type: 'task', status: 'active', w: 85, h: 28 },
    { x: 130, y: 165, label: 'Verificar Calidad', type: 'milestone', status: 'pending', w: 100, h: 28 },
    { x: 280, y: 170, label: 'Empaque', type: 'task', status: 'pending', w: 72, h: 28 },
    { x: 350, y: 230, label: 'Entrega Final', type: 'deliverable', status: 'pending', w: 90, h: 28 },
    { x: 70, y: 230, label: 'Fotos de Prueba', type: 'task', status: 'active', w: 95, h: 28 },
  ], []);

  const edges = useMemo(() => [
    [0, 1], [0, 2], [1, 4], [2, 3], [3, 5], [4, 7], [5, 6], [7, 6],
  ], []);

  const getColor = (status: string) => {
    switch (status) {
      case 'completed': return { fill: 'rgba(16,185,129,0.15)', stroke: '#10b981', bar: '#10b981' };
      case 'active': return { fill: 'rgba(59,130,246,0.15)', stroke: '#3b82f6', bar: '#3b82f6' };
      case 'pending': return { fill: 'rgba(156,163,175,0.1)', stroke: '#6b7280', bar: '#6b7280' };
      default: return { fill: 'rgba(156,163,175,0.1)', stroke: '#6b7280', bar: '#6b7280' };
    }
  };

  return (
    <div className="exp-demo-frame exp-demo-hephaestus">
      <div className="exp-demo-header" style={{ borderBottomColor: 'rgba(168,85,247,0.2)' }}>
        <div className="flex items-center gap-2">
          <span className="text-sm">🔨</span>
          <span className="text-[11px] font-semibold text-white/80">HEPHAESTUS</span>
        </div>
        <span className="text-[9px] text-purple-400/60 font-mono">8 nodos · 3 activos</span>
      </div>
      <svg viewBox="0 0 420 270" className={`w-full ${active ? 'exp-graph-animate' : 'opacity-0'}`}
        style={{ transition: 'opacity 0.8s ease' }}>
        {/* Edges */}
        {edges.map(([from, to], i) => {
          const n1 = nodes[from], n2 = nodes[to];
          return (
            <line key={`e${i}`}
              x1={n1.x} y1={n1.y + n1.h / 2}
              x2={n2.x} y2={n2.y - n2.h / 2 + 4}
              stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4,3"
              className={active ? 'exp-edge-draw' : ''} style={{ animationDelay: `${0.3 + i * 0.1}s` }} />
          );
        })}
        {/* Nodes */}
        {nodes.map((n, i) => {
          const c = getColor(n.status);
          return (
            <g key={i} className={active ? 'exp-node-appear' : 'opacity-0'}
              style={{ animationDelay: `${0.2 + i * 0.12}s` }}>
              <rect x={n.x - n.w / 2} y={n.y - n.h / 2} width={n.w} height={n.h}
                rx="8" fill="rgba(10,14,28,0.88)" stroke={c.stroke} strokeWidth="1" strokeOpacity="0.4" />
              {/* Status stripe */}
              <rect x={n.x - n.w / 2} y={n.y - n.h / 2 + 4} width="3" height={n.h - 8}
                rx="1.5" fill={c.bar} opacity="0.8" />
              <text x={n.x + 4} y={n.y + 1} textAnchor="middle" fill="white" fillOpacity="0.85"
                fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif">
                {n.label}
              </text>
              {n.status === 'completed' && (
                <text x={n.x + n.w / 2 - 10} y={n.y + 2} fill="#10b981" fontSize="10">✓</text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ══════════════════════════════════════
// ── MINI-DEMO: Iris Org Rings ──
// ══════════════════════════════════════
function DemoIrisRings({ active }: { active: boolean }) {
  const agents = [
    { name: 'Hermes', angle: 0, color: '#f59e0b' },
    { name: 'Athena', angle: 60, color: '#3b82f6' },
    { name: 'Heph.', angle: 120, color: '#ef4444' },
    { name: 'Iris', angle: 180, color: '#0ea5e9' },
    { name: 'Hera', angle: 240, color: '#ec4899' },
    { name: 'Merc.', angle: 300, color: '#eab308' },
  ];
  const teams = [
    { name: 'Ventas', angle: 30 }, { name: 'Bodega', angle: 90 },
    { name: 'Admin', angle: 150 }, { name: 'Soporte', angle: 210 },
    { name: 'Compras', angle: 270 }, { name: 'Diseño', angle: 330 },
  ];
  const cx = 200, cy = 155;
  const r1 = 55, r2 = 100, r3 = 138;

  return (
    <div className="exp-demo-frame exp-demo-iris">
      <div className="exp-demo-header" style={{ borderBottomColor: 'rgba(14,165,233,0.2)' }}>
        <div className="flex items-center gap-2">
          <span className="text-sm">💬</span>
          <span className="text-[11px] font-semibold text-white/80">IRIS · COMMUNICATION HUB</span>
        </div>
      </div>
      <svg viewBox="0 0 400 310" className={`w-full ${active ? 'opacity-100' : 'opacity-0'}`}
        style={{ transition: 'opacity 0.8s ease 0.3s' }}>
        {/* Rings */}
        {[r1, r2, r3].map((r, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4,4" />
        ))}
        {/* Cortex connections (agents to GAIA) */}
        {agents.map((a, i) => {
          const ax = cx + r1 * Math.cos((a.angle * Math.PI) / 180);
          const ay = cy + r1 * Math.sin((a.angle * Math.PI) / 180);
          return <line key={`c${i}`} x1={cx} y1={cy} x2={ax} y2={ay}
            stroke="rgba(124,58,237,0.15)" strokeWidth="1" strokeDasharray="4,6"
            className={active ? 'exp-cortex-line' : 'opacity-0'}
            style={{ animationDelay: `${0.5 + i * 0.1}s` }} />;
        })}
        {/* Agent-Team connections */}
        {agents.map((a, i) => {
          const ax = cx + r1 * Math.cos((a.angle * Math.PI) / 180);
          const ay = cy + r1 * Math.sin((a.angle * Math.PI) / 180);
          const t = teams[i];
          const tx = cx + r2 * Math.cos((t.angle * Math.PI) / 180);
          const ty = cy + r2 * Math.sin((t.angle * Math.PI) / 180);
          return <line key={`at${i}`} x1={ax} y1={ay} x2={tx} y2={ty}
            stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />;
        })}
        {/* GAIA center node */}
        <circle cx={cx} cy={cy} r="18" fill="rgba(124,58,237,0.2)" stroke="rgba(124,58,237,0.8)"
          strokeWidth="2" className={active ? 'exp-gaia-center' : ''} />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
          fill="white" fontSize="8" fontWeight="700" fontFamily="Inter">GAIA</text>
        {/* Agent nodes */}
        {agents.map((a, i) => {
          const ax = cx + r1 * Math.cos((a.angle * Math.PI) / 180);
          const ay = cy + r1 * Math.sin((a.angle * Math.PI) / 180);
          return (
            <g key={`a${i}`} className={active ? 'exp-agent-node' : 'opacity-0'}
              style={{ animationDelay: `${0.3 + i * 0.12}s` }}>
              <circle cx={ax} cy={ay} r="14" fill={`${a.color}33`} stroke={a.color} strokeWidth="1.5" />
              <text x={ax} y={ay + 1} textAnchor="middle" dominantBaseline="middle"
                fill="white" fontSize="6" fontWeight="600">{a.name}</text>
            </g>
          );
        })}
        {/* Team nodes */}
        {teams.map((t, i) => {
          const tx = cx + r2 * Math.cos((t.angle * Math.PI) / 180);
          const ty = cy + r2 * Math.sin((t.angle * Math.PI) / 180);
          return (
            <g key={`t${i}`} className={active ? 'exp-team-node' : 'opacity-0'}
              style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
              <circle cx={tx} cy={ty} r="10" fill="rgba(157,78,221,0.15)" stroke="rgba(157,78,221,0.5)" strokeWidth="1" />
              <text x={tx} y={ty + 1} textAnchor="middle" dominantBaseline="middle"
                fill="white" fillOpacity="0.7" fontSize="5.5" fontWeight="500">{t.name}</text>
            </g>
          );
        })}
        {/* Some person dots on ring 3 */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30) + 15;
          const px = cx + r3 * Math.cos((angle * Math.PI) / 180);
          const py = cy + r3 * Math.sin((angle * Math.PI) / 180);
          return <circle key={`p${i}`} cx={px} cy={py} r="4" fill="rgba(255,255,255,0.08)"
            stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"
            className={active ? 'exp-person-dot' : 'opacity-0'}
            style={{ animationDelay: `${0.8 + i * 0.05}s` }} />;
        })}
        {/* Message particles */}
        {active && [0, 2, 4].map(i => {
          const a = agents[i];
          const ax = cx + r1 * Math.cos((a.angle * Math.PI) / 180);
          const ay = cy + r1 * Math.sin((a.angle * Math.PI) / 180);
          return (
            <circle key={`msg${i}`} r="2.5" fill="#06b6d4" className="exp-message-particle">
              <animateMotion dur="2s" repeatCount="indefinite" begin={`${i * 0.7}s`}>
                <mpath xlinkHref={`#path-${i}`} />
              </animateMotion>
            </circle>
          );
        })}
        {/* Paths for particles */}
        {[0, 2, 4].map(i => {
          const a = agents[i];
          const ax = cx + r1 * Math.cos((a.angle * Math.PI) / 180);
          const ay = cy + r1 * Math.sin((a.angle * Math.PI) / 180);
          return <path key={`path-${i}`} id={`path-${i}`} d={`M${cx},${cy} L${ax},${ay}`} fill="none" />;
        })}
      </svg>
    </div>
  );
}

// ══════════════════════════════════════
// ── MINI-DEMO: GAIA Chat ──
// ══════════════════════════════════════
function DemoChat({ active }: { active: boolean }) {
  const [messages, setMessages] = useState<number>(0);

  useEffect(() => {
    if (!active) { setMessages(0); return; }
    const timers = [
      setTimeout(() => setMessages(1), 600),
      setTimeout(() => setMessages(2), 2200),
      setTimeout(() => setMessages(3), 4000),
      setTimeout(() => setMessages(4), 5500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [active]);

  const chatMsgs = [
    { role: 'user', text: '¿Qué producto me deja más margen?' },
    { role: 'assistant', agent: 'Athena', color: 'text-violet-400', agentBg: 'bg-violet-500/15',
      text: 'Tu producto con mejor margen es "Placa CNC v3" con 42.3% de margen bruto. En los últimos 30 días generó $18,200 en utilidad.' },
    { role: 'user', text: '¿Y cuántas tengo en stock?' },
    { role: 'assistant', agent: 'Hermes', color: 'text-emerald-400', agentBg: 'bg-emerald-500/15',
      text: '0 unidades en stock 🔴. Último movimiento hace 12 días. Te sugiero ordenar 25 unidades — el proveedor "ElectroParts" tiene el mejor precio: $870 c/u.' },
  ];

  return (
    <div className="exp-demo-frame exp-demo-chat">
      <div className="exp-demo-header" style={{ borderBottomColor: 'rgba(6,182,212,0.2)' }}>
        <div className="flex items-center gap-2">
          <span className="text-sm">🧠</span>
          <span className="text-[11px] font-semibold text-white/80">GAIA ASSISTANT</span>
        </div>
        <div className="flex gap-1">
          {['emerald', 'violet', 'amber', 'sky', 'rose', 'yellow', 'cyan'].map(c => (
            <div key={c} className={`w-2 h-2 rounded-full bg-${c}-500/40`} />
          ))}
        </div>
      </div>
      <div className="p-3 space-y-3 overflow-hidden">
        {chatMsgs.map((msg, i) => {
          if (i >= messages) return null;
          if (msg.role === 'user') {
            return (
              <div key={i} className="flex justify-end exp-msg-enter">
                <div className="bg-cyan-600/20 border border-cyan-500/20 rounded-2xl rounded-br-sm px-3 py-2 max-w-[80%]">
                  <span className="text-[11px] text-white/90">{msg.text}</span>
                </div>
              </div>
            );
          }
          return (
            <div key={i} className="flex gap-2 exp-msg-enter">
              <div className={`w-6 h-6 rounded-full ${msg.agentBg} flex items-center justify-center shrink-0 mt-0.5`}>
                <span className="text-[10px]">{msg.agent === 'Athena' ? '📊' : '📦'}</span>
              </div>
              <div className="max-w-[85%]">
                <span className={`text-[10px] font-medium ${msg.color}`}>{msg.agent}</span>
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-3 py-2 mt-0.5">
                  <span className="text-[11px] text-white/80 leading-relaxed">{msg.text}</span>
                </div>
              </div>
            </div>
          );
        })}
        {/* Typing indicator */}
        {messages > 0 && messages < 4 && messages % 2 === 1 && (
          <div className="flex gap-2 items-center mt-2">
            <div className="w-6 h-6 rounded-full bg-cyan-500/15 flex items-center justify-center">
              <span className="text-[10px]">✦</span>
            </div>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── SLIDES ──
// ══════════════════════════════════════════════════════════════

function SlideShell({ children, id, accentColor, className = '' }: {
  children: React.ReactNode; id: string; accentColor: string; className?: string;
}) {
  return (
    <section id={id} className={`exp-slide ${className}`}>
      {/* Accent glow */}
      <div className="exp-slide-glow" style={{
        background: `radial-gradient(ellipse at 70% 30%, ${accentColor}15, transparent 60%)`,
      }} />
      <div className="exp-slide-glow-2" style={{
        background: `radial-gradient(ellipse at 20% 80%, ${accentColor}08, transparent 50%)`,
      }} />
      {children}
    </section>
  );
}

// ── Slide: El Problema ──
function SlideProblema({ active }: { active: boolean }) {
  const tools = ['📊 Excel', '📱 WhatsApp', '📝 Cuaderno', '🏦 Banco', '📧 Correo', '🧾 SAT', '📑 Post-its', '💻 3 sistemas'];
  const revealed = useStaggerReveal(tools.length, active, 120);

  return (
    <SlideShell id="slide-problema" accentColor="#ef4444" className="exp-slide-center">
      <div className="exp-slide-content text-center max-w-3xl mx-auto">
        <h2 className={`text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-8 lg:mb-12 ${active ? 'exp-text-enter' : 'opacity-0'}`}>
          ¿Cuántas herramientas usas<br />
          <span className="text-red-400">para manejar tu negocio?</span>
        </h2>

        <div className="flex flex-wrap justify-center gap-3 lg:gap-4 mb-8 lg:mb-12">
          {tools.map((tool, i) => (
            <div key={i} className={`px-4 py-2 lg:px-6 lg:py-3 rounded-xl bg-white/5 border border-white/10 text-sm lg:text-base xl:text-lg text-white/70
              ${revealed[i] ? 'exp-tool-visible' : 'exp-tool-hidden'}`}
              style={{ animationDelay: `${i * 0.12}s` }}>
              {tool}
            </div>
          ))}
        </div>

        <p className={`text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-white/50 font-light ${active ? 'exp-text-enter-delayed' : 'opacity-0'}`}>
          Y nada habla con nada.
        </p>

        <div className={`mt-12 ${active ? 'exp-text-enter-delayed-2' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 text-sm text-white/30">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Déjame mostrarte algo mejor
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

// ── Slide: CEO Dashboard / Athena (Code Walkthrough) ──
function SlideCEO({ active, currentClip }: { active: boolean; currentClip: string | null }) {
  return (
    <SlideShell id="slide-ceo" accentColor="#06b6d4">
      <AthenaCodeWalkthrough active={active} currentClip={currentClip} />
    </SlideShell>
  );
}

// ── Slide: Hermes ERP ──
function SlideHermes({ active }: { active: boolean }) {
  return (
    <SlideShell id="slide-hermes" accentColor="#10b981">
      <div className="exp-slide-content exp-split">
        <div className={`exp-split-text ${active ? 'exp-text-enter' : 'opacity-0'}`}>
          <div className="text-[11px] lg:text-xs xl:text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-3 lg:mb-4">Hermes · ERP</div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 lg:mb-6">
            Cada venta. Cada producto.<br />
            <span className="text-emerald-400">Todo conectado.</span>
          </h2>
          <p className="text-base lg:text-lg xl:text-xl text-white/50 leading-relaxed mb-6 lg:mb-8">
            Vendes algo → inventario baja → factura se genera → bodeguero recibe la orden en su celular.
            Sin copiar datos. Sin errores.
          </p>
          <div className="flex items-center gap-4 text-xs lg:text-sm text-white/30">
            <span>🧾 CFDI 4.0</span>
            <span>📦 Stock en tiempo real</span>
            <span>📊 Multi-precio</span>
          </div>
        </div>
        <div className={`exp-split-demo ${active ? 'exp-demo-enter' : 'opacity-0'}`}>
          <DemoHermes active={active} />
        </div>
      </div>
    </SlideShell>
  );
}

// ── Slide: Mercuria Commerce ──
function SlideMercuria({ active }: { active: boolean }) {
  return (
    <SlideShell id="slide-mercuria" accentColor="#f59e0b">
      <div className="exp-slide-content exp-split exp-split-reverse">
        <div className={`exp-split-demo ${active ? 'exp-demo-enter' : 'opacity-0'}`}>
          <DemoMercuria active={active} />
        </div>
        <div className={`exp-split-text ${active ? 'exp-text-enter' : 'opacity-0'}`}>
          <div className="text-[11px] lg:text-xs xl:text-sm font-semibold text-amber-400 uppercase tracking-widest mb-3 lg:mb-4">Mercuria · Commerce OS</div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 lg:mb-6">
            Tu tienda online.<br />
            <span className="text-amber-400">En 1 minuto.</span>
          </h2>
          <p className="text-base lg:text-lg xl:text-xl text-white/50 leading-relaxed mb-6 lg:mb-8">
            Elige tipo de negocio. Ponle nombre. Listo — tu catálogo sincronizado,
            pedidos por WhatsApp, stock en tiempo real. ¿MercadoLibre? También conectado.
          </p>
          <div className="flex items-center gap-4 text-xs lg:text-sm text-white/30">
            <span>🛒 Storefront propio</span>
            <span>💳 Pagos</span>
            <span>📦 Stock sync</span>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

// ── Slide: Hephaestus Work Graph ──
function SlideHephaestus({ active }: { active: boolean }) {
  return (
    <SlideShell id="slide-hephaestus" accentColor="#a855f7">
      <div className="exp-slide-content exp-split">
        <div className={`exp-split-text ${active ? 'exp-text-enter' : 'opacity-0'}`}>
          <div className="text-[11px] lg:text-xs xl:text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3 lg:mb-4">Hephaestus · Work Engine</div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 lg:mb-6">
            Cada tarea sabe quién la hace,<br />
            <span className="text-purple-400">cuándo y por qué.</span>
          </h2>
          <p className="text-base lg:text-lg xl:text-xl text-white/50 leading-relaxed mb-6 lg:mb-8">
            Grafos de trabajo inteligentes. El operador ve SUS tareas en el celular,
            sube foto del terminado, y el proyecto avanza solo. Adiós correos interminables.
          </p>
          <div className="flex items-center gap-4 text-xs lg:text-sm text-white/30">
            <span>📱 Vista mobile</span>
            <span>📸 Verificación foto</span>
            <span>🔀 Ruta crítica</span>
          </div>
        </div>
        <div className={`exp-split-demo ${active ? 'exp-demo-enter' : 'opacity-0'}`}>
          <DemoWorkGraph active={active} />
        </div>
      </div>
    </SlideShell>
  );
}

// ── Slide: Iris Communication ──
function SlideIris({ active }: { active: boolean }) {
  return (
    <SlideShell id="slide-iris" accentColor="#0ea5e9">
      <div className="exp-slide-content exp-split exp-split-reverse">
        <div className={`exp-split-demo ${active ? 'exp-demo-enter' : 'opacity-0'}`}>
          <DemoIrisRings active={active} />
        </div>
        <div className={`exp-split-text ${active ? 'exp-text-enter' : 'opacity-0'}`}>
          <div className="text-[11px] lg:text-xs xl:text-sm font-semibold text-sky-400 uppercase tracking-widest mb-3 lg:mb-4">Iris · Communication Hub</div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 lg:mb-6">
            Tu organización.<br />
            <span className="text-sky-400">Conectada.</span>
          </h2>
          <p className="text-base lg:text-lg xl:text-xl text-white/50 leading-relaxed mb-6 lg:mb-8">
            Chat interno, agentes AI que participan en la conversación,
            mapa organizacional en tiempo real. Todo sin salir del sistema.
          </p>
          <div className="flex items-center gap-4 text-xs lg:text-sm text-white/30">
            <span>💬 Canales</span>
            <span>🤖 AI Agents</span>
            <span>📊 Contexto integrado</span>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

// ── Slide: GAIA Chat ──
function SlideChat({ active }: { active: boolean }) {
  return (
    <SlideShell id="slide-chat" accentColor="#06b6d4">
      <div className="exp-slide-content exp-split">
        <div className={`exp-split-text ${active ? 'exp-text-enter' : 'opacity-0'}`}>
          <div className="text-[11px] lg:text-xs xl:text-sm font-semibold text-cyan-400 uppercase tracking-widest mb-3 lg:mb-4">GAIA · AI Assistant</div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 lg:mb-6">
            Pregúntale lo que quieras.<br />
            <span className="gradient-text">Responde con tus datos.</span>
          </h2>
          <p className="text-base lg:text-lg xl:text-xl text-white/50 leading-relaxed mb-6 lg:mb-8">
            "¿Qué producto me deja más margen?" "¿Qué compro mañana?"
            — Escríbelo como si hablaras con un experto. GAIA consulta tus datos reales
            y te responde en español, con números exactos.
          </p>
          <div className="flex items-center gap-4 text-xs lg:text-sm text-white/30">
            <span>🧠 Multi-agente</span>
            <span>📊 Datos reales</span>
            <span>🇲🇽 Español 24/7</span>
          </div>
        </div>
        <div className={`exp-split-demo ${active ? 'exp-demo-enter' : 'opacity-0'}`}>
          <DemoChat active={active} />
        </div>
      </div>
    </SlideShell>
  );
}

// ── Slide: Comparison ──
function SlideComparison({ active }: { active: boolean }) {
  const tools = [
    { name: 'ERP', alt: 'SAP · Odoo', price: '$500/mes', icon: '📦', gaia: 'Hermes' },
    { name: 'BI', alt: 'Power BI · Tableau', price: '$70 USD/usr', icon: '📊', gaia: 'Athena' },
    { name: 'PM', alt: 'Asana · Monday', price: '$30 USD/usr', icon: '🔨', gaia: 'Hephaestus' },
    { name: 'Chat', alt: 'Slack · Teams', price: '$12 USD/usr', icon: '💬', gaia: 'Iris' },
    { name: 'Tienda', alt: 'Shopify · TiendaNube', price: '$30-300 USD', icon: '🛍️', gaia: 'Mercuria' },
    { name: 'AI', alt: 'ChatGPT + copiar', price: '$20 USD/mes', icon: '🧠', gaia: 'GAIA' },
  ];
  const revealed = useStaggerReveal(6, active, 200);

  return (
    <SlideShell id="slide-comparacion" accentColor="#8b5cf6" className="exp-slide-center">
      <div className="exp-slide-content text-center max-w-5xl mx-auto">
        <h2 className={`text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 lg:mb-5 ${active ? 'exp-text-enter' : 'opacity-0'}`}>
          6 herramientas. <span className="gradient-text">1 solo precio.</span>
        </h2>
        <p className={`text-white/40 text-sm lg:text-base xl:text-lg mb-8 lg:mb-10 ${active ? 'exp-text-enter-delayed' : 'opacity-0'}`}>
          Lo que antes costaba $150-800 USD/mes en herramientas desconectadas.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4 mb-8 lg:mb-10">
          {tools.map((t, i) => (
            <div key={i} className={`exp-comp-card ${revealed[i] ? 'exp-comp-visible' : ''}`}>
              <span className="text-2xl lg:text-3xl mb-1 block">{t.icon}</span>
              <div className="text-xs lg:text-sm font-semibold text-white/80">{t.name}</div>
              <div className="text-[10px] lg:text-xs text-white/30 mb-1">{t.alt}</div>
              <div className="text-[10px] lg:text-xs text-red-400/70 line-through">{t.price}</div>
              <div className="text-[10px] lg:text-xs text-cyan-400 font-medium mt-1">→ {t.gaia}</div>
            </div>
          ))}
        </div>

        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${active ? 'exp-text-enter-delayed-2' : 'opacity-0'}`}>
          <div className="px-5 py-3 lg:px-8 lg:py-5 rounded-2xl border border-red-500/20 bg-red-500/5 text-center">
            <div className="text-xs lg:text-sm text-red-400/60">Stack tradicional</div>
            <div className="text-xl lg:text-2xl xl:text-3xl font-bold text-red-400">$150-800 USD/mes</div>
          </div>
          <span className="text-xl lg:text-3xl text-white/20">→</span>
          <div className="px-5 py-3 lg:px-8 lg:py-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 text-center">
            <div className="text-xs lg:text-sm text-cyan-400/60">GAIA Prime</div>
            <div className="text-xl lg:text-2xl xl:text-3xl font-bold text-cyan-400">GRATIS 3 meses</div>
            <div className="text-[10px] lg:text-xs text-white/30">Después: desde $300 MXN/mes</div>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

// ── Slide: Pricing ──
function SlidePricing({ active, onStartTrial }: { active: boolean; onStartTrial: () => void }) {
  return (
    <SlideShell id="slide-precio" accentColor="#f59e0b" className="exp-slide-center">
      <div className="exp-slide-content max-w-4xl mx-auto">
        <h2 className={`text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-center mb-8 lg:mb-12 ${active ? 'exp-text-enter' : 'opacity-0'}`}>
          Simple. <span className="gradient-text">Sin sorpresas.</span>
        </h2>

        <div className={`grid sm:grid-cols-2 gap-4 lg:gap-6 ${active ? 'exp-text-enter-delayed' : 'opacity-0'}`}>
          {/* Core */}
          <div className="rounded-2xl p-6 bg-white/[.03] border-2 border-cyan-500/30 relative">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-[10px] text-cyan-400 font-semibold">
              ⭐ Recomendado
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-white mt-2">GAIA Core</h3>
            <div className="mt-3 mb-1">
              <span className="text-4xl lg:text-5xl font-bold text-white">GRATIS</span>
            </div>
            <p className="text-sm lg:text-base text-cyan-400 font-medium">3 meses completos</p>
            <p className="text-xs lg:text-sm text-white/30 mb-4">Después: $499/mes</p>
            <div className="space-y-1.5 mb-5">
              {['ERP completo (Ventas, Inventario, Compras)', 'Facturación SAT CFDI 4.0', 'Storefront para vender online',
                'Reportes básicos', '3 usuarios incluidos'].map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 text-xs mt-0.5">✓</span>
                  <span className="text-xs text-white/70">{f}</span>
                </div>
              ))}
            </div>
            <button onClick={onStartTrial}
              className="w-full py-2.5 rounded-xl bg-cyan-500 text-white font-bold text-sm hover:bg-cyan-400 transition-colors">
              🚀 Empieza Gratis
            </button>
          </div>

          {/* Pro */}
          <div className="rounded-2xl p-6 bg-white/[.02] border border-white/10">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-400 font-medium mb-2">
              🧠 Con IA
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-white">GAIA Pro + IA</h3>
            <div className="mt-3 mb-1">
              <span className="text-4xl lg:text-5xl font-bold text-white">$300</span>
            </div>
            <p className="text-sm lg:text-base text-violet-400 font-medium">MXN/mes · 3 usuarios</p>
            <p className="text-xs lg:text-sm text-white/30 mb-4">+$25/usuario extra</p>
            <div className="space-y-1.5 mb-5">
              {['Todo lo de Core', 'GAIA Brain — IA que entiende tu negocio', 'Analytics ejecutivos (60+ KPIs)',
                'Forecasting ML', 'Chat multi-agente (Iris)', 'Soporte prioritario'].map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-violet-400 text-xs mt-0.5">✓</span>
                  <span className="text-xs text-white/70">{f}</span>
                </div>
              ))}
            </div>
            <a href="https://wa.me/5215573633622?text=Hola%2C%20quiero%20info%20sobre%20GAIA%20Pro"
              target="_blank" rel="noopener noreferrer"
              className="block w-full text-center py-2.5 rounded-xl border border-white/10 text-white/80 font-bold text-sm hover:bg-white/5 transition-colors">
              💬 Contactar Ventas
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-white/20 mt-4">Sin tarjeta · Cancela cuando quieras · Hecho en México 🇲🇽</p>
      </div>
    </SlideShell>
  );
}

// ── Slide: Final CTA ──
function SlideFinal({ active, onStartTrial }: { active: boolean; onStartTrial: () => void }) {
  return (
    <SlideShell id="slide-final" accentColor="#06b6d4" className="exp-slide-center">
      <div className="exp-slide-content text-center max-w-3xl mx-auto">
        <h2 className={`text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-4 lg:mb-6 ${active ? 'exp-text-enter' : 'opacity-0'}`}>
          Tu negocio merece más<br />
          <span className="gradient-text">que un Excel.</span>
        </h2>
        <p className={`text-lg lg:text-xl xl:text-2xl text-white/40 mb-8 lg:mb-12 ${active ? 'exp-text-enter-delayed' : 'opacity-0'}`}>
          3 meses gratis. Sin tarjeta. Un ERP completo con IA en 60 segundos.
        </p>
        <div className={`flex flex-wrap justify-center gap-4 lg:gap-6 ${active ? 'exp-text-enter-delayed-2' : 'opacity-0'}`}>
          <button onClick={onStartTrial}
            className="glow-button px-8 py-4 lg:px-10 lg:py-5 rounded-xl bg-cyan-500 text-white font-bold text-lg lg:text-xl hover:bg-cyan-400 transition-colors relative z-10">
            🚀 Empieza Gratis Ahora
          </button>
          <a href="https://wa.me/5215573633622?text=Hola%2C%20quiero%20probar%20GAIA%20Prime"
            target="_blank" rel="noopener noreferrer"
            className="px-8 py-4 lg:px-10 lg:py-5 rounded-xl border border-white/10 text-white font-semibold text-lg lg:text-xl hover:bg-white/5 transition-colors flex items-center gap-2">
            💬 WhatsApp
          </a>
        </div>
        <p className="text-xs text-white/20 mt-6">Sin compromiso · Sin tarjeta · Hecho en México 🇲🇽</p>

        {/* Footer mini */}
        <div className="mt-16 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/20">
          <div className="flex items-center gap-2">
            <span>✦</span>
            <span className="font-bold">GAIA <span className="text-amber-400">Prime</span></span>
          </div>
          <div>hola@gaiaprime.com.mx · WhatsApp 55 7363 3622</div>
        </div>
      </div>
    </SlideShell>
  );
}

// ══════════════════════════════════════════════════════════════
// ── MAIN ORCHESTRATOR ──
// ══════════════════════════════════════════════════════════════
interface GaiaExperienceProps {
  gaiaAudio: GaiaAudio;
  onStartTrial: () => void;
}

export function GaiaExperience({ gaiaAudio, onStartTrial }: GaiaExperienceProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [visibleSlides, setVisibleSlides] = useState<Set<string>>(new Set());
  const [muted, setMuted] = useState(false);
  const [subtitleText, setSubtitleText] = useState('');
  const [showSubtitle, setShowSubtitle] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const narratedRef = useRef<Set<string>>(new Set());
  const isNarratingRef = useRef(false);

  // Preload all narration clips
  useEffect(() => {
    const allClips = SLIDES.flatMap(s => s.narration);
    gaiaAudio.preloadMany(allClips);
  }, [gaiaAudio]);

  // Track subtitle text from audio
  useEffect(() => {
    if (gaiaAudio.currentClip) {
      const clip = gaiaAudio.getClip(gaiaAudio.currentClip);
      if (clip) {
        setSubtitleText(clip.text);
        setShowSubtitle(true);
      }
    } else {
      const t = setTimeout(() => setShowSubtitle(false), 1500);
      return () => clearTimeout(t);
    }
  }, [gaiaAudio.currentClip, gaiaAudio]);

  // Narrate a slide, then auto-scroll to the next one
  const narrateSlide = useCallback(async (slideId: string) => {
    if (muted || !gaiaAudio.enabled || narratedRef.current.has(slideId) || isNarratingRef.current) return;
    const slideIdx = SLIDES.findIndex(s => s.id === slideId);
    const slide = SLIDES[slideIdx];
    if (!slide || slide.narration.length === 0) return;

    narratedRef.current.add(slideId);
    isNarratingRef.current = true;

    for (const clipId of slide.narration) {
      await gaiaAudio.play(clipId);
      await new Promise(r => setTimeout(r, 400));
    }
    isNarratingRef.current = false;

    // Auto-scroll to next slide after a brief pause
    const nextSlide = SLIDES[slideIdx + 1];
    if (nextSlide) {
      await new Promise(r => setTimeout(r, 1200));
      document.getElementById(nextSlide.id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [gaiaAudio, muted]);

  // Set up IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            setVisibleSlides(prev => new Set(prev).add(id));
            const idx = SLIDES.findIndex(s => s.id === id);
            if (idx >= 0) setActiveSlide(idx);
            // Auto-narrate with a small delay for the visual to settle
            setTimeout(() => narrateSlide(id), 800);
          }
        });
      },
      { threshold: 0.5 }
    );

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      SLIDES.forEach(s => {
        const el = document.getElementById(s.id);
        if (el) observer.observe(el);
      });
    }, 100);

    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [narrateSlide]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setMuted(prev => {
      if (!prev) gaiaAudio.stop();
      return !prev;
    });
  }, [gaiaAudio]);

  const isActive = (slideId: string) => visibleSlides.has(slideId);

  return (
    <div ref={containerRef} className="exp-container">
      {/* Slides */}
      <SlideCEO active={isActive('slide-ceo')} currentClip={gaiaAudio.currentClip} />
      <SlideProblema active={isActive('slide-problema')} />
      <SlideHermes active={isActive('slide-hermes')} />
      <SlideMercuria active={isActive('slide-mercuria')} />
      <SlideHephaestus active={isActive('slide-hephaestus')} />
      <SlideIris active={isActive('slide-iris')} />
      <SlideComparison active={isActive('slide-comparacion')} />
      <SlidePricing active={isActive('slide-precio')} onStartTrial={onStartTrial} />
      <SlideFinal active={isActive('slide-final')} onStartTrial={onStartTrial} />

      {/* Progress dots */}
      <div className="exp-dots">
        {SLIDES.map((s, i) => (
          <button key={i}
            onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })}
            className={`exp-dot ${i === activeSlide ? 'exp-dot-active' : ''}`}
            style={{ '--dot-color': s.color } as React.CSSProperties}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* GAIA Narrator Orb */}
      <div className="exp-narrator-orb" onClick={toggleMute}
        title={muted ? 'Activar voz' : 'Silenciar a GAIA'}>
        <div className={`exp-narrator-core ${gaiaAudio.isPlaying && !muted ? 'exp-narrator-speaking' : ''}`}>
          {muted ? '🔇' : '✦'}
        </div>
        {gaiaAudio.isPlaying && !muted && (
          <>
            <div className="exp-wave exp-wave-1" />
            <div className="exp-wave exp-wave-2" />
            <div className="exp-wave exp-wave-3" />
          </>
        )}
        <span className="exp-narrator-label">
          {muted ? 'Muted' : gaiaAudio.isPlaying ? 'GAIA' : ''}
        </span>
      </div>

      {/* Subtitle bar */}
      <div className={`exp-subtitle-bar ${showSubtitle && !muted ? 'exp-subtitle-visible' : ''}`}>
        <div className="exp-subtitle-content">
          <span className="text-cyan-400 mr-2">✦</span>
          <p className="text-white/90 text-sm leading-relaxed">{subtitleText}</p>
        </div>
      </div>

      {/* Scroll indicator on first slide */}
      {activeSlide === 0 && (
        <div className="exp-scroll-hint">
          <div className="exp-scroll-mouse">
            <div className="exp-scroll-wheel" />
          </div>
          <span className="text-[10px] text-white/20 mt-1">Scroll</span>
        </div>
      )}
    </div>
  );
}
