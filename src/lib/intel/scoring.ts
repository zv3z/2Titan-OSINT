// Titan OSINT — Multi-source Weighted Risk Scoring Engine
// Sources: AbuseIPDB, VirusTotal, GreyNoise, CriminalIP, OTX, ZoomEye, LeakCheck, BreachDirectory, IntelX

import type { RiskScore, ThreatLevel } from './types';

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

function levelFromScore(score: number): ThreatLevel {
  if (score <= 12) return 'clean';
  if (score <= 32) return 'info';
  if (score <= 58) return 'suspicious';
  if (score <= 78) return 'malicious';
  return 'critical';
}

function labelFromLevel(level: ThreatLevel): string {
  return { clean: 'Clean', info: 'Low Risk', suspicious: 'Suspicious', malicious: 'Malicious', critical: 'Critical Threat' }[level];
}

// ── IP Scoring ─────────────────────────────────────────────────────────────────
// Weights: AbuseIPDB 30% | VT 20% | CriminalIP 20% | GreyNoise 15% | OTX 15%
export interface IpScoringInputs {
  abuseScore?: number;           // AbuseIPDB 0–100
  vtMalicious?: number;          // VT detection count
  vtTotal?: number;
  gnClassification?: string;    // malicious | benign | unknown
  gnRiot?: boolean;              // known benign service
  gnNoise?: boolean;             // mass scanner
  otxPulseCount?: number;
  cipScore?: number;             // CriminalIP normalized 0–100
  isTor?: boolean;
  isProxy?: boolean;
  zoomEyePortCount?: number;     // many open ports = higher attack surface
}

export function scoreIp(inputs: IpScoringInputs): RiskScore {
  const factors: string[] = [];
  let sources = 0;
  let score = 0;

  // GreyNoise RIOT = guaranteed benign (Cloudflare, Google, etc.) — shortcut
  if (inputs.gnRiot) {
    return {
      score: 5,
      level: 'clean',
      label: 'Known Benign Service',
      factors: ['Identified as a known benign internet service (GreyNoise RIOT)'],
      confidence: 92,
    };
  }

  // AbuseIPDB — 30%
  if (inputs.abuseScore !== undefined) {
    sources++;
    score += inputs.abuseScore * 0.30;
    if (inputs.abuseScore > 40) factors.push(`AbuseIPDB abuse confidence: ${inputs.abuseScore}%`);
  }

  // VirusTotal — 20%
  if (inputs.vtMalicious !== undefined && inputs.vtTotal && inputs.vtTotal > 0) {
    sources++;
    const pct = (inputs.vtMalicious / inputs.vtTotal) * 100;
    score += pct * 0.20;
    if (inputs.vtMalicious > 0) factors.push(`${inputs.vtMalicious}/${inputs.vtTotal} VirusTotal engines`);
  }

  // CriminalIP — 20%
  if (inputs.cipScore !== undefined) {
    sources++;
    score += inputs.cipScore * 0.20;
    if (inputs.cipScore > 40) factors.push(`CriminalIP threat score: ${inputs.cipScore}`);
  }

  // GreyNoise — 15%
  if (inputs.gnClassification) {
    sources++;
    if (inputs.gnClassification === 'malicious') {
      score += 15;
      factors.push('GreyNoise: classified malicious');
    } else if (inputs.gnNoise) {
      score += 6;
      factors.push('GreyNoise: active internet scanner');
    }
  }

  // OTX — 15%
  if (inputs.otxPulseCount !== undefined) {
    sources++;
    const contrib = Math.min(15, inputs.otxPulseCount * 0.8);
    score += contrib;
    if (inputs.otxPulseCount > 0) factors.push(`${inputs.otxPulseCount} OTX threat pulses`);
  }

  // Modifiers (not weighted, push floor up)
  if (inputs.isTor) { score = Math.max(score, 45); factors.push('Tor exit node'); }
  if (inputs.isProxy) { score = Math.max(score, 30); factors.push('Known proxy/anonymizer'); }
  if ((inputs.zoomEyePortCount ?? 0) > 20) { score += 5; factors.push(`${inputs.zoomEyePortCount} exposed ports (ZoomEye)`); }

  const final = clamp(Math.round(score));
  const level = levelFromScore(final);
  return {
    score: final,
    level,
    label: labelFromLevel(level),
    factors: factors.length ? factors : ['No active threats detected'],
    confidence: clamp(sources * 20),
  };
}

