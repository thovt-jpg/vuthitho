import React, { useState } from 'react';
import { NetworkConfig, GrayTone } from '../types/network';
import { DEFAULT_CONFIG } from '../data/networkData';
import { Settings2, X, RotateCcw, Check } from 'lucide-react';

interface TopologySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: NetworkConfig;
  onSaveConfig: (newConfig: NetworkConfig) => void;
  grayTheme?: GrayTone;
}

export const TopologySettingsModal: React.FC<TopologySettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  grayTheme = 'slate-gray',
}) => {
  if (!isOpen) return null;

  const [formConfig, setFormConfig] = useState<NetworkConfig>({ ...config });

  const isLight = grayTheme === 'light-gray';
  const isCool = grayTheme === 'cool-gray';

  const modalBg = isLight 
    ? 'bg-white border-slate-300 text-slate-900 shadow-2xl' 
    : isCool 
    ? 'bg-[#2a303c] border-[#3f4756] text-slate-100 shadow-2xl' 
    : 'bg-[#222731] border-[#363f50] text-slate-100 shadow-2xl';

  const inputBg = isLight 
    ? 'bg-[#f8fafc] border-slate-300 text-slate-900' 
    : isCool 
    ? 'bg-[#1f242e] border-[#384252] text-white' 
    : 'bg-[#181c23] border-[#2c3340] text-white';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formConfig);
    onClose();
  };

  const handleReset = () => {
    setFormConfig({ ...DEFAULT_CONFIG });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${modalBg}`}>
        <div className={`p-5 border-b flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-700/60'}`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Tùy Chỉnh Thông Số Kiến Trúc Mạng</h3>
              <p className="text-xs text-slate-400">Thay đổi IP Public, IP LAN, tên miền và xem toàn bộ hệ thống cập nhật tức thì</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Tên miền chính (Domain Name):
            </label>
            <input
              type="text"
              value={formConfig.domain}
              onChange={e => setFormConfig({ ...formConfig, domain: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
              required
            />
            <span className="text-[11px] text-slate-500 mt-0.5 block">Mặc định: bctech.asia</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Địa chỉ IP Public (WAN):
              </label>
              <input
                type="text"
                value={formConfig.publicIp}
                onChange={e => setFormConfig({ ...formConfig, publicIp: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sky-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                required
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">IP Tĩnh do ISP cấp</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Địa chỉ IP Server LAN:
              </label>
              <input
                type="text"
                value={formConfig.serverLanIp}
                onChange={e => setFormConfig({ ...formConfig, serverLanIp: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                required
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">Mặc định: 192.168.1.200</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Gateway Router LAN:
              </label>
              <input
                type="text"
                value={formConfig.lanGateway}
                onChange={e => setFormConfig({ ...formConfig, lanGateway: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Dải cổng Passive FTP:
              </label>
              <input
                type="text"
                value={formConfig.ftpPassiveRange}
                onChange={e => setFormConfig({ ...formConfig, ftpPassiveRange: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-cyan-400 font-mono focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục mặc định</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
