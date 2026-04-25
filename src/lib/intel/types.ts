// ─── Unified OSNIT Intelligence Types ────────────────────────────────────────

export type ThreatLevel = 'clean' | 'info' | 'suspicious' | 'malicious' | 'critical';
export type QueryType = 'ip' | 'domain' | 'email' | 'url' | 'hash';

export interface RiskScore {
  score: number;        // 0–100
  level: ThreatLevel;
  label: string;        // human-readable
  factors: string[];    // what drove the score up
  confidence: number;   // 0–100, how many sources contributed
}

export interface IntelSource {
  name: string;
  status: 'ok' | 'error' | 'no_key' | 'not_found';
  data?: Record<string, unknown>;
  error?: string;
}

// ── IP Intelligence ──────────────────────────────────────────────────────────
export interface GeoInfo {
  country?: string;
  countryCode?: string;
  city?: string;
  region?: string;
  lat?: number;
  lon?: number;
  asn?: string;
  org?: string;
  isp?: string;
  timezone?: string;
}

export interface IpReputation {
  abuseScore: number;        // AbuseIPDB 0–100
  totalReports: number;
  lastReportedAt?: string;
  categories: string[];      // abuse categories (SSH brute force, DDoS, etc.)
  isWhitelisted: boolean;
}

export interface IpNetwork {
  isVpn: boolean;
  isTor: boolean;
  isProxy: boolean;
  isBot: boolean;
  isScanner: boolean;
  isCloud: boolean;
  classification: string;    // GreyNoise: malicious | benign | unknown
  tags: string[];
}

export interface IpThreatIntel {
  malwareDetections: number;
  phishingDetections: number;
  cleanDetections: number;
  totalEngines: number;
  pulseCount: number;         // OTX threat feeds
  relatedMalware: string[];
  relatedCampaigns: string[];
}

export interface OpenPort {
  port: number;
  protocol: string;
  service: string;
  banner?: string;
}

export interface IpIntelligence {
  type: 'ip';
  query: string;
  risk: RiskScore;
  geo: GeoInfo;
  reputation: IpReputation;
  network: IpNetwork;
  threatIntel: IpThreatIntel;
  openPorts: OpenPort[];
  sources: IntelSource[];
  timestamp: string;
  queryTimeMs: number;
}

// ── Domain Intelligence ──────────────────────────────────────────────────────
export interface WhoisData {
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
}

export interface DnsRecords {
  a?: string[];
  aaaa?: string[];
  mx?: string[];
  ns?: string[];
  txt?: string[];
  cname?: string[];
}

export interface DomainThreatIntel {
  maliciousDetections: number;
  phishingDetections: number;
  cleanDetections: number;
  totalEngines: number;
  isMalicious: boolean;
  isPhishing: boolean;
  isMalware: boolean;
  categories: string[];
  pulseCount: number;
  screenshot?: string;
  urlscanVerdict?: string;
}

export interface SslInfo {
  isValid: boolean;
  issuer?: string;
  subject?: string;
  validFrom?: string;
  validTo?: string;
  daysRemaining?: number;
}

export interface DomainIntelligence {
  type: 'domain';
  query: string;
  risk: RiskScore;
  whois: WhoisData;
  dns: DnsRecords;
  threats: DomainThreatIntel;
  ssl?: SslInfo;
  sources: IntelSource[];
  timestamp: string;
  queryTimeMs: number;
}

// ── Email / Breach Intelligence ───────────────────────────────────────────────
export interface BreachRecord {
  source: string;
  date?: string;
  dataTypes: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  isVerified: boolean;
}

export interface EmailValidity {
  formatValid: boolean;
  isDisposable: boolean;
  domain?: string;
  mxExists?: boolean;
}

export interface EmailIntelligence {
  type: 'email';
  query: string;
  risk: RiskScore;
  validity: EmailValidity;
  breaches: {
    found: boolean;
    count: number;
    records: BreachRecord[];
    oldestBreach?: string;
    mostRecentBreach?: string;
    exposedDataTypes: string[];
  };
  sources: IntelSource[];
  timestamp: string;
  queryTimeMs: number;
}

// ── API Response wrapper ──────────────────────────────────────────────────────
export type IntelResult = IpIntelligence | DomainIntelligence | EmailIntelligence;

export interface IntelApiResponse<T extends IntelResult = IntelResult> {
  success: boolean;
  data?: T;
  error?: string;
  cached: boolean;
  queryTimeMs: number;
}
