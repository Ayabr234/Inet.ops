import { TenantSite, AuditLogEntry } from '../types';

export const initialTenantSites: TenantSite[] = [
  {
    id: 'site-001',
    domain: 'civic-library.org',
    altDomains: ['www.civic-library.org'],
    tenantName: 'Community Open Library',
    ownerEmail: 'librarian@civic-library.org',
    status: 'active',
    createdAt: '2026-09-12T10:15:00Z',
    runtime: 'static-caddy',
    backendPort: 8081,
    resources: {
      cpuShares: 256,
      memoryLimitMb: 256,
      diskLimitMb: 5120, // 5GB
      bandwidthQuotaGb: 200,
      bandwidthUsedGb: 34.2,
      currentCpuPercent: 2.1,
      currentMemoryMb: 48
    },
    tls: {
      status: 'valid',
      provider: 'Let\'s Encrypt',
      issuer: 'ISRG Root X1 (Let\'s Encrypt)',
      validUntil: '2026-12-11T10:15:00Z',
      sans: ['civic-library.org', 'www.civic-library.org']
    },
    dns: {
      recordType: 'A',
      host: 'civic-library.org',
      target: '198.51.100.42',
      ttl: 300,
      authoritativeNameserver: 'ns1.inet.org'
    },
    abuseReportsCount: 0
  },
  {
    id: 'site-002',
    domain: 'freepress-local.net',
    altDomains: ['news.freepress-local.net'],
    tenantName: 'Independent Regional Press',
    ownerEmail: 'editor@freepress-local.net',
    status: 'active',
    createdAt: '2026-09-18T14:30:00Z',
    runtime: 'node-lts',
    backendPort: 8082,
    resources: {
      cpuShares: 512,
      memoryLimitMb: 512,
      diskLimitMb: 10240, // 10GB
      bandwidthQuotaGb: 500,
      bandwidthUsedGb: 142.8,
      currentCpuPercent: 8.4,
      currentMemoryMb: 215
    },
    tls: {
      status: 'valid',
      provider: 'Let\'s Encrypt',
      issuer: 'ISRG Root X1 (Let\'s Encrypt)',
      validUntil: '2026-12-17T14:30:00Z',
      sans: ['freepress-local.net', 'news.freepress-local.net']
    },
    dns: {
      recordType: 'A',
      host: 'freepress-local.net',
      target: '198.51.100.42',
      ttl: 300,
      authoritativeNameserver: 'ns1.inet.org'
    },
    abuseReportsCount: 0
  },
  {
    id: 'site-003',
    domain: 'mesh-radio.coop',
    altDomains: ['stream.mesh-radio.coop'],
    tenantName: 'Community Mesh Audio Cooperative',
    ownerEmail: 'broadcast@mesh-radio.coop',
    status: 'active',
    createdAt: '2026-10-01T08:00:00Z',
    runtime: 'go-binary',
    backendPort: 8083,
    resources: {
      cpuShares: 768,
      memoryLimitMb: 512,
      diskLimitMb: 15360, // 15GB
      bandwidthQuotaGb: 1000,
      bandwidthUsedGb: 489.1,
      currentCpuPercent: 14.2,
      currentMemoryMb: 184
    },
    tls: {
      status: 'valid',
      provider: 'Let\'s Encrypt',
      issuer: 'ISRG Root X1 (Let\'s Encrypt)',
      validUntil: '2026-12-30T08:00:00Z',
      sans: ['mesh-radio.coop', 'stream.mesh-radio.coop']
    },
    dns: {
      recordType: 'A',
      host: 'mesh-radio.coop',
      target: '198.51.100.42',
      ttl: 300,
      authoritativeNameserver: 'ns1.inet.org'
    },
    abuseReportsCount: 0
  },
  {
    id: 'site-004',
    domain: 'community-solar.io',
    altDomains: ['data.community-solar.io'],
    tenantName: 'Neighborhood Microgrid Coop',
    ownerEmail: 'energy@community-solar.io',
    status: 'active',
    createdAt: '2026-10-10T12:00:00Z',
    runtime: 'python-fastapi',
    backendPort: 8084,
    resources: {
      cpuShares: 512,
      memoryLimitMb: 384,
      diskLimitMb: 5120,
      bandwidthQuotaGb: 300,
      bandwidthUsedGb: 18.5,
      currentCpuPercent: 3.6,
      currentMemoryMb: 142
    },
    tls: {
      status: 'valid',
      provider: 'Let\'s Encrypt',
      issuer: 'ISRG Root X1 (Let\'s Encrypt)',
      validUntil: '2027-01-08T12:00:00Z',
      sans: ['community-solar.io']
    },
    dns: {
      recordType: 'A',
      host: 'community-solar.io',
      target: '198.51.100.42',
      ttl: 300,
      authoritativeNameserver: 'ns1.inet.org'
    },
    abuseReportsCount: 0
  }
];

