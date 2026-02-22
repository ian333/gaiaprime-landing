/**
 * 🫀 CEO PULSE — Type Contract (SSE)
 * =====================================
 * Contrato entre backend SSE (/athena/ceo/pulse) y frontend.
 * 6 eventos progresivos: pulse_meta → anomalies → healthy → narrative → forecast → complete
 */

export type PulseKPIDomain = 'financial' | 'sales' | 'inventory' | 'customers';
export type PulseKPISeverity = 'critical' | 'warning' | 'info' | 'healthy';
export type PulseKPIFormat = 'currency' | 'percentage' | 'number' | 'days';

export interface CeoPulseKPI {
  id: string;
  label: string;
  domain: PulseKPIDomain;
  value: number | null;
  display: string;
  format: PulseKPIFormat;
  delta: number | null;
  delta_display: string;
  delta_direction: 'up' | 'down' | 'stable';
  comparison_period: string;
  is_anomaly: boolean;
  severity: PulseKPISeverity;
  expected_range: [number, number];
  deviation_sigma: number | null;
  interpretation: string;
  recommended_action: string | null;
  sparkline: (number | null)[];
  sparkline_period: 'daily' | 'weekly' | 'monthly';
  forecast: { value: number; confidence: number; horizon_days: number } | null;
}

export type PulseLevel = 'green' | 'yellow' | 'orange' | 'red';

export interface PulseMeta {
  pulse_score: number;
  status: string;
  level: PulseLevel;
  domain_scores: Record<string, number>;
  period: PulsePeriod;
  timestamp: string;
}

export interface PulsePeriod {
  type: string;
  start: string;
  end: string;
  description: string;
}

export interface CausalChain {
  trigger: string;
  effect: string;
  explanation: string;
  action: string;
}

export interface PulseNarrative {
  executive_brief: string;
  causal_chains: CausalChain[];
}

export type ActionPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface PulseAction {
  priority: ActionPriority;
  kpi: string;
  action: string;
  impact: string;
}

export interface PulseForecastEvent {
  revenue_30d: { value: number; confidence: number; horizon_days: number } | null;
  actions: PulseAction[];
}

export interface PulseComplete {
  total_time_ms: number;
  kpi_count: number;
  anomaly_count: number;
  healthy_count: number;
}

// ── Derived Types ──

export type PulseIntensity = 'calm' | 'alert' | 'critical' | 'crisis';

export function getPulseIntensity(score: number): PulseIntensity {
  if (score >= 80) return 'calm';
  if (score >= 60) return 'alert';
  if (score >= 40) return 'critical';
  return 'crisis';
}

export function levelToIntensity(level: PulseLevel): PulseIntensity {
  switch (level) {
    case 'green': return 'calm';
    case 'yellow': return 'alert';
    case 'orange': return 'critical';
    case 'red': return 'crisis';
  }
}

export const SEVERITY_COLORS: Record<PulseKPISeverity, {
  bg: string; border: string; text: string; glow: string; dot: string;
}> = {
  critical: {
    bg: 'bg-red-500/10', border: 'border-red-500/50',
    text: 'text-red-400', glow: 'shadow-red-500/20', dot: 'bg-red-500',
  },
  warning: {
    bg: 'bg-amber-500/10', border: 'border-amber-500/50',
    text: 'text-amber-400', glow: 'shadow-amber-500/20', dot: 'bg-amber-500',
  },
  info: {
    bg: 'bg-blue-500/10', border: 'border-blue-500/50',
    text: 'text-blue-400', glow: 'shadow-blue-500/20', dot: 'bg-blue-500',
  },
  healthy: {
    bg: 'bg-emerald-500/10', border: 'border-emerald-500/50',
    text: 'text-emerald-400', glow: 'shadow-emerald-500/20', dot: 'bg-emerald-500',
  },
};

export const DOMAIN_LABELS: Record<PulseKPIDomain, string> = {
  financial: 'Financiero',
  sales: 'Ventas',
  inventory: 'Inventario',
  customers: 'Clientes',
};
