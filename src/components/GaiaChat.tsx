import { useState, useRef, useEffect, useCallback } from 'react';

/* ══════════════════════════════════════════════════════════════
   GAIA Live Chat — Embedded on landing page
   THIS IS THE CTA: the product sells itself.
   
   - If VITE_GAIA_API_URL is set → connects to real GAIA backend
   - Otherwise → smart demo mode with pre-scripted responses
   ══════════════════════════════════════════════════════════════ */

const API_URL = import.meta.env.VITE_GAIA_API_URL || '';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
  timestamp: Date;
};

// ── Agent metadata ──
const AGENTS: Record<string, { emoji: string; color: string; label: string }> = {
  gaia:       { emoji: '🧠', color: 'text-cyan-400',    label: 'GAIA' },
  hermes:     { emoji: '📦', color: 'text-emerald-400', label: 'Hermes · ERP' },
  athena:     { emoji: '📊', color: 'text-violet-400',  label: 'Athena · Analytics' },
  hephaestus: { emoji: '🔨', color: 'text-amber-400',   label: 'Hephaestus · Trabajo' },
  iris:       { emoji: '💬', color: 'text-sky-400',     label: 'Iris · Comunicación' },
  mercuria:   { emoji: '🛍️', color: 'text-yellow-400',  label: 'Mercuria · Commerce' },
  hera:       { emoji: '🔐', color: 'text-rose-400',    label: 'Hera · Auth' },
};

