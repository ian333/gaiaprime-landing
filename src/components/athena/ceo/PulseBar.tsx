/**
 * 🫀 PULSE BAR — L0: CEO glance
 * ================================
 * SSE-aware: renderiza en cuanto llega pulse_meta (17% del stream).
 */

import { cn } from '@/lib/utils';
import type { PulseMeta, PulseIntensity } from '@/types/ceo-pulse';
import { getPulseIntensity } from '@/types/ceo-pulse';
import {
  Heartbeat,
  Warning,
  CheckCircle,
  Clock,
} from '@phosphor-icons/react';

type PulseBarProps = {
  pulseMeta: PulseMeta | null;
  anomalyCount: number;
  healthyCount: number;
  progress: number;
  isLoading: boolean;
};

/* ── Score Arc (SVG) ── */
function ScoreArc({ score }: { score: number }) {
  const intensity = getPulseIntensity(score);
  const pct = Math.min(score / 100, 1);
  const r = 38;
  const circumference = 2 * Math.PI * r;
  const arcLength = circumference * 0.75;
  const dashOffset = arcLength * (1 - pct);

  const color: Record<PulseIntensity, string> = {
    calm: '#10b981', alert: '#f59e0b', critical: '#ef4444', crisis: '#dc2626',
  };
  const glow: Record<PulseIntensity, string> = {
    calm: '0 0 12px rgba(16,185,129,0.4)', alert: '0 0 12px rgba(245,158,11,0.4)',
    critical: '0 0 16px rgba(239,68,68,0.5)', crisis: '0 0 20px rgba(220,38,38,0.6)',
  };

  return (
    <div className="relative w-[88px] h-[88px] flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-[135deg]">
        <circle cx={50} cy={50} r={r} fill="none" stroke="rgba(255,255,255,0.06)"
          strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`} />
        <circle cx={50} cy={50} r={r} fill="none" stroke={color[intensity]}
          strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={dashOffset}
          style={{
            filter: `drop-shadow(${glow[intensity]})`,
            transition: 'stroke-dashoffset 1.5s ease-out, stroke 1s ease',
          }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tracking-tight score-number"
          style={{ color: color[intensity] }}>{score}</span>
        <span className="text-[9px] text-muted-foreground/60 uppercase tracking-widest -mt-0.5">
          pulse
        </span>
      </div>
    </div>
  );
}

/* ── Status Badge ── */
function StatusBadge({ status, intensity }: { status: string; intensity: PulseIntensity }) {
  const cfg: Record<PulseIntensity, { icon: React.ReactNode; cls: string }> = {
    calm: { icon: <CheckCircle size={14} weight="fill" />, cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    alert: { icon: <Warning size={14} weight="fill" />, cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    critical: { icon: <Warning size={14} weight="fill" />, cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
    crisis: { icon: <Warning size={14} weight="fill" />, cls: 'bg-red-500/20 text-red-300 border-red-500/40 action-badge-urgent' },
  };
  const c = cfg[intensity];
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border', c.cls)}>
      {c.icon}<span className="capitalize">{status}</span>
    </span>
  );
}

/* ── Main ── */
export function PulseBar({ pulseMeta, anomalyCount, healthyCount, progress, isLoading }: PulseBarProps) {
  if (isLoading || !pulseMeta) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/30 animate-pulse">
        <div className="w-[88px] h-[88px] rounded-full bg-muted/20" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-48 bg-muted/20 rounded" />
          <div className="h-3 w-32 bg-muted/20 rounded" />
        </div>
      </div>
    );
  }

  const intensity = getPulseIntensity(pulseMeta.pulse_score);

  return (
    <div className={cn(
      'flex items-center gap-4 md:gap-6 p-4 md:p-5 rounded-xl',
      'bg-card/40 backdrop-blur-sm border border-border/30',
      'transition-all duration-1000',
    )}>
      <ScoreArc score={pulseMeta.pulse_score} />

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={pulseMeta.status} intensity={intensity} />
          <span className="text-xs text-muted-foreground/50 flex items-center gap-1">
            <Clock size={11} />
            {pulseMeta.period.description}
          </span>
        </div>

        {progress > 0 && progress < 100 && (
          <div className="w-full h-0.5 rounded-full bg-muted/15 overflow-hidden">
            <div className="h-full bg-primary/40 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="flex items-center gap-4 text-xs">
          {anomalyCount > 0 && (
            <span className="flex items-center gap-1 text-red-400/80">
              <Warning size={12} weight="fill" />{anomalyCount} alertas
            </span>
          )}
          <span className="flex items-center gap-1 text-emerald-400/60">
            <CheckCircle size={12} weight="fill" />{healthyCount} sanas
          </span>
        </div>
      </div>

      <div className="hidden md:flex items-center">
        <Heartbeat size={28} weight="fill"
          className={cn('transition-colors duration-1000',
            intensity === 'calm' && 'text-emerald-500/30',
            intensity === 'alert' && 'text-amber-500/40',
            intensity === 'critical' && 'text-red-500/50',
            intensity === 'crisis' && 'text-red-400/60',
          )}
          style={{
            animation: intensity === 'crisis'
              ? 'severityDotCritical 1s ease-in-out infinite'
              : intensity === 'critical'
              ? 'severityDotCritical 1.5s ease-in-out infinite'
              : 'healthyBreathe 4s ease-in-out infinite',
          }} />
      </div>
    </div>
  );
}
