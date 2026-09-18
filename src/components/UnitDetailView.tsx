import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  User,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  HardHat,
  Truck,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Calendar,
} from 'lucide-react';
import { DemandItem, DemandStatus, Unit, UnitRecord } from '../types';

interface UnitDetailViewProps {
  unitRecord: UnitRecord;
  onBack: () => void;
  onAddNewDemand: (unitId: string) => void;
  onEditDemand: (demand: DemandItem) => void;
  onDeleteDemand: (demandId: string) => void;
  onUpdateStatus: (demandId: string, status: DemandStatus, notes?: string) => void;
  onOpenUnitReport: (unitId: string) => void;
  onViewPhotos: (photos: DemandItem['photos'], title: string) => void;
}

export const UnitDetailView: React.FC<UnitDetailViewProps> = ({
  unitRecord,
  onBack,
  onAddNewDemand,
  onEditDemand,
  onDeleteDemand,
  onUpdateStatus,
  onOpenUnitReport,
  onViewPhotos,
}) => {
  const { unit, demands } = unitRecord;
  const [filterType, setFilterType] = useState<'ALL' | 'Obras' | 'Logistica'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | DemandStatus>('ALL');

  const filteredDemands = demands.filter((d) => {
    if (filterType !== 'ALL' && d.type !== filterType) return false;
    if (filterStatus !== 'ALL' && d.status !== filterStatus) return false;
    return true;
  });

  const totalCount = demands.length;
  const pendentesCount = demands.filter((d) => d.status === 'Pendente').length;
  const emAndamentoCount = demands.filter((d) => d.status === 'Em andamento').length;
  const concluidasCount = demands.filter((d) => d.status === 'Concluído').length;

  return (
    <div id="unit-detail-view" className="space-y-4 pb-20 animate-in fade-in">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95"
              title="Voltar para lista de unidades"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                  {unit.name}
                </h1>
                {unit.code && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold">
                    {unit.code}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Registro Mestre Consolidado • Atualizado com novas solicitações e conclusões
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-unit-pdf-report"
              onClick={() => onOpenUnitReport(unit.id)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
              title="Gerar relatório em PDF desta unidade"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Relatório</span> PDF
            </button>

            <button
              id="btn-add-demand-to-unit"
              onClick={() => onAddNewDemand(unit.id)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Demanda</span>
            </button>
          </div>
        </div>

        {/* Unit Info details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{unit.address || unit.region || 'Endereço não informado'}</span>
          </div>
          {unit.contactName && (
            <div className="flex items-center gap-1.5 truncate">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{unit.contactName}</span>
            </div>
          )}
          {unit.phone && (
            <div className="flex items-center gap-1.5 truncate">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{unit.phone}</span>
            </div>
          )}
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-2.5 rounded-xl text-center border border-slate-100">
            <span className="text-base sm:text-lg font-bold text-slate-900 block">{totalCount}</span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-medium">Total Registradas</span>
          </div>
          <div className="bg-rose-50/80 p-2.5 rounded-xl text-center border border-rose-100">
            <span className="text-base sm:text-lg font-bold text-rose-700 block">{pendentesCount}</span>
            <span className="text-[10px] sm:text-xs text-rose-700 font-medium">Pendentes</span>
          </div>
          <div className="bg-amber-50/80 p-2.5 rounded-xl text-center border border-amber-100">
            <span className="text-base sm:text-lg font-bold text-amber-700 block">{emAndamentoCount}</span>
            <span className="text-[10px] sm:text-xs text-amber-700 font-medium">Em Andamento</span>
          </div>
          <div className="bg-emerald-50/80 p-2.5 rounded-xl text-center border border-emerald-100">
            <span className="text-base sm:text-lg font-bold text-emerald-700 block">{concluidasCount}</span>
            <span className="text-[10px] sm:text-xs text-emerald-700 font-medium">Concluídas</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs for Demands in this Record */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {(['ALL', 'Pendente', 'Em andamento', 'Concluído'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Todos os Status' : st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {(['ALL', 'Obras', 'Logistica'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filterType === t
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t === 'ALL' ? 'Ambos Tipos' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Demands Timeline / List */}
      <div className="space-y-3">
        {filteredDemands.length > 0 ? (
          filteredDemands.map((demand) => {
            const isObras = demand.type === 'Obras';
            const isCompleted = demand.status === 'Concluído';

            return (
              <div
                key={demand.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition"
              >
                {/* Demand Card Top Bar */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Type Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        isObras
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-blue-100 text-blue-900 border border-blue-300'
                      }`}
                    >
                      {isObras ? <HardHat className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
                      {demand.type}: {demand.subtype}
                    </span>

                    {/* Priority Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        demand.priority === 'Alta'
                          ? 'bg-red-100 text-red-700'
                          : demand.priority === 'Média'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Prioridade {demand.priority}
                    </span>
                  </div>

                  {/* Status Dropdown/Selector */}
                  <div className="flex items-center gap-1.5">
                    <select
                      value={demand.status}
                      onChange={(e) => onUpdateStatus(demand.id, e.target.value as DemandStatus)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        demand.status === 'Concluído'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : demand.status === 'Em andamento'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Em andamento">Em andamento</option>
                      <option value="Concluído">Concluído</option>
                    </select>

                    <button
                      onClick={() => onEditDemand(demand)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
                      title="Editar demanda"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteDemand(demand.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition"
                      title="Excluir demanda"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                  {demand.description}
                </p>

                {demand.locationDetails && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>Setor/Local: {demand.locationDetails}</span>
                  </p>
                )}

                {/* Resolution notes if completed */}
                {demand.resolutionNotes && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900">
                    <strong className="font-semibold text-emerald-800">Solução Realizada: </strong>
                    {demand.resolutionNotes}
                  </div>
                )}

                {/* Photos Bar */}
                {demand.photos && demand.photos.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                        Registro Fotográfico ({demand.photos.length} fotos anexadas)
                      </span>
                      <button
                        onClick={() =>
                          onViewPhotos(demand.photos, `${unit.name} - ${demand.type}: ${demand.subtype}`)
                        }
                        className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        Ver em tela cheia
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {demand.photos.map((photo, idx) => (
                        <div
                          key={photo.id || idx}
                          onClick={() =>
                            onViewPhotos(demand.photos, `${unit.name} - ${demand.type}: ${demand.subtype}`)
                          }
                          className="relative rounded-xl overflow-hidden aspect-square bg-slate-100 border border-slate-200 cursor-pointer group shadow-2xs hover:opacity-90 transition"
                        >
                          <img
                            src={photo.dataUrl}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card Footer: Timestamps */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Registrado em: {new Date(demand.createdAt).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(demand.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {demand.completedAt && (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Concluído em: {new Date(demand.completedAt).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              Nenhuma demanda encontrada neste filtro para esta unidade.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Clique em &quot;Nova Demanda&quot; para cadastrar solicitações no registro desta unidade.
            </p>
            <button
              onClick={() => onAddNewDemand(unit.id)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Inserir Demanda no Registro
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
