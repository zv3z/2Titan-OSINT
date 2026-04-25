import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { intelCache } from '@/lib/intel/cache';
import { rateLimiter } from '@/lib/intel/ratelimit';
import { checkEmail, leakConfigured } from '@/lib/intel/leakcheck';
import { checkEmail as bdCheckEmail, bdConfigured } from '@/lib/intel/breachdirectory';
import { search as ixSearch, intelxConfigured } from '@/lib/intel/intelx';
import { scoreEmail } from '@/lib/intel/scoring';
import type { EmailIntelligence, IntelApiResponse, IntelSource, BreachRecord } from '@/lib/intel/types';

const emailSchema = z.string().email('Invalid email address');

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', '10minutemail.com', 'sharklasers.com', 'guerrillamailblock.com',
  'trashmail.com', 'maildrop.cc', 'dispostable.com', 'fakeinbox.com',
]);

function isDisposable(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? DISPOSABLE_DOMAINS.has(domain) : false;
}

function isRecentBreach(dateStr?: string): boolean {
  if (!dateStr) return false;
  const breachDate = new Date(dateStr);
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  return breachDate > twoYearsAgo;
}

function severityFromTypes(dataTypes: string[]): BreachRecord['severity'] {
  const high = ['passwords', 'password', 'hashes', 'credit cards', 'ssn', 'financial'];
  const medium = ['emails', 'usernames', 'phone numbers', 'addresses'];
  const dt = dataTypes.map((d) => d.toLowerCase());
  if (dt.some((d) => high.some((h) => d.includes(h)))) return 'critical';
  if (dt.some((d) => medium.some((m) => d.includes(m)))) return 'medium';
  return 'low';
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const start = Date.now();

  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const rl = rateLimiter.check(clientIp);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  const email = req.nextUrl.searchParams.get('email')?.trim().toLowerCase() ?? '';
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return NextResponse.json<IntelApiResponse>({
      success: false, error: 'Invalid email address', cached: false, queryTimeMs: 0,
    }, { status: 400 });
  }

  const cacheKey = `email:${email}`;
  const cached = intelCache.get<EmailIntelligence>(cacheKey);
  if (cached) {
    return NextResponse.json<IntelApiResponse<EmailIntelligence>>({
      success: true, data: cached, cached: true, queryTimeMs: Date.now() - start,
    });
  }

  const [leakRes, bdRes, ixRes] = await Promise.allSettled([
    checkEmail(email),
    bdCheckEmail(email),
    ixSearch(email),
  ]);

  const leak = leakRes.status === 'fulfilled' ? leakRes.value : null;
  const bd   = bdRes.status   === 'fulfilled' ? bdRes.value   : null;
  const ix   = ixRes.status   === 'fulfilled' ? ixRes.value   : null;
  const disposable = isDisposable(email);
  const domain = email.split('@')[1];

  const sources: IntelSource[] = [
    { name: 'LeakCheck',        status: !leakConfigured   ? 'no_key' : leak ? 'ok' : 'error', data: leak ? { breaches: leak.count } : undefined },
    { name: 'BreachDirectory',  status: !bdConfigured     ? 'no_key' : bd   ? 'ok' : 'error', data: bd   ? { breaches: bd.count }   : undefined },
    { name: 'IntelX',           status: !intelxConfigured ? 'no_key' : ix   ? 'ok' : 'error', data: ix   ? { appearances: ix.count } : undefined },
  ];

  const leakRecords: BreachRecord[] = (leak?.breaches ?? []).map((b) => ({
    source: b.source,
    date: b.date,
    dataTypes: b.dataTypes,
    severity: severityFromTypes(b.dataTypes),
    isVerified: b.isVerified,
    description: b.description,
  }));

  const bdRecords: BreachRecord[] = (bd?.breaches ?? []).map((b) => ({
    source: b.source,
    dataTypes: b.sha1 || b.hash ? ['password hashes'] : ['email'],
    severity: b.sha1 || b.hash ? 'high' as const : 'low' as const,
    isVerified: true,
  }));

  const records: BreachRecord[] = [...leakRecords, ...bdRecords];

  const dates = records.map((r) => r.date).filter(Boolean) as string[];
  const sortedDates = dates.sort();

  const totalBreachCount = (leak?.count ?? 0) + (bd?.count ?? 0);

  const risk = scoreEmail({
    leakCheckCount: leak?.count,
    bdCount: bd?.count,
    intelxCount: ix?.count,
    hasRecentBreach: records.some((r) => isRecentBreach(r.date)),
    isDisposable: disposable,
  });

  const exposedDataTypes = [...new Set(records.flatMap((r) => r.dataTypes))];

  const result: EmailIntelligence = {
    type: 'email',
    query: email,
    risk,
    validity: {
      formatValid: true,
      isDisposable: disposable,
      domain,
    },
    breaches: {
      found: totalBreachCount > 0 || (ix?.count ?? 0) > 0,
      count: totalBreachCount,
      records,
      oldestBreach: sortedDates[0],
      mostRecentBreach: sortedDates[sortedDates.length - 1],
      exposedDataTypes,
    },
    sources,
    timestamp: new Date().toISOString(),
    queryTimeMs: Date.now() - start,
  };

  intelCache.set(cacheKey, result, 30);

  return NextResponse.json<IntelApiResponse<EmailIntelligence>>({
    success: true, data: result, cached: false, queryTimeMs: Date.now() - start,
  });
}
