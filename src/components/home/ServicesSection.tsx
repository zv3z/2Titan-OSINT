'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Search, Target, Brain, Database, BookOpen, ClipboardCheck, ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';

const ICONS = [Search, Target, Brain, Database, BookOpen, ClipboardCheck];

const KEYS = ['osint', 'pentest', 'threat', 'forensics', 'training', 'audit'] as const;

const COLORS = [
  'from-brand-500/20 to-brand-600/5 border-brand-500/20 hover:border-brand-500/40',
  'from-red-500/20 to-red-600/5 border-red-500/20 hover:border-red-500/40',
  'from-cyber-500/20 to-cyber-600/5 border-cyber-500/20 hover:border-cyan-500/40',
  'from-purple-500/20 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40',
  'from-yellow-500/20 to-yellow-600/5 border-yellow-500/20 hover:border-yellow-500/40',
  'from-blue-500/20 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40',
];

const ICON_COLORS = ['text-brand-400', 'text-red-400', 'text-cyan-400', 'text-purple-400', 'text-yellow-400', 'text-blue-400'];

export default function ServicesSection() {
  const t = useTranslations('services');
  const locale = useLocale();

  return (
    <section className="section">
      <div className="container">
        <SectionHeader
          badge={t('badge')}
          title={t('title')}
          titleHighlight={t('titleHighlight')}
          subtitle={t('subtitle')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {KEYS.map((key, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={`card p-6 bg-gradient-to-br ${COLORS[i]} group cursor-pointer`}
              >
                <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${ICON_COLORS[i]}`} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="text-dark-400 text-sm leading-relaxed mb-4">
                  {t(`items.${key}.desc`)}
                </p>
                <Link
                  href={`/${locale}/services`}
                  className={`inline-flex items-center gap-1.5 text-sm font-medium ${ICON_COLORS[i]} group-hover:gap-2.5 transition-all`}
                >
                  {t('learnMore')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
