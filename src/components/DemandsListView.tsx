import React, { useState } from 'react';
import {
  Search,
  Filter,
  HardHat,
  Truck,
  Clock,
  CheckCircle2,
  Building2,
  Image as ImageIcon,
  Edit2,
  Trash2,
  MapPin,
  Plus,
  FileText,
  Tag,
  Sparkles,
} from 'lucide-react';
import {
  DemandItem,
  DemandMainType,
  DemandPriority,
  DemandStatus,
  OBRAS_SUBTYPES,
  LOGISTICA_SUBTYPES,
} from '../types';

interface DemandsListViewProps {
  demands: DemandItem[];
  onSelectUnit: (unitId: string) => void;
  onEditDemand: (demand: DemandItem) => void;
  onDeleteDemand: (demandId: string) => void;
  onUpdateStatus: (demandId: string, status: DemandStatus) => void;
  onViewPhotos: (photos: DemandItem['photos'], title: string) => void;
  onAddNewDemand: () => void;
  onGenerateReportForSubtype?: (subtype: string, type?: DemandMainType) => void;
}

export const DemandsListView: React.FC<DemandsListViewProps> = ({
  demands,
  onSelectUnit,
  onEditDemand,
  onDeleteDemand,
  onUpdateStatus,
  onViewPhotos,
  onAddNewDemand,
  onGenerateReportForSubtype,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | DemandMainType>('ALL');
  const [selectedSubtype, setSelectedSubtype] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | DemandStatus>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<'ALL' | DemandPriority>('ALL');

  // Available unique subtypes from demands
  const availableSubtypes = React.useMemo(() => {
    const set = new Set<string>();
    if (selectedType === 'Obras') {
      OBRAS_SUBTYPES.forEach((s) => set.add(s));
    } else if (selectedType === 'Logistica') {
      LOGISTICA_SUBTYPES.forEach((s) => set.add(s));
    } else {
      OBRAS_SUBTYPES.forEach((s) => set.add(s));
      LOGISTICA_SUBTYPES.forEach((s) => set.add(s));
    }
    demands.forEach((d) => {
      if (selectedType === 'ALL' || d.type === selectedType) {
        if (d.subtype) set.add(d.subtype);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [selectedType, demands]);

  const filteredDemands = demands.filter((demand) => {
    // Search
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      demand.unitName.toLowerCase().includes(term) ||
      demand.description.toLowerCase().includes(term) ||
      demand.subtype.toLowerCase().includes(term) ||
      (demand.locationDetails && demand.locationDetails.toLowerCase().includes(term));

    if (!matchesSearch) return false;
    if (selectedType !== 'ALL' && demand.type !== selectedType) return false;
    if (selectedSubtype !== 'ALL' && demand.subtype.toLowerCase() !== selectedSubtype.toLowerCase()) return false;
    if (selectedStatus !== 'ALL' && demand.status !== selectedStatus) return false;
    if (selectedPriority !== 'ALL' && demand.priority !== selectedPriority) return false;

    return true;
  });

  const totalObras = demands.filter((d) => d.type === 'Obras').length;
  const totalLogistica = demands.filter((d) => d.type === 'Logistica').length;
  const totalPendentes = demands.filter((d) => d.status === 'Pendente').length;
  const totalEmAndamento = demands.filter((d) => d.status === 'Em andamento').length;
  const totalConcluidas = demands.filter((d) => d.status === 'Concluído').length;

  return (
    <div id="demands-list-view" className="space-y-4 pb-20 animate-in fade-in">
      {/* Search and Filter Section */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="search-demands-input"
            placeholder="Buscar por unidade, descrição, tipo ou local..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Filter Chips: Type */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 shrink-0">Tipo:</span>
          <button
            onClick={() => {
              setSelectedType('ALL');
              setSelectedSubtype('ALL');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedType === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({demands.length})
          </button>
          <button
            onClick={() => {
              setSelectedType('Obras');
              if (selectedSubtype !== 'ALL') setSelectedSubtype('ALL');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
              selectedType === 'Obras'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <HardHat className="w-3 h-3" />
            Obras ({totalObras})
          </button>
          <button
            onClick={() => {
              setSelectedType('Logistica');
              if (selectedSubtype !== 'ALL') setSelectedSubtype('ALL');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
              selectedType === 'Logistica'
                ? 'bg-blue-600 text-white font-bold shadow-2xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            <Truck className="w-3 h-3" />
            Logística ({totalLogistica})
          </button>
        </div>

        {/* Specificity / Subtype Horizontal Chips (Podas, Telhado, Desinsetização, etc.) */}
        <div className="pt-1.5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Especificidade do Tipo:
            </span>
            {selectedSubtype !== 'ALL' && (
              <button
                onClick={() => setSelectedSubtype('ALL')}
                className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Limpar especificidade
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedSubtype('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedSubtype === 'ALL'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas
            </button>
            {[
              { name: 'Podas', type: 'Obras' as const },
              { name: 'Telhado', type: 'Obras' as const },
              { name: 'Desinsetização', type: 'Logistica' as const },
              { name: 'Areia', type: 'Logistica' as const },
              { name: 'Elétrica', type: 'Obras' as const },
              { name: 'Infiltrações', type: 'Obras' as const },
              { name: 'Parques', type: 'Logistica' as const },
              { name: 'Banheiros', type: 'Obras' as const },
              { name: 'Muros', type: 'Obras' as const },
              { name: 'Segurança Monitorada', type: 'Logistica' as const },
            ].map((spec) => {
              const isSelected = selectedSubtype.toLowerCase() === spec.name.toLowerCase();
              const count = demands.filter((d) => d.subtype.toLowerCase() === spec.name.toLowerCase()).length;
              return (
                <button
                  key={spec.name}
                  onClick={() => {
                    setSelectedSubtype(spec.name);
                    setSelectedType(spec.type);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-400'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{spec.name}</span>
                  <span className={`text-[10px] px-1 rounded font-bold ${isSelected ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Chips: Status */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 shrink-0">Status:</span>
          {(['ALL', 'Pendente', 'Em andamento', 'Concluído'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedStatus === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL'
                ? 'Todos'
                : st === 'Pendente'
                ? `Pendentes (${totalPendentes})`
                : st === 'Em andamento'
                ? `Andamento (${totalEmAndamento})`
                : `Concluídos (${totalConcluidas})`}
            </button>
          ))}
        </div>
      </div>

      {/* Action banner when specificity is active */}
      {selectedSubtype !== 'ALL' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600 shrink-0" />
            <p className="text-xs text-blue-950 font-medium">
              Filtrando especificidade: <strong className="text-blue-700 font-bold">{selectedSubtype}</strong> ({filteredDemands.length} encontrada{filteredDemands.length !== 1 ? 's' : ''})
            </p>
          </div>
          {onGenerateReportForSubtype && (
            <button
              onClick={() => onGenerateReportForSubtype(selectedSubtype, selectedType !== 'ALL' ? selectedType : undefined)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer shrink-0"
              title={`Gerar relatório PDF só de ${selectedSubtype}`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Gerar Relatório de {selectedSubtype}</span>
            </button>
          )}
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-600">
          {filteredDemands.length} demanda(s) encontrada(s)
        </span>
        <button
          onClick={onAddNewDemand}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Inserir Nova Demanda
        </button>
      </div>

      {/* List of Demands */}
      <div className="space-y-3">
        {filteredDemands.length > 0 ? (
          filteredDemands.map((demand) => {
            const isObras = demand.type === 'Obras';

            return (
              <div
                key={demand.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition"
              >
                {/* Card Header: Unit Link & Badges */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <button
                      onClick={() => onSelectUnit(demand.unitId)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 text-left line-clamp-1 cursor-pointer"
                      title="Clique para ver o registro consolidado desta unidade"
                    >
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{demand.unitName}</span>
                    </button>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <button
                        onClick={() => {
                          setSelectedSubtype(demand.subtype);
                          setSelectedType(demand.type);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer hover:opacity-80 transition ${
                          isObras
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-blue-100 text-blue-900 border border-blue-300'
                        }`}
                        title={`Filtrar apenas chamados de ${demand.subtype}`}
                      >
                        {isObras ? <HardHat className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                        {demand.type}: {demand.subtype}
                      </button>

                      {onGenerateReportForSubtype && (
                        <button
                          onClick={() => onGenerateReportForSubtype(demand.subtype, demand.type)}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 cursor-pointer bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200"
                          title={`Gerar relatório PDF só de ${demand.subtype}`}
                        >
                          <FileText className="w-3 h-3" />
                          PDF
                        </button>
                      )}

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          demand.priority === 'Alta'
                            ? 'bg-red-100 text-red-700'
                            : demand.priority === 'Média'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {demand.priority}
                      </span>
                    </div>
                  </div>

                  {/* Status selection and actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <select
                      value={demand.status}
                      onChange={(e) => onUpdateStatus(demand.id, e.target.value as DemandStatus)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
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
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer"
                      title="Editar demanda"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteDemand(demand.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition cursor-pointer"
                      title="Excluir demanda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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

                {/* Resolution note if completed */}
                {demand.resolutionNotes && (
                  <div className="mt-2 p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900">
                    <strong className="font-semibold text-emerald-800">Solução Realizada: </strong>
                    {demand.resolutionNotes}
                  </div>
                )}

                {/* Photos */}
                {demand.photos && demand.photos.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-blue-500" />
                        Fotos ({demand.photos.length}/4)
                      </span>
                      <button
                        onClick={() =>
                          onViewPhotos(demand.photos, `${demand.unitName} - ${demand.type}: ${demand.subtype}`)
                        }
                        className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        Ampliar fotos
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {demand.photos.map((photo, idx) => (
                        <div
                          key={photo.id || idx}
                          onClick={() =>
                            onViewPhotos(demand.photos, `${demand.unitName} - ${demand.type}: ${demand.subtype}`)
                          }
                          className="relative rounded-xl overflow-hidden aspect-square bg-slate-100 border border-slate-200 cursor-pointer group shadow-2xs hover:opacity-90 transition"
                        >
                          <img
                            src={photo.dataUrl}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer timestamp */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(demand.createdAt).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(demand.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {demand.completedAt && (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Concluído
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <Filter className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              Nenhuma demanda encontrada para os filtros selecionados.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Experimente alterar os filtros ou clique em &quot;Inserir Nova Demanda&quot;.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

