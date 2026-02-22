import { useState, useEffect, useRef } from 'react';

/* ══════════════════════════════════════════════════════════════
   LiveDashboard — The WOW Hero
   
   Not a mockup. Not a chat. THE ACTUAL SYSTEM rendered live
   with animated data, ticking counters, flowing graphs.
   
   This is what makes people go "holy shit I want this."
   ══════════════════════════════════════════════════════════════ */

// ── Animated Counter ──
function AnimatedNumber({ target, prefix = '', suffix = '', duration = 2000, decimals = 0 }: {
  target: number; prefix?: string; suffix?: string; duration?: number; decimals?: number;
}) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, target, duration]);

  const formatted = decimals > 0 
    ? value.toFixed(decimals) 
    : Math.floor(value).toLocaleString('es-MX');

  return <span ref={ref}>{prefix}{formatted}{suffix}</span>;
}

// ── Mini sparkline SVG ──
function Sparkline({ data, color, height = 32, width = 100 }: { 
  data: number[]; color: string; height?: number; width?: number;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height * 0.8) - height * 0.1;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-${color})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Live "notification" that slides in ──  
function LiveNotification({ show, icon, agent, color, text }: {
  show: boolean; icon: string; agent: string; color: string; text: string;
}) {
  return (
    <div className={`absolute -left-2 sm:left-auto sm:-right-3 bottom-4 sm:bottom-auto sm:top-16 transition-all duration-500 ${
      show ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
    }`}>
      <div className="bg-gaia-surface/95 backdrop-blur border border-gaia-border rounded-xl px-3 py-2 shadow-2xl shadow-black/40 max-w-[220px]">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${color}`}>
            <span className="text-[10px]">{icon}</span>
          </div>
          <div className="min-w-0">
            <p className={`text-[9px] font-semibold ${color.replace('bg-', 'text-').replace('/20', '')}`}>{agent}</p>
            <p className="text-[10px] text-gaia-text leading-tight truncate">{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
// ── MAIN COMPONENT ──
// ══════════════════════════════════════
export function LiveDashboard() {
  const [step, setStep] = useState(0);
  const [revenue, setRevenue] = useState(142800);
  const ref = useRef<HTMLDivElement>(null);

  // Trigger animation sequence when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timers = [
            setTimeout(() => setStep(1), 400),
            setTimeout(() => setStep(2), 1200),
            setTimeout(() => setStep(3), 2200),
            setTimeout(() => setStep(4), 3400),
            setTimeout(() => setStep(5), 5000),
            setTimeout(() => setStep(6), 6500),
          ];
          observer.disconnect();
          return () => timers.forEach(clearTimeout);
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Simulate live revenue ticking
  useEffect(() => {
    if (step < 2) return;
    const interval = setInterval(() => {
      setRevenue(prev => prev + Math.floor(Math.random() * 350) + 50);
    }, 3000);
    return () => clearInterval(interval);
  }, [step]);

  const salesData = [12, 18, 14, 22, 19, 28, 24, 31, 27, 35, 32, 38];
  const marginData = [28, 31, 29, 33, 30, 34, 32, 35, 33, 36, 34, 37];

  return (
    <div ref={ref} className="relative mx-auto max-w-xl">
      {/* Browser chrome */}
      <div className="bg-gaia-surface rounded-t-2xl border border-gaia-border px-3 sm:px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 text-center">
          <div className="inline-flex items-center gap-1.5 bg-gaia-dark/50 rounded-md px-3 py-0.5">
            <span className="text-[9px] text-green-400">🔒</span>
            <span className="text-[10px] text-gaia-muted">app.gaiaprime.com.mx</span>
          </div>
        </div>
      </div>

      {/* Dashboard body */}
      <div className="bg-gaia-dark/95 border-x border-b border-gaia-border rounded-b-2xl overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-gaia-border/50">
          <div className="flex items-center gap-2">
            <span className="text-sm">✦</span>
            <span className="text-[11px] font-bold text-gaia-text">GAIA <span className="text-gaia-gold">Prime</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] transition-all duration-300 ${step >= 1 ? 'bg-gaia-cyan/20 scale-100' : 'bg-gaia-border/30 scale-90 opacity-50'}`}>📦</div>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] transition-all duration-300 ${step >= 2 ? 'bg-violet-500/20 scale-100' : 'bg-gaia-border/30 scale-90 opacity-50'}`}>📊</div>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] transition-all duration-300 ${step >= 3 ? 'bg-amber-500/20 scale-100' : 'bg-gaia-border/30 scale-90 opacity-50'}`}>🔨</div>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] transition-all duration-300 ${step >= 4 ? 'bg-yellow-500/20 scale-100' : 'bg-gaia-border/30 scale-90 opacity-50'}`}>🛍️</div>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] transition-all duration-300 ${step >= 5 ? 'bg-sky-500/20 scale-100' : 'bg-gaia-border/30 scale-90 opacity-50'}`}>💬</div>
          </div>
        </div>

        {/* Dashboard grid */}
        <div className="p-3 sm:p-4 space-y-3">
          {/* Row 1: KPI Cards */}
          <div className="grid grid-cols-3 gap-2">
            {/* Revenue */}
            <div className={`bg-gaia-surface/60 border border-gaia-border/50 rounded-xl p-2.5 transition-all duration-500 ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
              <p className="text-[9px] text-gaia-muted mb-0.5">Revenue hoy</p>
              <p className="text-sm sm:text-base font-bold text-gaia-cyan">
                $<AnimatedNumber target={revenue} duration={1500} />
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] text-green-400">↑ 15.3%</span>
                <Sparkline data={salesData} color="#06b6d4" height={16} width={50} />
              </div>
            </div>

            {/* Margen */}
            <div className={`bg-gaia-surface/60 border border-gaia-border/50 rounded-xl p-2.5 transition-all duration-500 ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} style={{ transitionDelay: '150ms' }}>
              <p className="text-[9px] text-gaia-muted mb-0.5">Margen bruto</p>
              <p className="text-sm sm:text-base font-bold text-green-400">
                <AnimatedNumber target={34.2} duration={1800} decimals={1} suffix="%" />
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] text-green-400">↑ 2.1%</span>
                <Sparkline data={marginData} color="#4ade80" height={16} width={50} />
              </div>
            </div>

            {/* Pedidos */}
            <div className={`bg-gaia-surface/60 border border-gaia-border/50 rounded-xl p-2.5 transition-all duration-500 ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} style={{ transitionDelay: '300ms' }}>
              <p className="text-[9px] text-gaia-muted mb-0.5">Pedidos</p>
              <p className="text-sm sm:text-base font-bold text-gaia-text">
                <AnimatedNumber target={47} duration={1600} />
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] text-gaia-cyan">12 online</span>
                <span className="text-[8px] text-gaia-muted">· 35 mostrador</span>
              </div>
            </div>
          </div>

          {/* Row 2: Inventory + Mini Graph */}
          <div className="grid grid-cols-5 gap-2">
            {/* Inventory table */}
            <div className={`col-span-3 bg-gaia-surface/60 border border-gaia-border/50 rounded-xl p-2.5 transition-all duration-500 ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] text-gaia-muted font-medium">📦 Inventario — Alertas</p>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400">3 críticos</span>
              </div>
              <div className="space-y-1 text-[9px] font-mono">
                <div className="flex items-center justify-between text-gaia-muted">
                  <span className="w-20 truncate">Producto</span>
                  <span>Stock</span>
                  <span>Estado</span>
                </div>
                <div className="flex items-center justify-between text-gaia-text">
                  <span className="w-20 truncate">Mordaza 5T</span>
                  <span className="text-yellow-400 font-semibold">4</span>
                  <span className="px-1 rounded bg-yellow-500/15 text-yellow-400">⚠ bajo</span>
                </div>
                <div className="flex items-center justify-between text-gaia-text">
                  <span className="w-20 truncate">Cabezal HD</span>
                  <span className="text-orange-400 font-semibold">2</span>
                  <span className="px-1 rounded bg-orange-500/15 text-orange-400">⚠ crítico</span>
                </div>
                <div className="flex items-center justify-between text-gaia-text">
                  <span className="w-20 truncate">Placa CNC</span>
                  <span className="text-red-400 font-semibold">0</span>
                  <span className="px-1 rounded bg-red-500/15 text-red-400">❌ agotado</span>
                </div>
              </div>
            </div>

            {/* Work graph preview */}
            <div className={`col-span-2 bg-gaia-surface/60 border border-gaia-border/50 rounded-xl p-2.5 transition-all duration-500 ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
              <p className="text-[9px] text-gaia-muted font-medium mb-2">🔨 Trabajo</p>
              {/* Mini graph nodes */}
              <svg width="100%" height="60" viewBox="0 0 120 60" className="overflow-visible">
                {/* Edges */}
                <line x1="20" y1="15" x2="60" y2="10" stroke="#2a2a3a" strokeWidth="1" className={`transition-all duration-500 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`} />
                <line x1="20" y1="15" x2="55" y2="35" stroke="#2a2a3a" strokeWidth="1" className={`transition-all duration-500 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`} />
                <line x1="60" y1="10" x2="100" y2="25" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3,2" className={`transition-all duration-500 ${step >= 4 ? 'opacity-100' : 'opacity-0'}`} />
                <line x1="55" y1="35" x2="100" y2="25" stroke="#2a2a3a" strokeWidth="1" className={`transition-all duration-500 ${step >= 4 ? 'opacity-100' : 'opacity-0'}`} />
                <line x1="100" y1="25" x2="110" y2="50" stroke="#2a2a3a" strokeWidth="1" className={`transition-all duration-500 ${step >= 4 ? 'opacity-100' : 'opacity-0'}`} />

                {/* Nodes */}
                <circle cx="20" cy="15" r="6" fill="#4ade80" opacity="0.8" className={`transition-all duration-300 ${step >= 3 ? 'opacity-80' : 'opacity-0'}`} />
                <text x="20" y="17" textAnchor="middle" fontSize="5" fill="white">✓</text>
                
                <circle cx="60" cy="10" r="6" fill="#4ade80" opacity="0.8" className={`transition-all duration-300 ${step >= 3 ? 'opacity-80' : 'opacity-0'}`} />
                <text x="60" y="12" textAnchor="middle" fontSize="5" fill="white">✓</text>

                <circle cx="55" cy="35" r="6" fill="#f59e0b" opacity="0.8" className={`transition-all duration-300 ${step >= 3 ? 'opacity-80' : 'opacity-0'}`}>
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x="55" y="37" textAnchor="middle" fontSize="5" fill="white">⟳</text>

                <rect x="93" y="18" width="14" height="14" rx="2" fill="#06b6d4" opacity="0.2" stroke="#06b6d4" strokeWidth="0.5" className={`transition-all duration-300 ${step >= 4 ? 'opacity-100' : 'opacity-0'}`}>
                  <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" />
                </rect>
                <text x="100" y="28" textAnchor="middle" fontSize="5" fill="#06b6d4">★</text>

                <circle cx="110" cy="50" r="5" fill="#2a2a3a" stroke="#3a3a4a" strokeWidth="0.5" className={`transition-all duration-300 ${step >= 4 ? 'opacity-60' : 'opacity-0'}`} />
              </svg>
              <div className="flex items-center justify-between text-[8px] mt-1">
                <span className="text-green-400">2 ✓</span>
                <span className="text-amber-400">1 ⟳</span>
                <span className="text-gaia-muted">2 •</span>
              </div>
            </div>
          </div>

          {/* Row 3: Storefront + Chat */}
          <div className="grid grid-cols-2 gap-2">
            {/* Storefront */}
            <div className={`bg-gaia-surface/60 border border-gaia-border/50 rounded-xl p-2.5 transition-all duration-500 ${step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] text-gaia-muted font-medium">🛍️ Tienda Online</p>
                <span className="text-[8px] text-green-400">● live</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-[8px]">🔧</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-gaia-text truncate">Mordaza Angular 5T</p>
                    <p className="text-[8px] text-gaia-cyan font-semibold">$3,200</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-[8px]">⚙️</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-gaia-text truncate">Cabezal Torque HD</p>
                    <p className="text-[8px] text-gaia-cyan font-semibold">$5,800</p>
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-gaia-border/30 flex items-center justify-between">
                <span className="text-[8px] text-gaia-muted">12 productos</span>
                <span className="text-[8px] text-gaia-cyan font-medium">+ MeLi 🟡</span>
              </div>
            </div>

            {/* GAIA AI mini */}
            <div className={`bg-gaia-surface/60 border border-gaia-border/50 rounded-xl p-2.5 transition-all duration-500 ${step >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] text-gaia-muted font-medium">🧠 GAIA</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[8px] text-green-400">online</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-end">
                  <span className="text-[8px] bg-gaia-cyan/20 text-gaia-text px-2 py-0.5 rounded-lg">¿Qué compro?</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="text-[8px]">📊</span>
                  <div className="bg-gaia-dark/50 border border-gaia-border/30 rounded-lg px-2 py-1">
                    <p className="text-[8px] text-gaia-text leading-tight">
                      <span className="text-violet-400 font-semibold">Athena:</span> 3 SKUs urgentes
                    </p>
                    <p className="text-[8px] text-gaia-cyan font-semibold">ROI: $68K en 30 días</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar: Iris chat preview */}
          <div className={`bg-gaia-surface/40 border border-gaia-border/30 rounded-xl px-3 py-2 transition-all duration-500 ${step >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <div className="flex items-center gap-2">
              <span className="text-[10px]">💬</span>
              <div className="flex-1 flex items-center gap-2 text-[9px]">
                <span className="text-sky-400 font-medium">#ventas</span>
                <span className="text-gaia-muted">·</span>
                <span className="text-gaia-text truncate">María: "Ya llegó el pedido del cliente de Monterrey 📦"</span>
              </div>
              <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full text-[8px] font-semibold shrink-0">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating notifications — appear one by one */}
      <LiveNotification
        show={step >= 4}
        icon="🛒"
        agent="Mercuria"
        color="bg-yellow-500/20"
        text="Nueva venta: $3,200 MXN"
      />
      <div className={`absolute -right-2 sm:-right-4 -bottom-2 transition-all duration-500 ${step >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-gaia-surface/95 backdrop-blur border border-gaia-cyan/30 rounded-xl px-3 py-2 shadow-2xl shadow-cyan-500/10 max-w-[200px]">
          <div className="flex items-center gap-2">
            <span className="text-sm">🧠</span>
            <div>
              <p className="text-[9px] text-gaia-cyan font-semibold">GAIA</p>
              <p className="text-[10px] text-gaia-text leading-tight">Placa CNC agotada. ¿Reordeno?</p>
            </div>
          </div>
        </div>
      </div>

      {/* Glow effects */}
      <div className="absolute -inset-8 bg-gaia-cyan/5 rounded-3xl blur-3xl -z-10" />
      <div className={`absolute -inset-16 bg-violet-500/3 rounded-full blur-[80px] -z-10 transition-opacity duration-1000 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
}
