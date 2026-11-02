import React from 'react';
import { X, ExternalLink, Download, FileText, CheckCircle2 } from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl?: string;
  title?: string;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  pdfUrl = '/configWindowServer.pdf',
  title = 'configWindowServer.pdf',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-6xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-rose-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white truncate font-mono">
                  {title}
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                  PDF 56 Trang
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                Báo cáo Thiết Bị Đào Tạo Tự Làm: Xây dựng mô hình máy chủ tập trung từ LAN ra WAN • Tác giả: Vũ Thị Tho, Trần Lệ Thủy
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow"
              title="Mở tập tin trong tab trình duyệt mới"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở tab mới</span>
            </a>

            <a
              href={pdfUrl}
              download="configWindowServer.pdf"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow"
              title="Tải tập tin về máy tính"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tải về</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Embedded PDF Viewer */}
        <div className="flex-1 w-full bg-slate-950 min-h-[500px] h-[78vh] relative">
          <iframe
            src={`${pdfUrl}#view=FitH`}
            className="w-full h-full border-none"
            title={title}
          />

          {/* Fallback overlay helper */}
          <div className="absolute bottom-3 left-4 right-4 sm:left-auto sm:right-4 z-10 pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Đang hiển thị toàn bộ 56 trang báo cáo Lab 1 - Lab 7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
