// ZoomEye — Cyberspace search engine (Shodan alternative)
// Maps internet-exposed services, devices, and vulnerabilities
// Docs: https://www.zoomeye.hk/doc

const BASE = 'https://api.zoomeye.hk';
const KEY = process.env.ZOOMEYE_API_KEY;

async function zmFetch(path: string): Promise<unknown> {
  if (!KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'API-KEY': KEY, 'Accept': 'application/json' },
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

export interface ZoomEyePort {
  port: number;
  service: string;
  banner?: string;
  app?: string;
  version?: string;
}

export interface ZoomEyeResult {
  total: number;
  country?: string;
  city?: string;
  isp?: string;
  os?: string;
  openPorts: ZoomEyePort[];
  hostnames: string[];
  tags: string[];
}

export async function searchIp(ip: string): Promise<ZoomEyeResult | null> {
  const raw = await zmFetch(`/host/search?query=ip:${encodeURIComponent(ip)}&page=1`) as any;
  if (!raw?.matches?.length) return null;

  const matches = raw.matches as any[];
  const first = matches[0];

  const openPorts: ZoomEyePort[] = matches.map((m: any) => ({
    port: m.portinfo?.port,
    service: m.portinfo?.service ?? 'unknown',
    banner: m.portinfo?.banner?.slice(0, 200),
    app: m.portinfo?.app,
    version: m.portinfo?.version,
  })).filter((p: ZoomEyePort) => p.port);

  return {
    total: raw.total ?? matches.length,
    country: first?.geoinfo?.country?.names?.en,
    city: first?.geoinfo?.city?.names?.en,
    isp: first?.geoinfo?.organization?.name,
    os: first?.portinfo?.os,
    openPorts: openPorts.slice(0, 15),
    hostnames: first?.rdns ? [first.rdns] : [],
    tags: [],
  };
}

export const zoomEyeConfigured = !!KEY;
