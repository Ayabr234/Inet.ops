export const phase2Architecture = {
  overview: `inet.org is structured around a decoupled, local-first architecture designed for single-operator autonomy today with zero-friction federation tomorrow. The system runs on a standard Linux host without requiring heavy Kubernetes or proprietary cloud dependencies.`,
  
  componentDiagramMermaid: `graph TB
    subgraph Public Internet
        Browser[Web Browser / Visitor]
        Registrar[Domain Registrar / DNS Root]
        ACME[Let's Encrypt / ZeroSSL]
    end

    subgraph Node Host [inet.org Host Machine - Linux Kernel 6.x]
        subgraph Ingress Layer
            CoreDNS[CoreDNS Port 53<br/>Authoritative & Split-Horizon]
            Caddy[Caddy 2 Port 80 / 443<br/>Reverse Proxy + CertMagic TLS + Coraza WAF]
        end

        subgraph Control Plane & Daemon
            Agent[inet-node-agent Daemon<br/>Go / TypeScript Service]
            AdminUI[Operator Admin Dashboard<br/>React + Tailwind SPA]
            SQLite[(SQLite Database<br/>State, Audit Log & Accounting)]
        end

        subgraph Tenant Sandboxes [systemd cgroups v2 / inet.slice]
            subgraph Tenant1 [Tenant: civic-library.org]
                T1_Runtime[Caddy / Static Web Root]
                T1_CG[cgroups: 256MB RAM / 0.5 CPU / 5GB Disk]
            end

            subgraph Tenant2 [Tenant: freepress-local.net]
                T2_Runtime[Node.js / Express App]
                T2_CG[cgroups: 512MB RAM / 1.0 CPU / 10GB Disk]
            end

            subgraph Tenant3 [Tenant: mesh-radio.coop]
                T3_Runtime[PHP-FPM + Alpine Nginx]
                T3_CG[cgroups: 512MB RAM / 0.8 CPU / 10GB Disk]
            end
        end

        subgraph Telemetry & Security
            CrowdSec[CrowdSec Engine<br/>Log Inspection & Bouncer]
            cAdvisor[cAdvisor / cgroup Scraper<br/>CPU / Memory / I/O Stats]
        end
    end

    Browser -->|DNS Query| CoreDNS
    Browser -->|HTTPS Request| Caddy
    Registrar -->|Delegation NS| CoreDNS
    Caddy -->|ACME HTTP-01| ACME
    Caddy -->|Ask Endpoint: Is Domain Active?| Agent
    Caddy -->|Reverse Proxy / Unix Socket| T1_Runtime
    Caddy -->|Reverse Proxy / Localhost:3001| T2_Runtime
    Caddy -->|Reverse Proxy / Localhost:3002| T3_Runtime

    AdminUI -->|REST API / Bearer Token| Agent
    Agent -->|Write Config & State| SQLite
    Agent -->|Atomic JSON Reconfig :2019| Caddy
    Agent -->|Update Dynamic Zonefile| CoreDNS
    Agent -->|systemd-run / cgroup limits| TenantSandboxes
    cAdvisor -->|Read /sys/fs/cgroup/inet.slice| TenantSandboxes
    cAdvisor -->|Hourly Metrics| Agent
    CrowdSec -->|Read /var/log/caddy/access.log| Caddy`,

  dataFlows: [
    {
      id: 'flow-provision',
      title: 'Data Flow 1: Tenant Site Provisioning & Automatic HTTPS Handshake',
      description: 'Step-by-step sequence from tenant site creation to automated DNS configuration and live HTTPS certificate issuance.',
      mermaid: `sequenceDiagram
        autonumber
        actor Op as Node Operator (Admin UI)
        participant API as inet Node Agent (/api/v1/sites)
        participant DB as SQLite State & Audit Chain
        participant DNS as CoreDNS Authoritative Server
        participant Caddy as Caddy Reverse Proxy
        participant ACME as Let's Encrypt CA
        actor Vis as First Web Visitor

        Op->>API: POST /api/v1/sites {domain: "open-seed.coop", runtime: "static"}
        API->>DB: Record tenant, allocate UID (10005) & port (3005)
        API->>DB: Append SHA-256 Audit Log Record
        API->>API: Create directory /var/inet/tenants/open-seed.coop with project quota (5GB)
        API->>DNS: Add A/AAAA record to CoreDNS dynamic zonefile & reload
        API->>Caddy: POST localhost:2019/config/apps/http/servers/srv0/routes
        API-->>Op: 201 Created (Site Provisioned, Ready for Visitors)

        Vis->>Caddy: HTTPS GET https://open-seed.coop/
        Caddy->>API: GET /api/v1/certificates/ask?domain=open-seed.coop
        API-->>Caddy: 200 OK (Domain authorized & active)
        Caddy->>ACME: Request ACME Certificate (TLS-ALPN-01)
        ACME-->>Caddy: Issued X.509 Certificate
        Caddy->>Caddy: Cache certificate locally
        Caddy->>Vis: 200 OK (Encrypted TLS Response)`
    },
    {
      id: 'flow-quarantine',
      title: 'Data Flow 2: Automated Abuse Quarantine & Enforcement',
      description: 'Immediate isolation of a compromised or abusive tenant site, preserving evidence and displaying a legal compliance notice.',
      mermaid: `sequenceDiagram
        autonumber
        actor Auditor as Operator / Abuse Auditor
        participant API as Node Agent (/api/v1/abuse/quarantine)
        participant Caddy as Caddy Ingress Proxy
        participant CG as Linux cgroups / systemd
        participant Audit as Immutable Audit Hash Chain
        actor Visitor as Public Visitor

        Auditor->>API: POST /api/v1/sites/open-seed.coop/quarantine {reason: "Malware / Phishing reported"}
        API->>CG: Freeze tenant processes (echo 1 > cgroup.freeze)
        API->>Caddy: PATCH Caddy route -> redirect open-seed.coop to /var/inet/pages/quarantined.html
        API->>Audit: Append SHA-256 Audit Log with evidence hash & auditor signature
        API-->>Auditor: 200 OK (Site Quarantined in 42ms)
        
        Visitor->>Caddy: GET https://open-seed.coop/
        Caddy-->>Visitor: 451 Unavailable For Legal Reasons (Official Notice Page)`
    }
  ],

  tenantIsolationSpec: {
    namespaces: [
      { name: 'mnt (Mount)', purpose: 'Private isolated filesystem view. Tenant only sees their own chroot/bind-mounted web directory, read-only system libraries, and an isolated /tmp tmpfs.' },
      { name: 'pid (Process ID)', purpose: 'Isolates process tree. Tenant processes cannot see, signal, or ptrace host processes or peer tenants.' },
      { name: 'net (Network)', purpose: 'Dedicated veth network pair or isolated loopback. Tenant cannot sniff raw host sockets or bind to host port 80/443.' },
      { name: 'ipc (Inter-Process Communication)', purpose: 'Prevents shared memory segments or message queues from being accessed across tenants.' },
      { name: 'uts (Host & Domain)', purpose: 'Tenant has its own hostname and cannot alter the host system hostname.' },
      { name: 'user (User Namespaces)', purpose: 'Root inside container maps to unprivileged UID (e.g. 10001) on host. Breaking out gives zero root power.' }
    ],
    cgroupsV2: [
      { file: 'cpu.max', example: '100000 100000', description: 'Hard CPU bandwidth ceiling: 100,000 microseconds per 100ms period (1 full CPU core max).' },
      { file: 'cpu.weight', example: '100', description: 'Fair-share relative weight (1-10000) during periods of high host contention.' },
      { file: 'memory.high', example: '240M', description: 'Soft memory threshold: kernel aggressively reclaims page cache before hard OOM.' },
      { file: 'memory.max', example: '256M', description: 'Hard memory ceiling: exceeding this triggers out-of-memory killer strictly inside tenant slice.' },
      { file: 'pids.max', example: '64', description: 'Maximum process/thread count to completely prevent fork bombs.' },
      { file: 'io.weight', example: '100', description: 'Proportional disk I/O weight on NVMe/SSD to prevent disk saturation.' }
    ],
    seccompProfile: {
      defaultAction: 'SCMP_ACT_ERRNO (EPERM)',
      allowedSyscalls: [
        'read', 'write', 'openat', 'close', 'stat', 'fstat', 'lseek', 'poll', 'epoll_create1',
        'epoll_ctl', 'epoll_wait', 'socket', 'connect', 'accept4', 'bind', 'listen', 'mmap',
        'mprotect', 'munmap', 'brk', 'rt_sigaction', 'rt_sigprocmask', 'clone3', 'execve',
        'exit_group', 'futex', 'nanosleep', 'getpid', 'getrandom'
      ],
      blockedSyscalls: [
        'ptrace (prevents inspecting other processes)',
        'bpf (prevents loading kernel bytecode)',
        'mount / umount2 (prevents filesystem manipulation)',
        'reboot (prevents rebooting node)',
        'kexec_load (prevents loading alternative kernels)',
        'keyctl (prevents kernel keyring exploits)'
      ]
    }
  },

  threatModelStride: [
    {
      category: 'Spoofing (S)',
      threat: 'Malicious visitor spoofs Host header or registers arbitrary domains pointing to node IP to hijack ACME certificates.',
      mitigation: 'Caddy On-Demand TLS is gated by Node Agent Ask endpoint (/api/v1/certificates/ask). Unrecognized domains fail the handshake and are dropped immediately without contacting Let’s Encrypt.'
    },
    {
      category: 'Tampering (T)',
      threat: 'Compromised tenant container modifies another tenant’s web files or alters host DNS zonefiles.',
      mitigation: 'Strict Linux User Namespaces with unprivileged UID mapping; Linux Project Quotas enforce disk limits; host filesystems mounted read-only; DNS and Caddy configuration files owned exclusively by inet-system user.'
    },
    {
      category: 'Repudiation (R)',
      threat: 'Operator or compromised account deletes a critical site or alters abuse records, denying having done so.',
      mitigation: 'Cryptographic append-only Audit Log. Every administrative action appends an immutable record with SHA-256 hash chaining (hash_n = SHA256(hash_{n-1} + timestamp + action + actor + payload)). Logs are mirrored to append-only syslog.'
    },
    {
      category: 'Information Disclosure (I)',
      threat: 'Tenant process reads environment variables, TLS private keys, or SQLite credentials of adjacent tenants.',
      mitigation: 'Private mount namespaces; TLS keys stored with 0600 permissions in /var/lib/caddy accessible only by Caddy; tenant containers have no access to host /proc or /sys/kernel.'
    },
    {
      category: 'Denial of Service (D)',
      threat: 'Tenant runs endless loop or fork-bomb to exhaust CPU/RAM; external attacker floods port 80/443 with SYN packets or Layer 7 HTTP floods.',
      mitigation: 'cgroups v2 limits (pids.max=64, memory.max=256M, cpu.max); Linux SYN cookies enabled in sysctl; Caddy rate-limiting and Coraza WAF; CrowdSec bouncer drops abusive IPs at firewall (nftables) level.'
    },
    {
      category: 'Elevation of Privilege (E)',
      threat: 'Container breakout exploit (e.g. runc CVE-2024-21626) grants tenant code root shell on the host machine.',
      mitigation: 'Containers execute strictly rootless (subuid/subgid). Even if code escapes the container sandbox, it remains an unprivileged UID on the host with zero access to /etc/shadow or raw devices. Optional gVisor runsc sandbox for high-risk runtimes.'
    }
  ],

  openApiSpec: {
    openapi: '3.1.0',
    info: {
      title: 'inet.org Node Agent & Control Plane API',
      version: '1.0.0',
      description: 'Standardized RESTful specification for autonomous community hosting nodes. Operates on localhost:4000 or via secure mTLS.'
    },
    paths: {
      '/api/v1/health': {
        get: {
          summary: 'Node Health & Ingress Status',
          description: 'Returns operational status of Caddy, CoreDNS, container engine, disk usage, and memory headroom.',
          responses: {
            '200': {
              description: 'Node is healthy and accepting traffic'
            }
          }
        }
      },
      '/api/v1/sites': {
        get: {
          summary: 'List all tenant sites',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'quarantined', 'suspended'] } }
          ],
          responses: {
            '200': { description: 'Array of tenant site objects with resource quotas and TLS status' }
          }
        },
        post: {
          summary: 'Provision a new tenant website',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['domain', 'tenantName', 'ownerEmail', 'runtime'],
                  properties: {
                    domain: { type: 'string', example: 'civic-library.org' },
                    tenantName: { type: 'string', example: 'Metropolis Civic Library' },
                    ownerEmail: { type: 'string', format: 'email' },
                    runtime: { type: 'string', enum: ['static-caddy', 'node-lts', 'php-fpm', 'python-fastapi'] },
                    memoryLimitMb: { type: 'integer', default: 256 },
                    cpuShares: { type: 'integer', default: 512 },
                    diskLimitMb: { type: 'integer', default: 5120 }
                  }
                }
              }
            }
          },
          responses: {
            '201': { description: 'Site provisioned, DNS records generated, Caddy route active' }
          }
        }
      },
      '/api/v1/sites/{siteId}/quarantine': {
        post: {
          summary: 'Quarantine a compromised or abusive tenant site',
          parameters: [{ name: 'siteId', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['reason', 'auditorSignature'],
                  properties: {
                    reason: { type: 'string', example: 'Confirmed phishing page detected in subfolder' },
                    auditorSignature: { type: 'string', example: 'ed25519:operator-sig-base64' }
                  }
                }
              }
            }
          },
          responses: {
            '200': { description: 'Site isolated, processes frozen, redirected to compliance page' }
          }
        }
      },
      '/api/v1/certificates/ask': {
        get: {
          summary: 'Caddy On-Demand TLS Verification Endpoint',
          description: 'Called by Caddy CertMagic during ClientHello to verify domain is registered and eligible for certificate issuance.',
          parameters: [{ name: 'domain', in: 'query', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'Domain is authorized. Issue/renew certificate.' },
            '403': { description: 'Domain is unknown or quarantined. Reject handshake.' }
          }
        }
      },
      '/api/v1/accounting/usage': {
        get: {
          summary: 'Get per-tenant resource utilization',
          parameters: [{ name: 'period', in: 'query', schema: { type: 'string', example: '2026-10' } }],
          responses: {
            '200': { description: 'Hourly and monthly CPU-seconds, RAM MB-hours, Disk bytes, and Egress bandwidth' }
          }
        }
      },
      '/api/v1/audit/logs': {
        get: {
          summary: 'Fetch verifiable audit log entries',
          responses: {
            '200': { description: 'List of cryptographic audit events with SHA-256 chain links' }
          }
        }
      }
    }
  },

  openQuestions: [
    'Should the Node Agent expose an optional ActivityPub Actor endpoint on day one so peer instances can automatically subscribe to security advisories and node status?',
    'Should we mandate eBPF for per-socket egress accounting (via cilium/ebpf), or is parsing Caddy access logs sufficient for community volunteer nodes?',
    'How should we handle database clustering (e.g., PostgreSQL for dynamic CMS sites): separate sidecar container per tenant vs shared multi-tenant PostgreSQL instance with row-level security?'
  ],
  nextSteps: [
    'Implement the complete minimal working node prototype (Phase 3) with real Caddy dynamic JSON generation, CoreDNS zone management, and live admin dashboard.',
    'Provide full docker-compose.yml and runnable test suite verifying DNS, TLS ask endpoint, and cgroup enforcement.'
  ]
};
