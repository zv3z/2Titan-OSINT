'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  badge?: string;
  title: string;
  titleHighlight?: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
}

export default function SectionHeader({
  badge,
  title,
  titleHighlight,
  subtitle,
  center = true,
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn(center ? 'text-center' : '', 'mb-16', className)}
    >
      {badge && (
        <span className="badge-green mb-4 inline-flex">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
        {title}{' '}
        {titleHighlight && (
          <span className="gradient-text">{titleHighlight}</span>
        )}
      </h2>
      {subtitle && (
        <p className="text-dark-300 text-lg max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
