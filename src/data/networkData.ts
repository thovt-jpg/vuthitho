import { NetworkConfig, PortForwardRule, DnsRecord, SimulationScenario } from '../types/network';

export const DEFAULT_CONFIG: NetworkConfig = {
  domain: 'bctech.asia',
  publicIp: '171.239.236.139',
  publicGateway: '171.239.236.1',
  lanSubnet: '192.168.1.0/24',
  lanGateway: '192.168.1.1',
  serverLanIp: '192.168.1.200',
  serverHostname: 'srv-master.bctech.asia',
  ftpPassiveRange: '50000-50100',
};

export const getPortForwardRules = (config: NetworkConfig): PortForwardRule[] => [
  // Web Service
  {
    id: 'web-http',
    service: 'Web',
    subService: 'HTTP (Chuyển hướng SSL)',
    protocol: 'TCP',
    externalPort: '80',
    internalIp: config.serverLanIp,
    internalPort: '80',
    description: 'Truy vấn Web HTTP không mã hóa (Dùng để xác thực Let\'s Encrypt ACME & chuyển hướng 301 sang HTTPS)',
    securityNote: 'Nên cấu hình Nginx tự động chuyển hướng sang HTTPS port 443.',
    isRequired: true,
  },
  {
    id: 'web-https',
    service: 'Web',
    subService: 'HTTPS (SSL/TLS)',
    protocol: 'TCP',
    externalPort: '443',
    internalIp: config.serverLanIp,
    internalPort: '443',
    description: 'Truy cập cổng Web chính thức cho bctech.asia với chứng chỉ SSL/TLS bảo mật cao (HTTP/2, TLS 1.3)',
    securityNote: 'Cài đặt chứng chỉ SSL miễn phí từ Let\'s Encrypt hoặc Commercial Wildcard SSL.',
    isRequired: true,
  },
  // Mail Service
  {
    id: 'mail-smtp-in',
    service: 'Mail',
    subService: 'SMTP Relay (Inbound)',
    protocol: 'TCP',
    externalPort: '25',
    internalIp: config.serverLanIp,
    internalPort: '25',
    description: 'Cổng nhận thư từ các Mail Server trên toàn thế giới gửi về hộp thư @bctech.asia (MTA to MTA)',
    securityNote: 'Bắt buộc mở để nhận mail từ bên ngoài (Gmail, Outlook). Cần chặn Open Relay để tránh bị spam list.',
    isRequired: true,
  },
  {
    id: 'mail-submission',
    service: 'Mail',
    subService: 'SMTP Submission (Client)',
    protocol: 'TCP',
    externalPort: '587',
    internalIp: config.serverLanIp,
    internalPort: '587',
    description: 'Người dùng dùng Outlook/Thunderbird/điện thoại gửi thư đi (bắt buộc xác thực mật khẩu + STARTTLS)',
    securityNote: 'Yêu cầu xác thực tài khoản và mã hóa đường truyền STARTTLS.',
    isRequired: true,
  },
  {
    id: 'mail-smtps',
    service: 'Mail',
    subService: 'SMTPS (SSL Direct)',
    protocol: 'TCP',
    externalPort: '465',
    internalIp: config.serverLanIp,
    internalPort: '465',
    description: 'Cổng gửi thư mã hóa SSL/TLS trực tiếp (Implicit TLS Submission)',
    securityNote: 'Khuyến nghị bật cho các ứng dụng mail client hiện đại.',
    isRequired: false,
  },
  {
    id: 'mail-imaps',
    service: 'Mail',
    subService: 'IMAPS (Đọc thư bảo mật)',
    protocol: 'TCP',
    externalPort: '993',
    internalIp: config.serverLanIp,
    internalPort: '993',
    description: 'Đồng bộ hộp thư, thư mục, trạng thái đã đọc giữa server và thiết bị người dùng qua SSL/TLS',
    securityNote: 'Chuẩn đồng bộ hiện đại nhất cho email, mã hóa an toàn.',
    isRequired: true,
  },
  {
    id: 'mail-pop3s',
    service: 'Mail',
    subService: 'POP3S (Tải thư về máy)',
    protocol: 'TCP',
    externalPort: '995',
    internalIp: config.serverLanIp,
    internalPort: '995',
    description: 'Tải thư về máy cá nhân qua kết nối mã hóa SSL (chỉ nên dùng khi không dùng IMAP)',
    securityNote: 'Khuyến khích dùng IMAP (993) thay vì POP3.',
    isRequired: false,
  },
  // FTP Service
  {
    id: 'ftp-control',
    service: 'FTP',
    subService: 'FTP Control Channel',
    protocol: 'TCP',
    externalPort: '21',
    internalIp: config.serverLanIp,
    internalPort: '21',
    description: 'Kênh điều khiển FTP (Truyền lệnh đăng nhập USER, PASS, LIST, CWD, RETR)',
    securityNote: 'Khuyến nghị bật FTPS (FTP over TLS/SSL) trên cổng 21 để chống lộ mật khẩu dạng rõ (plaintext).',
    isRequired: true,
  },
  {
    id: 'ftp-passive',
    service: 'FTP',
    subService: 'FTP Passive Data Ports',
    protocol: 'TCP',
    externalPort: config.ftpPassiveRange,
    internalIp: config.serverLanIp,
    internalPort: config.ftpPassiveRange,
    description: 'Dải cổng truyền dữ liệu Passive FTP (Truyền file, danh sách thư mục phía sau Router NAT)',
    securityNote: 'BẮT BUỘC khi FTP Server đặt sau NAT. Cần cấu hình pasv_address=Public_IP trong file cấu hình vsftpd.',
    isRequired: true,
  },
];

