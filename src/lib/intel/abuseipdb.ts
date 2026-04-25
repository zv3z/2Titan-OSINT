// AbuseIPDB API v2 — IP abuse reports and confidence scoring
// Docs: https://docs.abuseipdb.com/

const BASE = 'https://api.abuseipdb.com/api/v2';
const KEY = process.env.ABUSEIPDB_API_KEY;

const CATEGORY_MAP: Record<number, string> = {
  1: 'DNS Compromise', 2: 'DNS Poisoning', 3: 'Fraud Orders',
  4: 'DDoS Attack', 5: 'FTP Brute Force', 6: 'Ping of Death',
  7: 'Phishing', 8: 'Fraud VoIP', 9: 'Open Proxy', 10: 'Web Spam',
  11: 'Email Spam', 12: 'Blog Spam', 13: 'VPN IP', 14: 'Port Scan',
  15: 'Hacking', 16: 'SQL Injection', 17: 'Spoofing', 18: 'Brute Force',
  19: 'Bad Web Bot', 20: 'Exploited Host', 21: 'Web App Attack',
  22: 'SSH Brute Force', 23: 'IoT Targeted',
};

export interface AbuseIpResult {
  abuseConfidenceScore: number;  // 0–100
  totalReports: number;
  numDistinctUsers: number;
  lastReportedAt?: string;
  countryCode?: string;
  domain?: string;
  hostnames: string[];
  isTor: boolean;
  usageType?: string;
  isp?: string;
  categories: string[];
  isWhitelisted: boolean;
}

export async function checkIp(ip: string): Promise<AbuseIpResult | null> {
  if (!KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);

  try {
    const url = new URL(`${BASE}/check`);
    url.searchParams.set('ipAddress', ip);
    url.searchParams.set('maxAgeInDays', '90');
    url.searchParams.set('verbose', '');

    const res = await fetch(url.toString(), {
      headers: { 'Key': KEY, 'Accept': 'application/json' },
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;

    const json = await res.json() as any;
    const d = json.data;
    if (!d) return null;

    const categories = [...new Set(
      (d.reports ?? []).flatMap((r: any) => r.categories ?? [])
        .map((c: number) => CATEGORY_MAP[c] ?? `Category ${c}`)
    )] as string[];

    return {
      abuseConfidenceScore: d.abuseConfidenceScore ?? 0,
      totalReports: d.totalReports ?? 0,
      numDistinctUsers: d.numDistinctUsers ?? 0,
      lastReportedAt: d.lastReportedAt ?? undefined,
      countryCode: d.countryCode,
      domain: d.domain,
      hostnames: d.hostnames ?? [],
      isTor: d.isTor ?? false,
      usageType: d.usageType,
      isp: d.isp,
      categories,
      isWhitelisted: d.isWhitelisted ?? false,
    };
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export const abuseConfigured = !!KEY;
