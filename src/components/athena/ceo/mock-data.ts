/**
 * 🫀 CEO PULSE — Mock Data for Landing Page
 * ============================================
 * Datos realistas para demostrar el dashboard sin backend.
 */

import type {
  PulseMeta, CeoPulseKPI, PulseNarrative, PulseForecastEvent,
  PulseAction, PulseComplete, PulseIntensity,
} from '@/types/ceo-pulse';

export const MOCK_PULSE_META: PulseMeta = {
  pulse_score: 73,
  status: 'Requiere atención',
  level: 'yellow',
  domain_scores: { financial: 82, sales: 71, inventory: 65, customers: 78 },
  period: { type: 'month', start: '2026-02-01', end: '2026-02-28', description: 'Febrero 2026' },
  timestamp: new Date().toISOString(),
};

export const MOCK_ANOMALIES: CeoPulseKPI[] = [
  {
    id: 'gross_margin',
    label: 'Margen Bruto',
    domain: 'financial',
    value: 28.5,
    display: '28.5%',
    format: 'percentage',
    delta: -5.2,
    delta_display: '-5.2%',
    delta_direction: 'down',
    comparison_period: 'vs mes anterior',
    is_anomaly: true,
    severity: 'critical',
    expected_range: [32, 38],
    deviation_sigma: 2.8,
    interpretation: 'Margen comprimido por aumento del 12% en costos de materia prima. Impacta directamente la rentabilidad operativa.',
    recommended_action: 'Renegociar contratos con proveedores principales. Considerar ajuste de precios.',
    sparkline: [35, 34.2, 33, 31.5, 30, 29.2, 28.5],
    sparkline_period: 'weekly',
    forecast: { value: 27.8, confidence: 72, horizon_days: 30 },
  },
  {
    id: 'inventory_turnover',
    label: 'Rotación de Inventario',
    domain: 'inventory',
    value: 3.2,
    display: '3.2x',
    format: 'number',
    delta: -1.1,
    delta_display: '-1.1x',
    delta_direction: 'down',
    comparison_period: 'vs trimestre anterior',
    is_anomaly: true,
    severity: 'warning',
    expected_range: [4, 6],
    deviation_sigma: 1.9,
    interpretation: 'Inventario estancado. 340 SKUs sin movimiento en 90+ días representan $180K en capital inmovilizado.',
    recommended_action: 'Ejecutar promoción de liquidación en productos dead-stock.',
    sparkline: [4.8, 4.5, 4.2, 3.8, 3.5, 3.2],
    sparkline_period: 'monthly',
    forecast: null,
  },
  {
    id: 'dso_days',
    label: 'Días de Cobro (DSO)',
    domain: 'financial',
    value: 52,
    display: '52 días',
    format: 'days',
    delta: 8,
    delta_display: '+8 días',
    delta_direction: 'up',
    comparison_period: 'vs mes anterior',
    is_anomaly: true,
    severity: 'warning',
    expected_range: [35, 45],
    deviation_sigma: 1.6,
    interpretation: 'Período de cobro se extiende. 3 clientes grandes tienen facturas vencidas por $45K.',
    recommended_action: 'Contactar clientes morosos. Revisar política de crédito.',
    sparkline: [38, 40, 42, 44, 47, 50, 52],
    sparkline_period: 'weekly',
    forecast: null,
  },
];

export const MOCK_HEALTHY: CeoPulseKPI[] = [
  {
    id: 'revenue_monthly', label: 'Revenue Mensual', domain: 'financial',
    value: 142800, display: '$142,800', format: 'currency',
    delta: 8.5, delta_display: '+8.5%', delta_direction: 'up',
    comparison_period: 'vs mes anterior', is_anomaly: false, severity: 'healthy',
    expected_range: [120000, 160000], deviation_sigma: null,
    interpretation: 'Revenue en rango esperado con tendencia alcista.',
    recommended_action: null, sparkline: [128, 131, 135, 138, 140, 142],
    sparkline_period: 'weekly', forecast: { value: 148000, confidence: 85, horizon_days: 30 },
  },
  {
    id: 'avg_ticket', label: 'Ticket Promedio', domain: 'sales',
    value: 1250, display: '$1,250', format: 'currency',
    delta: 3.2, delta_display: '+3.2%', delta_direction: 'up',
    comparison_period: 'vs mes anterior', is_anomaly: false, severity: 'healthy',
    expected_range: [1100, 1400], deviation_sigma: null,
    interpretation: 'Ticket promedio estable.', recommended_action: null,
    sparkline: [1180, 1200, 1220, 1230, 1240, 1250],
    sparkline_period: 'weekly', forecast: null,
  },
  {
    id: 'active_customers', label: 'Clientes Activos', domain: 'customers',
    value: 287, display: '287', format: 'number',
    delta: 12, delta_display: '+12', delta_direction: 'up',
    comparison_period: 'vs mes anterior', is_anomaly: false, severity: 'healthy',
    expected_range: [250, 320], deviation_sigma: null,
    interpretation: 'Base de clientes creciendo.', recommended_action: null,
    sparkline: [265, 270, 275, 278, 282, 287],
    sparkline_period: 'weekly', forecast: null,
  },
  {
    id: 'transactions', label: 'Transacciones', domain: 'sales',
    value: 1842, display: '1,842', format: 'number',
    delta: 5.1, delta_display: '+5.1%', delta_direction: 'up',
    comparison_period: 'vs mes anterior', is_anomaly: false, severity: 'healthy',
    expected_range: [1500, 2000], deviation_sigma: null,
    interpretation: 'Volumen de transacciones saludable.', recommended_action: null,
    sparkline: [1680, 1720, 1750, 1790, 1810, 1842],
    sparkline_period: 'weekly', forecast: null,
  },
  {
    id: 'product_coverage', label: 'Cobertura de Catálogo', domain: 'inventory',
    value: 94, display: '94%', format: 'percentage',
    delta: 1.2, delta_display: '+1.2%', delta_direction: 'up',
    comparison_period: 'vs mes anterior', is_anomaly: false, severity: 'healthy',
    expected_range: [90, 100], deviation_sigma: null,
    interpretation: 'Excelente cobertura de catálogo.', recommended_action: null,
    sparkline: [91, 92, 92, 93, 93, 94],
    sparkline_period: 'weekly', forecast: null,
  },
  {
    id: 'customer_satisfaction', label: 'Satisfacción', domain: 'customers',
    value: 4.6, display: '4.6/5', format: 'number',
    delta: 0.2, delta_display: '+0.2', delta_direction: 'up',
    comparison_period: 'vs mes anterior', is_anomaly: false, severity: 'healthy',
    expected_range: [4.0, 5.0], deviation_sigma: null,
    interpretation: 'Excelente nivel de satisfacción.', recommended_action: null,
    sparkline: [4.3, 4.3, 4.4, 4.5, 4.5, 4.6],
    sparkline_period: 'weekly', forecast: null,
  },
];

