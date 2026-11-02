import pptxgenjs from 'pptxgenjs';
import { NetworkConfig } from '../types/network';

export interface PptxExportOptions {
  includeVideo?: boolean;
  videoData?: {
    base64: string;
    extn?: 'mp4' | 'webm';
    coverBase64?: string;
  };
  fileName?: string;
}

/**
 * Xuất file thuyết trình học thuật PowerPoint nghiencuu.pptx
 * Tuân thủ chính xác 100% quy chuẩn:
 * - Font chữ: Arial thống nhất
 * - Cỡ chữ tiêu đề: 30 pt (in đậm, màu Navy học thuật #1E3A8A)
 * - Cỡ chữ nội dung: 24 pt (tương phản cao, sắc nét cho màn hình chiếu)
 * - Sơ đồ & Khung khái niệm: Tích hợp các khung hình học
 * - Ghi chú lời giảng: Nhúng kịch bản giảng dạy chi tiết trong phần Speaker Notes của từng slide
 * - Nhúng Video mô phỏng động chạy trực tiếp trong slide PowerPoint
 */
export async function exportNghienCuuPptx(
  config: NetworkConfig,
  options?: PptxExportOptions
): Promise<void> {
  const pptx = new pptxgenjs();

  // Đặt tỷ lệ màn chiếu chuẩn 16:9 (13.33 x 7.5 inch widescreen)
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Vũ Thị Tho, Trần Lệ Thủy';
  pptx.company = 'BCTECH ACADEMY';
  pptx.title = 'Báo Cáo Nghiên Cứu Kiến Trúc Mạng Máy Chủ Web, Mail, FTP';
  pptx.subject = 'Nghiên cứu triển khai hạ tầng Server mạng LAN public qua IP Public';

  const NAVY = '1E3A8A'; // #1E3A8A chuẩn mực học thuật
  const FONT_FAMILY = 'Arial';
  const SLIDE_BG = 'F8FAFC'; // Nền xám nhạt học thuật

  // Helper hàm tạo Slide cơ sở có tiêu đề chuẩn 30pt Arial Navy và khung chân trang
  const createBaseSlide = (titleText: string) => {
    const slide = pptx.addSlide();
    slide.background = { color: SLIDE_BG };

    // Vạch trang trí trên cùng màu Navy
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.33,
      h: 0.12,
      fill: { color: NAVY },
      line: { color: NAVY },
    });

    // Tiêu đề Slide chuẩn 30 pt, In đậm, Màu Navy #1E3A8A, Font Arial
    slide.addText(titleText, {
      x: 0.8,
      y: 0.35,
      w: 11.73,
      h: 0.75,
      fontFace: FONT_FAMILY,
      fontSize: 30,
      bold: true,
      color: NAVY,
      valign: 'middle',
    });

    // Đường gạch chỉ phân tách tiêu đề
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8,
      y: 1.15,
      w: 11.73,
      h: 0,
      line: { color: 'CBD5E1', width: 1.5 },
    });

    // Chân trang học thuật
    slide.addText(`Báo Cáo Nghiên Cứu: Kiến Trúc Server ${config.domain} | IP LAN: ${config.serverLanIp} | IP WAN: ${config.publicIp}`, {
      x: 0.8,
      y: 7.1,
      w: 11.73,
      h: 0.3,
      fontFace: FONT_FAMILY,
      fontSize: 10,
      color: '64748B',
      align: 'right',
    });

    return slide;
  };

  // =========================================================================
  // SLIDE 1: TRANG TIÊU ĐỀ (TITLE SLIDE)
  // =========================================================================
  {
    const slide1 = pptx.addSlide();
    slide1.background = { color: 'F1F5F9' };

    // Khung hình học nền sang trọng
    slide1.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 0.8,
      w: 11.73,
      h: 5.9,
      fill: { color: 'FFFFFF' },
      line: { color: 'CBD5E1', width: 2 },
    });

    // Dải màu trang trí thương hiệu Navy học thuật
    slide1.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 0.8,
      w: 0.3,
      h: 5.9,
      fill: { color: NAVY },
      line: { color: NAVY },
    });

    // Huy hiệu học thuật
    slide1.addText('BÁO CÁO NGHIÊN CỨU KHOA HỌC & THIẾT KẾ HỆ THỐNG', {
      x: 1.5,
      y: 1.3,
      w: 10.5,
      h: 0.4,
      fontFace: FONT_FAMILY,
      fontSize: 14,
      bold: true,
      color: '0369A1',
    });

    // Tiêu đề chính: Cỡ 30 pt, Arial, In đậm, Màu #1E3A8A
    slide1.addText('NGHIÊN CỨU THIẾT KẾ HỆ THỐNG MÁY CHỦ WEB, MAIL, FTP QUA MẠNG WAN VỚI NAT PORT FORWARDING', {
      x: 1.5,
      y: 1.8,
      w: 10.5,
      h: 1.5,
      fontFace: FONT_FAMILY,
      fontSize: 30,
      bold: true,
      color: NAVY,
      valign: 'middle',
    });

    // Khung khái niệm hình học chứa thông số kỹ thuật cốt lõi
    slide1.addShape(pptx.ShapeType.rect, {
      x: 1.5,
      y: 3.5,
      w: 10.3,
      h: 1.5,
      fill: { color: 'F8FAFC' },
      line: { color: '94A3B8', width: 1.5 },
    });

    // Nội dung tóm tắt thông số cốt lõi: Cỡ 24 pt, Arial
    slide1.addText(
      `• Tên miền triển khai: ${config.domain}\n• Máy chủ dịch vụ LAN: ${config.serverLanIp}\n• Cổng giao tiếp Public WAN: ${config.publicIp}`,
      {
        x: 1.8,
        y: 3.65,
        w: 9.7,
        h: 1.2,
        fontFace: FONT_FAMILY,
        fontSize: 24,
        color: '0F172A',
        lineSpacingMultiple: 1.2,
      }
    );

    slide1.addText('THIẾT BỊ ĐÀO TẠO TỰ LÀM\nTÁC GIẢ : VŨ THỊ THO, TRẦN LỆ THỦY', {
      x: 1.5,
      y: 5.1,
      w: 10.3,
      h: 0.7,
      fontFace: FONT_FAMILY,
      fontSize: 16,
      bold: true,
      color: 'B91C1C', // Đỏ đậm
      lineSpacingMultiple: 1.15,
    });

    slide1.addText('Chuyên đề: Quản trị Hệ thống Mạng & An ninh Thông tin Doanh nghiệp', {
      x: 1.5,
      y: 5.7,
      w: 10.3,
      h: 0.4,
      fontFace: FONT_FAMILY,
      fontSize: 13,
      italic: true,
      color: '475569',
    });

    // Speaker Notes (Lời giảng chi tiết cho Giảng viên)
    slide1.addNotes(
      'KỊCH BẢN LỜI GIẢNG DÀNH CHO GIẢNG VIÊN (SLIDE 1 - MỞ ĐẦU):\n' +
      `1. Lời chào: Xin chào các học viên/sinh viên. Hôm nay chúng ta đi vào đề tài nghiên cứu thực tiễn rất điển hình tại các doanh nghiệp: "Thiết kế và triển khai cụm máy chủ Web, Mail, FTP nội bộ IP ${config.serverLanIp} được Public ra Internet bằng một địa chỉ IP tĩnh duy nhất ${config.publicIp}".\n` +
      '2. Tính cấp thiết: Trong thực tế, địa chỉ IPv4 công cộng ngày càng đắt đỏ và khan hiếm. Đa phần các tổ chức chỉ sở hữu từ 1 đến 2 địa chỉ IP Public. Làm thế nào để vừa tiết kiệm chi phí, vừa vận hành cùng lúc cả ba dịch vụ thiết yếu trên một máy chủ đặt an toàn sau lớp mạng nội bộ? Đề tài này sẽ phân tích từ kiến trúc, cơ chế dịch cổng NAT/PAT đến các bài toán an ninh thực tế.'
    );
  }

  // =========================================================================
  // SLIDE 2: ĐẶT VẤN ĐỀ & MỤC TIÊU NGHIÊN CỨU
  // =========================================================================
  {
    const slide2 = createBaseSlide('ĐẶT VẤN ĐỀ & MỤC TIÊU NGHIÊN CỨU');

    // Khung hình học 1 (Trái): Đặt vấn đề
    slide2.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.5,
      w: 5.6,
      h: 5.2,
      fill: { color: 'FFFFFF' },
      line: { color: 'CBD5E1', width: 2 },
    });

    // Tiêu đề khung 1
    slide2.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.5,
      w: 5.6,
      h: 0.7,
      fill: { color: NAVY },
      line: { color: NAVY },
    });
    slide2.addText('1. Thách Thức Kỹ Thuật', {
      x: 1.0,
      y: 1.55,
      w: 5.2,
      h: 0.6,
      fontFace: FONT_FAMILY,
      fontSize: 20,
      bold: true,
      color: 'FFFFFF',
    });

    // Nội dung 24pt
    slide2.addText(
      `• IP Public duy nhất (${config.publicIp}) cho nhiều dịch vụ.\n\n• Máy chủ đặt tại dải LAN riêng (${config.serverLanIp}).\n\n• Yêu cầu bảo mật cao, không lộ cấu trúc mạng nội bộ.`,
      {
        x: 1.0,
        y: 2.5,
        w: 5.2,
        h: 4.0,
        fontFace: FONT_FAMILY,
        fontSize: 24,
        color: '0F172A',
        lineSpacingMultiple: 1.2,
      }
    );

    // Khung hình học 2 (Phải): Mục tiêu giải pháp
    slide2.addShape(pptx.ShapeType.rect, {
      x: 6.9,
      y: 1.5,
      w: 5.6,
      h: 5.2,
      fill: { color: 'FFFFFF' },
      line: { color: 'CBD5E1', width: 2 },
    });

    // Tiêu đề khung 2
    slide2.addShape(pptx.ShapeType.rect, {
      x: 6.9,
      y: 1.5,
      w: 5.6,
      h: 0.7,
      fill: { color: '059669' },
      line: { color: '059669' },
    });
    slide2.addText('2. Mục Tiêu Triển Khai', {
      x: 7.1,
      y: 1.55,
      w: 5.2,
      h: 0.6,
      fontFace: FONT_FAMILY,
      fontSize: 20,
      bold: true,
      color: 'FFFFFF',
    });

    // Nội dung 24pt
    slide2.addText(
      `• Thiết lập bảng Port Forwarding (DNAT) chuẩn mực.\n\n• Cấu hình DNS Authoritative cho domain ${config.domain}.\n\n• Xử lý triệt để bẫy Passive FTP & hiện tượng Hairpin NAT.`,
      {
        x: 7.1,
        y: 2.5,
        w: 5.2,
        h: 4.0,
        fontFace: FONT_FAMILY,
        fontSize: 24,
        color: '0F172A',
        lineSpacingMultiple: 1.2,
      }
    );

    // Speaker Notes
    slide2.addNotes(
      'KỊCH BẢN LỜI GIẢNG CHO GIẢNG VIÊN (SLIDE 2):\n' +
      '- Nhấn mạnh mục 1: Hãy chỉ ra cho người học thấy rằng nếu không có cơ chế Port Forwarding (DNAT), một máy tính bên ngoài không có cách nào tiếp cận được địa chỉ Private IP theo chuẩn RFC 1918 (192.168.1.200).\n' +
      '- Nhấn mạnh mục 2: Mục tiêu cốt lõi không chỉ là cho thông mạng (ping thấy), mà phải đảm bảo 3 dịch vụ Web, Mail, FTP hoạt động ổn định với đầy đủ chứng chỉ mã hóa TLS và các bản ghi chống spam thư rác.'
    );
  }

  // =========================================================================
  // SLIDE 3: SƠ ĐỒ KIẾN TRÚC MẠNG TỔNG THỂ
  // =========================================================================
  {
    const slide3 = createBaseSlide('SƠ ĐỒ KIẾN TRÚC HỆ THỐNG MẠNG TỔNG THỂ');

    // Khung 1: Internet (Trái)
    slide3.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.6,
      w: 3.4,
      h: 4.9,
      fill: { color: 'EFF6FF' },
      line: { color: '3B82F6', width: 2 },
    });
    slide3.addText('VÙNG INTERNET (WAN)', {
      x: 0.9,
      y: 1.8,
      w: 3.2,
      h: 0.5,
      fontFace: FONT_FAMILY,
      fontSize: 18,
      bold: true,
      color: '1E40AF',
      align: 'center',
    });
    slide3.addText(
      `• Trình duyệt Web\n• Máy chủ Mail đối tác\n• FileZilla FTP Client\n• DNS Quốc tế (8.8.8.8)`,
      {
        x: 1.0,
        y: 2.6,
        w: 3.0,
        h: 3.5,
        fontFace: FONT_FAMILY,
        fontSize: 20,
        color: '1E293B',
        lineSpacingMultiple: 1.3,
      }
    );

    // Mũi tên kết nối 1
    slide3.addShape(pptx.ShapeType.rightArrow, {
      x: 4.3,
      y: 3.7,
      w: 0.6,
      h: 0.5,
      fill: { color: '3B82F6' },
      line: { color: '2563EB' },
    });

    // Khung 2: Router / Firewall Gateway (Giữa)
    slide3.addShape(pptx.ShapeType.rect, {
      x: 5.0,
      y: 1.6,
      w: 3.4,
      h: 4.9,
      fill: { color: 'F1F5F9' },
      line: { color: NAVY, width: 2.5 },
    });
    slide3.addText('ROUTER BIÊN & FIREWALL', {
      x: 5.1,
      y: 1.8,
      w: 3.2,
      h: 0.5,
      fontFace: FONT_FAMILY,
      fontSize: 18,
      bold: true,
      color: NAVY,
      align: 'center',
    });
    slide3.addText(
      `• WAN: ${config.publicIp}\n• LAN: ${config.lanGateway}\n• NAT/PAT Engine\n• Bảng Port Forwarding\n• Stateful Inspection`,
      {
        x: 5.2,
        y: 2.6,
        w: 3.0,
        h: 3.5,
        fontFace: FONT_FAMILY,
        fontSize: 20,
        color: '0F172A',
        lineSpacingMultiple: 1.3,
      }
    );

    // Mũi tên kết nối 2
    slide3.addShape(pptx.ShapeType.rightArrow, {
      x: 8.5,
      y: 3.7,
      w: 0.6,
      h: 0.5,
      fill: { color: '10B981' },
      line: { color: '059669' },
    });

    // Khung 3: All-in-One Server (Phải)
    slide3.addShape(pptx.ShapeType.rect, {
      x: 9.2,
      y: 1.6,
      w: 3.4,
      h: 4.9,
      fill: { color: 'ECFDF5' },
      line: { color: '10B981', width: 2.5 },
    });
    slide3.addText(`MÁY CHỦ ${config.serverLanIp}`, {
      x: 9.3,
      y: 1.8,
      w: 3.2,
      h: 0.5,
      fontFace: FONT_FAMILY,
      fontSize: 18,
      bold: true,
      color: '065F46',
      align: 'center',
    });
    slide3.addText(
      `• Web Server: 80, 443\n• Mail Server: 25, 587\n• IMAP Server: 993\n• FTP Server: 21\n• Passive: ${config.ftpPassiveRange}`,
      {
        x: 9.4,
        y: 2.6,
        w: 3.0,
        h: 3.5,
        fontFace: FONT_FAMILY,
        fontSize: 20,
        color: '064E3B',
        lineSpacingMultiple: 1.3,
      }
    );

    // Speaker Notes
    slide3.addNotes(
      'KỊCH BẢN LỜI GIẢNG CHO GIẢNG VIÊN (SLIDE 3 - SƠ ĐỒ MẠNG TỔNG THỂ):\n' +
      '1. Giải thích 3 phân vùng: Trái là Internet công cộng, giữa là thiết bị biên (Router/Firewall), phải là mạng nội bộ doanh nghiệp.\n' +
      `2. Điểm chốt kỹ thuật: Router đóng vai trò "người bảo vệ cửa ngõ". Toàn bộ thế giới bên ngoài chỉ biết tới duy nhất IP Public ${config.publicIp}. Họ hoàn toàn không nhìn thấy địa chỉ LAN ${config.serverLanIp}.\n` +
      '3. Câu hỏi thảo luận: Nếu có nhiều gói tin cùng ùa tới cổng 443 và cổng 25 của Router, Router dựa vào bảng ánh xạ nào để chuyển tiếp đúng dịch vụ? (Dẫn dắt sang Slide 4: Port Forwarding Matrix).'
    );
  }

  // =========================================================================
  // SLIDE: MÔ PHỎNG ĐỘNG LUỒNG GÓI TIN NAT & DỊCH VỤ SERVER (VIDEO CHẠY TRỰC TIẾP)
  // =========================================================================
  if (options?.videoData && options.videoData.base64) {
    const slideVideo = createBaseSlide('MÔ PHỎNG ĐỘNG LUỒNG GÓI TIN (VIDEO CHẠY TRỰC TIẾP)');

    // Khung viền video hình học chuyên nghiệp
    slideVideo.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.4,
      w: 8.0,
      h: 5.5,
      fill: { color: '000000' },
      line: { color: NAVY, width: 2.5 },
    });

    // Nhúng Video chạy trực tiếp trong slide PowerPoint
    slideVideo.addMedia({
      type: 'video',
      data: options.videoData.base64,
      extn: options.videoData.extn || 'mp4',
      cover: options.videoData.coverBase64,
      x: 0.82,
      y: 1.42,
      w: 7.96,
      h: 5.46,
    });

    // Khung khái niệm & Hướng dẫn bên phải (Hình học chuẩn)
    slideVideo.addShape(pptx.ShapeType.rect, {
      x: 9.05,
      y: 1.4,
      w: 3.48,
      h: 5.5,
      fill: { color: 'FFFFFF' },
      line: { color: NAVY, width: 2 },
    });

    // Dải tiêu đề hộp khái niệm
    slideVideo.addShape(pptx.ShapeType.rect, {
      x: 9.05,
      y: 1.4,
      w: 3.48,
      h: 0.65,
      fill: { color: NAVY },
      line: { color: NAVY },
    });

    slideVideo.addText('HƯỚNG DẪN TRÌNH CHIẾU', {
      x: 9.15,
      y: 1.45,
      w: 3.28,
      h: 0.55,
      fontFace: FONT_FAMILY,
      fontSize: 16,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
    });

    slideVideo.addText(
      '▶ Nhấn Play trên video để phát mô phỏng chuyển động trực tiếp trong PowerPoint.\n\n' +
      '• Luồng Web HTTP/HTTPS:\n  Port 80/443 -> Server 192.168.1.200\n\n' +
      '• Luồng Email Doanh Nghiệp:\n  SMTP 25/587 & IMAPS 993\n\n' +
      '• Luồng Truyền Tệp FTP:\n  Port 21 CMD & Dải Passive\n\n' +
      '• Hairpin NAT Nội Bộ:\n  Vòng lặp Loopback từ máy trạm LAN',
      {
        x: 9.2,
        y: 2.2,
        w: 3.2,
        h: 4.5,
        fontFace: FONT_FAMILY,
        fontSize: 14,
        color: '0F172A',
        lineSpacingMultiple: 1.15,
      }
    );

    // Speaker Notes cho Slide Video
    slideVideo.addNotes(
      'KỊCH BẢN LỜI GIẢNG CHO GIẢNG VIÊN (SLIDE VIDEO MÔ PHỎNG ĐỘNG HỆ THỐNG):\n' +
      '1. Khởi động video: "Thưa quý thầy cô và các bạn, đây là video mô phỏng động trực tiếp trên màn chiếu PowerPoint thể hiện trọn vẹn đường đi của từng gói tin trong hệ thống server đa dịch vụ bctech.asia".\n' +
      '2. Thuyết minh khi video chạy:\n' +
      `   - Hãy trỏ vào gói tin Web màu xanh lá: Gói tin từ Client bên ngoài vượt qua Internet, tới WAN Router ${config.publicIp}, được Router DNAT đổi đích sang ${config.serverLanIp}:443.\n` +
      '   - Trỏ vào gói tin Mail màu hổ phách: Gói tin SMTP Inbound đi vào cổng 25, Postfix nhận thư và Dovecot xử lý truy xuất hòm thư IMAPS 993.\n' +
      '   - Trỏ vào gói tin FTP màu lục lam: Sau khi bắt tay ở cổng 21, kênh truyền dữ liệu nhảy sang dải Passive 50000-50100 mà không bị Firewall chặn.\n' +
      '   - Trỏ vào Hairpin NAT: Máy trạm nội bộ truy cập tên miền công khai vẫn kết nối trơn tru nhờ cơ chế Hairpinning của Router.\n' +
      '3. Chuyển tiếp: Bây giờ chúng ta sẽ phân tích chi tiết bảng ma trận ánh xạ cổng và luật NAT ở slide tiếp theo.'
    );
  }

  // =========================================================================
  // SLIDE 4: BẢNG MA TRẬN ÁNH XẠ CỔNG (PORT FORWARDING MATRIX)
  // =========================================================================
  {
    const slide4 = createBaseSlide('MA TRẬN ÁNH XẠ CỔNG PORT FORWARDING (DNAT)');

    // Khung bảng ma trận dịch cổng
    slide4.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.5,
      w: 11.73,
      h: 5.2,
      fill: { color: 'FFFFFF' },
      line: { color: 'CBD5E1', width: 2 },
    });

    // Nội dung danh sách 24pt Arial
    slide4.addText(
      `• Web HTTP / HTTPS: Cổng ngoài 80 & 443 ➔ Chuyển tiếp tới ${config.serverLanIp}:80, 443\n\n` +
      `• Mail Inbound (MTA to MTA): Cổng ngoài 25 ➔ Chuyển tiếp tới ${config.serverLanIp}:25\n\n` +
      `• Mail Client Submission: Cổng ngoài 587 & 465 ➔ Chuyển tiếp tới ${config.serverLanIp}:587, 465\n\n` +
      `• Mail Retrieval (IMAPS): Cổng ngoài 993 ➔ Chuyển tiếp tới ${config.serverLanIp}:993\n\n` +
      `• FTP Control & Passive: Cổng ngoài 21 & ${config.ftpPassiveRange} ➔ Chuyển tiếp tới ${config.serverLanIp}`,
      {
        x: 1.2,
        y: 1.8,
        w: 11.0,
        h: 4.6,
        fontFace: FONT_FAMILY,
        fontSize: 24,
        color: '0F172A',
        lineSpacingMultiple: 1.15,
      }
    );

    // Speaker Notes
    slide4.addNotes(
      'KỊCH BẢN LỜI GIẢNG CHO GIẢNG VIÊN (SLIDE 4):\n' +
      '- Phân tích nguyên tắc 1-1 Port Forwarding: Một cổng ngoài (External Port) trên Router được cố định chuyển vào một cổng trong (Internal Port) của máy chủ 192.168.1.200.\n' +
      '- Lưu ý đặc biệt: Cổng 25 chỉ dùng để nhận thư từ các Mail Server khác (như Gmail chuyển thư về). Không mở cổng 25 cho người dùng gửi thư để tránh bị lợi dụng làm trạm phát thư rác (Open Relay).\n' +
      '- Người dùng gửi thư (Outlook, Thunderbird) bắt buộc kết nối qua cổng Submission 587 có xác thực mật khẩu.'
    );
  }

  // =========================================================================
  // SLIDE 5: THIẾT KẾ & CẤU HÌNH DỊCH VỤ WEB SERVER
  // =========================================================================
  {
    const slide5 = createBaseSlide('THIẾT KẾ DỊCH VỤ WEB BẢO MẬT (BCTECH.ASIA)');

    // Khung khái niệm 1: Cấu trúc Web Nginx
    slide5.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.5,
      w: 11.73,
      h: 2.4,
      fill: { color: 'F0FDF4' },
      line: { color: '059669', width: 2 },
    });
    slide5.addText('1. Cấu Trúc Virtual Host & Chứng Chỉ SSL/TLS', {
      x: 1.1,
      y: 1.65,
      w: 11.0,
      h: 0.45,
      fontFace: FONT_FAMILY,
      fontSize: 22,
      bold: true,
      color: '065F46',
    });
    slide5.addText(
      `• Cổng 80: Nhận thử thách Let's Encrypt ACME & chuyển hướng 301 sang HTTPS.\n• Cổng 443: Kích hoạt HTTP/2, mã hóa TLS 1.3 với chứng chỉ SSL hợp chuẩn.`,
      {
        x: 1.1,
        y: 2.2,
        w: 11.0,
        h: 1.5,
        fontFace: FONT_FAMILY,
        fontSize: 24,
        color: '0F172A',
        lineSpacingMultiple: 1.2,
      }
    );

    // Khung khái niệm 2: Bản ghi DNS Web
    slide5.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 4.2,
      w: 11.73,
      h: 2.5,
      fill: { color: 'FFFFFF' },
      line: { color: NAVY, width: 2 },
    });
    slide5.addText('2. Thiết Lập Bản Ghi DNS Cho Dịch Vụ Web', {
      x: 1.1,
      y: 4.35,
      w: 11.0,
      h: 0.45,
      fontFace: FONT_FAMILY,
      fontSize: 22,
      bold: true,
      color: NAVY,
    });
    slide5.addText(
      `• Bản ghi A (@): ${config.domain} trỏ về IP Public ${config.publicIp}\n• Bản ghi A (www): www.${config.domain} trỏ về IP Public ${config.publicIp}`,
      {
        x: 1.1,
        y: 4.9,
        w: 11.0,
        h: 1.6,
        fontFace: FONT_FAMILY,
        fontSize: 24,
        color: '0F172A',
        lineSpacingMultiple: 1.2,
      }
    );

    // Speaker Notes
    slide5.addNotes(
      'KỊCH BẢN LỜI GIẢNG CHO GIẢNG VIÊN (SLIDE 5):\n' +
      '- Giảng giải sinh viên: Vì sao đã dùng HTTPS rồi mà vẫn phải mở cổng 80? Vì chương trình gia hạn chứng chỉ tự động (Certbot) cần truy cập qua cổng 80 để xác thực quyền sở hữu tên miền (.well-known/acme-challenge).\n' +
      '- Đồng thời cổng 80 sẽ tự động trả về mã phản hồi HTTP 301 Moved Permanently để nâng cấp người dùng lên kết nối an toàn cổng 443.'
    );
  }

  // =========================================================================
  // SLIDE 6: THIẾT KẾ MÁY CHỦ THƯ ĐIỆN TỬ (MAIL SERVER)
  // =========================================================================
  {
    const slide6 = createBaseSlide('THIẾT KẾ MÁY CHỦ THƯ ĐIỆN TỬ & CHỐNG THƯ RÁC');

    // Khung hình học: 3 trụ cột xác thực Mail
    slide6.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.5,
      w: 11.73,
      h: 5.2,
      fill: { color: 'FFFFFF' },
      line: { color: 'CBD5E1', width: 2 },
    });

    slide6.addText(
      `• Bản ghi MX: @ ➔ mail.${config.domain} (Độ ưu tiên: Priority 10).\n\n` +
      `• Bản ghi SPF (TXT): v=spf1 mx ip4:${config.publicIp} ~all (Chỉ định IP được gửi mail).\n\n` +
      `• Bản ghi DKIM: Chữ ký số mã hóa RSA xác thực tính toàn vẹn nội dung email.\n\n` +
      `• Bản ghi DMARC: Chính sách xử lý thư giả mạo và báo cáo về ban quản trị.\n\n` +
      `• Bản ghi rDNS (PTR): Yêu cầu nhà mạng ISP khai báo IP ${config.publicIp} trỏ về mail.${config.domain}.`,
      {
        x: 1.2,
        y: 1.8,
        w: 11.0,
        h: 4.6,
        fontFace: FONT_FAMILY,
        fontSize: 24,
        color: '0F172A',
        lineSpacingMultiple: 1.15,
      }
    );

    // Speaker Notes
    slide6.addNotes(
      'KỊCH BẢN LỜI GIẢNG CHO GIẢNG VIÊN (SLIDE 6):\n' +
      '- Lưu ý trọng tâm: Năm 2024, Google và Yahoo áp dụng tiêu chuẩn chống thư rác cực kỳ khắt khe. Nếu hệ thống mail công ty tự dựng thiếu 1 trong 3 bản ghi (SPF, DKIM, DMARC), hoặc thiếu rDNS từ ISP, 100% email gửi sang đối tác sẽ bị đưa vào hộp thư rác (Spam) hoặc bị máy chủ đích từ chối tiếp nhận.\n' +
      '- Nhắc nhở: Các nhà mạng gia đình thường chặn cổng 25 Outbound. Doanh nghiệp cần ký hợp đồng cáp quang IP tĩnh dành cho doanh nghiệp để được mở cổng 25 hai chiều.'
    );
  }

  // =========================================================================
  // SLIDE 7: BẪY KỸ THUẬT FTP PASSIVE MODE QUA ROUTER NAT
  // =========================================================================
  {
    const slide7 = createBaseSlide('GIẢI PHÁP FTP PASSIVE MODE QUA ROUTER NAT');

    // Khung so sánh: Vấn đề & Giải pháp
    slide7.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.5,
      w: 11.73,
      h: 5.2,
      fill: { color: 'FFFFFF' },
      line: { color: '0284C7', width: 2 },
    });

    slide7.addText(
      `• Bản chất FTP: Sử dụng 2 kết nối độc lập (Port 21 lệnh & Port truyền dữ liệu).\n\n` +
      `• Bẫy kỹ thuật: Nếu chỉ mở Port 21, lệnh đăng nhập thành công nhưng lệnh liệt kê danh sách file (LIST/MLSD) sẽ bị treo (Timeout) vĩnh viễn!\n\n` +
      `• Cơ chế Passive FTP: Server mở một cổng ngẫu nhiên trong dải ${config.ftpPassiveRange} để Client chủ động kết nối vào lấy dữ liệu.\n\n` +
      `• Cấu hình then chốt trong vsftpd: Khai báo pasv_address=${config.publicIp} để báo cho Client ngoài Internet biết địa chỉ IP Public của Router.`,
      {
        x: 1.2,
        y: 1.8,
        w: 11.0,
        h: 4.6,
        fontFace: FONT_FAMILY,
        fontSize: 24,
        color: '0F172A',
        lineSpacingMultiple: 1.15,
      }
    );

    // Speaker Notes
    slide7.addNotes(
      'KỊCH BẢN LỜI GIẢNG CHO GIẢNG VIÊN (SLIDE 7):\n' +
      '- Đặt câu hỏi kích thích tư duy: "Bao nhiêu bạn ở đây từng cài FTP Server, đăng nhập USER/PASS được nhưng khi mở thư mục bằng FileZilla thì bị xoay tròn và báo lỗi Timeout?".\n' +
      '- Phân tích bản chất: Khi Client gửi lệnh PASV, nếu Server nằm sau NAT mà không được cấu hình `pasv_address`, nó sẽ ngây thơ gửi về IP nội bộ của nó là 192.168.1.200. Máy khách ngoài Internet dĩ nhiên không thể kết nối tới IP Private đó và dẫn tới treo kết nối!'
    );
  }

  // =========================================================================
  // SLIDE 8: HIỆN TƯỢNG HAIRPIN NAT (NAT LOOPBACK)
  // =========================================================================
  {
    const slide8 = createBaseSlide('HIỆN TƯỢNG HAIRPIN NAT TRONG MẠNG NỘI BỘ');

    // Khung phân tích nguyên lý
    slide8.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.5,
      w: 11.73,
      h: 5.2,
      fill: { color: 'FFFFFF' },
      line: { color: 'E11D48', width: 2 },
    });

    slide8.addText(
      `• Vấn đề: Nhân viên ngồi trong phòng làm việc (192.168.1.50) gõ https://${config.domain} trên trình duyệt nhưng không truy cập được.\n\n` +
      `• Nguyên nhân: Máy nội bộ hỏi DNS nhận về IP Public ${config.publicIp}. Gói tin gửi ra Router rồi cố gắng quay ngược lại chính mạng LAN, gây ra hiện tượng định tuyến bất đối xứng (Asymmetric Routing Loop).\n\n` +
      `• Giải pháp 1: Bật tính năng Hairpin NAT (NAT Loopback) trên Router để thực hiện đổi cả địa chỉ nguồn (SNAT) và địa chỉ đích (DNAT).\n\n` +
      `• Giải pháp 2: Triển khai Split-Brain DNS (DNS nội bộ phân giải thẳng ${config.domain} về IP ${config.serverLanIp}).`,
      {
        x: 1.2,
        y: 1.8,
        w: 11.0,
        h: 4.6,
        fontFace: FONT_FAMILY,
        fontSize: 24,
        color: '0F172A',
        lineSpacingMultiple: 1.15,
      }
    );

    // Speaker Notes
    slide8.addNotes(
      'KỊCH BẢN LỜI GIẢNG CHO GIẢNG VIÊN (SLIDE 8):\n' +
      '- Tình huống thực tế: Khách hàng ở ngoài thì khen website công ty tải nhanh, nhưng Giám đốc ngồi tại văn phòng bấm vào tên miền công ty thì báo "Không thể truy cập trang web". Đây chính là lỗi thiếu Hairpin NAT.\n' +
      '- Giảng viên vẽ sơ đồ luồng gói tin lên bảng: Client (192.168.1.50) gửi đến IP Public. Router nhận gói và gửi cho Server (192.168.1.200). Server thấy IP nguồn là 192.168.1.50 (cùng mạng LAN) nên gửi trả gói tin trực tiếp không qua Router! Client nhận được gói tin từ 192.168.1.200 trong khi nó đang chờ từ IP Public -> Client tự DROP gói tin!'
    );
  }

  // =========================================================================
  // SLIDE 9: PHÂN TÍCH RỦI RO BẢO MẬT & ĐỀ XUẤT MÔ HÌNH DMZ
  // =========================================================================
  {
    const slide9 = createBaseSlide('PHÂN TÍCH BẢO MẬT & ĐỀ XUẤT MÔ HÌNH DMZ');

    // Khung Trái: Rủi ro hiện tại
    slide9.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.5,
      w: 5.6,
      h: 5.2,
      fill: { color: 'FFF1F2' },
      line: { color: 'E11D48', width: 2 },
    });
    slide9.addText('Rủi Ro Khi Đặt Chung Mạng LAN', {
      x: 1.0,
      y: 1.7,
      w: 5.2,
      h: 0.5,
      fontFace: FONT_FAMILY,
      fontSize: 22,
      bold: true,
      color: 'BE123C',
    });
    slide9.addText(
      `• Nguy cơ leo thang ngang (Lateral Movement).\n\n• Nếu Web hoặc FTP bị tấn công, hacker có thể quét mã độc sang toàn bộ máy tính văn phòng.\n\n• Thiếu ranh giới kiểm soát lưu lượng nội bộ.`,
      {
        x: 1.0,
        y: 2.4,
        w: 5.2,
        h: 4.0,
        fontFace: FONT_FAMILY,
        fontSize: 24,
        color: '881337',
        lineSpacingMultiple: 1.2,
      }
    );

    // Khung Phải: Khuyến nghị DMZ
    slide9.addShape(pptx.ShapeType.rect, {
      x: 6.9,
      y: 1.5,
      w: 5.6,
      h: 5.2,
      fill: { color: 'F0FDF4' },
      line: { color: '059669', width: 2 },
    });
    slide9.addText('Khuyến Nghị Vùng DMZ Cách Ly', {
      x: 7.1,
      y: 1.7,
      w: 5.2,
      h: 0.5,
      fontFace: FONT_FAMILY,
      fontSize: 22,
      bold: true,
      color: '047857',
    });
    slide9.addText(
      `• Tách Server sang VLAN DMZ riêng (ví dụ: 192.168.200.0/24).\n\n• Cấm hoàn toàn máy chủ DMZ chủ động kết nối vào mạng nhân viên.\n\n• Triển khai Fail2Ban chặn IP dò quét mật khẩu tự động.`,
      {
        x: 7.1,
        y: 2.4,
        w: 5.2,
        h: 4.0,
        fontFace: FONT_FAMILY,
        fontSize: 24,
        color: '064E3B',
        lineSpacingMultiple: 1.2,
      }
    );

    // Speaker Notes
    slide9.addNotes(
      'KỊCH BẢN LỜI GIẢNG CHO GIẢNG VIÊN (SLIDE 9 - AN NINH MẠNG):\n' +
      '- Phân tích lỗ hổng: Bài toán của đề tài yêu cầu đặt Server tại IP 192.168.1.200 cùng dải LAN với nhân viên. Ta phải nhấn mạnh cho người học thấy đây là điểm yếu chí mạng về bảo mật.\n' +
      '- Khuyến nghị cấp cao: Khi chuyển sang môi trường sản xuất (Production), bắt buộc phải chuyển cụm máy chủ này sang một Subnet DMZ riêng biệt được bảo vệ bởi Firewall 2 lớp.'
    );
  }

  // =========================================================================
  // SLIDE 10: TỔNG KẾT & QUY TRÌNH TRIỂN KHAI CHUẨN HÓA
  // =========================================================================
  {
    const slide10 = createBaseSlide('KẾT LUẬN & QUY TRÌNH TRIỂN KHAI CHUẨN HÓA');

    // Khung các bước triển khai
    slide10.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.5,
      w: 11.73,
      h: 5.2,
      fill: { color: 'FFFFFF' },
      line: { color: NAVY, width: 2 },
    });

    slide10.addText(
      `• Bước 1: Khai báo toàn diện các bản ghi DNS (A, MX, SPF, DMARC) trỏ về IP Public ${config.publicIp}.\n\n` +
      `• Bước 2: Thiết lập bảng NAT Port Forwarding (80, 443, 25, 587, 993, 21, ${config.ftpPassiveRange}) về ${config.serverLanIp}.\n\n` +
      `• Bước 3: Cấu hình Hairpin NAT trên Router để đảm bảo kết nối nội bộ thông suốt.\n\n` +
      `• Bước 4: Thiết lập tường lửa UFW và tối ưu bảo mật dịch vụ trên máy chủ Linux.\n\n` +
      `• Bước 5: Yêu cầu nhà mạng (ISP) mở cổng 25 Outbound và cập nhật Reverse DNS (PTR).`,
      {
        x: 1.2,
        y: 1.8,
        w: 11.0,
        h: 4.6,
        fontFace: FONT_FAMILY,
        fontSize: 24,
        color: '0F172A',
        lineSpacingMultiple: 1.15,
      }
    );

    // Speaker Notes
    slide10.addNotes(
      'KỊCH BẢN LỜI GIẢNG CHO GIẢNG VIÊN (SLIDE 10 - TỔNG KẾT BÀI GIẢNG):\n' +
      '1. Tóm tắt nội dung: Hôm nay chúng ta đã cùng nhau giải quyết trọn vẹn từ sơ đồ vật lý, bảng ánh xạ cổng, phân giải tên miền đến các giải pháp an ninh mạng cho mô hình Server All-in-One.\n' +
      '2. Câu hỏi ôn tập cuối giờ: "Hãy giải thích sự khác biệt giữa SNAT và DNAT trong mô hình này, và tại sao FTP lại cần dải cổng Passive?".\n' +
      '3. Cảm ơn các bạn đã lắng nghe bài giảng!'
    );
  }

  // Xuất file PowerPoint với tên đúng nghiencuu.pptx
  const outName = options?.fileName || 'nghiencuu.pptx';
  await pptx.writeFile({ fileName: outName });
}
