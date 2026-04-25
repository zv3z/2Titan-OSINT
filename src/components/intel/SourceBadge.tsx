'use client';

import { CheckCircle, XCircle, AlertCircle, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IntelSource } from '@/lib/intel/types';

const STATUS_CONFIG = {
  ok:        { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'OK' },
  error:     { icon: XCircle,     color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',         label: 'Error' },
  not_found: { icon: AlertCircle, color: 'text-dark-500',    bg: 'bg-dark-800/50 border-white/5',           label: 'Not Found' },
  no_key:    { icon: Key,         color: 'text-dark-500',    bg: 'bg-dark-800/50 border-white/5',           label: 'No Key' },
};

interface Props {
  sources: IntelSource[];
}

export default function SourceBadges({ sources }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {sources.map((s) => {
        const cfg = STATUS_CONFIG[s.status];
        const Icon = cfg.icon;
        return (
          <div
            key={s.name}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium',
              cfg.bg, cfg.color
            )}
            title={s.status === 'no_key' ? `${s.name}: API key not configured` : s.name}
          >
            <Icon className="w-3 h-3" />
            <span>{s.name}</span>
          </div>
        );
      })}
    </div>
  );
}