// ── Demo responses (when no API available) ──
const DEMO_PATTERNS: { pattern: RegExp; agent: string; response: string }[] = [
  {
    pattern: /precio|costo|cu[aá]nto cuesta|plan|tarifa|pagar/i,
    agent: 'gaia',
    response: `**GAIA Prime** tiene un plan simple y transparente:\n\n💰 **$499/mes** + **1% por venta procesada**\n(~$2-5 pesos por transacción)\n\n✅ Incluye TODO:\n• ERP completo (inventario, compras, ventas, facturas SAT)\n• Tienda online + MercadoLibre\n• Gestión de trabajo para bodegueros\n• Analytics y dashboards de CEO\n• Yo (GAIA) disponible 24/7\n\n**Sin contratos** · Sin costos ocultos · Cancela cuando quieras.\n\n¿Quieres que te muestre cómo funciona?`,
  },
  {
    pattern: /demo|probar|ver|mostrar|funciona|c[oó]mo/i,
    agent: 'gaia',
    response: `¡Estás hablando conmigo ahora mismo! 😄\n\nPregúntame lo que le preguntarías a tu negocio:\n\n• 📊 "¿Cuánto vendí este mes?"\n• 📦 "¿Qué productos tienen stock bajo?"\n• 🛒 "¿Quién me debe más?"\n• 🔨 "¿Cómo organizo mi producción?"\n• 🛍️ "¿Cómo pongo mi tienda online?"\n\nTe muestro datos de ejemplo para que veas cómo se siente. Si quieres verlo con TUS datos reales, déjame tu WhatsApp y te contactamos hoy. 🚀`,
  },
  {
    pattern: /vend[ií]|ventas|revenue|ingreso|factur/i,
    agent: 'athena',
    response: `📊 **Resumen de ventas — Febrero 2026**\n\n• Revenue total: **$283,450 MXN**\n• Transacciones: **67**\n• Ticket promedio: **$4,230 MXN**\n• Crecimiento vs enero: **+12.3%** 📈\n\n**Top 3 productos:**\n1. Mordaza Angular 5T — $48,000 (15 uds)\n2. Cabezal de Torque HD — $40,600 (7 uds)\n3. Placa Base CNC — $29,000 (20 uds)\n\n**Margen bruto:** 34.2%\n\n_Nota: datos de ejemplo. Con GAIA Prime conectado a tu negocio, verías tus cifras reales al instante._`,
  },
  {
    pattern: /stock|inventario|falta|comprar|reponer|material/i,
    agent: 'hermes',
    response: `📦 **Alerta de inventario**\n\n⚠️ **3 productos en stock crítico:**\n\n| Producto | Stock | Días restantes | Acción |\n|----------|-------|---------------|--------|\n| Mordaza Angular 5T | 4 uds | ~3 días | 🔴 URGENTE |\n| Cabezal Torque HD | 2 uds | ~2 días | 🔴 URGENTE |\n| Placa Base CNC | 0 uds | AGOTADO | ❌ SIN STOCK |\n\n💡 **Sugerencia de compra:**\nInversión: $24,500 MXN\nROI proyectado: **$68,200 MXN** en 30 días\n\n¿Genero la orden de compra automática?\n\n_Datos de ejemplo. GAIA Prime calcula esto con tu inventario real._`,
  },
  {
    pattern: /deud|cobr|pagar|debe|credito|cartera/i,
    agent: 'hermes',
    response: `📋 **Estado de cartera — Top deudores**\n\n1. **Distribuidora Norte** — $45,200 MXN (32 días)\n2. **AutoPartsPro** — $28,900 MXN (45 días) ⚠️\n3. **Taller Hernández** — $12,500 MXN (15 días)\n\n**Cartera total:** $186,600 MXN\n• Corriente (0-30 días): $98,400\n• Vencida (31-60 días): $62,200 ⚠️\n• Crítica (+60 días): $26,000 🔴\n\n¿Quieres que genere los recordatorios de cobro automáticos?\n\n_Datos de ejemplo._`,
  },
  {
    pattern: /tienda|online|internet|vender|storefront|ecommerce/i,
    agent: 'mercuria',
    response: `🛍️ **Tu tienda online en 60 segundos:**\n\n1. Elige tu tipo de negocio (general, restaurante, taller, etc.)\n2. Ponle nombre\n3. ¡Listo! Tienda publicada\n\n✅ Tus productos se sincronizan automáticamente desde el ERP\n✅ Link compartible por WhatsApp + QR automático\n✅ Los clientes hacen pedidos directo\n✅ También se conecta con **MercadoLibre** 🟡\n\nTodo esto viene incluido en los $499/mes. No necesitas Shopify, ni programador, ni agencia.\n\n¿Te interesa probarlo? Déjame tu WhatsApp.`,
  },
  {
    pattern: /trabajo|organiz|proceso|bodega|produccion|tarea/i,
    agent: 'hephaestus',
    response: `🔨 **Así organiza GAIA tu trabajo:**\n\nCuando recibes un pedido, automáticamente se genera:\n\n1. 📋 **Orden de trabajo** con todos los productos\n2. 👤 **Asignación** al bodeguero/operador disponible\n3. 📱 **Notificación** a su celular con lo que tiene que hacer\n4. 📸 **Verificación** — sube foto de que lo hizo bien\n5. ✅ **Completado** — tú lo ves en tu dashboard\n\nEl bodeguero ve SOLO sus tareas en su celular. No necesita computadora. No necesita entrenamiento.\n\nTu trabajo organizado como un **grafo visual** — no como una lista plana.\n\n_Disponible en GAIA Prime._`,
  },
  {
    pattern: /sat|cfdi|timbr|fiscal|rfc|factura/i,
    agent: 'hermes',
    response: `🧾 **Facturación SAT integrada:**\n\n• Timbrado CFDI directo (sin salir de GAIA)\n• Catálogos SAT completos (uso CFDI, formas de pago, regímenes)\n• RFC de clientes guardado en el directorio\n• Descarga XML automática\n• Notas de crédito\n• Compatible con todos los regímenes fiscales\n\nNada de abrir otra plataforma para facturar. Lo haces desde el mismo lugar donde vendes.\n\n_Incluido en GAIA Prime. No necesitas PAC adicional._`,
  },
  {
    pattern: /whatsapp|contacto|hablar|agendar|llam/i,
    agent: 'gaia',
    response: `¡Con gusto! 📱\n\nPuedes contactarnos por:\n\n• **WhatsApp**: wa.me/+5218112345678\n• **Email**: hola@gaiaprime.com.mx\n\nO si me dices tu número aquí, nuestro equipo te contacta hoy. La demo es gratuita y sin compromiso.\n\n¿Te gustaría agendar una llamada de 15 minutos?`,
  },
  {
    pattern: /hola|buenas|hey|hi|qué tal|que onda/i,
    agent: 'gaia',
    response: `¡Hola! 👋 Soy GAIA, el asistente inteligente de negocios.\n\nPuedo responderte sobre:\n• 📊 Ventas y analytics\n• 📦 Inventario y compras\n• 🛍️ Tienda online\n• 🔨 Organización de trabajo\n• 💰 Precios de GAIA Prime\n\n¿En qué te puedo ayudar?`,
  },
  {
    pattern: /mercado libre|meli|marketplace/i,
    agent: 'mercuria',
    response: `🟡 **MercadoLibre integrado nativamente:**\n\n• Conectas tu cuenta MeLi con OAuth (1 click)\n• Ves TODAS tus publicaciones en un dashboard\n• Sincroniza stock y precios automáticamente\n• Ve revenue, alertas y claims en un solo panel\n• Reactiva publicaciones pausadas con stock en bulk\n• Historial de ventas con gráficas\n\nOtros ERPs no tienen MercadoLibre. GAIA Prime sí. Es nativo, no un plugin.\n\n_Incluido en el plan de $499/mes._`,
  },
];

