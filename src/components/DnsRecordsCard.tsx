import React, { useState } from 'react';
import { NetworkConfig, DnsRecord, GrayTone } from '../types/network';
import { getDnsRecords } from '../data/networkData';
import { 
  Globe2, 
  Copy, 
  Check, 
  FileCode, 
  Search, 
  Terminal, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface DnsRecordsCardProps {
  config: NetworkConfig;
  grayTheme?: GrayTone;
}

export const DnsRecordsCard: React.FC<DnsRecordsCardProps> = ({ config, grayTheme = 'slate-gray' }) => {
  const records = getDnsRecords(config);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'records' | 'zonefile' | 'digTester'>('records');
  const [digQueryType, setDigQueryType] = useState<'A' | 'MX' | 'TXT' | 'PTR'>('A');

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

  // Generate standard BIND zone file content
  const zoneFileContent = `; ========================================================
; BIND 9 Zone File cho Tên miền: ${config.domain}
; Địa chỉ IP Public của Router NAT: ${config.publicIp}
; ========================================================
$TTL 3600
@   IN  SOA ns1.${config.domain}. hostmaster.${config.domain}. (
        2026103001 ; Serial YYYYMMDDnn
        3600       ; Refresh (1 hour)
        1800       ; Retry (30 mins)
        1209600    ; Expire (2 weeks)
        86400      ; Minimum TTL (1 day)
)

; Nameservers
@       IN  NS      ns1.${config.domain}.
@       IN  NS      ns2.${config.domain}.

; Địa chỉ IP A Records trỏ về Public IP
@       IN  A       ${config.publicIp}
www     IN  A       ${config.publicIp}
mail    IN  A       ${config.publicIp}
ftp     IN  A       ${config.publicIp}

; Mail Exchange (MX)
@       IN  MX  10  mail.${config.domain}.

; Email Authentication (SPF, DMARC, DKIM)
@       IN  TXT     "v=spf1 mx ip4:${config.publicIp} ~all"
_dmarc  IN  TXT     "v=DMARC1; p=quarantine; rua=mailto:postmaster@${config.domain}; pct=100"
default._domainkey  IN  TXT  "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD..."
`;

  // Simulated dig command outputs
  const getSimulatedDigOutput = () => {
    switch (digQueryType) {
      case 'A':
        return `; <<>> DiG 9.18.1-1ubuntu1.3-Ubuntu <<>> ${config.domain} A +noall +answer
;; global options: +cmd
${config.domain}.        3600    IN      A       ${config.publicIp}
www.${config.domain}.    3600    IN      A       ${config.publicIp}
mail.${config.domain}.   3600    IN      A       ${config.publicIp}
ftp.${config.domain}.    3600    IN      A       ${config.publicIp}

;; Query time: 14 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)
;; WHEN: Fri Oct 30 18:45:00 UTC 2026
;; MSG SIZE  rcvd: 112`;

      case 'MX':
        return `; <<>> DiG 9.18.1-1ubuntu1.3-Ubuntu <<>> ${config.domain} MX +noall +answer
;; global options: +cmd
${config.domain}.        3600    IN      MX      10 mail.${config.domain}.

;; ADDITIONAL SECTION:
mail.${config.domain}.   3600    IN      A       ${config.publicIp}

;; Query time: 18 msec
;; SERVER: 1.1.1.1#53(1.1.1.1)`;

      case 'TXT':
        return `; <<>> DiG 9.18.1-1ubuntu1.3-Ubuntu <<>> ${config.domain} TXT +noall +answer
;; global options: +cmd
${config.domain}.        3600    IN      TXT     "v=spf1 mx ip4:${config.publicIp} ~all"
_dmarc.${config.domain}. 3600    IN      TXT     "v=DMARC1; p=quarantine; rua=mailto:postmaster@${config.domain}; pct=100"

;; Query time: 21 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)`;

      case 'PTR':
        return `; <<>> DiG 9.18.1-1ubuntu1.3-Ubuntu <<>> -x ${config.publicIp} +noall +answer
;; global options: +cmd
${config.publicIp.split('.').reverse().join('.')}.in-addr.arpa. 86400 IN PTR mail.${config.domain}.

;; Query time: 24 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)`;
    }
  };

  return (
    <div className={`border rounded-2xl p-6 space-y-6 transition-colors ${containerBg}`}>
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 ${isLight ? 'border-slate-200' : 'border-slate-700/60'}`}>
        <div>
          <h3 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Globe2 className="w-5 h-5 text-purple-400" />
            Cấu Hình Bản Ghi DNS Cho Tên Miền {config.domain}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Các bản ghi DNS cần khai báo trên trang quản lý tên miền (Cloudflare, PAVietnam, Matbao, Tenten, v.v.)
          </p>
        </div>

        {/* View Switcher */}
        <div className={`flex items-center gap-1 p-1.5 rounded-xl border text-xs ${subBoxBg}`}>
          <button
            onClick={() => setActiveView('records')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeView === 'records' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bảng bản ghi DNS
          </button>
          <button
            onClick={() => setActiveView('zonefile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeView === 'zonefile' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            File BIND Zone
          </button>
          <button
            onClick={() => setActiveView('digTester')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeView === 'digTester' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Mô phỏng dig / nslookup
          </button>
        </div>
      </div>

      {/* VIEW 1: DNS RECORDS TABLE */}
      {activeView === 'records' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-bold">Loại (Type)</th>
                  <th className="py-3 px-4 font-bold">Tên máy chủ (Host / Name)</th>
                  <th className="py-3 px-4 font-bold">Giá trị (Value / Points to)</th>
                  <th className="py-3 px-4 font-bold">Ưu tiên (MX)</th>
                  <th className="py-3 px-4 font-bold">TTL</th>
                  <th className="py-3 px-4 font-bold">Mục đích sử dụng</th>
                  <th className="py-3 px-4 font-bold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {records.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md font-mono font-bold text-[11px] ${
                        rec.type === 'A' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        rec.type === 'MX' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        rec.type === 'TXT' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {rec.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-white">
                      {rec.host}
                    </td>
                    <td className="py-3 px-4 font-mono text-sky-300 font-semibold max-w-xs truncate" title={rec.value}>
                      {rec.value}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {rec.priority !== undefined ? rec.priority : '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {rec.ttl}s
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs">
                      {rec.purpose}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleCopy(rec.value, `dns-${idx}`)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                        title="Sao chép giá trị"
                      >
                        {copiedKey === `dns-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mail Deliverability Callout */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-start gap-3 text-xs text-purple-200">
            <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-purple-300">Yêu cầu khắt khe để gửi Email sang Google Gmail & Microsoft Outlook:</span>
              <p className="leading-relaxed">
                Kể từ năm 2024, Google và Yahoo bắt buộc tất cả các hệ thống máy chủ gửi email phải có đầy đủ 3 bản ghi: <b>SPF</b>, <b>DKIM</b>, và <b>DMARC</b>. Nếu thiếu 1 trong 3 bản ghi này, email từ <code className="text-purple-100 font-mono">bctech.asia</code> sẽ bị từ chối 100% hoặc rơi vào hòm thư rác (Spam).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: BIND ZONE FILE */}
      {activeView === 'zonefile' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Định dạng chuẩn BIND 9 Zone File - có thể import trực tiếp vào Cloudflare DNS, AWS Route 53 hoặc BIND9 Server
            </span>
            <button
              onClick={() => handleCopy(zoneFileContent, 'zonefile')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-all shadow"
            >
              {copiedKey === 'zonefile' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'zonefile' ? 'Đã sao chép!' : 'Sao chép Zone File'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto max-h-[420px] leading-relaxed">
            {zoneFileContent}
          </pre>
        </div>
      )}

      {/* VIEW 3: DIG / NSLOOKUP SIMULATOR */}
      {activeView === 'digTester' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Chọn lệnh truy vấn:</span>
              {(['A', 'MX', 'TXT', 'PTR'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setDigQueryType(type)}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border transition-all ${
                    digQueryType === type
                      ? 'bg-purple-600 border-purple-500 text-white shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  dig {type}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleCopy(getSimulatedDigOutput(), 'dig-out')}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all"
            >
              {copiedKey === 'dig-out' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Sao chép kết quả</span>
            </button>
          </div>

          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                <span className="ml-2 text-slate-300 font-sans font-medium">Terminal DNS Query Inspector</span>
              </div>
              <span>DNS Resolver: 8.8.8.8</span>
            </div>
            <pre className="p-4 text-emerald-400 overflow-x-auto leading-relaxed">
              {getSimulatedDigOutput()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
