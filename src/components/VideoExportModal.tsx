import React, { useState, useRef, useEffect } from 'react';
import { NetworkConfig, SimulationScenario, GrayTone } from '../types/network';
import { getSimulationScenarios } from '../data/networkData';
import { exportNghienCuuPptx } from '../utils/pptxExport';
import { blobToDataUrl, generateSimulationVideo } from '../utils/simulationVideoGenerator';
import { 
  Video, 
  X, 
  Play, 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Film, 
  Settings2,
  Clock,
  Layers,
  MonitorPlay,
  FileVideo,
  AlertCircle,
  Presentation
} from 'lucide-react';

interface VideoExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: NetworkConfig;
  grayTheme: GrayTone;
}

export const VideoExportModal: React.FC<VideoExportModalProps> = ({
  isOpen,
  onClose,
  config,
  grayTheme,
}) => {
  if (!isOpen) return null;

  const scenarios = getSimulationScenarios(config);
  const [selectedScenarioMode, setSelectedScenarioMode] = useState<string>('all'); // 'all' or scenario id
  const [videoFileName, setVideoFileName] = useState<string>('Hethong');
  const [resolution, setResolution] = useState<'1080p' | '720p'>('1080p');
  const [fps, setFps] = useState<30 | 60>(30);
  
  // Recording states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedBlobSize, setRecordedBlobSize] = useState<number>(0);
  const [isExportingPptxWithVideo, setIsExportingPptxWithVideo] = useState<boolean>(false);
  const [pptxExportSuccess, setPptxExportSuccess] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordedBlobRef = useRef<Blob | null>(null);

  const isLight = grayTheme === 'light-gray';
  const isCool = grayTheme === 'cool-gray';

  const modalBg = isLight 
    ? 'bg-white border-slate-300 text-slate-900 shadow-2xl' 
    : isCool 
    ? 'bg-[#2a303c] border-[#3f4756] text-slate-100 shadow-2xl' 
    : 'bg-[#222731] border-[#363f50] text-slate-100 shadow-2xl';

  const subBoxBg = isLight 
    ? 'bg-[#f8fafc] border-slate-200' 
    : isCool 
    ? 'bg-[#1f242e] border-[#384252]' 
    : 'bg-[#181c23] border-[#2c3340]';

  // Determine width & height
  const width = resolution === '1080p' ? 1920 : 1280;
  const height = resolution === '1080p' ? 1080 : 720;

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl);
      }
    };
  }, []);

  const getSupportedMimeType = () => {
    const types = [
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4;codecs=avc1',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
    ];
    for (const t of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return 'video/webm';
  };

  // High-fidelity frame drawer for the video export
  const drawFrame = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    activeScenario: SimulationScenario,
    stepIndex: number,
    stepProgress: number, // 0 to 1
    totalSimulationTime: number
  ) => {
    const step = activeScenario.steps[stepIndex] || activeScenario.steps[0];
    const totalSteps = activeScenario.steps.length;

    // Palette based on gray theme
    const bgCol = isLight ? '#eaedf3' : isCool ? '#252a35' : '#1d212a';
    const gridDot = isLight ? 'rgba(100, 116, 139, 0.25)' : 'rgba(148, 163, 184, 0.16)';
    const cardBg = isLight ? '#ffffff' : isCool ? '#1e232b' : '#171a22';
    const cardBorder = isLight ? '#cbd5e1' : isCool ? '#3a4454' : '#2d3542';
    const textMain = isLight ? '#0f172a' : '#ffffff';
    const textSub = isLight ? '#475569' : '#94a3b8';

    // 1. Clear background
    ctx.fillStyle = bgCol;
    ctx.fillRect(0, 0, w, h);

    // 2. Draw Engineering Grid Dots
    const dotSpacing = 32;
    ctx.fillStyle = gridDot;
    for (let x = 16; x < w; x += dotSpacing) {
      for (let y = 16; y < h; y += dotSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Top Header Bar (Branding & IP specs)
    ctx.fillStyle = isLight ? '#ffffff' : '#151920';
    ctx.fillRect(0, 0, w, 80);
    ctx.fillStyle = isLight ? '#cbd5e1' : '#28313e';
    ctx.fillRect(0, 79, w, 1);

    // Title text
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillStyle = textMain;
    ctx.fillText('HỆ THỐNG MẠNG SERVER WEB • MAIL • FTP', 50, 48);

    // Domain & IP Badges in header
    ctx.font = 'bold 16px Fira Code, monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`DOMAIN: ${config.domain}`, 660, 48);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`PUBLIC IP: ${config.publicIp}`, 960, 48);

    ctx.fillStyle = '#34d399';
    ctx.fillText(`IP LAN: ${config.serverLanIp}`, 1320, 48);

    // Timestamp indicator
    ctx.font = '14px Fira Code, monospace';
    ctx.fillStyle = '#64748b';
    const secs = (totalSimulationTime / 1000).toFixed(1);
    ctx.fillText(`REC ${secs}s | 1080p HD`, w - 180, 48);

    // 4. ZONE RECTANGLES
    // Zone 1: Internet / Public Network (Left)
    ctx.fillStyle = isLight ? 'rgba(219, 234, 254, 0.5)' : 'rgba(30, 41, 59, 0.45)';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.roundRect(50, 110, 420, 740, 24);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillStyle = isLight ? '#1d4ed8' : '#93c5fd';
    ctx.fillText('🌐 INTERNET / PUBLIC NETWORK', 80, 150);
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = textSub;
    ctx.fillText('Khách hàng truy cập bên ngoài & MTA Mail Server', 80, 175);

    // Zone 2: Enterprise LAN Network (Right)
    ctx.fillStyle = isLight ? 'rgba(220, 252, 231, 0.45)' : 'rgba(6, 78, 59, 0.25)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.roundRect(510, 110, 1360, 740, 24);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillStyle = isLight ? '#047857' : '#34d399';
    ctx.fillText('🏢 LOCAL AREA NETWORK (LAN) - 192.168.1.0/24', 540, 150);
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = textSub;
    ctx.fillText(`Gateway: ${config.lanGateway} | Máy chủ All-in-One: ${config.serverLanIp}`, 540, 175);

    // 5. CONNECTING LINK WIRES
    // Client links to Router WAN (at center x: 740, y: 470)
    const routerWanX = 640;
    const routerWanY = 470;

    // Web Wire
    ctx.beginPath();
    ctx.moveTo(380, 280);
    ctx.lineTo(routerWanX, routerWanY);
    ctx.strokeStyle = activeScenario.service === 'web' ? '#10b981' : (isLight ? '#cbd5e1' : '#334155');
    ctx.lineWidth = activeScenario.service === 'web' ? 4 : 2;
    ctx.stroke();

    // Mail Wire
    ctx.beginPath();
    ctx.moveTo(380, 470);
    ctx.lineTo(routerWanX, routerWanY);
    ctx.strokeStyle = activeScenario.service === 'mail' ? '#f59e0b' : (isLight ? '#cbd5e1' : '#334155');
    ctx.lineWidth = activeScenario.service === 'mail' ? 4 : 2;
    ctx.stroke();

    // FTP Wire
    ctx.beginPath();
    ctx.moveTo(380, 660);
    ctx.lineTo(routerWanX, routerWanY);
    ctx.strokeStyle = activeScenario.service === 'ftp' ? '#06b6d4' : (isLight ? '#cbd5e1' : '#334155');
    ctx.lineWidth = activeScenario.service === 'ftp' ? 4 : 2;
    ctx.stroke();

    // Router LAN to Switch
    ctx.beginPath();
    ctx.moveTo(860, 470);
    ctx.lineTo(1080, 470);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Switch to Server
    ctx.beginPath();
    ctx.moveTo(1220, 470);
    ctx.lineTo(1420, 470);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 5;
    ctx.stroke();

    // 6. DRAW NODES
    // Client 1: Web Client
    drawNodeCard(ctx, 100, 220, 280, 110, cardBg, cardBorder, 'Khách Web (HTTPS)', `https://${config.domain}`, 'Cổng: 443, 80', '#10b981', textMain, textSub);
    // Client 2: Mail MTA
    drawNodeCard(ctx, 100, 410, 280, 110, cardBg, cardBorder, 'Máy chủ Thư gửi đến', `mail.${config.domain}`, 'Cổng: 25, 587', '#f59e0b', textMain, textSub);
    // Client 3: FTP FileZilla
    drawNodeCard(ctx, 100, 600, 280, 110, cardBg, cardBorder, 'Client FTP (FileZilla)', `ftp.${config.domain}`, `Cổng: 21, ${config.ftpPassiveRange}`, '#06b6d4', textMain, textSub);

    // Center Node: ROUTER / FIREWALL GATEWAY
    ctx.fillStyle = cardBg;
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(640, 310, 230, 340, 20);
    ctx.fill();
    ctx.stroke();

    // Router Header
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.roundRect(640, 310, 230, 56, [20, 20, 0, 0]);
    ctx.fill();
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🛡️ ROUTER / FIREWALL', 665, 345);

    // Router NAT Badge
    ctx.fillStyle = isLight ? '#e2e8f0' : '#1e293b';
    ctx.beginPath();
    ctx.roundRect(660, 380, 190, 36, 8);
    ctx.fill();
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('⚡ NAT PORT FORWARDING', 675, 404);

    // WAN Box
    ctx.fillStyle = isLight ? '#eff6ff' : '#0f172a';
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(660, 430, 190, 64, 8);
    ctx.fill();
    ctx.stroke();
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = isLight ? '#1e40af' : '#93c5fd';
    ctx.fillText('WAN (PUBLIC IP)', 675, 452);
    ctx.font = 'bold 15px Fira Code, monospace';
    ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.fillText(config.publicIp, 675, 478);

    // LAN Box
    ctx.fillStyle = isLight ? '#f0fdf4' : '#0f172a';
    ctx.strokeStyle = '#059669';
    ctx.beginPath();
    ctx.roundRect(660, 510, 190, 64, 8);
    ctx.fill();
    ctx.stroke();
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = isLight ? '#047857' : '#6ee7b7';
    ctx.fillText('LAN GATEWAY', 675, 532);
    ctx.font = 'bold 15px Fira Code, monospace';
    ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.fillText(`${config.lanGateway}/24`, 675, 558);

    // Router Footer
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = textSub;
    ctx.fillText('Hairpin NAT Enabled', 690, 615);

    // Switch Node
    ctx.fillStyle = cardBg;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(1080, 400, 140, 140, 18);
    ctx.fill();
    ctx.stroke();
    ctx.font = '32px sans-serif';
    ctx.fillText('🔀', 1130, 460);
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillStyle = textMain;
    ctx.fillText('LAN SWITCH', 1105, 495);
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText('Gigabit 1000M', 1110, 520);

    // Target Server Node: All-in-One Server (Right)
    ctx.fillStyle = cardBg;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(1420, 200, 390, 560, 24);
    ctx.fill();
    ctx.stroke();

    // Server Header
    ctx.fillStyle = isLight ? '#059669' : '#064e3b';
    ctx.beginPath();
    ctx.roundRect(1420, 200, 390, 70, [24, 24, 0, 0]);
    ctx.fill();
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🖥️ ALL-IN-ONE SERVER', 1450, 244);

    // IP LAN Banner
    ctx.fillStyle = isLight ? '#dcfce7' : '#022c22';
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(1450, 290, 330, 48, 10);
    ctx.fill();
    ctx.stroke();
    ctx.font = 'bold 18px Fira Code, monospace';
    ctx.fillStyle = isLight ? '#065f46' : '#34d399';
    ctx.fillText(`IP LAN: ${config.serverLanIp}`, 1500, 322);

    // Service 1: Web
    drawServiceBox(ctx, 1450, 360, 330, 105, isLight ? '#f0fdf4' : '#042f2e', '#0d9488', '🌐 DỊCH VỤ WEB (HTTP/HTTPS)', `Domain: ${config.domain}, www`, 'Ports: 80 (HTTP) • 443 (HTTPS SSL/TLS 1.3)', isLight);
    // Service 2: Mail
    drawServiceBox(ctx, 1450, 485, 330, 125, isLight ? '#fffbeb' : '#451a03', '#d97706', '✉️ DỊCH VỤ MAIL (SMTP/IMAP)', `Domain: mail.${config.domain}`, 'Ports: 25 (SMTP MX) • 587 (Sub) • 993 (IMAPS)', isLight);
    // Service 3: FTP
    drawServiceBox(ctx, 1450, 630, 330, 105, isLight ? '#ecfeff' : '#164e63', '#0891b2', '📁 DỊCH VỤ FTP (PORT 21/PASV)', `Domain: ftp.${config.domain}`, `Ports: 21 (CMD) • ${config.ftpPassiveRange} (PASV)`, isLight);

    // 7. ANIMATED PACKET EFFECT
    // Calculate packet position along the route based on step and progress
    let packetX = 240;
    let packetY = 280;
    if (activeScenario.service === 'mail') packetY = 470;
    if (activeScenario.service === 'ftp') packetY = 660;

    if (step.state === 'client') {
      packetX = 240 + stepProgress * 140;
    } else if (step.state === 'internet') {
      packetX = 380 + stepProgress * (routerWanX - 380);
      packetY = packetY + stepProgress * (routerWanY - packetY);
    } else if (step.state === 'router_wan') {
      packetX = routerWanX + stepProgress * 110;
      packetY = routerWanY;
    } else if (step.state === 'switch') {
      packetX = 860 + stepProgress * 300;
      packetY = 470;
    } else if (step.state === 'server') {
      packetX = 1220 + stepProgress * 280;
      packetY = 470;
    } else if (step.state === 'server_response') {
      packetX = 1500 - stepProgress * 400;
      packetY = 470;
    } else if (step.state === 'router_snat') {
      packetX = 860 - stepProgress * (860 - 380);
      packetY = 470 + stepProgress * (packetY - 470);
    }

    // Draw glowing animated packet
    const pulseRadius = 14 + Math.sin(stepProgress * Math.PI * 4) * 4;
    const packetColor = activeScenario.service === 'web' ? '#10b981' : activeScenario.service === 'mail' ? '#f59e0b' : '#06b6d4';

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(packetX, packetY, pulseRadius + 12, 0, Math.PI * 2);
    ctx.fillStyle = activeScenario.service === 'web' ? 'rgba(16, 185, 129, 0.25)' : activeScenario.service === 'mail' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(6, 182, 212, 0.25)';
    ctx.fill();

    // Inner packet
    ctx.beginPath();
    ctx.arc(packetX, packetY, pulseRadius, 0, Math.PI * 2);
    ctx.fillStyle = packetColor;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Packet label
    ctx.font = 'bold 12px Fira Code, monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${step.srcPort}➔${step.dstPort}`, packetX - 30, packetY - 24);

    // 8. BOTTOM STEP NARRATIVE OVERLAY CARD
    ctx.fillStyle = isLight ? '#ffffff' : '#141822';
    ctx.strokeStyle = isLight ? '#cbd5e1' : '#333e50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(50, 875, w - 100, 160, 18);
    ctx.fill();
    ctx.stroke();

    // Left block: Step indicator & Title
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`KỊCH BẢN: ${activeScenario.title.toUpperCase()} • BƯỚC ${stepIndex + 1}/${totalSteps}`, 80, 910);

    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillStyle = textMain;
    ctx.fillText(step.title, 80, 940);

    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = textSub;
    ctx.fillText(step.description, 80, 970);

    if (step.natAction) {
      ctx.font = 'bold 13px Fira Code, monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`⚡ NAT ACTION: ${step.natAction}`, 80, 1005);
    }

    // Right block: Live Packet Header Box
    ctx.fillStyle = isLight ? '#f1f5f9' : '#0d1117';
    ctx.strokeStyle = isLight ? '#e2e8f0' : '#232a36';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(w - 600, 895, 520, 120, 12);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = textSub;
    ctx.fillText('BỘ GIẢI MÃ GÓI TIN (PACKET HEADER)', w - 580, 922);

    ctx.font = 'bold 14px Fira Code, monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`SOURCE:      ${step.srcIp}:${step.srcPort}`, w - 580, 950);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`DESTINATION: ${step.dstIp}:${step.dstPort}`, w - 580, 975);

    ctx.font = '12px Fira Code, monospace';
    ctx.fillStyle = textSub;
    ctx.fillText(`PAYLOAD: ${step.packetDetails}`, w - 580, 1000);
  };

  const drawNodeCard = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    bg: string,
    border: string,
    title: string,
    host: string,
    ports: string,
    badgeCol: string,
    textMain: string,
    textSub: string
  ) => {
    ctx.fillStyle = bg;
    ctx.strokeStyle = border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.fill();
    ctx.stroke();

    // Circle icon
    ctx.fillStyle = badgeCol;
    ctx.beginPath();
    ctx.arc(x + 35, y + 55, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillStyle = textMain;
    ctx.fillText(title, x + 68, y + 42);

    ctx.font = '13px Fira Code, monospace';
    ctx.fillStyle = textSub;
    ctx.fillText(host, x + 68, y + 68);

    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = textSub;
    ctx.fillText(ports, x + 68, y + 92);
  };

  const drawServiceBox = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    bg: string,
    border: string,
    title: string,
    domain: string,
    ports: string,
    isLight: boolean
  ) => {
    ctx.fillStyle = bg;
    ctx.strokeStyle = border;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 12);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.fillText(title, x + 16, y + 32);

    ctx.font = '12px Fira Code, monospace';
    ctx.fillStyle = border;
    ctx.fillText(domain, x + 16, y + 58);

    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = isLight ? '#334155' : '#cbd5e1';
    ctx.fillText(ports, x + 16, y + 84);
  };

  // Start Video Recording Process
  const handleStartExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsRecording(true);
    setProgress(0);
    setStatusText('Đang khởi tạo luồng quay video (MediaRecorder stream)...');
    setRecordedVideoUrl(null);

    // Determine target scenarios to play
    const scenariosToPlay = selectedScenarioMode === 'all'
      ? scenarios
      : scenarios.filter(s => s.id === selectedScenarioMode);

    // Setup MediaStream from Canvas
    const stream = canvas.captureStream(fps);
    const mimeType = getSupportedMimeType();

    recordedChunksRef.current = [];
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: resolution === '1080p' ? 6000000 : 3500000,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        recordedBlobRef.current = blob;
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideoUrl(videoUrl);
        setRecordedBlobSize(blob.size);
        setIsRecording(false);
        setProgress(100);
        setStatusText('Xuất video thành công!');

        // Automatically trigger download with requested filename Hethong.mp4
        const a = document.createElement('a');
        a.href = videoUrl;
        const ext = mimeType.includes('mp4') ? 'mp4' : 'mp4';
        a.download = `${videoFileName.trim() || 'Hethong'}.${ext}`;
        a.click();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(200); // chunk every 200ms
    } catch (err: any) {
      console.error('MediaRecorder initialization error:', err);
      setStatusText('Trình duyệt không hỗ trợ MediaRecorder trực tiếp. Đang render frame...');
    }

    // Playback loop calculation
    let currentScenarioIdx = 0;
    let currentStepIdx = 0;
    let stepTimer = 0;
    const stepDurationMs = 2400; // 2.4s per step
    const totalStepsAll = scenariosToPlay.reduce((acc, s) => acc + s.steps.length, 0);
    let completedStepsCount = 0;
    let lastTimestamp = performance.now();
    let totalSimulationTime = 0;

    const renderLoop = (timestamp: number) => {
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      stepTimer += delta;
      totalSimulationTime += delta;

      const activeScenario = scenariosToPlay[currentScenarioIdx];
      const stepProgress = Math.min(1, stepTimer / stepDurationMs);

      // Draw high fidelity frame
      drawFrame(ctx, width, height, activeScenario, currentStepIdx, stepProgress, totalSimulationTime);

      // Check if step completed
      if (stepTimer >= stepDurationMs) {
        stepTimer = 0;
        currentStepIdx++;
        completedStepsCount++;

        // Update progress %
        const prog = Math.min(99, Math.round((completedStepsCount / totalStepsAll) * 100));
        setProgress(prog);
        setStatusText(`Đang kết xuất kịch bản: ${activeScenario.title.split('(')[0]} (Bước ${currentStepIdx}/${activeScenario.steps.length})...`);

        // Check if scenario completed
        if (currentStepIdx >= activeScenario.steps.length) {
          currentStepIdx = 0;
          currentScenarioIdx++;
        }
      }

      // Check if all scenarios completed
      if (currentScenarioIdx < scenariosToPlay.length) {
        animationFrameRef.current = requestAnimationFrame(renderLoop);
      } else {
        // Finish recording!
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
        }, 500);
      }
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);
  };

  const handleStopRecordingEarly = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Xuất Video chạy trực tiếp trong slide PowerPoint nghiencuu.pptx
  const handleExportVideoToPptx = async () => {
    let blob = recordedBlobRef.current;
    setIsExportingPptxWithVideo(true);
    setStatusText('Đang xử lý nhúng video trực tiếp vào slide PowerPoint...');

    try {
      if (!blob) {
        // Nếu người dùng chưa quay, tạo video mô phỏng tự động mượt mà
        const result = await generateSimulationVideo(config, grayTheme, (pct, msg) => {
          setProgress(pct);
          setStatusText(msg);
        });
        await exportNghienCuuPptx(config, {
          includeVideo: true,
          videoData: {
            base64: result.base64,
            extn: result.extn,
            coverBase64: result.coverBase64,
          },
          fileName: 'nghiencuu.pptx',
        });
      } else {
        // Đã có video sẵn từ MediaRecorder, chuyển thành base64 và nhúng ngay
        const base64 = await blobToDataUrl(blob);
        const coverBase64 = canvasRef.current ? canvasRef.current.toDataURL('image/png') : undefined;
        const extn = blob.type.includes('mp4') ? 'mp4' : 'webm';
        await exportNghienCuuPptx(config, {
          includeVideo: true,
          videoData: {
            base64,
            extn,
            coverBase64,
          },
          fileName: 'nghiencuu.pptx',
        });
      }

      setPptxExportSuccess(true);
      setStatusText('Đã xuất thành công tệp nghiencuu.pptx có video chạy trực tiếp bên trong slide!');
      setTimeout(() => setPptxExportSuccess(false), 6000);
    } catch (err: any) {
      console.error('Lỗi khi xuất PowerPoint kèm video:', err);
      setStatusText('Lỗi xuất PowerPoint: ' + (err?.message || 'Vui lòng thử lại.'));
    } finally {
      setIsExportingPptxWithVideo(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className={`border rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${modalBg}`}>
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-700/60'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Xuất Video Mô Phỏng Hệ Thống Server
              </h3>
              <p className="text-xs text-slate-400">
                Xuất video chất lượng cao giữ nguyên toàn bộ hiệu ứng chuyển động luồng gói tin NAT và bảng thông số
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Settings Section */}
          <div className={`p-4 rounded-xl border space-y-4 ${subBoxBg}`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              <Settings2 className="w-4 h-4 text-blue-400" />
              Thiết Lập Xuất Video
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* File Name */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">Tên video xuất ra:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={videoFileName}
                    onChange={e => setVideoFileName(e.target.value)}
                    placeholder="Hethong"
                    className={`w-full px-3 py-2 rounded-lg border font-mono font-bold focus:outline-none focus:border-blue-500 text-xs ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[11px] font-bold">
                    .mp4
                  </span>
                </div>
              </div>

              {/* Resolution */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">Độ phân giải video:</label>
                <select
                  value={resolution}
                  onChange={e => setResolution(e.target.value as any)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-blue-500 text-xs ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                >
                  <option value="1080p">Full HD 1080p (1920x1080)</option>
                  <option value="720p">HD 720p (1280x720)</option>
                </select>
              </div>

              {/* FPS */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">Tốc độ khung hình (FPS):</label>
                <select
                  value={fps}
                  onChange={e => setFps(Number(e.target.value) as any)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-blue-500 text-xs ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                >
                  <option value={30}>30 FPS (Mượt mà, tệp nhẹ)</option>
                  <option value={60}>60 FPS (Cực mượt mà)</option>
                </select>
              </div>

              {/* Scenario scope */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nội dung mô phỏng:</label>
                <select
                  value={selectedScenarioMode}
                  onChange={e => setSelectedScenarioMode(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:border-blue-500 text-xs ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                >
                  <option value="all">🌟 Toàn bộ 4 dịch vụ (Tour đầy đủ)</option>
                  <option value="sim-web-https">🌐 Web HTTPS (Port 443)</option>
                  <option value="sim-mail-smtp">✉️ Mail Inbound (Port 25)</option>
                  <option value="sim-ftp-passive">📁 FTP Passive (Port 21 & Range)</option>
                  <option value="sim-lan-hairpin">🔄 Hairpin NAT nội bộ</option>
                </select>
              </div>
            </div>
          </div>

          {/* Recording Canvas Frame Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold">
                <MonitorPlay className="w-4 h-4 text-emerald-400" />
                Khung hình đang kết xuất (Live Canvas Render):
              </span>
              <span className="font-mono text-[11px]">
                {resolution} • {fps} FPS • Tên file: <b className="text-sky-400">{videoFileName || 'Hethong'}.mp4</b>
              </span>
            </div>

            <div className="relative w-full aspect-video rounded-xl border border-slate-700/80 bg-slate-950 overflow-hidden shadow-inner flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="w-full h-full object-contain"
              />

              {!isRecording && !recordedVideoUrl && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3 p-4 text-center">
                  <div className="p-4 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    <Video className="w-8 h-8" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">Sẵn sàng xuất video mô phỏng</h5>
                    <p className="text-xs text-slate-400 mt-1 max-w-md">
                      Nhấn nút bên dưới để hệ thống kết xuất chuyển động gói tin, ánh xạ NAT và header thành video <b className="text-white font-mono">{videoFileName || 'hethongServer'}.webm</b>
                    </p>
                  </div>
                  <button
                    onClick={handleStartExportVideo}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 active:scale-95"
                  >
                    <Play className="w-4 h-4" />
                    <span>Bắt đầu tạo video ({videoFileName || 'hethongServer'})</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Progress & Recording Status */}
          {isRecording && (
            <div className={`p-4 rounded-xl border space-y-3 ${subBoxBg}`}>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                  <span className="font-bold text-rose-400">Đang ghi hình video (Recording in progress)...</span>
                </div>
                <span className="font-mono font-bold text-sky-400 text-sm">{progress}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-150 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{statusText}</span>
                <button
                  onClick={handleStopRecordingEarly}
                  className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition-all"
                >
                  Dừng & Hoàn tất ngay
                </button>
              </div>
            </div>
          )}

          {/* Video Preview & Download Section when finished */}
          {recordedVideoUrl && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Video đã kết xuất thành công! Dung lượng: {(recordedBlobSize / (1024 * 1024)).toFixed(2)} MB</span>
                </div>

                <a
                  href={recordedVideoUrl}
                  download={`${videoFileName.trim() || 'hethongServer'}.webm`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải lại video ({videoFileName || 'hethongServer'}.webm)</span>
                </a>
              </div>

              {/* Inline video player */}
              <video
                src={recordedVideoUrl}
                controls
                autoPlay
                loop
                className="w-full rounded-xl border border-slate-700 bg-black aspect-video shadow-md"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Giữ nguyên hiệu ứng chuyển động luồng gói tin, sóng phát xạ, và header giải mã</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all text-xs font-medium"
            >
              Đóng
            </button>

            {!isRecording && (
              <button
                onClick={handleStartExportVideo}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all text-xs"
              >
                <Video className="w-4 h-4" />
                <span>Xuất video {videoFileName || 'hethongServer'}.webm</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