// ── Find best demo response ──
function findDemoResponse(input: string): { agent: string; response: string } {
  const match = DEMO_PATTERNS.find(p => p.pattern.test(input));
  if (match) return { agent: match.agent, response: match.response };
  return {
    agent: 'gaia',
    response: `Esa es una excelente pregunta. 🤔\n\nEn este momento estoy en **modo demo**, así que solo puedo responder sobre temas generales de GAIA Prime.\n\nPrueba preguntar:\n• "¿Cuánto vendí este mes?"\n• "¿Qué stock me falta?"\n• "¿Cuánto cuesta GAIA?"\n• "¿Cómo pongo mi tienda online?"\n\nO si quieres verme en acción con **datos reales de tu negocio**, déjame tu WhatsApp y te agendamos una demo personalizada. 🚀`,
  };
}

// ── Markdown-lite renderer ──
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-1.5" />;

    // Bold
    let processed = line.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gaia-text">$1</strong>');
    // Italic
    processed = processed.replace(/_([^_]+)_/g, '<em class="opacity-60 text-xs">$1</em>');
    // Inline code
    processed = processed.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-gaia-border/50 text-xs">$1</code>');

    // Headers
    if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-2 mb-1" dangerouslySetInnerHTML={{ __html: processed.slice(4) }} />;
    if (line.startsWith('## ')) return <h3 key={i} className="font-bold text-sm mt-2 mb-1" dangerouslySetInnerHTML={{ __html: processed.slice(3) }} />;

    // Table
    if (line.startsWith('|')) {
      if (/^\|[\s\-:|]+\|$/.test(line)) return null;
      const cells = line.split('|').filter(Boolean).map(c => c.trim());
      return (
        <div key={i} className="grid gap-1 text-[10px] py-0.5 border-b border-gaia-border/30" style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}>
          {cells.map((cell, ci) => <span key={ci} className="px-1 truncate" dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') }} />)}
        </div>
      );
    }

    // Bullet
    if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
      return <div key={i} className="flex gap-2 text-xs ml-1"><span className="text-gaia-cyan shrink-0">•</span><span dangerouslySetInnerHTML={{ __html: processed.slice(2) }} /></div>;
    }

    // Numbered
    if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.+)/);
      if (match) return <div key={i} className="flex gap-2 text-xs ml-1"><span className="text-gaia-cyan shrink-0">{match[1]}.</span><span dangerouslySetInnerHTML={{ __html: processed.replace(/^\d+\.\s/, '') }} /></div>;
    }

    return <p key={i} className="text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: processed }} />;
  });
}

// ── Quick prompts ──
const QUICK_PROMPTS = [
  { label: '📊 ¿Cuánto vendí?', message: '¿Cuánto vendí este mes?' },
  { label: '📦 ¿Qué me falta?', message: '¿Qué productos tienen stock bajo?' },
  { label: '💰 Precio', message: '¿Cuánto cuesta GAIA Prime?' },
  { label: '🛍️ Tienda online', message: '¿Cómo pongo mi tienda online?' },
];

