// Vulners — Vulnerability intelligence and CVE database
// Used to enrich IPs/domains with known vulnerability context from open ports/services
// Docs: https://vulners.com/docs/apikey/

const BASE = 'https://vulners.com/api/v3';
const KEY = process.env.VULNERS_API_KEY;

async function vulFetch(path: string, body: unknown): Promise<unknown> {
  if (!KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ ...body as object, apiKey: KEY }),
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

export interface VulnerabilityRef {
  id: string;           // CVE-2024-XXXX
  title: string;
  cvss?: number;
  severity?: string;
  published?: string;
}

export interface VulnersResult {
  vulnerabilities: VulnerabilityRef[];
  criticalCount: number;
  highCount: number;
  riskScore: number;    // derived 0–100
}

function scoreFromVulns(vulns: VulnerabilityRef[]): number {
  if (!vulns.length) return 0;
  const critical = vulns.filter((v) => (v.cvss ?? 0) >= 9).length;
  const high = vulns.filter((v) => (v.cvss ?? 0) >= 7 && (v.cvss ?? 0) < 9).length;
  return Math.min(100, critical * 20 + high * 8 + vulns.length * 2);
}

export async function searchSoftwareVulns(software: string, version?: string): Promise<VulnersResult | null> {
  const query = version ? `${software} ${version}` : software;
  const raw = await vulFetch('/search/lucene/', {
    query,
    fields: ['id', 'title', 'cvss', 'published'],
    size: 20,
  }) as any;

  if (!raw?.data?.search?.length) return { vulnerabilities: [], criticalCount: 0, highCount: 0, riskScore: 0 };

  const vulns: VulnerabilityRef[] = raw.data.search.map((item: any) => {
    const s = item._source ?? {};
    const cvss = s.cvss?.score ?? s.cvss3?.cvssV3?.baseScore;
    const score = parseFloat(cvss) || 0;
    return {
      id: s.id ?? item._id,
      title: s.title ?? s.description?.slice(0, 100) ?? '',
      cvss: score,
      severity: score >= 9 ? 'critical' : score >= 7 ? 'high' : score >= 4 ? 'medium' : 'low',
      published: s.published,
    };
  });

  return {
    vulnerabilities: vulns,
    criticalCount: vulns.filter((v) => (v.cvss ?? 0) >= 9).length,
    highCount: vulns.filter((v) => (v.cvss ?? 0) >= 7).length,
    riskScore: scoreFromVulns(vulns),
  };
}

export const vulnersConfigured = !!KEY;
