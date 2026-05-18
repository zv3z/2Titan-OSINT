import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { intelCache } from '@/lib/intel/cache';
import { rateLimiter } from '@/lib/intel/ratelimit';
import { vtAnalyzeDomain, vtConfigured } from '@/lib/intel/virustotal';
import { lookupWhois, lookupDns, whoisConfigured } from '@/lib/intel/whoisxml';
import { getDomainIntel, otxConfigured } from '@/lib/intel/otx';
import { searchDomain } from '@/lib/intel/urlscan';
import { search as ixSearch, intelxConfigured } from '@/lib/intel/intelx';
import { scoreDomain } from '@/lib/intel/scoring';
import type { DomainIntelligence, IntelApiResponse, IntelSource } from '@/lib/intel/types';

const domainSchema = z.string()
  .min(3)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+$/, 'Invalid domain name');

function stripScheme(input: string): string {
  return input.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase().trim();
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const start = Date.now();

  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const rl = rateLimiter.check(clientIp);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  const raw = req.nextUrl.searchParams.get('domain')?.trim() ?? '';
  const domain = stripScheme(raw);
  const parsed = domainSchema.safeParse(domain);
  if (!parsed.success) {
    return NextResponse.json<IntelApiResponse>({
      success: false, error: 'Invalid domain name', cached: false, queryTimeMs: 0,
    }, { status: 400 });
  }

  const cacheKey = `domain:${domain}`;
  const cached = intelCache.get<DomainIntelligence>(cacheKey);
  if (cached) {
    return NextResponse.json<IntelApiResponse<DomainIntelligence>>({
      success: true, data: cached, cached: true, queryTimeMs: Date.now() - start,
    });
  }

  const [vtRes, whoisRes, dnsRes, otxRes, urlscanRes, ixRes] = await Promise.allSettled([
    vtAnalyzeDomain(domain),
    lookupWhois(domain),
    lookupDns(domain),
    getDomainIntel(domain),
    searchDomain(domain),
    ixSearch(domain),
  ]);

  const vt       = vtRes.status       === 'fulfilled' ? vtRes.value       : null;
  const whois    = whoisRes.status    === 'fulfilled' ? whoisRes.value    : null;
  const dns      = dnsRes.status      === 'fulfilled' ? dnsRes.value      : null;
  const otx      = otxRes.status      === 'fulfilled' ? otxRes.value      : null;
  const urlscan  = urlscanRes.status  === 'fulfilled' ? urlscanRes.value  : null;
  const ix       = ixRes.status       === 'fulfilled' ? ixRes.value       : null;

  const sources: IntelSource[] = [
    { name: 'VirusTotal',    status: !vtConfigured      ? 'no_key' : vt      ? 'ok' : 'error',     data: vt      ? { malicious: vt.maliciousDetections, total: vt.totalEngines } : undefined },
    { name: 'WHOISXML',      status: !whoisConfigured   ? 'no_key' : whois   ? 'ok' : 'error' },
    { name: 'AlienVault OTX', status: !otxConfigured    ? 'no_key' : otx     ? 'ok' : 'error',     data: otx     ? { pulses: otx.pulseCount } : undefined },
    { name: 'URLScan',       status: urlscan ? 'ok' : 'not_found',                                  data: urlscan ? { verdict: urlscan.verdict } : undefined },
    { name: 'IntelX',        status: !intelxConfigured  ? 'no_key' : ix      ? 'ok' : 'error',     data: ix      ? { appearances: ix.count } : undefined },
  ];

  const risk = scoreDomain({
    vtMalicious: vt?.maliciousDetections,
    vtTotal: vt?.totalEngines,
    otxPulseCount: otx?.pulseCount,
    domainAgeInDays: whois?.domainAgeInDays,
    urlscanMalicious: urlscan?.isMalicious,
    urlscanScore: urlscan?.score,
    intelxCount: ix?.count,
  });

  const vtCats = Object.values(vt?.categories ?? {}) as string[];

  const result: DomainIntelligence = {
    type: 'domain',
    query: domain,
    risk,
    whois: {
      registrar: whois?.registrar,
      registrarUrl: whois?.registrarUrl,
      createdDate: whois?.createdDate,
      updatedDate: whois?.updatedDate,
      expiresDate: whois?.expiresDate,
      nameservers: whois?.nameservers,
      registrantCountry: whois?.registrantCountry,
      registrantOrg: whois?.registrantOrg,
      domainAgeInDays: whois?.domainAgeInDays,
      status: whois?.status,
    },
    dns: {
      a: dns?.a,
      aaaa: dns?.aaaa,
      mx: dns?.mx,
      ns: dns?.ns,
      txt: dns?.txt,
      cname: dns?.cname,
    },
    threats: {
      maliciousDetections: vt?.maliciousDetections ?? 0,
      phishingDetections: 0,
      cleanDetections: vt?.cleanDetections ?? 0,
      totalEngines: vt?.totalEngines ?? 0,
      isMalicious: (vt?.maliciousDetections ?? 0) > 0 || (urlscan?.isMalicious ?? false),
      isPhishing: vtCats.some((c) => c.toLowerCase().includes('phish')),
      isMalware: vtCats.some((c) => c.toLowerCase().includes('malware')),
      categories: [...new Set([...vtCats, ...(urlscan?.tags ?? []), ...(otx?.tags ?? [])])].slice(0, 10),
      pulseCount: otx?.pulseCount ?? 0,
      screenshot: urlscan?.screenshot,
      urlscanVerdict: urlscan?.verdict,
    },
    sources,
    timestamp: new Date().toISOString(),
    queryTimeMs: Date.now() - start,
  };

  intelCache.set(cacheKey, result, 60);

  return NextResponse.json<IntelApiResponse<DomainIntelligence>>({
    success: true, data: result, cached: false, queryTimeMs: Date.now() - start,
  });
}
