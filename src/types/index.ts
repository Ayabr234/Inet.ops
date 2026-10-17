export interface LayerEvaluation {
  id: string;
  name: string;
  tagline: string;
  plainLanguage: string;
  mermaidDiagram: string;
  options: {
    name: string;
    license: string;
    repoOrWebsite: string;
    pros: string[];
    cons: string[];
    communityFit: string;
  }[];
  recommendation: {
    chosen: string;
    reasoning: string;
    limitsAndTradeoffs: string;
    federationReadiness: string;
  };
}

export interface TenantSite {
  id: string;
  domain: string;
  altDomains: string[];
  tenantName: string;
  ownerEmail: string;
  status: 'active' | 'provisioning' | 'quarantined' | 'suspended';
  createdAt: string;
  runtime: 'static-caddy' | 'node-lts' | 'php-fpm' | 'python-fastapi' | 'go-binary';
  backendPort: number;
  resources: {
    cpuShares: number; // e.g. 512 (out of 1024)
    memoryLimitMb: number; // e.g. 256
    diskLimitMb: number; // e.g. 5120 (5GB)
    bandwidthQuotaGb: number; // monthly GB
    bandwidthUsedGb: number;
    currentCpuPercent: number;
    currentMemoryMb: number;
  };
  tls: {
    status: 'valid' | 'issuing' | 'expired' | 'error';
    provider: 'Let\'s Encrypt' | 'Internal Step-CA';
    issuer: string;
    validUntil: string;
    sans: string[];
  };
  dns: {
    recordType: 'A' | 'AAAA' | 'CNAME';
    host: string;
    target: string;
    ttl: number;
    authoritativeNameserver: string;
  };
  abuseReportsCount: number;
  quarantineReason?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: 'node-operator' | 'tenant-admin' | 'automated-system' | 'abuse-auditor';
  action: string;
  targetTenantId?: string;
  details: string;
  previousHash: string;
  hash: string;
}

export interface GovernanceProposal {
  id: string;
  title: string;
  author: string;
  category: 'architecture' | 'quota-policy' | 'funding' | 'federation' | 'abuse-rules';
  description: string;
  votesFor: number;
  votesAgainst: number;
  quorumNeeded: number;
  status: 'active' | 'passed' | 'rejected' | 'under-review';
  deadline: string;
  discussionSummary: string;
}

export interface CostAccountingMetrics {
  hardwareMonthlyCostUsd: number;
  powerAndColocationMonthlyUsd: number;
  bandwidthTransitMonthlyUsd: number;
  domainAndRegistryMonthlyUsd: number;
  hardwareDepreciationMonths: number;
  totalVcpuCores: number;
  totalRamGb: number;
  totalStorageGb: number;
  monthlyBandwidthTb: number;
}