export const getDnsRecords = (config: NetworkConfig): DnsRecord[] => [
  {
    type: 'A',
    host: '@ (Apex Domain)',
    value: config.publicIp,
    ttl: 3600,
    purpose: 'Trỏ tên miền chính bctech.asia về địa chỉ IP Public của Router/Firewall',
  },
  {
    type: 'A',
    host: 'www',
    value: config.publicIp,
    ttl: 3600,
    purpose: 'Trỏ tên miền phụ www.bctech.asia về địa chỉ IP Public của hệ thống Web',
  },
  {
    type: 'A',
    host: 'mail',
    value: config.publicIp,
    ttl: 3600,
    purpose: 'Địa chỉ máy chủ thư điện tử mail.bctech.asia (dùng cho MX & khai báo mail client)',
  },
  {
    type: 'A',
    host: 'ftp',
    value: config.publicIp,
    ttl: 3600,
    purpose: 'Địa chỉ máy chủ truyền file ftp.bctech.asia (dùng cho FileZilla, WinSCP kết nối)',
  },
  {
    type: 'MX',
    host: '@',
    value: `mail.${config.domain}`,
    priority: 10,
    ttl: 3600,
    purpose: 'Bản ghi MX chỉ định mail.bctech.asia chịu trách nhiệm nhận email cho domain bctech.asia',
  },
  {
    type: 'TXT',
    host: '@',
    value: `v=spf1 mx ip4:${config.publicIp} ~all`,
    ttl: 3600,
    purpose: 'Bản ghi SPF chứng thực chỉ có IP Public này mới được quyền gửi email đại diện bctech.asia',
  },
  {
    type: 'TXT',
    host: '_dmarc',
    value: `v=DMARC1; p=quarantine; rua=mailto:postmaster@${config.domain}; pct=100`,
    ttl: 3600,
    purpose: 'Chính sách bảo mật DMARC chống giả mạo email mạo danh công ty bctech.asia',
  },
  {
    type: 'TXT',
    host: 'default._domainkey',
    value: 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD...',
    ttl: 3600,
    purpose: 'Chữ ký số điện tử DKIM bảo vệ tính toàn vẹn nội dung email không bị chỉnh sửa',
  },
  {
    type: 'PTR',
    host: `${config.publicIp.split('.').reverse().join('.')}.in-addr.arpa`,
    value: `mail.${config.domain}`,
    ttl: 86400,
    purpose: 'Bản ghi phân giải ngược rDNS (Đề nghị nhà mạng ISP như Viettel/VNPT/FPT cấu hình) để không bị rơi vào SPAM',
  },
];