export const MOCK_NARRATIVE: PulseNarrative = {
  executive_brief: 'Revenue estable en $142.8K (+8.5% MoM) pero margen bruto comprimido a 28.5% por aumento en costos de materia prima (+12%). Rotación de inventario descendió a 3.2x con $180K en dead-stock. DSO extendido a 52 días por 3 clientes morosos con $45K en facturas vencidas. Acción inmediata requerida en negociación de proveedores y gestión de cobranza.',
  causal_chains: [
    {
      trigger: 'Costo materia prima +12%',
      effect: 'Margen bruto cayó a 28.5% (-5.2pp)',
      explanation: 'El aumento en precios de acero y aluminio impacta directamente los costos de producción. Si no se ajustan precios de venta, la rentabilidad seguirá deteriorándose.',
      action: 'Renegociar contratos con 3 proveedores principales. Evaluar proveedores alternativos.',
    },
    {
      trigger: 'Baja rotación de inventario',
      effect: '$180K en capital inmovilizado',
      explanation: '340 SKUs sin movimiento en 90+ días. El capital atrapado en inventario muerto reduce liquidez operativa.',
      action: 'Lanzar promoción de liquidación. Descontinuar productos con <5 ventas en 6 meses.',
    },
  ],
};

export const MOCK_FORECAST: PulseForecastEvent = {
  revenue_30d: { value: 148000, confidence: 85, horizon_days: 30 },
  actions: [
    { priority: 'URGENT', kpi: 'Margen Bruto', action: 'Renegociar contratos con proveedores de acero y aluminio', impact: 'Recuperar 2-3% de margen' },
    { priority: 'HIGH', kpi: 'DSO', action: 'Contactar 3 clientes con facturas vencidas >30 días ($45K)', impact: 'Recuperar $45K en flujo de caja' },
    { priority: 'HIGH', kpi: 'Inventario', action: 'Liquidar 340 SKUs dead-stock con descuento 30%', impact: 'Liberar ~$180K en capital' },
    { priority: 'MEDIUM', kpi: 'Revenue', action: 'Activar campaña de cross-sell a clientes top 20', impact: '+$15K en revenue incremental' },
  ],
};

export const MOCK_ACTIONS: PulseAction[] = MOCK_FORECAST.actions;

export const MOCK_COMPLETE: PulseComplete = {
  total_time_ms: 1240,
  kpi_count: 15,
  anomaly_count: 3,
  healthy_count: 12,
};

/** Full mock state matching useCeoPulse return shape */
export function useCeoPulseMock() {
  const intensity: PulseIntensity = 'alert';
  const actions = [...MOCK_ACTIONS];

  return {
    pulseMeta: MOCK_PULSE_META,
    anomalies: MOCK_ANOMALIES,
    healthy: MOCK_HEALTHY,
    narrative: MOCK_NARRATIVE,
    forecast: MOCK_FORECAST,
    actions,
    complete: MOCK_COMPLETE,
    progress: 100,
    isStreaming: false,
    isLoading: false,
    error: null,
    refetch: () => {},
    score: MOCK_PULSE_META.pulse_score,
    intensity,
    status: MOCK_PULSE_META.status,
    period: MOCK_PULSE_META.period,
    domainScores: MOCK_PULSE_META.domain_scores,
    anomalyCount: MOCK_COMPLETE.anomaly_count,
    healthyCount: MOCK_COMPLETE.healthy_count,
    totalKpis: MOCK_COMPLETE.kpi_count,
    criticalAnomalies: MOCK_ANOMALIES.filter(a => a.severity === 'critical'),
    warningAnomalies: MOCK_ANOMALIES.filter(a => a.severity === 'warning'),
    hasData: true,
    isComplete: true,
  };
}
