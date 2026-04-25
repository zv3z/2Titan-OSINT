// LeakCheck API — credential breach detection
// Docs: https://leakcheck.io/api/v2

const BASE = 'https://leakcheck.io/api/v2';
const KEY = process.env.LEAKCHECK_API_KEY;

export interface BreachEntry {
  source: string;
  date?: string;
  dataTypes: string[];
  isVerified: boolean;
  description?: string;
}

export interface LeakCheckResult {
  found: boolean;
  count: number;
  breaches: BreachEntry[];
}

export async function checkEmail(email: string): Promise<LeakCheckResult | null> {
  if (!KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(`${BASE}/query/${encodeURIComponent(email)}`, {
      headers: { 'X-API-Key': KEY, 'Accept': 'application/json' },
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = await res.json() as any;

    if (!json.success || !json.found) {
      return { found: false, count: 0, breaches: [] };
    }

    const breaches: BreachEntry[] = (json.sources ?? []).map((s: any) => ({
      source: s.name ?? s,
      date: s.date ?? undefined,
      dataTypes: s.data ?? [],
      isVerified: s.verified ?? false,
      description: s.description,
    }));

    return { found: true, count: breaches.length, breaches };
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export const leakConfigured = !!KEY;
