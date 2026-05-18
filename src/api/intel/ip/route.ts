import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { intelCache } from '@/lib/intel/cache';
import { rateLimiter } from '@/lib/intel/ratelimit';
import { checkIp, abuseConfigured } from '@/lib/intel/abuseipdb';
import { checkIpNoise, gnConfigured } from '@/lib/intel/greynoise';
import { vtAnalyzeIp, vtConfigured } from '@/lib/intel/virustotal';
import { getIpIntel, otxConfigured } from '@/lib/intel/otx';
import { analyzeIp as cipAnalyze, criminalIpConfigured } from '@/lib/intel/criminalip';
import { searchIp as zmSearchIp, zoomEyeConfigured } from '@/lib/intel/zoomeye';
import { scoreIp } from '@/lib/intel/scoring';
import type { IpIntelligence, IntelApiResponse, IntelSource, OpenPort } from '@/lib/intel/types';

const ipSchema = z.string().regex(
  /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
  'Invalid IPv4 address'
);

const PRIVATE = [/^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./, /^127\./, /^0\./];

export async function GET(req: NextRequest): Promise<NextResponse> {
  const start = Date.now();

  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const rl = rateLimiter.check(clientIp);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  const ip = req.nextUrl.searchParams.get('ip')?.trim() ?? '';
  const parsed = ipSchema.safeParse(ip);
  if (!parsed.success) {
    return NextResponse.json<IntelApiResponse>({ success: false, error: parsed.error.issues[0].message, cached: false, queryTimeMs: 0 }, { status: 400 });
  }
  if (PRIVATE.some((r) => r.test(ip))) {
    return NextResponse.json<IntelApiResponse>({ success: false, error: 'Private/reserved IP addresses cannot be queried', cached: false, queryTimeMs: 0 }, { status: 400 });
  }

  const cacheKey = `ip:${ip}`;
  const cached = intelCache.get<IpIntelligence>(cacheKey);
  if (cached) {
    return NextResponse.json<IntelApiResponse<IpIntelligence>>({ success: true, data: cached, cached: true, queryTimeMs: Date.now() - start });
  }

  // Run all 6 sources in parallel
  const [abuseRes, gnRes, vtRes, otxRes, cipRes, zmRes] = await Promise.allSettled([
    checkIp(ip),
    checkIpNoise(ip),
    vtAnalyzeIp(ip),
    getIpIntel(ip),
    cipAnalyze(ip),
    zmSearchIp(ip),
  ]);

  const abuse = abuseRes.status === 'fulfilled' ? abuseRes.value : null;
  const gn    = gnRes.status    === 'fulfilled' ? gnRes.value    : null;
  const vt    = vtRes.status    === 'fulfilled' ? vtRes.value    : null;
  const otx   = otxRes.status   === 'fulfilled' ? otxRes.value   : null;
  const cip   = cipRes.status   === 'fulfilled' ? cipRes.value   : null;
  const zm    = zmRes.status    === 'fulfilled' ? zmRes.value    : null;

  const sources: IntelSource[] = [
    { name: 'AbuseIPDB',    status: !abuseConfigured      ? 'no_key' : abuse  ? 'ok' : 'error', data: abuse ? { score: abuse.abuseConfidenceScore, reports: abuse.totalReports } : undefined },
    { name: 'GreyNoise',    status: !gnConfigured         ? 'no_key' : gn     ? 'ok' : 'error', data: gn    ? { class: gn.classification, riot: gn.riot } : undefined },
    { name: 'VirusTotal',   status: !vtConfigured         ? 'no_key' : vt     ? 'ok' : 'error', data: vt    ? { mal: vt.maliciousDetections, total: vt.totalEngines } : undefined },
    { name: 'AlienVault OTX', status: !otxConfigured     ? 'no_key' : otx    ? 'ok' : 'error', data: otx   ? { pulses: otx.pulseCount } : undefined },
    { name: 'CriminalIP',   status: !criminalIpConfigured ? 'no_key' : cip    ? 'ok' : 'error', data: cip   ? { score: cip.score } : undefined },
    { name: 'ZoomEye',      status: !zoomEyeConfigured    ? 'no_key' : zm     ? 'ok' : 'not_found' },
  ];

  const risk = scoreIp({
    abuseScore: abuse?.abuseConfidenceScore,
    vtMalicious: vt?.maliciousDetections,
    vtTotal: vt?.totalEngines,
    gnClassification: gn?.classification,
    gnRiot: gn?.riot,
    gnNoise: gn?.noise,
    otxPulseCount: otx?.pulseCount,
    cipScore: cip?.score,
    isTor: abuse?.isTor || cip?.isTor || gn?.tags.includes('tor'),
    isProxy: cip?.isProxy,
    zoomEyePortCount: zm?.openPorts.length,
  });

  // Merge open ports from CriminalIP + ZoomEye, deduplicate by port number
  const zmPorts: OpenPort[] = (zm?.openPorts ?? []).map((p) => ({
    port: p.port,
    protocol: 'tcp',
    service: p.service,
    banner: p.banner,
  }));
  const allPortsMap = new Map<number, OpenPort>();
  [...(cip?.openPorts ?? []), ...zmPorts].forEach((p) => {
    if (!allPortsMap.has(p.port)) allPortsMap.set(p.port, p);
  });
  const openPorts: OpenPort[] = [...allPortsMap.values()].slice(0, 20);

  const result: IpIntelligence = {
    type: 'ip',
    query: ip,
    risk,
    geo: {
      country: vt?.country ?? abuse?.countryCode ?? cip?.country ?? zm?.country,
      countryCode: abuse?.countryCode ?? cip?.countryCode,
      city: cip?.city ?? zm?.city,
      asn: vt?.asn ? `AS${vt.asn}` : undefined,
      org: vt?.asOwner ?? cip?.isp ?? zm?.isp,
      isp: abuse?.isp ?? cip?.isp ?? zm?.isp,
    },
    reputation: {
      abuseScore: abuse?.abuseConfidenceScore ?? 0,
      totalReports: abuse?.totalReports ?? 0,
      lastReportedAt: abuse?.lastReportedAt,
      categories: abuse?.categories ?? [],
      isWhitelisted: abuse?.isWhitelisted ?? false,
    },
    network: {
      isVpn:    cip?.isVpn    ?? abuse?.usageType === 'VPN',
      isTor:    cip?.isTor    ?? abuse?.isTor ?? false,
      isProxy:  cip?.isProxy  ?? false,
      isBot:    gn?.noise     ?? false,
      isScanner: gn?.noise    ?? cip?.isScanner ?? false,
      isCloud:  cip?.isHostingService ?? false,
      classification: gn?.classification ?? 'unknown',
      tags: [...new Set([...(cip?.tags ?? []), ...(gn?.tags ?? []), ...(vt?.tags ?? []), ...(otx?.tags ?? [])])],
    },
    threatIntel: {
      malwareDetections: vt?.maliciousDetections ?? 0,
      phishingDetections: vt?.suspiciousDetections ?? 0,
      cleanDetections: vt?.cleanDetections ?? 0,
      totalEngines: vt?.totalEngines ?? 0,
      pulseCount: otx?.pulseCount ?? 0,
      relatedMalware: otx?.malwareFamilies ?? [],
      relatedCampaigns: otx?.adversaries ?? [],
    },
    openPorts,
    sources,
    timestamp: new Date().toISOString(),
    queryTimeMs: Date.now() - start,
  };

  intelCache.set(cacheKey, result, 60);
  return NextResponse.json<IntelApiResponse<IpIntelligence>>({ success: true, data: result, cached: false, queryTimeMs: Date.now() - start });
}
