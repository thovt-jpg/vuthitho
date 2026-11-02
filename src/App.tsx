/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { NetworkConfig, SimulationScenario, GrayTone } from './types/network';
import { DEFAULT_CONFIG } from './data/networkData';
import { NetworkDiagramCanvas } from './components/NetworkDiagramCanvas';
import { NodeDetailDrawer } from './components/NodeDetailDrawer';
import { PacketSimulator } from './components/PacketSimulator';
import { NatTableModal } from './components/NatTableModal';
import { DnsRecordsCard } from './components/DnsRecordsCard';
import { ServiceTestingCard } from './components/ServiceTestingCard';
import { ServerConfigViewer } from './components/ServerConfigViewer';
import { SecurityAdviceCard } from './components/SecurityAdviceCard';
import { TopologySettingsModal } from './components/TopologySettingsModal';
import { VideoExportModal } from './components/VideoExportModal';
import { PptxPreviewModal } from './components/PptxPreviewModal';
import { 
  Network, 
  Globe, 
  Mail, 
  FolderDown, 
  Server, 
  ShieldCheck, 
  Settings, 
  Download, 
  PlayCircle, 
  FileText, 
  Layers, 
  Zap,
  HelpCircle,
  ExternalLink,
  Palette,
  Video,
  Presentation,
  CheckSquare
} from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<NetworkConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'diagram' | 'simulator' | 'nat-table' | 'dns-records' | 'testing' | 'server-configs' | 'security'>('diagram');
  const [selectedService, setSelectedService] = useState<'all' | 'web' | 'mail' | 'ftp'>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeSimulation, setActiveSimulation] = useState<SimulationScenario | null>(null);
  const [currentSimStepIndex, setCurrentSimStepIndex] = useState<number>(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [isPptxModalOpen, setIsPptxModalOpen] = useState<boolean>(false);
  const [grayTheme, setGrayTheme] = useState<GrayTone>('light-gray');

  const handleSimulationChange = useCallback((sim: SimulationScenario | null, step: number) => {
    setActiveSimulation(prev => {
      if (prev?.id === sim?.id && prev === sim) {
        return prev;
      }
      return sim;
    });
    setCurrentSimStepIndex(prev => (prev === step ? prev : step));
  }, []);

  const isLight = grayTheme === 'light-gray';
  const isCool = grayTheme === 'cool-gray';

  // Gray color palette mappings with High Contrast & 3D Raised Elevation
  const appRootBg = isLight 
    ? 'bg-[#f8fafc] text-slate-950' 
    : isCool 
    ? 'bg-[#2a303c] text-slate-100' 
    : 'bg-[#20252e] text-slate-100';

  const headerBg = isLight
    ? 'bg-white/95 border-b-2 border-slate-300 shadow-md text-slate-950'
    : isCool
    ? 'bg-[#222731]/95 border-[#384152] text-slate-100'
    : 'bg-[#191d24]/95 border-[#2d3442] text-slate-100';

  const summaryBarBg = isLight
    ? 'bg-[#f1f5f9] border-b-2 border-slate-300 text-slate-950'
    : isCool
    ? 'bg-[#242935]/70 border-[#353d4d]'
    : 'bg-[#1c2028]/70 border-[#2b323f]';

  const pillBg = isLight
    ? 'bg-white border-2 border-slate-300 text-slate-950 shadow-md font-bold'
    : isCool
    ? 'bg-[#1f242e] border-[#363f50] text-slate-200'
    : 'bg-[#181c23] border-[#2c3442] text-slate-200';

  const navBorder = isLight ? 'border-slate-300' : isCool ? 'border-[#384152]' : 'border-[#2d3442]';

  const serviceCardBg = isLight
    ? 'bg-gradient-to-b from-white via-slate-50 to-slate-100/80 border-2 border-slate-300 border-t-white border-b-slate-400 text-slate-950 shadow-[0_12px_24px_-6px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.06)] hover:translate-y-[-2px] hover:shadow-[0_16px_28px_-6px_rgba(0,0,0,0.16)]'
    : isCool
    ? 'bg-[#333a48] border-[#434d5e] hover:border-slate-400 text-slate-100 shadow-md'
    : 'bg-[#282e3b] border-[#363f50] hover:border-slate-400 text-slate-100 shadow-md';

  const footerBg = isLight
    ? 'bg-white border-t-2 border-slate-300 text-slate-900 font-bold'
    : isCool
    ? 'bg-[#222731] border-[#343c4a] text-slate-400'
    : 'bg-[#191d24] border-[#262b36] text-slate-400';

  const handleDownloadSummary = () => {
    const reportText = `# BÁO CÁO THIẾT KẾ KIẾN TRÚC MẠNG SERVER ĐA DỊCH VỤ
Tên miền: ${config.domain}
Máy chủ dịch vụ Web, Mail, FTP: ${config.serverLanIp}
Địa chỉ IP Public (WAN): ${config.publicIp}
Cổng Default Gateway LAN: ${config.lanGateway}
Dải mạng nội bộ: ${config.lanSubnet}

===========================================================
1. DANH SÁCH CÁC CỔNG CẦN MỞ NAT / PORT FORWARDING:
===========================================================
- WEB (HTTP): Port 80 TCP -> ${config.serverLanIp}:80
- WEB (HTTPS): Port 443 TCP -> ${config.serverLanIp}:443
- MAIL (SMTP Inbound): Port 25 TCP -> ${config.serverLanIp}:25
- MAIL (Submission): Port 587 TCP -> ${config.serverLanIp}:587
- MAIL (SMTPS): Port 465 TCP -> ${config.serverLanIp}:465
- MAIL (IMAPS): Port 993 TCP -> ${config.serverLanIp}:993
- MAIL (POP3S): Port 995 TCP -> ${config.serverLanIp}:995
- FTP (Control): Port 21 TCP -> ${config.serverLanIp}:21
- FTP (Passive Data): Port ${config.ftpPassiveRange} TCP -> ${config.serverLanIp}:${config.ftpPassiveRange}

===========================================================
2. CÁC BẢN GHI DNS BẮT BUỘC TRÊN TÊN MIỀN ${config.domain}:
===========================================================
- @ (Apex)       A     ${config.publicIp}
- www            A     ${config.publicIp}
- mail           A     ${config.publicIp}
- ftp            A     ${config.publicIp}
- @              MX 10 mail.${config.domain}
- @              TXT   "v=spf1 mx ip4:${config.publicIp} ~all"
- _dmarc         TXT   "v=DMARC1; p=quarantine; rua=mailto:postmaster@${config.domain}; pct=100"

===========================================================
3. LƯU Ý KỸ THUẬT QUAN TRỌNG:
===========================================================
1. Trong file cấu hình FTP (/etc/vsftpd.conf), bắt buộc khai báo:
   pasv_enable=YES
   pasv_address=${config.publicIp}
   pasv_min_port=50000
   pasv_max_port=50100
2. Trên Router biên, bắt buộc cấu hình Hairpin NAT (NAT Loopback) để máy tính trong văn phòng truy cập được ${config.domain}.
3. Yêu cầu nhà mạng (ISP) mở chặn Port 25 hai chiều và cấu hình bản ghi Reverse DNS (PTR).
`;
    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Kien-Truc-Mang-${config.domain}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-blue-600 selection:text-white ${appRootBg}`}>
      {/* ======================================================== */}
      {/* HEADER / TOP NAVBAR */}
      {/* ======================================================== */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-200 ${headerBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-blue-500/20">
              <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-slate-900'}`}>
                <Network className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-[18pt] font-black tracking-tight leading-tight ${isLight ? 'text-slate-950' : 'text-white'}`}>
                  SƠ ĐỒ MẠNG SERVER WEB • MAIL • FTP
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-lg bg-emerald-100 border-2 border-emerald-400 text-emerald-950 text-xs font-mono font-black shadow-xs">
                  {config.domain}
                </span>
              </div>
              <p className="text-xs text-slate-900 font-bold font-mono">
                IP LAN: <span className="text-emerald-800 font-black px-1.5 py-0.5 bg-emerald-100 rounded border border-emerald-300">{config.serverLanIp}</span> • Public IP: <span className="text-blue-900 font-black px-1.5 py-0.5 bg-blue-100 rounded border border-blue-300">{config.publicIp}</span>
              </p>
            </div>
          </div>

          {/* Center/Right: Gray Theme Switcher & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Gray Theme Switcher */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border text-xs ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#181c24] border-[#303846]'}`}>
              <Palette className="w-3.5 h-3.5 text-sky-400 ml-1.5 shrink-0" />
              <span className="text-[11px] text-slate-400 font-medium hidden lg:inline mr-1">Tông xám:</span>
              <button
                onClick={() => setGrayTheme('slate-gray')}
                title="Nền xám đá kỹ thuật (Slate Gray)"
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  grayTheme === 'slate-gray'
                    ? 'bg-blue-600 text-white shadow'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                Xám Slate
              </button>
              <button
                onClick={() => setGrayTheme('cool-gray')}
                title="Nền xám xi măng trung tính (Neutral Gray)"
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  grayTheme === 'cool-gray'
                    ? 'bg-blue-600 text-white shadow'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                Xám Xi Măng
              </button>
              <button
                onClick={() => setGrayTheme('light-gray')}
                title="Nền xám sáng bản vẽ (Light Blueprint Gray)"
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  grayTheme === 'light-gray'
                    ? 'bg-blue-600 text-white shadow'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                Xám Sáng
              </button>
            </div>

            {/* Quick Action Buttons */}
            <button
              onClick={() => setIsPptxModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-950/40 active:scale-95 border border-blue-400/30"
              title="Xuất bài giảng PowerPoint học thuật chuẩn nghiencuu.pptx (Arial, 30pt Navy, 24pt nội dung, Speaker Notes)"
            >
              <Presentation className="w-3.5 h-3.5 text-amber-300" />
              <span>Xuất nghiencuu.pptx</span>
            </button>

            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/30 active:scale-95"
              title="Xuất video mô phỏng sơ đồ mạng và luồng dữ liệu (Hethong.mp4)"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Xuất Video (Hethong.mp4)</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-semibold transition-all shadow-xs ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700' 
                  : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              title="Đổi IP Public, IP LAN hoặc Tên miền"
            >
              <Settings className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Tùy biến IP</span>
            </button>

            <button
              onClick={handleDownloadSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/25 active:scale-95"
              title="Tải tệp tóm tắt cấu hình"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xuất tài liệu</span>
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* QUICK SUMMARY PILLS / SPECS BAR */}
      {/* ======================================================== */}
      <div className={`border-b px-4 py-2.5 transition-colors duration-200 ${summaryBarBg}`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-mono text-xs">
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 ${pillBg}`}>
              <span className="text-slate-900 font-extrabold font-sans">Tên Miền:</span>
              <span className={`font-black ${isLight ? 'text-blue-900' : 'text-white'}`}>{config.domain}</span>
            </div>
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 ${pillBg}`}>
              <span className="text-slate-900 font-extrabold font-sans">IP Server LAN:</span>
              <span className="text-emerald-800 font-black">{config.serverLanIp}</span>
            </div>
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 ${pillBg}`}>
              <span className="text-slate-900 font-extrabold font-sans">Public IP WAN:</span>
              <span className="text-sky-900 font-black">{config.publicIp}</span>
            </div>
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 ${pillBg}`}>
              <span className="text-slate-900 font-extrabold font-sans">Dải Passive FTP:</span>
              <span className="text-cyan-900 font-black">{config.ftpPassiveRange}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN NAVIGATION TABS */}
      {/* ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 w-full">
        <nav className={`flex items-center gap-1.5 overflow-x-auto pb-2 border-b scrollbar-none ${navBorder}`}>
          <button
            onClick={() => setActiveTab('diagram')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'diagram'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Sơ Đồ Mạng Trực Quan</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PlayCircle className="w-4 h-4 text-emerald-400" />
            <span>Mô Phỏng Gói Tin (Packet Flow)</span>
          </button>

          <button
            onClick={() => setActiveTab('nat-table')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'nat-table'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Bảng Port Forwarding & Router NAT</span>
          </button>

          <button
            onClick={() => setActiveTab('dns-records')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'dns-records'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-4 h-4 text-purple-400" />
            <span>Bản Ghi DNS ({config.domain})</span>
          </button>

          {/* Tab Kiểm tra: Đặt sau mục Bản ghi DNS và trước mục Cấu hình */}
          <button
            onClick={() => setActiveTab('testing')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'testing'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>Kiểm Tra Dịch Vụ</span>
          </button>

          <button
            onClick={() => setActiveTab('server-configs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'server-configs'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Cấu Hình Server 192.168.1.200</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Phân Tích Kiến Trúc & DMZ</span>
          </button>
        </nav>
      </div>

      {/* ======================================================== */}
      {/* MAIN CONTENT AREA */}
      {/* ======================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* TAB 1: INTERACTIVE TOPOLOGY CANVAS */}
        {activeTab === 'diagram' && (
          <div className="space-y-6">
            {/* The SVG Diagram with Gray Theme */}
            <NetworkDiagramCanvas
              config={config}
              selectedService={selectedService}
              onSelectService={setSelectedService}
              activeSimulation={activeSimulation}
              currentSimStepIndex={currentSimStepIndex}
              onSelectNode={setSelectedNodeId}
              selectedNodeId={selectedNodeId}
              grayTheme={grayTheme}
              onChangeGrayTheme={setGrayTheme}
              onOpenVideoExport={() => setIsVideoModalOpen(true)}
            />

            {/* Quick Service Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Web Card */}
              <div 
                onClick={() => setSelectedNodeId('service-web')}
                className={`p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] group ${serviceCardBg}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5 text-emerald-800 font-extrabold text-[18pt]">
                    <Globe className="w-6 h-6 text-emerald-700" />
                    <span>Máy Chủ Web</span>
                  </div>
                  <span className="text-xs font-mono bg-emerald-100 text-emerald-900 px-3 py-1 rounded-lg border-2 border-emerald-300 font-extrabold shadow-sm">
                    Port 80, 443
                  </span>
                </div>
                <div className={`text-base font-mono font-extrabold ${isLight ? 'text-slate-950' : 'text-white'}`}>
                  https://{config.domain}
                </div>
                <p className="text-sm text-slate-800 font-bold mt-2 leading-relaxed">
                  Dịch vụ Web Hosting trên IP LAN 192.168.1.200, cấu hình SSL/TLS tự động, hỗ trợ HTTP port 80 và HTTPS port 443.
                </p>
              </div>

              {/* Mail Card */}
              <div 
                onClick={() => setSelectedNodeId('service-mail')}
                className={`p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] group ${serviceCardBg}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5 text-amber-900 font-extrabold text-[18pt]">
                    <Mail className="w-6 h-6 text-amber-700" />
                    <span>Máy Chủ Mail</span>
                  </div>
                  <span className="text-xs font-mono bg-amber-100 text-amber-900 px-3 py-1 rounded-lg border-2 border-amber-300 font-extrabold shadow-sm">
                    Port 25, 587, 993
                  </span>
                </div>
                <div className={`text-base font-mono font-extrabold ${isLight ? 'text-slate-950' : 'text-white'}`}>
                  mail.{config.domain}
                </div>
                <p className="text-sm text-slate-800 font-bold mt-2 leading-relaxed">
                  Máy chủ Mail Server nhận/gửi email, cấu hình SPF, DKIM, DMARC chống spam và yêu cầu bản ghi rDNS với ISP.
                </p>
              </div>

              {/* FTP Card */}
              <div 
                onClick={() => setSelectedNodeId('service-ftp')}
                className={`p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.01] group ${serviceCardBg}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5 text-cyan-900 font-extrabold text-[18pt]">
                    <FolderDown className="w-6 h-6 text-cyan-700" />
                    <span>Máy Chủ FTP</span>
                  </div>
                  <span className="text-xs font-mono bg-cyan-100 text-cyan-900 px-3 py-1 rounded-lg border-2 border-cyan-300 font-extrabold shadow-sm">
                    Port 21, {config.ftpPassiveRange}
                  </span>
                </div>
                <div className={`text-base font-mono font-extrabold ${isLight ? 'text-slate-950' : 'text-white'}`}>
                  ftp.{config.domain}
                </div>
                <p className="text-sm text-slate-800 font-bold mt-2 leading-relaxed">
                  Cấu hình FTP Passive Mode với pasv_address={config.publicIp} cho phép truyền dữ liệu qua Router NAT.
                </p>
              </div>
            </div>

            {/* Interactive Packet Mini-Simulator below canvas */}
            <PacketSimulator
              config={config}
              grayTheme={grayTheme}
              onOpenVideoExport={() => setIsVideoModalOpen(true)}
              onSimulationChange={handleSimulationChange}
            />
          </div>
        )}

        {/* TAB 2: PACKET SIMULATOR STANDALONE */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <PacketSimulator
              config={config}
              grayTheme={grayTheme}
              onOpenVideoExport={() => setIsVideoModalOpen(true)}
              onSimulationChange={handleSimulationChange}
            />

            {/* Embedded Live Visual Stage */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Sơ đồ trạng thái trực tiếp trong quá trình truyền gói tin:
              </h4>
              <NetworkDiagramCanvas
                config={config}
                selectedService={activeSimulation?.service && activeSimulation.service !== 'lan' ? activeSimulation.service : 'all'}
                onSelectService={setSelectedService}
                activeSimulation={activeSimulation}
                currentSimStepIndex={currentSimStepIndex}
                onSelectNode={setSelectedNodeId}
                selectedNodeId={selectedNodeId}
                grayTheme={grayTheme}
                onChangeGrayTheme={setGrayTheme}
                onOpenVideoExport={() => setIsVideoModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* TAB 3: NAT & PORT FORWARDING MATRIX */}
        {activeTab === 'nat-table' && (
          <NatTableModal config={config} grayTheme={grayTheme} />
        )}

        {/* TAB 4: DNS CONFIGURATION & ZONE FILE */}
        {activeTab === 'dns-records' && (
          <DnsRecordsCard config={config} grayTheme={grayTheme} />
        )}

        {/* TAB 5: SERVICE TESTING & DIRECT HYPERLINKS (Đặt trước mục Cấu hình) */}
        {activeTab === 'testing' && (
          <ServiceTestingCard config={config} grayTheme={grayTheme} />
        )}

        {/* TAB 6: SERVER CONFIGURATION SCRIPTS */}
        {activeTab === 'server-configs' && (
          <ServerConfigViewer config={config} grayTheme={grayTheme} />
        )}

        {/* TAB 6: SECURITY & ARCHITECTURAL BEST PRACTICES */}
        {activeTab === 'security' && (
          <SecurityAdviceCard config={config} grayTheme={grayTheme} />
        )}
      </main>

      {/* ======================================================== */}
      {/* NODE DETAILS SIDE DRAWER */}
      {/* ======================================================== */}
      <NodeDetailDrawer
        nodeId={selectedNodeId}
        onClose={() => setSelectedNodeId(null)}
        config={config}
        grayTheme={grayTheme}
        onSwitchTab={tab => {
          setSelectedNodeId(null);
          setActiveTab(tab as any);
        }}
      />

      {/* ======================================================== */}
      {/* TOPOLOGY SETTINGS MODAL */}
      {/* ======================================================== */}
      <TopologySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        grayTheme={grayTheme}
        onSaveConfig={newCfg => setConfig(newCfg)}
      />

      {/* ======================================================== */}
      {/* VIDEO EXPORT MODAL (hethongServer) */}
      {/* ======================================================== */}
      <VideoExportModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        config={config}
        grayTheme={grayTheme}
      />

      {/* ======================================================== */}
      {/* PPTX EXPORT & PREVIEW MODAL (nghiencuu.pptx) */}
      {/* ======================================================== */}
      <PptxPreviewModal
        isOpen={isPptxModalOpen}
        onClose={() => setIsPptxModalOpen(false)}
        config={config}
        grayTheme={grayTheme}
      />

      {/* ======================================================== */}
      {/* FOOTER */}
      {/* ======================================================== */}
      <footer className={`border-t py-6 text-xs transition-colors duration-200 ${footerBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Thiết Kế Kiến Trúc Mạng Chuẩn Doanh Nghiệp</span>
            <span>•</span>
            <span>Domain: {config.domain}</span>
            <span>•</span>
            <span>Server LAN: {config.serverLanIp}</span>
          </div>
          <div className="text-[11px] text-slate-500 font-bold">
            Hỗ trợ NAT Hairpinning, SSL/TLS Let's Encrypt, Passive FTP và Mail Relay
          </div>
        </div>
      </footer>
    </div>
  );
}
