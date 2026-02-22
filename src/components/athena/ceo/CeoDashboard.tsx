/**
 * 🫀 CEO DASHBOARD — Landing Page Version
 * ==========================================
 * Real components with mock data. No SSE needed.
 * Wrapped sections have data-section attributes for walkthrough highlighting.
 */

import { cn } from '@/lib/utils';
import { levelToIntensity } from '@/types/ceo-pulse';
import type { PulseKPIDomain } from '@/types/ceo-pulse';
import { DOMAIN_LABELS } from '@/types/ceo-pulse';
import { PulseBar } from './PulseBar';
import { AnomalyHeroes } from './AnomalyHeroes';
import { HealthyMetrics } from './HealthyMetrics';
import { NarrativeStream } from './NarrativeStream';
import { useCeoPulseMock } from './mock-data';
import { Calendar, Timer } from '@phosphor-icons/react';
import '@/styles/ceo-pulse.css';

/* ── Domain Scores ── */
function DomainScores({ scores }: { scores: Record<string, number> }) {
  if (!Object.keys(scores).length) return null;
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {Object.entries(scores).map(([domain, score]) => {
        const label = DOMAIN_LABELS[domain as PulseKPIDomain] ?? domain;
        const pct = Math.min(score, 100);
        const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';
        return (
          <div key={domain} className="flex items-center gap-1.5" title={`${label}: ${score}`}>
            <span className="text-[9px] text-muted-foreground/40 uppercase tracking-wider w-12 truncate">
              {label}
            </span>
            <div className="w-16 h-1.5 rounded-full bg-muted/15 overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-1000', color)}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground/50 w-6 text-right">{score}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main Dashboard ── */
export function CeoDashboard() {
  const pulse = useCeoPulseMock();
  const bgIntensity = pulse.pulseMeta
    ? levelToIntensity(pulse.pulseMeta.level)
    : 'calm';

  return (
    <div
      className={cn(
        'space-y-4 md:space-y-6 transition-all duration-1000 rounded-xl p-3 md:p-4 lg:p-6',
        `pulse-bg-${bgIntensity}`,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-muted-foreground/40" />
          <div className="flex items-center gap-1 bg-muted/10 rounded-lg p-0.5">
            {['Mes', 'Trim.', 'Año', 'Todo'].map((label, i) => (
              <span
                key={label}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200',
                  i === 0
                    ? 'bg-primary/15 text-primary shadow-sm'
                    : 'text-muted-foreground/50',
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DomainScores scores={pulse.domainScores} />
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/30">
            <Timer size={10} />
            1.2s
          </span>
        </div>
      </div>

      {/* L0: Pulse Bar */}
      <div data-section="pulse-bar">
        <PulseBar
          pulseMeta={pulse.pulseMeta}
          anomalyCount={pulse.anomalyCount}
          healthyCount={pulse.healthyCount}
          progress={pulse.progress}
          isLoading={false}
        />
      </div>

      {/* L1: Anomaly Heroes */}
      <div data-section="anomaly-heroes">
        <AnomalyHeroes
          anomalies={pulse.anomalies}
          isLoading={false}
        />
      </div>

      {/* L2: Narrative + Forecast + Actions */}
      <div data-section="narrative-stream">
        <NarrativeStream
          narrative={pulse.narrative}
          forecast={pulse.forecast}
          actions={pulse.actions}
          isLoading={false}
        />
      </div>

      {/* L1.5: Healthy */}
      <div data-section="healthy-metrics">
        <HealthyMetrics
          metrics={pulse.healthy}
          isLoading={false}
        />
      </div>
    </div>
  );
}
