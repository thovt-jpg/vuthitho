import React, { useState } from 'react';
import { NetworkConfig, GrayTone } from '../types/network';
import { generateServerConfigs } from '../data/networkData';
import { PdfViewerModal } from './PdfViewerModal';
import { 
  Server, 
  Copy, 
  Check, 
  Globe, 
  Mail, 
  FolderDown, 
  ShieldCheck, 
  FileCode2,
  FileText,
  ExternalLink,
  Download,
  Maximize2,
  BookOpen
} from 'lucide-react';

interface ServerConfigViewerProps {
  config: NetworkConfig;
  grayTheme?: GrayTone;
}

export const ServerConfigViewer: React.FC<ServerConfigViewerProps> = ({ config, grayTheme = 'slate-gray' }) => {
  const configs = generateServerConfigs(config);
  const [activeConfigTab, setActiveConfigTab] = useState<'windows-server' | 'nginx' | 'postfix' | 'vsftpd' | 'ufw'>('nginx');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  const isLight = grayTheme === 'light-gray';
  const isCool = grayTheme === 'cool-gray';

  const containerBg = isLight 
    ? 'bg-white border-slate-300 text-slate-900 shadow-md' 
    : isCool 
    ? 'bg-[#333a48] border-[#434d5e] text-slate-100 shadow-xl' 
    : 'bg-[#282e3b] border-[#363f50] text-slate-100 shadow-xl';

  const subBoxBg = isLight 
    ? 'bg-[#f8fafc] border-slate-200' 
    : isCool 
    ? 'bg-[#252b36] border-[#3a4454]' 
    : 'bg-[#1f242e] border-[#2e3746]';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getActiveContent = () => {
    switch (activeConfigTab) {
      case 'windows-server':
        return {
          title: 'Báo Cáo Thực Hành: configWindowServer.pdf (56 trang)',
          path: '/configWindowServer.pdf (Tài liệu chuẩn hóa Lab 1 - Lab 7)',
          code: '',
          tip: 'Báo cáo toàn diện 56 trang: Cấu hình Windows Server 2025, Active Directory, DNS Server, IIS Web, FTPS User Isolation, MDaemon Webmail, MikroTik NAT Port Forwarding và Windows Firewall.',
        };
      case 'nginx':
        return {
          title: 'Cấu hình Nginx Web Server (bctech.asia)',
          path: `/etc/nginx/sites-available/${config.domain}`,
          code: configs.nginx,
          tip: 'Hỗ trợ chuyển hướng tự động HTTP sang HTTPS, HTTP/2, và chứng chỉ SSL Let\'s Encrypt.',
        };
      case 'postfix':
        return {
          title: 'Cấu hình Postfix Mail Server (mail.bctech.asia)',
          path: '/etc/postfix/main.cf',
          code: configs.postfix,
          tip: 'Chống Open Relay, chỉ chuyển tiếp mail cho mạng nội bộ và user đã xác thực qua SASL Dovecot.',
        };
      case 'vsftpd':
        return {
          title: 'Cấu hình vsftpd FTP Server (ftp.bctech.asia)',
          path: '/etc/vsftpd.conf',
          code: configs.vsftpd,
          tip: 'Đặc biệt quan trọng: Khai báo pasv_address và dải port 50000-50100 để FTP hoạt động qua NAT Router.',
        };
      case 'ufw':
        return {
          title: 'Cấu hình Tường Lửa Nội Bộ Máy Chủ (UFW Firewall)',
          path: '/etc/ufw/user.rules (Lệnh CLI)',
          code: configs.ufw,
          tip: 'Chỉ mở các cổng công khai và giới hạn quyền truy cập SSH quản trị từ mạng LAN 192.168.1.0/24.',
        };
    }
  };

  const current = getActiveContent();

  return (
    <div className={`border rounded-2xl p-6 space-y-6 transition-colors ${containerBg}`}>
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 ${isLight ? 'border-slate-200' : 'border-slate-700/60'}`}>
        <div>
          <h3 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Server className="w-5 h-5 text-emerald-400" />
            File Cấu Hình Dịch Vụ Máy Chủ LAN ({config.serverLanIp})
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Mã cấu hình chuẩn hóa cho từng dịch vụ Web, Mail, FTP và bảo vệ Firewall trên hệ điều hành Linux
          </p>
        </div>

        {/* Tab Switcher */}
        <div className={`flex items-center gap-1.5 p-1.5 rounded-xl border text-xs overflow-x-auto ${subBoxBg}`}>
          {/* configWindowServer.pdf đặt trước mục Nginx */}
          <button
            onClick={() => {
              setActiveConfigTab('windows-server');
              setIsPdfModalOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap shadow-xs ${
              activeConfigTab === 'windows-server'
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md'
                : isLight
                ? 'bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300'
                : 'bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-800/60'
            }`}
            title="Nhấp để mở tập tin Báo cáo & Hướng dẫn: configWindowServer.pdf"
          >
            <FileText className="w-3.5 h-3.5 text-rose-500" />
            <span className="font-bold">configWindowServer.pdf</span>
          </button>

          <button
            onClick={() => setActiveConfigTab('nginx')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeConfigTab === 'nginx' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Nginx (Web)
          </button>
          <button
            onClick={() => setActiveConfigTab('postfix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeConfigTab === 'postfix' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Postfix (Mail)
          </button>
          <button
            onClick={() => setActiveConfigTab('vsftpd')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeConfigTab === 'vsftpd' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderDown className="w-3.5 h-3.5" />
            vsftpd (FTP)
          </button>
          <button
            onClick={() => setActiveConfigTab('ufw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeConfigTab === 'ufw' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            UFW Firewall
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeConfigTab === 'windows-server' ? (
        /* PDF Dedicated Stage */
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-rose-400" />
                configWindowServer.pdf (56 trang tài liệu chuẩn Lab 1 - Lab 7)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-all shadow"
                title="Phóng to cửa sổ xem PDF"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Xem cửa sổ lớn</span>
              </button>

              <a
                href="/configWindowServer.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow"
                title="Mở tập tin PDF trong tab trình duyệt mới"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở tab mới</span>
              </a>

              <a
                href="/configWindowServer.pdf"
                download="configWindowServer.pdf"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow"
                title="Tải tập tin về máy tính"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải về PDF</span>
              </a>
            </div>
          </div>

          {/* Overview Info Card */}
          <div className={`p-4 rounded-xl border text-xs space-y-2 ${isLight ? 'bg-rose-50/70 border-rose-200 text-slate-800' : 'bg-slate-950/80 border-slate-800 text-slate-300'}`}>
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Báo Cáo Kết Quả Đề Tài Thiết Bị Đào Tạo Tự Làm (Windows Server 2025)</span>
            </div>
            <p className="leading-relaxed">
              <b>Tác giả:</b> Vũ Thị Tho, Trần Lệ Thủy (Trường CĐ Kỹ thuật Công nghệ BR-VT) • <b>Thời gian:</b> 10/2026 • <b>Độ dài:</b> 56 trang chi tiết kèm 85 hình ảnh minh họa thao tác thực tế.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[11px] pt-1 border-t border-rose-200/60 dark:border-slate-800 font-mono">
              <div>• Lab 1: Hoạch định IP tĩnh 192.168.1.200, AD DS & DNS Server</div>
              <div>• Lab 2: Triển khai Web Server IIS & Binding domain bctech.asia</div>
              <div>• Lab 3: Triển khai FTP Server IIS & FTPS Explicit/Implicit</div>
              <div>• Lab 4: Cấu hình bảo mật HTTPS & FTPS PKI qua AD CS</div>
              <div>• Lab 5: Triển khai Mail Server MDaemon & Webmail WorldClient</div>
              <div>• Lab 6: Cấu hình NAT Port Forwarding trên Router MikroTik & FTP ALG</div>
              <div className="md:col-span-2">• Lab 7: Bảo mật Windows Firewall nâng cao & IIS URL Rewrite chuyển hướng HTTP sang HTTPS</div>
            </div>
          </div>

          {/* Embedded Interactive PDF Viewer */}
          <div className="w-full h-[650px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner relative">
            <iframe
              src="/configWindowServer.pdf#view=FitH"
              className="w-full h-full border-none"
              title="configWindowServer.pdf viewer"
            />
          </div>
        </div>
      ) : (
        /* Code Viewer Stage for Nginx, Postfix, vsftpd, UFW */
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/20">
                {current.path}
              </span>
            </div>

            <button
              onClick={() => handleCopy(current.code, activeConfigTab)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow"
            >
              {copiedKey === activeConfigTab ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === activeConfigTab ? 'Đã sao chép vào bộ nhớ!' : 'Sao chép toàn bộ file'}</span>
            </button>
          </div>

          {/* Tip Box */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{current.tip}</span>
          </div>

          {/* Code Content */}
          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-emerald-300 font-mono text-xs overflow-x-auto max-h-[460px] leading-relaxed select-text">
            {current.code}
          </pre>
        </div>
      )}

      {/* PDF Fullscreen Modal Viewer */}
      <PdfViewerModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        pdfUrl="/configWindowServer.pdf"
        title="configWindowServer.pdf"
      />
    </div>
  );
};
