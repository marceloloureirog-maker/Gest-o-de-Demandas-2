import React, { useState, useEffect } from 'react';
import {
  Building2,
  FileText,
  RotateCcw,
  Wifi,
  BatteryMedium,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface AndroidHeaderProps {
  currentTab: 'demandas' | 'unidades' | 'relatorios';
  onOpenReportModal: () => void;
  onResetData: () => void;
  totalActiveCount: number;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  currentTab,
  onOpenReportModal,
  onResetData,
  totalActiveCount,
}) => {
  const [timeStr, setTimeStr] = useState('12:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md select-none">
      {/* Android System Status Bar Simulation */}
      <div className="flex items-center justify-between px-4 py-1 text-[11px] text-slate-300 border-b border-slate-800/80 bg-slate-950/40 font-mono tracking-tight">
        <span>{timeStr}</span>
        <div className="flex items-center gap-2">
          <Wifi className="w-3 h-3 text-slate-300" />
          <span className="text-[10px] font-sans font-medium text-emerald-400">Online</span>
          <BatteryMedium className="w-3.5 h-3.5 text-slate-300" />
        </div>
      </div>

      {/* Main App Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Gestão de Demandas
              </h1>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold">
                Obras & Logística
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none mt-0.5">
              {totalActiveCount} demanda(s) ativas no sistema
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Quick PDF Report Trigger */}
          <button
            id="btn-header-pdf-reports"
            onClick={onOpenReportModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 shadow-xs transition active:scale-95 cursor-pointer"
            title="Abrir Gerador de Relatórios em PDF"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Relatórios</span> PDF
          </button>

          {/* Reset Demo Data button */}
          <button
            onClick={onResetData}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
            title="Restaurar dados de exemplo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
