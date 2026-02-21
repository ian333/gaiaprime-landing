import { useState, useEffect, useRef } from 'react';
import { GaiaChat } from './components/GaiaChat';

/* ══════════════════════════════════════════════════════════════
   GAIA Prime — Landing Page
   gaiaprime.com.mx
   ══════════════════════════════════════════════════════════════ */

// ── Scroll Reveal Hook ──
function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal, .reveal-children').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ── Navbar ──
function Navbar({ onOpenChat }: { onOpenChat: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2">
            <span className="text-2xl">✦</span>
            <span className="font-bold text-lg text-gaia-text">GAIA <span className="text-gaia-gold">Prime</span></span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#solucion" className="text-sm text-gaia-muted hover:text-gaia-text transition-colors">Producto</a>
            <a href="#modulos" className="text-sm text-gaia-muted hover:text-gaia-text transition-colors">Módulos</a>
            <a href="#precio" className="text-sm text-gaia-muted hover:text-gaia-text transition-colors">Precio</a>
            <a href="#comparativa" className="text-sm text-gaia-muted hover:text-gaia-text transition-colors">Comparativa</a>
          </div>

          <button
            onClick={onOpenChat}
            className="px-4 py-2 rounded-lg bg-gaia-cyan/20 text-gaia-cyan text-sm font-medium border border-gaia-cyan/30 hover:bg-gaia-cyan/30 transition-all"
          >
            Hablar con GAIA
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── Hero Chat Mockup ──
function ChatMockup() {
  const [step, setStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timers = [
            setTimeout(() => setStep(1), 600),
            setTimeout(() => setStep(2), 1800),
            setTimeout(() => setStep(3), 3500),
            setTimeout(() => setStep(4), 5000),
          ];
          observer.disconnect();
          return () => timers.forEach(clearTimeout);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative mx-auto max-w-lg animate-[float_6s_ease-in-out_infinite]">
      {/* Browser chrome */}
      <div className="bg-gaia-surface rounded-t-2xl border border-gaia-border px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 text-center text-xs text-gaia-muted">app.gaiaprime.com.mx</div>
      </div>

      {/* Chat body */}
      <div className="bg-gaia-dark/90 border-x border-b border-gaia-border rounded-b-2xl p-4 space-y-3 min-h-[320px]">
        {/* Chat header */}
        <div className="flex items-center gap-2 pb-2 border-b border-gaia-border">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <span className="text-sm">🧠</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gaia-text">GAIA</p>
            <p className="text-[10px] text-gaia-muted">Asistente de negocios</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-green-400">En línea</span>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-3">
          {/* User 1 */}
          <div className={`chat-msg flex justify-end ${step >= 1 ? 'show' : ''}`}>
            <div className="bg-gaia-cyan rounded-2xl rounded-br-sm px-3 py-2 max-w-[80%]">
              <p className="text-sm text-white">¿Cuánto vendimos hoy?</p>
            </div>
          </div>

          {/* Thinking */}
          {step === 1 && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                <span className="text-[10px]">📊</span>
              </div>
              <div className="bg-gaia-surface border border-gaia-border rounded-2xl rounded-bl-sm px-4 py-2">
                <div className="typing-dots flex gap-1">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          {/* GAIA response 1 - Athena */}
          <div className={`chat-msg flex gap-2 ${step >= 2 ? 'show' : ''}`}>
            <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 mt-1">
              <span className="text-[10px]">📊</span>
            </div>
            <div>
              <p className="text-[10px] text-violet-400 font-medium mb-1">Athena · Analytics</p>
              <div className="bg-gaia-surface border border-gaia-border rounded-2xl rounded-bl-sm px-3 py-2">
                <p className="text-sm text-gaia-text">Hoy llevas <strong className="text-gaia-cyan">$47,320 MXN</strong> en 12 transacciones.</p>
                <p className="text-xs text-green-400 mt-1">📈 +15% vs ayer</p>
                <p className="text-xs text-gaia-muted mt-1">Producto estrella: Mordaza Angular 5T ($12,800)</p>
              </div>
            </div>
          </div>

          {/* User 2 */}
          <div className={`chat-msg flex justify-end ${step >= 3 ? 'show' : ''}`}>
            <div className="bg-gaia-cyan rounded-2xl rounded-br-sm px-3 py-2 max-w-[80%]">
              <p className="text-sm text-white">¿Tengo stock suficiente?</p>
            </div>
          </div>

          {/* GAIA response 2 - Hermes */}
          <div className={`chat-msg flex gap-2 ${step >= 4 ? 'show' : ''}`}>
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
              <span className="text-[10px]">📦</span>
            </div>
            <div>
              <p className="text-[10px] text-emerald-400 font-medium mb-1">Hermes · ERP</p>
              <div className="bg-gaia-surface border border-gaia-border rounded-2xl rounded-bl-sm px-3 py-2">
                <p className="text-sm text-gaia-text">⚠️ 3 productos en stock crítico:</p>
                <div className="mt-1 space-y-0.5 text-xs">
                  <p className="text-yellow-400">• Mordaza Angular 5T: <strong>4 uds</strong></p>
                  <p className="text-orange-400">• Cabezal Torque HD: <strong>2 uds</strong></p>
                  <p className="text-red-400">• Placa Base CNC: <strong>0 uds ❌</strong></p>
                </div>
                <p className="text-xs text-gaia-cyan mt-2 font-medium">¿Genero la orden de compra automática?</p>
              </div>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 mt-3 bg-gaia-surface border border-gaia-border rounded-xl px-3 py-2.5">
          <p className="text-sm text-gaia-muted flex-1">Escribe un mensaje...</p>
          <div className="w-7 h-7 rounded-full bg-gaia-cyan flex items-center justify-center">
            <span className="text-white text-xs">➤</span>
          </div>
        </div>
      </div>

      {/* Glow effect behind mockup */}
      <div className="absolute -inset-4 bg-gaia-cyan/5 rounded-3xl blur-3xl -z-10" />
    </div>
  );
}

// ── Hero Section ──
function Hero({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Copy */}
          <div className="reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gaia-cyan/10 border border-gaia-cyan/20 mb-6">
              <div className="w-2 h-2 rounded-full bg-gaia-cyan animate-pulse" />
              <span className="text-xs text-gaia-cyan font-medium">Sistema Operativo de Negocios</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Háblale a tu negocio.
              <br />
              <span className="gradient-text">Y que te conteste.</span>
            </h1>

            <p className="text-lg text-gaia-muted mb-8 max-w-lg">
              ERP, tienda online, facturación SAT, gestión de trabajo y asistente inteligente —
              todo en una sola plataforma. Desde tu celular.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={onOpenChat}
                className="glow-button px-6 py-3 rounded-xl bg-gaia-cyan text-white font-semibold text-base hover:bg-cyan-500 transition-colors relative z-10"
              >
                🧠 Hablar con GAIA
              </button>
              <a
                href="#solucion"
                className="px-6 py-3 rounded-xl border border-gaia-border text-gaia-text font-medium hover:bg-gaia-surface transition-colors"
              >
                Ver cómo funciona ↓
              </a>
            </div>

            <div className="flex items-center gap-6 mt-8 text-xs text-gaia-muted">
              <span className="flex items-center gap-1.5">✅ Sin contratos</span>
              <span className="flex items-center gap-1.5">✅ Arranca en 1 día</span>
              <span className="flex items-center gap-1.5">✅ Hecho en México</span>
            </div>
          </div>

          {/* Right - Chat mockup */}
          <div className="reveal" style={{ transitionDelay: '0.2s' }}>
            <ChatMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pain Points ──
function PainPoints() {
  const pains = [
    {
      emoji: '📊',
      title: 'Tus números están en 5 lugares',
      description: 'Excel, cuaderno, WhatsApp, la cabeza del contador, el portal del PAC... y ninguno cuadra con el otro.',
    },
    {
      emoji: '📱',
      title: 'Tu bodeguero te marca a las 6am',
      description: '"Ya no hay material." Y tú no sabías porque nadie revisa el stock hasta que se acaba.',
    },
    {
      emoji: '🛒',
      title: 'Quieres vender online pero no sabes cómo',
      description: 'MercadoLibre, Shopify, un sitio web... todo parece complicado, caro, y desconectado de tu inventario.',
    },
    {
      emoji: '💸',
      title: 'Te dijeron que un ERP cuesta $500,000',
      description: 'Y tarda un año implementarlo con consultores. Los sistemas tradicionales no fueron hechos para ti.',
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 reveal">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">¿Te suena familiar?</h2>
          <p className="text-gaia-muted max-w-2xl mx-auto">Si tu negocio vive en alguno de estos problemas, GAIA fue hecho para ti.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 reveal-children">
          {pains.map((p, i) => (
            <div key={i} className="bg-gaia-surface/50 border border-gaia-border rounded-2xl p-6 card-hover">
              <span className="text-3xl mb-4 block">{p.emoji}</span>
              <h3 className="font-semibold text-gaia-text mb-2">{p.title}</h3>
              <p className="text-sm text-gaia-muted leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Solution ──
function Solution() {
  return (
    <section id="solucion" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 reveal">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            No es un ERP.
            <br />
            <span className="gradient-text">Es tu copiloto de negocios.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 reveal-children">
          {/* Step 1 */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gaia-cyan/10 border border-gaia-cyan/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <div className="text-xs font-bold text-gaia-cyan mb-2">01</div>
            <h3 className="text-xl font-semibold mb-3">Pregúntale lo que quieras</h3>
            <p className="text-sm text-gaia-muted leading-relaxed">
              "¿Qué producto me deja más margen?" "¿Quién me debe más?" "¿Qué compro mañana?"
              — Escríbelo como si le hablaras a un asistente. GAIA consulta tus datos reales y responde
              en español, con números exactos.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔗</span>
            </div>
            <div className="text-xs font-bold text-violet-400 mb-2">02</div>
            <h3 className="text-xl font-semibold mb-3">Todo conectado, automático</h3>
            <p className="text-sm text-gaia-muted leading-relaxed">
              Vendes algo → el inventario baja → la factura se genera → el bodeguero recibe la orden
              en su celular → sube foto de verificación. Sin copiar datos de un lado a otro. Sin errores.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gaia-gold/10 border border-gaia-gold/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🛍️</span>
            </div>
            <div className="text-xs font-bold text-gaia-gold mb-2">03</div>
            <h3 className="text-xl font-semibold mb-3">Tu tienda online en 1 click</h3>
            <p className="text-sm text-gaia-muted leading-relaxed">
              Elige tipo de negocio. Ponle nombre. Listo — ya tienes tienda publicada con todos tus
              productos y precios sincronizados. Comparte el link por WhatsApp. ¿MercadoLibre?
              También conectado.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Modules ──
function Modules() {
  const modules = [
    {
      emoji: '📦',
      name: 'Hermes',
      role: 'Tu Administrador',
      color: 'emerald',
      description: 'Inventario, compras, ventas, facturas SAT, clientes, proveedores. Todo el flujo del dinero.',
      preview: (
        <div className="mt-3 bg-gaia-dark/50 rounded-lg p-2 text-[10px] font-mono space-y-1">
          <div className="flex justify-between text-gaia-muted"><span>SKU</span><span>Stock</span><span>Precio</span></div>
          <div className="flex justify-between text-gaia-text"><span>MDA-5T</span><span className="text-yellow-400">4 ⚠️</span><span>$3,200</span></div>
          <div className="flex justify-between text-gaia-text"><span>CBT-HD</span><span className="text-orange-400">2 ⚠️</span><span>$5,800</span></div>
          <div className="flex justify-between text-gaia-text"><span>PLB-CNC</span><span className="text-red-400">0 ❌</span><span>$1,450</span></div>
        </div>
      ),
    },
    {
      emoji: '📊',
      name: 'Athena',
      role: 'Tu Analista',
      color: 'violet',
      description: '"¿Cuánto vendí?" "¿Qué producto es un muerto?" Dashboard de CEO con alertas y pronósticos.',
      preview: (
        <div className="mt-3 bg-gaia-dark/50 rounded-lg p-2 space-y-1">
          <div className="flex justify-between text-[10px]"><span className="text-gaia-muted">Revenue</span><span className="text-gaia-cyan font-bold">$142,800</span></div>
          <div className="flex justify-between text-[10px]"><span className="text-gaia-muted">Margen</span><span className="text-green-400 font-bold">34.2%</span></div>
          <div className="flex justify-between text-[10px]"><span className="text-gaia-muted">Crecimiento</span><span className="text-green-400 font-bold">+8.5% ↑</span></div>
          <div className="w-full bg-gaia-border rounded-full h-1.5 mt-1">
            <div className="bg-gradient-to-r from-gaia-cyan to-violet-500 h-1.5 rounded-full" style={{ width: '68%' }} />
          </div>
        </div>
      ),
    },
    {
      emoji: '🔨',
      name: 'Hephaestus',
      role: 'Tu Jefe de Planta',
      color: 'amber',
      description: 'Organiza el trabajo en procesos visuales. El bodeguero ve SUS tareas en su celular.',
      preview: (
        <div className="mt-3 bg-gaia-dark/50 rounded-lg p-2">
          <div className="flex items-center gap-1 text-[9px]">
            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">Recibir</span>
            <span className="text-gaia-muted">→</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">Picking</span>
            <span className="text-gaia-muted">→</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">✓ Verificar</span>
            <span className="text-gaia-muted">→</span>
            <span className="px-1.5 py-0.5 rounded bg-gaia-cyan/20 text-gaia-cyan">Entregar</span>
          </div>
        </div>
      ),
    },
    {
      emoji: '💬',
      name: 'Iris',
      role: 'Tu Comunicación',
      color: 'sky',
      description: 'Chat interno donde tu equipo se comunica sin perder contexto. Los agentes AI participan.',
      preview: (
        <div className="mt-3 bg-gaia-dark/50 rounded-lg p-2 text-[10px] space-y-1">
          <div className="flex justify-between"><span className="text-gaia-text"># general</span><span className="bg-red-500/20 text-red-400 px-1.5 rounded-full text-[9px]">3</span></div>
          <div className="flex justify-between"><span className="text-gaia-text"># ventas</span><span className="bg-red-500/20 text-red-400 px-1.5 rounded-full text-[9px]">1</span></div>
          <div className="flex justify-between"><span className="text-gaia-muted"># bodega</span><span className="text-gaia-muted text-[9px]">—</span></div>
        </div>
      ),
    },
    {
      emoji: '🛍️',
      name: 'Mercuria',
      role: 'Tu Vendedor Online',
      color: 'yellow',
      description: 'Tienda propia + MercadoLibre conectado. Pedidos, cotizaciones, pagos — un solo panel.',
      preview: (
        <div className="mt-3 bg-gaia-dark/50 rounded-lg p-2 text-[10px]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-gaia-gold/30 to-amber-600/30 flex items-center justify-center text-[8px]">🛒</div>
            <span className="text-gaia-text font-medium">Mi Tienda</span>
          </div>
          <div className="text-gaia-muted">12 productos · 3 pedidos hoy</div>
          <div className="text-gaia-cyan font-medium mt-0.5">$8,400 vendido hoy</div>
        </div>
      ),
    },
    {
      emoji: '🧠',
      name: 'GAIA',
      role: 'Tu Copiloto 24/7',
      color: 'cyan',
      description: 'Pregúntale lo que quieras sobre tu negocio. Te responde con datos reales. Como un consultor que nunca duerme.',
      preview: (
        <div className="mt-3 bg-gaia-dark/50 rounded-lg p-2 text-[10px] space-y-1.5">
          <div className="text-right"><span className="bg-gaia-cyan/20 text-gaia-text px-2 py-0.5 rounded-lg">¿Qué compro mañana?</span></div>
          <div className="text-left"><span className="bg-gaia-surface text-gaia-text px-2 py-0.5 rounded-lg">3 SKUs urgentes. ROI: $68K en 30 días.</span></div>
        </div>
      ),
    },
  ];

  return (
    <section id="modulos" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 reveal">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            6 especialistas. <span className="gradient-text">Trabajando 24/7 para ti.</span>
          </h2>
          <p className="text-gaia-muted max-w-2xl mx-auto">No es una herramienta. Es un equipo completo que nunca descansa.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 reveal-children">
          {modules.map((m, i) => (
            <div key={i} className="bg-gaia-surface/50 border border-gaia-border rounded-2xl p-5 card-hover flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{m.emoji}</span>
                <div>
                  <h3 className="font-semibold text-gaia-text">{m.name}</h3>
                  <p className="text-[11px] text-gaia-muted">{m.role}</p>
                </div>
              </div>
              <p className="text-sm text-gaia-muted leading-relaxed flex-1">{m.description}</p>
              {m.preview}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Comparison Table ──
function Comparison() {
  return (
    <section id="comparativa" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 reveal">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">¿Por qué GAIA y no otra cosa?</h2>
          <p className="text-gaia-muted">Comparación honesta. Sin letras chiquitas.</p>
        </div>

        <div className="overflow-x-auto reveal">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-gaia-border">
                <th className="py-3 px-4 text-left text-gaia-muted font-medium" />
                <th className="py-3 px-4 text-center text-gaia-muted font-medium">SAP Business One</th>
                <th className="py-3 px-4 text-center text-gaia-muted font-medium">Odoo</th>
                <th className="py-3 px-4 text-center text-gaia-muted font-medium">Shopify + Contpaqi</th>
                <th className="py-3 px-4 text-center bg-gaia-cyan/5 rounded-t-xl border-x border-t border-gaia-cyan/20">
                  <span className="font-bold text-gaia-cyan">GAIA Prime ✦</span>
                </th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {[
                ['Precio', '$300K-$500K + licencias', '"Gratis" + $50K implementar', '$500/mes + PAC aparte', '$499/mes todo incluido'],
                ['Arranque', '6-18 meses', '2-6 meses', '1-2 meses', '1 día'],
                ['Consultor', 'Obligatorio', 'Probablemente', 'No pero te pierdes', 'No necesitas'],
                ['Facturación SAT', 'Módulo extra', 'Plugin + configurar', 'Software aparte', 'Integrado nativo'],
                ['Tienda online', 'No incluido', 'Plugin', 'Solo Shopify', '1 click + MeLi'],
                ['MercadoLibre', '❌', '❌', '❌', '✅ Nativo'],
                ['AI conversacional', '❌', '❌', '❌', '✅ GAIA multi-agente'],
                ['Desde celular', 'Limitado', 'Limitado', 'Solo la tienda', '✅ Todo'],
              ].map(([label, ...values], i) => (
                <tr key={i} className="border-b border-gaia-border/50">
                  <td className="py-3 px-4 font-medium text-gaia-text">{label}</td>
                  {values.map((v, j) => (
                    <td key={j} className={`py-3 px-4 text-center ${j === 3 ? 'bg-gaia-cyan/5 border-x border-gaia-cyan/20 text-gaia-cyan font-semibold' : 'text-gaia-muted'}`}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ── Use Cases ──
function UseCases() {
  const cases = [
    { emoji: '🔧', title: 'Taller de manufactura', text: 'El cliente pide en la tienda, la orden llega al taller con especificaciones, el operador ve su tarea en el celular, sube foto del terminado, y la factura se genera sola.' },
    { emoji: '🍔', title: 'Restaurante / Alimentos', text: 'Menú publicado en línea, pedidos por WhatsApp automáticos, inventario de ingredientes baja solo. Al final del día: "GAIA, ¿cuál fue mi plato más vendido?"' },
    { emoji: '🏭', title: 'Distribuidora', text: 'GAIA te dice qué comprar mañana con ROI por SKU, te avisa antes de que se acabe, y tus clientes ven precios y stock en tiempo real.' },
    { emoji: '🦷', title: 'Consultorio / Servicios', text: 'Agenda, factura, lleva inventario de materiales, y tu asistente ve las tareas del día en su celular. Sin papelitos.' },
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 reveal">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">¿Es para mi negocio?</h2>
          <p className="text-gaia-muted">Si vendes algo físico o un servicio, sí.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 reveal-children">
          {cases.map((c, i) => (
            <div key={i} className="bg-gaia-surface/30 border border-gaia-border rounded-2xl p-6 card-hover">
              <span className="text-3xl mb-3 block">{c.emoji}</span>
              <h3 className="font-semibold text-gaia-text mb-2">{c.title}</h3>
              <p className="text-sm text-gaia-muted leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ──
function Pricing({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <section id="precio" className="py-20 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 reveal">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple. Sin sorpresas.</h2>
          <p className="text-gaia-muted">Un precio. Todo incluido. Cancela cuando quieras.</p>
        </div>

        <div className="reveal bg-gradient-to-b from-gaia-surface/80 to-gaia-dark/80 border border-gaia-cyan/20 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          {/* Glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 bg-gaia-cyan/10 blur-3xl rounded-full" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gaia-gold/10 border border-gaia-gold/20 mb-6">
              <span className="text-xs text-gaia-gold font-semibold">✦ GAIA Prime</span>
            </div>

            <div className="mb-6">
              <span className="text-5xl sm:text-6xl font-bold text-gaia-text price-glow">$499</span>
              <span className="text-xl text-gaia-muted">/mes</span>
            </div>

            <p className="text-gaia-muted mb-2">+ <strong className="text-gaia-text">1% por venta procesada</strong></p>
            <p className="text-sm text-gaia-muted mb-8">(~$2-5 pesos por transacción promedio)</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-md mx-auto mb-8 text-sm">
              {[
                'ERP completo (Hermes)',
                'Facturación SAT integrada',
                'Tienda online + MercadoLibre',
                'Gestión de trabajo + móvil',
                'Analytics de CEO (Athena)',
                'Chat interno (Iris)',
                'GAIA AI 24/7 ilimitado',
                'Soporte en español',
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-gaia-cyan text-xs">✓</span>
                  <span className="text-gaia-text">{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenChat}
              className="glow-button px-8 py-4 rounded-xl bg-gaia-cyan text-white font-bold text-lg hover:bg-cyan-500 transition-colors relative z-10"
            >
              Hablar con GAIA ahora
            </button>

            <p className="text-xs text-gaia-muted mt-4">Sin contratos · Sin tarjeta de crédito · Configuración en 1 día</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ──
function FinalCTA({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <section className="py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Tu negocio merece más
          <br />
          <span className="gradient-text">que un Excel.</span>
        </h2>
        <p className="text-lg text-gaia-muted mb-8 max-w-xl mx-auto">
          Pregúntale algo a GAIA ahora mismo. Es la mejor demo que puedes tener.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={onOpenChat}
            className="glow-button px-8 py-4 rounded-xl bg-gaia-cyan text-white font-bold text-lg hover:bg-cyan-500 transition-colors relative z-10"
          >
            🧠 Hablar con GAIA ahora
          </button>
          <a
            href="https://wa.me/+5218112345678?text=Hola%2C%20quiero%20info%20sobre%20GAIA%20Prime"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-xl border border-gaia-border text-gaia-text font-semibold text-lg hover:bg-gaia-surface transition-colors flex items-center gap-2"
          >
            💬 WhatsApp
          </a>
        </div>
        <p className="text-xs text-gaia-muted mt-6">Sin compromiso · Sin tarjeta · Arranca en 1 día</p>
      </div>
    </section>
  );
}

// ── Footer ──
function Footer() {
  return (
    <footer className="border-t border-gaia-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">✦</span>
            <span className="font-bold text-gaia-text">GAIA <span className="text-gaia-gold">Prime</span></span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gaia-muted">
            <a href="#solucion" className="hover:text-gaia-text transition-colors">Producto</a>
            <a href="#precio" className="hover:text-gaia-text transition-colors">Precios</a>
            <a href="#comparativa" className="hover:text-gaia-text transition-colors">Comparativa</a>
          </div>

          <p className="text-sm text-gaia-muted">
            Hecho en México 🇲🇽 para PyMEs reales
          </p>
        </div>
      </div>
    </footer>
  );
}

// ══════════════════════════════════════
// ── Main App ──
// ══════════════════════════════════════
export default function App() {
  const [chatOpen, setChatOpen] = useState(false);
  useReveal();

  return (
    <div className="relative min-h-screen">
      {/* Aurora background */}
      <div className="aurora-bg">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar onOpenChat={() => setChatOpen(true)} />
        <Hero onOpenChat={() => setChatOpen(true)} />
        <PainPoints />
        <Solution />
        <Modules />
        <UseCases />
        <Comparison />
        <Pricing onOpenChat={() => setChatOpen(true)} />
        <FinalCTA onOpenChat={() => setChatOpen(true)} />
        <Footer />
      </div>

      {/* GAIA Live Chat — THE CTA */}
      <GaiaChat isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
    </div>
  );
}
