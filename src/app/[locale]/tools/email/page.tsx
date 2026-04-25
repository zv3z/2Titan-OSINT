'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldAlert, AlertCircle, Loader2, Database, CheckCircle, XCircle } from 'lucide-react';
import IntelSearch from '@/components/intel/IntelSearch';
import RiskMeter from '@/components/intel/RiskMeter';
import SourceBadges from '@/components/intel/SourceBadge';
import type { EmailIntelligence, IntelApiResponse, BreachRecord } from '@/lib/intel/types';
import { cn } from '@/lib/utils';

const SEVERITY_CFG = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', label: 'Critical' },
  high:     { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', label: 'High' },
  medium:   { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', label: 'Medium' },
  low:      { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', label: 'Low' },
};

function BreachCard({ breach }: { breach: BreachRecord }) {
  const cfg = SEVERITY_CFG[breach.severity];
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="card p-4"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Database className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-white font-semibold text-sm">{breach.source}</span>
            {breach.isVerified && (
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">Verified</span>
            )}
          </div>
          {breach.date && (
            <span className="text-dark-500 text-xs">{new Date(breach.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
          )}
        </div>
        <span className={cn('text-xs px-2 py-0.5 rounded border font-semibold', cfg.color, cfg.bg)}>
          {cfg.label}
        </span>
      </div>

      {breach.dataTypes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {breach.dataTypes.map((dt) => (
            <span key={dt} className="text-xs bg-dark-800 text-dark-300 px-2 py-0.5 rounded font-mono">{dt}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function EmailToolPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [data, setData] = useState<EmailIntelligence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runSearch = async (email: string) => {
    if (!email.trim()) return;
    setLoading(true); setError(''); setData(null);
    try {
      const res = await fetch(`/api/intel/email?email=${encodeURIComponent(email.trim())}`);
      const json: IntelApiResponse<EmailIntelligence> = await res.json();
      if (!json.success || !json.data) throw new Error(json.error ?? 'Query failed');
      setData(json.data);
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
      <section className="relative pt-28 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="container relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Email Breach Check</h1>
              <p className="text-dark-400 text-sm">Credential leaks · Data breach detection</p>
            </div>
          </div>
          <IntelSearch
            placeholder="Enter an email address to check for breaches"
            initialValue={query}
            onSearch={(v) => { setQuery(v); runSearch(v); }}
          />
        </div>
      </section>

      <div className="container pb-20">
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-20 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-purple-500/20 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-purple-400 animate-spin" />
              </div>
            </div>
            <p className="text-dark-400 text-sm">Scanning breach databases for {query}...</p>
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
                <span className="font-mono text-xl text-white font-bold">{data.query}</span>
                <SourceBadges sources={data.sources} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Risk */}
                <div className="card p-6 flex flex-col items-center">
                  <h3 className="text-white font-semibold text-sm mb-4 self-start flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-brand-400" /> Risk Score
                  </h3>
                  <RiskMeter risk={data.risk} />
                </div>

                {/* Summary */}
                <div className="card p-5">
                  <h3 className="text-white font-semibold text-sm mb-4">Breach Summary</h3>
                  <div className="flex items-center gap-3 mb-4">
                    {data.breaches.found ? (
                      <XCircle className="w-8 h-8 text-red-400 shrink-0" />
                    ) : (
                      <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />
                    )}
                    <div>
                      <p className={cn('font-bold text-lg', data.breaches.found ? 'text-red-400' : 'text-emerald-400')}>
                        {data.breaches.found ? `${data.breaches.count} Breach${data.breaches.count > 1 ? 'es' : ''} Found` : 'No Breaches Found'}
                      </p>
                      <p className="text-dark-400 text-xs">
                        {data.breaches.found ? 'Credentials may be compromised' : 'Email not found in known breaches'}
                      </p>
                    </div>
                  </div>
                  {data.breaches.oldestBreach && <div className="flex justify-between text-xs py-1.5 border-b border-white/5"><span className="text-dark-400">Oldest breach</span><span className="text-white">{new Date(data.breaches.oldestBreach).getFullYear()}</span></div>}
                  {data.breaches.mostRecentBreach && <div className="flex justify-between text-xs py-1.5 border-b border-white/5"><span className="text-dark-400">Most recent</span><span className="text-white">{new Date(data.breaches.mostRecentBreach).toLocaleDateString()}</span></div>}
                  <div className="flex justify-between text-xs py-1.5 border-b border-white/5">
                    <span className="text-dark-400">Disposable email</span>
                    <span className={data.validity.isDisposable ? 'text-red-400' : 'text-emerald-400'}>
                      {data.validity.isDisposable ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                {/* Exposed data types */}
                <div className="card p-5">
                  <h3 className="text-white font-semibold text-sm mb-4">Exposed Data Types</h3>
                  {data.breaches.exposedDataTypes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {data.breaches.exposedDataTypes.map((dt) => (
                        <span key={dt} className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-lg font-medium">
                          {dt}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-dark-500 text-sm">No data exposure detected</p>
                  )}
                </div>
              </div>

              {/* Breach records */}
              {data.breaches.records.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">Breach Records ({data.breaches.count})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.breaches.records.map((b, i) => (
                      <BreachCard key={i} breach={b} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!data && !loading && !error && (
          <div className="text-center py-20">
            <Mail className="w-12 h-12 text-dark-700 mx-auto mb-4" />
            <p className="text-dark-500">Enter an email address to check for data breaches</p>
            <p className="text-dark-600 text-xs mt-1">All queries are encrypted in transit</p>
          </div>
        )}
      </div>
    </>
  );
}