export const getSimulationScenarios = (config: NetworkConfig): SimulationScenario[] => [
  {
    id: 'sim-web-https',
    title: 'Truy cập Website bctech.asia (HTTPS 443)',
    service: 'web',
    clientIp: '118.69.80.12',
    clientType: 'external_browser',
    description: 'Khách hàng ngoài Internet gõ https://bctech.asia trên trình duyệt Chrome/Safari',
    protocol: 'TCP / TLS 1.3',
    targetPort: 443,
    targetDomain: config.domain,
    steps: [
      {
        state: 'dns',
        title: 'Bước 1: Phân giải DNS',
        description: 'Trình duyệt truy vấn DNS cho bctech.asia. DNS Server trả về IP Public: ' + config.publicIp,
        srcIp: '118.69.80.12',
        srcPort: 52140,
        dstIp: '8.8.8.8',
        dstPort: 53,
        packetDetails: 'DNS Query: A bctech.asia -> Answer: ' + config.publicIp,
      },
      {
        state: 'internet',
        title: 'Bước 2: Gói tin gửi ra WAN',
        description: 'Client khởi tạo bắt tay TCP SYN gửi tới IP Public của Router tại cổng 443 (HTTPS)',
        srcIp: '118.69.80.12',
        srcPort: 52140,
        dstIp: config.publicIp,
        dstPort: 443,
        packetDetails: 'TCP SYN [Seq=0] to ' + config.publicIp + ':443',
      },
      {
        state: 'router_wan',
        title: 'Bước 3: Router kiểm tra Firewall & NAT',
        description: 'Router nhận gói tin ở cổng WAN. Kiểm tra bảng Port Forwarding: Port 443 được chuyển hướng về ' + config.serverLanIp + ':443.',
        srcIp: '118.69.80.12',
        srcPort: 52140,
        dstIp: config.publicIp,
        dstPort: 443,
        natAction: 'DNAT Rule: ' + config.publicIp + ':443 -> ' + config.serverLanIp + ':443',
        packetDetails: 'DNAT match found: Rewrite Dest IP to ' + config.serverLanIp,
      },
      {
        state: 'switch',
        title: 'Bước 4: Chuyển mạch qua LAN Switch',
        description: 'Router gửi gói tin qua cổng LAN (192.168.1.1) tới Switch mạng nội bộ để chuyển đến Server ' + config.serverLanIp,
        srcIp: '118.69.80.12',
        srcPort: 52140,
        dstIp: config.serverLanIp,
        dstPort: 443,
        packetDetails: 'Ethernet Frame: Dst MAC = Server 192.168.1.200',
      },
      {
        state: 'server',
        title: 'Bước 5: Web Server xử lý & Phản hồi',
        description: 'Nginx trên Server 192.168.1.200 nhận gói tin, hoàn tất bắt tay TLS 1.3 và gửi nội dung trang web bctech.asia',
        srcIp: config.serverLanIp,
        srcPort: 443,
        dstIp: '118.69.80.12',
        dstPort: 52140,
        packetDetails: 'HTTP/2 200 OK - bctech.asia Home HTML payload (24 KB)',
      },
      {
        state: 'router_snat',
        title: 'Bước 6: Router hoàn trả trạng thái NAT (SNAT)',
        description: 'Router nhận gói phản hồi từ 192.168.1.200, dịch địa chỉ nguồn trở lại IP Public ' + config.publicIp + ' và đẩy ra Internet cho Client',
        srcIp: config.publicIp,
        srcPort: 443,
        dstIp: '118.69.80.12',
        dstPort: 52140,
        natAction: 'Un-DNAT: Source rewritten from ' + config.serverLanIp + ' to ' + config.publicIp,
        packetDetails: 'Return packet successfully routed back to external user',
      },
    ],
  },
  {
    id: 'sim-mail-smtp',
    title: 'Nhận Email từ bên ngoài (SMTP Inbound Port 25)',
    service: 'mail',
    clientIp: '209.85.220.41',
    clientType: 'external_mail_mta',
    description: 'Máy chủ Google Gmail gửi email của đối tác đến hộp thư contact@bctech.asia',
    protocol: 'TCP / SMTP (TLS)',
    targetPort: 25,
    targetDomain: 'mail.' + config.domain,
    steps: [
      {
        state: 'dns',
        title: 'Bước 1: Tra cứu bản ghi MX',
        description: 'Gmail kiểm tra bản ghi MX của bctech.asia -> nhận giá trị mail.bctech.asia (IP: ' + config.publicIp + ')',
        srcIp: '209.85.220.41',
        srcPort: 41203,
        dstIp: '8.8.8.8',
        dstPort: 53,
        packetDetails: 'DNS Query: MX bctech.asia -> mail.bctech.asia (Priority 10)',
      },
      {
        state: 'router_wan',
        title: 'Bước 2: Gmail kết nối Port 25',
        description: 'Gói tin kết nối SMTP gửi tới IP Public ' + config.publicIp + ' cổng 25. Router kích hoạt rule Port Forwarding port 25 -> ' + config.serverLanIp + ':25.',
        srcIp: '209.85.220.41',
        srcPort: 41203,
        dstIp: config.publicIp,
        dstPort: 25,
        natAction: 'DNAT: ' + config.publicIp + ':25 -> ' + config.serverLanIp + ':25',
        packetDetails: 'SMTP 25 connection translated to 192.168.1.200:25',
      },
      {
        state: 'server',
        title: 'Bước 3: Postfix tiếp nhận & Kiểm tra SPF/DKIM',
        description: 'Postfix daemon trên 192.168.1.200 tiếp nhận, kiểm tra SPF/DKIM của người gửi, lưu thư vào Maildir người nhận.',
        srcIp: config.serverLanIp,
        srcPort: 25,
        dstIp: '209.85.220.41',
        dstPort: 41203,
        packetDetails: '250 2.0.0 Ok: queued as 4Y7H3k1L - Email accepted for contact@bctech.asia',
      },
    ],
  },
  {
    id: 'sim-ftp-passive',
    title: 'Tải file lên máy chủ FTP (Passive Mode Port 21 & 50000-50100)',
    service: 'ftp',
    clientIp: '42.112.88.90',
    clientType: 'external_ftp_client',
    description: 'Kỹ sư IT dùng FileZilla kết nối ftp.bctech.asia để upload dữ liệu sao lưu',
    protocol: 'TCP / FTP',
    targetPort: 21,
    targetDomain: 'ftp.' + config.domain,
    steps: [
      {
        state: 'internet',
        title: 'Bước 1: Kết nối kênh điều khiển (Control Port 21)',
        description: 'FileZilla kết nối tới ftp.bctech.asia (' + config.publicIp + ':21). Router chuyển hướng về ' + config.serverLanIp + ':21.',
        srcIp: '42.112.88.90',
        srcPort: 49300,
        dstIp: config.publicIp,
        dstPort: 21,
        natAction: 'DNAT: Port 21 -> ' + config.serverLanIp + ':21',
        packetDetails: 'FTP Command: USER admin / PASS **** -> 230 Login successful',
      },
      {
        state: 'server',
        title: 'Bước 2: Lệnh PASV & Đàm phán cổng dữ liệu',
        description: 'Client gửi lệnh PASV. Server trả về địa chỉ IP Public ' + config.publicIp + ' cùng cổng ngẫu nhiên trong dải ' + config.ftpPassiveRange + ' (ví dụ: Port 50022).',
        srcIp: config.serverLanIp,
        srcPort: 21,
        dstIp: '42.112.88.90',
        dstPort: 49300,
        packetDetails: '227 Entering Passive Mode (' + config.publicIp.split('.').join(',') + ',195,102) -> Port 50022',
      },
      {
        state: 'router_wan',
        title: 'Bước 3: Truyền dữ liệu qua cổng Passive (Port 50022)',
        description: 'Client mở kết nối thứ 2 đến ' + config.publicIp + ':50022. Router NAT chuyển tiếp đến ' + config.serverLanIp + ':50022 để upload file.',
        srcIp: '42.112.88.90',
        srcPort: 49301,
        dstIp: config.publicIp,
        dstPort: 50022,
        natAction: 'DNAT Range: Port 50022 -> ' + config.serverLanIp + ':50022',
        packetDetails: 'FTP Data Transfer: 150 Opening BINARY mode data connection for backup_data.zip',
      },
    ],
  },
  {
    id: 'sim-lan-hairpin',
    title: 'Truy cập nội bộ LAN: Hairpin NAT / NAT Loopback',
    service: 'lan',
    clientIp: '192.168.1.50',
    clientType: 'internal_office_pc',
    description: 'Nhân viên trong văn phòng (IP 192.168.1.50) gõ https://bctech.asia trên máy tính cắm cùng mạng LAN',
    protocol: 'TCP / HTTPS 443',
    targetPort: 443,
    targetDomain: config.domain,
    steps: [
      {
        state: 'client',
        title: 'Bước 1: Máy tính nội bộ hỏi DNS',
        description: 'Máy nội bộ 192.168.1.50 hỏi DNS cho bctech.asia -> nhận về IP Public ' + config.publicIp + ' (hoặc IP nội bộ nếu có Split-Brain DNS).',
        srcIp: '192.168.1.50',
        srcPort: 55430,
        dstIp: '192.168.1.1',
        dstPort: 53,
        packetDetails: 'DNS Query returns Public IP ' + config.publicIp,
      },
      {
        state: 'router_wan',
        title: 'Bước 2: Hiện tượng Hairpin NAT (NAT Loopback)',
        description: 'Gói tin gửi đến IP Public của chính Router từ mạng LAN. Nếu router không bật NAT Hairpinning, kết nối sẽ bị DROP!',
        srcIp: '192.168.1.50',
        srcPort: 55430,
        dstIp: config.publicIp,
        dstPort: 443,
        natAction: 'Hairpin NAT: Đổi Dest thành 192.168.1.200 VÀ đổi Src thành IP Router (192.168.1.1)',
        packetDetails: 'Dual-NAT applied to prevent asymmetric routing loop in LAN',
      },
      {
        state: 'server',
        title: 'Bước 3: Server phản hồi về Router rồi trả lại PC',
        description: 'Server 192.168.1.200 gửi phản hồi về Router (192.168.1.1), Router chuyển tiếp trả lại máy nhân viên 192.168.1.50 thành công!',
        srcIp: config.serverLanIp,
        srcPort: 443,
        dstIp: '192.168.1.1',
        dstPort: 55430,
        packetDetails: 'Connection established smoothly via NAT Hairpinning',
      },
    ],
  },
];

