'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Calendar, Server, Shield, ShieldAlert, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import IntelSearch from '@/components/intel/IntelSearch';
import RiskMeter from '@/components/intel/RiskMeter';
import SourceBadges from '@/components/intel/SourceBadge';
import type { DomainIntelligence, IntelApiResponse } from '@/lib/intel/types';
import { cn } from '@/lib/utils';

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-dark-400 text-sm shrink-0">{label}</span>
      <span className="text-white text-sm text-right font-mono break-all">{String(value)}</span>
    </div>
  );
}

function DnsBlock({ label, records }: { label: string; records?: string[] }) {
  if (!records?.length) return null;
  return (
    <div className="mb-3">
      <p className="text-dark-500 text-xs font-semibold uppercase tracking-wider mb-1.5">{label}</p>
      <div className="space-y-1">
        {records.map((r, i) => (
          <p key={i} className="text-white text-xs font-mono bg-dark-800/60 px-2 py-1 rounded">{r}</p>
        ))}
      </div>
    </div>
  );
}

export default function DomainToolPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [data, setData] = useState<DomainIntelligence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cached, setCached] = useState(false);

  const runSearch = async (domain: string) => {
    if (!domain.trim()) return;
    setLoading(true); setError(''); setData(null);
    try {
      const res = await fetch(`/api/intel/domain?domain=${encodeURIComponent(domain.trim())}`);
      const json: IntelApiResponse<DomainIntelligence> = await res.json();
      if (!json.success || !json.data) throw new Error(json.error ?? 'Query failed');
      setData(json.data);
      setCached(json.cached);
    } catch (e: any) {
      setError(e.message ?? 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); runSearch(q); }
  }, []);

  const domainAge = data?.whois.domainAgeInDays;

  return (
    <>
      <section className="relative pt-28 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="container relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Domain Intelligence</h1>
              <p className="text-dark-400 text-sm">WHOIS · DNS · Threat analysis · Screenshots</p>
            </div>
          </div>
          <IntelSearch
            placeholder="Enter a domain (e.g. example.com)"
            initialValue={query}
            onSearch={(v) => { setQuery(v); runSearch(v); }}
          />
        </div>
      </section>

      <div className="container pb-20">
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-20 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-brand-500/20 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-brand-400 animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full border border-brand-500/30 animate-ping" />
            </div>
            <p className="text-dark-400 text-sm">Analyzing {query}...</p>
          </motion.div>
        )}

        {error && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="card p-6 border-red-500/20 flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        <AnimatePresence>
          {data && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="font-mono text-2xl text-white font-bold">{data.query}</span>
                  {domainAge !== undefined && (
                    <span className={cn('ml-3 text-xs px-2 py-0.5 rounded font-medium border',
                      domainAge < 30 ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      domainAge < 365 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    )}>
                      {domainAge < 365 ? `${domainAge}d old` : `${Math.floor(domainAge / 365)}y old`}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {cached && <span className="badge-green text-xs">Cached</span>}
                  <SourceBadges sources={data.sources} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                {/* Risk */}
                <div className="card p-6 flex flex-col items-center">
                  <h3 className="text-white font-semibold text-sm mb-4 self-start flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-brand-400" /> Risk Score
                  </h3>
                  <RiskMeter risk={data.risk} />
                </div>

                {/* WHOIS */}
                <div className="card p-5">
                  <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-400" /> WHOIS
                  </h3>
                  <InfoRow label="Registrar" value={data.whois.registrar} />
                  <InfoRow label="Created" value={data.whois.createdDate ? new Date(data.whois.createdDate).toLocaleDateString() : undefined} />
                  <InfoRow label="Expires" value={data.whois.expiresDate ? new Date(data.whois.expiresDate).toLocaleDateString() : undefined} />
                  <InfoRow label="Country" value={data.whois.registrantCountry} />
                  <InfoRow label="Org" value={data.whois.registrantOrg} />
                  {data.whois.status && (
                    <div className="pt-2 flex flex-wrap gap-1">
                      {data.whois.status.slice(0, 3).map((s) => (
                        <span key={s} className="text-xs bg-dark-800 text-dark-400 px-2 py-0.5 rounded font-mono">{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* DNS */}
                <div className="card p-5">
                  <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <Server className="w-4 h-4 text-brand-400" /> DNS Records
                  </h3>
                  <DnsBlock label="A" records={data.dns.a?.slice(0, 4)} />
                  <DnsBlock label="MX" records={data.dns.mx?.slice(0, 3)} />
                  <DnsBlock label="NS" records={data.dns.ns?.slice(0, 3)} />
                </div>

                {/* Threats */}
                <div className="card p-5">
                  <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-brand-400" /> Threat Analysis
                  </h3>
                  <InfoRow label="VT Malicious" value={`${data.threats.maliciousDetections}/${data.threats.totalEngines}`} />
                  <InfoRow label="OTX Pulses" value={data.threats.pulseCount} />
                  <InfoRow label="URLScan" value={data.threats.urlscanVerdict ?? 'N/A'} />
                  <div className="mt-3 space-y-1.5">
                    {[
                      { label: 'Malicious', value: data.threats.isMalicious },
                      { label: 'Phishing', value: data.threats.isPhishing },
                      { label: 'Malware', value: data.threats.isMalware },
                    ].map(({ label, value }) => (
                      <div key={label} className={cn(
                        'flex items-center justify-between px-3 py-1.5 rounded-lg text-xs border',
                        value ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-dark-800/40 border-white/5 text-dark-500'
                      )}>
                        <span>{label}</span>
                        <span className="font-semibold">{value ? '⚠ YES' : 'CLEAN'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Screenshot */}
              {data.threats.screenshot && (
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold text-sm">URLScan Screenshot</h3>
                    {data.threats.urlscanVerdict && (
                      <a href={`https://urlscan.io`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                        View full report <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <img
                    src={data.threats.screenshot}
                    alt={`Screenshot of ${data.query}`}
                    className="w-full max-w-2xl rounded-lg border border-white/10"
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!data && !loading && !error && (
          <div className="text-center py-20">
            <Globe className="w-12 h-12 text-dark-700 mx-auto mb-4" />
            <p className="text-dark-500">Enter a domain to analyze</p>
            <p className="text-dark-600 text-xs mt-1">Try: google.com · github.com · suspicious-site.xyz</p>
          </div>
        )}
      </div>
    </>
  );
}
