'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, MapPin, ShieldAlert, Activity, Globe, Server, Tag, Loader2, AlertCircle } from 'lucide-react';
import IntelSearch from '@/components/intel/IntelSearch';
import RiskMeter from '@/components/intel/RiskMeter';
import SourceBadges from '@/components/intel/SourceBadge';
import type { IpIntelligence, IntelApiResponse } from '@/lib/intel/types';
import { cn } from '@/lib/utils';

function InfoRow({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-dark-400 text-sm shrink-0">{label}</span>
      <span className="text-white text-sm text-right font-mono">{String(value)}</span>
    </div>
  );
}

function TagList({ tags, color = 'brand' }: { tags: string[]; color?: string }) {
  if (!tags.length) return <span className="text-dark-500 text-xs">None detected</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span key={t} className={cn(
          'px-2 py-0.5 rounded text-xs font-medium',
          color === 'red' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
          color === 'yellow' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
          'bg-brand-500/10 text-brand-400 border border-brand-500/20'
        )}>{t}</span>
      ))}
    </div>
  );
}

function Flag({ code }: { code?: string }) {
  if (!code) return null;
  const flag = code.toUpperCase().replace(/./g, (c) =>
    String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))
  );
  return <span className="text-base">{flag}</span>;
}

export default function IpToolPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [data, setData] = useState<IpIntelligence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cached, setCached] = useState(false);

  const runSearch = async (ip: string) => {
    if (!ip.trim()) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch(`/api/intel/ip?ip=${encodeURIComponent(ip.trim())}`);
      const json: IntelApiResponse<IpIntelligence> = await res.json();
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

  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="container relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Wifi className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">IP Intelligence</h1>
              <p className="text-dark-400 text-sm">Reputation · Geolocation · Threat context</p>
            </div>
          </div>
          <IntelSearch
            placeholder="Enter an IPv4 address (e.g. 8.8.8.8)"
            initialValue={query}
            onSearch={(v) => { setQuery(v); runSearch(v); }}
          />
        </div>
      </section>

      <div className="container pb-20">
        {/* Loading */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-20 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-brand-500/20 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-brand-400 animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full border border-brand-500/30 animate-ping" />
            </div>
            <p className="text-dark-400 text-sm">Querying {query} across intelligence sources...</p>
          </motion.div>
        )}

        {/* Error */}
        {error && !loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="card p-6 border-red-500/20 flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {data && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Header row */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-2xl text-white font-bold">{data.query}</span>
                    <Flag code={data.geo.countryCode} />
                  </div>
                  <p className="text-dark-400 text-sm mt-0.5">{data.geo.org ?? data.geo.isp ?? 'Unknown organization'}</p>
                </div>
                <div className="flex items-center gap-3">
                  {cached && <span className="badge-green text-xs">Cached</span>}
                  <SourceBadges sources={data.sources} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                {/* Risk score */}
                <div className="card p-6 flex flex-col items-center">
                  <h3 className="text-white font-semibold text-sm mb-4 self-start flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-brand-400" /> Risk Score
                  </h3>
                  <RiskMeter risk={data.risk} size="md" />
                </div>

                {/* Geo + Network info */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Geolocation */}
                  <div className="card p-5">
                    <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-400" /> Geolocation
                    </h3>
                    <InfoRow label="Country" value={data.geo.country} />
                    <InfoRow label="Country Code" value={data.geo.countryCode} />
                    <InfoRow label="ISP / Org" value={data.geo.isp ?? data.geo.org} />
                    <InfoRow label="ASN" value={data.geo.asn} />
                    <InfoRow label="Timezone" value={data.geo.timezone} />
                  </div>

                  {/* Reputation */}
                  <div className="card p-5">
                    <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-brand-400" /> Reputation
                    </h3>
                    <InfoRow label="Abuse Score" value={`${data.reputation.abuseScore}%`} />
                    <InfoRow label="Total Reports" value={data.reputation.totalReports} />
                    <InfoRow label="Last Reported" value={data.reputation.lastReportedAt
                      ? new Date(data.reputation.lastReportedAt).toLocaleDateString() : 'Never'} />
                    <InfoRow label="Whitelisted" value={data.reputation.isWhitelisted ? 'Yes' : 'No'} />
                    <div className="pt-2">
                      <TagList tags={data.reputation.categories} color="red" />
                    </div>
                  </div>

                  {/* Network flags */}
                  <div className="card p-5">
                    <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-brand-400" /> Network Classification
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'VPN', value: data.network.isVpn },
                        { label: 'Tor', value: data.network.isTor },
                        { label: 'Proxy', value: data.network.isProxy },
                        { label: 'Scanner', value: data.network.isScanner },
                        { label: 'Bot', value: data.network.isBot },
                        { label: 'Cloud/DC', value: data.network.isCloud },
                      ].map(({ label, value }) => (
                        <div key={label} className={cn(
                          'flex items-center justify-between px-3 py-2 rounded-lg text-xs border',
                          value ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-dark-800/50 border-white/5 text-dark-500'
                        )}>
                          <span>{label}</span>
                          <span className="font-semibold">{value ? 'YES' : 'NO'}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3">
                      <span className="text-dark-500 text-xs">GreyNoise: </span>
                      <span className={cn('text-xs font-semibold',
                        data.network.classification === 'malicious' ? 'text-red-400' :
                        data.network.classification === 'benign' ? 'text-emerald-400' : 'text-dark-400'
                      )}>
                        {data.network.classification.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Threat Intel */}
                  <div className="card p-5">
                    <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                      <Server className="w-4 h-4 text-brand-400" /> Threat Intelligence
                    </h3>
                    <InfoRow label="VT Detections" value={`${data.threatIntel.malwareDetections}/${data.threatIntel.totalEngines}`} />
                    <InfoRow label="OTX Pulses" value={data.threatIntel.pulseCount} />
                    <div className="pt-2 space-y-2">
                      {data.threatIntel.relatedMalware.length > 0 && (
                        <div>
                          <p className="text-dark-500 text-xs mb-1">Malware families</p>
                          <TagList tags={data.threatIntel.relatedMalware} color="red" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {data.network.tags.length > 0 && (
                <div className="card p-5">
                  <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-brand-400" /> Intelligence Tags
                  </h3>
                  <TagList tags={data.network.tags} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!data && !loading && !error && (
          <div className="text-center py-20">
            <Wifi className="w-12 h-12 text-dark-700 mx-auto mb-4" />
            <p className="text-dark-500">Enter an IP address above to begin intelligence gathering</p>
            <p className="text-dark-600 text-xs mt-1">Try: 8.8.8.8 · 1.1.1.1 · 185.220.101.1</p>
          </div>
        )}
      </div>
    </>
  );
}
