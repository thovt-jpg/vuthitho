import React, { useState } from 'react';
import { NetworkConfig, GrayTone } from '../types/network';
import { exportNghienCuuPptx } from '../utils/pptxExport';
import { 
  Presentation, 
  X, 
  Download, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Copy,
  Check,
  BookOpen,
  Layers,
  ShieldCheck
} from 'lucide-react';

interface PptxPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: NetworkConfig;
  grayTheme: GrayTone;
}

export const PptxPreviewModal: React.FC<PptxPreviewModalProps> = ({
  isOpen,
  onClose,
  config,
  grayTheme,
}) => {
  if (!isOpen) return null;

  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedNote, setCopiedNote] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

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

  // 10 academic slides definition conforming exactly to standards
  const slidesData = [
    {
      slideNum: 1,
      title: 'BÁO CÁO NGHIÊN CỨU KIẾN TRÚC MÁY CHỦ WEB, MAIL, FTP',
      type: 'Trang Bìa Học Thuật',
      content: [
        `• Tên miền triển khai: ${config.domain}`,
        `• Máy chủ dịch vụ LAN: ${config.serverLanIp}`,
        `• Cổng giao tiếp Public WAN: ${config.publicIp}`,
        `• Chuyên đề: Quản trị Hệ thống Mạng & An ninh Thông tin Doanh nghiệp`,
      ],
      speakerNotes: `KỊCH BẢN LỜI GIẢNG DÀNH CHO GIẢNG VIÊN (SLIDE 1 - MỞ ĐẦU):\n1. Lời chào: Xin chào các học viên/sinh viên. Hôm nay chúng ta đi vào đề tài nghiên cứu thực tiễn rất điển hình tại các doanh nghiệp: "Thiết kế và triển khai cụm máy chủ Web, Mail, FTP nội bộ IP ${config.serverLanIp} được Public ra Internet bằng một địa chỉ IP tĩnh duy nhất ${config.publicIp}".\n2. Tính cấp thiết: Trong thực tế, địa chỉ IPv4 công cộng ngày càng đắt đỏ và khan hiếm. Đa phần các tổ chức chỉ sở hữu từ 1 đến 2 địa chỉ IP Public. Làm thế nào để vừa tiết kiệm chi phí, vừa vận hành cùng lúc cả ba dịch vụ thiết yếu trên một máy chủ đặt an toàn sau lớp mạng nội bộ? Đề tài này sẽ phân tích từ kiến trúc, cơ chế dịch cổng NAT/PAT đến các bài toán an ninh thực tế.`,
    },
    {
      slideNum: 2,
      title: 'ĐẶT VẤN ĐỀ & MỤC TIÊU NGHIÊN CỨU',
      type: 'Đặt Vấn Đề',
      content: [
        `• Thách thức 1: IP Public duy nhất (${config.publicIp}) cho nhiều dịch vụ.`,
        `• Thách thức 2: Máy chủ đặt tại dải LAN riêng (${config.serverLanIp}).`,
        `• Mục tiêu 1: Thiết lập bảng Port Forwarding (DNAT) chuẩn mực.`,
        `• Mục tiêu 2: Cấu hình DNS Authoritative cho domain ${config.domain}.`,
        `• Mục tiêu 3: Xử lý triệt để bẫy Passive FTP & hiện tượng Hairpin NAT.`,
      ],
      speakerNotes: `KỊCH BẢN LỜI GIẢNG CHO GIẢNG VIÊN (SLIDE 2):\n- Nhấn mạnh mục 1: Hãy chỉ ra cho người học thấy rằng nếu không có cơ chế Port Forwarding (DNAT), một máy tính bên ngoài không có cách nào tiếp cận được địa chỉ Private IP theo chuẩn RFC 1918 (192.168.1.200).\n- Nhấn mạnh mục 2: Mục tiêu cốt lõi không chỉ là cho thông mạng (ping thấy), mà phải đảm bảo 3 dịch vụ Web, Mail, FTP hoạt động ổn định với đầy đủ chứng chỉ mã hóa TLS và các bản ghi chống spam thư rác.`,
    },
    {
      slideNum: 3,
      title: 'SƠ ĐỒ KIẾN TRÚC HỆ THỐNG MẠNG TỔNG THỂ',
      type: 'Kiến Trúc Topology',
      content: [
        `• Vùng Internet (WAN): Trình duyệt Web, Mail MTA, FileZilla Client.`,
        `• Router & Firewall: WAN ${config.publicIp} | LAN ${config.lanGateway} (Dịch cổng NAT/PAT).`,
        `• LAN Switch: Gigabit 1000Mbps phân phối kết nối nội bộ.`,
        `• Server ${config.serverLanIp}: Web (80, 443), Mail (25, 587, 993), FTP (21, ${config.ftpPassiveRange}).`,
      ],
      speakerNotes: `KỊCH BẢN LỜI GIẢNG CHO GIẢNG VIÊN (SLIDE 3 - SƠ ĐỒ MẠNG TỔNG THỂ):\n1. Giải thích 3 phân vùng: Trái là Internet công cộng, giữa là thiết bị biên (Router/Firewall), phải là mạng nội bộ doanh nghiệp.\n2. Điểm chốt kỹ thuật: Router đóng vai trò "người bảo vệ cửa ngõ". Toàn bộ thế giới bên ngoài chỉ biết tới duy nhất IP Public ${config.publicIp}. Họ hoàn toàn không nhìn thấy địa chỉ LAN ${config.serverLanIp}.\n3. Câu hỏi thảo luận: Nếu có nhiều gói tin cùng ùa tới cổng 443 và cổng 25 của Router, Router dựa vào bảng ánh xạ nào để chuyển tiếp đúng dịch vụ? (Dẫn dắt sang Slide 4: Port Forwarding Matrix).`,
    },
    {
      slideNum: 4,
      title: 'MA TRẬN ÁNH XẠ CỔNG PORT FORWARDING (DNAT)',
      type: 'Ma Trận Cổng',
      content: [
        `• Web HTTP / HTTPS: Cổng 80 & 443 ➔ Chuyển tiếp tới ${config.serverLanIp}:80, 443`,
        `• Mail Inbound (MTA to MTA): Cổng 25 ➔ Chuyển tiếp tới ${config.serverLanIp}:25`,
        `• Mail Client Submission: Cổng 587 & 465 ➔ Chuyển tiếp tới ${config.serverLanIp}:587, 465`,
        `• Mail Retrieval (IMAPS): Cổng 993 ➔ Chuyển tiếp tới ${config.serverLanIp}:993`,
        `• FTP Control & Passive: Cổng 21 & ${config.ftpPassiveRange} ➔ Chuyển tiếp tới ${config.serverLanIp}`,
      ],
      speakerNotes: `KỊCH BẢN LỜI GIẢNG CHO GIẢNG VIÊN (SLIDE 4):\n- Phân tích nguyên tắc 1-1 Port Forwarding: Một cổng ngoài (External Port) trên Router được cố định chuyển vào một cổng trong (Internal Port) của máy chủ ${config.serverLanIp}.\n- Lưu ý đặc biệt: Cổng 25 chỉ dùng để nhận thư từ các Mail Server khác (như Gmail chuyển thư về). Không mở cổng 25 cho người dùng gửi thư để tránh bị lợi dụng làm trạm phát thư rác (Open Relay).\n- Người dùng gửi thư (Outlook, Thunderbird) bắt buộc kết nối qua cổng Submission 587 có xác thực mật khẩu.`,
    },
    {
      slideNum: 5,
      title: 'THIẾT KẾ DỊCH VỤ WEB BẢO MẬT (BCTECH.ASIA)',
      type: 'Dịch Vụ Web',
      content: [
        `• Cổng 80: Nhận thử thách Let's Encrypt ACME & chuyển hướng 301 sang HTTPS.`,
        `• Cổng 443: Kích hoạt HTTP/2, mã hóa TLS 1.3 với chứng chỉ SSL hợp chuẩn.`,
        `• Bản ghi A (@): ${config.domain} trỏ về IP Public ${config.publicIp}`,
        `• Bản ghi A (www): www.${config.domain} trỏ về IP Public ${config.publicIp}`,
      ],
      speakerNotes: `KỊCH BẢN LỜI GIẢNG CHO GIẢNG VIÊN (SLIDE 5):\n- Giảng giải sinh viên: Vì sao đã dùng HTTPS rồi mà vẫn phải mở cổng 80? Vì chương trình gia hạn chứng chỉ tự động (Certbot) cần truy cập qua cổng 80 để xác thực quyền sở hữu tên miền (.well-known/acme-challenge).\n- Đồng thời cổng 80 sẽ tự động trả về mã phản hồi HTTP 301 Moved Permanently để nâng cấp người dùng lên kết nối an toàn cổng 443.`,
    },
    {
      slideNum: 6,
      title: 'THIẾT KẾ MÁY CHỦ THƯ ĐIỆN TỬ & CHỐNG THƯ RÁC',
      type: 'Dịch Vụ Mail',
      content: [
        `• Bản ghi MX: @ ➔ mail.${config.domain} (Độ ưu tiên: Priority 10).`,
        `• Bản ghi SPF (TXT): v=spf1 mx ip4:${config.publicIp} ~all (Chỉ định IP được gửi mail).`,
        `• Bản ghi DKIM: Chữ ký số mã hóa RSA xác thực tính toàn vẹn nội dung email.`,
        `• Bản ghi DMARC: Chính sách xử lý thư giả mạo và báo cáo về ban quản trị.`,
        `• Bản ghi rDNS (PTR): Khai báo IP ${config.publicIp} trỏ về mail.${config.domain}.`,
      ],
      speakerNotes: `KỊCH BẢN LỜI GIẢNG CHO GIẢNG VIÊN (SLIDE 6):\n- Lưu ý trọng tâm: Năm 2024, Google và Yahoo áp dụng tiêu chuẩn chống thư rác cực kỳ khắt khe. Nếu hệ thống mail công ty tự dựng thiếu 1 trong 3 bản ghi (SPF, DKIM, DMARC), hoặc thiếu rDNS từ ISP, 100% email gửi sang đối tác sẽ bị đưa vào hộp thư rác (Spam) hoặc bị máy chủ đích từ chối tiếp nhận.\n- Nhắc nhở: Các nhà mạng gia đình thường chặn cổng 25 Outbound. Doanh nghiệp cần ký hợp đồng cáp quang IP tĩnh dành cho doanh nghiệp để được mở cổng 25 hai chiều.`,
    },
    {
      slideNum: 7,
      title: 'GIẢI PHÁP FTP PASSIVE MODE QUA ROUTER NAT',
      type: 'Dịch Vụ FTP',
      content: [
        `• Bản chất FTP: Sử dụng 2 kết nối độc lập (Port 21 lệnh & Port truyền dữ liệu).`,
        `• Bẫy kỹ thuật: Nếu chỉ mở Port 21, lệnh LIST/MLSD sẽ bị treo Timeout vĩnh viễn!`,
        `• Cơ chế Passive FTP: Server mở một cổng trong dải ${config.ftpPassiveRange}.`,
        `• Cấu hình then chốt: Khai báo pasv_address=${config.publicIp} trong file vsftpd.`,
      ],
      speakerNotes: `KỊCH BẢN LỜI GIẢNG CHO GIẢNG VIÊN (SLIDE 7):\n- Đặt câu hỏi kích thích tư duy: "Bao nhiêu bạn ở đây từng cài FTP Server, đăng nhập USER/PASS được nhưng khi mở thư mục bằng FileZilla thì bị xoay tròn và báo lỗi Timeout?".\n- Phân tích bản chất: Khi Client gửi lệnh PASV, nếu Server nằm sau NAT mà không được cấu hình pasv_address, nó sẽ ngây thơ gửi về IP nội bộ của nó là ${config.serverLanIp}. Máy khách ngoài Internet dĩ nhiên không thể kết nối tới IP Private đó và dẫn tới treo kết nối!`,
    },
    {
      slideNum: 8,
      title: 'HIỆN TƯỢNG HAIRPIN NAT TRONG MẠNG NỘI BỘ',
      type: 'Hiện Tượng NAT',
      content: [
        `• Vấn đề: Máy tính nội bộ 192.168.1.50 gõ https://${config.domain} bị lỗi Timeout.`,
        `• Nguyên nhân: Định tuyến bất đối xứng (Asymmetric Routing Loop) làm drop gói.`,
        `• Giải pháp 1: Bật tính năng Hairpin NAT (NAT Loopback) trên Router biên.`,
        `• Giải pháp 2: Triển khai Split-Brain DNS (phân giải nội bộ về ${config.serverLanIp}).`,
      ],
      speakerNotes: `KỊCH BẢN LỜI GIẢNG CHO GIẢNG VIÊN (SLIDE 8):\n- Tình huống thực tế: Khách hàng ở ngoài thì khen website công ty tải nhanh, nhưng Giám đốc ngồi tại văn phòng bấm vào tên miền công ty thì báo "Không thể truy cập trang web". Đây chính là lỗi thiếu Hairpin NAT.\n- Giảng viên vẽ sơ đồ luồng gói tin lên bảng: Client (192.168.1.50) gửi đến IP Public. Router nhận gói và gửi cho Server (${config.serverLanIp}). Server thấy IP nguồn là 192.168.1.50 (cùng mạng LAN) nên gửi trả gói tin trực tiếp không qua Router! Client nhận được gói tin từ ${config.serverLanIp} trong khi nó đang chờ từ IP Public -> Client tự DROP gói tin!`,
    },
    {
      slideNum: 9,
      title: 'PHÂN TÍCH BẢO MẬT & ĐỀ XUẤT MÔ HÌNH DMZ',
      type: 'An Ninh & DMZ',
      content: [
        `• Rủi ro hiện tại: Nguy cơ tấn công leo thang ngang (Lateral Movement).`,
        `• Nếu Server LAN bị chiếm quyền, toàn bộ máy tính văn phòng có thể bị nhiễm ransomware.`,
        `• Khuyến nghị DMZ: Tách Server sang VLAN DMZ riêng (ví dụ: 192.168.200.0/24).`,
        `• Chính sách Firewall: Cấm Server DMZ chủ động mở kết nối vào mạng nhân viên.`,
      ],
      speakerNotes: `KỊCH BẢN LỜI GIẢNG CHO GIẢNG VIÊN (SLIDE 9 - AN NINH MẠNG):\n- Phân tích lỗ hổng: Bài toán của đề tài yêu cầu đặt Server tại IP ${config.serverLanIp} cùng dải LAN với nhân viên. Ta phải nhấn mạnh cho người học thấy đây là điểm yếu chí mạng về bảo mật.\n- Khuyến nghị cấp cao: Khi chuyển sang môi trường sản xuất (Production), bắt buộc phải chuyển cụm máy chủ này sang một Subnet DMZ riêng biệt được bảo vệ bởi Firewall 2 lớp.`,
    },
    {
      slideNum: 10,
      title: 'KẾT LUẬN & QUY TRÌNH TRIỂN KHAI CHUẨN HÓA',
      type: 'Tổng Kết & Khuyến Nghị',
      content: [
        `• Bước 1: Khai báo toàn diện bản ghi DNS (A, MX, SPF, DMARC) trỏ về ${config.publicIp}.`,
        `• Bước 2: Thiết lập bảng NAT Port Forwarding (80, 443, 25, 587, 993, 21, Passive).`,
        `• Bước 3: Cấu hình Hairpin NAT trên Router để đảm bảo kết nối nội bộ thông suốt.`,
        `• Bước 4: Thiết lập tường lửa UFW và tối ưu bảo mật dịch vụ trên Server.`,
        `• Bước 5: Yêu cầu ISP mở cổng 25 Outbound và cập nhật Reverse DNS (PTR).`,
      ],
      speakerNotes: `KỊCH BẢN LỜI GIẢNG CHO GIẢNG VIÊN (SLIDE 10 - TỔNG KẾT BÀI GIẢNG):\n1. Tóm tắt nội dung: Hôm nay chúng ta đã cùng nhau giải quyết trọn vẹn từ sơ đồ vật lý, bảng ánh xạ cổng, phân giải tên miền đến các giải pháp an ninh mạng cho mô hình Server All-in-One.\n2. Câu hỏi ôn tập cuối giờ: "Hãy giải thích sự khác biệt giữa SNAT và DNAT trong mô hình này, và tại sao FTP lại cần dải cổng Passive?".\n3. Cảm ơn các bạn đã lắng nghe bài giảng!`,
    },
  ];

  const currentSlide = slidesData[currentSlideIndex];

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      await exportNghienCuuPptx(config);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Lỗi xuất PowerPoint:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(currentSlide.speakerNotes);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className={`border rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${modalBg}`}>
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-700/60'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1E3A8A] text-amber-300 rounded-xl border border-blue-400/40 shadow-md">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Xuất File Bài Giảng: <span className="text-[#1E3A8A] font-mono font-extrabold dark:text-blue-400">nghiencuu.pptx</span>
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-500 text-[10px] font-bold">
                  Quy chuẩn Học thuật
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Font Arial • Tiêu đề 30pt Navy #1E3A8A • Nội dung 24pt • Khung khái niệm hình học • Kèm Speaker Notes
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

        {/* Standards Badge Checklist */}
        <div className="bg-blue-600/10 border-b border-blue-500/20 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="text-blue-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Font chữ: Arial
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-blue-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Tiêu đề: 30 pt (#1E3A8A)
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-blue-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Nội dung: 24 pt
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-blue-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Nhúng sẵn Speaker Notes
            </span>
          </div>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#1E3A8A] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Đang tạo PPTX...' : 'Tải xuống tệp nghiencuu.pptx'}</span>
          </button>
        </div>

        {/* Modal Main Content: Slide Navigator & Preview */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Slide Navigation Strip */}
          <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Chọn xem trước slide:</span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#1E3A8A] text-white font-bold font-mono text-xs">
                Slide {currentSlide.slideNum} / {slidesData.length}
              </span>
              <span className="text-slate-400 font-semibold hidden md:inline">
                ({currentSlide.type})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentSlideIndex(i => Math.max(0, i - 1))}
                disabled={currentSlideIndex === 0}
                className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-40 text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentSlideIndex(i => Math.min(slidesData.length - 1, i + 1))}
                disabled={currentSlideIndex === slidesData.length - 1}
                className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-40 text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Slide Thumbnails Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {slidesData.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`px-3 py-1.5 rounded-xl border text-left shrink-0 transition-all ${
                  idx === currentSlideIndex
                    ? 'bg-[#1E3A8A] border-blue-400 text-white shadow-md'
                    : isLight
                    ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="text-[10px] font-mono opacity-80">Slide {s.slideNum}</div>
                <div className="text-xs font-bold truncate max-w-[130px]">{s.type}</div>
              </button>
            ))}
          </div>

          {/* Slide Visual Mockup (Representing 16:9 Widescreen Slide Format) */}
          <div className="border border-slate-700/80 rounded-2xl bg-[#F8FAFC] text-slate-900 p-6 sm:p-8 shadow-inner font-sans space-y-4 relative overflow-hidden">
            {/* Top Navy accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1E3A8A]" />

            {/* Slide Title: Arial, 30pt, Bold, #1E3A8A */}
            <div>
              <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wider mb-1 font-mono">
                SLIDE {currentSlide.slideNum}: {currentSlide.type.toUpperCase()}
              </div>
              <h2 
                style={{ fontFamily: 'Arial, sans-serif', fontSize: '26px', color: '#1E3A8A' }} 
                className="font-bold leading-snug tracking-tight"
              >
                {currentSlide.title}
              </h2>
              <div className="h-0.5 bg-slate-300 w-full mt-2" />
            </div>

            {/* Slide Content Box: Geometric frame with Arial 24pt style */}
            <div className="bg-white rounded-xl border-2 border-slate-300 p-5 shadow-xs space-y-3">
              <div className="space-y-2.5">
                {currentSlide.content.map((point, pIdx) => (
                  <div 
                    key={pIdx}
                    style={{ fontFamily: 'Arial, sans-serif', fontSize: '18px' }}
                    className="text-slate-800 font-medium leading-relaxed"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>

            {/* Slide Footer */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
              <span>Báo Cáo Nghiên Cứu Hệ Thống Server {config.domain}</span>
              <span className="font-mono">IP WAN: {config.publicIp} | IP LAN: {config.serverLanIp}</span>
            </div>
          </div>

          {/* Speaker Notes Box (Detailed Lecture Script for Lecturer) */}
          <div className={`p-4 rounded-xl border space-y-2 ${subBoxBg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1E3A8A] dark:text-sky-400 font-bold text-xs">
                <BookOpen className="w-4 h-4" />
                <span>Kịch Bản Lời Giảng Cho Giảng Viên (Đã nhúng vào Speaker Notes Slide {currentSlide.slideNum})</span>
              </div>
              <button
                onClick={handleCopyNotes}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all"
              >
                {copiedNote ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNote ? 'Đã sao chép!' : 'Sao chép lời giảng'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 text-emerald-300 font-mono text-xs whitespace-pre-wrap leading-relaxed select-text">
              {currentSlide.speakerNotes}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`p-4 sm:p-5 border-t flex flex-wrap items-center justify-between gap-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Tệp PowerPoint được định dạng chuẩn xác để trình chiếu trên màn chiếu giảng đường</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all text-xs font-medium"
            >
              Đóng
            </button>

            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all text-xs active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Đang khởi tạo PowerPoint...' : 'Tải xuống nghiencuu.pptx'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
