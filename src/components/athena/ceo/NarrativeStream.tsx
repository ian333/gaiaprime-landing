/**
 * 📖 NARRATIVE STREAM — L2: Executive brief + causal chains + forecast + actions
 * ===============================================================================
 */

import { cn } from '@/lib/utils';
import type { PulseNarrative, PulseForecastEvent, PulseAction, CausalChain } from '@/types/ceo-pulse';
import {
  Lightning, ArrowRight, ChartLineUp, Warning,
  Target, Crosshair, Info,
} from '@phosphor-icons/react';

type NarrativeStreamProps = {
  narrative: PulseNarrative | null;
  forecast: PulseForecastEvent | null;
  actions: PulseAction[];
  isLoading: boolean;
};

const PRIORITY_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  URGENT: { bg: 'bg-red-500/15', text: 'text-red-400', label: 'URGENTE' },
  HIGH:   { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'ALTO' },
  MEDIUM: { bg: 'bg-blue-500/15', text: 'text-blue-400', label: 'MEDIO' },
  LOW:    { bg: 'bg-muted/15', text: 'text-muted-foreground/60', label: 'BAJO' },
};

function CausalChainCard({ chain, index }: { chain: CausalChain; index: number }) {
  return (
    <div
      className="rounded-lg border border-amber-500/10 bg-amber-500/[0.02] p-3 space-y-2"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-amber-400/80 bg-amber-500/10 rounded-md px-2 py-0.5">
          {chain.trigger}
        </span>
        <ArrowRight size={12} className="text-muted-foreground/30" />
        <span className="text-xs font-medium text-red-400/70 bg-red-500/10 rounded-md px-2 py-0.5">
          {chain.effect}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground/50 leading-snug">{chain.explanation}</p>
      <div className="flex items-start gap-1.5 text-[11px] text-emerald-400/60">
        <Target size={11} className="flex-shrink-0 mt-0.5" />
        <span>{chain.action}</span>
      </div>
    </div>
  );
}

function ActionItem({ action, index }: { action: PulseAction; index: number }) {
  const style = PRIORITY_STYLE[action.priority] ?? PRIORITY_STYLE.MEDIUM;
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border border-border/10 bg-background/30 p-3',
        'transition-all duration-200 hover:bg-background/50',
        action.priority === 'URGENT' && 'action-badge-urgent',
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0', style.bg, style.text)}>
        {style.label}
      </span>
      <div className="space-y-1 min-w-0 flex-1">
        <p className="text-xs text-foreground/80 leading-snug">{action.action}</p>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/40">
          <span className="flex items-center gap-1">
            <Crosshair size={9} />{action.kpi}
          </span>
          <span className="flex items-center gap-1">
            <ChartLineUp size={9} />{action.impact}
          </span>
        </div>
      </div>
    </div>
  );
}

function ForecastCard({ forecast }: { forecast: PulseForecastEvent }) {
  if (!forecast.revenue_30d) return null;
  const rev = forecast.revenue_30d;
  const formatted = rev.value >= 1_000_000
    ? `$${(rev.value / 1_000_000).toFixed(1)}M`
    : rev.value >= 1_000
    ? `$${(rev.value / 1_000).toFixed(1)}K`
    : `$${rev.value.toFixed(0)}`;
  return (
    <div className="rounded-xl border border-blue-500/15 bg-blue-500/[0.03] p-4 space-y-2">
      <div className="flex items-center gap-2">
        <ChartLineUp size={14} weight="fill" className="text-blue-400/60" />
        <h4 className="text-xs font-semibold text-blue-400/70">
          Pronóstico {rev.horizon_days} días
        </h4>
      </div>
      <div className="grid grid-cols-2 gap-3 text-center">
        <div>
          <p className="text-lg font-bold text-blue-400">{formatted}</p>
          <p className="text-[9px] text-muted-foreground/40 uppercase">Proyectado</p>
        </div>
        <div>
          <p className="text-lg font-bold text-amber-400">{rev.confidence}%</p>
          <p className="text-[9px] text-muted-foreground/40 uppercase">Confianza</p>
        </div>
      </div>
    </div>
  );
}

function NarrativeSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 w-48 bg-muted/20 rounded" />
      <div className="space-y-2">
        {[1, 2, 3].map(i => <div key={i} className="h-3 w-full bg-muted/10 rounded" />)}
      </div>
      <div className="h-16 w-full bg-muted/10 rounded-lg" />
    </div>
  );
}

export function NarrativeStream({ narrative, forecast, actions, isLoading }: NarrativeStreamProps) {
  if (isLoading) return <NarrativeSkeleton />;
  if (!narrative && !forecast && !actions.length) return null;

  return (
    <div className="space-y-5">
      {narrative?.executive_brief && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Info size={14} weight="fill" className="text-blue-400/50" />
            <h3 className="text-xs font-semibold text-muted-foreground/60">Briefing ejecutivo</h3>
          </div>
          <p className="narrative-text text-sm text-foreground/70 leading-relaxed pl-5 border-l-2 border-blue-500/15">
            {narrative.executive_brief}
          </p>
        </div>
      )}

      {narrative?.causal_chains && narrative.causal_chains.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Warning size={14} weight="fill" className="text-amber-400/50" />
            <h3 className="text-xs font-semibold text-muted-foreground/60">Cadenas causales</h3>
          </div>
          <div className="space-y-2">
            {narrative.causal_chains.map((chain, i) => (
              <CausalChainCard key={i} chain={chain} index={i} />
            ))}
          </div>
        </div>
      )}

      {forecast && <ForecastCard forecast={forecast} />}

      {actions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Lightning size={14} weight="fill" className="text-amber-400/50" />
            <h3 className="text-xs font-semibold text-muted-foreground/60">Acciones recomendadas</h3>
            <span className="text-[10px] text-muted-foreground/30">{actions.length}</span>
          </div>
          <div className="space-y-1.5">
            {actions.map((a, i) => <ActionItem key={i} action={a} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}
