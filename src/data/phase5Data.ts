import { GovernanceProposal } from '../types';

export const phase5Governance = {
  title: 'Phase 5: Democratic Governance, Cost Accounting & Legal Framework',
  resourceAccountingFormula: {
    description: 'Unlike commercial hyperscalers that bundle hidden markups, inet.org computes exact cost recovery using transparent physical cost attribution:',
    equations: [
      {
        metric: 'Compute Cost ($ / CPU-core-month)',
        formula: 'C_{cpu} = \\frac{\\text{Server Hardware Depreciation} + \\text{Rack Colocation} + \\text{Electricity}}{\\text{Total Host Cores} \\times \\text{Target Overcommit Factor (1.25)}}',
        typicalValue: '$3.50 – $5.00 per vCPU-month'
      },
      {
        metric: 'Memory Cost ($ / GB-month)',
        formula: 'C_{ram} = \\frac{\\text{RAM Hardware Cost} + \\text{Cooling Proportion}}{\\text{Total RAM GB} \\times 0.90 \\text{ (10% Host Headroom)}}',
        typicalValue: '$0.40 – $0.75 per GB-month'
      },
      {
        metric: 'Storage Cost ($ / GB-month)',
        formula: 'C_{disk} = \\frac{\\text{NVMe SSD Amortization} + \\text{RAID-1 Redundancy Overhead} + \\text{Offsite Backup}}{\\text{Usable Storage GB}}',
        typicalValue: '$0.03 – $0.06 per GB-month'
      },
      {
        metric: 'Bandwidth Egress ($ / TB)',
        formula: 'C_{bw} = \\frac{\\text{Upstream Transit Fiber Port Cost}}{\\text{Total Monthly Egress Commits}}',
        typicalValue: '$1.00 – $2.50 per TB (or flat-rate community peering)'
      }
    ],
    sampleNodeBudgetMonthly: {
      hardwareDepreciation: 45.0, // 4-year amortized $2160 Dell PowerEdge or AMD EPYC workstation
      datacenterColoAndPower: 65.0, // 1U rack slot with 150W power in cooperative or university IXP
      upstreamTransit1G: 30.0, // 1Gbps unmetered burst commit
      domainAndAdminOverhead: 10.0, // node domain registration + insurance
      totalMonthlyCost: 150.0,
      capacityTenants: 50,
      breakevenPerTenantMonthly: 3.0 // $3.00/month average suggested donation per tenant site!
    }
  },

  donationGrantLedger: [
    {
      id: 'tx-2026-001',
      date: '2026-09-01',
      type: 'grant',
      counterparty: 'Open Technology Fund / NLnet Foundation',
      description: 'Civic Infrastructure Pilot Grant (Hardware acquisition & offsite storage node)',
      amountUsd: 5000.0,
      balanceAfterUsd: 5000.0,
      verifiedSha256: '8b9c102938471092837461928374619283746192837461928374619283746192'
    },
    {
      id: 'tx-2026-002',
      date: '2026-09-10',
      type: 'expense',
      counterparty: 'Hardware Supplier (AMD EPYC 16-Core, 64GB ECC, 2x 2TB NVMe)',
      description: 'Node hardware purchase & ECC memory for primary node-01',
      amountUsd: -2150.0,
      balanceAfterUsd: 2850.0,
      verifiedSha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b'
    },
    {
      id: 'tx-2026-003',
      date: '2026-10-01',
      type: 'expense',
      counterparty: 'Community Internet Exchange (IXP) Colocation',
      description: '1U colocation, dual A+B power feeds & 1Gbps upstream transit for October 2026',
      amountUsd: -95.0,
      balanceAfterUsd: 2755.0,
      verifiedSha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
    },
    {
      id: 'tx-2026-004',
      date: '2026-10-15',
      type: 'donation',
      counterparty: 'Community Member Micro-Donations (42 supporters via Open Collective)',
      description: 'Monthly voluntary solidarity contributions',
      amountUsd: 380.0,
      balanceAfterUsd: 3135.0,
      verifiedSha256: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d'
    }
  ],

  activeProposals: [
    {
      id: 'prop-001',
      title: 'Adopt Garage S3 for Cross-Node Backup Federation',
      author: 'elena@coop-mesh.net',
      category: 'federation',
      description: 'Deploy Garage S3 daemon across 5 pilot community nodes to cross-replicate encrypted tenant backups with zero recurring cloud storage fees.',
      votesFor: 84,
      votesAgainst: 6,
      quorumNeeded: 60,
      status: 'passed',
      deadline: '2026-10-25',
      discussionSummary: 'Wide consensus reached. Benchmarks show negligible CPU impact (~15MB RAM per node).'
    },
    {
      id: 'prop-002',
      title: 'Increase Default RAM Quota to 512MB for All Community Sites',
      author: 'marcus@civic-press.org',
      category: 'quota-policy',
      description: 'Raise the base free quota from 256MB to 512MB to allow modern lightweight static generators and headless CMS instances without swapping.',
      votesFor: 62,
      votesAgainst: 18,
      quorumNeeded: 60,
      status: 'active',
      deadline: '2026-11-01',
      discussionSummary: 'Debate centered on server headroom: operators on 4GB VPS worried about saturation, while dedicated server operators endorsed the increase.'
    },
    {
      id: 'prop-003',
      title: 'Establish 48-Hour Notice Window for Non-Emergency DMCA Inquiries',
      author: 'legal-working-group@inet.org',
      category: 'abuse-rules',
      description: 'Standardize operator response to copyright notices: provide tenant 48 hours to counter-notice before takedown, except for verified malware/CSAM which remains immediate zero-tolerance.',
      votesFor: 92,
      votesAgainst: 3,
      quorumNeeded: 60,
      status: 'passed',
      deadline: '2026-10-15',
      discussionSummary: 'Aligns with EU Digital Services Act and US Section 512 safe harbor procedures.'
    }
  ] as GovernanceProposal[],

  abuseAndModerationPolicy: {
    principles: [
      'Zero Tolerance for Harm: Immediate automated takedown for CSAM, violent extremism, ransomware, credential phishing, and DDoS command-and-control.',
      'Proportionality & Notice: For copyright, defamation, or content disputes, tenants are notified with evidence and given a defined counter-notice window prior to suspension.',
      'Preservation of Evidence: Quarantined sites are frozen in place with cryptographic disk snapshots rather than erased, ensuring auditability and dispute resolution.',
      'Cryptographic Transparency: Every moderation or quarantine event is logged in the publicly verifiable SHA-256 audit log chain.'
    ],
    escalationTiers: [
      {
        tier: 'Tier 1: Immediate Emergency Quarantine (< 5 minutes)',
        scope: 'CSAM, phishing kits, malware payloads, active DDoS bots.',
        protocol: 'Automated or single-operator emergency kill switch. Cgroup frozen, Caddy redirected to legal quarantine page, upstream registrar and abuse contacts notified.'
      },
      {
        tier: 'Tier 2: Technical Abuse & Quota Exceedance (< 24 hours)',
        scope: 'Accidental resource starvation, outbound email spam, scraping loops.',
        protocol: 'Automated CPU/bandwidth throttling via cgroups v2; notification sent to tenant administrator; grace period of 48 hours to remediate.'
      },
      {
        tier: 'Tier 3: Content Disputes & Copyright (48–72 hours)',
        scope: 'DMCA notices, trademark claims, alleged defamation.',
        protocol: 'Notice-and-notice flow. Forwarded to tenant owner with cryptographic timestamp. If valid counter-notice filed, dispute escalates to community council.'
      }
    ]
  },

  termsOfServiceTemplate: `# inet.org Community Node Operator Terms of Service (TOS) & Acceptable Use Policy (AUP)
Version 1.0 (Public Domain / CC0)

1. Purpose and Philosophy
This hosting node is operated as open community infrastructure by [OPERATOR_NAME / COOPERATIVE_NAME] for the public good. We believe that sovereign communication, freedom of expression, and independent digital autonomy require hosting infrastructure that is not controlled by monopolistic entities.

2. Permitted Use
This node is provided for personal websites, non-profit organizations, civic initiatives, cooperative enterprises, public interest journalism, and educational projects.

3. Prohibited Conduct (Zero-Tolerance)
Tenants agree NEVER to use this service for:
  a. Child sexual abuse material (CSAM) or exploitation of any kind.
  b. Distribution of malware, trojans, ransomware, or keyloggers.
  c. Phishing, deceptive social engineering, or credential harvesting.
  d. Denial of Service (DoS/DDoS) attacks, network scanning, or unauthorized probing.
  e. Unsolicited bulk commercial email (SPAM) or unauthorized open relays.
Violations of Section 3 result in IMMEDIATE, PERMANENT QUARANTINE and referral to legal authorities where mandated by law.

4. Resource Limits & Fair Share
To ensure equal access for all community members, each site is assigned hard resource ceilings (CPU shares, RAM ceiling, NVMe disk quota, and monthly bandwidth limit). Attempting to bypass kernel cgroups or execute kernel exploit payloads will trigger automatic isolation.

5. Data Sovereignty & Backups
The operator performs best-effort automated daily encrypted snapshots. However, community hosting is a collaborative endeavor: tenants are strongly urged to retain their own independent offline backups of their website code and databases.

6. Cost Sharing & Sustainability
This node operates on a transparent, cost-recovery model. Operating expenses are published in the open ledger. While basic tiers may be supported through community grants and donations, sustained operations rely on collective solidarity.

7. Takedown & Dispute Resolution
The operator adheres to international safe-harbor standards. Inquiries and abuse notifications must be submitted cryptographically or via email to [ABUSE_CONTACT_EMAIL]. Verified emergency threats are quarantined immediately; all other disputes are subject to the inet.org Democratic Dispute Resolution Protocol.
`
};
