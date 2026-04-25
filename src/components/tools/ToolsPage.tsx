'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Globe, Search, User, Hash, Code, ExternalLink, Lock, Terminal, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const TOOL_ICONS = [Mail, Globe, Search, User, Hash, Code];
const TOOL_KEYS = ['emailTracer', 'ipIntel', 'domainRecon', 'socialScan', 'hashDecoder', 'webCrawler'] as const;
const TOOL_STATUS = ['live', 'live', 'live', 'soon', 'soon', 'live'] as const;
const TOOL_CATS = ['osint', 'network', 'network', 'osint', 'crypto', 'web'] as const;

const CATEGORIES = ['all', 'osint', 'network', 'crypto', 'web'] as const;

export default function ToolsPage() {
  const t = useTranslations('tools');
  const [active, setActive] = useState<string>('all');

  const filtered = TOOL_KEYS.filter((_, i) =>
    active === 'all' || TOOL_CATS[i] === active
  );

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 grid-bg opacity-30" />

        <div className="container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge-green mb-4">
              <Terminal className="w-3 h-3" />
              {t('badge')}
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              {t('title')} <span className="gradient-text">{t('titleHighlight')}</span>
            </h1>
            <p className="text-dark-300 text-xl max-w-2xl mx-auto">{t('subtitle')}</p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-dark-950 to-transparent" />
      </section>

      {/* Filter tabs */}
      <section className="py-8 border-b border-white/5 sticky top-[72px] z-30 bg-dark-950/90 backdrop-blur-xl">
        <div className="container">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-dark-400 shrink-0 me-1" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                  active === cat
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                    : 'text-dark-400 hover:text-white hover:bg-white/5'
                )}
              >
                {t(`categories.${cat}`)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tools grid */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {TOOL_KEYS.map((key, i) => {
                if (active !== 'all' && TOOL_CATS[i] !== active) return null;
                const Icon = TOOL_ICONS[i];
                const isLive = TOOL_STATUS[i] === 'live';

                return (
                  <motion.div
                    key={key}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className={cn('card p-6 group', !isLive && 'opacity-60')}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-brand-400" />
                      </div>
                      <span className={cn(
                        'badge text-xs',
                        isLive
                          ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30'
                          : 'bg-dark-800 text-dark-500 border border-white/5'
                      )}>
                        {isLive ? '● LIVE' : 'SOON'}
                      </span>
                    </div>

                    <h3 className="text-white font-semibold text-lg mb-1.5">
                      {t(`items.${key}.name`)}
                    </h3>
                    <p className="text-dark-400 text-sm leading-relaxed mb-5">
                      {t(`items.${key}.desc`)}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-xs font-mono bg-dark-800 text-dark-400">
                        {t(`items.${key}.category`)}
                      </span>
                      {isLive ? (
                        <button className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors group-hover:gap-2 transition-all">
                          {t('launch')}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-dark-500">
                          <Lock className="w-3 h-3" />
                          {t('comingSoon')}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  );
}
