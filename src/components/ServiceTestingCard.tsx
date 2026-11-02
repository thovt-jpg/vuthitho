import React, { useState } from 'react';
import { NetworkConfig, GrayTone } from '../types/network';
import { 
  Globe, 
  Mail, 
  FolderDown, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Terminal, 
  Copy, 
  Check, 
  Wifi, 
  AlertCircle,
  FileText,
  Lock,
  ArrowUpRight,
  Server
} from 'lucide-react';
import { PdfViewerModal } from './PdfViewerModal';

interface ServiceTestingCardProps {
  config: NetworkConfig;
  grayTheme?: GrayTone;
}

export const ServiceTestingCard: React.FC<ServiceTestingCardProps> = ({ config, grayTheme = 'slate-gray' }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  const isLight = grayTheme === 'light-gray';
  const isCool = grayTheme === 'cool-gray';

  const containerBg = isLight 
    ? 'bg-white border-slate-300 text-slate-900 shadow-md' 
    : isCool 
    ? 'bg-[#333a48] border-[#434d5e] text-slate-100 shadow-xl' 
    : 'bg-[#282e3b] border-[#363f50] text-slate-100 shadow-xl';

  const cardBg = isLight
    ? 'bg-[#f8fafc] border-slate-200 text-slate-900 hover:border-blue-400'
    : isCool
    ? 'bg-[#252b36] border-[#3a4454] text-slate-100 hover:border-slate-400'
    : 'bg-[#1f242e] border-[#2e3746] text-slate-100 hover:border-slate-400';

  const terminalBg = isLight ? 'bg-slate-950 text-emerald-400 border-slate-800' : 'bg-slate-950 text-emerald-400 border-slate-800';

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className={`border rounded-2xl p-6 space-y-6 transition-colors ${containerBg}`}>
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 ${isLight ? 'border-slate-200' : 'border-slate-700/60'}`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
              Kiểm Tra Hoạt Động Hệ Thống
            </span>
            <span className="text-xs text-slate-500 font-medium">Mục 4.1 Giáo trình Thực Hành</span>
          </div>
          <h3 className={`text-xl font-black flex items-center gap-2 mt-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Wifi className="w-6 h-6 text-emerald-500" />
            Kiểm Tra Kết Nối & Truy Cập Dịch Vụ Mạng ({config.domain})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kiểm tra liên kết trực tiếp các dịch vụ Web, Webmail qua tên miền công cộng và thử nghiệm phân giải DNS, định tuyến NAT Port Forwarding.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 active:scale-95"
            title="Xem hướng dẫn kiểm thử chi tiết trong tài liệu configWindowServer.pdf"
          >
            <FileText className="w-4 h-4" />
            <span>Xem tài liệu kiểm tra (PDF)</span>
          </button>
        </div>
      </div>

      {/* Primary Verification Links Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Web Server Verification */}
        <div className={`border-2 rounded-2xl p-5 transition-all flex flex-col justify-between group shadow-sm ${cardBg}`}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-emerald-700 dark:text-emerald-400">
                    1. Kiểm Tra Dịch Vụ Website
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">Port 80 (HTTP) • Port 443 (HTTPS)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Hoạt động
              </span>
            </div>

            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 mb-4">
              Kiểm tra truy cập trang chủ web doanh nghiệp với chứng chỉ bảo mật mã hóa SSL/TLS, cơ chế tự động chuyển hướng HTTP sang HTTPS thông qua IIS URL Rewrite Module.
            </p>

            <div className="space-y-2 mb-4 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/5 dark:bg-black/30 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Đích đến nội bộ:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{config.serverLanIp}:443 (IIS)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/5 dark:bg-black/30 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Public IP WAN:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{config.publicIp}:443</span>
              </div>
            </div>
          </div>

          {/* Primary Link Button */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <a
              href="https://www.bctech.asia"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl shadow-md transition-all active:scale-[0.99] text-sm group-hover:shadow-emerald-500/20"
            >
              <Lock className="w-4 h-4 text-emerald-200" />
              <span>Mở liên kết: https://www.bctech.asia</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
              <span>Tên miền phụ: bctech.asia</span>
              <a 
                href="http://www.bctech.asia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                Kiểm tra Redirect HTTP 80 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Card 2: Webmail Server Verification */}
        <div className={`border-2 rounded-2xl p-5 transition-all flex flex-col justify-between group shadow-sm ${cardBg}`}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-amber-700 dark:text-amber-400">
                    2. Kiểm Tra Hộp Thư Webmail
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">MDaemon WorldClient (HTTPS 443 / 8443)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Hoạt động
              </span>
            </div>

            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 mb-4">
              Kiểm tra đăng nhập giao diện webmail WorldClient, gửi/nhận email nội bộ và liên mạng theo tiêu chuẩn bảo mật SPF, DKIM, DMARC và phân quyền hòm thư.
            </p>

            <div className="space-y-2 mb-4 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/5 dark:bg-black/30 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Tài khoản mẫu:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">thovt@bctech.asia / thuytl@bctech.asia</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/5 dark:bg-black/30 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Giao thức thư:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">SMTP 25/587 • POP3S 995 • IMAPS 993</span>
              </div>
            </div>
          </div>

          {/* Primary Links Buttons: https://mail.bctech.asia:8443 */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            {/* Primary Link: https://mail.bctech.asia:8443 */}
            <a
              href="https://mail.bctech.asia:8443"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold rounded-xl shadow-md transition-all active:scale-[0.99] text-sm group-hover:shadow-amber-500/20"
            >
              <Mail className="w-4 h-4 text-amber-200" />
              <span>Mở liên kết: https://mail.bctech.asia:8443</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            {/* Quick FQDN Link */}
            <div className="flex items-center justify-between gap-2 pt-1 text-xs font-mono">
              <span className="text-slate-500">Cổng HTTPS Webmail:</span>
              <a
                href="https://mail.bctech.asia:8443"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 font-bold transition-colors border border-amber-500/30"
              >
                <span>https://mail.bctech.asia:8443</span>
                <ExternalLink className="w-3 h-3 text-amber-500" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Testing Cards: FTPS & DNS / Command Line Verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 3: FTPS Server Verification */}
        <div className={`border rounded-2xl p-5 ${cardBg}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <FolderDown className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-cyan-700 dark:text-cyan-400">
                  3. Kiểm Tra Dịch Vụ FTP & FTPS Mã Hóa
                </h4>
                <p className="text-[11px] text-slate-500 font-mono">ftp.bctech.asia • Port 21 TCP • Passive 50000-50100</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              FTPS Explicit
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 mb-3">
            Sử dụng <b>FileZilla</b> hoặc <b>WinSCP</b> kết nối tới <code className="font-mono text-cyan-600 dark:text-cyan-400">ftp.bctech.asia</code>, bật chế độ <b>Require Explicit FTP over TLS</b> và chế độ thụ động <b>Passive Mode (PASV)</b>.
          </p>

          <div className="p-3 bg-black/5 dark:bg-black/30 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Host kết nối:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">ftp.bctech.asia</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cổng điều khiển:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">21 (Control) / 990 (Implicit)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Dải cổng Passive:</span>
              <span className="font-bold text-cyan-600 dark:text-cyan-400">{config.ftpPassiveRange} TCP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Lưu ý Router:</span>
              <span className="font-bold text-rose-500">Đã tắt FTP ALG trên Router</span>
            </div>
          </div>
        </div>

        {/* Card 4: Command Line Diagnostic Tools */}
        <div className={`border rounded-2xl p-5 ${cardBg}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-purple-700 dark:text-purple-400">
                  4. Lệnh Kiểm Tra Phân Giải DNS & Bắt Tay Mạng
                </h4>
                <p className="text-[11px] text-slate-500 font-mono">Command Prompt (cmd) / Terminal</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {/* Command 1 */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/5 dark:bg-black/30 border border-slate-200 dark:border-slate-800">
              <code className="text-slate-800 dark:text-slate-200">nslookup www.bctech.asia</code>
              <button
                onClick={() => handleCopy('nslookup www.bctech.asia')}
                className="text-slate-400 hover:text-white transition-colors"
                title="Sao chép lệnh"
              >
                {copiedCmd === 'nslookup www.bctech.asia' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Command 2 */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/5 dark:bg-black/30 border border-slate-200 dark:border-slate-800">
              <code className="text-slate-800 dark:text-slate-200">nslookup mail.bctech.asia</code>
              <button
                onClick={() => handleCopy('nslookup mail.bctech.asia')}
                className="text-slate-400 hover:text-white transition-colors"
                title="Sao chép lệnh"
              >
                {copiedCmd === 'nslookup mail.bctech.asia' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Command 3 */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/5 dark:bg-black/30 border border-slate-200 dark:border-slate-800">
              <code className="text-slate-800 dark:text-slate-200">curl -I https://www.bctech.asia</code>
              <button
                onClick={() => handleCopy('curl -I https://www.bctech.asia')}
                className="text-slate-400 hover:text-white transition-colors"
                title="Sao chép lệnh"
              >
                {copiedCmd === 'curl -I https://www.bctech.asia' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Command 4 */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/5 dark:bg-black/30 border border-slate-200 dark:border-slate-800">
              <code className="text-slate-800 dark:text-slate-200">curl -k -I https://mail.bctech.asia:8443</code>
              <button
                onClick={() => handleCopy('curl -k -I https://mail.bctech.asia:8443')}
                className="text-slate-400 hover:text-white transition-colors"
                title="Sao chép lệnh"
              >
                {copiedCmd === 'curl -k -I https://mail.bctech.asia:8443' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lab Verification Guidance Notes from PDF */}
      <div className={`p-4 rounded-xl border text-xs space-y-2 ${isLight ? 'bg-blue-50/70 border-blue-200 text-blue-950' : 'bg-blue-950/20 border-blue-800/40 text-blue-200'}`}>
        <div className="flex items-center gap-2 font-bold text-sm">
          <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
          <span>Hướng Dẫn Kiểm Thử Từ Tài Liệu configWindowServer.pdf (Mục 4.1):</span>
        </div>
        <p className="leading-relaxed">
          • <b>Kiểm tra từ máy tính nội bộ LAN:</b> Đảm bảo máy trạm gán DNS Server là <code className="font-mono font-bold">{config.serverLanIp}</code> và Router đã bật tính năng <b>Hairpin NAT (NAT Loopback)</b> để truy cập được cả IP nội bộ lẫn tên miền công cộng.
          <br />
          • <b>Kiểm tra từ ngoài Internet:</b> Truy vấn DNS trỏ về IP Public <code className="font-mono font-bold">{config.publicIp}</code>, các cổng dịch vụ 80, 443, 21, 50000-50100 đã được NAT đầy đủ trên Router MikroTik / DrayTek.
        </p>
      </div>

      {/* PDF Modal Viewer */}
      <PdfViewerModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        pdfUrl="/configWindowServer.pdf"
        title="configWindowServer.pdf"
      />
    </div>
  );
};
