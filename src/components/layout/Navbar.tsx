'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, X, Globe, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const isRtl = locale === 'ar';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
    setLangOpen(false);
  };

  const getLocalePath = (path: string) => `/${locale}${path}`;

  const navItems = [
    { label: t('home'), href: '' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: t('tools'), href: '/tools' },
    { label: t('services'), href: '/services' },
    { label: t('about'), href: '/about' },
    { label: t('contact'), href: '/contact' },
  ];

  const isActive = (href: string) => {
    const full = `/${locale}${href}`;
    if (href === '') return pathname === `/${locale}`;
    return pathname.startsWith(full);
  };

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled ? 'bg-dark-950/90 backdrop-blur-xl border-b border-white/5 shadow-xl' : 'bg-transparent'
      )}
    >
      <nav className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href={getLocalePath('')} className="flex items-center gap-2 group">
          <div className="relative w-9 h-9 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center group-hover:bg-brand-500/30 transition-colors">
            <Shield className="w-5 h-5 text-brand-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            TITAN <span className="text-brand-400">OSINT</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className={cn('hidden md:flex items-center gap-8', isRtl && 'flex-row-reverse')}>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={getLocalePath(item.href)}
                className={cn(
                  'nav-link',
                  isActive(item.href) && 'text-brand-400 after:w-full'
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className={cn('hidden md:flex items-center gap-3', isRtl && 'flex-row-reverse')}>
          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 text-dark-300 hover:text-white transition-colors text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <Globe className="w-4 h-4" />
              <span>{locale === 'ar' ? 'العربية' : 'English'}</span>
              <ChevronDown className={cn('w-3 h-3 transition-transform', langOpen && 'rotate-180')} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'absolute top-full mt-2 w-36 glass rounded-xl overflow-hidden shadow-xl',
                    isRtl ? 'left-0' : 'right-0'
                  )}
                >
                  {[
                    { code: 'en', label: 'English', flag: '🇺🇸' },
                    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => switchLocale(lang.code)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-brand-500/10 transition-colors',
                        locale === lang.code ? 'text-brand-400 bg-brand-500/5' : 'text-dark-300 hover:text-white'
                      )}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href={getLocalePath('/contact')} className="btn-primary text-sm py-2 px-4">
            {t('getStarted')}
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-dark-300 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-dark-950/95 backdrop-blur-xl border-t border-white/5 overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={getLocalePath(item.href)}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-brand-500/10 text-brand-400'
                      : 'text-dark-300 hover:text-white hover:bg-white/5'
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex gap-2">
                  {[{ code: 'en', label: 'EN' }, { code: 'ar', label: 'عر' }].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { switchLocale(lang.code); setMobileOpen(false); }}
                      className={cn(
                        'px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors',
                        locale === lang.code
                          ? 'bg-brand-500/20 border-brand-500/40 text-brand-400'
                          : 'border-white/10 text-dark-400 hover:border-white/20 hover:text-white'
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
                <Link
                  href={getLocalePath('/contact')}
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary text-xs py-2 px-4"
                >
                  {t('getStarted')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
