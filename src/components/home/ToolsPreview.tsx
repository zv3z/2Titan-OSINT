'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Mail, Globe, Search, User, Hash, Code, ExternalLink, Lock } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';

const TOOL_ICONS = [Mail, Globe, Search, User, Hash, Code];
const TOOL_KEYS = ['emailTracer', 'ipIntel', 'domainRecon', 'socialScan', 'hashDecoder', 'webCrawler'] as const;
const TOOL_STATUS = ['live', 'live', 'live', 'soon', 'soon', 'live'] as const;

export default function ToolsPreview() {
  const t = useTranslations('tools');
  const locale = useLocale();

  return (
    <section className="section bg-dark-950/40 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="container relative z-10">
        <SectionHeader
          badge={t('badge')}
          title={t('title')}
          titleHighlight={t('titleHighlight')}
          subtitle={t('subtitle')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOOL_KEYS.map((key, i) => {
            const Icon = TOOL_ICONS[i];
            const isLive = TOOL_STATUS[i] === 'live';

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="card p-5 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-brand-400" />
                  </div>
                  <span className={`badge text-xs ${isLive
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30'
                    : 'bg-dark-800 text-dark-400 border border-white/5'
                  }`}>
                    {isLive ? '● LIVE' : t('comingSoon')}
                  </span>
                </div>

                <h3 className="text-white font-semibold mb-1.5">
                  {t(`items.${key}.name`)}
                </h3>
                <p className="text-dark-400 text-xs leading-relaxed mb-4">
                  {t(`items.${key}.desc`)}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-dark-500 font-mono">
                    {t(`items.${key}.category`)}
                  </span>
                  {isLive ? (
                    <Link
                      href={`/${locale}/tools`}
                      className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium group-hover:gap-1.5 transition-all"
                    >
                      {t('launch')}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-dark-500">
                      <Lock className="w-3 h-3" />
                      Soon
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <Link href={`/${locale}/tools`} className="btn-secondary">
            {t('viewAll')}
            <span className="badge-green ms-2 text-xs">{t('items.emailTracer.category')} +</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
