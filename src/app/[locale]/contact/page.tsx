'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Mail, Clock, Shield, Headphones, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const t = useTranslations('contact');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [form, setForm] = useState({ name: '', email: '', company: '', service: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    await new Promise((r) => setTimeout(r, 1500));
    setStatus('done');
  };

  const INFO_ITEMS = [
    { icon: Mail, label: t('info.email'), sub: 'PGP available' },
    { icon: Clock, label: t('info.response'), sub: 'Mon–Fri' },
    { icon: Headphones, label: t('info.available'), sub: 'Critical incidents' },
    { icon: Shield, label: t('info.secure'), sub: 'TLS 1.3' },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 grid-bg opacity-30" />

        <div className="container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge-green mb-4">
              <Mail className="w-3 h-3" />
              {t('badge')}
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              {t('title')} <span className="gradient-text">{t('titleHighlight')}</span>
            </h1>
            <p className="text-dark-300 text-xl max-w-xl mx-auto">{t('subtitle')}</p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-dark-950 to-transparent" />
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Info sidebar */}
            <div className="lg:col-span-2 space-y-5">
              {INFO_ITEMS.map(({ icon: Icon, label, sub }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="card p-5 flex items-center gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{label}</div>
                    <div className="text-dark-500 text-xs">{sub}</div>
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="rounded-xl bg-gradient-to-br from-brand-500/15 to-cyber-500/5 border border-brand-500/20 p-5"
              >
                <p className="text-dark-300 text-sm leading-relaxed">
                  Need urgent assistance? For active incidents, mark your message as{' '}
                  <span className="text-brand-400 font-semibold">[URGENT]</span> and we'll prioritize your request.
                </p>
              </motion.div>
            </div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3"
            >
              <div className="card p-8">
                {status === 'done' ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-brand-400 mx-auto mb-4" />
                    <h3 className="text-white font-bold text-xl mb-2">Message Sent!</h3>
                    <p className="text-dark-400">{t('form.success')}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-dark-300 text-sm font-medium mb-1.5">{t('form.name')}</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full bg-dark-800/60 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-dark-500 text-sm focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-colors"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-dark-300 text-sm font-medium mb-1.5">{t('form.email')}</label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full bg-dark-800/60 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-dark-500 text-sm focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-colors"
                          placeholder="john@company.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-dark-300 text-sm font-medium mb-1.5">{t('form.company')}</label>
                        <input
                          type="text"
                          value={form.company}
                          onChange={(e) => setForm({ ...form, company: e.target.value })}
                          className="w-full bg-dark-800/60 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-dark-500 text-sm focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-colors"
                          placeholder="Acme Corp"
                        />
                      </div>
                      <div>
                        <label className="block text-dark-300 text-sm font-medium mb-1.5">{t('form.service')}</label>
                        <select
                          value={form.service}
                          onChange={(e) => setForm({ ...form, service: e.target.value })}
                          className="w-full bg-dark-800/60 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-colors"
                        >
                          <option value="" className="bg-dark-900">Select...</option>
                          {(['osint','pentest','threat','forensics','training','audit','other'] as const).map((s) => (
                            <option key={s} value={s} className="bg-dark-900">{t(`form.services.${s}`)}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-dark-300 text-sm font-medium mb-1.5">{t('form.message')}</label>
                      <textarea
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full bg-dark-800/60 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-dark-500 text-sm focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-colors resize-none"
                        placeholder="Describe your security needs..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="btn-primary w-full justify-center"
                    >
                      {status === 'sending' ? t('form.sending') : t('form.send')}
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
