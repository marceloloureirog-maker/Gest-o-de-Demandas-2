import React from 'react';
import { ListChecks, Building2, Plus, FileText } from 'lucide-react';

interface AndroidBottomNavProps {
  currentTab: 'demandas' | 'unidades' | 'relatorios';
  onSelectTab: (tab: 'demandas' | 'unidades' | 'relatorios') => void;
  onOpenNewDemand: () => void;
  unreadCount?: number;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewDemand,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around relative">
        {/* Tab 1: Demandas */}
        <button
          id="nav-tab-demands"
          onClick={() => onSelectTab('demandas')}
          className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition cursor-pointer ${
            currentTab === 'demandas'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ListChecks className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Demandas</span>
          {currentTab === 'demandas' && (
            <span className="w-4 h-1 bg-blue-600 rounded-full mt-0.5" />
          )}
        </button>

        {/* Tab 2: Unidades (Registros Mestres) */}
        <button
          id="nav-tab-units"
          onClick={() => onSelectTab('unidades')}
          className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition cursor-pointer ${
            currentTab === 'unidades'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Unidades</span>
          {currentTab === 'unidades' && (
            <span className="w-4 h-1 bg-blue-600 rounded-full mt-0.5" />
          )}
        </button>

        {/* Center Action: Floating Action Button (FAB) for Nova Demanda */}
        <div className="relative -top-5">
          <button
            id="fab-new-demand"
            onClick={onOpenNewDemand}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 border-4 border-white transition-all cursor-pointer"
            title="Inserir Nova Demanda no Registro"
            aria-label="Inserir Nova Demanda"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 3: Relatórios PDF */}
        <button
          id="nav-tab-reports"
          onClick={() => onSelectTab('relatorios')}
          className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition cursor-pointer ${
            currentTab === 'relatorios'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Relatórios</span>
          {currentTab === 'relatorios' && (
            <span className="w-4 h-1 bg-blue-600 rounded-full mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
};
