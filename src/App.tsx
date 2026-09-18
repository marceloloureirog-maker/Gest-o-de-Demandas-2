/**
 * Aplicativo Android / PWA para Gerenciamento de Demandas
 * Obras e Logística por Unidade com Registro Fotográfico e Relatórios em PDF
 */

import React, { useState, useEffect } from 'react';
import {
  DemandItem,
  DemandStatus,
  DemandPhoto,
  DemandMainType,
  Unit,
  UnitRecord,
} from './types';
import { storageService } from './services/storage';
import { AndroidHeader } from './components/AndroidHeader';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { DemandsListView } from './components/DemandsListView';
import { UnitsListView } from './components/UnitsListView';
import { UnitDetailView } from './components/UnitDetailView';
import { DemandFormModal } from './components/DemandFormModal';
import { ReportsModal } from './components/ReportsModal';
import { NewUnitModal } from './components/NewUnitModal';
import { PhotoViewerModal } from './components/PhotoViewerModal';
import { Check, Info, FileText } from 'lucide-react';

export default function App() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [demands, setDemands] = useState<DemandItem[]>([]);
  const [activeTab, setActiveTab] = useState<'demandas' | 'unidades' | 'relatorios'>('demandas');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Modals state
  const [isDemandModalOpen, setIsDemandModalOpen] = useState(false);
  const [demandToEdit, setDemandToEdit] = useState<DemandItem | null>(null);
  const [demandInitialUnitId, setDemandInitialUnitId] = useState<string | undefined>(undefined);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportPreselectedUnitId, setReportPreselectedUnitId] = useState<string | undefined>(undefined);
  const [reportPreselectedType, setReportPreselectedType] = useState<'ALL' | DemandMainType | undefined>(undefined);
  const [reportPreselectedSubtype, setReportPreselectedSubtype] = useState<string | undefined>(undefined);

  const [isNewUnitModalOpen, setIsNewUnitModalOpen] = useState(false);

  const [photoViewerState, setPhotoViewerState] = useState<{
    isOpen: boolean;
    photos: DemandPhoto[];
    title: string;
  }>({
    isOpen: false,
    photos: [],
    title: '',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial data from Storage
  const refreshData = () => {
    const loadedUnits = storageService.getUnits();
    const loadedDemands = storageService.getAllDemands();
    setUnits(loadedUnits);
    setDemands(loadedDemands);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Unit master records
  const unitRecords: UnitRecord[] = units.map((unit) => {
    const unitDemands = demands.filter((d) => d.unitId === unit.id);
    const lastUpdated =
      unitDemands.length > 0
        ? unitDemands.reduce(
            (latest, d) => (new Date(d.updatedAt) > new Date(latest) ? d.updatedAt : latest),
            unitDemands[0].updatedAt
          )
        : unit.createdAt;
    return { unit, demands: unitDemands, lastUpdated };
  });

  // Handlers for Demand Form
  const handleOpenNewDemand = (initialUnit?: string) => {
    setDemandToEdit(null);
    setDemandInitialUnitId(initialUnit || (units.length > 0 ? units[0].id : undefined));
    setIsDemandModalOpen(true);
  };

  const handleOpenEditDemand = (demand: DemandItem) => {
    setDemandToEdit(demand);
    setDemandInitialUnitId(demand.unitId);
    setIsDemandModalOpen(true);
  };

  const handleSaveDemand = (
    demandData: Omit<DemandItem, 'id' | 'createdAt' | 'updatedAt' | 'unitName'> & { id?: string }
  ) => {
    const saved = storageService.saveDemand(demandData);
    refreshData();
    setIsDemandModalOpen(false);
    showToast(
      demandData.id
        ? `Demanda de ${saved.unitName} atualizada no registro!`
        : `Nova demanda adicionada ao registro de ${saved.unitName}!`
    );
  };

  const handleDeleteDemand = (demandId: string) => {
    if (window.confirm('Deseja realmente remover esta demanda do registro da unidade?')) {
      storageService.deleteDemand(demandId);
      refreshData();
      showToast('Demanda removida com sucesso.');
    }
  };

  const handleUpdateStatus = (demandId: string, status: DemandStatus, notes?: string) => {
    storageService.updateDemandStatus(demandId, status, notes);
    refreshData();
    showToast(`Status atualizado para "${status}".`);
  };

  // Handlers for Units
  const handleSaveUnit = (unitData: Omit<Unit, 'id' | 'createdAt'>) => {
    const newUnit = storageService.createUnit(unitData);
    refreshData();
    setIsNewUnitModalOpen(false);
    setSelectedUnitId(newUnit.id);
    setActiveTab('unidades');
    showToast(`Unidade "${newUnit.name}" cadastrada com sucesso!`);
  };

  // Handlers for PDF Reports
  const handleOpenReportModal = (
    unitId?: string,
    subtype?: string,
    type?: 'ALL' | DemandMainType
  ) => {
    setReportPreselectedUnitId(unitId || 'ALL');
    setReportPreselectedSubtype(subtype || 'ALL');
    setReportPreselectedType(type || 'ALL');
    setIsReportModalOpen(true);
  };

  // Handler for viewing photos
  const handleViewPhotos = (photos: DemandPhoto[], title: string) => {
    setPhotoViewerState({
      isOpen: true,
      photos,
      title,
    });
  };

  // Reset demo data
  const handleResetData = () => {
    if (window.confirm('Deseja restaurar as unidades e demandas de exemplo iniciais?')) {
      storageService.resetToSampleData();
      refreshData();
      setSelectedUnitId(null);
      showToast('Dados restaurados com sucesso.');
    }
  };

  const selectedUnitRecord = selectedUnitId
    ? unitRecords.find((r) => r.unit.id === selectedUnitId) || null
    : null;

  const totalActiveCount = demands.filter((d) => d.status !== 'Concluído').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans text-slate-900">
      {/* Container simulating high quality mobile Android app or responsive desktop shell */}
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col bg-slate-50 min-h-screen shadow-lg border-x border-slate-200/80 relative">
        {/* Android Header */}
        <AndroidHeader
          currentTab={activeTab}
          onOpenReportModal={() => handleOpenReportModal()}
          onResetData={handleResetData}
          totalActiveCount={totalActiveCount}
        />

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main Application Content Area */}
        <main className="flex-1 p-3 sm:p-5">
          {selectedUnitRecord ? (
            /* Selected Unit's Master Record View */
            <UnitDetailView
              unitRecord={selectedUnitRecord}
              onBack={() => setSelectedUnitId(null)}
              onAddNewDemand={(uId) => handleOpenNewDemand(uId)}
              onEditDemand={handleOpenEditDemand}
              onDeleteDemand={handleDeleteDemand}
              onUpdateStatus={handleUpdateStatus}
              onOpenUnitReport={(uId) => handleOpenReportModal(uId)}
              onViewPhotos={handleViewPhotos}
            />
          ) : activeTab === 'demandas' ? (
            /* Demands Feed View */
            <DemandsListView
              demands={demands}
              onSelectUnit={(uId) => {
                setSelectedUnitId(uId);
                setActiveTab('unidades');
              }}
              onEditDemand={handleOpenEditDemand}
              onDeleteDemand={handleDeleteDemand}
              onUpdateStatus={handleUpdateStatus}
              onViewPhotos={handleViewPhotos}
              onAddNewDemand={() => handleOpenNewDemand()}
              onGenerateReportForSubtype={(subtype, type) =>
                handleOpenReportModal('ALL', subtype, type)
              }
            />
          ) : activeTab === 'unidades' ? (
            /* Units Master Records View */
            <UnitsListView
              unitRecords={unitRecords}
              onSelectUnit={(uId) => setSelectedUnitId(uId)}
              onAddNewDemandToUnit={(uId) => handleOpenNewDemand(uId)}
              onOpenUnitReport={(uId) => handleOpenReportModal(uId)}
              onOpenNewUnitModal={() => setIsNewUnitModalOpen(true)}
            />
          ) : (
            /* Direct Reports Overview */
            <div className="space-y-4 pb-20 animate-in fade-in">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Central de Relatórios em PDF
                    </h2>
                    <p className="text-xs text-slate-500">
                      Emita relatórios consolidados de todas as unidades ou filtrados por tipo e especificidade
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mt-2 mb-4">
                  O relatório em PDF inclui métricas consolidadas, tabela detalhada por unidade com tipo (Obras/Logística), status, prioridade, observações e comprovantes fotográficos anexos.
                </p>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => handleOpenReportModal('ALL')}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    Gerar Relatório Completo (Todas as Unidades)
                  </button>

                  <button
                    onClick={() => {
                      if (units.length > 0) {
                        handleOpenReportModal(units[0].id);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer"
                  >
                    Filtrar por Unidade Específica
                  </button>
                </div>
              </div>

              {/* Specificity Quick Reports (User requested: relatório só das podas, ou só de telhados, só de desinsetização, etc.) */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2.5 px-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Relatórios Diretos por Especificidade do Tipo:
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { name: 'Podas', type: 'Obras' as const, desc: 'Poda de árvores e vegetação' },
                    { name: 'Telhado', type: 'Obras' as const, desc: 'Telhas, calhas e coberturas' },
                    { name: 'Desinsetização', type: 'Logistica' as const, desc: 'Controle de pragas e vetores' },
                    { name: 'Elétrica', type: 'Obras' as const, desc: 'Quadro, disjuntores e fiação' },
                    { name: 'Infiltrações', type: 'Obras' as const, desc: 'Paredes, lajes e vazamentos' },
                    { name: 'Areia', type: 'Logistica' as const, desc: 'Troca de areia de tanques' },
                    { name: 'Banheiros', type: 'Obras' as const, desc: 'Louças, válvulas e encanamento' },
                    { name: 'Parques', type: 'Logistica' as const, desc: 'Brinquedos e manutenção' },
                    { name: 'Segurança Monitorada', type: 'Logistica' as const, desc: 'Câmeras, alarmes e cerca' },
                  ].map((spec) => {
                    const count = demands.filter(
                      (d) => d.subtype.toLowerCase() === spec.name.toLowerCase()
                    ).length;
                    return (
                      <div
                        key={spec.name}
                        onClick={() => handleOpenReportModal('ALL', spec.name, spec.type)}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-xs cursor-pointer transition flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                spec.type === 'Obras'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {spec.type}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500">
                              {count} reg.
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                            Só {spec.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {spec.desc}
                          </p>
                        </div>
                        <div className="mt-2 text-[10px] font-bold text-blue-600 flex items-center gap-1 group-hover:underline">
                          Gerar PDF exclusivo →
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* General Presets by Main Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div
                  onClick={() => {
                    handleOpenReportModal('ALL', 'ALL', 'Obras');
                  }}
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-400 cursor-pointer transition shadow-2xs group"
                >
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                    Todas as Obras
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-2 group-hover:text-blue-600">
                    Demandas de Obras
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Telhados, podas, elétrica, rachaduras, infiltrações e reformas.
                  </p>
                </div>

                <div
                  onClick={() => {
                    handleOpenReportModal('ALL', 'ALL', 'Logistica');
                  }}
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-400 cursor-pointer transition shadow-2xs group"
                >
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    Toda Logística
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-2 group-hover:text-blue-600">
                    Demandas de Logística
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Desinsetização, areia para tanques, parques e segurança monitorada.
                  </p>
                </div>

                <div
                  onClick={() => {
                    handleOpenReportModal('ALL');
                  }}
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-400 cursor-pointer transition shadow-2xs group"
                >
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                    Urgências
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-2 group-hover:text-blue-600">
                    Alta Prioridade
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Relatório exclusivo de chamados pendentes com prioridade alta.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Android Bottom Navigation */}
        <AndroidBottomNav
          currentTab={activeTab}
          onSelectTab={(tab) => {
            setSelectedUnitId(null);
            if (tab === 'relatorios') {
              handleOpenReportModal();
            } else {
              setActiveTab(tab);
            }
          }}
          onOpenNewDemand={() => handleOpenNewDemand(selectedUnitId || undefined)}
        />
      </div>

      {/* --- MODALS --- */}

      {/* 1. Demand Form Modal */}
      {isDemandModalOpen && (
        <DemandFormModal
          units={units}
          initialUnitId={demandInitialUnitId}
          demandToEdit={demandToEdit}
          onClose={() => setIsDemandModalOpen(false)}
          onSave={handleSaveDemand}
          onOpenNewUnitModal={() => setIsNewUnitModalOpen(true)}
        />
      )}

      {/* 2. PDF Reports Generator Modal */}
      {isReportModalOpen && (
        <ReportsModal
          units={units}
          allDemands={demands}
          preselectedUnitId={reportPreselectedUnitId}
          preselectedType={reportPreselectedType}
          preselectedSubtype={reportPreselectedSubtype}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* 3. New Unit Modal */}
      {isNewUnitModalOpen && (
        <NewUnitModal
          onClose={() => setIsNewUnitModalOpen(false)}
          onSave={handleSaveUnit}
        />
      )}

      {/* 4. Full-screen Photo Viewer */}
      {photoViewerState.isOpen && (
        <PhotoViewerModal
          photos={photoViewerState.photos}
          title={photoViewerState.title}
          onClose={() => setPhotoViewerState({ isOpen: false, photos: [], title: '' })}
        />
      )}
    </div>
  );
}
