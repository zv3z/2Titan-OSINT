// BreachDirectory — Email breach detection via RapidAPI
// Docs: https://breachdirectory.p.rapidapi.com

const BASE = 'https://breachdirectory.p.rapidapi.com';
const KEY = process.env.BREACHDIRECTORY_API_KEY;
const HOST = 'breachdirectory.p.rapidapi.com';

export interface BdResult {
  found: boolean;
  count: number;
  breaches: Array<{
    source: string;
    password?: string;    // hashed — never expose in plaintext to UI
    sha1?: string;
    hash?: string;
  }>;
  sources: string[];
}

export async function checkEmail(email: string): Promise<BdResult | null> {
  if (!KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const url = new URL(BASE);
    url.searchParams.set('func', 'auto');
    url.searchParams.set('term', email);

    const res = await fetch(url.toString(), {
      headers: {
        'x-rapidapi-key': KEY,
        'x-rapidapi-host': HOST,
        'Accept': 'application/json',
      },
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = await res.json() as any;

    if (!json.found) return { found: false, count: 0, breaches: [], sources: [] };

    const breaches = (json.result ?? []).map((r: any) => ({
      source: r.sources?.[0] ?? 'Unknown',
      sha1: r.sha1,
      hash: r.password, // may be hashed
    }));

    const sources = [...new Set(
      (json.result ?? []).flatMap((r: any) => r.sources ?? [])
    )] as string[];

    return { found: true, count: breaches.length, breaches, sources };
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export const bdConfigured = !!KEY;
