// IntelX (Intelligence X) — Deep/dark web OSINT and breach data search
// Searches leaked databases, paste sites, and underground forums
// Docs: https://intelx.io/help?tab=account

const BASE = 'https://2.intelx.io';
const KEY = process.env.INTELX_API_KEY;

async function ixFetch(path: string, options?: RequestInit): Promise<unknown> {
  if (!KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: { 'x-key': KEY, 'Accept': 'application/json', ...options?.headers },
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

export interface IntelXRecord {
  type: string;        // email, domain, ip, etc.
  date: string;
  name?: string;       // source name
  bucket?: string;
  size?: number;
}

export interface IntelXResult {
  found: boolean;
  count: number;
  records: IntelXRecord[];
  searchId?: string;
}

// Media type codes for IntelX search
const MEDIA_PASTES = 1;
const MEDIA_DARKWEB = 400;

export async function search(term: string): Promise<IntelXResult | null> {
  // Step 1: submit search
  const searchRes = await ixFetch('/intelligent/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      term,
      media: 0,       // all media types
      target: 0,      // all targets
      timeout: 20,
      maxresults: 20,
      sort: 4,        // date descending
      terminate: [],
    }),
  }) as any;

  if (!searchRes?.id) return { found: false, count: 0, records: [] };

  const searchId = searchRes.id;

  // Step 2: fetch results (brief poll)
  await new Promise((r) => setTimeout(r, 1500));

  const resultsRes = await ixFetch(
    `/intelligent/search/result?id=${searchId}&limit=20&offset=0&statistics=1`
  ) as any;

  if (!resultsRes?.records?.length) {
    return { found: false, count: 0, records: [], searchId };
  }

  const records: IntelXRecord[] = resultsRes.records.map((r: any) => ({
    type: r.type ?? 'unknown',
    date: r.date ?? '',
    name: r.name,
    bucket: r.bucket,
    size: r.size,
  }));

  return {
    found: records.length > 0,
    count: resultsRes.statistics?.total ?? records.length,
    records,
    searchId,
  };
}

export const intelxConfigured = !!KEY;