// ══════════════════════════════════════
// ── Main Component ──
// ══════════════════════════════════════
export function GaiaChat({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `¡Hola! 👋 Soy **GAIA**, el asistente inteligente de negocios.\n\nPuedo mostrarte cómo funciona GAIA Prime con datos de ejemplo. Pregúntame lo que le preguntarías a tu negocio:\n\n• "¿Cuánto vendí este mes?"\n• "¿Qué stock me falta?"\n• "¿Cuánto cuesta?"\n\nO haz click en las sugerencias de abajo. 👇`,
        agent: 'gaia',
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Try real API first, fallback to demo mode
    if (API_URL) {
      try {
        const body: Record<string, unknown> = {
          message: content.trim(),
          use_tools: true,
        };
        if (conversationId) body.conversation_id = conversationId;

        const res = await fetch(`${API_URL}/gaia/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.conversation_id) setConversationId(data.conversation_id);

          setMessages(prev => [...prev, {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.response || 'Sin respuesta.',
            agent: data.agent || 'gaia',
            timestamp: new Date(),
          }]);
          setIsLoading(false);
          return;
        }
      } catch {
        // API unavailable — fall through to demo mode
      }
    }

    // Demo mode
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    const demo = findDemoResponse(content);
    setMessages(prev => [...prev, {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: demo.response,
      agent: demo.agent,
      timestamp: new Date(),
    }]);
    setIsLoading(false);
  }, [isLoading, conversationId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 text-white shadow-2xl shadow-cyan-500/25 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          title="Hablar con GAIA"
        >
          <span className="text-2xl">🧠</span>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <>
          {/* Backdrop (mobile) */}
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onToggle} />

          <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:w-[420px] h-[85vh] md:h-[600px] md:max-h-[80vh] md:rounded-2xl overflow-hidden bg-gaia-dark border border-gaia-border shadow-2xl shadow-black/50 flex flex-col">
            {/* Header */}
            <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gaia-border bg-gaia-surface/80">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                <span className="text-lg">🧠</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gaia-text flex items-center gap-2">
                  GAIA
                  <span className="flex items-center gap-1 text-[10px] text-green-400 font-normal">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    En línea
                  </span>
                </h3>
                <p className="text-[11px] text-gaia-muted truncate">Asistente inteligente de negocios</p>
              </div>
              <button
                onClick={onToggle}
                className="w-8 h-8 rounded-lg hover:bg-gaia-border/50 flex items-center justify-center text-gaia-muted hover:text-gaia-text transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => {
                const isUser = msg.role === 'user';
                const agent = AGENTS[msg.agent || 'gaia'] || AGENTS.gaia;

                return (
                  <div key={msg.id} className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
                    {!isUser && (
                      <div className="w-7 h-7 rounded-full bg-gaia-surface border border-gaia-border flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs">{agent.emoji}</span>
                      </div>
                    )}
                    <div className={`max-w-[85%] ${isUser ? 'ml-auto' : ''}`}>
                      {!isUser && (
                        <p className={`text-[10px] font-medium mb-1 ${agent.color}`}>{agent.label}</p>
                      )}
                      <div className={`rounded-2xl px-3.5 py-2.5 ${
                        isUser
                          ? 'bg-gaia-cyan text-white rounded-br-sm'
                          : 'bg-gaia-surface border border-gaia-border rounded-bl-sm'
                      }`}>
                        {isUser ? (
                          <p className="text-sm">{msg.content}</p>
                        ) : (
                          <div className="text-gaia-text">{renderMarkdown(msg.content)}</div>
                        )}
                      </div>
                      <p className={`text-[10px] text-gaia-muted mt-0.5 ${isUser ? 'text-right' : ''}`}>
                        {msg.timestamp.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Thinking indicator */}
              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gaia-surface border border-gaia-border flex items-center justify-center shrink-0">
                    <span className="text-xs">🧠</span>
                  </div>
                  <div className="bg-gaia-surface border border-gaia-border rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="typing-dots flex gap-1.5">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div className="shrink-0 px-4 pb-2 flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((qp, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(qp.message)}
                    className="px-3 py-1.5 rounded-full bg-gaia-surface border border-gaia-border text-xs text-gaia-muted hover:text-gaia-text hover:border-gaia-cyan/30 transition-colors"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="shrink-0 p-3 border-t border-gaia-border">
              <div className="flex items-end gap-2 bg-gaia-surface border border-gaia-border rounded-xl px-3 py-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escríbele a GAIA..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-gaia-text placeholder:text-gaia-muted resize-none outline-none max-h-24"
                  style={{ minHeight: '24px' }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 rounded-lg bg-gaia-cyan flex items-center justify-center text-white shrink-0 disabled:opacity-40 hover:bg-cyan-500 transition-colors"
                >
                  <span className="text-sm">➤</span>
                </button>
              </div>
              <p className="text-[10px] text-gaia-muted text-center mt-1.5">
                {API_URL ? 'Conectado a GAIA en vivo' : 'Modo demo · Datos de ejemplo'}
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
