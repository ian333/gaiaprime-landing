/**
 * 🟢 HEALTHY METRICS — L1.5: KPIs sanos en chips compactos
 * ==========================================================
 */

import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import type { CeoPulseKPI } from '@/types/ceo-pulse';
import { DOMAIN_LABELS } from '@/types/ceo-pulse';
import { CheckCircle, TrendDown, TrendUp, Minus } from '@phosphor-icons/react';

type HealthyMetricsProps = {
  metrics: CeoPulseKPI[];
  isLoading: boolean;
};

function MicroSparkline({ data }: { data: (number | null)[] }) {
  const clean = data.filter((v): v is number => v !== null);
  if (clean.length < 2) return null;
  const chartData = clean.map((value, i) => ({ value, i }));
  return (
    <div className="w-12 h-5 flex-shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="value" stroke="rgba(16,185,129,0.45)"
            strokeWidth={1} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function DeltaInline({ kpi }: { kpi: CeoPulseKPI }) {
  if (kpi.delta_display === '—') return null;
  const Icon = kpi.delta_direction === 'up' ? TrendUp
    : kpi.delta_direction === 'down' ? TrendDown : Minus;
  return (
    <span className="flex items-center gap-0.5 text-[10px] text-emerald-500/60">
      <Icon size={9} weight="bold" />{kpi.delta_display}
    </span>
  );
}

function HealthyChip({ kpi }: { kpi: CeoPulseKPI }) {
  return (
    <div className={cn(
      'healthy-metric flex items-center gap-2 rounded-lg border border-emerald-500/10',
      'bg-emerald-500/[0.03] px-3 py-2 transition-all duration-200 hover:bg-emerald-500/[0.06]',
    )}>
      <MicroSparkline data={kpi.sparkline} />
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[11px] text-muted-foreground/70 truncate">{kpi.label}</span>
        <span className="text-[9px] text-muted-foreground/30 uppercase tracking-wider">
          {DOMAIN_LABELS[kpi.domain] ?? kpi.domain}
        </span>
      </div>
      <div className="flex flex-col items-end flex-shrink-0">
        <span className="text-sm font-semibold text-emerald-400/80">{kpi.display}</span>
        <DeltaInline kpi={kpi} />
      </div>
    </div>
  );
}

function HealthySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="rounded-lg border border-border/10 p-2 animate-pulse h-12" />
      ))}
    </div>
  );
}

export function HealthyMetrics({ metrics, isLoading }: HealthyMetricsProps) {
  if (isLoading) return <HealthySkeleton />;
  if (!metrics.length) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <CheckCircle size={14} weight="fill" className="text-emerald-500/50" />
        <h3 className="text-xs font-semibold text-muted-foreground/50">Estables</h3>
        <span className="text-[10px] text-muted-foreground/30">{metrics.length} métricas</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {metrics.map(kpi => <HealthyChip key={kpi.id} kpi={kpi} />)}
      </div>
    </div>
  );
}
