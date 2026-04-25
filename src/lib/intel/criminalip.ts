// CriminalIP — AI-powered IP threat scoring and attack surface analysis
// Docs: https://www.criminalip.io/developer/api/post-ip-report-summary

const BASE = 'https://api.criminalip.io/v1';
const KEY = process.env.CRIMINALIP_API_KEY;

async function cipFetch(path: string): Promise<unknown> {
  if (!KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'x-api-key': KEY, 'Accept': 'application/json' },
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return res.json();
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export interface CriminalIpResult {
  inboundScore: number;        // 0–5 (5 = critical)
  outboundScore: number;
  score: number;               // normalized 0–100
  isVpn: boolean;
  isProxy: boolean;
  isTor: boolean;
  isScanner: boolean;
  isHostingService: boolean;
  openPorts: Array<{ port: number; protocol: string; service: string }>;
  country?: string;
  countryCode?: string;
  city?: string;
  isp?: string;
  domain?: string;
  mobileCarrier?: string;
  tags: string[];
}

const SCORE_MAP: Record<string, number> = {
  Critical: 95, Dangerous: 75, Moderate: 45, Low: 20, Safe: 5,
};

export async function analyzeIp(ip: string): Promise<CriminalIpResult | null> {
  const raw = await cipFetch(`/asset/ip/report/summary?ip=${encodeURIComponent(ip)}`) as any;
  if (!raw?.data) return null;
  const d = raw.data;

  const scoreLabel = d.score?.inbound ?? 'Safe';
  const normalized = SCORE_MAP[scoreLabel] ?? 5;

  const tags: string[] = [];
  if (d.is_vpn) tags.push('VPN');
  if (d.is_proxy) tags.push('Proxy');
  if (d.is_tor) tags.push('Tor');
  if (d.is_scanner) tags.push('Scanner');
  if (d.is_hosting) tags.push('Hosting/DC');

  const ports = (d.port?.data ?? []).slice(0, 10).map((p: any) => ({
    port: p.open_port_no,
    protocol: p.protocol ?? 'tcp',
    service: p.app_name ?? 'unknown',
  }));

  return {
    inboundScore: d.score?.inbound_score ?? 0,
    outboundScore: d.score?.outbound_score ?? 0,
    score: normalized,
    isVpn: d.is_vpn ?? false,
    isProxy: d.is_proxy ?? false,
    isTor: d.is_tor ?? false,
    isScanner: d.is_scanner ?? false,
    isHostingService: d.is_hosting ?? false,
    openPorts: ports,
    country: d.whois?.data?.[0]?.org_country_code,
    countryCode: d.whois?.data?.[0]?.org_country_code,
    city: undefined,
    isp: d.whois?.data?.[0]?.org_name,
    domain: d.domain?.data?.[0]?.domain,
    tags,
  };
}

export const criminalIpConfigured = !!KEY;
