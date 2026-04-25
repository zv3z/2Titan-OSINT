// AlienVault OTX — Open Threat Exchange
// Community threat intelligence: malware campaigns, C2 servers, IOC feeds
// Docs: https://otx.alienvault.com/api

const BASE = 'https://otx.alienvault.com/api/v1';
const KEY = process.env.OTX_API_KEY;

async function otxFetch(path: string): Promise<unknown> {
  if (!KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'X-OTX-API-KEY': KEY, 'Accept': 'application/json' },
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

export interface OtxResult {
  pulseCount: number;
  threatScore: number;   // 0–100 derived from pulse count & tags
  malwareFamilies: string[];
  adversaries: string[];
  industries: string[];
  tags: string[];
  reputationScore?: number;
}

function deriveThreatScore(pulseCount: number): number {
  if (pulseCount === 0) return 0;
  if (pulseCount < 3) return 20;
  if (pulseCount < 10) return 45;
  if (pulseCount < 30) return 65;
  if (pulseCount < 100) return 80;
  return 95;
}

export async function getIpIntel(ip: string): Promise<OtxResult | null> {
  const [general, reputationRaw] = await Promise.allSettled([
    otxFetch(`/indicators/IPv4/${ip}/general`),
    otxFetch(`/indicators/IPv4/${ip}/reputation`),
  ]);

  const g = general.status === 'fulfilled' ? general.value as any : null;
  const rep = reputationRaw.status === 'fulfilled' ? reputationRaw.value as any : null;

  if (!g) return null;

  const pulses = g.pulse_info?.count ?? 0;
  const pulseList = g.pulse_info?.pulses ?? [];

  const malwareFamilies: string[] = [];
  const adversaries: string[] = [];
  const industries: string[] = [];
  const tags: string[] = [];

  for (const pulse of pulseList) {
    tags.push(...(pulse.tags ?? []));
    malwareFamilies.push(...(pulse.malware_families?.map((m: any) => m.display_name ?? m) ?? []));
    adversaries.push(...(pulse.adversary ? [pulse.adversary] : []));
    industries.push(...(pulse.targeted_countries ?? []));
  }

  return {
    pulseCount: pulses,
    threatScore: deriveThreatScore(pulses),
    malwareFamilies: [...new Set(malwareFamilies)].slice(0, 10),
    adversaries: [...new Set(adversaries)].slice(0, 5),
    industries: [...new Set(industries)].slice(0, 5),
    tags: [...new Set(tags)].slice(0, 15),
    reputationScore: rep?.reputation?.score,
  };
}

export async function getDomainIntel(domain: string): Promise<OtxResult | null> {
  const raw = await otxFetch(`/indicators/domain/${domain}/general`) as any;
  if (!raw) return null;

  const pulses = raw.pulse_info?.count ?? 0;
  const pulseList = raw.pulse_info?.pulses ?? [];

  const malwareFamilies: string[] = [];
  const adversaries: string[] = [];
  const tags: string[] = [];

  for (const pulse of pulseList) {
    tags.push(...(pulse.tags ?? []));
    malwareFamilies.push(...(pulse.malware_families?.map((m: any) => m.display_name ?? m) ?? []));
    adversaries.push(...(pulse.adversary ? [pulse.adversary] : []));
  }

  return {
    pulseCount: pulses,
    threatScore: deriveThreatScore(pulses),
    malwareFamilies: [...new Set(malwareFamilies)].slice(0, 10),
    adversaries: [...new Set(adversaries)].slice(0, 5),
    industries: [],
    tags: [...new Set(tags)].slice(0, 15),
  };
}

export const otxConfigured = !!KEY;
