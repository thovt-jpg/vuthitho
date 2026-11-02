import React, { useState, useRef } from 'react';
import { NetworkConfig, SimulationScenario } from '../types/network';
import { 
  Globe, 
  Server, 
  ShieldCheck, 
  Network as NetworkIcon, 
  Laptop, 
  Mail, 
  FolderDown, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Info,
  Flame,
  Palette,
  Video,
  Lock
} from 'lucide-react';

export type GrayTone = 'slate-gray' | 'cool-gray' | 'light-gray';

interface NetworkDiagramCanvasProps {
  config: NetworkConfig;
  selectedService: 'all' | 'web' | 'mail' | 'ftp';
  onSelectService: (service: 'all' | 'web' | 'mail' | 'ftp') => void;
  activeSimulation: SimulationScenario | null;
  currentSimStepIndex: number;
  onSelectNode: (nodeId: string) => void;
  selectedNodeId: string | null;
  grayTheme?: GrayTone;
  onChangeGrayTheme?: (tone: GrayTone) => void;
  onOpenVideoExport?: () => void;
}

export const NetworkDiagramCanvas: React.FC<NetworkDiagramCanvasProps> = ({
  config,
  selectedService,
  onSelectService,
  activeSimulation,
  currentSimStepIndex,
  onSelectNode,
  selectedNodeId,
  grayTheme = 'light-gray',
  onChangeGrayTheme,
  onOpenVideoExport,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showPortLabels, setShowPortLabels] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const isLight = grayTheme === 'light-gray';
  const isCoolGray = grayTheme === 'cool-gray';

  // Bright / Light Theme Color Setup with High Contrast & 3D Elements
  const canvasBg = isLight ? '#f8fafc' : isCoolGray ? '#2a303c' : '#20252e';
  const canvasBorder = isLight ? 'border-slate-300 shadow-2xl' : isCoolGray ? 'border-[#3f4857]' : 'border-[#333b49]';
  const dotColor = isLight ? 'rgba(15, 23, 42, 0.16)' : 'rgba(148, 163, 184, 0.18)';
  
  // High contrast text colors (WCAG AAA)
  const textPrimary = isLight ? '#020617' : '#f8fafc';       // Deep obsidian black
  const textSecondary = isLight ? '#0f172a' : '#94a3b8';     // Very dark slate
  const textHighlight = isLight ? '#1e3a8a' : '#60a5fa';     // Academic navy or bright sky
  
  const floatingBarBg = isLight 
    ? 'bg-white/95 text-slate-950 border-2 border-slate-300 shadow-xl' 
    : isCoolGray 
    ? 'bg-[#313745]/90 text-slate-100 border-[#434b5c]' 
    : 'bg-[#272d39]/90 text-slate-100 border-[#384050]';

  const floatingButtonHover = isLight ? 'hover:bg-slate-100 text-slate-900 font-bold' : 'hover:bg-slate-800/80 text-slate-300';

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.clickable-node')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const currentStep = activeSimulation ? activeSimulation.steps[currentSimStepIndex] : null;

  return (
    <div 
      className={`relative w-full rounded-2xl border-2 select-none flex flex-col transition-colors duration-200 overflow-hidden ${canvasBorder}`}
      style={{ backgroundColor: canvasBg }}
    >
      {/* Top Header & Controls Area (Khung tiêu đề phía trên, tách biệt hoàn toàn không che khung sơ đồ bên dưới) */}
      <div className={`w-full px-4 py-3 border-b-2 flex flex-col items-center gap-3 z-20 ${
        isLight 
          ? 'bg-white/95 border-slate-200 shadow-xs' 
          : isCoolGray 
          ? 'bg-[#242a35] border-[#364052]' 
          : 'bg-[#1b2029] border-[#2b3341]'
      }`}>
        {/* Banner 2 dòng nổi bật, căn giữa khung, cỡ chữ 20pt màu đỏ đậm */}
        <div className={`w-full max-w-4xl px-6 py-2.5 rounded-2xl border-2 shadow-md text-center transition-all ${
          isLight
            ? 'bg-gradient-to-r from-red-50/90 via-white to-red-50/90 border-red-300 shadow-red-950/5'
            : isCoolGray
            ? 'bg-[#2a1e24] border-red-800/70 shadow-black/40'
            : 'bg-[#22171c] border-red-900/70 shadow-black/40'
        }`}>
          <div className={`text-[16pt] sm:text-[18pt] md:text-[20pt] font-black tracking-wide leading-tight uppercase select-text ${
            isLight ? 'text-red-700' : 'text-red-400'
          }`}>
            THIẾT BỊ ĐÀO TẠO TỰ LÀM
          </div>
          <div className={`text-[15pt] sm:text-[17pt] md:text-[20pt] font-black tracking-wide leading-tight uppercase select-text mt-0.5 ${
            isLight ? 'text-red-700' : 'text-red-400'
          }`}>
            TÁC GIẢ : VŨ THỊ THO, TRẦN LỆ THỦY
          </div>
        </div>

        {/* Control Bar: Service Filters & View Controls */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3">
          {/* Service Filter Chips (Không hiển thị nút 'Tất cả dịch vụ' trên sơ đồ) */}
          <div className={`flex items-center gap-1.5 p-1 rounded-xl border-2 shadow-xs ${floatingBarBg}`}>
            <button
              onClick={() => onSelectService(selectedService === 'web' ? 'all' : 'web')}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1 ${
                selectedService === 'web'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : `${floatingButtonHover} text-emerald-900`
              }`}
              title={selectedService === 'web' ? 'Bỏ lọc Web' : 'Lọc dịch vụ Web'}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Web (80/443)
            </button>
            <button
              onClick={() => onSelectService(selectedService === 'mail' ? 'all' : 'mail')}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1 ${
                selectedService === 'mail'
                  ? 'bg-amber-600 text-white shadow-md'
                  : `${floatingButtonHover} text-amber-900`
              }`}
              title={selectedService === 'mail' ? 'Bỏ lọc Mail' : 'Lọc dịch vụ Mail'}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Mail (25/587/993)
            </button>
            <button
              onClick={() => onSelectService(selectedService === 'ftp' ? 'all' : 'ftp')}
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1 ${
                selectedService === 'ftp'
                  ? 'bg-cyan-700 text-white shadow-md'
                  : `${floatingButtonHover} text-cyan-900`
              }`}
              title={selectedService === 'ftp' ? 'Bỏ lọc FTP' : 'Lọc dịch vụ FTP'}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              FTP (21/Passive)
            </button>
          </div>

          {/* View Controls & Toggles */}
          <div className={`flex items-center gap-2 p-1 rounded-xl border-2 shadow-xs ${floatingBarBg}`}>
            <button
              onClick={() => setShowPortLabels(!showPortLabels)}
              className={`px-2.5 py-1 text-xs font-extrabold rounded-lg border transition-all ${
                showPortLabels 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
              }`}
              title="Ẩn/Hiện Bảng NAT Cổng"
            >
              Bảng NAT Cổng
            </button>

            <div className="w-px h-5 bg-slate-300"></div>

            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.15, 2.0))}
              className="p-1.5 hover:bg-slate-100 text-slate-900 rounded-lg transition-colors"
              title="Phóng to"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.6))}
              className="p-1.5 hover:bg-slate-100 text-slate-900 rounded-lg transition-colors"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="p-1.5 hover:bg-slate-100 text-slate-900 rounded-lg transition-colors"
              title="Đặt lại khung nhìn"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main SVG Interactive Stage - 100% unobstructed, starts cleanly below header */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`w-full h-[700px] relative cursor-${isDragging ? 'grabbing' : 'grab'} overflow-hidden`}
        style={{
          backgroundImage: `radial-gradient(${dotColor} 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px',
        }}
      >
        <svg
          viewBox="0 0 1320 740"
          className="w-full h-full transition-transform duration-75 origin-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          <defs>
            {/* 3D Realistic Drop Shadows */}
            <filter id="shadow3DNode" x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#0f172a" floodOpacity="0.22" />
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.12" />
            </filter>

            <filter id="shadow3DServer" x="-25%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#064e3b" floodOpacity="0.28" />
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.16" />
            </filter>

            <filter id="shadow3DRouter" x="-25%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#1e3a8a" floodOpacity="0.28" />
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.16" />
            </filter>

            <filter id="shadow3DFloating" x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#0284c7" floodOpacity="0.25" />
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.15" />
            </filter>

            {/* Bright Glossy 3D Node Gradients */}
            <linearGradient id="grad3DWhiteFace" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#ffffff" />
              <stop offset="85%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>

            <linearGradient id="grad3DServerChassis" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#ecfdf5" />
            </linearGradient>

            <linearGradient id="grad3DRouterChassis" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#eff6ff" />
            </linearGradient>

            <linearGradient id="grad3DSwitch" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>

            {/* Bright Zone Gradients */}
            <linearGradient id="gradInternetZone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="gradLanZone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dcfce7" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.4" />
            </linearGradient>

            {/* Metallic Bevel Header Gradients */}
            <linearGradient id="gradNavyHeader" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>

            <linearGradient id="gradEmeraldHeader" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>

            {/* Wire glow */}
            <filter id="glowPulse" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ======================================================== */}
          {/* ZONE 1: INTERNET / PUBLIC NETWORK (LEFT) */}
          {/* ======================================================== */}
          <g>
            {/* 3D Base Shadow for Zone */}
            <rect 
              x="30" 
              y="36" 
              width="380" 
              height="674" 
              rx="24" 
              fill="#cbd5e1" 
              opacity="0.4"
            />
            {/* Zone Surface */}
            <rect 
              x="30" 
              y="30" 
              width="380" 
              height="670" 
              rx="24" 
              fill="url(#gradInternetZone)" 
              stroke="#2563eb" 
              strokeWidth="2.5" 
              strokeDasharray="8 6"
              filter="url(#shadow3DNode)"
            />
            {/* 3D Zone Header Plaque */}
            <rect x="45" y="44" width="350" height="42" rx="12" fill="#1e3a8a" filter="url(#shadow3DNode)" />
            <rect x="45" y="44" width="350" height="4" rx="2" fill="#93c5fd" />
            <text x="60" y="72" fill="#ffffff" fontSize="18" fontWeight="800" letterSpacing="0.04em">
              🌐 INTERNET / PUBLIC WAN
            </text>
            <text x="50" y="105" fill="#0f172a" fontSize="11.5" fontWeight="800">
              Người dùng bên ngoài truy cập thông qua Tên Miền / IP Public
            </text>
          </g>

          {/* ======================================================== */}
          {/* ZONE 2: LOCAL AREA NETWORK (LAN) - 192.168.1.0/24 */}
          {/* ======================================================== */}
          <g>
            {/* 3D Base Shadow for Zone */}
            <rect 
              x="430" 
              y="36" 
              width="860" 
              height="674" 
              rx="24" 
              fill="#cbd5e1" 
              opacity="0.4"
            />
            {/* Zone Surface */}
            <rect 
              x="430" 
              y="30" 
              width="860" 
              height="670" 
              rx="24" 
              fill="url(#gradLanZone)" 
              stroke="#059669" 
              strokeWidth="2.5" 
              strokeDasharray="8 6"
              filter="url(#shadow3DNode)"
            />
            {/* 3D Zone Header Plaque */}
            <rect x="450" y="44" width="820" height="42" rx="12" fill="#064e3b" filter="url(#shadow3DNode)" />
            <rect x="450" y="44" width="820" height="4" rx="2" fill="#6ee7b7" />
            <text x="470" y="72" fill="#ffffff" fontSize="18" fontWeight="800" letterSpacing="0.04em">
              🏢 MẠNG LAN NỘI BỘ DOANH NGHIỆP (DẢI MẠNG: 192.168.1.0/24)
            </text>
            <text x="455" y="105" fill="#064e3b" fontSize="13" fontWeight="800">
              Cổng Gateway Mặc Định: {config.lanGateway} • Máy Chủ Đa Dịch Vụ: {config.serverLanIp}
            </text>
          </g>

          {/* ======================================================== */}
          {/* PHYSICAL DATA HIGHWAYS & CONNECTING CABLES */}
          {/* ======================================================== */}
          
          {/* External Clients -> Router WAN Links */}
          <path
            d="M 370 190 L 460 270"
            stroke={selectedService === 'web' || selectedService === 'all' ? '#059669' : '#94a3b8'}
            strokeWidth={selectedService === 'web' ? '4' : '3'}
            strokeDasharray={activeSimulation?.service === 'web' ? '8 4' : 'none'}
            className={activeSimulation?.service === 'web' ? 'animate-pulse' : ''}
          />
          <path
            d="M 370 345 L 460 270"
            stroke={selectedService === 'mail' || selectedService === 'all' ? '#d97706' : '#94a3b8'}
            strokeWidth={selectedService === 'mail' ? '4' : '3'}
            strokeDasharray={activeSimulation?.service === 'mail' ? '8 4' : 'none'}
            className={activeSimulation?.service === 'mail' ? 'animate-pulse' : ''}
          />
          <path
            d="M 370 500 L 460 270"
            stroke={selectedService === 'ftp' || selectedService === 'all' ? '#0891b2' : '#94a3b8'}
            strokeWidth={selectedService === 'ftp' ? '4' : '3'}
            strokeDasharray={activeSimulation?.service === 'ftp' ? '8 4' : 'none'}
            className={activeSimulation?.service === 'ftp' ? 'animate-pulse' : ''}
          />

          {/* Router LAN Gateway -> Switch Trunk */}
          <path
            d="M 720 345 L 760 345"
            stroke="#059669"
            strokeWidth="5"
          />

          {/* Switch Trunk -> Server NIC Link */}
          <path
            d="M 860 345 L 890 345"
            stroke="#2563eb"
            strokeWidth="5"
          />

          {/* Switch -> Internal Office PC Link */}
          <path
            d="M 810 395 L 810 480 L 705 480 L 705 545"
            stroke="#0284c7"
            strokeWidth="3.5"
            strokeDasharray="6 4"
          />

          {/* ======================================================== */}
          {/* 3D NODE 1: EXTERNAL WEB CLIENT (HTTPS) */}
          {/* ======================================================== */}
          <g 
            className="clickable-node cursor-pointer group"
            onClick={() => onSelectNode('client-web')}
          >
            {/* 3D Bottom Pedestal/Shadow Extrusion */}
            <rect x="55" y="136" width="320" height="120" rx="16" fill="#94a3b8" />
            {/* 3D Main Elevated Card */}
            <rect 
              x="55" 
              y="130" 
              width="320" 
              height="120" 
              rx="16" 
              fill="url(#grad3DWhiteFace)" 
              stroke={selectedNodeId === 'client-web' ? '#0284c7' : '#cbd5e1'} 
              strokeWidth="2.5"
              filter="url(#shadow3DNode)"
            />
            {/* 3D Top Bevel Specular Highlight */}
            <rect x="57" y="132" width="316" height="4" rx="2" fill="#ffffff" />
            
            {/* Left Accent Bar */}
            <rect x="55" y="130" width="8" height="120" rx="4" fill="#059669" />

            {/* Icon 3D Circle */}
            <circle cx="95" cy="190" r="26" fill="#dcfce7" stroke="#059669" strokeWidth="2" filter="url(#shadow3DNode)" />
            <Globe x="79" y="174" className="w-8 h-8 text-emerald-700" />

            {/* Labels in High Contrast Dark Bold fitted to card */}
            <text x="135" y="172" fill={textPrimary} fontSize="17" fontWeight="800">
              KHÁCH WEB (HTTPS)
            </text>
            <text x="135" y="198" fill="#1e3a8a" fontSize="14" fontFamily="monospace" fontWeight="800">
              https://{config.domain}
            </text>
            <text x="135" y="224" fill="#0f172a" fontSize="12" fontWeight="700">
              Cổng Đích: 443 (HTTPS), 80 (HTTP)
            </text>
          </g>

          {/* ======================================================== */}
          {/* 3D NODE 2: EXTERNAL MAIL MTA SENDER */}
          {/* ======================================================== */}
          <g 
            className="clickable-node cursor-pointer group"
            onClick={() => onSelectNode('client-mail')}
          >
            {/* 3D Bottom Pedestal/Shadow Extrusion */}
            <rect x="55" y="291" width="320" height="120" rx="16" fill="#94a3b8" />
            {/* 3D Main Elevated Card */}
            <rect 
              x="55" 
              y="285" 
              width="320" 
              height="120" 
              rx="16" 
              fill="url(#grad3DWhiteFace)" 
              stroke={selectedNodeId === 'client-mail' ? '#0284c7' : '#cbd5e1'} 
              strokeWidth="2.5"
              filter="url(#shadow3DNode)"
            />
            {/* 3D Top Bevel Specular Highlight */}
            <rect x="57" y="287" width="316" height="4" rx="2" fill="#ffffff" />

            {/* Left Accent Bar */}
            <rect x="55" y="285" width="8" height="120" rx="4" fill="#d97706" />

            {/* Icon 3D Circle */}
            <circle cx="95" cy="345" r="26" fill="#fef3c7" stroke="#d97706" strokeWidth="2" filter="url(#shadow3DNode)" />
            <Mail x="79" y="329" className="w-8 h-8 text-amber-800" />

            {/* Labels in High Contrast Dark Bold fitted to card */}
            <text x="135" y="327" fill={textPrimary} fontSize="16.5" fontWeight="800">
              KHÁCH GỬI MAIL (MTA)
            </text>
            <text x="135" y="353" fill="#b45309" fontSize="14" fontFamily="monospace" fontWeight="800">
              mail.{config.domain}
            </text>
            <text x="135" y="379" fill="#0f172a" fontSize="12" fontWeight="700">
              SMTP MX Inbound: Cổng 25 / 587
            </text>
          </g>

          {/* ======================================================== */}
          {/* 3D NODE 3: EXTERNAL FTP CLIENT (FILEZILLA) */}
          {/* ======================================================== */}
          <g 
            className="clickable-node cursor-pointer group"
            onClick={() => onSelectNode('client-ftp')}
          >
            {/* 3D Bottom Pedestal/Shadow Extrusion */}
            <rect x="55" y="446" width="320" height="120" rx="16" fill="#94a3b8" />
            {/* 3D Main Elevated Card */}
            <rect 
              x="55" 
              y="440" 
              width="320" 
              height="120" 
              rx="16" 
              fill="url(#grad3DWhiteFace)" 
              stroke={selectedNodeId === 'client-ftp' ? '#0284c7' : '#cbd5e1'} 
              strokeWidth="2.5"
              filter="url(#shadow3DNode)"
            />
            {/* 3D Top Bevel Specular Highlight */}
            <rect x="57" y="442" width="316" height="4" rx="2" fill="#ffffff" />

            {/* Left Accent Bar */}
            <rect x="55" y="440" width="8" height="120" rx="4" fill="#0891b2" />

            {/* Icon 3D Circle */}
            <circle cx="95" cy="500" r="26" fill="#cffafe" stroke="#0891b2" strokeWidth="2" filter="url(#shadow3DNode)" />
            <FolderDown x="79" y="484" className="w-8 h-8 text-cyan-800" />

            {/* Labels in High Contrast Dark Bold fitted to card */}
            <text x="135" y="482" fill={textPrimary} fontSize="16.5" fontWeight="800">
              CLIENT FTP (FileZilla)
            </text>
            <text x="135" y="508" fill="#0e7490" fontSize="14" fontFamily="monospace" fontWeight="800">
              ftp.{config.domain}
            </text>
            <text x="135" y="534" fill="#0f172a" fontSize="12" fontWeight="700">
              Cổng 21 CMD + 50000-50100 PASV
            </text>
          </g>

          {/* ======================================================== */}
          {/* 3D NODE 4: ROUTER & FIREWALL (CENTER GATEWAY) */}
          {/* ======================================================== */}
          <g 
            className="clickable-node cursor-pointer group"
            onClick={() => onSelectNode('router-firewall')}
          >
            {/* 3D Antennas on Top */}
            <line x1="510" y1="170" x2="490" y2="120" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
            <circle cx="490" cy="120" r="5" fill="#1e3a8a" />
            <line x1="670" y1="170" x2="690" y2="120" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
            <circle cx="690" cy="120" r="5" fill="#1e3a8a" />

            {/* 3D Bottom Pedestal/Extrusion */}
            <rect x="460" y="176" width="260" height="320" rx="20" fill="#94a3b8" />

            {/* 3D Router Box Surface */}
            <rect 
              x="460" 
              y="170" 
              width="260" 
              height="320" 
              rx="20" 
              fill="url(#grad3DRouterChassis)" 
              stroke={selectedNodeId === 'router-firewall' ? '#0284c7' : '#1e3a8a'} 
              strokeWidth="3"
              filter="url(#shadow3DRouter)"
            />

            {/* 3D Header Metallic Bar */}
            <rect x="460" y="170" width="260" height="52" rx="20" fill="url(#gradNavyHeader)" />
            <rect x="460" y="200" width="260" height="22" fill="#1e3a8a" />
            <rect x="462" y="172" width="256" height="4" rx="2" fill="#93c5fd" />
            
            <ShieldCheck x="475" y="182" className="w-7 h-7 text-sky-200" />
            <text x="510" y="204" fill="#ffffff" fontSize="18" fontWeight="800">
              ROUTER / FIREWALL
            </text>

            {/* LED Status Indicator Row */}
            <rect x="475" y="232" width="230" height="26" rx="6" fill="#0f172a" />
            <circle cx="495" cy="245" r="4" fill="#10b981" />
            <text x="505" y="249" fill="#10b981" fontSize="11" fontWeight="800">PWR</text>
            <circle cx="545" cy="245" r="4" fill="#3b82f6" />
            <text x="555" y="249" fill="#93c5fd" fontSize="11" fontWeight="800">WAN</text>
            <circle cx="595" cy="245" r="4" fill="#10b981" />
            <text x="605" y="249" fill="#6ee7b7" fontSize="11" fontWeight="800">LAN</text>
            <circle cx="645" cy="245" r="4" fill="#f59e0b" />
            <text x="655" y="249" fill="#fde68a" fontSize="11" fontWeight="800">NAT</text>

            {/* 3D Raised WAN Interface Plaque */}
            <g>
              <rect x="475" y="268" width="230" height="66" rx="10" fill="#eff6ff" stroke="#1d4ed8" strokeWidth="2" filter="url(#shadow3DNode)" />
              <rect x="477" y="270" width="226" height="3" rx="1.5" fill="#ffffff" />
              <text x="490" y="290" fill="#1e3a8a" fontSize="12" fontWeight="800">
                🌐 CỔNG WAN (IP PUBLIC QUẢNG BÁ)
              </text>
              <text x="490" y="318" fill={textPrimary} fontSize="18" fontFamily="monospace" fontWeight="800">
                {config.publicIp}
              </text>
            </g>

            {/* 3D Raised LAN Interface Plaque */}
            <g>
              <rect x="475" y="344" width="230" height="66" rx="10" fill="#f0fdf4" stroke="#059669" strokeWidth="2" filter="url(#shadow3DNode)" />
              <rect x="477" y="346" width="226" height="3" rx="1.5" fill="#ffffff" />
              <text x="490" y="366" fill="#065f46" fontSize="12" fontWeight="800">
                🏢 CỔNG LAN (GATEWAY NỘI BỘ)
              </text>
              <text x="490" y="394" fill={textPrimary} fontSize="18" fontFamily="monospace" fontWeight="800">
                {config.lanGateway} /24
              </text>
            </g>

            {/* NAT / Inspection Footer */}
            <rect x="475" y="420" width="230" height="52" rx="8" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
            <Flame x="486" y="434" className="w-6 h-6 text-orange-600" />
            <text x="518" y="442" fill="#0f172a" fontSize="12" fontWeight="800">
              Định Tuyến & Bảo Mật Stateful
            </text>
            <text x="518" y="460" fill="#1e3a8a" fontSize="9.5" fontWeight="800">
              Port Forwarding (DNAT / Hairpin)
            </text>
          </g>

          {/* ======================================================== */}
          {/* 3D NODE 5: GIGABIT LAN SWITCH (TRUNG TÂM) */}
          {/* ======================================================== */}
          <g 
            className="clickable-node cursor-pointer group"
            onClick={() => onSelectNode('lan-switch')}
          >
            {/* 3D Bottom Pedestal */}
            <rect x="755" y="296" width="110" height="110" rx="14" fill="#94a3b8" />
            {/* 3D Switch Chassis */}
            <rect 
              x="755" 
              y="290" 
              width="110" 
              height="110" 
              rx="14" 
              fill="url(#grad3DSwitch)" 
              stroke={selectedNodeId === 'lan-switch' ? '#0284c7' : '#059669'} 
              strokeWidth="2.5"
              filter="url(#shadow3DNode)"
            />
            {/* Specular Top Edge */}
            <rect x="757" y="292" width="106" height="3" rx="1.5" fill="#ffffff" />

            <NetworkIcon x="793" y="306" className="w-8 h-8 text-emerald-700" />
            <text x="810" y="354" fill={textPrimary} fontSize="14" fontWeight="800" textAnchor="middle">
              SWITCH LAN
            </text>
            <text x="810" y="372" fill="#047857" fontSize="11" fontWeight="800" textAnchor="middle">
              1000 Mbps
            </text>

            {/* 8 Embossed RJ45 Ports */}
            <g>
              <rect x="768" y="380" width="84" height="12" rx="3" fill="#0f172a" />
              <circle cx="776" cy="386" r="2" fill="#10b981" />
              <circle cx="786" cy="386" r="2" fill="#10b981" />
              <circle cx="796" cy="386" r="2" fill="#10b981" />
              <circle cx="806" cy="386" r="2" fill="#10b981" />
              <circle cx="816" cy="386" r="2" fill="#3b82f6" />
              <circle cx="826" cy="386" r="2" fill="#3b82f6" />
              <circle cx="836" cy="386" r="2" fill="#94a3b8" />
              <circle cx="844" cy="386" r="2" fill="#94a3b8" />
            </g>
          </g>

          {/* ======================================================== */}
          {/* 3D NODE 6: OFFICE PC (LAN CLIENT) */}
          {/* ======================================================== */}
          <g 
            className="clickable-node cursor-pointer group"
            onClick={() => onSelectNode('client-internal')}
          >
            {/* 3D Bottom Pedestal */}
            <rect x="560" y="551" width="270" height="96" rx="16" fill="#94a3b8" />
            {/* 3D Card Surface */}
            <rect 
              x="560" 
              y="545" 
              width="270" 
              height="96" 
              rx="16" 
              fill="url(#grad3DWhiteFace)" 
              stroke={selectedNodeId === 'client-internal' ? '#0284c7' : '#cbd5e1'} 
              strokeWidth="2.5"
              filter="url(#shadow3DNode)"
            />
            {/* Top Bevel Highlight */}
            <rect x="562" y="547" width="266" height="4" rx="2" fill="#ffffff" />
            <rect x="560" y="545" width="8" height="96" rx="4" fill="#0284c7" />

            <circle cx="600" cy="593" r="24" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
            <Laptop x="586" y="579" className="w-7 h-7 text-sky-700" />

            {/* 18pt Heading & Bold Details */}
            <text x="635" y="586" fill={textPrimary} fontSize="18" fontWeight="800">
              PC NỘI BỘ VĂN PHÒNG
            </text>
            <text x="635" y="612" fill="#0369a1" fontSize="16" fontFamily="monospace" fontWeight="800">
              IP: 192.168.1.50/24
            </text>
          </g>

          {/* ======================================================== */}
          {/* 3D NODE 7: THE TARGET SERVER ALL-IN-ONE (192.168.1.200) */}
          {/* ======================================================== */}
          <g 
            className="clickable-node cursor-pointer group"
            onClick={() => onSelectNode('server-master')}
          >
            {/* 3D Bottom Server Pedestal / Shadow Extrusion */}
            <rect x="890" y="96" width="390" height="606" rx="22" fill="#064e3b" opacity="0.3" />
            
            {/* 3D Server Metallic Rack Chassis */}
            <rect 
              x="890" 
              y="90" 
              width="390" 
              height="600" 
              rx="22" 
              fill="url(#grad3DServerChassis)" 
              stroke={selectedNodeId === 'server-master' ? '#0284c7' : '#059669'} 
              strokeWidth="3.5"
              filter="url(#shadow3DServer)"
            />
            {/* 3D Specular Highlight Line */}
            <rect x="892" y="92" width="386" height="4" rx="2" fill="#ffffff" />

            {/* 3D Server Rack Ears with Screws */}
            <rect x="878" y="105" width="12" height="50" rx="3" fill="#64748b" />
            <circle cx="884" cy="115" r="3" fill="#cbd5e1" stroke="#334155" />
            <circle cx="884" cy="145" r="3" fill="#cbd5e1" stroke="#334155" />
            <rect x="1280" y="105" width="12" height="50" rx="3" fill="#64748b" />
            <circle cx="1286" cy="115" r="3" fill="#cbd5e1" stroke="#334155" />
            <circle cx="1286" cy="145" r="3" fill="#cbd5e1" stroke="#334155" />

            {/* Server Header Plaque */}
            <rect x="890" y="90" width="390" height="60" rx="22" fill="url(#gradEmeraldHeader)" />
            <rect x="890" y="125" width="390" height="25" fill="#064e3b" />
            <rect x="892" y="92" width="386" height="4" rx="2" fill="#6ee7b7" />

            <Server x="910" y="106" className="w-8 h-8 text-emerald-200" />
            {/* 18pt Heading - Chỉ để dòng MÁY CHỦ ALL-IN-ONE */}
            <text x="955" y="128" fill="#ffffff" fontSize="18" fontWeight="800">
              MÁY CHỦ ALL-IN-ONE
            </text>

            {/* 3D Raised Prominent IP LAN Badge (18pt) */}
            <g>
              <rect x="910" y="162" width="350" height="46" rx="12" fill="#ffffff" stroke="#059669" strokeWidth="2.5" filter="url(#shadow3DNode)" />
              <rect x="912" y="164" width="346" height="3" rx="1.5" fill="#dcfce7" />
              <circle cx="935" cy="185" r="7" fill="#10b981" />
              <text x="955" y="192" fill={textPrimary} fontSize="18" fontWeight="800" fontFamily="monospace">
                IP LAN: {config.serverLanIp}
              </text>
            </g>

            {/* ========================================== */}
            {/* 3D SERVICE MODULE 1: WEB DAEMON            */}
            {/* ========================================== */}
            <g 
              onClick={(e) => { e.stopPropagation(); onSelectNode('service-web'); }}
              className="cursor-pointer"
            >
              {/* 3D Shadow Plate */}
              <rect x="910" y="222" width="350" height="120" rx="14" fill="#94a3b8" />
              {/* 3D Module Surface */}
              <rect 
                x="910" 
                y="216" 
                width="350" 
                height="120" 
                rx="14" 
                fill={selectedService === 'web' || selectedService === 'all' ? '#f0fdf4' : '#ffffff'} 
                stroke={selectedNodeId === 'service-web' ? '#0284c7' : '#0d9488'} 
                strokeWidth="2.5"
                filter="url(#shadow3DNode)"
              />
              <rect x="912" y="218" width="346" height="3" rx="1.5" fill="#ffffff" />
              <rect x="910" y="216" width="8" height="120" rx="4" fill="#059669" />

              <circle cx="945" cy="252" r="20" fill="#ccfbf1" stroke="#0f766e" strokeWidth="2" />
              <Globe x="933" y="240" className="w-6 h-6 text-teal-800" />
              
              {/* Title fitted to module */}
              <text x="978" y="248" fill={textPrimary} fontSize="15.5" fontWeight="800">
                DỊCH VỤ WEB (HTTP / HTTPS)
              </text>
              <text x="978" y="272" fill="#0f766e" fontSize="14" fontFamily="monospace" fontWeight="800">
                bctech.asia, www.bctech.asia
              </text>

              {/* 3D Raised Port Buttons */}
              <g>
                <rect x="935" y="286" width="140" height="34" rx="8" fill="#134e4a" filter="url(#shadow3DNode)" />
                <rect x="936" y="287" width="138" height="2" rx="1" fill="#5eead4" />
                <text x="1005" y="308" fill="#ffffff" fontSize="13" fontFamily="monospace" fontWeight="800" textAnchor="middle">
                  CỔNG 80 (HTTP)
                </text>

                <rect x="1090" y="286" width="155" height="34" rx="8" fill="#0f766e" filter="url(#shadow3DNode)" />
                <rect x="1091" y="287" width="153" height="2" rx="1" fill="#5eead4" />
                <Lock x="1102" y="294" className="w-4 h-4 text-emerald-300" />
                <text x="1178" y="308" fill="#ffffff" fontSize="13" fontFamily="monospace" fontWeight="800" textAnchor="middle">
                  443 (HTTPS SSL)
                </text>
              </g>
            </g>

            {/* ========================================== */}
            {/* 3D SERVICE MODULE 2: EMAIL DAEMON           */}
            {/* ========================================== */}
            <g 
              onClick={(e) => { e.stopPropagation(); onSelectNode('service-mail'); }}
              className="cursor-pointer"
            >
              {/* 3D Shadow Plate */}
              <rect x="910" y="352" width="350" height="135" rx="14" fill="#94a3b8" />
              {/* 3D Module Surface */}
              <rect 
                x="910" 
                y="346" 
                width="350" 
                height="135" 
                rx="14" 
                fill={selectedService === 'mail' || selectedService === 'all' ? '#fffbeb' : '#ffffff'} 
                stroke={selectedNodeId === 'service-mail' ? '#0284c7' : '#d97706'} 
                strokeWidth="2.5"
                filter="url(#shadow3DNode)"
              />
              <rect x="912" y="348" width="346" height="3" rx="1.5" fill="#ffffff" />
              <rect x="910" y="346" width="8" height="135" rx="4" fill="#d97706" />

              <circle cx="945" cy="382" r="20" fill="#fef3c7" stroke="#b45309" strokeWidth="2" />
              <Mail x="933" y="370" className="w-6 h-6 text-amber-800" />

              {/* Title fitted to module */}
              <text x="978" y="378" fill={textPrimary} fontSize="15.5" fontWeight="800">
                DỊCH VỤ EMAIL (SMTP / IMAP)
              </text>
              <text x="978" y="402" fill="#b45309" fontSize="14" fontFamily="monospace" fontWeight="800">
                mail.bctech.asia (MX Record)
              </text>

              {/* 3D Raised Port Buttons */}
              <g>
                <rect x="924" y="416" width="72" height="30" rx="6" fill="#78350f" filter="url(#shadow3DNode)" />
                <text x="960" y="436" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="800" textAnchor="middle">
                  25 SMTP
                </text>

                <rect x="1004" y="416" width="74" height="30" rx="6" fill="#92400e" filter="url(#shadow3DNode)" />
                <text x="1041" y="436" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="800" textAnchor="middle">
                  587 SUB
                </text>

                <rect x="1086" y="416" width="78" height="30" rx="6" fill="#b45309" filter="url(#shadow3DNode)" />
                <text x="1125" y="436" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="800" textAnchor="middle">
                  465 SMTPS
                </text>

                <rect x="1172" y="416" width="74" height="30" rx="6" fill="#d97706" filter="url(#shadow3DNode)" />
                <text x="1209" y="436" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="800" textAnchor="middle">
                  993 IMAP
                </text>
              </g>
            </g>

            {/* ========================================== */}
            {/* 3D SERVICE MODULE 3: FTP DAEMON             */}
            {/* ========================================== */}
            <g 
              onClick={(e) => { e.stopPropagation(); onSelectNode('service-ftp'); }}
              className="cursor-pointer"
            >
              {/* 3D Shadow Plate */}
              <rect x="910" y="496" width="350" height="125" rx="14" fill="#94a3b8" />
              {/* 3D Module Surface */}
              <rect 
                x="910" 
                y="490" 
                width="350" 
                height="125" 
                rx="14" 
                fill={selectedService === 'ftp' || selectedService === 'all' ? '#ecfeff' : '#ffffff'} 
                stroke={selectedNodeId === 'service-ftp' ? '#0284c7' : '#0891b2'} 
                strokeWidth="2.5"
                filter="url(#shadow3DNode)"
              />
              <rect x="912" y="492" width="346" height="3" rx="1.5" fill="#ffffff" />
              <rect x="910" y="490" width="8" height="125" rx="4" fill="#0891b2" />

              <circle cx="945" cy="526" r="20" fill="#cffafe" stroke="#0e7490" strokeWidth="2" />
              <FolderDown x="933" y="514" className="w-6 h-6 text-cyan-800" />

              {/* Title fitted to module */}
              <text x="978" y="522" fill={textPrimary} fontSize="15.5" fontWeight="800">
                DỊCH VỤ FTP (PORT 21 / PASV)
              </text>
              <text x="978" y="546" fill="#0e7490" fontSize="14" fontFamily="monospace" fontWeight="800">
                ftp.bctech.asia (File Transfer)
              </text>

              {/* 3D Raised Port Buttons */}
              <g>
                <rect x="935" y="560" width="135" height="34" rx="8" fill="#155e75" filter="url(#shadow3DNode)" />
                <rect x="936" y="561" width="133" height="2" rx="1" fill="#67e8f9" />
                <text x="1002" y="582" fill="#ffffff" fontSize="13" fontFamily="monospace" fontWeight="800" textAnchor="middle">
                  CỔNG 21 (LỆNH)
                </text>

                <rect x="1085" y="560" width="165" height="34" rx="8" fill="#0e7490" filter="url(#shadow3DNode)" />
                <rect x="1086" y="561" width="163" height="2" rx="1" fill="#67e8f9" />
                <text x="1167" y="582" fill="#ffffff" fontSize="12" fontFamily="monospace" fontWeight="800" textAnchor="middle">
                  50000-50100 PASV
                </text>
              </g>
            </g>

            {/* Server Footer */}
            <text x="1085" y="645" fill="#0f172a" fontSize="14" fontWeight="800" fontFamily="sans-serif" textAnchor="middle">
              Bảo Mật: Let's Encrypt SSL Tự Động
            </text>
          </g>

          {/* ======================================================== */}
          {/* FLOATING 3D NAT FORWARDING TABLE (HIGH CONTRAST 18PT) */}
          {/* ======================================================== */}
          {showPortLabels && (
            <g className="pointer-events-none">
              {/* 3D Shadow Base */}
              <rect x="330" y="526" width="215" height="175" rx="16" fill="#94a3b8" />
              {/* 3D Floating Plaque */}
              <rect 
                x="330" 
                y="520" 
                width="215" 
                height="175" 
                rx="16" 
                fill="#ffffff" 
                stroke="#1e3a8a" 
                strokeWidth="3" 
                filter="url(#shadow3DFloating)"
              />
              <rect x="332" y="522" width="211" height="4" rx="2" fill="#93c5fd" />
              
              {/* Header in 18pt */}
              <text x="437" y="552" fill="#1e3a8a" fontSize="17" fontWeight="800" textAnchor="middle">
                BẢNG NAT FORWARD
              </text>
              <line x1="345" y1="562" x2="530" y2="562" stroke="#cbd5e1" strokeWidth="2" />

              {/* Rows with High Contrast Bold Typography fitted to plaque */}
              <circle cx="352" cy="580" r="4" fill="#059669" />
              <text x="365" y="585" fill="#065f46" fontSize="11.5" fontWeight="800" fontFamily="monospace">
                80, 443 → :Web Server
              </text>

              <circle cx="352" cy="605" r="4" fill="#d97706" />
              <text x="365" y="610" fill="#b45309" fontSize="11.5" fontWeight="800" fontFamily="monospace">
                25, 587 → :Mail Inbound
              </text>

              <circle cx="352" cy="630" r="4" fill="#d97706" />
              <text x="365" y="635" fill="#b45309" fontSize="11.5" fontWeight="800" fontFamily="monospace">
                993, 995 → :Mail Client
              </text>

              <circle cx="352" cy="655" r="4" fill="#0891b2" />
              <text x="365" y="660" fill="#0e7490" fontSize="11.5" fontWeight="800" fontFamily="monospace">
                21, 50k-50.1k → :FTP Data
              </text>

              <rect x="345" y="668" width="185" height="20" rx="4" fill="#eff6ff" />
              <text x="437" y="682" fill="#1d4ed8" fontSize="12" fontWeight="800" textAnchor="middle">
                ĐÍCH LAN: 192.168.1.200
              </text>
            </g>
          )}

          {/* ======================================================== */}
          {/* ACTIVE PACKET SIMULATION OVERLAY */}
          {/* ======================================================== */}
          {activeSimulation && currentStep && (
            <g className="pointer-events-none">
              {currentStep.state === 'internet' && (
                <circle cx="370" cy="270" r="22" fill="#0284c7" className="animate-ping opacity-75" />
              )}
              {currentStep.state === 'router_wan' && (
                <circle cx="590" cy="300" r="26" fill="#ef4444" className="animate-ping opacity-75" />
              )}
              {currentStep.state === 'switch' && (
                <circle cx="810" cy="345" r="22" fill="#10b981" className="animate-ping opacity-75" />
              )}
              {currentStep.state === 'server' && (
                <circle cx="1085" cy="275" r="28" fill="#10b981" className="animate-ping opacity-75" />
              )}
              {currentStep.state === 'router_snat' && (
                <circle cx="590" cy="380" r="24" fill="#2563eb" className="animate-ping opacity-75" />
              )}
            </g>
          )}
        </svg>

        {/* Bottom Floating Legend Bar */}
        <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          <div className={`flex items-center gap-3.5 backdrop-blur-md px-4 py-2.5 rounded-xl border-2 shadow-xl text-xs pointer-events-auto ${floatingBarBg}`}>
            <span className="font-extrabold text-slate-900">Quy ước màu:</span>
            <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold font-mono">
              <span className="w-3 h-3 rounded-full bg-emerald-600 shadow-sm"></span>
              Web (80/443)
            </div>
            <div className="flex items-center gap-1.5 text-amber-800 font-extrabold font-mono">
              <span className="w-3 h-3 rounded-full bg-amber-600 shadow-sm"></span>
              Mail (25/587/993)
            </div>
            <div className="flex items-center gap-1.5 text-cyan-800 font-extrabold font-mono">
              <span className="w-3 h-3 rounded-full bg-cyan-600 shadow-sm"></span>
              FTP (21/50000-50100)
            </div>
            <div className="flex items-center gap-1.5 text-blue-900 font-extrabold font-mono">
              <span className="w-3 h-3 rounded-full bg-blue-600 shadow-sm"></span>
              NAT Router & Gateway
            </div>
          </div>

          <div className={`flex items-center gap-2 backdrop-blur-md px-3.5 py-2 rounded-xl border-2 shadow-xl text-xs pointer-events-auto ${floatingBarBg}`}>
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-slate-900 font-bold">Click vào thiết bị để xem bảng phân tích thông số & cấu hình chi tiết</span>
          </div>
        </div>
      </div>
    </div>
  );
};
