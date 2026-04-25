'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';

export default function CtaSection() {
  const locale = useLocale();

  return (
    <section className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-500/10 via-dark-950/50 to-cyber-500/10 p-12 md:p-16 text-center"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-cyber-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-brand-400" />
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Ready to Secure Your{' '}
              <span className="gradient-text">Digital Assets?</span>
            </h2>
            <p className="text-dark-300 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of security teams that trust OSNIT to protect their operations. Start free, scale when you need.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link href={`/${locale}/contact`} className="btn-primary group text-base py-3.5 px-8">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href={`/${locale}/tools`} className="btn-secondary text-base py-3.5 px-8">
                Explore Tools
              </Link>
            </div>

            <p className="text-dark-500 text-sm mt-6">No credit card required · Free tier available · Cancel anytime</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
