import { useState, useEffect, useCallback, useRef } from 'react';
import { CeoDashboard } from '@/components/athena/ceo/CeoDashboard';

/**
 * ═══════════════════════════════════════════════════════════
 * ATHENA WALKTHROUGH
 * ═══════════════════════════════════════════════════════════
 * 
 * Renders the REAL CeoDashboard with mock data, then does a
 * visual walkthrough — highlighting each section (PulseBar,
 * AnomalyHeroes, NarrativeStream, HealthyMetrics) one by one
 * while GAIA narrates what each part does.
 * 
 * Walkthrough steps:
 *   0. Full view (overview)
 *   1. PulseBar — Score de salud
 *   2. AnomalyHeroes — Detección de anomalías
 *   3. NarrativeStream — Briefing ejecutivo IA
 *   4. HealthyMetrics — Métricas estables
 */

// ── Step definitions ──
const STEPS = [
  {
    id: 'overview',
    section: null,
    label: 'Vista General',
    icon: '🫀',
    description: 'Dashboard CEO Pulse — tu negocio de un vistazo',
  },
  {
    id: 'pulse-bar',
    section: 'pulse-bar',
    label: 'Score de Salud',
    icon: '💓',
    description: 'Un número 0-100 que resume la salud de tu negocio. Colores cambian automáticamente.',
  },
  {
    id: 'anomaly-heroes',
    section: 'anomaly-heroes',
    label: 'Anomalías IA',
    icon: '🔴',
    description: 'La IA detecta KPIs con problemas, muestra tendencias y recomienda qué hacer.',
  },
  {
    id: 'narrative-stream',
    section: 'narrative-stream',
    label: 'Narrativa Ejecutiva',
    icon: '📖',
    description: 'Briefing automático, cadenas causales, pronósticos y acciones priorizadas.',
  },
  {
    id: 'healthy-metrics',
    section: 'healthy-metrics',
    label: 'Métricas Estables',
    icon: '✅',
    description: 'Las métricas que están bien. Respiran sutilmente para no distraerte.',
  },
];

// Map narration clip IDs → step index
const CLIP_STEP_MAP: Record<string, number> = {
  'athena_code_1': 0,
  'athena_code_2': 1,
  'athena_code_3': 2,
  'athena_code_4': 3,
};

interface AthenaWalkthroughProps {
  active: boolean;
  currentClip: string | null;
}

export function AthenaCodeWalkthrough({ active, currentClip }: AthenaWalkthroughProps) {
  const [step, setStep] = useState(0);
  const [manualOverride, setManualOverride] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Sync step with narration clip
  useEffect(() => {
    if (currentClip && currentClip in CLIP_STEP_MAP) {
      setStep(CLIP_STEP_MAP[currentClip]);
      setManualOverride(false);
    }
  }, [currentClip]);

  // Auto-cycle when not narrating
  useEffect(() => {
    if (!active) { setStep(0); return; }
    if (currentClip && currentClip in CLIP_STEP_MAP) return;
    if (manualOverride) return;

    const timer = setInterval(() => {
      setStep(s => (s + 1) % STEPS.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [active, currentClip, manualOverride]);

  // Apply highlight to the active section
  useEffect(() => {
    if (!dashboardRef.current) return;
    const activeSection = STEPS[step].section;

    dashboardRef.current.querySelectorAll('[data-section]').forEach(el => {
      (el as HTMLElement).classList.remove('wt-section-active');
      (el as HTMLElement).classList.remove('wt-section-dimmed');
    });

    if (activeSection) {
      dashboardRef.current.querySelectorAll('[data-section]').forEach(el => {
        const section = (el as HTMLElement).dataset.section;
        if (section === activeSection) {
          (el as HTMLElement).classList.add('wt-section-active');
        } else {
          (el as HTMLElement).classList.add('wt-section-dimmed');
        }
      });
    }
  }, [step]);

  const selectStep = useCallback((i: number) => {
    setStep(i);
    setManualOverride(true);
    setTimeout(() => setManualOverride(false), 15000);
  }, []);

  const currentStep = STEPS[step];

  return (
    <div className={`exp-slide-content ${active ? 'exp-text-enter' : 'opacity-0'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 lg:mb-5">
        <div>
          <div className="text-[11px] lg:text-xs xl:text-sm font-semibold text-cyan-400 uppercase tracking-widest mb-1">
            Athena · Business Intelligence
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight">
            Esto es lo que ves
            <span className="gradient-text"> al abrir tu negocio.</span>
          </h2>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] text-cyan-400 font-medium tracking-wide">PRODUCCIÓN</span>
        </div>
      </div>

      {/* Info card for current step */}
      <div className="wt-info-card mb-3 lg:mb-4" key={step}>
        <span className="text-base mr-2">{currentStep.icon}</span>
        <div>
          <span className="text-xs font-semibold text-cyan-400">{currentStep.label}</span>
          <span className="text-xs text-white/40 ml-2">— {currentStep.description}</span>
        </div>
      </div>

      {/* Dashboard container with walkthrough highlighting */}
      <div
        ref={dashboardRef}
        className={`wt-dashboard-container ${active ? 'exp-demo-enter' : 'opacity-0'}`}
      >
        <CeoDashboard />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-1.5 lg:gap-2 mt-3 lg:mt-5 flex-wrap">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => selectStep(i)}
            className={`wt-step-btn ${i === step ? 'wt-step-active' : ''}`}
          >
            <span className="text-xs">{s.icon}</span>
            <span className="hidden sm:inline text-[11px]">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
