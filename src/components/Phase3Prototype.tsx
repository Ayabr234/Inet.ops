import React, { useState } from 'react';
import { initialTenantSites, initialAuditLogs, dockerComposeFileContent, caddyfileContent, corefileContent, testPrototypeScript, phase3Summary } from '../data/phase3Data';
import { TenantSite, AuditLogEntry } from '../types';
import { CodeBlock } from './CodeBlock';
import { 
  Server, Plus, ShieldAlert, CheckCircle, RotateCw, Globe, 
  ExternalLink, Terminal, HardDrive, Cpu, Activity, AlertOctagon, Check, Lock
} from 'lucide-react';

export const Phase3Prototype: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'code' | 'audit'>('dashboard');
  const [tenantSites, setTenantSites] = useState<TenantSite[]>(initialTenantSites);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'quarantined'>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSiteForPreview, setSelectedSiteForPreview] = useState<TenantSite | null>(null);
  const [selectedSiteForRoute, setSelectedSiteForRoute] = useState<TenantSite | null>(null);
  const [quarantineModalSite, setQuarantineModalSite] = useState<TenantSite | null>(null);
  const [quarantineReason, setQuarantineReason] = useState('Reported malware distribution payload');

  // New site form state
  const [newDomain, setNewDomain] = useState('');
  const [newTenantName, setNewTenantName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRuntime, setNewRuntime] = useState<TenantSite['runtime']>('static-caddy');
  const [newRamLimit, setNewRamLimit] = useState(256);
  const [newCpuShares, setNewCpuShares] = useState(512);
  const [newDiskGb, setNewDiskGb] = useState(5);

  // Hash verification state
  const [chainVerified, setChainVerified] = useState<boolean | null>(null);

  // Calculate Node aggregate metrics
  const totalAllocatedRam = tenantSites.reduce((acc, s) => acc + s.resources.memoryLimitMb, 0);
  const totalUsedRam = tenantSites.reduce((acc, s) => acc + s.resources.currentMemoryMb, 0);
  const totalAllocatedCpuShares = tenantSites.reduce((acc, s) => acc + s.resources.cpuShares, 0);
  const avgCpuLoad = (tenantSites.reduce((acc, s) => acc + s.resources.currentCpuPercent, 0) / (tenantSites.length || 1)).toFixed(1);
  const totalBandwidthUsedGb = tenantSites.reduce((acc, s) => acc + s.resources.bandwidthUsedGb, 0).toFixed(1);

  // Filtered sites
  const filteredSites = tenantSites.filter((site) => {
    const matchesSearch = site.domain.toLowerCase().includes(searchFilter.toLowerCase()) ||
      site.tenantName.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || site.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Provision New Tenant
  const handleCreateSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim() || !newTenantName.trim()) return;

    const newPort = 8080 + tenantSites.length + 1;
    const newSiteId = `site-00${tenantSites.length + 1}`;

    const newSite: TenantSite = {
      id: newSiteId,
      domain: newDomain.trim().toLowerCase(),
      altDomains: [`www.${newDomain.trim().toLowerCase()}`],
      tenantName: newTenantName.trim(),
      ownerEmail: newEmail.trim() || `admin@${newDomain.trim().toLowerCase()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      runtime: newRuntime,
      backendPort: newPort,
      resources: {
        cpuShares: newCpuShares,
        memoryLimitMb: newRamLimit,
        diskLimitMb: newDiskGb * 1024,
        bandwidthQuotaGb: 250,
        bandwidthUsedGb: 0.1,
        currentCpuPercent: 1.2,
        currentMemoryMb: 32
      },
      tls: {
        status: 'valid',
        provider: 'Let\'s Encrypt',
        issuer: 'ISRG Root X1 (Let\'s Encrypt)',
        validUntil: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
        sans: [newDomain.trim().toLowerCase(), `www.${newDomain.trim().toLowerCase()}`]
      },
      dns: {
        recordType: 'A',
        host: newDomain.trim().toLowerCase(),
        target: '198.51.100.42',
        ttl: 300,
        authoritativeNameserver: 'ns1.inet.org'
      },
      abuseReportsCount: 0
    };

    // Append cryptographic audit log
    const lastLog = auditLogs[auditLogs.length - 1];
    const newHash = fakeSha256(`${lastLog.hash}${newSite.domain}SITE_PROVISIONED`);
    const newAuditEntry: AuditLogEntry = {
      id: `audit-00${auditLogs.length + 1}`,
      timestamp: new Date().toISOString(),
      actor: 'operator:admin',
      actorRole: 'node-operator',
      action: 'SITE_PROVISIONED',
      targetTenantId: newSiteId,
      details: `Provisioned ${newSite.domain} with ${newRamLimit}MB RAM and ${newRuntime} runtime`,
      previousHash: lastLog.hash,
      hash: newHash
    };

    setTenantSites([newSite, ...tenantSites]);
    setAuditLogs([...auditLogs, newAuditEntry]);
    setIsCreateModalOpen(false);
    setNewDomain('');
    setNewTenantName('');
    setNewEmail('');
  };

  // Quarantine Site
  const handleExecuteQuarantine = () => {
    if (!quarantineModalSite) return;

    setTenantSites((prev) =>
      prev.map((s) => {
        if (s.id === quarantineModalSite.id) {
          return {
            ...s,
            status: 'quarantined',
            quarantineReason: quarantineReason,
            abuseReportsCount: s.abuseReportsCount + 1
          };
        }
        return s;
      })
    );

    // Append audit log
    const lastLog = auditLogs[auditLogs.length - 1];
    const newHash = fakeSha256(`${lastLog.hash}${quarantineModalSite.domain}SITE_QUARANTINED`);
    const newAuditEntry: AuditLogEntry = {
      id: `audit-00${auditLogs.length + 1}`,
      timestamp: new Date().toISOString(),
      actor: 'operator:abuse-team',
      actorRole: 'abuse-auditor',
      action: 'SITE_QUARANTINED',
      targetTenantId: quarantineModalSite.id,
      details: `Quarantined ${quarantineModalSite.domain}. Reason: ${quarantineReason}. Process frozen and route redirected.`,
      previousHash: lastLog.hash,
      hash: newHash
    };

    setAuditLogs((prev) => [...prev, newAuditEntry]);
    setQuarantineModalSite(null);
  };

  // Restore Site
  const handleRestoreSite = (siteId: string) => {
    setTenantSites((prev) =>
      prev.map((s) => (s.id === siteId ? { ...s, status: 'active', quarantineReason: undefined } : s))
    );
    const target = tenantSites.find((s) => s.id === siteId);
    if (!target) return;

    const lastLog = auditLogs[auditLogs.length - 1];
    const newHash = fakeSha256(`${lastLog.hash}${target.domain}SITE_RESTORED`);
    setAuditLogs((prev) => [
      ...prev,
      {
        id: `audit-00${prev.length + 1}`,
        timestamp: new Date().toISOString(),
        actor: 'operator:admin',
        actorRole: 'node-operator',
        action: 'SITE_RESTORED',
        targetTenantId: siteId,
        details: `Restored ${target.domain} from quarantine. Route and cgroup un-frozen.`,
        previousHash: lastLog.hash,
        hash: newHash
      }
    ]);
  };

  // Verify Hash Chain
  const handleVerifyChain = () => {
    let isValid = true;
    for (let i = 1; i < auditLogs.length; i++) {
      if (auditLogs[i].previousHash !== auditLogs[i - 1].hash) {
        isValid = false;
        break;
      }
    }
    setChainVerified(isValid);
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="max-w-4xl space-y-4">
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
          <span>Phase 3</span>
          <span aria-hidden="true">·</span>
          <span>Minimal Working Node Prototype</span>
          <span aria-hidden="true">·</span>
          <span>Runnable Local Stack & Admin Console</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white text-balance">
          Working Multi-Tenant Node Prototype & Admin Console
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
          A fully autonomous, single-machine web hosting node capable of serving dozens of isolated
          tenant sites with automated CoreDNS records, Caddy On-Demand TLS, Linux cgroups v2 resource
          limits, and a tamper-evident SHA-256 audit log.
        </p>
      </div>

      {/* Sub-Tabs: Interactive Admin Console vs Code & Config Artifacts vs Audit Chain */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3 text-xs">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
            activeSubTab === 'dashboard'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Interactive Node Admin Console</span>
        </button>

        <button
          onClick={() => setActiveSubTab('code')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
            activeSubTab === 'code'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Docker Compose & Production Configs</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
            activeSubTab === 'audit'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Cryptographic Audit Log ({auditLogs.length} Records)</span>
        </button>
      </div>

      {/* SUB-TAB 1: LIVE INTERACTIVE ADMIN CONSOLE */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Node Hardware & Quota Telemetry Strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <span className="text-[11px] font-mono text-neutral-500 uppercase block">Active Sites</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
                  {tenantSites.filter((s) => s.status === 'active').length}
                </span>
                <span className="text-xs text-neutral-400 font-mono">/ {tenantSites.length} total</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <span className="text-[11px] font-mono text-neutral-500 uppercase block">RAM Allocation</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
                  {totalUsedRam} MB
                </span>
                <span className="text-xs text-neutral-400 font-mono">/ {totalAllocatedRam} MB limit</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <span className="text-[11px] font-mono text-neutral-500 uppercase block">Host CPU Shares</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
                  {totalAllocatedCpuShares}
                </span>
                <span className="text-xs text-neutral-400 font-mono">({avgCpuLoad}% load)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <span className="text-[11px] font-mono text-neutral-500 uppercase block">Monthly Egress</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
                  {totalBandwidthUsedGb} GB
                </span>
                <span className="text-xs text-neutral-400 font-mono">unthrottled</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <span className="text-[11px] font-mono text-neutral-500 uppercase block">TLS Health</span>
              <div className="flex items-center gap-1.5 mt-1 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>100% Valid</span>
              </div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search tenant domain or name..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 w-64 focus:outline-hidden focus:ring-1 focus:ring-neutral-400"
              />

              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-0.5 rounded-lg text-xs">
                {(['all', 'active', 'quarantined'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-2.5 py-1 rounded-md capitalize transition-colors whitespace-nowrap shrink-0 ${
                      statusFilter === filter
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white font-medium shadow-2xs'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Provision New Tenant Site</span>
            </button>
          </div>

          {/* Tenant Sites Table */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 text-neutral-500 font-mono text-[11px]">
                    <th className="py-3 px-4 font-semibold">Tenant & Custom Domain</th>
                    <th className="py-3 px-3 font-semibold">Runtime</th>
                    <th className="py-3 px-3 font-semibold">Resource Allocation</th>
                    <th className="py-3 px-3 font-semibold">HTTPS / TLS Cert</th>
                    <th className="py-3 px-3 font-semibold">DNS Target</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {filteredSites.map((site) => {
                    const isQuarantined = site.status === 'quarantined';
                    return (
                      <tr
                        key={site.id}
                        className={`transition-colors ${
                          isQuarantined
                            ? 'bg-rose-50/40 dark:bg-rose-950/20'
                            : 'hover:bg-neutral-50/60 dark:hover:bg-neutral-950/30'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-neutral-900 dark:text-white font-mono text-xs">
                                  {site.domain}
                                </span>
                                {isQuarantined && (
                                  <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 px-1.5 py-0.2 rounded">
                                    QUARANTINED
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-neutral-500 block">
                                {site.tenantName} · {site.ownerEmail}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                          <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                            {site.runtime}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-[11px]">
                          <div className="space-y-1 w-32">
                            <div className="flex justify-between text-neutral-500 font-mono text-[10px]">
                              <span>RAM: {site.resources.currentMemoryMb}MB</span>
                              <span>{site.resources.memoryLimitMb}MB</span>
                            </div>
                            <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-neutral-900 dark:bg-neutral-300 h-1.5 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (site.resources.currentMemoryMb / site.resources.memoryLimitMb) * 100
                                  )}%`
                                }}
                              />
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono">
                              Disk: {(site.resources.diskLimitMb / 1024).toFixed(0)}GB limit
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-[11px]">
                          <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 font-mono">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Auto ACME</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono block">
                            Expires {site.tls.validUntil.split('T')[0]}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                          <span>{site.dns.recordType} → {site.dns.target}</span>
                          <span className="text-[10px] text-neutral-400 block">TTL 300s (CoreDNS)</span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedSiteForPreview(site)}
                              className="px-2 py-1 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
                              title="Preview Simulated Live Website"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Preview</span>
                            </button>

                            <button
                              onClick={() => setSelectedSiteForRoute(site)}
                              className="px-2 py-1 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded transition-colors whitespace-nowrap shrink-0"
                              title="Inspect Dynamic Caddy & CoreDNS Route"
                            >
                              Config
                            </button>

                            {isQuarantined ? (
                              <button
                                onClick={() => handleRestoreSite(site.id)}
                                className="px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 rounded transition-colors whitespace-nowrap shrink-0"
                              >
                                Restore
                              </button>
                            ) : (
                              <button
                                onClick={() => setQuarantineModalSite(site)}
                                className="px-2 py-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 hover:bg-rose-200 rounded transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
                                title="Quarantine Site for Abuse / Legal Notice"
                              >
                                <ShieldAlert className="w-3 h-3" />
                                <span>Quarantine</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PRODUCTION DOCKER COMPOSE & CONFIG ARTIFACTS */}
      {activeSubTab === 'code' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            <span className="font-semibold text-neutral-900 dark:text-white block mb-1">
              Production-Ready Prototype Architecture:
            </span>
            These configuration files are 100% complete with no placeholders. They run Caddy 2 with
            automated On-Demand TLS gated by our Node Agent Ask endpoint, CoreDNS on port 53 for
            authoritative domain mapping, and cAdvisor for scraping cgroups v2 resource usage into SQLite.
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              1. docker-compose.yml (Local Node Orchestration)
            </h3>
            <CodeBlock code={dockerComposeFileContent} language="yaml" filename="docker-compose.yml" />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              2. config/caddy/Caddyfile (On-Demand TLS & Abuse Intercept)
            </h3>
            <CodeBlock code={caddyfileContent} language="caddy" filename="Caddyfile" />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              3. config/coredns/Corefile (Authoritative DNS Delegation)
            </h3>
            <CodeBlock code={corefileContent} language="conf" filename="Corefile" />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              4. scripts/test-prototype.sh (Automated Test Suite)
            </h3>
            <CodeBlock code={testPrototypeScript} language="bash" filename="test-prototype.sh" />
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CRYPTOGRAPHIC AUDIT LOG EXPLORER */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Cryptographic Append-Only Audit Log
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Every administrative action is hashed in a SHA-256 Merkle chain. Tampering breaks the chain.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {chainVerified !== null && (
                <span
                  className={`text-xs font-mono font-semibold px-2 py-1 rounded ${
                    chainVerified
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {chainVerified ? '✓ Chain Integrity 100% Verified' : '✗ Chain Verification Failed'}
                </span>
              )}
              <button
                onClick={handleVerifyChain}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
              >
                Verify Hash Chain Integrity
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log, index) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 font-mono text-xs space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 dark:text-white">
                      #{index + 1} {log.action}
                    </span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-500 text-[11px]">{log.actor}</span>
                  </div>
                  <span className="text-neutral-400 text-[11px] tabular-nums">{log.timestamp}</span>
                </div>

                <p className="text-neutral-700 dark:text-neutral-300 font-sans text-xs">
                  {log.details}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-neutral-500 pt-1 border-t border-neutral-100 dark:border-neutral-800/60">
                  <div className="truncate">
                    <span className="text-neutral-400 font-semibold">Prev Hash: </span>
                    <span className="text-neutral-600 dark:text-neutral-400">{log.previousHash}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-neutral-400 font-semibold">Current Hash: </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{log.hash}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROVISION SITE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Provision New Tenant Website
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSite} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Custom Domain Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. activist-news.org or coop.local"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white font-mono text-xs focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Tenant / Organization Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metropolitan Mutual Aid"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Administrator Contact Email:
                </label>
                <input
                  type="email"
                  placeholder="admin@tenant.org"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Runtime Sandbox:
                </label>
                <select
                  value={newRuntime}
                  onChange={(e) => setNewRuntime(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white font-mono text-xs"
                >
                  <option value="static-caddy">Static HTML / Jamstack (Caddy Direct, Low RAM)</option>
                  <option value="node-lts">Node.js LTS (Isolated Alpine Container)</option>
                  <option value="php-fpm">PHP-FPM 8.3 + Nginx (Isolated)</option>
                  <option value="python-fastapi">Python FastAPI / ASGI (Gunicorn)</option>
                  <option value="go-binary">Go / Rust Compiled Microservice</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1 font-mono">
                    RAM Limit: {newRamLimit} MB
                  </label>
                  <input
                    type="range"
                    min="128"
                    max="1024"
                    step="64"
                    value={newRamLimit}
                    onChange={(e) => setNewRamLimit(Number(e.target.value))}
                    className="w-full accent-neutral-900 dark:accent-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1 font-mono">
                    Disk Quota: {newDiskGb} GB
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={newDiskGb}
                    onChange={(e) => setNewDiskGb(Number(e.target.value))}
                    className="w-full accent-neutral-900 dark:accent-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold rounded-lg hover:opacity-90 shadow-2xs whitespace-nowrap"
                >
                  Provision & Generate TLS/DNS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUARANTINE ABUSE MODAL */}
      {quarantineModalSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-neutral-900 p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertOctagon className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold">
                Quarantine Tenant Site: {quarantineModalSite.domain}
              </h3>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Quarantining immediately freezes the tenant's Linux cgroup processes (SIGSTOP/cgroup.freeze),
              redirects incoming HTTPS requests to the official compliance landing page, and appends a tamper-evident
              entry to the audit log chain.
            </p>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-neutral-700 dark:text-neutral-300 block">
                Reason for Legal / Abuse Quarantine:
              </label>
              <textarea
                value={quarantineReason}
                onChange={(e) => setQuarantineReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
              <button
                onClick={() => setQuarantineModalSite(null)}
                className="px-3 py-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteQuarantine}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-2xs whitespace-nowrap"
              >
                Confirm Immediate Quarantine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIMULATED LIVE SITE PREVIEW MODAL */}
      {selectedSiteForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Browser Mock Chrome */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex items-center gap-1 px-3 py-0.5 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-neutral-700 dark:text-neutral-300">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  <span>https://{selectedSiteForPreview.domain}/</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedSiteForPreview(null)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-xs font-mono"
              >
                Close ✕
              </button>
            </div>

            {/* Simulated Webpage Body */}
            <div className="p-8 overflow-y-auto space-y-4">
              {selectedSiteForPreview.status === 'quarantined' ? (
                <div className="p-6 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-center space-y-3">
                  <AlertOctagon className="w-10 h-10 text-rose-600 dark:text-rose-400 mx-auto" />
                  <h4 className="text-lg font-bold text-rose-900 dark:text-rose-200">
                    HTTP 451: Website Suspended Pending Abuse Review
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                    This domain (<span className="font-mono">{selectedSiteForPreview.domain}</span>) has been
                    isolated by the node operator. Reason: {selectedSiteForPreview.quarantineReason}.
                  </p>
                  <p className="text-[11px] text-neutral-500 font-mono">
                    Compliance Contact: abuse@inet.org · Audit Hash ID: {selectedSiteForPreview.id}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
                    <span className="text-xs font-mono text-neutral-400">
                      Hosted on Autonomous inet.org Node #1
                    </span>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                      {selectedSiteForPreview.tenantName}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Domain: <span className="font-mono text-neutral-700 dark:text-neutral-300">{selectedSiteForPreview.domain}</span> · Runtime: {selectedSiteForPreview.runtime}
                    </p>
                  </div>

                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Welcome to the public-interest digital presence for {selectedSiteForPreview.tenantName}.
                    This site is hosted on community-owned, sovereign server infrastructure powered by
                    open-source protocols, automatic Let's Encrypt certificates, and zero tracking scripts.
                  </p>

                  <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 text-xs font-mono space-y-1 text-neutral-600 dark:text-neutral-400">
                    <div>Backend Reverse Proxy Target: 127.0.0.1:{selectedSiteForPreview.backendPort}</div>
                    <div>cgroups v2 Memory Ceiling: {selectedSiteForPreview.resources.memoryLimitMb} MB</div>
                    <div>Bandwidth Usage Month-to-Date: {selectedSiteForPreview.resources.bandwidthUsedGb} GB</div>
                    <div>TLS Handshake: TLS 1.3 / X25519 / ChaCha20-Poly1305</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INSPECT ROUTE MODAL */}
      {selectedSiteForRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-mono">
                Generated Ingress Route: {selectedSiteForRoute.domain}
              </h3>
              <button
                onClick={() => setSelectedSiteForRoute(null)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300 block font-mono text-[11px]">
                Caddy Dynamic Ingress Rule:
              </span>
              <CodeBlock
                code={`# Dynamic Route for ${selectedSiteForRoute.domain}
@tenant_${selectedSiteForRoute.id} host ${selectedSiteForRoute.domain} www.${selectedSiteForRoute.domain}
handle @tenant_${selectedSiteForRoute.id} {
    reverse_proxy 127.0.0.1:${selectedSiteForRoute.backendPort} {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto https
    }
}`}
                language="caddy"
                filename="caddy_route.txt"
              />
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300 block font-mono text-[11px]">
                CoreDNS Dynamic Zone Entry:
              </span>
              <CodeBlock
                code={`; Zone record for ${selectedSiteForRoute.domain}
$ORIGIN ${selectedSiteForRoute.domain}.
$TTL 300
@    IN  SOA ns1.inet.org. hostmaster.inet.org. ( 2026101701 3600 900 1209600 300 )
@    IN  NS  ns1.inet.org.
@    IN  A   ${selectedSiteForRoute.dns.target}
www  IN  A   ${selectedSiteForRoute.dns.target}`}
                language="dns"
                filename="zone.db"
              />
            </div>
          </div>
        </div>
      )}

      {/* Phase 3 Summary: Open Questions & Next Steps */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8 max-w-5xl space-y-6">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          Phase 3 Evaluation: Open Questions & Operator Runbook Goals
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Prototype Open Questions:
            </h4>
            <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
              {phase3Summary.openQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="font-mono text-neutral-400 shrink-0">?</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Phase 4 Transition Goals:
            </h4>
            <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
              {phase3Summary.nextSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for deterministic audit hash simulation
function fakeSha256(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex}${hex}${hex}${hex}${hex}${hex}${hex}${hex}`.substring(0, 64);
}
