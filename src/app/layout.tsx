import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Titan OSINT — Next-Gen Cyber Intelligence Platform',
  description: 'Enterprise-grade OSINT tools, threat intelligence, and cybersecurity services powered by 10+ intelligence sources.',
  keywords: 'OSINT, cybersecurity, threat intelligence, Titan OSINT, IP lookup, breach detection, domain analysis',
  openGraph: {
    title: 'Titan OSINT — Next-Gen Cyber Intelligence Platform',
    description: 'Enterprise-grade OSINT tools and threat intelligence.',
    type: 'website',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const locale = headersList.get('x-locale') ?? 'en';
  const isRtl = locale === 'ar';

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={isRtl ? 'font-arabic' : 'font-sans'} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
