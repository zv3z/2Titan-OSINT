'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Shield, Twitter, Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');
  const navT = useTranslations('nav');
  const locale = useLocale();
  const getPath = (path: string) => `/${locale}${path}`;

  return (
    <footer className="border-t border-white/5 bg-dark-950/80 backdrop-blur-sm">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href={getPath('')} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center">
                <Shield className="w-4 h-4 text-brand-400" />
              </div>
              <span className="text-lg font-bold text-white">
                TITAN <span className="text-brand-400">OSINT</span>
              </span>
            </Link>
            <p className="text-dark-400 text-sm leading-relaxed mb-6">{t('tagline')}</p>
            <div className="flex gap-3">
              {[
                { Icon: Twitter, href: '#', label: 'Twitter' },
                { Icon: Github, href: '#', label: 'GitHub' },
                { Icon: Linkedin, href: '#', label: 'LinkedIn' },
                { Icon: Mail, href: '#', label: 'Email' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-dark-400 hover:text-brand-400 hover:border-brand-500/40 hover:bg-brand-500/10 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">{t('platform')}</h3>
            <ul className="space-y-3">
              {[
                { label: t('links.tools'), href: '/tools' },
                { label: t('links.services'), href: '/services' },
                { label: t('links.pricing'), href: '#' },
                { label: t('links.docs'), href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href.startsWith('/') ? getPath(link.href) : link.href}
                    className="text-dark-400 hover:text-brand-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">{t('company')}</h3>
            <ul className="space-y-3">
              {[
                { label: t('links.about'), href: '/about' },
                { label: t('links.blog'), href: '#' },
                { label: t('links.careers'), href: '#' },
                { label: t('links.contact'), href: '/contact' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href.startsWith('/') ? getPath(link.href) : link.href}
                    className="text-dark-400 hover:text-brand-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">{t('legal')}</h3>
            <ul className="space-y-3">
              {[
                { label: t('links.privacy'), href: '#' },
                { label: t('links.terms'), href: '#' },
                { label: t('links.security'), href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-dark-400 hover:text-brand-400 text-sm transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-dark-500 text-sm">{t('copyright')}</p>
          <div className="flex items-center gap-1.5 text-dark-500 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
