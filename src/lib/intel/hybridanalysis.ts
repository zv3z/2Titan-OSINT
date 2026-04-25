// Hybrid Analysis — Malware sandbox and file hash reputation
// Docs: https://www.hybrid-analysis.com/docs/api/v2

const BASE = 'https://www.hybrid-analysis.com/api/v2';
const KEY = process.env.HYBRID_ANALYSIS_API_KEY;

async function haFetch(path: string, body?: URLSearchParams): Promise<unknown> {
  if (!KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: {
        'api-key': KEY,
        'User-Agent': 'Falcon Sandbox',
        'Accept': 'application/json',
        ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      },
      body: body?.toString(),
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

export interface HaResult {
  found: boolean;
  threatScore: number;    // 0–100
  verdict: string;        // 'malicious' | 'suspicious' | 'clean' | 'unknown'
  malwareFamily?: string;
  malwareType?: string;
  sha256?: string;
  md5?: string;
  sha1?: string;
  analysisId?: string;
  tags: string[];
}

export async function lookupHash(hash: string): Promise<HaResult | null> {
  const body = new URLSearchParams({ hashes: `["${hash}"]` });
  const raw = await haFetch('/search/hashes', body) as any[];

  if (!Array.isArray(raw) || !raw.length || !raw[0]) {
    return { found: false, threatScore: 0, verdict: 'unknown', tags: [] };
  }

  const r = raw[0];
  const score = r.threat_score ?? 0;
  const verdict = score >= 70 ? 'malicious' : score >= 30 ? 'suspicious' : score > 0 ? 'clean' : 'unknown';

  return {
    found: true,
    threatScore: score,
    verdict,
    malwareFamily: r.vx_family,
    malwareType: r.type_short?.[0],
    sha256: r.sha256,
    md5: r.md5,
    sha1: r.sha1,
    analysisId: r.job_id ?? r.id,
    tags: r.tags ?? [],
  };
}

export const haConfigured = !!KEY;
