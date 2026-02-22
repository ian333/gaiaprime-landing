/**
 * 🔴 ANOMALY HEROES — L1: KPIs que necesitan atención
 * =====================================================
 */

import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import type { CeoPulseKPI, PulseKPISeverity } from '@/types/ceo-pulse';
import { SEVERITY_COLORS, DOMAIN_LABELS } from '@/types/ceo-pulse';
import { TrendDown, TrendUp, Minus, WarningCircle } from '@phosphor-icons/react';

type AnomalyHeroesProps = {
  anomalies: CeoPulseKPI[];
  isLoading: boolean;
};

/* ── Sparkline ── */
function MiniSparkline({ data, severity }: { data: (number | null)[]; severity: PulseKPISeverity }) {
  const clean = data.filter((v): v is number => v !== null);
  if (clean.length < 2) return null;
  const chartData = clean.map((value, i) => ({ value, i }));
  const colorMap: Record<PulseKPISeverity, string> = {
    critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6', healthy: '#10b981',
  };
  return (
    <div className="w-full h-10">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="value" stroke={colorMap[severity]}
            strokeWidth={1.5} dot={false} strokeOpacity={0.7} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Delta Badge ── */
function DeltaBadge({ kpi }: { kpi: CeoPulseKPI }) {
  if (kpi.delta_display === '—') return null;
  const Icon = kpi.delta_direction === 'down' ? TrendDown
    : kpi.delta_direction === 'up' ? TrendUp : Minus;
  const color = kpi.delta_direction === 'down' ? 'text-red-400'
    : kpi.delta_direction === 'up' ? 'text-emerald-400' : 'text-muted-foreground/50';
  return (
    <span className={cn('flex items-center gap-0.5 text-xs font-medium', color)}>
      <Icon size={12} weight="bold" />
      {kpi.delta_display}
    </span>
  );
}

/* ── Severity Dot ── */
function SeverityDot({ severity }: { severity: PulseKPISeverity }) {
  return (
    <span className={cn(
      'inline-block w-2 h-2 rounded-full flex-shrink-0',
      SEVERITY_COLORS[severity].dot,
      severity === 'critical' && 'severity-dot-critical',
      severity === 'warning' && 'severity-dot-warning',
    )} />
  );
}

/* ── Card ── */
function AnomalyCard({ kpi, index }: { kpi: CeoPulseKPI; index: number }) {
  const colors = SEVERITY_COLORS[kpi.severity];

  return (
    <div
      className={cn(
        'relative rounded-xl border p-4 overflow-hidden transition-all duration-300',
        'hover:scale-[1.02] hover:z-10 cursor-default',
        colors.bg, colors.border,
        kpi.severity === 'critical' && 'anomaly-card-critical',
        kpi.severity === 'warning' && 'anomaly-card-warning',
        kpi.severity === 'info' && 'anomaly-card-watch',
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground/70 truncate">
          {kpi.label}
        </span>
        <SeverityDot severity={kpi.severity} />
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className={cn('text-2xl font-bold tracking-tight', colors.text)}>
          {kpi.display}
        </span>
        <DeltaBadge kpi={kpi} />
      </div>

      <p className="text-[10px] text-muted-foreground/30 mb-1">{kpi.comparison_period}</p>

      <MiniSparkline data={kpi.sparkline} severity={kpi.severity} />

      <p className="text-[11px] leading-tight text-muted-foreground/60 mt-2 flex items-start gap-1">
        <WarningCircle size={10} className="flex-shrink-0 mt-0.5 text-muted-foreground/40" />
        <span>{kpi.interpretation}</span>
      </p>

      {kpi.recommended_action && (
        <p className="text-[11px] leading-tight text-amber-400/60 mt-1 italic">
          → {kpi.recommended_action}
        </p>
      )}

      <div className="mt-2">
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground/30 font-medium">
          {DOMAIN_LABELS[kpi.domain] ?? kpi.domain}
        </span>
      </div>
    </div>
  );
}

/* ── Skeleton ── */
function AnomalySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="rounded-xl border border-border/20 p-4 animate-pulse">
          <div className="h-3 w-20 bg-muted/20 rounded mb-3" />
          <div className="h-7 w-24 bg-muted/20 rounded mb-2" />
          <div className="h-10 w-full bg-muted/10 rounded" />
        </div>
      ))}
    </div>
  );
}

/* ── Main ── */
export function AnomalyHeroes({ anomalies, isLoading }: AnomalyHeroesProps) {
  if (isLoading) return <AnomalySkeleton />;
  if (!anomalies.length) return null;

  const criticalCount = anomalies.filter(a => a.severity === 'critical').length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <WarningCircle size={16} weight="fill" className="text-red-400/70" />
        <h3 className="text-sm font-semibold text-muted-foreground/80">Requieren atención</h3>
        {criticalCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium">
            {criticalCount} críticas
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {anomalies.map((kpi, i) => <AnomalyCard key={kpi.id} kpi={kpi} index={i} />)}
      </div>
    </div>
  );
}