// Configuration script generators for various router models
export const generateRouterConfigs = (config: NetworkConfig) => {
  return {
    mikrotik: `# ========================================================
# CẤU HÌNH NAT PORT FORWARDING CHO MIKROTIK ROUTEROS
# Tên miền: ${config.domain} | IP Public: ${config.publicIp}
# Server Web, Mail, FTP: ${config.serverLanIp}
# ========================================================

# 1. Khai báo Interface WAN (ví dụ: ether1-WAN) và LAN (ether2-LAN)
/interface list
add name=WAN
add name=LAN
/interface list member
add interface=ether1-WAN list=WAN
add interface=ether2-LAN list=LAN

# 2. Port Forwarding Web (HTTP & HTTPS)
/ip firewall nat
add chain=dstnat action=dst-nat to-addresses=${config.serverLanIp} to-ports=80 protocol=tcp dst-address=${config.publicIp} dst-port=80 comment="Web HTTP bctech.asia"
add chain=dstnat action=dst-nat to-addresses=${config.serverLanIp} to-ports=443 protocol=tcp dst-address=${config.publicIp} dst-port=443 comment="Web HTTPS bctech.asia"

# 3. Port Forwarding Mail (SMTP, Submission, SMTPS, IMAPS, POP3S)
add chain=dstnat action=dst-nat to-addresses=${config.serverLanIp} to-ports=25 protocol=tcp dst-address=${config.publicIp} dst-port=25 comment="Mail SMTP Inbound (MX)"
add chain=dstnat action=dst-nat to-addresses=${config.serverLanIp} to-ports=587 protocol=tcp dst-address=${config.publicIp} dst-port=587 comment="Mail Submission STARTTLS"
add chain=dstnat action=dst-nat to-addresses=${config.serverLanIp} to-ports=465 protocol=tcp dst-address=${config.publicIp} dst-port=465 comment="Mail SMTPS SSL"
add chain=dstnat action=dst-nat to-addresses=${config.serverLanIp} to-ports=993 protocol=tcp dst-address=${config.publicIp} dst-port=993 comment="Mail IMAPS SSL"
add chain=dstnat action=dst-nat to-addresses=${config.serverLanIp} to-ports=995 protocol=tcp dst-address=${config.publicIp} dst-port=995 comment="Mail POP3S SSL"

# 4. Port Forwarding FTP (Control 21 & Passive Ports ${config.ftpPassiveRange})
add chain=dstnat action=dst-nat to-addresses=${config.serverLanIp} to-ports=21 protocol=tcp dst-address=${config.publicIp} dst-port=21 comment="FTP Control Port"
add chain=dstnat action=dst-nat to-addresses=${config.serverLanIp} to-ports=${config.ftpPassiveRange} protocol=tcp dst-address=${config.publicIp} dst-port=${config.ftpPassiveRange} comment="FTP Passive Data Ports"

# 5. CẤU HÌNH HAIRPIN NAT (Cho phép máy nội bộ LAN gõ bctech.asia truy cập được)
add chain=srcnat action=masquerade protocol=tcp src-address=${config.lanSubnet} dst-address=${config.serverLanIp} dst-port=80,443,21,25,587,993 comment="Hairpin NAT cho Server 192.168.1.200"
`,

    cisco: `! ========================================================
! CẤU HÌNH CISCO IOS ROUTER (NAT PORT FORWARDING)
! WAN: GigabitEthernet0/0 (IP ${config.publicIp})
! LAN: GigabitEthernet0/1 (IP ${config.lanGateway})
! Server: ${config.serverLanIp}
! ========================================================

configure terminal

! 1. Chỉ định hướng NAT trên interface
interface GigabitEthernet0/0
 description WAN-Internet
 ip nat outside
 exit

interface GigabitEthernet0/1
 description LAN-Internal
 ip nat inside
 exit

! 2. Ánh xạ cổng Web (HTTP / HTTPS)
ip nat inside source static tcp ${config.serverLanIp} 80 ${config.publicIp} 80 extendable
ip nat inside source static tcp ${config.serverLanIp} 443 ${config.publicIp} 443 extendable

! 3. Ánh xạ cổng Mail
ip nat inside source static tcp ${config.serverLanIp} 25 ${config.publicIp} 25 extendable
ip nat inside source static tcp ${config.serverLanIp} 587 ${config.publicIp} 587 extendable
ip nat inside source static tcp ${config.serverLanIp} 465 ${config.publicIp} 465 extendable
ip nat inside source static tcp ${config.serverLanIp} 993 ${config.publicIp} 993 extendable
ip nat inside source static tcp ${config.serverLanIp} 995 ${config.publicIp} 995 extendable

! 4. Ánh xạ cổng FTP
ip nat inside source static tcp ${config.serverLanIp} 21 ${config.publicIp} 21 extendable

! 5. Mở Access List cho Firewall WAN
ip access-list extended WAN-FIREWALL-IN
 permit tcp any host ${config.publicIp} eq 80
 permit tcp any host ${config.publicIp} eq 443
 permit tcp any host ${config.publicIp} eq 25
 permit tcp any host ${config.publicIp} eq 587
 permit tcp any host ${config.publicIp} eq 465
 permit tcp any host ${config.publicIp} eq 993
 permit tcp any host ${config.publicIp} eq 21
 permit tcp any host ${config.publicIp} range 50000 50100
 exit

interface GigabitEthernet0/0
 ip access-group WAN-FIREWALL-IN in
 exit

end
write memory
`,

    linuxIptables: `# ========================================================
# LINUX IPTABLES / UFW PORT FORWARDING SCRIPT
# Server Gateway / Linux Router: Public IP ${config.publicIp}
# Target Server: ${config.serverLanIp}
# ========================================================

# Bật IP Forwarding trong Linux kernel
sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf

WAN_IF="eth0"
LAN_IF="eth1"
SERVER_IP="${config.serverLanIp}"
PUBLIC_IP="${config.publicIp}"

# 1. PREROUTING (DNAT - Đổi IP đích từ Public sang IP Server 192.168.1.200)
# Web
iptables -t nat -A PREROUTING -i $WAN_IF -p tcp -m multiport --dports 80,443 -j DNAT --to-destination $SERVER_IP
# Mail
iptables -t nat -A PREROUTING -i $WAN_IF -p tcp -m multiport --dports 25,465,587,993,995 -j DNAT --to-destination $SERVER_IP
# FTP
iptables -t nat -A PREROUTING -i $WAN_IF -p tcp --dport 21 -j DNAT --to-destination $SERVER_IP:21
iptables -t nat -A PREROUTING -i $WAN_IF -p tcp --dport 50000:50100 -j DNAT --to-destination $SERVER_IP

# 2. FORWARD Chain (Cho phép chuyển tiếp gói tin)
iptables -A FORWARD -p tcp -d $SERVER_IP -m multiport --dports 80,443,25,465,587,993,995,21 -j ACCEPT
iptables -A FORWARD -p tcp -d $SERVER_IP --dport 50000:50100 -j ACCEPT
iptables -A FORWARD -m state --state ESTABLISHED,RELATED -j ACCEPT

# 3. POSTROUTING Masquerade (Ra Internet)
iptables -t nat -A POSTROUTING -o $WAN_IF -j MASQUERADE
`,

    pfsense: `<!-- pfSense / OPNsense Port Forwarding Configuration (Giao diện Web GUI hoặc XML Backup) -->
1. Đăng nhập Web GUI: Firewall > NAT > Port Forward > Nhấn Add:
   - Interface: WAN
   - Address Family: IPv4
   - Protocol: TCP
   - Destination: WAN Address
   - Destination port range:
     + Tạo Rule 1: HTTP / HTTPS (80, 443)
     + Tạo Rule 2: Mail (25, 465, 587, 993, 995)
     + Tạo Rule 3: FTP Control (21)
     + Tạo Rule 4: FTP Passive (${config.ftpPassiveRange})
   - Redirect target IP: ${config.serverLanIp}
   - Redirect target port: (Giữ nguyên tương ứng)
   - Filter rule association: "Rule NAT" (tự động tạo firewall pass rule)

2. BẬT NAT REFLECTION (NAT Hairpinning):
   - Vào System > Advanced > Firewall & NAT
   - Tại mục "Network Address Translation":
     + NAT Reflection mode for port forwards: Chọn "Pure NAT"
     + Enable NAT Reflection for 1:1 NAT: Đánh dấu check
     + Enable automatic outbound NAT for Reflection: Đánh dấu check
   - Nhấn Save & Apply Changes.
`,
  };
};

