'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Shield, Target, Eye, Star, Users } from 'lucide-react';
import CtaSection from '@/components/home/CtaSection';

const TEAM = [
  { name: 'Alex Reeves', role: 'CEO & Lead Researcher', tag: 'OSINT Expert', initials: 'AR' },
  { name: 'Sara Chen', role: 'CTO & Security Architect', tag: 'Red Team Lead', initials: 'SC' },
  { name: 'Omar Hassan', role: 'Head of Intelligence', tag: 'Threat Analyst', initials: 'OH' },
  { name: 'Maya Patel', role: 'Head of Forensics', tag: 'Digital Forensics', initials: 'MP' },
];

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 grid-bg opacity-30" />

        <div className="container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge-green mb-6">
              <Shield className="w-3 h-3" />
              {t('badge')}
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              {t('title')} <span className="gradient-text">{t('titleHighlight')}</span>
            </h1>
            <p className="text-dark-300 text-xl max-w-2xl mx-auto leading-relaxed">{t('subtitle')}</p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-dark-950 to-transparent" />
      </section>

      {/* Mission & Vision */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {[
              { icon: Target, key: 'mission', color: 'text-brand-400', bg: 'bg-brand-500/15 border-brand-500/30' },
              { icon: Eye, key: 'vision', color: 'text-cyber-400', bg: 'bg-cyber-500/15 border-cyber-500/30' },
            ].map(({ icon: Icon, key, color, bg }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-8"
              >
                <div className={`w-14 h-14 rounded-xl ${bg} border flex items-center justify-center mb-5`}>
                  <Icon className={`w-7 h-7 ${color}`} />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">{t(`${key}.title` as any)}</h3>
                <p className="text-dark-400 leading-relaxed">{t(`${key}.desc` as any)}</p>
              </motion.div>
            ))}
          </div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card p-8 mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-5 h-5 text-yellow-400" />
              <h3 className="text-white font-bold text-xl">{t('values.title')}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(t.raw('values.items') as string[]).map((value: string, i: number) => (
                <div key={i} className="flex items-center gap-2.5 p-4 rounded-xl bg-dark-800/50 border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                  <span className="text-white text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Team */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-5 h-5 text-brand-400" />
              <h2 className="text-3xl font-bold text-white">{t('team.title')}</h2>
            </div>
            <p className="text-dark-400">{t('team.subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card p-6 text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-4 text-brand-400 font-bold text-lg group-hover:scale-110 transition-transform">
                  {member.initials}
                </div>
                <h4 className="text-white font-semibold text-sm mb-0.5">{member.name}</h4>
                <p className="text-dark-500 text-xs mb-2">{member.role}</p>
                <span className="badge-green text-xs">{member.tag}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
