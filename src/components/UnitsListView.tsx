import React, { useState } from 'react';
import {
  Building2,
  Search,
  Plus,
  ChevronRight,
  FileText,
  MapPin,
  Clock,
  Layers,
} from 'lucide-react';
import { UnitRecord } from '../types';

interface UnitsListViewProps {
  unitRecords: UnitRecord[];
  onSelectUnit: (unitId: string) => void;
  onAddNewDemandToUnit: (unitId: string) => void;
  onOpenUnitReport: (unitId: string) => void;
  onOpenNewUnitModal: () => void;
}

export const UnitsListView: React.FC<UnitsListViewProps> = ({
  unitRecords,
  onSelectUnit,
  onAddNewDemandToUnit,
  onOpenUnitReport,
  onOpenNewUnitModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = unitRecords.filter((record) => {
    const term = searchTerm.toLowerCase();
    return (
      record.unit.name.toLowerCase().includes(term) ||
      (record.unit.code && record.unit.code.toLowerCase().includes(term)) ||
      (record.unit.region && record.unit.region.toLowerCase().includes(term))
    );
  });

  return (
    <div id="units-list-view" className="space-y-4 pb-20 animate-in fade-in">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="search-units-input"
            placeholder="Buscar por unidade, código ou regional..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
          />
        </div>

        <button
          id="btn-new-unit-open"
          onClick={onOpenNewUnitModal}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Unidade</span>
        </button>
      </div>

      {/* Info notification */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Cada unidade possui um <strong>registro mestre contínuo</strong>. Novas demandas e conclusões são consolidadas no histórico da unidade.
          </span>
        </div>
        <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md text-[11px] shrink-0 ml-2">
          {unitRecords.length} unidades
        </span>
      </div>

      {/* Units Master Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredRecords.map((record) => {
          const { unit, demands, lastUpdated } = record;
          const total = demands.length;
          const pendentes = demands.filter((d) => d.status === 'Pendente').length;
          const emAndamento = demands.filter((d) => d.status === 'Em andamento').length;
          const concluidas = demands.filter((d) => d.status === 'Concluído').length;
          const altaPrioridade = demands.filter((d) => d.priority === 'Alta' && d.status !== 'Concluído').length;

          return (
            <div
              key={unit.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between"
            >
              {/* Top part: Unit identification */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h3
                      onClick={() => onSelectUnit(unit.id)}
                      className="text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition line-clamp-1"
                    >
                      {unit.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      {unit.code && (
                        <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                          {unit.code}
                        </span>
                      )}
                      <span>{unit.region || 'Geral'}</span>
                    </div>
                  </div>

                  {altaPrioridade > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold shrink-0 animate-pulse">
                      {altaPrioridade} Urgente(s)
                    </span>
                  )}
                </div>

                {unit.address && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{unit.address}</span>
                  </p>
                )}

                {/* Demand Counters Mini Bar */}
                <div className="grid grid-cols-4 gap-1.5 my-3 pt-3 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-1.5 rounded-lg">
                    <span className="block text-xs font-bold text-slate-800">{total}</span>
                    <span className="text-[10px] text-slate-500">Total</span>
                  </div>
                  <div className="bg-rose-50 p-1.5 rounded-lg">
                    <span className="block text-xs font-bold text-rose-700">{pendentes}</span>
                    <span className="text-[10px] text-rose-600">Pendente</span>
                  </div>
                  <div className="bg-amber-50 p-1.5 rounded-lg">
                    <span className="block text-xs font-bold text-amber-700">{emAndamento}</span>
                    <span className="text-[10px] text-amber-600">Andamento</span>
                  </div>
                  <div className="bg-emerald-50 p-1.5 rounded-lg">
                    <span className="block text-xs font-bold text-emerald-700">{concluidas}</span>
                    <span className="text-[10px] text-emerald-600">Concluído</span>
                  </div>
                </div>
              </div>

              {/* Bottom part: Action buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {demands.length > 0
                    ? `Atualizado: ${new Date(lastUpdated).toLocaleDateString('pt-BR')}`
                    : 'Sem demandas ativas'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenUnitReport(unit.id)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95"
                    title="Exportar relatório PDF desta unidade"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                  </button>

                  <button
                    onClick={() => onAddNewDemandToUnit(unit.id)}
                    className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center gap-1 active:scale-95"
                    title="Adicionar nova demanda a esta unidade"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Demanda</span>
                  </button>

                  <button
                    onClick={() => onSelectUnit(unit.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 transition active:scale-95"
                  >
                    <span>Registro</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
