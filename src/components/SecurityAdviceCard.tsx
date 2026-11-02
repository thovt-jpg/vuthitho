import React from 'react';
import { NetworkConfig, GrayTone } from '../types/network';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  HelpCircle, 
  ArrowRight,
  Server,
  Lock,
  Zap,
  HardDrive
} from 'lucide-react';

interface SecurityAdviceCardProps {
  config: NetworkConfig;
  grayTheme?: GrayTone;
}

export const SecurityAdviceCard: React.FC<SecurityAdviceCardProps> = ({ config, grayTheme = 'slate-gray' }) => {
  const isLight = grayTheme === 'light-gray';
  const isCool = grayTheme === 'cool-gray';

  const containerBg = isLight 
    ? 'bg-white border-slate-300 text-slate-900 shadow-md' 
    : isCool 
    ? 'bg-[#333a48] border-[#434d5e] text-slate-100 shadow-xl' 
    : 'bg-[#282e3b] border-[#363f50] text-slate-100 shadow-xl';

  const subCardBg = isLight 
    ? 'bg-[#f8fafc] border-slate-200' 
    : isCool 
    ? 'bg-[#252b36] border-[#3a4454]' 
    : 'bg-[#1f242e] border-[#2e3746]';

  return (
    <div className={`border rounded-2xl p-6 space-y-6 transition-colors ${containerBg}`}>
      {/* Header */}
      <div className={`border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-700/60'}`}>
        <h3 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          Phân Tích Kiến Trúc & Khuyến Nghị Bảo Mật Nâng Cao
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Các vấn đề kỹ thuật thực tế quan trọng nhất khi vận hành Server trong mạng LAN và public ra ngoài qua IP Public
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* TOPIC 1: DMZ vs LAN */}
        <div className={`p-5 rounded-xl border space-y-3 ${subCardBg}`}>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>1. Rủi ro khi đặt Server chung dải LAN 192.168.1.0/24</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Trong mô hình người dùng yêu cầu, máy chủ <code className="text-emerald-300 font-mono">{config.serverLanIp}</code> đang nằm chung subnet với máy tính làm việc của nhân viên trong công ty.
          </p>
          <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-lg text-xs text-rose-200 space-y-1">
            <b className="text-rose-300">Nguy cơ tấn công leo thang (Lateral Movement):</b>
            <p>
              Nếu hacker khai thác được lỗ hổng trên Website hoặc tài khoản FTP, họ có thể từ máy chủ này quét và tấn công lây nhiễm mã độc ransomware sang toàn bộ máy tính cá nhân của nhân viên văn phòng.
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-xs text-emerald-200 space-y-1">
            <b className="text-emerald-300">Giải pháp chuẩn doanh nghiệp (Khuyến nghị):</b>
            <p>
              Nên cấu hình 1 cổng riêng trên Router làm <b>Vùng DMZ (Demilitarized Zone)</b> với dải IP riêng (ví dụ: <code className="font-mono text-emerald-100">192.168.200.0/24</code>) và thiết lập luật firewall: Server DMZ KHÔNG ĐƯỢC PHÉP chủ động kết nối vào mạng LAN nội bộ.
            </p>
          </div>
        </div>

        {/* TOPIC 2: HAIRPIN NAT */}
        <div className={`p-5 rounded-xl border space-y-3 ${subCardBg}`}>
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <Zap className="w-5 h-5 shrink-0" />
            <span>2. Vấn đề Hairpin NAT (NAT Loopback) trong nội bộ</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Hiện tượng xảy ra khi nhân viên ngồi trong văn phòng mở trình duyệt và gõ <code className="text-sky-300 font-mono">https://{config.domain}</code>:
          </p>
          <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4">
            <li>
              Máy tính hỏi DNS và nhận về địa chỉ IP Public <code className="text-sky-200 font-mono">{config.publicIp}</code>.
            </li>
            <li>
              Gói tin từ mạng LAN đi tới Router yêu cầu kết nối lại vào chính IP Public của Router.
            </li>
            <li>
              Nếu Router KHÔNG hỗ trợ hoặc chưa cấu hình <b>NAT Loopback (Hairpin NAT)</b>, gói tin sẽ bị DROP và nhân viên sẽ báo lỗi không vào được web của chính công ty mình!
            </li>
          </ul>
          <div className="p-3 bg-sky-500/10 border border-sky-500/25 rounded-lg text-xs text-sky-200">
            <b>Cách xử lý:</b> Bật Hairpin NAT trên Router (như script MikroTik/pfSense đã cung cấp) HOẶC thiết lập <b>Split-Brain DNS</b> (DNS nội bộ phân giải bctech.asia thẳng về 192.168.1.200 cho máy trong văn phòng).
          </div>
        </div>

        {/* TOPIC 3: PASSIVE FTP CAVEAT */}
        <div className={`p-5 rounded-xl border space-y-3 ${subCardBg}`}>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Layers className="w-5 h-5 shrink-0" />
            <span>3. Bẫy kỹ thuật kinh điển của giao thức FTP sau NAT</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            FTP là giao thức cổ điển sử dụng <b>hai kết nối riêng biệt</b>: Kênh lệnh (Port 21) và Kênh dữ liệu (Data Port).
          </p>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">X</span>
              <span>
                Nếu chỉ mở Port 21: Client đăng nhập thành công nhưng khi tải danh sách file (lệnh LIST) sẽ bị treo vĩnh viễn và báo lỗi Timeout.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>
                Phải cấu hình FTP ở chế độ <b>Passive Mode</b>, mở dải cổng <code className="font-mono text-cyan-200">{config.ftpPassiveRange}</code> trên Router và báo cho FTP Server biết IP Public qua tham số <code className="font-mono text-cyan-200">pasv_address={config.publicIp}</code>.
              </span>
            </div>
          </div>
        </div>

        {/* TOPIC 4: ISP PORT 25 BLOCK */}
        <div className={`p-5 rounded-xl border space-y-3 ${subCardBg}`}>
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Lock className="w-5 h-5 shrink-0" />
            <span>4. Cảnh báo nhà mạng (ISP) chặn Cổng 25 (Mail SMTP)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Hầu hết các nhà mạng tại Việt Nam (Viettel, VNPT, FPT) mặc định <b>chặn chiều gửi đi (Outbound Port 25)</b> trên các gói cước Internet thông thường để ngăn chặn mã độc gửi thư rác (SPAM).
          </p>
          <div className="p-3 bg-purple-500/10 border border-purple-500/25 rounded-lg text-xs text-purple-200 space-y-1">
            <b>Hành động bắt buộc:</b>
            <p>
              1. Liên hệ tổng đài ISP ký hợp đồng gói IP tĩnh doanh nghiệp và yêu cầu mở Port 25 hai chiều.
              <br />
              2. Đề nghị kỹ thuật viên ISP tạo bản ghi <b>Reverse DNS (rDNS / PTR)</b> trỏ IP Public về <code className="font-mono text-purple-100">mail.{config.domain}</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Security Hardening Checklist */}
      <div className={`p-4 rounded-xl border space-y-3 ${subCardBg}`}>
        <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Checklist bảo vệ máy chủ toàn diện trước khi đưa vào sản xuất (Production)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-700/60'}`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200 block">Cài đặt Fail2Ban</span>
              <span className="text-[11px] text-slate-400">Tự động chặn IP dò quét mật khẩu SSH, FTP, Mail</span>
            </div>
          </div>
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200 block">Đổi cổng SSH quản trị</span>
              <span className="text-[11px] text-slate-400">Đổi từ port 22 sang port tùy biến và chỉ cho phép từ LAN</span>
            </div>
          </div>
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200 block">Kích hoạt TLS 1.3 & HSTS</span>
              <span className="text-[11px] text-slate-400">Loại bỏ các giao thức cũ SSLv3, TLS 1.0, TLS 1.1</span>
            </div>
          </div>
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200 block">Sao lưu tự động Offsite</span>
              <span className="text-[11px] text-slate-400">Backup cơ sở dữ liệu và code web hàng ngày lên Cloud</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
