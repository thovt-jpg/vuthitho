import React from 'react';
import { NetworkConfig, GrayTone } from '../types/network';
import { 
  X, 
  Server, 
  ShieldCheck, 
  Globe, 
  Mail, 
  FolderDown, 
  Network, 
  Laptop, 
  CheckCircle2, 
  AlertTriangle,
  Copy,
  ExternalLink
} from 'lucide-react';

interface NodeDetailDrawerProps {
  nodeId: string | null;
  onClose: () => void;
  config: NetworkConfig;
  onSwitchTab?: (tab: string) => void;
  grayTheme?: GrayTone;
}

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
  nodeId,
  onClose,
  config,
  onSwitchTab,
  grayTheme = 'slate-gray',
}) => {
  if (!nodeId) return null;

  const renderContent = () => {
    switch (nodeId) {
      case 'server-master':
        return {
          title: `Máy chủ Đa dịch vụ (All-in-One Server)`,
          subtitle: `IP LAN Nội bộ: ${config.serverLanIp} | Hostname: ${config.serverHostname}`,
          icon: <Server className="w-6 h-6 text-emerald-400" />,
          color: 'emerald',
          details: [
            { label: 'Địa chỉ IP tĩnh (Static IP)', value: config.serverLanIp },
            { label: 'Subnet Mask', value: '255.255.255.0 (/24)' },
            { label: 'Cổng Gateway trỏ về', value: config.lanGateway + ' (Router)' },
            { label: 'DNS Server nội bộ', value: '1.1.1.1, 8.8.8.8' },
            { label: 'Hệ điều hành khuyến nghị', value: 'Ubuntu Server 22.04 LTS / Rocky Linux 9' },
            { label: 'Các dịch vụ đang chạy', value: '(Web),(Mail), vsftpd (FTP)' },
          ],
          note: `Máy chủ được đặt trong dải mạng LAN 192.168.1.0/24. Để khách hàng từ Internet truy cập được, thiết bị Router/Firewall biên bắt buộc phải cấu hình Port Forwarding (DNAT) các cổng tương ứng về IP ${config.serverLanIp}.`,
        };

      case 'service-web':
        return {
          title: `Dịch vụ Web Server (bctech.asia)`,
          subtitle: `Dịch vụ Web Hosting (HTTP / HTTPS) trên IP ${config.serverLanIp}`,
          icon: <Globe className="w-6 h-6 text-emerald-400" />,
          color: 'emerald',
          details: [
            { label: 'Domain chính (Apex)', value: config.domain },
            { label: 'Domain phụ (Subdomain)', value: `www.${config.domain}` },
            { label: 'Cổng HTTP (Cleartext)', value: 'Port 80 TCP (Chuyển hướng 301 sang 443)' },
            { label: 'Cổng HTTPS (Bảo mật SSL)', value: 'Port 443 TCP (TLS 1.2 / TLS 1.3)' },
            { label: 'Chứng chỉ SSL/TLS', value: 'Let\'s Encrypt Certbot tự động gia hạn' },
            { label: 'Thư mục mã nguồn Web', value: `/var/www/${config.domain}/public` },
          ],
          note: `Truy vấn từ bên ngoài gõ https://bctech.asia sẽ đến IP Public ${config.publicIp}:443, sau đó Router NAT chuyển tiếp trọn vẹn đến ${config.serverLanIp}:443.`,
        };

      case 'service-mail':
        return {
          title: `Dịch vụ Mail Server (mail.bctech.asia)`,
          subtitle: `Dịch vụ Mail Server (SMTP / IMAP) trên IP ${config.serverLanIp}`,
          icon: <Mail className="w-6 h-6 text-amber-400" />,
          color: 'amber',
          details: [
            { label: 'Hostname máy chủ mail', value: `mail.${config.domain}` },
            { label: 'Cổng nhận thư quốc tế (MX)', value: 'Port 25 TCP (MTA to MTA)' },
            { label: 'Cổng gửi thư người dùng (Client)', value: 'Port 587 TCP (STARTTLS + Auth)' },
            { label: 'Cổng SMTPS bảo mật', value: 'Port 465 TCP (SSL/TLS direct)' },
            { label: 'Cổng đọc thư IMAPS', value: 'Port 993 TCP (Mã hóa SSL/TLS)' },
            { label: 'Giao diện Webmail WorldClient', value: 'https://mail.bctech.asia:8443' },
            { label: 'Bản ghi xác thực bắt buộc', value: 'MX (10), SPF (TXT), DKIM, DMARC' },
          ],
          note: `Lưu ý quan trọng: Đường truyền Internet tại văn phòng cần có IP tĩnh và không bị nhà mạng (ISP) chặn cổng 25 Outbound. Đồng thời cần đăng ký rDNS (Reverse PTR) với ISP để email gửi sang Gmail/Yahoo không bị coi là Spam.`,
        };

      case 'service-ftp':
        return {
          title: `Dịch vụ FTP Server (ftp.bctech.asia)`,
          subtitle: `vsftpd (Very Secure FTP Daemon) trên IP ${config.serverLanIp}`,
          icon: <FolderDown className="w-6 h-6 text-cyan-400" />,
          color: 'cyan',
          details: [
            { label: 'Hostname FTP', value: `ftp.${config.domain}` },
            { label: 'Cổng điều khiển lệnh (Control)', value: 'Port 21 TCP' },
            { label: 'Chế độ hoạt động qua NAT', value: 'Passive Mode (Bắt buộc phía sau Router)' },
            { label: 'Dải cổng truyền dữ liệu PASV', value: `Port TCP ${config.ftpPassiveRange}` },
            { label: 'Cấu hình vsftpd then chốt', value: `pasv_address=${config.publicIp}` },
            { label: 'Mã hóa truyền tải', value: 'FTPS (FTP over TLS/SSL port 21)' },
          ],
          note: `Lỗi phổ biến nhất của FTP sau NAT: Nếu không khai báo pasv_address=${config.publicIp} và không mở dải cổng Passive (${config.ftpPassiveRange}), phần mềm như FileZilla sẽ bị treo vô tận ở lệnh 'MLSD' hoặc 'LIST'.`,
        };

      case 'router-firewall':
        return {
          title: `Router & Tường lửa Biên (Edge Gateway)`,
          subtitle: `Thiết bị phân chia WAN (Internet) và LAN nội bộ`,
          icon: <ShieldCheck className="w-6 h-6 text-sky-400" />,
          color: 'blue',
          details: [
            { label: 'Cổng WAN (Public IP)', value: `${config.publicIp} (Kết nối ISP)` },
            { label: 'Cổng LAN (Internal Gateway)', value: `${config.lanGateway}/24 (Kết nối mạng nội bộ)` },
            { label: 'Cơ chế định tuyến dịch chuyển', value: 'Destination NAT (DNAT) / Port Forwarding' },
            { label: 'Tính năng hỗ trợ truy cập nội bộ', value: 'Hairpin NAT / NAT Loopback (Bắt buộc)' },
            { label: 'Thiết bị tương thích mẫu', value: 'MikroTik RouterOS, Cisco, pfSense, DrayTek, FortiGate' },
          ],
          note: `Router đóng vai trò người gác cổng: Nhận các gói tin gửi đến IP Public ${config.publicIp} ở các cổng 80, 443, 25, 587, 993, 21, ${config.ftpPassiveRange} và thay đổi địa chỉ đích thành IP nội bộ ${config.serverLanIp}.`,
        };

      case 'lan-switch':
        return {
          title: `Switch Chuyển Mạch Mạng LAN`,
          subtitle: `Phân phối kết nối mạng nội bộ 1Gbps / 10Gbps`,
          icon: <Network className="w-6 h-6 text-emerald-400" />,
          color: 'emerald',
          details: [
            { label: 'Băng thông chuyển mạch', value: '1000 Mbps (Gigabit Ethernet)' },
            { label: 'VLAN áp dụng hiện tại', value: 'Default VLAN 1 (192.168.1.0/24)' },
            { label: 'Kết nối trực tiếp', value: `Router Gateway (${config.lanGateway}) ➔ Server (${config.serverLanIp})` },
            { label: 'Khuyến nghị nâng cao', value: 'Tách riêng VLAN DMZ cho Server để bảo vệ máy tính nhân viên' },
          ],
          note: `Đảm bảo Switch có port Gigabit nối đến máy chủ để đảm bảo tốc độ truyền tải web và tải file FTP dung lượng lớn.`,
        };

      case 'client-web':
      case 'client-mail':
      case 'client-ftp':
        return {
          title: `Người dùng Bên ngoài Internet (WAN Clients)`,
          subtitle: `Truy cập thông qua tên miền ${config.domain}`,
          icon: <Globe className="w-6 h-6 text-indigo-400" />,
          color: 'indigo',
          details: [
            { label: 'Cách thức nhận diện hệ thống', value: `Qua hệ thống máy chủ tên miền DNS toàn cầu` },
            { label: 'Địa chỉ IP họ nhìn thấy', value: config.publicIp },
            { label: 'Họ có biết IP 192.168.1.200 không?', value: 'KHÔNG (IP LAN hoàn toàn ẩn sau NAT)' },
            { label: 'Bảo mật truyền tải', value: 'Mọi dữ liệu nhạy cảm đều được mã hóa bằng SSL/TLS' },
          ],
          note: `Khách hàng từ bên ngoài không hề biết máy chủ thực chất đang nằm trong một mạng gia đình/văn phòng có IP 192.168.1.200 nhờ kỹ thuật ẩn giấu của NAT.`,
        };

      case 'client-internal':
        return {
          title: `Máy tính Văn phòng LAN (Internal Client)`,
          subtitle: `Cùng lớp mạng với Server (${config.serverLanIp})`,
          icon: <Laptop className="w-6 h-6 text-slate-400" />,
          color: 'slate',
          details: [
            { label: 'Địa chỉ IP máy tính nội bộ', value: '192.168.1.50 (DHCP cấp)' },
            { label: 'Cổng Gateway trỏ về', value: config.lanGateway },
            { label: 'Khi gõ IP trực tiếp', value: `http://${config.serverLanIp} ➔ Vào thẳng không qua Router` },
            { label: 'Khi gõ https://bctech.asia', value: 'Cần Hairpin NAT trên Router hoặc DNS Split-Brain!' },
          ],
          note: `Nếu không bật Hairpin NAT trên Router: Khi nhân viên trong cty gõ https://bctech.asia, trình duyệt sẽ xoay tít và báo lỗi timeout dù bên ngoài Internet vào bình thường.`,
        };

      default:
        return null;
    }
  };

  const data = renderContent();
  if (!data) return null;

  const isLight = grayTheme === 'light-gray';
  const isCool = grayTheme === 'cool-gray';

  const drawerBg = isLight 
    ? 'bg-white border-slate-300 text-slate-900' 
    : isCool 
    ? 'bg-[#2a303c] border-[#3f4756] text-slate-100' 
    : 'bg-[#222731] border-[#363f50] text-slate-100';

  const subBoxBg = isLight 
    ? 'bg-[#f8fafc] border-slate-200' 
    : isCool 
    ? 'bg-[#21262f] border-[#363f50]' 
    : 'bg-[#1a1e26] border-[#2c3340]';

  return (
    <div className={`fixed inset-y-0 right-0 w-full sm:w-[450px] border-l shadow-2xl z-50 flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-200 ${drawerBg}`}>
      {/* Header */}
      <div className={`p-5 border-b flex items-start justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-700/60'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
            {data.icon}
          </div>
          <div>
            <h3 className={`text-base font-bold leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>{data.title}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{data.subtitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Information */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
        {/* Key Metrics / Specs */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Thông số kỹ thuật & Thiết lập
          </h4>
          <div className={`rounded-xl border divide-y overflow-hidden ${subBoxBg} ${isLight ? 'divide-slate-200' : 'divide-slate-800/80'}`}>
            {data.details.map((item, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between text-xs gap-3">
                <span className="text-slate-400 font-medium">{item.label}</span>
                <span className={`font-semibold font-mono text-right truncate max-w-[220px] ${isLight ? 'text-slate-900' : 'text-slate-200'}`} title={item.value}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Explanatory Note */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs mb-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Phân tích nguyên lý hoạt động</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {data.note}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2 pt-2">
          {onSwitchTab && (
            <>
              <button
                onClick={() => onSwitchTab('nat-table')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-semibold transition-all"
              >
                <span>Xem bảng Port Forwarding cho thiết bị</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onSwitchTab('dns-records')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-semibold transition-all"
              >
                <span>Xem bản ghi DNS ({config.domain})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onSwitchTab('server-configs')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold transition-all"
              >
                <span>Xem file cấu hình Server (IIS, MDEAMON)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-all"
        >
          Đóng cửa sổ
        </button>
      </div>
    </div>
  );
};
