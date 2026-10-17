export const phase4OperatorDocs = {
  title: 'Operator Handbook: Deploying and Running an Autonomous inet.org Node',
  version: '1.0.0-rc1',
  prerequisites: {
    recommendedSpecs: '4 vCPU, 8 GB RAM, 80 GB NVMe/SSD, 1 Gbps port',
    minimumSpecs: '2 vCPU, 4 GB RAM, 40 GB SSD (Comfortably hosts 25-50 static/light dynamic sites)',
    supportedOS: 'Ubuntu 24.04 LTS or Debian 12 (Bookworm) with Linux 6.x kernel and cgroups v2 enabled by default',
    networkRequirements: 'Static public IPv4 address and static /64 IPv6 allocation. Ports 53/udp, 53/tcp, 80/tcp, and 443/tcp reachable from internet'
  },
  steps: [
    {
      stepNumber: 1,
      title: 'Host Preparation & Kernel Hardening (cgroups v2, sysctl, ulimits)',
      description: 'Prepare the clean Linux operating system with optimal socket limits, SYN flood protection, and cgroups v2 resource accounting.',
      terminalCommands: `# Update and upgrade base system packages
sudo apt update && sudo apt full-upgrade -y
sudo apt install -y curl git ufw jq dnsutils apparmor libcap2-bin

# Verify cgroups v2 is enabled (must output: cgroup2 on /sys/fs/cgroup type cgroup2)
mount | grep cgroup2

# Apply production kernel network sysctl settings
sudo tee /etc/sysctl.d/99-inet-node.conf << 'EOF'
# TCP SYN Flood Protection
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 8192
net.core.somaxconn = 65535

# High-concurrency socket recycling
net.ipv4.tcp_fin_timeout = 15
net.ipv4.ip_local_port_range = 1024 65535

# Allow unprivileged rootless containers to bind low ports (80 and 443)
net.ipv4.ip_unprivileged_port_start = 80

# Disable IP source routing and redirect acceptance
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0

# Swappiness: conserve memory for page cache, swap only under extreme pressure
vm.swappiness = 10
EOF

# Reload sysctl immediately
sudo sysctl --system`
    },
    {
      stepNumber: 2,
      title: 'Resolving Port 53 Conflicts with systemd-resolved',
      description: 'On modern Ubuntu systems, systemd-resolved listens on 127.0.0.53:53. We must disable its stub listener so CoreDNS can bind port 53 for authoritative DNS.',
      terminalCommands: `# Disable DNSStubListener in systemd-resolved
sudo mkdir -p /etc/systemd/resolved.conf.d
sudo tee /etc/systemd/resolved.conf.d/disable-stub.conf << 'EOF'
[Resolve]
DNS=9.9.9.9 149.112.112.112
DNSStubListener=no
EOF

# Update resolv.conf symlink to use real upstream resolver
sudo ln -sf /run/systemd/resolve/resolv.conf /etc/resolv.conf

# Restart systemd-resolved and verify port 53 is now completely free
sudo systemctl restart systemd-resolved
sudo ss -tulpn | grep ':53 ' || echo "SUCCESS: Port 53 is free!"`
    },
    {
      stepNumber: 3,
      title: 'Configuring UFW Firewall Rules',
      description: 'Lock down all ports except SSH, DNS, HTTP, and HTTPS.',
      terminalCommands: `# Configure UFW defaults
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (rate-limited against brute force)
sudo ufw limit 22/tcp comment 'SSH Secure Access'

# Allow Authoritative DNS
sudo ufw allow 53/udp comment 'DNS UDP'
sudo ufw allow 53/tcp comment 'DNS TCP'

# Allow Web Ingress
sudo ufw allow 80/tcp comment 'HTTP / ACME Challenge'
sudo ufw allow 443/tcp comment 'HTTPS TLS Traffic'
sudo ufw allow 443/udp comment 'HTTP/3 QUIC Traffic'

# Enable firewall
sudo ufw --force enable
sudo ufw status verbose`
    },
    {
      stepNumber: 4,
      title: 'Installing Container Runtime (Rootless Docker / Podman)',
      description: 'Install modern container runtime tools to supervise tenant sandboxes without granting them host root privileges.',
      terminalCommands: `# Install Docker Engine and Docker Compose plugin
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Create dedicated unprivileged system user for inet node daemon
sudo useradd -r -m -s /bin/bash -d /opt/inet inet-node
sudo usermod -aG docker inet-node`
    },
    {
      stepNumber: 5,
      title: 'Cloning and Bootstrapping the inet.org Node Stack',
      description: 'Clone the MIT-licensed node repository, configure environment variables, and launch the multi-tenant stack.',
      terminalCommands: `# Switch to inet-node user
sudo su - inet-node

# Clone the inet.org repository
git clone https://github.com/inet-org/node-core.git /opt/inet/app
cd /opt/inet/app

# Generate production cryptographically secure secrets
cp .env.example .env
sed -i "s/MY_NODE_SECRET/$(openssl rand -hex 32)/g" .env
sed -i "s/MY_PUBLIC_IP/$(curl -s https://api.ipify.org)/g" .env

# Initialize directory structures with correct permissions (0750)
mkdir -p config/caddy config/coredns/zones/tenants tenants pages logs
chmod -R 0750 /opt/inet/app

# Start the node services via Docker Compose
docker compose up -d

# Check service health
docker compose ps`
    },
    {
      stepNumber: 6,
      title: 'Setting Up Domain Glue Records at Registrar',
      description: 'To allow tenants to delegate custom domains or subdomains to this node, set up Nameserver Glue Records at your domain registrar.',
      terminalCommands: `# At your registrar (e.g. Gandi, Namecheap, Porkbun):
# 1. Create Host / Glue Records:
#    ns1.your-node-domain.org -> <YOUR_PUBLIC_IPv4>
#    ns2.your-node-domain.org -> <YOUR_PUBLIC_IPv4>
#
# 2. Add NS records to your node zone:
#    @   IN   NS   ns1.your-node-domain.org.
#    @   IN   NS   ns2.your-node-domain.org.

# Test that the world can query your nameserver directly
dig @YOUR_PUBLIC_IPv4 your-node-domain.org A +short`
    },
    {
      stepNumber: 7,
      title: 'Running the Automated Node Verification Suite',
      description: 'Run the included test-prototype.sh script to confirm that Caddy, CoreDNS, the Ask endpoint, and cgroups limits are functioning properly.',
      terminalCommands: `# Run the verification test script
bash scripts/test-prototype.sh

# Expected Output:
# ✓ [PASS] Node Agent API is healthy
# ✓ [PASS] Active domain returns HTTP 200 (Cert allowed)
# ✓ [PASS] Unknown domain returns HTTP 403 (Cert refused)
# ✓ [PASS] CoreDNS resolved civic-library.org to 198.51.100.42
# ✓ [PASS] Abuse quarantine workflow verified
# ✓ [PASS] Audit chain has 3 cryptographically verified entries`
    },
    {
      stepNumber: 8,
      title: 'Automated Encrypted Backups with Restic',
      description: 'Configure automated daily offsite encrypted backups to peer community storage (Garage S3 or federated rsync).',
      terminalCommands: `# Install restic backup tool
sudo apt install -y restic

# Initialize encrypted repository (to local secondary drive or community S3)
export RESTIC_REPOSITORY="s3:https://s3.peer-node.org/inet-backups-node-01"
export RESTIC_PASSWORD_FILE="/etc/inet/backup_pass.txt"
restic init

# Set up automated systemd backup timer for /opt/inet/app
sudo tee /etc/systemd/system/inet-backup.service << 'EOF'
[Unit]
Description=Daily Encrypted Backup for inet.org Node
After=network.target

[Service]
Type=oneshot
User=root
EnvironmentFile=/etc/inet/backup.env
ExecStart=/usr/bin/restic backup /opt/inet/app --exclude /opt/inet/app/logs
ExecStartPost=/usr/bin/restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 12 --prune
EOF`
    }
  ],
  troubleshooting: [
    {
      issue: 'CoreDNS fails to start with "listen udp :53: bind: address already in use"',
      cause: 'systemd-resolved stub listener is still bound to 127.0.0.53:53.',
      solution: 'Re-run Step 2 to disable DNSStubListener in /etc/systemd/resolved.conf.d/disable-stub.conf and reload systemd-resolved.'
    },
    {
      issue: 'Let’s Encrypt fails with "429 Too Many Requests: error creating certificate"',
      cause: 'Rate limits hit during testing with the production Let’s Encrypt endpoint.',
      solution: 'Switch Caddy’s acme_ca setting in Caddyfile to the Let’s Encrypt Staging environment (https://acme-staging-v02.api.letsencrypt.org/directory) until testing is complete.'
    },
    {
      issue: 'Tenant process killed immediately with SIGKILL',
      cause: 'Tenant exceeded memory.max limit in cgroup (OOM killer triggered).',
      solution: 'Check dmesg for "oom-kill:constraint=CONSTRAINT_MEMCG". If legitimate workload, increase tenant memory allocation via Admin Console (/api/v1/sites/:id).'
    },
    {
      issue: 'Abuse quarantine button clicked, but site still serves stale cached pages to some visitors',
      cause: 'Browser cache or intermediate ISP cache is serving cached 200 OK responses.',
      solution: 'Caddy sends Cache-Control: no-cache, no-store, must-revalidate on quarantined routes. For intermediate proxies, issue an RFC 7034 PURGE request.'
    }
  ],
  openQuestions: [
    'Should we provide an automated Ansible playbook and Terraform module for 1-click cloud VPS provisioning (e.g. Hetzner, OVH, Linode)?',
    'How do we handle multi-operator key rotation when a volunteer administrator leaves the cooperative?'
  ],
  nextSteps: [
    'Define Phase 5 Governance, Transparent Cost Accounting, Grant Ledger, and Legal Terms of Service.'
  ]
};
