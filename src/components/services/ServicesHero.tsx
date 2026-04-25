'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function ServicesHero() {
  const t = useTranslations('services');

  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="container relative z-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="badge-green mb-6">
            <Shield className="w-3 h-3" />
            {t('badge')}
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            {t('title')}{' '}
            <span className="gradient-text">{t('titleHighlight')}</span>
          </h1>
          <p className="text-dark-300 text-xl max-w-2xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-dark-950 to-transparent" />
    </section>
  );
}
