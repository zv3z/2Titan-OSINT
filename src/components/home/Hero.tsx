'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Zap } from 'lucide-react';

const TERMINAL_LINES = [
  { text: '> Initializing OSNIT engine...', delay: 0 },
  { text: '> Loading threat intelligence feeds...', delay: 0.4 },
  { text: '> OSINT modules: ACTIVE', delay: 0.8 },
  { text: '> Scanning for vulnerabilities...', delay: 1.2 },
  { text: '> Status: SECURE ✓', delay: 1.6, highlight: true },
];

export default function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const getPath = (p: string) => `/${locale}${p}`;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute inset-0 bg-glow-gradient" />

      {/* Animated circles */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-brand-500/5 blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 -left-32 w-80 h-80 rounded-full bg-cyber-500/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

      {/* Scan line */}
      <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent top-1/3" />

      <div className="container relative z-10 py-32 md:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="badge-green mb-6">
                <Zap className="w-3 h-3" />
                {t('badge')}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
            >
              {t('title')}{' '}
              <br />
              <span className="gradient-text glow-text">{t('titleHighlight')}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-dark-300 text-lg leading-relaxed mb-8 max-w-lg"
            >
              {t('subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link href={getPath('/tools')} className="btn-primary group">
                {t('cta')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href={getPath('/services')} className="btn-secondary">
                {t('ctaSecondary')}
              </Link>
            </motion.div>
          </div>

          {/* Right: Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-brand-500/10 rounded-2xl blur-xl" />

              {/* Terminal window */}
              <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-dark-950/90">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-brand-500/70" />
                  <span className="ml-3 text-dark-400 text-xs font-mono">osnit-engine — bash</span>
                </div>

                {/* Terminal body */}
                <div className="p-6 font-mono text-sm space-y-2 min-h-[240px]">
                  {TERMINAL_LINES.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: line.delay + 0.5, duration: 0.3 }}
                      className={line.highlight ? 'text-brand-400 font-semibold' : 'text-dark-300'}
                    >
                      {line.text}
                    </motion.div>
                  ))}
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="inline-block w-2 h-4 bg-brand-500"
                  />
                </div>
              </div>

              {/* Floating stats cards */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="absolute -bottom-6 -right-6 glass rounded-xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg leading-none">50+</div>
                    <div className="text-dark-400 text-xs">Active Tools</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 }}
                className="absolute -top-6 -left-6 glass rounded-xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                  <div>
                    <div className="text-white font-bold text-sm leading-none">LIVE</div>
                    <div className="text-dark-400 text-xs">Threat Intel</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-dark-950 to-transparent" />
    </section>
  );
}
