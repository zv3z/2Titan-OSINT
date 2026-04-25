// VirusTotal v3 API — covers IP, domain, URL, hash
// Docs: https://developers.virustotal.com/reference/overview

const BASE = 'https://www.virustotal.com/api/v3';
const KEY = process.env.VIRUSTOTAL_API_KEY;

function headers() {
  return { 'x-apikey': KEY ?? '', 'Accept': 'application/json' };
}

async function vtFetch(path: string, timeoutMs = 10000): Promise<unknown> {
  if (!KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, { headers: headers(), signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return res.json();
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export interface VtIpResult {
  abuseScore: number;
  maliciousDetections: number;
  cleanDetections: number;
  suspiciousDetections: number;
  totalEngines: number;
  country?: string;
  asn?: number;
  asOwner?: string;
  network?: string;
  tags: string[];
  lastAnalysisDate?: string;
}

export async function vtAnalyzeIp(ip: string): Promise<VtIpResult | null> {
  const raw = await vtFetch(`/ip_addresses/${ip}`) as any;
  if (!raw?.data?.attributes) return null;
  const a = raw.data.attributes;
  const stats = a.last_analysis_stats ?? {};

  return {
    abuseScore: a.reputation < 0 ? Math.min(100, Math.abs(a.reputation) * 5) : 0,
    maliciousDetections: stats.malicious ?? 0,
    cleanDetections: stats.harmless ?? 0,
    suspiciousDetections: stats.suspicious ?? 0,
    totalEngines: Object.values(stats).reduce((s: number, v) => s + (v as number), 0) as number,
    country: a.country,
    asn: a.asn,
    asOwner: a.as_owner,
    network: a.network,
    tags: a.tags ?? [],
    lastAnalysisDate: a.last_analysis_date
      ? new Date(a.last_analysis_date * 1000).toISOString()
      : undefined,
  };
}

export interface VtDomainResult {
  maliciousDetections: number;
  cleanDetections: number;
  suspiciousDetections: number;
  totalEngines: number;
  categories: Record<string, string>;
  tags: string[];
  lastAnalysisDate?: string;
  creationDate?: string;
  reputation: number;
}

export async function vtAnalyzeDomain(domain: string): Promise<VtDomainResult | null> {
  const raw = await vtFetch(`/domains/${domain}`) as any;
  if (!raw?.data?.attributes) return null;
  const a = raw.data.attributes;
  const stats = a.last_analysis_stats ?? {};

  return {
    maliciousDetections: stats.malicious ?? 0,
    cleanDetections: stats.harmless ?? 0,
    suspiciousDetections: stats.suspicious ?? 0,
    totalEngines: Object.values(stats).reduce((s: number, v) => s + (v as number), 0) as number,
    categories: a.categories ?? {},
    tags: a.tags ?? [],
    lastAnalysisDate: a.last_analysis_date
      ? new Date(a.last_analysis_date * 1000).toISOString()
      : undefined,
    creationDate: a.creation_date
      ? new Date(a.creation_date * 1000).toISOString()
      : undefined,
    reputation: a.reputation ?? 0,
  };
}

export const vtConfigured = !!KEY;
