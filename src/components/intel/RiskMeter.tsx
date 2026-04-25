'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { RiskScore, ThreatLevel } from '@/lib/intel/types';

const LEVEL_CONFIG: Record<ThreatLevel, { color: string; bg: string; ring: string; glow: string; label: string }> = {
  clean:      { color: 'text-emerald-400', bg: 'bg-emerald-500', ring: 'border-emerald-500/40', glow: 'shadow-emerald-500/30', label: 'Clean' },
  info:       { color: 'text-blue-400',    bg: 'bg-blue-500',    ring: 'border-blue-500/40',    glow: 'shadow-blue-500/30',    label: 'Low Risk' },
  suspicious: { color: 'text-yellow-400',  bg: 'bg-yellow-500',  ring: 'border-yellow-500/40',  glow: 'shadow-yellow-500/30',  label: 'Suspicious' },
  malicious:  { color: 'text-orange-400',  bg: 'bg-orange-500',  ring: 'border-orange-500/40',  glow: 'shadow-orange-500/30',  label: 'Malicious' },
  critical:   { color: 'text-red-400',     bg: 'bg-red-500',     ring: 'border-red-500/40',     glow: 'shadow-red-500/30',     label: 'Critical' },
};

interface Props {
  risk: RiskScore;
  size?: 'sm' | 'md' | 'lg';
  showFactors?: boolean;
}

export default function RiskMeter({ risk, size = 'md', showFactors = true }: Props) {
  const cfg = LEVEL_CONFIG[risk.level];
  const radius = size === 'sm' ? 36 : size === 'lg' ? 54 : 44;
  const stroke = size === 'sm' ? 6 : 8;
  const circumference = 2 * Math.PI * radius;
  const filled = (risk.score / 100) * circumference;

  const svgSize = (radius + stroke) * 2;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Circular gauge */}
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          {/* Track */}
          <circle
            cx={svgSize / 2} cy={svgSize / 2} r={radius}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}
          />
          {/* Filled arc */}
          <motion.circle
            cx={svgSize / 2} cy={svgSize / 2} r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - filled }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
            className={cn(
              risk.level === 'clean'      && 'stroke-emerald-500',
              risk.level === 'info'       && 'stroke-blue-500',
              risk.level === 'suspicious' && 'stroke-yellow-500',
              risk.level === 'malicious'  && 'stroke-orange-500',
              risk.level === 'critical'   && 'stroke-red-500',
            )}
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className={cn('font-bold leading-none', cfg.color,
              size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-4xl' : 'text-3xl'
            )}
          >
            {risk.score}
          </motion.span>
          <span className="text-dark-500 text-xs mt-0.5">/100</span>
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={cn(
          'px-4 py-1.5 rounded-full border font-semibold text-sm shadow-lg',
          cfg.color, cfg.ring, cfg.glow,
          'bg-dark-950/80'
        )}
      >
        {risk.label}
      </motion.div>

      {/* Confidence */}
      <div className="text-xs text-dark-500">
        Confidence: <span className="text-dark-300">{risk.confidence}%</span>
      </div>

      {/* Factors */}
      {showFactors && risk.factors.length > 0 && (
        <div className="w-full space-y-1.5">
          {risk.factors.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.05 }}
              className="flex items-start gap-2 text-xs text-dark-400"
            >
              <span className={cn('mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full', cfg.bg)} />
              {f}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