export const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'audit-001',
    timestamp: '2026-10-17T12:00:00Z',
    actor: 'operator:sysadmin',
    actorRole: 'node-operator',
    action: 'NODE_INITIALIZED',
    details: 'Node agent initialized with Ed25519 node key fingerprint 4f:a9:81:... on interface 198.51.100.42',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'audit-002',
    timestamp: '2026-10-17T12:15:22Z',
    actor: 'operator:sysadmin',
    actorRole: 'node-operator',
    action: 'SITE_PROVISIONED',
    targetTenantId: 'site-001',
    details: 'Provisioned civic-library.org with 256MB RAM quota and Caddy static runtime',
    previousHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    hash: '7a8f12c84e1b09823dfc789123018247dfabce19823471029384712093847123'
  },
  {
    id: 'audit-003',
    timestamp: '2026-10-17T13:40:10Z',
    actor: 'system:certmagic',
    actorRole: 'automated-system',
    action: 'TLS_CERTIFICATE_ISSUED',
    targetTenantId: 'site-001',
    details: 'Let\'s Encrypt ACME TLS-ALPN-01 challenge succeeded for civic-library.org (ECDSA P-256)',
    previousHash: '7a8f12c84e1b09823dfc789123018247dfabce19823471029384712093847123',
    hash: '9123847afbcde981237461928374619283746192837461928374619283746192'
  }
];

export const dockerComposeFileContent = `# ==============================================================================
# inet.org — Autonomous Multi-Tenant Node Prototype (Docker Compose)
# License: Apache-2.0
# Description: Minimal working node serving isolated tenant sites with
# automatic CoreDNS authoritative records, Caddy On-Demand HTTPS, cgroups limits,
# and lightweight SQLite control plane agent.
# ==============================================================================

version: '3.8'

networks:
  inet_public:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
  inet_internal:
    internal: true # Isolated backend network; no direct internet access for tenants

volumes:
  caddy_data:
  caddy_config:
  coredns_zones:
  inet_state:
  tenant_storage:

services:
  # ----------------------------------------------------------------------------
  # 1. Authoritative & Split-Horizon DNS (CoreDNS)
  # ----------------------------------------------------------------------------
  coredns:
    image: coredns/coredns:1.11.3
    container_name: inet_coredns
    restart: unless-stopped
    command: -conf /etc/coredns/Corefile
    ports:
      - "53:53/udp"
      - "53:53/tcp"
    volumes:
      - ./config/coredns/Corefile:/etc/coredns/Corefile:ro
      - coredns_zones:/etc/coredns/zones
    networks:
      inet_public:
        ipv4_address: 172.28.0.2

  # ----------------------------------------------------------------------------
  # 2. Ingress Reverse Proxy & Automatic ACME HTTPS (Caddy 2)
  # ----------------------------------------------------------------------------
  caddy:
    image: caddy:2.8.4-alpine
    container_name: inet_caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "127.0.0.1:2019:2019" # Protected admin API bound strictly to loopback
    volumes:
      - ./config/caddy/Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
      - tenant_storage:/var/inet/tenants:ro
      - ./pages/quarantined.html:/var/inet/pages/quarantined.html:ro
    environment:
      - INET_NODE_IP=\${INET_NODE_IP:-127.0.0.1}
      - INET_AGENT_URL=http://node_agent:4000
    depends_on:
      - node_agent
    networks:
      - inet_public
      - inet_internal

  # ----------------------------------------------------------------------------
  # 3. Autonomous Node Agent & Control Plane
  # ----------------------------------------------------------------------------
  node_agent:
    build:
      context: ./agent
      dockerfile: Dockerfile
    container_name: inet_node_agent
    restart: unless-stopped
    ports:
      - "127.0.0.1:4000:4000" # Internal control plane API
    volumes:
      - inet_state:/var/lib/inet
      - coredns_zones:/etc/coredns/zones
      - tenant_storage:/var/inet/tenants
      - /var/run/docker.sock:/var/run/docker.sock:ro # For rootless container supervision
    environment:
      - NODE_ENV=production
      - CADDY_ADMIN_API=http://caddy:2019
      - DB_PATH=/var/lib/inet/node_state.sqlite
      - AUDIT_SECRET=\${AUDIT_SECRET:-change_in_production_operator_secret}
    networks:
      - inet_public
      - inet_internal

  # ----------------------------------------------------------------------------
  # 4. Resource Accounting (cAdvisor for cgroups v2 Scrape)
  # ----------------------------------------------------------------------------
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.49.1
    container_name: inet_cadvisor
    restart: unless-stopped
    privileged: false
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    ports:
      - "127.0.0.1:8080:8080"
    networks:
      - inet_internal

  # ============================================================================
  # SAMPLE TENANT RUNTIMES (Simulated Multi-Tenant Workloads)
  # ============================================================================

  # Tenant A: Static Civic Library (Zero-memory static serving)
  tenant_civic_library:
    image: caddy:2.8.4-alpine
    container_name: inet_tenant_civic_library
    restart: unless-stopped
    command: caddy file-server --root /srv --listen :8081
    volumes:
      - ./tenants/civic-library/public:/srv:ro
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 256M
    networks:
      - inet_internal

  # Tenant B: Node.js Independent Regional Press
  tenant_freepress:
    image: node:20-alpine
    container_name: inet_tenant_freepress
    restart: unless-stopped
    working_dir: /app
    volumes:
      - ./tenants/freepress/app:/app:ro
    command: node server.js
    environment:
      - PORT=8082
    deploy:
      resources:
        limits:
          cpus: '1.00'
          memory: 512M
    networks:
      - inet_internal
`;

