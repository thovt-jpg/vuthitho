import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NetworkConfig, SimulationScenario, GrayTone } from '../types/network';
import { getSimulationScenarios } from '../data/networkData';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  ArrowRight, 
  Radio, 
  CheckCircle2, 
  Globe, 
  Mail, 
  FolderDown, 
  Laptop,
  Cpu,
  Layers,
  Activity,
  Video
} from 'lucide-react';

interface PacketSimulatorProps {
  config: NetworkConfig;
  onSimulationChange: (sim: SimulationScenario | null, stepIdx: number) => void;
  grayTheme?: GrayTone;
  onOpenVideoExport?: () => void;
}

export const PacketSimulator: React.FC<PacketSimulatorProps> = ({
  config,
  onSimulationChange,
  grayTheme = 'slate-gray',
  onOpenVideoExport,
}) => {
  const scenarios = useMemo(() => getSimulationScenarios(config), [config]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0].id);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2500); // ms per step

  const currentScenario = useMemo(() => {
    return scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];
  }, [scenarios, selectedScenarioId]);

  const currentStep = currentScenario.steps[currentStepIdx] || currentScenario.steps[0];

  // Track the last notified state to prevent infinite update loops
  const lastNotifiedRef = useRef<{ id: string; step: number } | null>(null);

  // Notify parent of active simulation state safely without triggering loop
  useEffect(() => {
    if (
      !lastNotifiedRef.current ||
      lastNotifiedRef.current.id !== currentScenario.id ||
      lastNotifiedRef.current.step !== currentStepIdx
    ) {
      lastNotifiedRef.current = { id: currentScenario.id, step: currentStepIdx };
      onSimulationChange(currentScenario, currentStepIdx);
    }
  }, [currentScenario, currentStepIdx, onSimulationChange]);

  // Autoplay timer
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (currentStepIdx < currentScenario.steps.length - 1) {
          setCurrentStepIdx((idx: number) => idx + 1);
        } else {
          setIsPlaying(false);
        }
      }, playbackSpeed);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStepIdx, currentScenario, playbackSpeed]);

  const handleSelectScenario = (id: string) => {
    setSelectedScenarioId(id);
    setCurrentStepIdx(0);
    setIsPlaying(false);
  };

  const handleNextStep = () => {
    if (currentStepIdx < currentScenario.steps.length - 1) {
      setCurrentStepIdx((idx: number) => idx + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((idx: number) => idx - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
    setIsPlaying(false);
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'web':
        return <Globe className="w-4 h-4 text-emerald-400" />;
      case 'mail':
        return <Mail className="w-4 h-4 text-amber-400" />;
      case 'ftp':
        return <FolderDown className="w-4 h-4 text-cyan-400" />;
      case 'lan':
        return <Laptop className="w-4 h-4 text-indigo-400" />;
      default:
        return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

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
    ? 'bg-[#262c36] border-[#384252]' 
    : 'bg-[#1f242e] border-[#2c3544]';

  const innerBoxBg = isLight
    ? 'bg-white border-slate-200 text-slate-700'
    : isCool
    ? 'bg-[#1f242e] border-[#333c4a] text-slate-300'
    : 'bg-[#171a22] border-[#262e3b] text-slate-300';

  return (
    <div className={`border rounded-2xl p-5 space-y-5 transition-colors ${containerBg}`}>
      {/* Header & Scenario Selector */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-700/60'}`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Mô Phỏng Luồng Gói Tin & Chuyển Dịch NAT</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Quan sát từng bước gói tin truyền từ Client qua Public IP, Router NAT dịch địa chỉ đến Server LAN {config.serverLanIp}
          </p>
        </div>

        {/* Quick Scenario Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {scenarios.map(s => (
            <button
              key={s.id}
              onClick={() => handleSelectScenario(s.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                selectedScenarioId === s.id
                  ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-md'
                  : isLight
                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {getServiceIcon(s.service)}
              <span>{s.title.split('(')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Playback Controls & Progress Bar */}
      <div className={`p-4 rounded-xl border space-y-4 ${subCardBg}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Tạm dừng' : 'Chạy tự động'}</span>
            </button>
            <button
              onClick={handlePrevStep}
              disabled={currentStepIdx === 0}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-xl transition-all"
            >
              Bước trước
            </button>
            <button
              onClick={handleNextStep}
              disabled={currentStepIdx === currentScenario.steps.length - 1}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-xl transition-all"
            >
              <span>Bước tiếp</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              title="Khởi động lại mô phỏng"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Step Count & Speed & Video Export */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">
              Bước <b className="text-white font-mono">{currentStepIdx + 1}</b> / {currentScenario.steps.length}
            </span>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'}`}>
              <span className="text-slate-400 text-[11px]">Tốc độ:</span>
              <select
                value={playbackSpeed}
                onChange={e => setPlaybackSpeed(Number(e.target.value))}
                className="bg-transparent text-slate-300 text-xs outline-none cursor-pointer"
              >
                <option value={3500} className="bg-slate-900">Chậm (3.5s)</option>
                <option value={2200} className="bg-slate-900">Bình thường (2.2s)</option>
                <option value={1200} className="bg-slate-900">Nhanh (1.2s)</option>
              </select>
            </div>

            {onOpenVideoExport && (
              <button
                onClick={onOpenVideoExport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/25 active:scale-95"
                title="Xuất mô phỏng này thành tệp video hethongServer"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Xuất Video</span>
              </button>
            )}
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {currentScenario.steps.map((st, i) => (
            <div
              key={i}
              onClick={() => { setCurrentStepIdx(i); setIsPlaying(false); }}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                i === currentStepIdx
                  ? 'bg-blue-600/20 border-blue-500 shadow'
                  : i < currentStepIdx
                  ? 'bg-slate-900/80 border-emerald-500/40 text-slate-400'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                <span className={i === currentStepIdx ? 'text-blue-400' : i < currentStepIdx ? 'text-emerald-400' : 'text-slate-500'}>
                  BƯỚC {i + 1}
                </span>
                {i < currentStepIdx && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </div>
              <div className={`text-xs font-semibold line-clamp-1 ${i === currentStepIdx ? 'text-white' : 'text-slate-400'}`}>
                {st.title.split(':')[1]?.trim() || st.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Technical Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Step Narrative */}
        <div className={`lg:col-span-7 p-4 rounded-xl border space-y-3 ${subCardBg}`}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{currentStep.title}</h4>
              <p className="text-xs text-slate-400">{currentScenario.description}</p>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${innerBoxBg}`}>
            {currentStep.description}
          </div>

          {currentStep.natAction && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
              <Layers className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <b className="font-semibold text-amber-300">Hành động của Router / Firewall NAT:</b>
                <div className="font-mono mt-0.5 text-amber-200/90">{currentStep.natAction}</div>
              </div>
            </div>
          )}
        </div>

        {/* Live Packet Header Inspector (Layer 3 & 4) */}
        <div className={`lg:col-span-5 p-4 rounded-xl border space-y-3 font-mono text-xs ${subCardBg}`}>
          <div className={`flex items-center justify-between font-sans border-b pb-2 ${isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'}`}>
            <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Bộ giải mã gói tin (Packet Header)
            </span>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
              {currentScenario.protocol}
            </span>
          </div>

          {/* IP & Port visual box */}
          <div className={`p-3 rounded-xl border space-y-2 ${innerBoxBg}`}>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Nguồn (Source):</span>
              <span className="text-emerald-400 font-bold">
                {currentStep.srcIp}:{currentStep.srcPort}
              </span>
            </div>
            <div className="flex justify-center text-slate-500 my-0.5">
              <ArrowRight className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Đích (Destination):</span>
              <span className="text-sky-400 font-bold">
                {currentStep.dstIp}:{currentStep.dstPort}
              </span>
            </div>
          </div>

          {/* Payload Summary */}
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">
              Dữ liệu tải trọng (Payload info)
            </span>
            <p className="text-[11px] text-slate-300 font-mono break-all">
              {currentStep.packetDetails}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
