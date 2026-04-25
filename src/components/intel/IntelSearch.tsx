'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, Mail, Wifi, Hash, Link, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type DetectedType = 'ip' | 'domain' | 'email' | 'hash' | 'url' | null;

const IP_RE = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOMAIN_RE = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+$/;
const HASH_RE = /^[a-f0-9]{32}$|^[a-f0-9]{40}$|^[a-f0-9]{64}$/i;
const URL_RE = /^https?:\/\/.+/;

function detect(value: string): DetectedType {
  const v = value.trim();
  if (!v) return null;
  if (IP_RE.test(v)) return 'ip';
  if (EMAIL_RE.test(v)) return 'email';
  if (URL_RE.test(v)) return 'url';
  if (HASH_RE.test(v)) return 'hash';
  if (DOMAIN_RE.test(v.replace(/^https?:\/\//, '').split('/')[0])) return 'domain';
  return null;
}

const TYPE_META: Record<NonNullable<DetectedType>, { icon: typeof Search; label: string; color: string; path: string }> = {
  ip:     { icon: Wifi,   label: 'IP Address', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',     path: '/tools/ip'     },
  domain: { icon: Globe,  label: 'Domain',     color: 'text-brand-400 bg-brand-500/10 border-brand-500/30', path: '/tools/domain' },
  email:  { icon: Mail,   label: 'Email',      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', path: '/tools/email' },
  hash:   { icon: Hash,   label: 'Hash',       color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', path: '/tools/hash'  },
  url:    { icon: Link,   label: 'URL',        color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',    path: '/tools/domain' },
};

interface Props {
  placeholder?: string;
  size?: 'sm' | 'lg';
  initialValue?: string;
  onSearch?: (value: string, type: DetectedType) => void;
}

export default function IntelSearch({ placeholder, size = 'lg', initialValue = '', onSearch }: Props) {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const detected = detect(value);
  const router = useRouter();
  const locale = useLocale();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;

    if (onSearch) {
      setLoading(true);
      onSearch(v, detected);
      setLoading(false);
      return;
    }

    if (detected && TYPE_META[detected]) {
      const path = `/${locale}${TYPE_META[detected].path}?q=${encodeURIComponent(v)}`;
      router.push(path);
    }
  }, [value, detected, router, locale, onSearch]);

  const meta = detected ? TYPE_META[detected] : null;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={cn(
        'relative flex items-center gap-3 bg-dark-950/80 border rounded-xl backdrop-blur-md transition-all duration-200',
        size === 'lg' ? 'px-4 py-3.5' : 'px-3 py-2.5',
        detected ? 'border-brand-500/40 ring-1 ring-brand-500/10' : 'border-white/10 hover:border-white/20 focus-within:border-brand-500/40'
      )}>
        {/* Search icon or type indicator */}
        <AnimatePresence mode="wait">
          {meta ? (
            <motion.div
              key="typed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className={cn('flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap', meta.color)}
            >
              <meta.icon className="w-3 h-3" />
              {meta.label}
            </motion.div>
          ) : (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Search className={cn('text-dark-500 shrink-0', size === 'lg' ? 'w-5 h-5' : 'w-4 h-4')} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder ?? 'Search IP, domain, email, or hash...'}
          className={cn(
            'flex-1 bg-transparent text-white placeholder-dark-500 outline-none font-mono',
            size === 'lg' ? 'text-base' : 'text-sm'
          )}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Clear */}
        {value && (
          <button
            type="button"
            onClick={() => setValue('')}
            className="text-dark-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!value.trim() || loading}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all',
            'bg-brand-500 hover:bg-brand-400 text-white disabled:opacity-40 disabled:cursor-not-allowed',
            'active:scale-95'
          )}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Hint */}
      {!detected && value.length > 2 && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-dark-500 mt-2 px-1"
        >
          Type an IP (1.2.3.4), domain (example.com), email, or hash
        </motion.p>
      )}
    </form>
  );
}
