import { useState, useRef, useEffect } from 'react';

/* ══════════════════════════════════════════════════════════════
   Trial Signup — Zero-friction onboarding
   3 clicks: CTA → Form → Using GAIA
   
   Consumes:
   - POST /mercuria/gaia/trial
   - GET  /mercuria/gaia/plans  (optional, for dynamic pricing)
   ══════════════════════════════════════════════════════════════ */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

type TrialResponse = {
  subscription_id: string;
  tenant_slug: string;
  status: string;
  plan: string;
  plan_label: string;
  trial_days: number;
  login_url: string;
  admin_user: string;
  admin_password: string;
  message: string;
};

type TrialStep = 'form' | 'loading' | 'success' | 'error';

// ── Trial Modal ──
export function TrialModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState<TrialStep>('form');
  const [formData, setFormData] = useState({
    company_name: '',
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    industry_profile: 'la-hija-del-frances',
  });
  const [result, setResult] = useState<TrialResponse | null>(null);
  const [error, setError] = useState('');
  const [loadingDots, setLoadingDots] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  // Focus first field when modal opens
  useEffect(() => {
    if (isOpen && step === 'form') {
      setTimeout(() => nameRef.current?.focus(), 300);
    }
  }, [isOpen, step]);

  // Animated loading dots
  useEffect(() => {
    if (step !== 'loading') return;
    const interval = setInterval(() => {
      setLoadingDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);
    return () => clearInterval(interval);
  }, [step]);

  // Reset when closing
  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setStep('form');
      setError('');
      setResult(null);
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company_name.trim() || !formData.owner_name.trim() || !formData.owner_email.trim()) {
      setError('Completa los 3 campos obligatorios');
      return;
    }

    setStep('loading');
    setError('');

    try {
      const res = await fetch(`${API_BASE}/mercuria/gaia/trial`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          company_name: formData.company_name.trim(),
          owner_name: formData.owner_name.trim(),
          owner_email: formData.owner_email.trim(),
          ...(formData.owner_phone.trim() ? { owner_phone: formData.owner_phone.trim() } : {}),
          industry_profile: formData.industry_profile,
        }),
      });

      if (res.status === 409) {
        const err = await res.json();
        setError(err.detail || 'Ya existe una cuenta con ese email.');
        setStep('error');
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Error de conexión' }));
        setError(err.detail || `Error ${res.status}`);
        setStep('error');
        return;
      }

      const data: TrialResponse = await res.json();
      setResult(data);
      setStep('success');
    } catch {
      setError('No pudimos conectar con el servidor. Intenta de nuevo o contáctanos por WhatsApp.');
      setStep('error');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-[fadeIn_0.2s_ease]" 
        onClick={handleClose} 
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-gaia-dark border border-gaia-border rounded-2xl shadow-2xl shadow-black/50 w-full max-w-md pointer-events-auto animate-[slideUp_0.3s_ease]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">✦</span>
              <h2 className="font-bold text-gaia-text">
                {step === 'success' ? '¡Listo!' : step === 'loading' ? 'Configurando...' : 'Empieza Gratis'}
              </h2>
            </div>
            <button 
              onClick={handleClose}
              className="w-8 h-8 rounded-lg hover:bg-gaia-border/50 flex items-center justify-center text-gaia-muted hover:text-gaia-text transition-colors"
            >
              ✕
            </button>
          </div>

          {/* ── FORM STEP ── */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="px-6 pb-6">
              <p className="text-sm text-gaia-muted mb-5">
                Tu ERP completo gratis por 3 meses. Sin tarjeta, sin compromiso.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gaia-muted mb-1">Nombre de tu negocio *</label>
                  <input
                    ref={nameRef}
                    type="text"
                    value={formData.company_name}
                    onChange={e => setFormData(d => ({ ...d, company_name: e.target.value }))}
                    placeholder="Ej: Taquería Don Juan"
                    className="w-full px-4 py-2.5 rounded-xl bg-gaia-surface border border-gaia-border text-gaia-text text-sm placeholder:text-gaia-muted/50 outline-none focus:border-gaia-cyan/50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gaia-muted mb-1">Tu nombre *</label>
                  <input
                    type="text"
                    value={formData.owner_name}
                    onChange={e => setFormData(d => ({ ...d, owner_name: e.target.value }))}
                    placeholder="Ej: Juan López"
                    className="w-full px-4 py-2.5 rounded-xl bg-gaia-surface border border-gaia-border text-gaia-text text-sm placeholder:text-gaia-muted/50 outline-none focus:border-gaia-cyan/50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gaia-muted mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.owner_email}
                    onChange={e => setFormData(d => ({ ...d, owner_email: e.target.value }))}
                    placeholder="Ej: juan@donjuan.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-gaia-surface border border-gaia-border text-gaia-text text-sm placeholder:text-gaia-muted/50 outline-none focus:border-gaia-cyan/50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gaia-muted mb-1">Teléfono <span className="text-gaia-muted/50">(opcional)</span></label>
                  <input
                    type="tel"
                    value={formData.owner_phone}
                    onChange={e => setFormData(d => ({ ...d, owner_phone: e.target.value }))}
                    placeholder="Ej: 5573633622"
                    className="w-full px-4 py-2.5 rounded-xl bg-gaia-surface border border-gaia-border text-gaia-text text-sm placeholder:text-gaia-muted/50 outline-none focus:border-gaia-cyan/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gaia-muted mb-1">Giro de negocio</label>
                  <select
                    value={formData.industry_profile}
                    onChange={e => setFormData(d => ({ ...d, industry_profile: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-gaia-surface border border-gaia-border text-gaia-text text-sm outline-none focus:border-gaia-cyan/50 transition-colors"
                  >
                    <option value="la-hija-del-frances">🍔 Restaurante / Cafetería</option>
                    <option value="general" disabled>🏭 Industrial / Manufactura (próximamente)</option>
                    <option value="general" disabled>🛒 Comercio / Distribución (próximamente)</option>
                    <option value="general" disabled>🦷 Servicios / Consultorio (próximamente)</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-5 glow-button px-6 py-3.5 rounded-xl bg-gaia-cyan text-white font-bold text-base hover:bg-cyan-500 transition-colors relative z-10"
              >
                🚀 Crear mi cuenta gratis
              </button>

              <p className="text-[10px] text-gaia-muted text-center mt-3">
                Sin tarjeta de crédito · 3 meses gratis · Cancela cuando quieras
              </p>
            </form>
          )}

          {/* ── LOADING STEP ── */}
          {step === 'loading' && (
            <div className="px-6 pb-8 text-center">
              <div className="my-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gaia-cyan/10 border border-gaia-cyan/30 flex items-center justify-center mb-4 animate-pulse">
                  <span className="text-3xl">🧠</span>
                </div>
                <p className="text-gaia-text font-medium mb-2">
                  Configurando tu sistema{loadingDots}
                </p>
                <p className="text-xs text-gaia-muted">
                  Creando tu base de datos, productos de ejemplo y tienda online.
                  <br />Esto toma unos segundos.
                </p>
              </div>

              <div className="w-full bg-gaia-border rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-gaia-cyan to-violet-500 h-1.5 rounded-full animate-[progressBar_8s_ease-in-out_infinite]" />
              </div>
            </div>
          )}

          {/* ── SUCCESS STEP ── */}
          {step === 'success' && result && (
            <div className="px-6 pb-6">
              <div className="text-center mb-5">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-3">
                  <span className="text-3xl">✅</span>
                </div>
                <p className="text-sm text-gaia-text leading-relaxed">{result.message}</p>
              </div>

              {/* Credentials card */}
              <div className="bg-gaia-surface border border-gaia-border rounded-xl p-4 mb-4">
                <p className="text-[10px] text-gaia-muted uppercase tracking-wider mb-3">Tus credenciales</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gaia-muted">👤 Usuario</span>
                    <code className="text-sm font-mono text-gaia-cyan bg-gaia-cyan/10 px-2 py-0.5 rounded">{result.admin_user}</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gaia-muted">🔑 Contraseña</span>
                    <code className="text-sm font-mono text-gaia-cyan bg-gaia-cyan/10 px-2 py-0.5 rounded">{result.admin_password}</code>
                  </div>
                </div>
              </div>

              <div className="bg-gaia-surface/50 border border-gaia-border rounded-xl p-3 mb-5">
                <div className="flex items-center gap-2 text-xs text-gaia-muted">
                  <span>📋</span>
                  <span>Plan: <strong className="text-gaia-text">{result.plan_label}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gaia-muted mt-1">
                  <span>🎁</span>
                  <span>Trial gratis: <strong className="text-gaia-text">{result.trial_days} días</strong></span>
                </div>
              </div>

              <a
                href={result.login_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center glow-button px-6 py-3.5 rounded-xl bg-gaia-cyan text-white font-bold text-base hover:bg-cyan-500 transition-colors relative z-10"
              >
                🚀 Entrar a GAIA
              </a>

              <p className="text-[10px] text-gaia-muted text-center mt-3">
                También te enviamos las credenciales a tu email
              </p>
            </div>
          )}

          {/* ── ERROR STEP ── */}
          {step === 'error' && (
            <div className="px-6 pb-6 text-center">
              <div className="my-6">
                <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-3">
                  <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-sm text-red-400 mb-2">{error}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('form'); setError(''); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gaia-border text-gaia-text text-sm font-medium hover:bg-gaia-surface transition-colors"
                >
                  ← Intentar de nuevo
                </button>
                <a
                  href="https://wa.me/5215573633622?text=Hola%2C%20tuve%20un%20problema%20al%20registrarme%20en%20GAIA%20Prime"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gaia-surface border border-gaia-border text-gaia-text text-sm font-medium hover:border-gaia-cyan/30 transition-colors"
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