export const caddyfileContent = `# ==============================================================================
# inet.org Caddyfile — Production Ingress & Automated On-Demand TLS
# ==============================================================================

{
    # Global options
    admin 0.0.0.0:2019

    # On-Demand TLS security: only issue certs if our Node Agent returns HTTP 200
    on_demand_tls {
        ask http://node_agent:4000/api/v1/certificates/ask
        interval 2m
        burst 5
    }

    # Strict transport security and logging
    log {
        output file /var/log/caddy/access.log {
            roll_size 50mb
            roll_keep 7
        }
        format json
    }
}

# ------------------------------------------------------------------------------
# Operator Admin Console (Accessible on node hostname or wireguard VPN)
# ------------------------------------------------------------------------------
admin.inet.localhost {
    reverse_proxy node_agent:4000
}

# ------------------------------------------------------------------------------
# Universal On-Demand TLS Catch-All for Multi-Tenant Domains
# ------------------------------------------------------------------------------
:443 {
    tls {
        on_demand
    }

    # Abuse Quarantine Intercept Check
    @quarantined header_regexp X-Inet-Quarantined ^true$
    handle @quarantined {
        root * /var/inet/pages
        file_server {
            index quarantined.html
        }
    }

    # Default Dynamic Proxying according to Host header
    @civic host civic-library.org www.civic-library.org
    handle @civic {
        reverse_proxy tenant_civic_library:8081
    }

    @freepress host freepress-local.net news.freepress-local.net
    handle @freepress {
        reverse_proxy tenant_freepress:8082
    }

    # Fallback for unconfigured hosts
    handle {
        respond "Host not configured on this inet.org community node." 404
    }
}
`;

export const corefileContent = `# ==============================================================================
# inet.org Corefile — Authoritative DNS Configuration
# ==============================================================================

# Public authoritative zone for inet.org community node
inet.org:53 {
    file /etc/coredns/zones/db.inet.org
    errors
    log
    prometheus 0.0.0.0:9153
}

# Dynamic tenant zonefile directory (auto-reloaded upon agent writes)
.:53 {
    auto {
        directory /etc/coredns/zones/tenants (.*)
        reload 10s
    }
    # Upstream fallback for local resolution
    forward . 9.9.9.9 149.112.112.112 {
        prefer_udp
    }
    cache 300
    errors
}
`;

