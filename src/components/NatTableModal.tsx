import React, { useState } from 'react';
import { NetworkConfig, PortForwardRule, GrayTone } from '../types/network';
import { getPortForwardRules, generateRouterConfigs } from '../data/networkData';
import { 
  Shield, 
  Copy, 
  Check, 
  Search, 
  Terminal, 
  Layers, 
  Filter, 
  AlertCircle,
  ExternalLink,
  Info
} from 'lucide-react';

interface NatTableModalProps {
  config: NetworkConfig;
  grayTheme?: GrayTone;
}

export const NatTableModal: React.FC<NatTableModalProps> = ({ config, grayTheme = 'slate-gray' }) => {
  const rules = getPortForwardRules(config);
  const routerConfigs = generateRouterConfigs(config);

  const [activeTab, setActiveTab] = useState<'table' | 'mikrotik' | 'cisco' | 'linux' | 'pfsense'>('table');
  const [filterService, setFilterService] = useState<'all' | 'Web' | 'Mail' | 'FTP'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const filteredRules = rules.filter(r => {
    const matchesService = filterService === 'all' || r.service === filterService;
    const matchesSearch = 
      r.subService.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.externalPort.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesService && matchesSearch;
  });

  return (
    <div className={`border rounded-2xl p-6 space-y-6 transition-colors ${containerBg}`}>
      {/* Title & Navigation Tabs */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 ${isLight ? 'border-slate-200' : 'border-slate-700/60'}`}>
        <div>
          <h3 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Shield className="w-5 h-5 text-blue-400" />
            Bảng Ánh Xạ Cổng NAT & Cấu Hình Thiết Bị Router
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Ánh xạ toàn bộ lưu lượng Public IP <span className="font-mono text-sky-400 font-bold">{config.publicIp}</span> vào máy chủ LAN <span className="font-mono text-emerald-400 font-bold">{config.serverLanIp}</span>
          </p>
        </div>

        {/* Tab Switcher */}
        <div className={`flex items-center gap-1 p-1.5 rounded-xl border text-xs ${subBoxBg}`}>
          <button
            onClick={() => setActiveTab('table')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'table' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bảng ma trận Port
          </button>
          <button
            onClick={() => setActiveTab('mikrotik')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'mikrotik' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            MikroTik RouterOS
          </button>
          <button
            onClick={() => setActiveTab('cisco')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'cisco' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cisco IOS
          </button>
          <button
            onClick={() => setActiveTab('linux')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'linux' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Linux iptables
          </button>
          <button
            onClick={() => setActiveTab('pfsense')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'pfsense' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            pfSense / OPNsense
          </button>
        </div>
      </div>

      {/* VIEW 1: PORT FORWARDING MATRIX TABLE */}
      {activeTab === 'table' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {(['all', 'Web', 'Mail', 'FTP'] as const).map(svc => (
                <button
                  key={svc}
                  onClick={() => setFilterService(svc)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all border ${
                    filterService === svc
                      ? 'bg-slate-800 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {svc === 'all' ? 'Tất cả (' + rules.length + ')' : svc}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm theo cổng, tên dịch vụ..."
                className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-56"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-bold">Dịch vụ</th>
                  <th className="py-3 px-4 font-bold">Giao thức</th>
                  <th className="py-3 px-4 font-bold">Cổng Ngoài (WAN)</th>
                  <th className="py-3 px-4 font-bold">IP Đích Nội Bộ</th>
                  <th className="py-3 px-4 font-bold">Cổng Đích (LAN)</th>
                  <th className="py-3 px-4 font-bold">Chức năng & Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredRules.map(rule => (
                  <tr key={rule.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          rule.service === 'Web' ? 'bg-emerald-400' :
                          rule.service === 'Mail' ? 'bg-amber-400' :
                          'bg-cyan-400'
                        }`} />
                        <span>{rule.subService}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{rule.service} Service</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-300">
                      {rule.protocol}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">
                      {rule.externalPort}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                      {rule.internalIp}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sky-400">
                      {rule.internalPort}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-sm">
                      <div className="line-clamp-2">{rule.description}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{rule.securityNote}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Practical Caveat Notice */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-300">Lưu ý cốt lõi cho dịch vụ FTP và Mail Server:</span>
              <p className="leading-relaxed">
                1. <b>FTP sau NAT:</b> Phải mở cả Port 21 (lệnh) VÀ dải Passive Ports (<code className="font-mono text-amber-100">{config.ftpPassiveRange}</code>), đồng thời khai báo <code className="font-mono text-amber-100">pasv_address={config.publicIp}</code> trong file cấu hình FTP của server.
                <br />
                2. <b>Mail Port 25:</b> Rất nhiều nhà mạng Internet cáp quang gia đình chặn chiều gửi của cổng 25 để tránh spam. Doanh nghiệp cần đăng ký gói IP tĩnh doanh nghiệp và yêu cầu ISP mở cổng 25 hai chiều.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MIKROTIK ROUTEROS SCRIPT */}
      {activeTab === 'mikrotik' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>Dán toàn bộ lệnh sau vào Terminal của Winbox hoặc SSH MikroTik RouterOS</span>
            </div>
            <button
              onClick={() => handleCopy(routerConfigs.mikrotik, 'mikrotik')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow"
            >
              {copiedKey === 'mikrotik' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'mikrotik' ? 'Đã sao chép!' : 'Sao chép lệnh'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto max-h-[420px] leading-relaxed">
            {routerConfigs.mikrotik}
          </pre>
        </div>
      )}

      {/* VIEW 3: CISCO IOS SCRIPT */}
      {activeTab === 'cisco' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>Dán vào chế độ cấu hình cấu hình toàn cục (configure terminal) của Cisco Router</span>
            </div>
            <button
              onClick={() => handleCopy(routerConfigs.cisco, 'cisco')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow"
            >
              {copiedKey === 'cisco' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'cisco' ? 'Đã sao chép!' : 'Sao chép lệnh'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto max-h-[420px] leading-relaxed">
            {routerConfigs.cisco}
          </pre>
        </div>
      )}

      {/* VIEW 4: LINUX IPTABLES */}
      {activeTab === 'linux' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>Áp dụng trên máy chủ Linux đóng vai trò Router/Gateway (chạy với quyền root)</span>
            </div>
            <button
              onClick={() => handleCopy(routerConfigs.linuxIptables, 'linux')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow"
            >
              {copiedKey === 'linux' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'linux' ? 'Đã sao chép!' : 'Sao chép script'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto max-h-[420px] leading-relaxed">
            {routerConfigs.linuxIptables}
          </pre>
        </div>
      )}

      {/* VIEW 5: PFSENSE / OPNSENSE */}
      {activeTab === 'pfsense' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>Hướng dẫn từng bước thiết lập trên giao diện Web GUI của pfSense / OPNsense</span>
            </div>
            <button
              onClick={() => handleCopy(routerConfigs.pfsense, 'pfsense')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow"
            >
              {copiedKey === 'pfsense' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'pfsense' ? 'Đã sao chép!' : 'Sao chép hướng dẫn'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto max-h-[420px] leading-relaxed">
            {routerConfigs.pfsense}
          </pre>
        </div>
      )}
    </div>
  );
};
