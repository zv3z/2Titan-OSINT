'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function StatsSection() {
  const t = useTranslations('hero.stats');

  const stats = [
    { value: t('tools'), label: t('toolsDesc') },
    { value: t('clients'), label: t('clientsDesc') },
    { value: t('uptime'), label: t('uptimeDesc') },
    { value: t('threats'), label: t('threatsDesc') },
  ];

  return (
    <section className="relative z-10 -mt-10 pb-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-dark-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
