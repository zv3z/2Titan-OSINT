import createMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';
import { locales, defaultLocale } from './src/i18n';

const handleI18nRouting = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export default function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);

  // Detect locale from pathname and expose it as a plain header
  // so the root layout can read it without going through next-intl internals.
  const pathname = request.nextUrl.pathname;
  const detected = locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)) ?? defaultLocale;
  response.headers.set('x-locale', detected);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