// ── Domain Scoring ─────────────────────────────────────────────────────────────
// Weights: VT 40% | OTX 20% | Domain age 20% | URLScan 10% | IntelX 10%
export interface DomainScoringInputs {
  vtMalicious?: number;
  vtTotal?: number;
  otxPulseCount?: number;
  domainAgeInDays?: number;
  urlscanMalicious?: boolean;
  urlscanScore?: number;
  intelxCount?: number;          // appearances in leak/paste databases
}

export function scoreDomain(inputs: DomainScoringInputs): RiskScore {
  let score = 0;
  const factors: string[] = [];
  let sources = 0;

  if (inputs.vtMalicious !== undefined && inputs.vtTotal && inputs.vtTotal > 0) {
    sources++;
    score += (inputs.vtMalicious / inputs.vtTotal) * 100 * 0.40;
    if (inputs.vtMalicious > 0) factors.push(`${inputs.vtMalicious}/${inputs.vtTotal} VirusTotal engines`);
  }

  if (inputs.otxPulseCount !== undefined) {
    sources++;
    score += Math.min(20, inputs.otxPulseCount * 1.5);
    if (inputs.otxPulseCount > 0) factors.push(`${inputs.otxPulseCount} OTX pulses`);
  }

  if (inputs.domainAgeInDays !== undefined) {
    sources++;
    if (inputs.domainAgeInDays < 7)   { score += 20; factors.push('Domain < 7 days old'); }
    else if (inputs.domainAgeInDays < 30)  { score += 14; factors.push('Domain < 30 days old'); }
    else if (inputs.domainAgeInDays < 90)  { score += 8;  factors.push('Domain < 90 days old'); }
    else if (inputs.domainAgeInDays < 180) { score += 3; }
  }

  if (inputs.urlscanMalicious) {
    sources++;
    score += 10;
    factors.push('URLScan verdict: malicious');
  }

  if (inputs.intelxCount !== undefined && inputs.intelxCount > 0) {
    sources++;
    score += Math.min(10, inputs.intelxCount * 0.5);
    factors.push(`Found ${inputs.intelxCount} times in IntelX leak databases`);
  }

  const final = clamp(Math.round(score));
  const level = levelFromScore(final);
  return {
    score: final,
    level,
    label: labelFromLevel(level),
    factors: factors.length ? factors : ['No threats detected'],
    confidence: clamp(sources * 20),
  };
}

// ── Email Scoring ──────────────────────────────────────────────────────────────
// Weights: breach count 50% | recency 25% | IntelX exposure 15% | disposable 10%
export interface EmailScoringInputs {
  leakCheckCount?: number;
  bdCount?: number;              // BreachDirectory count
  intelxCount?: number;
  hasRecentBreach?: boolean;     // within 2 years
  isDisposable?: boolean;
}

export function scoreEmail(inputs: EmailScoringInputs): RiskScore {
  let score = 0;
  const factors: string[] = [];

  const totalBreaches = (inputs.leakCheckCount ?? 0) + (inputs.bdCount ?? 0);

  if (totalBreaches > 0) {
    const breachScore = Math.min(50, 25 + Math.log10(totalBreaches + 1) * 20);
    score += breachScore;
    factors.push(`Exposed in ${totalBreaches} breach database${totalBreaches > 1 ? 's' : ''}`);
  }

  if (inputs.hasRecentBreach) {
    score = Math.max(score, 45);
    score += 10;
    factors.push('Recent breach within last 2 years');
  }

  if ((inputs.intelxCount ?? 0) > 0) {
    score += Math.min(15, (inputs.intelxCount ?? 0) * 2);
    factors.push(`${inputs.intelxCount} appearances in IntelX databases`);
  }

  if (inputs.isDisposable) {
    score += 10;
    factors.push('Disposable / throwaway email address');
  }

  const final = clamp(Math.round(score));
  const level = levelFromScore(final);
  return {
    score: final,
    level,
    label: labelFromLevel(level),
    factors: factors.length ? factors : ['No breaches found'],
    confidence: totalBreaches !== undefined ? 88 : 50,
  };
}
