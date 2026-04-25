// GreyNoise Community API — IP internet noise context
// Tells you: is this IP a mass scanner / bot? Critical for reducing false positives.
// Docs: https://developer.greynoise.io/reference/community-api

const BASE = 'https://api.greynoise.io';
const KEY = process.env.GREYNOISE_API_KEY;

export interface GreyNoiseResult {
  ip: string;
  noise: boolean;         // seen in mass-scan/internet-wide activity
  riot: boolean;          // belongs to a known benign service (Cloudflare, Google, etc.)
  classification: 'malicious' | 'benign' | 'unknown';
  name?: string;          // e.g. "Cloudflare" if riot=true
  link?: string;
  lastSeen?: string;
  message?: string;
  tags: string[];
}

export async function checkIpNoise(ip: string): Promise<GreyNoiseResult | null> {
  if (!KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);

  try {
    const res = await fetch(`${BASE}/v3/community/${ip}`, {
      headers: { 'key': KEY, 'Accept': 'application/json' },
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    if (res.status === 404) {
      // GreyNoise returns 404 for IPs with no data — that's fine (means "unknown")
      return {
        ip,
        noise: false,
        riot: false,
        classification: 'unknown',
        tags: [],
        message: 'No data available',
      };
    }

    if (!res.ok) return null;
    const d = await res.json() as any;

    return {
      ip,
      noise: d.noise ?? false,
      riot: d.riot ?? false,
      classification: d.classification ?? 'unknown',
      name: d.name,
      link: d.link,
      lastSeen: d.last_seen,
      message: d.message,
      tags: d.tags ?? [],
    };
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export const gnConfigured = !!KEY;
