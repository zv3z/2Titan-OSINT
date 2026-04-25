'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Search, Target, Brain, Database, BookOpen, ClipboardCheck, Check } from 'lucide-react';

const ICONS = [Search, Target, Brain, Database, BookOpen, ClipboardCheck];
const KEYS = ['osint', 'pentest', 'threat', 'forensics', 'training', 'audit'] as const;

const FEATURES: Record<string, string[]> = {
  osint: ['Social media analysis', 'Dark web monitoring', 'People search', 'Asset discovery'],
  pentest: ['Web app testing', 'Network testing', 'Social engineering', 'Red team exercises'],
  threat: ['IOC analysis', 'Threat hunting', 'Malware analysis', 'Intelligence reports'],
  forensics: ['Memory forensics', 'Disk analysis', 'Network forensics', 'Chain of custody'],
  training: ['CTF challenges', 'Live workshops', 'Certification prep', 'Team exercises'],
  audit: ['ISO 27001', 'NIST CSF', 'SOC 2', 'GDPR compliance'],
};

export default function ServicesGrid() {
  const t = useTranslations('services');

  return (
    <section className="section">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {KEYS.map((key, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card p-8 group"
              >
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl mb-2">{t(`items.${key}.title`)}</h3>
                    <p className="text-dark-400 text-sm leading-relaxed">{t(`items.${key}.desc`)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {FEATURES[key].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-dark-300">
                      <Check className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
