/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NetworkConfig, SimulationScenario, GrayTone } from '../types/network';
import { getSimulationScenarios } from '../data/networkData';

export interface GeneratedVideoResult {
  base64: string;
  extn: 'mp4' | 'webm';
  coverBase64: string;
  blob: Blob;
  sizeBytes: number;
}

/**
 * Vẽ khung hình mô phỏng mạng độ phân giải cao lên Canvas
 */
export function drawSimulationFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  config: NetworkConfig,
  activeScenario: SimulationScenario,
  stepIndex: number,
  stepProgress: number, // 0 to 1
  totalSimulationTime: number,
  grayTheme: GrayTone = 'slate-gray'
) {
  const step = activeScenario.steps[stepIndex] || activeScenario.steps[0];
  const totalSteps = activeScenario.steps.length;
  const isLight = grayTheme === 'light-gray';
  const isCool = grayTheme === 'cool-gray';

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
  ctx.font = 'bold 24px Inter, Arial, sans-serif';
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
  ctx.fillText(`REC ${secs}s | HD SIMULATION`, w - 240, 48);

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

  ctx.font = 'bold 18px Inter, Arial, sans-serif';
  ctx.fillStyle = isLight ? '#1d4ed8' : '#93c5fd';
  ctx.fillText('🌐 INTERNET / PUBLIC NETWORK', 80, 150);
  ctx.font = '14px Inter, Arial, sans-serif';
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

  ctx.font = 'bold 18px Inter, Arial, sans-serif';
  ctx.fillStyle = isLight ? '#047857' : '#34d399';
  ctx.fillText('🏢 LOCAL AREA NETWORK (LAN) - 192.168.1.0/24', 540, 150);
  ctx.font = '14px Inter, Arial, sans-serif';
  ctx.fillStyle = textSub;
  ctx.fillText(`Gateway: ${config.lanGateway} | Máy chủ All-in-One: ${config.serverLanIp}`, 540, 175);

  // 5. CONNECTING LINK WIRES
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
  const drawNodeCard = (
    nx: number,
    ny: number,
    nw: number,
    nh: number,
    title: string,
    host: string,
    ports: string,
    color: string
  ) => {
    ctx.fillStyle = cardBg;
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(nx, ny, nw, nh, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(nx + 35, ny + 55, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 15px Inter, Arial, sans-serif';
    ctx.fillStyle = textMain;
    ctx.fillText(title, nx + 68, ny + 42);

    ctx.font = '13px Fira Code, monospace';
    ctx.fillStyle = textSub;
    ctx.fillText(host, nx + 68, ny + 68);

    ctx.font = '12px Inter, Arial, sans-serif';
    ctx.fillStyle = textSub;
    ctx.fillText(ports, nx + 68, ny + 92);
  };

  const drawServiceBox = (
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    bg: string,
    border: string,
    title: string,
    domain: string,
    ports: string
  ) => {
    ctx.fillStyle = bg;
    ctx.strokeStyle = border;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, 12);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 14px Inter, Arial, sans-serif';
    ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.fillText(title, sx + 16, sy + 32);

    ctx.font = '12px Fira Code, monospace';
    ctx.fillStyle = border;
    ctx.fillText(domain, sx + 16, sy + 58);

    ctx.font = '12px Inter, Arial, sans-serif';
    ctx.fillStyle = isLight ? '#334155' : '#cbd5e1';
    ctx.fillText(ports, sx + 16, sy + 84);
  };

  // Client 1: Web Client
  drawNodeCard(100, 220, 280, 110, 'Khách Web (HTTPS)', `https://${config.domain}`, 'Cổng: 443, 80', '#10b981');
  // Client 2: Mail MTA
  drawNodeCard(100, 410, 280, 110, 'Máy chủ Thư gửi đến', `mail.${config.domain}`, 'Cổng: 25, 587', '#f59e0b');
  // Client 3: FTP FileZilla
  drawNodeCard(100, 600, 280, 110, 'Client FTP (FileZilla)', `ftp.${config.domain}`, `Cổng: 21, ${config.ftpPassiveRange}`, '#06b6d4');

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
  ctx.font = 'bold 16px Inter, Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('🛡️ ROUTER / FIREWALL', 665, 345);

  // Router NAT Badge
  ctx.fillStyle = isLight ? '#e2e8f0' : '#1e293b';
  ctx.beginPath();
  ctx.roundRect(660, 380, 190, 36, 8);
  ctx.fill();
  ctx.font = 'bold 13px Inter, Arial, sans-serif';
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
  ctx.font = 'bold 11px Inter, Arial, sans-serif';
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
  ctx.font = 'bold 11px Inter, Arial, sans-serif';
  ctx.fillStyle = isLight ? '#047857' : '#6ee7b7';
  ctx.fillText('LAN GATEWAY', 675, 532);
  ctx.font = 'bold 15px Fira Code, monospace';
  ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
  ctx.fillText(`${config.lanGateway}/24`, 675, 558);

  // Router Footer
  ctx.font = '12px Inter, Arial, sans-serif';
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
  ctx.font = 'bold 15px Inter, Arial, sans-serif';
  ctx.fillStyle = textMain;
  ctx.fillText('LAN SWITCH', 1105, 495);
  ctx.font = '12px Inter, Arial, sans-serif';
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
  ctx.font = 'bold 20px Inter, Arial, sans-serif';
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
  drawServiceBox(1450, 360, 330, 105, isLight ? '#f0fdf4' : '#042f2e', '#0d9488', '🌐 DỊCH VỤ WEB (HTTP/HTTPS)', `Domain: ${config.domain}, www`, 'Ports: 80 (HTTP) • 443 (HTTPS SSL/TLS 1.3)');
  // Service 2: Mail
  drawServiceBox(1450, 485, 330, 125, isLight ? '#fffbeb' : '#451a03', '#d97706', '✉️ DỊCH VỤ MAIL (SMTP/IMAP)', `Domain: mail.${config.domain}`, 'Ports: 25 (SMTP MX) • 587 (Sub) • 993 (IMAPS)');
  // Service 3: FTP
  drawServiceBox(1450, 630, 330, 105, isLight ? '#ecfeff' : '#164e63', '#0891b2', '📁 DỊCH VỤ FTP (PORT 21/PASV)', `Domain: ftp.${config.domain}`, `Ports: 21 (CMD) • ${config.ftpPassiveRange} (PASV)`);

  // 7. ANIMATED PACKET EFFECT
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
  ctx.font = 'bold 13px Inter, Arial, sans-serif';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`KỊCH BẢN: ${activeScenario.title.toUpperCase()} • BƯỚC ${stepIndex + 1}/${totalSteps}`, 80, 910);

  ctx.font = 'bold 18px Inter, Arial, sans-serif';
  ctx.fillStyle = textMain;
  ctx.fillText(step.title, 80, 940);

  ctx.font = '14px Inter, Arial, sans-serif';
  ctx.fillStyle = textSub;
  ctx.fillText(step.description, 80, 970);

  if (step.natAction) {
    ctx.font = 'bold 13px Fira Code, monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`⚡ NAT ACTION: ${step.natAction}`, 80, 1005);
  }

  // Right block: Header packet inspection table
  const tblX = w - 500;
  ctx.fillStyle = isLight ? '#f1f5f9' : '#0d1117';
  ctx.strokeStyle = isLight ? '#cbd5e1' : '#21262d';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(tblX, 895, 430, 120, 10);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 12px Inter, Arial, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('IP PACKET HEADER (INSPECT)', tblX + 20, 918);

  ctx.font = '12px Fira Code, monospace';
  ctx.fillStyle = textMain;
  ctx.fillText(`SRC: ${step.srcIp}:${step.srcPort}`, tblX + 20, 945);
  ctx.fillText(`DST: ${step.dstIp}:${step.dstPort}`, tblX + 20, 972);

  ctx.fillStyle = '#10b981';
  ctx.fillText(`GIAO THỨC: TCP • TRẠNG THÁI: CHUYỂN TIẾP`, tblX + 20, 998);
}

