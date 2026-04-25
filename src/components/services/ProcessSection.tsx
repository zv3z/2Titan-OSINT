'use client';

import { motion } from 'framer-motion';

const STEPS = [
  { num: '01', title: 'Discovery', desc: 'We analyze your infrastructure, goals, and threat landscape to design the perfect engagement.' },
  { num: '02', title: 'Engagement', desc: 'Our experts execute targeted assessments using cutting-edge tools and methodologies.' },
  { num: '03', title: 'Reporting', desc: 'Receive detailed findings with risk scoring, evidence, and remediation recommendations.' },
  { num: '04', title: 'Remediation', desc: 'We guide your team through fixing vulnerabilities and validating the fixes end-to-end.' },
];

export default function ProcessSection() {
  return (
    <section className="section bg-dark-950/40">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="badge-green mb-4">How It Works</span>
          <h2 className="text-4xl font-bold text-white mb-4">
            Our <span className="gradient-text">Process</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-8 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center relative"
              >
                <div className="w-16 h-16 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center mx-auto mb-4 relative z-10">
                  <span className="text-brand-400 font-mono font-bold text-lg">{step.num}</span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