export const generateServerConfigs = (config: NetworkConfig) => {
  return {
    nginx: `# /etc/nginx/sites-available/${config.domain}
# Cấu hình Web Server Nginx cho tên miền ${config.domain}
# Đặt tại Server LAN: ${config.serverLanIp}

# 1. Chuyển hướng HTTP sang HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ${config.domain} www.${config.domain};

    # Thư mục xác thực chứng chỉ SSL tự động Let's Encrypt
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# 2. Máy chủ ảo HTTPS bảo mật (TLS 1.2 / TLS 1.3)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${config.domain} www.${config.domain};

    root /var/www/${config.domain}/public;
    index index.html index.htm index.php;

    # Chứng chỉ SSL (sinh bởi certbot --nginx)
    ssl_certificate /etc/letsencrypt/live/${config.domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${config.domain}/privkey.pem;

    # Tối ưu bảo mật SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384";
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Xử lý PHP (nếu chạy WordPress / Laravel)
    location ~ \\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
    }

    access_log /var/log/nginx/${config.domain}.access.log;
    error_log /var/log/nginx/${config.domain}.error.log;
}
`,

    postfix: `# /etc/postfix/main.cf
# Cấu hình Postfix Mail Transfer Agent (MTA)
# Tên miền: ${config.domain} | Hostname: mail.${config.domain}

myhostname = mail.${config.domain}
mydomain = ${config.domain}
myorigin = $mydomain

# Nghe trên tất cả các card mạng (bao gồm ${config.serverLanIp})
inet_interfaces = all
inet_protocols = ipv4

# Khai báo các domain tiếp nhận thư
mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain

# Bảo mật: CHỈ chuyển tiếp (relay) cho mạng LAN tin cậy, CHỐNG Open Relay!
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128 ${config.lanSubnet}
relay_domains = 

# Cấu hình lưu trữ dạng Maildir cho mỗi user
home_mailbox = Maildir/

# Chứng chỉ SSL/TLS cho SMTP
smtpd_tls_cert_file = /etc/letsencrypt/live/${config.domain}/fullchain.pem
smtpd_tls_key_file = /etc/letsencrypt/live/${config.domain}/privkey.pem
smtpd_tls_security_level = may
smtpd_tls_protocols = !SSLv2, !SSLv3, !TLSv1, !TLSv1.1
smtpd_tls_mandatory_protocols = !SSLv2, !SSLv3, !TLSv1, !TLSv1.1

# Bắt buộc xác thực với SASL qua Dovecot cho Client gửi qua port 587
smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth
smtpd_sasl_auth_enable = yes
smtpd_recipient_restrictions =
    permit_mynetworks,
    permit_sasl_authenticated,
    reject_unauth_destination,
    reject_rbl_client zen.spamhaus.org
`,

    vsftpd: `# /etc/vsftpd.conf
# Cấu hình FTP Server (vsftpd) phía sau thiết bị Router NAT
# Server LAN: ${config.serverLanIp} | Public IP: ${config.publicIp}

listen=YES
listen_ipv6=NO
anonymous_enable=NO
local_enable=YES
write_enable=YES
local_umask=022
dirmessage_enable=YES
use_localtime=YES
xferlog_enable=YES
connect_from_port_20=YES

# Cô lập người dùng trong thư mục riêng (Chroot)
chroot_local_user=YES
allow_writeable_chroot=YES

# ========================================================
# CẤU HÌNH PASSIVE FTP PHÍA SAU ROUTER NAT (BẮT BUỘC)
# Nếu thiếu dòng pasv_address, Client từ Internet sẽ KHÔNG
# lấy được danh sách thư mục (bị kẹt ở lệnh MLSD/LIST)!
# ========================================================
pasv_enable=YES
pasv_min_port=50000
pasv_max_port=50100
pasv_address=${config.publicIp}
pasv_addr_resolve=NO

# Bật mã hóa FTPS bảo mật (Tránh truyền mật khẩu dạng rõ trên mạng)
ssl_enable=YES
allow_anon_ssl=NO
force_local_data_ssl=YES
force_local_logins_ssl=YES
ssl_tlsv1_2=YES
ssl_ciphers=HIGH
rsa_cert_file=/etc/letsencrypt/live/${config.domain}/fullchain.pem
rsa_private_key_file=/etc/letsencrypt/live/${config.domain}/privkey.pem
`,

    ufw: `# Cấu hình Firewall UFW trên máy chủ Server LAN ${config.serverLanIp}
# Cho phép các cổng dịch vụ cần thiết và chặn các truy cập trái phép

# 1. Thiết lập chính sách mặc định
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 2. Cho phép SSH quản trị (Chỉ mở từ IP quản trị viên LAN nếu cần)
sudo ufw allow from 192.168.1.0/24 to any port 22 proto tcp comment 'SSH from LAN only'

# 3. Cho phép Web (Port 80, 443)
sudo ufw allow 80/tcp comment 'HTTP Web'
sudo ufw allow 443/tcp comment 'HTTPS Web bctech.asia'

# 4. Cho phép Mail (SMTP 25, 587, 465, IMAPS 993, POP3S 995)
sudo ufw allow 25/tcp comment 'SMTP Inbound'
sudo ufw allow 587/tcp comment 'SMTP Submission'
sudo ufw allow 465/tcp comment 'SMTPS Secure'
sudo ufw allow 993/tcp comment 'IMAPS Mail'
sudo ufw allow 995/tcp comment 'POP3S Mail'

# 5. Cho phép FTP (Port 21 và Passive Range 50000-50100)
sudo ufw allow 21/tcp comment 'FTP Control'
sudo ufw allow 50000:50100/tcp comment 'FTP Passive Data Range'

# 6. Kích hoạt UFW
sudo ufw enable
sudo ufw status verbose
`,
  };
};