/**
 * Chuyển Blob thành chuỗi Data URL Base64
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Tạo video mô phỏng động của hệ thống mạng server trong nền,
 * đóng gói thành chuỗi base64 và cover image để nhúng trực tiếp vào slide PowerPoint.
 */
export async function generateSimulationVideo(
  config: NetworkConfig,
  grayTheme: GrayTone = 'slate-gray',
  onProgress?: (percent: number, msg: string) => void
): Promise<GeneratedVideoResult> {
  if (typeof document === 'undefined') {
    throw new Error('Chức năng tạo video yêu cầu môi trường trình duyệt (DOM).');
  }

  const canvas = document.createElement('canvas');
  const w = 1280;
  const h = 720;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Không thể khởi tạo Canvas 2D context.');
  }

  const scenarios = getSimulationScenarios(config);
  const stream = canvas.captureStream(30);

  // Mime types ưu tiên mp4 nếu trình duyệt hỗ trợ, hoặc webm
  const mimeTypes = [
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8',
    'video/webm'
  ];

  let chosenMime = 'video/webm';
  let extn: 'mp4' | 'webm' = 'webm';
  for (const m of mimeTypes) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) {
      chosenMime = m;
      if (m.includes('mp4')) extn = 'mp4';
      break;
    }
  }

  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, {
    mimeType: chosenMime,
    videoBitsPerSecond: 3000000,
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  recorder.start(100);

  let coverBase64 = '';
  // Chọn 2 kịch bản tiêu biểu nhất (Web HTTPS & Hairpin NAT) để tạo video súc tích 6 giây chuẩn mực cho PowerPoint
  const selectedScenarios = scenarios.slice(0, 2);
  const fps = 30;
  const totalFrames = 180; // 6 giây = 180 frames (rất mượt mà, dung lượng tối ưu ~1-2MB cho slide)

  onProgress?.(5, 'Đang chuẩn bị khung hình và luồng ghi hình video...');

  for (let frame = 0; frame < totalFrames; frame++) {
    const overallProgress = frame / totalFrames;
    const scenarioIdx = overallProgress < 0.5 ? 0 : 1;
    const activeScenario = selectedScenarios[scenarioIdx];
    
    const localProgress = (overallProgress % 0.5) / 0.5;
    const stepCount = activeScenario.steps.length;
    const stepIdx = Math.min(stepCount - 1, Math.floor(localProgress * stepCount));
    const stepProgress = (localProgress * stepCount) % 1;
    const totalSimTime = (frame / fps) * 1000;

    drawSimulationFrame(ctx, w, h, config, activeScenario, stepIdx, stepProgress, totalSimTime, grayTheme);

    // Chụp lại ảnh cover ở frame 30 (lúc gói tin đang bay đẹp nhất)
    if (frame === 30 || (!coverBase64 && frame > 10)) {
      coverBase64 = canvas.toDataURL('image/png');
    }

    if (frame % 20 === 0) {
      const pct = Math.round(10 + (frame / totalFrames) * 75);
      onProgress?.(pct, `Đang kết xuất video mô phỏng hệ thống (${Math.round(totalSimTime / 1000)}s)...`);
      await new Promise(r => setTimeout(r, 16));
    }
  }

  onProgress?.(90, 'Đang hoàn tất đóng gói luồng video...');

  // Dừng ghi hình
  const blob = await new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      const b = new Blob(chunks, { type: chosenMime });
      resolve(b);
    };
    recorder.stop();
  });

  onProgress?.(95, 'Đang mã hóa video sang định dạng nhúng PowerPoint...');
  const base64 = await blobToDataUrl(blob);

  if (!coverBase64) {
    coverBase64 = canvas.toDataURL('image/png');
  }

  onProgress?.(100, 'Tạo video thành công!');

  return {
    base64,
    extn,
    coverBase64,
    blob,
    sizeBytes: blob.size
  };
}
