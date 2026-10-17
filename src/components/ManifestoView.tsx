import React, { useState } from 'react';
import { 
  ArrowRight, Check, Copy, Shield, Layers, Users, BookOpen, 
  Terminal, Sparkles, ExternalLink, Code2, Globe
} from 'lucide-react';
import { CodeBlock } from './CodeBlock';

interface ManifestoViewProps {
  onNavigatePhase: (phaseId: string) => void;
}

export const ManifestoView: React.FC<ManifestoViewProps> = ({ onNavigatePhase }) => {
  const [copiedReadme, setCopiedReadme] = useState(false);

  const fullReadme = `# inet.org

Hosting as public infrastructure. Run your own.

Web hosting is controlled by a handful of companies. inet.org is an open-source, community-governed hosting platform that any group, such as a school, a co-op, or a neighborhood, can deploy and run for itself, with costs shared openly instead of sold at a markup.

## What we’re building
- A full map of how the web stack works (DNS, TLS, routing, storage, isolation, billing, abuse handling)
- Open specs and reference components for each layer
- A self-deployable hosting node with isolated tenants
- Transparent funding and governance tools

## Status
Early stage. Research and architecture first, prototype next. Nothing here is production-ready yet.

## Roadmap
1. Research and mapping
2. Architecture and specifications
3. Prototype node
4. Small pilot
5. Governance and funding model

## Help wanted
Researchers, writers, backend and DevOps developers, security reviewers, designers, and people with legal or nonprofit experience. Check the Issues tab for “good first issue”, or open a discussion with your ideas.

## Principles
- Open by default
- Simple over clever
- Security and abuse handling from the start
- Honest about limits

## License
MIT

---
## Repository Metadata
About: “Open-source, community-run hosting platform. Run your own hosting provider.”
Topics: self-hosting, open-source, web-hosting, infrastructure, decentralized, community-governed, devops, inet
`;

  const handleCopyReadme = () => {
    navigator.clipboard.writeText(fullReadme);
    setCopiedReadme(true);
    setTimeout(() => setCopiedReadme(false), 2000);
  };

  const topics = [
    'self-hosting',
    'open-source',
    'web-hosting',
    'infrastructure',
    'decentralized',
    'community-governed',
    'devops',
    'inet'
  ];

  const helpWantedItems = [
    {
      title: 'Researchers & Writers',
      description: 'Document RFC standards, write plain-language guides for community organizers, and map open-source hosting software.',
      issue: 'Issue #04: Plain-language DNSSEC & BGP peering guide'
    },
    {
      title: 'Backend & DevOps Developers',
      description: 'Refine container isolation (cgroups v2, Seccomp), Caddy dynamic route handlers, CoreDNS plugins, and SQLite accounting.',
      issue: 'Issue #12: Rootless container cgroups v2 resource capping benchmarks'
    },
    {
      title: 'Security Reviewers',
      description: 'Review STRIDE threat model, audit SHA-256 Merkle chain verification, and audit On-Demand TLS verification gates.',
      issue: 'Issue #19: Stress-test Let\'s Encrypt ask-endpoint rate limits'
    },
    {
      title: 'Designers & Frontenders',
      description: 'Craft restrained, highly legible operator interfaces, tenant management consoles, and accessible documentation layouts.',
      issue: 'Issue #07: Clean tenant quota slider controls'
    },
    {
      title: 'Legal & Non-Profit Organizers',
      description: 'Refine DMCA Section 512 & EU DSA safe-harbor compliance, terms of service templates, and cooperative governance bylaws.',
      issue: 'Issue #23: Template dispute arbitration clause for federated nodes'
    }
  ];

  return (
    <div className="space-y-12 max-w-5xl">
      {/* Hero Brand Lockup */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
          <span>inet.org</span>
          <span aria-hidden="true">·</span>
          <span>Community Infrastructure</span>
          <span aria-hidden="true">·</span>
          <span>MIT License</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white text-balance leading-tight">
            Hosting as public infrastructure. Run your own.
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-3xl">
            Web hosting is controlled by a handful of companies. <strong className="text-neutral-900 dark:text-white font-semibold">inet.org</strong> is
            an open-source, community-governed hosting platform that any group, such as a school, a co-op, or a neighborhood, can deploy and run for itself, with costs shared openly instead of sold at a markup.
          </p>
        </div>

        {/* Repository Topics (Unboxed text with dots) */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-500">
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">Topics:</span>
          {topics.map((t, idx) => (
            <React.Fragment key={t}>
              <span className="text-neutral-600 dark:text-neutral-400">#{t}</span>
              {idx < topics.length - 1 && <span className="text-neutral-300 dark:text-neutral-700">·</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* What We're Building Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          What We’re Building
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => onNavigatePhase('phase1')}
            className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white">
                LAYER MAP
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-1">
              Full Map of the Web Stack
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Clear reports, Mermaid diagrams, and real open-source options across DNS, TLS, routing, storage, isolation, billing, and abuse handling.
            </p>
          </div>

          <div
            onClick={() => onNavigatePhase('phase2')}
            className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white">
                OPEN SPECS
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-1">
              Specs & Reference Components
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Architecture document with component diagrams, data flows, OpenAPI 3.1 for the control plane and node agent, and STRIDE threat model.
            </p>
          </div>

          <div
            onClick={() => onNavigatePhase('phase3')}
            className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white">
                PROTOTYPE NODE
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-1">
              Self-Deployable Hosting Node
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              One machine serving multiple isolated tenant sites with automatic DNS records, automatic HTTPS, per-tenant resource limits, and admin dashboard.
            </p>
          </div>

          <div
            onClick={() => onNavigatePhase('phase5')}
            className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-700 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white">
                GOVERNANCE & COSTS
              </span>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-1">
              Transparent Funding & Governance
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Cost per CPU-hour, storage, and bandwidth accounting, donation and grant ledger, proposal voting system, and operator terms of service.
            </p>
          </div>
        </div>
      </div>

      {/* Status & Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 space-y-2">
          <span className="text-xs font-mono uppercase font-bold text-neutral-500 block">
            Status
          </span>
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
            Early stage. Research and architecture first, prototype next.
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Nothing here is production-ready yet. We are mapping every layer and validating working components locally before deploying small community pilots.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 space-y-2">
          <span className="text-xs font-mono uppercase font-bold text-neutral-500 block">
            Principles
          </span>
          <ul className="text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
            <li><span className="font-semibold text-neutral-900 dark:text-white">· Open by default:</span> MIT licensed code and transparent documentation.</li>
            <li><span className="font-semibold text-neutral-900 dark:text-white">· Simple over clever:</span> Maintainable by volunteer teams and co-ops.</li>
            <li><span className="font-semibold text-neutral-900 dark:text-white">· Security & abuse handling:</span> Hardened boundaries and quarantine from the start.</li>
            <li><span className="font-semibold text-neutral-900 dark:text-white">· Honest about limits:</span> Transparent about capacity, bandwidth, and legal boundaries.</li>
          </ul>
        </div>
      </div>

      {/* Roadmap Strip */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Roadmap
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          {[
            { phase: 'Phase 1', title: 'Research & mapping', id: 'phase1' },
            { phase: 'Phase 2', title: 'Architecture & specifications', id: 'phase2' },
            { phase: 'Phase 3', title: 'Prototype node', id: 'phase3' },
            { phase: 'Phase 4', title: 'Small pilot', id: 'phase4' },
            { phase: 'Phase 5', title: 'Governance & funding', id: 'phase5' },
          ].map((item, idx) => (
            <button
              key={item.id}
              onClick={() => onNavigatePhase(item.id)}
              className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-left hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
            >
              <span className="font-mono text-[11px] text-neutral-400 font-bold block mb-1">
                {idx + 1}. {item.phase}
              </span>
              <span className="font-semibold text-neutral-900 dark:text-white block">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Help Wanted Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Help Wanted
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Researchers, writers, backend and DevOps developers, security reviewers, designers, and people with legal or nonprofit experience.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {helpWantedItems.map((item) => (
            <div
              key={item.title}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2 flex flex-col justify-between shadow-2xs"
            >
              <div className="space-y-1">
                <h3 className="font-bold text-xs text-neutral-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-[11px] font-mono text-neutral-500">
                {item.issue}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Copyable README.md Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Repository README.md
          </h2>
          <button
            onClick={handleCopyReadme}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-2xs"
          >
            {copiedReadme ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy README.md</span>
              </>
            )}
          </button>
        </div>

        <CodeBlock code={fullReadme} language="markdown" filename="README.md" />
      </div>
    </div>
  );
};
