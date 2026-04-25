// URLScan.io — domain/URL threat analysis with screenshots
// Uses search endpoint for existing results (fast, no wait)
// Docs: https://urlscan.io/docs/api/

const BASE = 'https://urlscan.io/api/v1';
const KEY = process.env.URLSCAN_API_KEY;

async function urlscanFetch(path: string): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (KEY) headers['API-Key'] = KEY;
  try {
    const res = await fetch(`${BASE}${path}`, { headers, signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return res.json();
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export interface URLScanResult {
  screenshot?: string;
  verdict?: string;       // malicious | suspicious | benign
  score?: number;
  brand?: string;
  ip?: string;
  server?: string;
  country?: string;
  isMalicious: boolean;
  tags: string[];
  reportUrl?: string;
}

export async function searchDomain(domain: string): Promise<URLScanResult | null> {
  const raw = await urlscanFetch(
    `/search/?q=domain:${encodeURIComponent(domain)}&size=5&sort=date`
  ) as any;

  if (!raw?.results?.length) return null;

  // Take the most recent result with a verdict
  const result = raw.results.find((r: any) => r.verdicts?.overall) ?? raw.results[0];
  if (!result) return null;

  const verdict = result.verdicts?.overall;
  const page = result.page ?? {};
  const task = result.task ?? {};

  return {
    screenshot: result.screenshot,
    verdict: verdict?.verdict ?? 'unknown',
    score: verdict?.score,
    brand: verdict?.brands?.[0],
    ip: page.ip,
    server: page.server,
    country: page.country,
    isMalicious: verdict?.malicious ?? false,
    tags: verdict?.tags ?? [],
    reportUrl: task.reportURL,
  };
}

export const urlscanConfigured = !!KEY;
