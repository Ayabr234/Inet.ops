import { LayerEvaluation } from '../types';

export const phase1Layers: LayerEvaluation[] = [
  {
    id: 'dns',
    name: '1. Domain Name System (DNS)',
    tagline: 'Authoritative routing, split-horizon, dynamic updates, and zone management',
    plainLanguage:
      'DNS acts as the public telephone book of the web. When a visitor types a community domain (e.g. activist-news.org), DNS translates that human-friendly name into the numerical IP address of our node. For community infrastructure, DNS must support automatic API record creation for new tenants, DNSSEC cryptographic verification to prevent tampering, and dynamic split-horizon resolving so internal node traffic does not leave the local loopback.',
    mermaidDiagram: `graph LR
    Client([Web Visitor / Browser]) -->|1. Resolve tenant.coop| RecDNS[Recursive Resolver 1.1.1.1 / Quad9]
    RecDNS -->|2. Query NS records| RootTLD[Root / TLD Nameservers]
    RecDNS -->|3. Authoritative Query| AuthDNS[inet.org Authoritative DNS CoreDNS / PowerDNS]
    AuthDNS -->|4. Signed A / AAAA / TXT DNSSEC| RecDNS
    RecDNS -->|5. IP Returned 198.51.100.42| Client
    Client -->|6. HTTPS Request| ReverseProxy[Caddy Ingress Proxy]
    ControlPlane[inet.org Node Agent] -->|API: Add/Update Record on Provision| AuthDNS`,
    options: [
      {
        name: 'CoreDNS',
        license: 'Apache-2.0',
        repoOrWebsite: 'github.com/coredns/coredns',
        pros: [
          'Written in memory-safe Go with minimal binary footprint (~35MB)',
          'Modular plugin architecture (etcd, file, auto, rewrite, prometheus metrics)',
          'Native integration with container orchestration and dynamic backends',
          'Fast cold start and low idle memory consumption (<40MB RAM)'
        ],
        cons: [
          'Zone transfer (AXFR) and complex secondary DNS clustering require custom plugins',
          'Not intended as a high-volume registry TLD backend with tens of millions of records'
        ],
        communityFit: 'Exceptional for single-node operators and volunteer teams who need an easy-to-configure, lightweight nameserver with Prometheus metrics.'
      },
      {
        name: 'PowerDNS (Authoritative Server)',
        license: 'GPLv2 (Warning: check license boundary for MIT/Apache stack; REST API can run as decoupled daemon)',
        repoOrWebsite: 'powerdns.com / github.com/PowerDNS/pdns',
        pros: [
          'Battle-tested by national registries and enterprise ISPs',
          'Full-featured RESTful HTTP API out of the box for automated record provisioning',
          'Pluggable SQL backends (PostgreSQL, SQLite, MariaDB) with automated DNSSEC key rollover'
        ],
        cons: [
          'GPLv2 license prevents embedding directly in MIT/Apache-2.0 compiled binaries (must run as out-of-process daemon)',
          'Heavier memory footprint and more operational moving parts than CoreDNS'
        ],
        communityFit: 'Great when operators need multi-database backends, but license constraints require running it via network boundary.'
      },
      {
        name: 'Knot DNS',
        license: 'GPLv3',
        repoOrWebsite: 'knot-dns.cz',
        pros: [
          'Blistering query throughput with low latency and native DNSSEC automatic signing',
          'Dynamic configuration via knotc and UNIX domain sockets',
          'Active maintenance by CZ.NIC (Czech national registry)'
        ],
        cons: [
          'GPLv3 license prevents permissive sublicensing',
          'C codebase requires careful compilation and memory bounds auditing compared to Go/Rust'
        ],
        communityFit: 'High performance for pure authoritative servers, but license poses community distribution friction.'
      }
    ],
    recommendation: {
      chosen: 'CoreDNS (Apache-2.0) with local file/etcd plugin + dynamic Node Agent HTTP control hook',
      reasoning:
        'CoreDNS delivers strict Apache-2.0 compliance, zero memory unsafety risks (written in Go), native Prometheus metrics for accounting, and a simple configuration model that a volunteer operator can inspect and debug with basic text tools. The node agent generates zone files or updates etcd/memory state over a local UNIX socket.',
      limitsAndTradeoffs:
        'Does not include a built-in web UI; record manipulation must be handled through our lightweight Node Agent API or zonefile reload.',
      federationReadiness:
        'CoreDNS easily delegates subdomains to peer instances using standard NS records, enabling a federated mesh of community nodes across autonomous domains.'
    }
  },
  {
    id: 'routing',
    name: '2. Routing & Reverse Proxies',
    tagline: 'L4/L7 ingress traffic termination, host-based routing, and dynamic upstream proxying',
    plainLanguage:
      'The reverse proxy is the front door of the node. When incoming HTTP/HTTPS traffic hits port 80 or 443, the proxy inspects the Host header (e.g. climate-action.org vs tenant2.inet.org), matches it to the right tenant container on the internal network, forwards the request, and sends the response back to the user without exposing internal ports to the internet.',
    mermaidDiagram: `graph TD
    User([Public Client]) -->|HTTPS Port 443 / HTTP Port 80| Caddy[Caddy Reverse Proxy]
    Caddy -->|Host: farm-coop.org| Cont1[Tenant A: Static Site / Caddy Internal]
    Caddy -->|Host: radio.community.net| Cont2[Tenant B: Node.js / Podman Container]
    Caddy -->|Host: wiki.local.coop| Cont3[Tenant C: PHP-FPM / Python App]
    Caddy -->|Host: admin.inet.node| AdminUI[inet.org Operator Dashboard & Node Agent]
    Caddy -.->|Quarantine Override| QuaranBlock[Local Block Page / Abuse Intercept]`,
    options: [
      {
        name: 'Caddy 2',
        license: 'Apache-2.0',
        repoOrWebsite: 'caddyserver.com / github.com/caddyserver/caddy',
        pros: [
          'Native automatic HTTPS with Let’s Encrypt / ZeroSSL with zero external dependencies',
          'Dynamic runtime reconfiguration via JSON REST API without dropping active connections',
          'Written in memory-safe Go; high resistance to buffer overflow and memory corruption CVEs',
          'Native On-Demand TLS capabilities: provisions certificates dynamically on first handshake'
        ],
        cons: [
          'Slightly lower raw throughput than finely tuned C/C++ proxies (Nginx/HAProxy) under 100k+ req/sec, though negligible for community nodes'
        ],
        communityFit: 'Unmatched. Solves TLS automation, dynamic configuration, and security in a single clean Apache-2.0 binary.'
      },
      {
        name: 'Envoy Proxy',
        license: 'Apache-2.0',
        repoOrWebsite: 'envoyproxy.io',
        pros: [
          'Extreme performance, advanced L7 filter chains, dynamic Discovery Service (xDS) APIs',
          'Deep observability and tracing capabilities out of the box'
        ],
        cons: [
          'Steep configuration complexity (massive protobuf/YAML manifests)',
          'Requires separate ACME manager (e.g. cert-manager) for certificate management',
          'Too complex for volunteer teams to debug during midnight outages'
        ],
        communityFit: 'Overkill for standalone and federated community hosting nodes.'
      },
      {
        name: 'Traefik',
        license: 'Apache-2.0',
        repoOrWebsite: 'traefik.io / github.com/traefik/traefik',
        pros: [
          'Native Docker and container label discovery',
          'Built-in ACME certificate provisioning',
          'Intuitive web dashboard for routing topology'
        ],
        cons: [
          'Dynamic configuration updates on file changes can sometimes drop websockets',
          'On-demand TLS for arbitrary multi-tenant custom domains requires enterprise edition or fragile workarounds'
        ],
        communityFit: 'Solid runner-up, but Caddy provides superior On-Demand TLS and dynamic JSON API for multi-tenant custom domains.'
      }
    ],
    recommendation: {
      chosen: 'Caddy 2 (Apache-2.0)',
      reasoning:
        'Caddy provides first-class On-Demand TLS, an atomic JSON administrative API (localhost:2019), and memory safety. Adding a new tenant domain requires a single HTTP POST request to Caddy’s API without reloading processes or dropping existing user TCP connections.',
      limitsAndTradeoffs:
        'Must protect Caddy’s admin API on 127.0.0.1:2019 strictly from tenant containers. On-Demand TLS must be gated with an ask endpoint to prevent denial-of-service certificate exhaustion.',
      federationReadiness:
        'Caddy can act as an SNI router or forwarder to peer nodes across a community WireGuard mesh with zero protocol friction.'
    }
  },
  {
    id: 'tls',
    name: '3. TLS and Certificates',
    tagline: 'Automated certificate lifecycle, ACME protocol, revocation, and cryptographic security',
    plainLanguage:
      'TLS encrypts traffic between user web browsers and the hosting node so that internet service providers, public Wi-Fi snoopers, and surveillance agencies cannot read or alter the website content. In a multi-tenant platform, issuing and renewing certificates for hundreds of custom domain names must be 100% automated without operator intervention.',
    mermaidDiagram: `sequenceDiagram
    autonumber
    actor Visitor as Web Visitor
    participant Caddy as Caddy Proxy
    participant Agent as inet Node Agent (Ask Endpoint)
    participant LE as Let's Encrypt / ZeroSSL ACME CA
    
    Visitor->>Caddy: ClientHello (SNI: solidarity.org)
    Caddy->>Caddy: Check local cert cache
    alt Cert Missing (First Request)
        Caddy->>Agent: GET /api/v1/certificates/ask?domain=solidarity.org
        alt Domain Authorized & Tenant Active
            Agent-->>Caddy: 200 OK (Allowed)
            Caddy->>LE: ACME HTTP-01 / TLS-ALPN-01 Challenge
            LE-->>Caddy: Challenge verified
            LE-->>Caddy: Signed X.509 Certificate (ECDSA P-256)
            Caddy->>Caddy: Cache cert on disk (secure permissions 0600)
            Caddy-->>Visitor: Complete TLS Handshake
        else Domain Unknown or Quarantined
            Agent-->>Caddy: 403 Forbidden (Deny)
            Caddy-->>Visitor: Drop Connection / Reject Handshake
        end
    else Cert in Cache
        Caddy-->>Visitor: Instant TLS Handshake
    end`,
    options: [
      {
        name: 'CertMagic / Caddy ACME Engine',
        license: 'Apache-2.0',
        repoOrWebsite: 'github.com/caddyserver/certmagic',
        pros: [
          'Zero-config automated TLS with multiple CA fallback (Let’s Encrypt + ZeroSSL)',
          'Automated OCSP stapling, certificate rotation 30 days before expiration',
          'Distributed storage support (local filesystem, Consul, Redis) for clustering'
        ],
        cons: [
          'Tightly coupled with Go ecosystem (though usable as standard Caddy binary)'
        ],
        communityFit: 'Perfect. Eliminates cron jobs, Certbot renewals failures, and manual renewal scripts.'
      },
      {
        name: 'Step-CA (Smallstep)',
        license: 'Apache-2.0',
        repoOrWebsite: 'smallstep.com / github.com/smallstep/certificates',
        pros: [
          'Full private ACME certificate authority for internal offline/mesh communication',
          'Supports modern zero-trust mTLS between node services',
          'Clean CLI and daemon architecture'
        ],
        cons: [
          'Cannot issue publicly trusted browser certificates on its own (needs public ACME for web tenants)'
        ],
        communityFit: 'Superb for inter-node encrypted mesh and control-plane mTLS, paired with Let’s Encrypt for public sites.'
      },
      {
        name: 'Certbot (EFF)',
        license: 'Apache-2.0',
        repoOrWebsite: 'eff.org / github.com/certbot/certbot',
        pros: [
          'Historic industry standard with extensive documentation and OS packages'
        ],
        cons: [
          'Python dependency graph, requires cron/systemd timers for renewals',
          'Difficult to wire dynamically for multi-tenant on-demand provisioning without web server restarts'
        ],
        communityFit: 'Obsolete for dynamic multi-tenant platforms compared to embedded ACME engines.'
      }
    ],
    recommendation: {
      chosen: 'Caddy CertMagic (Apache-2.0) with custom Node Agent Ask endpoint + internal Step-CA for node-to-node telemetry',
      reasoning:
        'Caddy’s CertMagic handles public domain issuance automatically using ACME HTTP-01 and TLS-ALPN-01 challenges. The ask endpoint guarantees that an attacker cannot cause Let’s Encrypt rate-limiting by pointing bogus domains at our server IP.',
      limitsAndTradeoffs:
        'Let’s Encrypt has duplicate certificate limits (5 per week per exact set of names) and failed validation limits (5 failures per account per hostname per hour). The ask endpoint is mandatory to prevent abuse.',
      federationReadiness:
        'Local nodes can use Step-CA to issue federated mTLS certificates for node-to-node replication while using public ACME for public tenant websites.'
    }
  },
  {
    id: 'webservers',
    name: '4. Web Servers & Application Runtimes',
    tagline: 'Serving static HTML/assets, executing server-side code (PHP, Node, Python, Go, Rust)',
    plainLanguage:
      'While the reverse proxy routes traffic, the web server or application runtime actually generates the response: reading an index.html file off disk, running a Python script, or executing PHP code for a community blog. We need lightweight, sandboxed runners that cannot touch other tenants’ files.',
    mermaidDiagram: `graph LR
    Proxy[Caddy Reverse Proxy] -->|FastCGI / Port 9000| PHP[PHP-FPM in Tenant Sandbox]
    Proxy -->|HTTP / Local Socket| NodeApp[Node.js / Express Tenant Process]
    Proxy -->|Local Filesystem Read-Only| Static[Caddy Static File Server]
    Proxy -->|WSGI/ASGI Unix Socket| PythonApp[FastAPI / Gunicorn Container]`,
    options: [
      {
        name: 'Caddy Static File Server',
        license: 'Apache-2.0',
        repoOrWebsite: 'caddyserver.com',
        pros: [
          'Direct kernel sendfile support, automatic brotli/gzip compression, ETag handling',
          'Zero separate processes needed for static documentation, blogs, and frontend SPAs'
        ],
        cons: [
          'Requires external FastCGI or reverse proxy targets to execute dynamic languages (Node, Python, PHP)'
        ],
        communityFit: 'Ideal for 70%+ of community sites which are static sites (Hugo, Zola, 11ty, Vite builds).'
      },
      {
        name: 'Nginx (Community OSS)',
        license: '2-clause BSD (MIT-compatible)',
        repoOrWebsite: 'nginx.org',
        pros: [
          'Rock-solid FastCGI process manager integration for PHP and static content',
          'Extremely low CPU and memory footprint per concurrent connection'
        ],
        cons: [
          'Static configuration reloads required unless running commercial Nginx Plus or custom modules',
          'C codebase lacks Go’s memory safety guarantees'
        ],
        communityFit: 'Excellent as an isolated runner container inside tenant sandboxes for legacy PHP applications.'
      },
      {
        name: 'Apache HTTP Server (httpd)',
        license: 'Apache-2.0',
        repoOrWebsite: 'httpd.apache.org',
        pros: [
          '.htaccess decentralized configuration allows tenants to configure redirects and headers locally'
        ],
        cons: [
          'Process-per-connection or thread models consume significantly more memory than event-driven servers',
          '.htaccess parsing introduces filesystem stat overhead on every request'
        ],
        communityFit: 'Useful for traditional cPanel/shared hosting legacy compatibility, but too memory-hungry for modern co-op nodes.'
      }
    ],
    recommendation: {
      chosen: 'Caddy native for static sites; containerized Alpine Nginx+PHP-FPM and OCI container runtimes for dynamic apps',
      reasoning:
        'Pure static sites are served directly by Caddy with read-only bind mounts, using near-zero RAM. Dynamic sites run inside isolated OCI containers listening on loopback or private bridge network ports.',
      limitsAndTradeoffs:
        'Tenants cannot customize web server low-level C modules directly; all customizations occur via standardized environment variables or container definitions.',
      federationReadiness:
        'Standard OCI images (Docker/Podman) allow tenants to export and migrate their entire site runtime to any other inet.org node with a single command.'
    }
  },
  {
    id: 'cdn',
    name: '5. CDNs & Edge Caching',
    tagline: 'Offloading traffic, absorbing spikes, reducing bandwidth costs, and protecting origin nodes',
    plainLanguage:
      'When an article goes viral or a community campaign launches, a sudden flood of 10,000 visitors can crash a modest server. A caching layer stores copies of images, CSS, and rendered pages in memory, serving repeat visitors in microseconds without touching the backend application.',
    mermaidDiagram: `graph TD
    Client([Public Client]) --> Cache{Varnish In-Memory Cache}
    Cache -->|Cache HIT 0.2ms| Client
    Cache -->|Cache MISS| Origin[Tenant Backend / Static Server]
    Origin -->|Response + Cache-Control| Cache
    Cache -->|Store in memory chunk| Cache`,
    options: [
      {
        name: 'Varnish Cache',
        license: '2-clause BSD',
        repoOrWebsite: 'varnish-cache.org',
        pros: [
          'Unrivaled HTTP caching throughput with VCL (Varnish Configuration Language)',
          'Precise cache invalidation and grace-mode handling (serves stale content during backend downtime)',
          'Efficient memory allocation through custom workspace arenas'
        ],
        cons: [
          'Does not terminate TLS natively (must sit behind Caddy or Hitch)',
          'Requires VCL scripting expertise'
        ],
        communityFit: 'The gold standard for caching high-traffic community news and publishing sites.'
      },
      {
        name: 'Apache Traffic Server (ATS)',
        license: 'Apache-2.0',
        repoOrWebsite: 'trafficserver.apache.org',
        pros: [
          'Full-featured forward and reverse proxy with native HTTP/2, HTTP/3, and TLS support',
          'Hierarchical cache peering support (nodes can query peer caches)'
        ],
        cons: [
          'Complex enterprise configuration, large codebase, heavy memory baseline'
        ],
        communityFit: 'Better suited for national ISP scale than small volunteer co-op nodes.'
      },
      {
        name: 'Squid Cache',
        license: 'GPLv2',
        repoOrWebsite: 'squid-cache.org',
        pros: [
          'Deep history and broad protocol support'
        ],
        cons: [
          'Primarily engineered as a forward proxy rather than an origin accelerator',
          'Higher latency and older threading architecture compared to Varnish'
        ],
        communityFit: 'Less optimal for modern web origin acceleration.'
      }
    ],
    recommendation: {
      chosen: 'Caddy built-in HTTP cache handler (souin / cache plugin) for base tier + optional Varnish container for heavy publishers',
      reasoning:
        'For single-machine simplicity, Caddy’s embedded RFC 7234 cache module requires zero extra network hops and zero additional daemons. For designated high-traffic sites (e.g. independent journalism), an isolated Varnish sidecar container can be attached with custom purge keys.',
      limitsAndTradeoffs:
        'Operators must educate tenants on Cache-Control and Vary headers so private authenticated pages are never cached publicly.',
      federationReadiness:
        'Peer inet.org nodes can enable Cache Peering (ICP or CARP) to share static assets across geographic regions without paying proprietary CDN monopolies.'
    }
  },
  {
    id: 'storage',
    name: '6. Storage & Filesystem Architecture',
    tagline: 'Persistent volumes, tenant disk quotas, object storage (S3), and snapshot backups',
    plainLanguage:
      'Websites need to store files: media uploads, database files, and HTML templates. We must prevent one tenant from filling up the entire hard drive, ensure one tenant cannot read another tenant’s files, and provide automated snapshot backups so data can be restored if an operator makes a mistake.',
    mermaidDiagram: `graph TD
    NodeHost[Node Host Storage: ZFS / ext4] --> QuotaMgr[Linux Project Quotas / ZFS Datasets]
    QuotaMgr --> Tenant1Vol["/var/inet/tenants/t-01 (Limit: 5GB, UID 10001)"]
    QuotaMgr --> Tenant2Vol["/var/inet/tenants/t-02 (Limit: 10GB, UID 10002)"]
    QuotaMgr --> Tenant3Vol["/var/inet/tenants/t-03 (Limit: 2GB, UID 10003)"]
    ObjectStore[Garage S3 Object Storage - Lightweight Mesh] -.-> MediaUploads[Tenant Media & Daily Encrypted Snapshots]`,
    options: [
      {
        name: 'Linux Project Quotas on ext4/XFS + ZFS Datasets',
        license: 'GPLv2 (Linux Kernel) / OpenZFS (CDDL)',
        repoOrWebsite: 'kernel.org / openzfs.github.io',
        pros: [
          'Hard filesystem-level quota enforcement; process cannot write past limit even with root in container',
          'ZFS provides instant copy-on-write snapshots, scrubbing, and data integrity checksums',
          'Zero network latency compared to distributed storage'
        ],
        cons: [
          'Requires kernel filesystem support and proper mount options (`prjquota`) enabled during OS setup'
        ],
        communityFit: 'Mandatory baseline for single-node multi-tenant local isolation.'
      },
      {
        name: 'Garage S3',
        license: 'AGPL-3.0 (Warning: Network service boundary; used strictly as decoupled storage API)',
        repoOrWebsite: 'garagehq.deuxfleurs.fr',
        pros: [
          'Specially engineered for self-hosted community networks, co-ops, and heterogeneous hardware',
          'Extremely lightweight (~20MB RAM) compared to MinIO (which consumes 1GB+)',
          'Multi-datacenter replication across high-latency internet connections'
        ],
        cons: [
          'AGPL license requires keeping it strictly as an external networked S3 daemon',
          'Not intended for low-latency random POSIX IO (database files must stay on local SSD)'
        ],
        communityFit: 'The ultimate community object store for federated backups and media uploads.'
      },
      {
        name: 'SeaweedFS',
        license: 'Apache-2.0',
        repoOrWebsite: 'github.com/seaweedfs/seaweedfs',
        pros: [
          'Fast handling of billions of small files with Facebook Haystack-style architecture',
          'Native S3, WebDAV, and FUSE mount support',
          'Strict Apache-2.0 license'
        ],
        cons: [
          'More moving parts (Master, Volume server, Filer) than a single volunteer needs on day one'
        ],
        communityFit: 'Solid candidate for large cluster scale.'
      }
    ],
    recommendation: {
      chosen: 'Local filesystem with Linux Project Quotas (ext4/XFS/ZFS) for site rootfs + Garage S3 for media & offsite backup replication',
      reasoning:
        'Local directory trees with Linux Project ID quotas provide rock-solid POSIX performance and impossible-to-bypass disk limits for web roots and SQLite/PostgreSQL databases. Garage S3 provides decentralized asset distribution and encrypted offsite replication.',
      limitsAndTradeoffs:
        'Disk quotas require operator to configure mount flags during OS setup. We document the exact fstab recipe in Phase 4.',
      federationReadiness:
        'Garage cluster tokens allow multiple community hosting nodes to cross-replicate encrypted backups to each other for free mutual disaster recovery.'
    }
  },
  {
    id: 'isolation',
    name: '7. Container Orchestration & Tenant Isolation',
    tagline: 'Namespaces, cgroups v2, seccomp, rootless execution, and defense-in-depth sandboxing',
    plainLanguage:
      'Tenant isolation is the core security boundary of shared web hosting. If Tenant A runs buggy or malicious code, they must never be able to view Tenant B’s database, exhaust the server’s RAM, hijack the network interface, or gain root privileges on the host operating system.',
    mermaidDiagram: `graph TD
    subgraph Host Linux Kernel cgroups v2
        subgraph TenantA [Tenant A Sandbox]
            NS1[Namespaces: mnt, pid, net, ipc, user]
            CG1[cgroup: cpu.max=100000, memory.max=256M, pids.max=64]
            Sec1[Seccomp: Block dangerous syscalls]
            Proc1[Tenant Web Process UID 10001]
        end
        subgraph TenantB [Tenant B Sandbox]
            NS2[Namespaces: mnt, pid, net, ipc, user]
            CG2[cgroup: cpu.max=200000, memory.max=512M, pids.max=128]
            Sec2[Seccomp: Block dangerous syscalls]
            Proc2[Tenant Web Process UID 10002]
        end
    end
    HostKernel[Host Linux Kernel 6.x] -.->|Enforces Hard Limits| TenantA
    HostKernel -.->|Enforces Hard Limits| TenantB`,
    options: [
      {
        name: 'Rootless Docker / Podman + systemd cgroups v2',
        license: 'Apache-2.0',
        repoOrWebsite: 'podman.io / docker.com',
        pros: [
          'Daemon runs as unprivileged user (UID != 0); container escape does not yield host root',
          'Native integration with systemd cgroups v2 for deterministic CPU, memory, and I/O throttling',
          'Standard Dockerfile compatibility familiar to every web developer worldwide'
        ],
        cons: [
          'Exposing privileged low ports (<1024) requires sysctl tuning (`net.ipv4.ip_unprivileged_port_start=80`) or proxy routing'
        ],
        communityFit: 'The sweet spot for maintainability, security, and developer ergonomics.'
      },
      {
        name: 'gVisor (runsc) / Firecracker microVMs',
        license: 'Apache-2.0',
        repoOrWebsite: 'gvisor.dev / firecracker-microvm.github.io',
        pros: [
          'Near-virtual-machine isolation boundary: intercepts all system calls in userspace or KVM',
          'Near-zero risk from Linux kernel zero-day privilege escalations'
        ],
        cons: [
          'gVisor introduces ~15-25% overhead on heavy filesystem/syscall workloads',
          'Firecracker requires nested virtualization or bare metal hardware (not available on cheap VPS)'
        ],
        communityFit: 'Recommended as an optional runtime flag for untrusted or student code execution.'
      },
      {
        name: 'Kubernetes (k3s / k8s)',
        license: 'Apache-2.0',
        repoOrWebsite: 'k3s.io',
        pros: [
          'Extensive declarative API, automated self-healing, rolling updates across clusters'
        ],
        cons: [
          'Consumes 1GB–1.5GB RAM just for control plane overhead before running any tenant code',
          'Massive operational surface area, certificate rotations, and etcd quorum failures'
        ],
        communityFit: 'Too heavy for single-node community servers operated on modest donation budgets.'
      }
    ],
    recommendation: {
      chosen: 'Rootless Podman / Docker OCI engine with systemd cgroups v2 and default strict Seccomp profile',
      reasoning:
        'A single operator can inspect and manage running sandboxes with standard Linux commands (`ps`, `systemctl`, `journalctl`). Rootless execution guarantees that even in the catastrophic event of a container runtime breakout, the attacker is jailed as an unprivileged host UID.',
      limitsAndTradeoffs:
        'Requires Linux host kernel 5.8+ with cgroups v2 enabled by default (standard on Ubuntu 22.04+, Debian 12+, Fedora).',
      federationReadiness:
        'Standard OCI bundles ensure containers can be migrated verbatim across independent federation nodes via standard container registries.'
    }
  },
  {
    id: 'accounting',
    name: '8. Resource Accounting & Capacity Management',
    tagline: 'Per-tenant metrics collection, bandwidth monitoring, fair-share scheduling, and cost attribution',
    plainLanguage:
      'Community infrastructure must be transparent. Unlike commercial clouds that bill surprise fees, a community node needs clear accounting: how much CPU, RAM, storage, and egress bandwidth did each site use this month? This ensures no single user starves the community, and operating costs are openly understood.',
    mermaidDiagram: `graph LR
    Kernel[cgroups v2 & eBPF / tc] -->|Exposes cpu.stat, memory.current, io.stat| cAdvisor[cAdvisor / Node Exporter]
    CaddyLogs[Caddy Access Logs with Byte Counts] -->|Stream via JSON| Agent[inet Node Agent Aggregator]
    cAdvisor -->|Prometheus Metrics| Agent
    Agent -->|Hourly Rollups| LocalDB[(SQLite Local Accounting DB)]
    LocalDB --> Dash[Public / Operator Transparency Dashboard]
    LocalDB --> Quota[Quota Warning & Throttling System]`,
    options: [
      {
        name: 'cAdvisor + Prometheus + SQLite Rollup Engine',
        license: 'Apache-2.0',
        repoOrWebsite: 'github.com/google/cadvisor / prometheus.io',
        pros: [
          'cAdvisor is the industry standard for reading kernel cgroups v2 statistics per container',
          'Prometheus provides standard time-series querying and alerts',
          'Our local agent rolls up 1-minute metrics into hourly SQLite rows (CPU-seconds, MB-hours, Egress bytes)'
        ],
        cons: [
          'Prometheus can use noticeable RAM if retention is set to many months (mitigated by downsampling to SQLite)'
        ],
        communityFit: 'Proven, rock-solid, and completely open source under Apache-2.0.'
      },
      {
        name: 'VictoriaMetrics Single-Node',
        license: 'Apache-2.0',
        repoOrWebsite: 'victoriametrics.com',
        pros: [
          'Ultra-low memory usage, superior disk compression (up to 7x better than Prometheus)',
          'Single binary, drop-in replacement for Prometheus scraping'
        ],
        cons: [
          'Smaller community ecosystem than Prometheus'
        ],
        communityFit: 'Phenomenal alternative if running on resource-constrained 2GB VPS instances.'
      },
      {
        name: 'Netdata',
        license: 'GPLv3 / Agent Cloud restrictions',
        repoOrWebsite: 'netdata.cloud',
        pros: [
          'Instant high-resolution charts and auto-discovery'
        ],
        cons: [
          'Pushes users toward proprietary Netdata Cloud accounts; high telemetry chatter'
        ],
        communityFit: 'Not aligned with public sovereignty principles.'
      }
    ],
    recommendation: {
      chosen: 'cAdvisor metrics scraper + lightweight internal SQLite accounting ledger in Node Agent',
      reasoning:
        'The Node Agent queries cgroups v2 filesystem directly (`/sys/fs/cgroup/inet.slice/tenant-*/`) every 30 seconds and parses Caddy access logs for egress byte attribution. Raw data is aggregated into hourly SQLite records with zero cloud telemetry.',
      limitsAndTradeoffs:
        'Egress bandwidth measurement requires capturing HTTP response sizes and socket closures; Caddy’s structured log emission makes this reliable.',
      federationReadiness:
        'SQLite accounting tables export standardized JSON reports allowing community members to verify server cost distribution across all nodes.'
    }
  },
  {
    id: 'abuse',
    name: '9. Abuse, Legal & Threat Handling',
    tagline: 'Automated rate-limiting, WAF filtering, DMCA/abuse ticketing, quarantine workflow, and legal safe harbors',
    plainLanguage:
      'The moment a platform offers public web hosting, attackers will attempt to host phishing pages, distribute malware, or launch DDoS attacks. Furthermore, operators face copyright notices and legal inquiries. Security and abuse handling must be built into the core design from day one with clear quarantine buttons, tamper-evident audit logs, and clear legal safe-harbor workflows.',
    mermaidDiagram: `graph TD
    Attack[Malicious Traffic / Scanner / Phishing] --> Ingress[Caddy Ingress + Coraza WAF]
    Ingress -->|Suspicious pattern / CrowdSec Blocklist| Drop[Instant HTTP 403 / TCP Drop]
    Report[Abuse Report / DMCA Notice Received] --> Queue[Abuse Triage Queue in Admin Console]
    Queue --> Operator{Operator Action}
    Operator -->|Quarantine| Isolate[Set Tenant Status = Quarantined]
    Isolate --> CaddyRoute[Caddy rewrites host to Quarantine Landing Page]
    Isolate --> CgroupFreeze[Freeze / Stop Container Process]
    Operator -->|Audit Log| HashChain[Immutable SHA-256 Audit Record Created]`,
    options: [
      {
        name: 'CrowdSec + Coraza WAF (Caddy plugin)',
        license: 'MIT (CrowdSec) / Apache-2.0 (Coraza)',
        repoOrWebsite: 'crowdsec.net / coraza.io',
        pros: [
          'Collaborative community threat intelligence: when one node detects an IP probing, all nodes block it',
          'Coraza is a pure Go implementation of OWASP Core Rule Set, embedding directly into Caddy without C dependencies',
          'Permissive licenses (MIT / Apache-2.0)'
        ],
        cons: [
          'CrowdSec central API consensus requires internet connection (though operates offline with local cache)'
        ],
        communityFit: 'Fits the co-op philosophy perfectly: community members protect each other from malicious botnets.'
      },
      {
        name: 'Fail2ban',
        license: 'GPLv2',
        repoOrWebsite: 'fail2ban.org',
        pros: [
          'Decades of stability, simple regex log parsing, direct iptables/nftables manipulation'
        ],
        cons: [
          'Single-node only; doesn’t share threat intel; regex parsing of large log files consumes CPU'
        ],
        communityFit: 'Good baseline for SSH protection, but insufficient for dynamic L7 web application firewalls.'
      },
      {
        name: 'ModSecurity v3',
        license: 'Apache-2.0',
        repoOrWebsite: 'github.com/owasp-modsecurity/ModSecurity',
        pros: [
          'Established OWASP Core Rule Set benchmark'
        ],
        cons: [
          'C++ library maintenance has slowed down; difficult compilation with Caddy'
        ],
        communityFit: 'Superseded by Coraza for modern Go-based ingress proxies.'
      }
    ],
    recommendation: {
      chosen: 'Coraza WAF integrated into Caddy + CrowdSec community bouncer + Automated One-Click Quarantine in Node Agent',
      reasoning:
        'Provides instant automated mitigation against common exploits (SQLi, XSS, Path Traversal) via OWASP Core Rule Set, blocks malicious scanners via CrowdSec, and provides an immediate quarantine switch that suspends the tenant container and redirects web visitors to an official operator compliance page.',
      limitsAndTradeoffs:
        'Aggressive WAF rules can cause false positives for legitimate web applications (e.g. Markdown editors). Rules must be set to anomaly scoring mode with configurable per-tenant bypasses.',
      federationReadiness:
        'Nodes can share cryptographic signatures of known phishing kits or bad actor domains over a federated gossip network to protect the collective.'
    }
  }
];

export const phase1Summary = {
  openQuestions: [
    'Should the default installation mandate an external authoritative DNS provider (e.g., DNSimple/deSEC API) or should every inet.org node act as its own authoritative nameserver with glue records?',
    'What is the minimum viable hardware baseline: can we comfortably support 50 modest community static sites on a $6/month 2-vCPU 4GB RAM VPS, or should we set 8GB as the recommended floor?',
    'How should we structure multi-operator federation identity: should instances sign assertions with Ed25519 keys, or integrate with ActivityPub / W3C Decentralized Identifiers (DIDs)?'
  ],
  nextSteps: [
    'Define the full Phase 2 architecture document, control plane data models, and complete OpenAPI 3.1 schema for Node Agent.',
    'Specify the exact cgroups v2 slice hierarchy and Seccomp syscall filter list for tenant isolation.',
    'Formulate the STRIDE threat matrix and immutable audit log data structure.'
  ]
};
