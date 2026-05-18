import type { Metadata } from 'next';
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
