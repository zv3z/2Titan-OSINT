'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Wifi, Globe, Mail, Hash, Shield, Activity, TrendingUp,
  ArrowRight, Database, Zap, Clock
} from 'lucide-react';
import IntelSearch from '@/components/intel/IntelSearch';
import { useRouter } from 'next/navigation';

const TOOLS = [
  {
    icon: Wifi,   label: 'IP Intelligence',  desc: 'Reputation, geo, threat context',
    path: '/tools/ip',     color: 'text-cyan-400',   bg: 'bg-cyan-500/15 border-cyan-500/30',   examples: ['8.8.8.8', '1.1.1.1'],
  },
  {
    icon: Globe,  label: 'Domain Analysis',  desc: 'WHOIS, DNS, threat verdict',
    path: '/tools/domain', color: 'text-brand-400',  bg: 'bg-brand-500/15 border-brand-500/30', examples: ['github.com', 'google.com'],
  },
  {
    icon: Mail,   label: 'Email Breach Check', desc: 'Credential leak detection',
    path: '/tools/email',  color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30', examples: ['user@example.com'],
  },
  {
    icon: Hash,   label: 'Hash Analysis',    desc: 'Malware & file reputation',
    path: '/tools',        color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30', examples: ['MD5 · SHA256'],
    comingSoon: true,
  },
];

const STATS = [
  { icon: Database, label: 'Intelligence Sources', value: '8', sub: 'APIs connected' },
  { icon: Shield,   label: 'Threat Signatures',    value: '50M+', sub: 'Known IOCs' },
  { icon: Activity, label: 'Cache Hit Rate',        value: '~60%', sub: 'Faster queries' },
  { icon: Zap,      label: 'Avg Query Time',        value: '<3s', sub: 'Parallel fetching' },
];

const APIS = [
  { name: 'VirusTotal',    envKey: 'VIRUSTOTAL_API_KEY',    color: 'text-blue-400' },
  { name: 'AbuseIPDB',     envKey: 'ABUSEIPDB_API_KEY',     color: 'text-red-400' },
  { name: 'GreyNoise',     envKey: 'GREYNOISE_API_KEY',     color: 'text-emerald-400' },
  { name: 'AlienVault OTX', envKey: 'OTX_API_KEY',          color: 'text-orange-400' },
  { name: 'WHOISXML',      envKey: 'WHOISXML_API_KEY',      color: 'text-cyan-400' },
  { name: 'LeakCheck',     envKey: 'LEAKCHECK_API_KEY',     color: 'text-purple-400' },
  { name: 'URLScan',       envKey: 'URLSCAN_API_KEY',       color: 'text-yellow-400' },
  { name: 'Censys',        envKey: 'CENSYS_API_ID',         color: 'text-pink-400' },
];

export default function DashboardPage() {
  const locale = useLocale();
  const router = useRouter();

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero search */}
      <section className="relative overflow-hidden mb-12">
        <div className="absolute inset-0 bg-glow-gradient opacity-50" />
        <div className="container relative z-10 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <span className="badge-green mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              Intelligence Dashboard
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              What are you <span className="gradient-text">investigating?</span>
            </h1>
            <p className="text-dark-400 text-lg">IP · Domain · Email · Hash — auto-detected</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <IntelSearch size="lg" />
          </motion.div>
        </div>
      </section>

      <div className="container space-y-10">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="card p-5 text-center"
              >
                <Icon className="w-6 h-6 text-brand-400 mx-auto mb-2" />
                <div className="text-2xl font-bold gradient-text mb-0.5">{stat.value}</div>
                <div className="text-white text-xs font-medium">{stat.label}</div>
                <div className="text-dark-500 text-xs">{stat.sub}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Tool cards */}
        <div>
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-400" /> Intelligence Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TOOLS.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className="card p-5 group cursor-pointer"
                  onClick={() => !tool.comingSoon && router.push(`/${locale}${tool.path}`)}
                >
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${tool.bg} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${tool.color}`} />
                  </div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-white font-semibold text-sm">{tool.label}</h3>
                    {tool.comingSoon && (
                      <span className="text-xs bg-dark-800 text-dark-500 px-1.5 py-0.5 rounded border border-white/5">Soon</span>
                    )}
                  </div>
                  <p className="text-dark-400 text-xs mb-3">{tool.desc}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tool.examples.map((ex) => (
                      <button
                        key={ex}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!tool.comingSoon) {
                            router.push(`/${locale}${tool.path}?q=${encodeURIComponent(ex)}`);
                          }
                        }}
                        className="text-xs font-mono bg-dark-800/80 text-dark-400 hover:text-white px-2 py-0.5 rounded transition-colors"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                  {!tool.comingSoon && (
                    <Link
                      href={`/${locale}${tool.path}`}
                      className={`inline-flex items-center gap-1 text-xs font-medium ${tool.color} group-hover:gap-2 transition-all`}
                    >
                      Open tool <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* API Status */}
        <div>
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-400" /> Intelligence Sources
          </h2>
          <div className="card p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {APIS.map((api, i) => (
                <motion.div
                  key={api.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-center gap-2.5 p-3 rounded-lg bg-dark-800/40 border border-white/5"
                >
                  <span className={`w-2 h-2 rounded-full ${api.color.replace('text-', 'bg-')}`} />
                  <span className="text-white text-xs font-medium">{api.name}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-dark-500 text-xs mt-4">
              Configure API keys in <code className="text-brand-400 font-mono">.env.local</code> to activate each source.
              Queries automatically fall back gracefully when keys are missing.
            </p>
          </div>
        </div>

        {/* Quick examples */}
        <div className="card p-6">
          <h2 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-400" /> Quick Examples
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '8.8.8.8', path: '/tools/ip?q=8.8.8.8' },
              { label: '185.220.101.1', path: '/tools/ip?q=185.220.101.1' },
              { label: 'github.com', path: '/tools/domain?q=github.com' },
              { label: 'malware.com', path: '/tools/domain?q=malware.com' },
            ].map((ex) => (
              <Link
                key={ex.label}
                href={`/${locale}${ex.path}`}
                className="font-mono text-xs bg-dark-800/80 border border-white/5 text-brand-400 hover:border-brand-500/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                {ex.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
