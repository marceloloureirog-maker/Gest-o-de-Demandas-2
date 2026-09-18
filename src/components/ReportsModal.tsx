import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Download,
  Filter,
  CheckCircle2,
  Building2,
  Calendar,
  Layers,
  Check,
  Tag,
  Sparkles,
  HardHat,
  Truck,
} from 'lucide-react';
import {
  DemandItem,
  DemandMainType,
  DemandPriority,
  DemandStatus,
  ReportFilterOptions,
  Unit,
  OBRAS_SUBTYPES,
  LOGISTICA_SUBTYPES,
} from '../types';
import { filterDemands, generateDemandsPdf, downloadPdfBlob } from '../services/pdfGenerator';

interface ReportsModalProps {
  units: Unit[];
  allDemands: DemandItem[];
  preselectedUnitId?: string;
  preselectedType?: 'ALL' | DemandMainType;
  preselectedSubtype?: string;
  onClose: () => void;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  units,
  allDemands,
  preselectedUnitId,
  preselectedType,
  preselectedSubtype,
  onClose,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string>(preselectedUnitId || 'ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | DemandMainType>(preselectedType || 'ALL');
  const [selectedSubtype, setSelectedSubtype] = useState<string>(preselectedSubtype || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | DemandStatus>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<'ALL' | DemandPriority>('ALL');
  const [includePhotos, setIncludePhotos] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Available Subtypes dynamically calculated
  const availableSubtypes = useMemo(() => {
    const list: { subtype: string; type: DemandMainType; count: number }[] = [];
    const added = new Set<string>();

    const candidateSubtypes: { subtype: string; type: DemandMainType }[] =
      selectedType === 'Obras'
        ? OBRAS_SUBTYPES.map((s) => ({ subtype: s as string, type: 'Obras' as DemandMainType }))
        : selectedType === 'Logistica'
        ? LOGISTICA_SUBTYPES.map((s) => ({ subtype: s as string, type: 'Logistica' as DemandMainType }))
        : [
            ...OBRAS_SUBTYPES.map((s) => ({ subtype: s as string, type: 'Obras' as DemandMainType })),
            ...LOGISTICA_SUBTYPES.map((s) => ({ subtype: s as string, type: 'Logistica' as DemandMainType })),
          ];

    allDemands.forEach((d) => {
      if (selectedType === 'ALL' || d.type === selectedType) {
        if (!candidateSubtypes.some((c) => c.subtype.toLowerCase() === d.subtype.toLowerCase())) {
          candidateSubtypes.push({ subtype: d.subtype, type: d.type });
        }
      }
    });

    candidateSubtypes.forEach((item) => {
      if (!added.has(item.subtype.toLowerCase())) {
        added.add(item.subtype.toLowerCase());
        const count = allDemands.filter(
          (d) =>
            (selectedUnitId === 'ALL' || d.unitId === selectedUnitId) &&
            d.subtype.toLowerCase() === item.subtype.toLowerCase()
        ).length;
        list.push({ ...item, count });
      }
    });

    return list.sort((a, b) => a.subtype.localeCompare(b.subtype, 'pt-BR'));
  }, [selectedType, selectedUnitId, allDemands]);

  const filters: ReportFilterOptions = {
    unitId: selectedUnitId,
    type: selectedType,
    subtype: selectedSubtype,
    status: selectedStatus,
    priority: selectedPriority,
    includePhotosInPdf: includePhotos,
  };

  const filteredItems = filterDemands(allDemands, filters);
  const selectedUnit = units.find((u) => u.id === selectedUnitId);

  const handleDownload = async () => {
    setIsGenerating(true);
    setDownloadSuccess(false);

    try {
      const blob = await generateDemandsPdf(filteredItems, filters, selectedUnit);
      const dateStr = new Date().toISOString().split('T')[0];
      const unitSlug = selectedUnit
        ? selectedUnit.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
        : 'todas-unidades';
      const typeSlug = selectedType !== 'ALL' ? `-${selectedType.toLowerCase()}` : '';
      const subtypeSlug =
        selectedSubtype !== 'ALL'
          ? `-${selectedSubtype.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
          : '';
      const filename = `relatorio-demandas-${unitSlug}${typeSlug}${subtypeSlug}-${dateStr}.pdf`;

      downloadPdfBlob(blob, filename);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      id="modal-pdf-reports"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Relatórios em PDF com Filtros</h2>
              <p className="text-xs text-slate-400">
                Gere e exporte relatórios consolidados por unidade, tipo ou especificidade (podas, telhados, etc.)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Configuration Controls */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>Filtros do Relatório</span>
            </div>

            {(selectedSubtype !== 'ALL' || selectedType !== 'ALL' || selectedUnitId !== 'ALL' || selectedStatus !== 'ALL' || selectedPriority !== 'ALL') && (
              <button
                onClick={() => {
                  setSelectedUnitId('ALL');
                  setSelectedType('ALL');
                  setSelectedSubtype('ALL');
                  setSelectedStatus('ALL');
                  setSelectedPriority('ALL');
                }}
                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Redefinir filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Unidade */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Unidade
              </label>
              <select
                id="filter-report-unit"
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">Todas as Unidades ({allDemands.length} demandas)</option>
                {units.map((u) => {
                  const count = allDemands.filter((d) => d.unitId === u.id).length;
                  return (
                    <option key={u.id} value={u.id}>
                      {u.name} ({count} demandas)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Tipo Principal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Tipo Principal
              </label>
              <select
                id="filter-report-type"
                value={selectedType}
                onChange={(e) => {
                  const newType = e.target.value as 'ALL' | DemandMainType;
                  setSelectedType(newType);
                  // Check if current subtype still fits
                  setSelectedSubtype('ALL');
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">Todos os Tipos (Obras e Logística)</option>
                <option value="Obras">Apenas Obras & Infraestrutura</option>
                <option value="Logistica">Apenas Logística & Serviços</option>
              </select>
            </div>

            {/* Especificidade / Subtipo */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  Especificidade do Tipo (Ex: Podas, Telhado, Desinsetização...)
                </span>
                {selectedSubtype !== 'ALL' && (
                  <span className="text-[11px] font-bold text-emerald-600">
                    Filtro específico ativo
                  </span>
                )}
              </label>
              <select
                id="filter-report-subtype"
                value={selectedSubtype}
                onChange={(e) => setSelectedSubtype(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-blue-300 bg-blue-50/50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">
                  Todas as especificidades {selectedType !== 'ALL' ? `de ${selectedType}` : ''}
                </option>
                {availableSubtypes.map((sub) => (
                  <option key={sub.subtype} value={sub.subtype}>
                    {sub.subtype} ({sub.type}) — {sub.count} demanda(s)
                  </option>
                ))}
              </select>

              {/* Quick Specificity Chips */}
              <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                <span className="text-slate-400 font-semibold shrink-0">Atalhos rápidos:</span>
                {[
                  { name: 'Podas', type: 'Obras' as const },
                  { name: 'Telhado', type: 'Obras' as const },
                  { name: 'Desinsetização', type: 'Logistica' as const },
                  { name: 'Areia', type: 'Logistica' as const },
                  { name: 'Elétrica', type: 'Obras' as const },
                  { name: 'Infiltrações', type: 'Obras' as const },
                  { name: 'Parques', type: 'Logistica' as const },
                ].map((preset) => {
                  const isCur = selectedSubtype.toLowerCase() === preset.name.toLowerCase();
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setSelectedSubtype(preset.name);
                        setSelectedType(preset.type);
                      }}
                      className={`px-2 py-0.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                        isCur
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {preset.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status da Demanda
              </label>
              <select
                id="filter-report-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">Todos os Status</option>
                <option value="Pendente">Pendentes</option>
                <option value="Em andamento">Em Andamento</option>
                <option value="Concluído">Concluídos</option>
              </select>
            </div>

            {/* Prioridade */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nível de Prioridade
              </label>
              <select
                id="filter-report-priority"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">Todas as Prioridades</option>
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
          </div>

          {/* Photo Inclusion Checkbox */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                id="checkbox-include-photos"
                checked={includePhotos}
                onChange={(e) => setIncludePhotos(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700">
                Incluir fotos anexadas no PDF (anexo fotográfico comprobatório)
              </span>
            </label>
          </div>

          {/* Live Preview Summary Bar */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                {filteredItems.length === 0
                  ? 'Nenhuma demanda encontrada com estes filtros'
                  : `${filteredItems.length} demanda(s) selecionada(s) para o relatório`}
                {selectedSubtype !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                    Só {selectedSubtype}
                  </span>
                )}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {selectedUnit ? `Unidade: ${selectedUnit.name}` : 'Abrange todas as unidades'}
                {selectedSubtype !== 'ALL' ? ` • Especificidade: ${selectedSubtype}` : ''}
              </p>
            </div>

            {/* Breakdown Chips */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-semibold">
                {filteredItems.filter((i) => i.status === 'Pendente').length} Pendentes
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-semibold">
                {filteredItems.filter((i) => i.status === 'Em andamento').length} Em andamento
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                {filteredItems.filter((i) => i.status === 'Concluído').length} Concluídas
              </span>
            </div>
          </div>

          {/* Preview list of items to be printed */}
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Unidade</th>
                  <th className="py-2 px-2">Tipo / Subtipo</th>
                  <th className="py-2 px-2">Prioridade</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2">Fotos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-medium text-slate-800 truncate max-w-[150px]">
                        {item.unitName}
                      </td>
                      <td className="py-2 px-2">
                        <span className="font-semibold text-slate-700">{item.type}</span>:{' '}
                        <strong className="text-blue-700">{item.subtype}</strong>
                      </td>
                      <td className="py-2 px-2">
                        <span
                          className={`font-semibold ${
                            item.priority === 'Alta'
                              ? 'text-red-600'
                              : item.priority === 'Média'
                              ? 'text-amber-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-2 px-2 font-medium">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            item.status === 'Concluído'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'Em andamento'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-slate-500">
                        {item.photos?.length ? `${item.photos.length} foto(s)` : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Nenhum registro para exportar com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {downloadSuccess && (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" />
                Relatório PDF baixado com sucesso!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white transition cursor-pointer"
            >
              Fechar
            </button>

            <button
              type="button"
              id="btn-download-pdf"
              onClick={handleDownload}
              disabled={filteredItems.length === 0 || isGenerating}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md flex items-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {isGenerating
                ? 'Gerando Documento PDF...'
                : selectedSubtype !== 'ALL'
                ? `Baixar Relatório de ${selectedSubtype} (PDF)`
                : 'Baixar Relatório em PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
