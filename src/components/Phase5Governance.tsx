import React, { useState } from 'react';
import { phase5Governance } from '../data/phase5Data';
import { GovernanceProposal } from '../types';
import { CodeBlock } from './CodeBlock';
import { 
  Calculator, DollarSign, Vote, ShieldCheck, Scale, FileText, CheckCircle2, 
  ThumbsUp, ThumbsDown, Check, ArrowRight
} from 'lucide-react';

export const Phase5Governance: React.FC = () => {
  const [proposals, setProposals] = useState<GovernanceProposal[]>(phase5Governance.activeProposals);
  const [userVotedIds, setUserVotedIds] = useState<Record<string, 'for' | 'against'>>({});

  // Sustainability Calculator State
  const [hardwareAmortization, setHardwareAmortization] = useState(45);
  const [coloPower, setColoPower] = useState(65);
  const [bandwidthCommit, setBandwidthCommit] = useState(30);
  const [adminOverhead, setAdminOverhead] = useState(10);
  const [tenantCapacity, setTenantCapacity] = useState(50);
  const [hostCores, setHostCores] = useState(16);
  const [hostRamGb, setHostRamGb] = useState(64);
  const [hostStorageGb, setHostStorageGb] = useState(2000);

  const totalMonthlyCost = hardwareAmortization + coloPower + bandwidthCommit + adminOverhead;
  const breakEvenPerTenant = (totalMonthlyCost / (tenantCapacity || 1)).toFixed(2);
  const costPerCpuCoreMonth = ((hardwareAmortization * 0.5 + coloPower * 0.4) / hostCores).toFixed(2);
  const costPerRamGbMonth = ((hardwareAmortization * 0.3 + coloPower * 0.4) / (hostRamGb * 0.9)).toFixed(2);
  const costPerStorageGbMonth = ((hardwareAmortization * 0.2 + adminOverhead) / hostStorageGb).toFixed(3);

  // Voting handler
  const handleVote = (proposalId: string, choice: 'for' | 'against') => {
    if (userVotedIds[proposalId]) return;

    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          return {
            ...p,
            votesFor: choice === 'for' ? p.votesFor + 1 : p.votesFor,
            votesAgainst: choice === 'against' ? p.votesAgainst + 1 : p.votesAgainst
          };
        }
        return p;
      })
    );

    setUserVotedIds((prev) => ({ ...prev, [proposalId]: choice }));
  };

  return (
    <div className="space-y-10">
      {/* Editorial Header */}
      <div className="max-w-4xl space-y-4">
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
          <span>Phase 5</span>
          <span aria-hidden="true">·</span>
          <span>Democratic Governance & Transparent Sustainability</span>
          <span aria-hidden="true">·</span>
          <span>Cooperative Public Utility Model</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white text-balance">
          Transparent Resource Accounting, Public Ledgers & Democratic Governance
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl">
          Web hosting becomes public infrastructure only when its finances, governance, and terms of service
          are democratically governed and mathematically auditable. We eliminate predatory cloud markups
          by grounding costs in physical hardware amortization and transparent community contributions.
        </p>
      </div>

      {/* 1. Interactive Sustainability & Cost Calculator */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              1. Transparent Node Cost Accounting Calculator
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            Cost Recovery + 0% Commercial Markup
          </span>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1.5 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800">
            <div className="flex justify-between font-mono">
              <span className="text-neutral-600 dark:text-neutral-400">Hardware Amortization:</span>
              <span className="font-bold text-neutral-900 dark:text-white">${hardwareAmortization}/mo</span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              step="5"
              value={hardwareAmortization}
              onChange={(e) => setHardwareAmortization(Number(e.target.value))}
              className="w-full accent-neutral-900 dark:accent-white"
            />
            <span className="text-[10px] text-neutral-400 block">4-year hardware replacement cycle</span>
          </div>

          <div className="space-y-1.5 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800">
            <div className="flex justify-between font-mono">
              <span className="text-neutral-600 dark:text-neutral-400">Rack Colo & Power:</span>
              <span className="font-bold text-neutral-900 dark:text-white">${coloPower}/mo</span>
            </div>
            <input
              type="range"
              min="30"
              max="200"
              step="5"
              value={coloPower}
              onChange={(e) => setColoPower(Number(e.target.value))}
              className="w-full accent-neutral-900 dark:accent-white"
            />
            <span className="text-[10px] text-neutral-400 block">1U rack + 150W energy in community IXP</span>
          </div>

          <div className="space-y-1.5 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800">
            <div className="flex justify-between font-mono">
              <span className="text-neutral-600 dark:text-neutral-400">Bandwidth Transit:</span>
              <span className="font-bold text-neutral-900 dark:text-white">${bandwidthCommit}/mo</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={bandwidthCommit}
              onChange={(e) => setBandwidthCommit(Number(e.target.value))}
              className="w-full accent-neutral-900 dark:accent-white"
            />
            <span className="text-[10px] text-neutral-400 block">1 Gbps fiber port commit</span>
          </div>

          <div className="space-y-1.5 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800">
            <div className="flex justify-between font-mono">
              <span className="text-neutral-600 dark:text-neutral-400">Tenant Capacity:</span>
              <span className="font-bold text-neutral-900 dark:text-white">{tenantCapacity} sites</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={tenantCapacity}
              onChange={(e) => setTenantCapacity(Number(e.target.value))}
              className="w-full accent-neutral-900 dark:accent-white"
            />
            <span className="text-[10px] text-neutral-400 block">Sites hosted simultaneously</span>
          </div>
        </div>

        {/* Calculated Unit Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          <div className="p-3.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-900 text-white dark:bg-neutral-950 col-span-2 md:col-span-1">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">
              Break-Even / Site
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
              ${breakEvenPerTenant}
              <span className="text-xs text-neutral-400 font-sans font-normal"> / mo</span>
            </div>
            <span className="text-[10px] text-neutral-400 block mt-0.5">Voluntary suggested donation</span>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block">Total Node Cost</span>
            <div className="text-lg font-bold font-mono text-neutral-900 dark:text-white mt-1 tabular-nums">
              ${totalMonthlyCost}.00 <span className="text-xs text-neutral-400 font-normal">/ mo</span>
            </div>
            <span className="text-[10px] text-neutral-400 block mt-0.5">Combined physical expenses</span>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block">Cost / vCPU Core</span>
            <div className="text-lg font-bold font-mono text-neutral-900 dark:text-white mt-1 tabular-nums">
              ${costPerCpuCoreMonth} <span className="text-xs text-neutral-400 font-normal">/ mo</span>
            </div>
            <span className="text-[10px] text-neutral-400 block mt-0.5">vs $30+ AWS t3.xlarge</span>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block">Cost / GB RAM</span>
            <div className="text-lg font-bold font-mono text-neutral-900 dark:text-white mt-1 tabular-nums">
              ${costPerRamGbMonth} <span className="text-xs text-neutral-400 font-normal">/ mo</span>
            </div>
            <span className="text-[10px] text-neutral-400 block mt-0.5">ECC DDR4/DDR5</span>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40">
            <span className="text-[10px] font-mono uppercase text-neutral-500 block">Cost / GB NVMe</span>
            <div className="text-lg font-bold font-mono text-neutral-900 dark:text-white mt-1 tabular-nums">
              ${costPerStorageGbMonth} <span className="text-xs text-neutral-400 font-normal">/ mo</span>
            </div>
            <span className="text-[10px] text-neutral-400 block mt-0.5">RAID-1 Enterprise SSD</span>
          </div>
        </div>
      </div>

      {/* 2. Public Dual-Entry Grant & Donation Ledger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              2. Public Transparent Financial Ledger
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-500">Cryptographically Signed · Open to All</span>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 text-neutral-500 font-mono text-[11px]">
                  <th className="py-2.5 px-4 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-4 font-semibold">Entity / Source</th>
                  <th className="py-2.5 px-4 font-semibold">Description</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Amount (USD)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                {phase5Governance.donationGrantLedger.map((tx) => {
                  const isPositive = tx.amountUsd > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-950/30">
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                        {tx.date}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            tx.type === 'grant'
                              ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                              : tx.type === 'donation'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-neutral-900 dark:text-white">
                        {tx.counterparty}
                      </td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300 text-xs">
                        {tx.description}
                      </td>
                      <td
                        className={`py-3 px-4 font-mono text-right tabular-nums font-semibold ${
                          isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-white'
                        }`}
                      >
                        {isPositive ? `+$${tx.amountUsd.toFixed(2)}` : `-$${Math.abs(tx.amountUsd).toFixed(2)}`}
                      </td>
                      <td className="py-3 px-4 font-mono text-right tabular-nums text-neutral-500 font-medium">
                        ${tx.balanceAfterUsd.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Democratic Proposal & Voting System */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              3. Cooperative Governance & Proposal Voting
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-500">1 Member, 1 Vote · Binding Operator Consensus</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {proposals.map((prop) => {
            const userVote = userVotedIds[prop.id];
            const totalVotes = prop.votesFor + prop.votesAgainst;
            const approvalRate = Math.round((prop.votesFor / (totalVotes || 1)) * 100);
            const isQuorumMet = totalVotes >= prop.quorumNeeded;

            return (
              <div
                key={prop.id}
                className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between shadow-2xs space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                      {prop.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase ${
                        prop.status === 'passed'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {prop.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white leading-snug">
                    {prop.title}
                  </h3>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {prop.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono text-neutral-500 mb-1">
                      <span>Approval: {approvalRate}%</span>
                      <span>
                        {totalVotes} / {prop.quorumNeeded} quorum {isQuorumMet ? '✓' : ''}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{ width: `${approvalRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(prop.id, 'for')}
                      disabled={Boolean(userVote) || prop.status === 'passed'}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-colors text-xs flex items-center justify-center gap-1.5 ${
                        userVote === 'for'
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                      } ${prop.status === 'passed' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Support ({prop.votesFor})</span>
                    </button>

                    <button
                      onClick={() => handleVote(prop.id, 'against')}
                      disabled={Boolean(userVote) || prop.status === 'passed'}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-colors text-xs flex items-center justify-center gap-1.5 ${
                        userVote === 'against'
                          ? 'bg-rose-600 text-white font-bold'
                          : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                      } ${prop.status === 'passed' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsDown className="w-3 h-3" />
                      <span>Oppose ({prop.votesAgainst})</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Abuse & Moderation Policy Matrix */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            4. Abuse, Legal Tiers & Moderation Protocols
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {phase5Governance.abuseAndModerationPolicy.escalationTiers.map((tier, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2 shadow-2xs"
            >
              <h3 className="font-bold text-xs text-neutral-900 dark:text-white font-mono">
                {tier.tier}
              </h3>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-0.5">
                  Scope & Violations:
                </span>
                {tier.scope}
              </div>
              <div className="pt-2 text-xs text-neutral-600 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-0.5">
                  Standard Operating Protocol:
                </span>
                {tier.protocol}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Operator Terms of Service & AUP Legal Template */}
      <div className="space-y-4 max-w-5xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              5. Operator Terms of Service (TOS) & AUP Legal Template
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-500">Public Domain / CC0 Ready</span>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          This legal document provides clear safe-harbor protection under Section 512 of the DMCA and
          Article 6 of the EU Digital Services Act, explicitly outlining acceptable public infrastructure use.
        </p>

        <CodeBlock
          code={phase5Governance.termsOfServiceTemplate}
          language="markdown"
          filename="OPERATOR_TERMS_OF_SERVICE.md"
        />
      </div>

      {/* Final Cooperative Vision Callout */}
      <div className="p-6 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-900 text-white dark:bg-neutral-950 space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500 text-neutral-950 uppercase tracking-wider">
            Public Infrastructure Vision
          </span>
          <span className="text-sm font-semibold text-neutral-200">
            Reclaiming the Digital Commons
          </span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed max-w-3xl">
          By combining permissive open-source components, memory-safe proxies, hardened Linux kernel cgroups,
          and transparent cooperative accounting, <span className="font-semibold text-white">inet.org</span> proves
          that web hosting does not belong to corporate monopolies. It belongs to the communities who use it.
        </p>
      </div>
    </div>
  );
};