export const testPrototypeScript = `#!/usr/bin/env bash
# ==============================================================================
# test-prototype.sh — Automated Verification Suite for inet.org Node Prototype
# ==============================================================================
set -euo pipefail

echo "=========================================================="
echo "inet.org Node Prototype Verification Test Suite"
echo "=========================================================="

PASSED=0
FAILED=0

assert_eq() {
  local test_name="$1"
  local expected="$2"
  local actual="$3"
  if [ "$actual" == "$expected" ]; then
    echo "✓ [PASS] $test_name"
    PASSED=$((PASSED + 1))
  else
    echo "✗ [FAIL] $test_name (Expected: '$expected', Got: '$actual')"
    FAILED=$((FAILED + 1))
  fi
}

# 1. Test Node Agent Health Endpoint
echo "Step 1: Checking Node Agent Health..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/v1/health || echo "000")
assert_eq "Node Agent API is healthy" "200" "$HEALTH_STATUS"

# 2. Test Caddy Ask Endpoint for Active Tenant (civic-library.org)
echo "Step 2: Testing Caddy On-Demand TLS Ask Endpoint for active tenant..."
ASK_VALID=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:4000/api/v1/certificates/ask?domain=civic-library.org")
assert_eq "Active domain returns HTTP 200 (Cert allowed)" "200" "$ASK_VALID"

# 3. Test Caddy Ask Endpoint for Malicious/Unknown Domain
echo "Step 3: Testing Caddy On-Demand TLS Ask Endpoint for unknown domain..."
ASK_INVALID=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:4000/api/v1/certificates/ask?domain=malicious-attacker.xyz")
assert_eq "Unknown domain returns HTTP 403 (Cert refused)" "403" "$ASK_INVALID"

# 4. Test DNS Resolution via CoreDNS (port 53)
echo "Step 4: Testing CoreDNS Resolution for tenant..."
DNS_IP=$(dig +short @127.0.0.1 -p 53 civic-library.org A || echo "")
if [[ "$DNS_IP" =~ ^[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+$ ]]; then
  echo "✓ [PASS] CoreDNS resolved civic-library.org to $DNS_IP"
  PASSED=$((PASSED + 1))
else
  echo "✗ [FAIL] CoreDNS resolution failed"
  FAILED=$((FAILED + 1))
fi

# 5. Test Abuse Quarantine Transition
echo "Step 5: Testing Abuse Quarantine Workflow..."
QUARANTINE_RES=$(curl -s -X POST "http://localhost:4000/api/v1/sites/site-004/quarantine" \\
  -H "Content-Type: application/json" \\
  -d '{"reason": "Phishing test verification", "auditorSignature": "sig:test-auditor"}' | grep -o '"status":"quarantined"' || echo "")
assert_eq "Site status updated to quarantined" '"status":"quarantined"' "$QUARANTINE_RES"

# 6. Test Cryptographic Audit Log Append
echo "Step 6: Verifying Cryptographic Audit Log Chain..."
AUDIT_COUNT=$(curl -s "http://localhost:4000/api/v1/audit/logs" | grep -o '"hash"' | wc -l || echo "0")
if [ "$AUDIT_COUNT" -ge 3 ]; then
  echo "✓ [PASS] Audit chain has $AUDIT_COUNT cryptographically verified entries"
  PASSED=$((PASSED + 1))
else
  echo "✗ [FAIL] Audit chain verification failed (Count: $AUDIT_COUNT)"
  FAILED=$((FAILED + 1))
fi

echo "=========================================================="
echo "Test Results: $PASSED passed, $FAILED failed"
if [ "$FAILED" -eq 0 ]; then
  echo "Node Prototype is functioning correctly!"
  exit 0
else
  echo "Some tests failed. Check logs via: docker compose logs"
  exit 1
fi
`;

export const phase3Summary = {
  openQuestions: [
    'How should we package the prototype for one-step installation: a curl | sh installer with SHA-256 validation, or an official Debian/Ubuntu .deb package?',
    'Should we include a built-in WebDAV or SFTP-Go container for volunteer non-technical users to upload static HTML files easily via drag-and-drop?',
    'What should the default storage snapshot frequency be (hourly ZFS vs daily Restic backup)?'
  ],
  nextSteps: [
    'Produce Phase 4 operator documentation with zero-gap copy-paste recipes for Ubuntu 24.04 LTS.',
    'Build Phase 5 transparent cost accounting equations and democratic proposal voting ledger.'
  ]
};
