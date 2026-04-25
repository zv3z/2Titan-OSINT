// WHOISXML API — domain registration, DNS, and age data
// Docs: https://whois.whoisxmlapi.com/api

const WHOIS_BASE = 'https://www.whoisxmlapi.com/whoisserver/WhoisService';
const DNS_BASE = 'https://www.whoisxmlapi.com/whoisserver/DNSService';
const KEY = process.env.WHOISXML_API_KEY;

async function xmlFetch(url: string): Promise<unknown> {
  if (!KEY) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return res.json();
  } catch {
    clearTimeout(timer);
    return null;
  }
}

function daysBetween(dateStr?: string): number | undefined {
  if (!dateStr) return undefined;
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export interface WhoisResult {
  domainName?: string;
  registrar?: string;
  registrarUrl?: string;
  createdDate?: string;
  updatedDate?: string;
  expiresDate?: string;
  nameservers?: string[];
  registrantCountry?: string;
  registrantOrg?: string;
  domainAgeInDays?: number;
  status?: string[];
  rawText?: string;
}

export async function lookupWhois(domain: string): Promise<WhoisResult | null> {
  const url = new URL(WHOIS_BASE);
  url.searchParams.set('apiKey', KEY ?? '');
  url.searchParams.set('domainName', domain);
  url.searchParams.set('outputFormat', 'JSON');

  const raw = await xmlFetch(url.toString()) as any;
  if (!raw?.WhoisRecord) return null;
  const r = raw.WhoisRecord;
  const ri = r.registryData ?? r;

  const createdDate = ri.createdDateNormalized ?? r.createdDateNormalized;
  const nameservers: string[] = [];
  const ns = ri.nameServers?.hostNames ?? ri.nameServers;
  if (Array.isArray(ns)) nameservers.push(...ns);
  else if (typeof ns === 'string') nameservers.push(ns);

  return {
    domainName: r.domainName,
    registrar: r.registrarName ?? ri.registrarName,
    registrarUrl: r.registrarIANAID,
    createdDate,
    updatedDate: ri.updatedDateNormalized ?? r.updatedDateNormalized,
    expiresDate: ri.expiresDateNormalized ?? r.expiresDateNormalized,
    nameservers,
    registrantCountry: r.registrant?.country ?? r.registrant?.countryCode,
    registrantOrg: r.registrant?.organization,
    domainAgeInDays: daysBetween(createdDate),
    status: Array.isArray(r.status) ? r.status : r.status ? [r.status] : undefined,
  };
}

export interface DnsResult {
  a?: string[];
  aaaa?: string[];
  mx?: string[];
  ns?: string[];
  txt?: string[];
  cname?: string[];
}

export async function lookupDns(domain: string): Promise<DnsResult | null> {
  const types = ['A', 'MX', 'NS', 'TXT'] as const;
  const results: DnsResult = {};

  await Promise.allSettled(
    types.map(async (type) => {
      const url = new URL(DNS_BASE);
      url.searchParams.set('apiKey', KEY ?? '');
      url.searchParams.set('domainName', domain);
      url.searchParams.set('type', type);
      url.searchParams.set('outputFormat', 'JSON');

      const raw = await xmlFetch(url.toString()) as any;
      const records = raw?.DNSData?.dnsRecords?.dnsRecord ?? [];
      const arr = Array.isArray(records) ? records : [records];
      const values = arr.map((r: any) => r.address ?? r.name ?? r.strings).filter(Boolean);

      if (type === 'A') results.a = values;
      else if (type === 'MX') results.mx = values;
      else if (type === 'NS') results.ns = values;
      else if (type === 'TXT') results.txt = values;
    })
  );

  return results;
}

export const whoisConfigured = !!KEY;
