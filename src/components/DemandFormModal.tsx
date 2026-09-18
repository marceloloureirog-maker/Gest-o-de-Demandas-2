import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  CheckCircle2,
  HardHat,
  Truck,
  Plus,
  Info,
} from 'lucide-react';
import {
  DemandItem,
  DemandMainType,
  DemandPriority,
  DemandStatus,
  DemandPhoto,
  OBRAS_SUBTYPES,
  LOGISTICA_SUBTYPES,
  Unit,
} from '../types';
import { compressImageFile } from '../services/imageUtils';

interface DemandFormModalProps {
  units: Unit[];
  initialUnitId?: string;
  demandToEdit?: DemandItem | null;
  onClose: () => void;
  onSave: (demandData: Omit<DemandItem, 'id' | 'createdAt' | 'updatedAt' | 'unitName'> & { id?: string }) => void;
  onOpenNewUnitModal?: () => void;
}

export const DemandFormModal: React.FC<DemandFormModalProps> = ({
  units,
  initialUnitId,
  demandToEdit,
  onClose,
  onSave,
  onOpenNewUnitModal,
}) => {
  const isEditing = !!demandToEdit;

  // Selected Unit
  const [unitId, setUnitId] = useState<string>(
    demandToEdit ? demandToEdit.unitId : initialUnitId || (units[0]?.id ?? '')
  );

  // Main type: Obras or Logistica
  const [type, setType] = useState<DemandMainType>(demandToEdit ? demandToEdit.type : 'Obras');

  // Subtype logic
  const isInitialCustom =
    demandToEdit?.isCustomSubtype ||
    (demandToEdit &&
      !OBRAS_SUBTYPES.includes(demandToEdit.subtype as any) &&
      !LOGISTICA_SUBTYPES.includes(demandToEdit.subtype as any));

  const [subtype, setSubtype] = useState<string>(
    demandToEdit ? (isInitialCustom ? 'Outros' : demandToEdit.subtype) : OBRAS_SUBTYPES[0]
  );
  const [customSubtypeText, setCustomSubtypeText] = useState<string>(
    isInitialCustom && demandToEdit ? demandToEdit.subtype : ''
  );

  // Priority and Status
  const [priority, setPriority] = useState<DemandPriority>(demandToEdit ? demandToEdit.priority : 'Alta');
  const [status, setStatus] = useState<DemandStatus>(demandToEdit ? demandToEdit.status : 'Pendente');

  // Description & Location
  const [description, setDescription] = useState(demandToEdit ? demandToEdit.description : '');
  const [locationDetails, setLocationDetails] = useState(demandToEdit?.locationDetails || '');
  const [resolutionNotes, setResolutionNotes] = useState(demandToEdit?.resolutionNotes || '');

  // Photos: up to 4
  const [photos, setPhotos] = useState<DemandPhoto[]>(demandToEdit ? [...demandToEdit.photos] : []);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [error, setError] = useState('');

  // Hidden file inputs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const currentSubtypeList = type === 'Obras' ? OBRAS_SUBTYPES : LOGISTICA_SUBTYPES;

  // Handle change of type
  const handleTypeChange = (newType: DemandMainType) => {
    setType(newType);
    if (newType === 'Obras') {
      setSubtype(OBRAS_SUBTYPES[0]);
    } else {
      setSubtype(LOGISTICA_SUBTYPES[0]);
    }
    setCustomSubtypeText('');
  };

  // Handle photo additions (from camera or gallery)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 4 - photos.length;
    if (remainingSlots <= 0) {
      setError('Limite máximo de 4 fotos por registro atingido.');
      return;
    }

    setIsProcessingPhotos(true);
    setError('');

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const newPhotos: DemandPhoto[] = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      try {
        const compressedBase64 = await compressImageFile(file, 1200, 1200, 0.75);
        newPhotos.push({
          id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          dataUrl: compressedBase64,
          name: file.name || `Foto ${photos.length + i + 1}`,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Erro ao processar foto:', err);
      }
    }

    setPhotos((prev) => [...prev, ...newPhotos]);
    setIsProcessingPhotos(false);

    // Reset input
    if (e.target) e.target.value = '';
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!unitId) {
      setError('Selecione uma unidade para vincular ao registro.');
      return;
    }

    if (!description.trim()) {
      setError('Por favor, informe uma descrição para a demanda.');
      return;
    }

    const finalSubtype = subtype === 'Outros' ? (customSubtypeText.trim() || 'Outros') : subtype;

    onSave({
      id: demandToEdit ? demandToEdit.id : undefined,
      unitId,
      type,
      subtype: finalSubtype,
      isCustomSubtype: subtype === 'Outros',
      priority,
      status,
      description: description.trim(),
      locationDetails: locationDetails.trim() || undefined,
      resolutionNotes: resolutionNotes.trim() || undefined,
      photos,
    });
  };

  const selectedUnit = units.find((u) => u.id === unitId);

  return (
    <div
      id="modal-demand-form"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white shrink-0">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {type === 'Obras' ? (
                <HardHat className="w-5 h-5 text-amber-400" />
              ) : (
                <Truck className="w-5 h-5 text-blue-400" />
              )}
              {isEditing ? 'Atualizar Demanda da Unidade' : 'Inserir Nova Demanda'}
            </h2>
            <p className="text-xs text-slate-400">
              {isEditing
                ? 'Atualiza o registro mestre consolidado da unidade'
                : 'Adiciona ao registro consolidado da unidade selecionada'}
            </p>
          </div>
          <button
            id="btn-close-demand-form"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Banner */}
        <div className="bg-blue-50/80 px-4 py-2.5 border-b border-blue-100 flex items-start gap-2 text-xs text-blue-900 shrink-0">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            {selectedUnit
              ? `Registro vinculado a: ${selectedUnit.name}. Todas as demandas desta unidade compõem seu histórico único.`
              : 'Selecione a unidade para atualizar seu histórico único de demandas.'}
          </span>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Unidade */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Unidade *
              </label>
              {onOpenNewUnitModal && (
                <button
                  type="button"
                  onClick={onOpenNewUnitModal}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nova Unidade
                </button>
              )}
            </div>
            <select
              id="select-unit-id"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.code ? `(${u.code})` : ''} - {u.region || 'Geral'}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Tipo da Demanda: Obras vs Logística */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
              Tipo Principal *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-type-obras"
                onClick={() => handleTypeChange('Obras')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs border transition cursor-pointer ${
                  type === 'Obras'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm ring-2 ring-amber-400/40'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <HardHat className="w-4 h-4" />
                Obras & Infraestrutura
              </button>

              <button
                type="button"
                id="btn-type-logistica"
                onClick={() => handleTypeChange('Logistica')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs border transition cursor-pointer ${
                  type === 'Logistica'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm ring-2 ring-blue-500/40'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-4 h-4" />
                Logística & Serviços
              </button>
            </div>
          </div>

          {/* 3. Subtipo da Demanda */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
              Categoria / Subtipo ({type}) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {currentSubtypeList.map((item) => {
                const isSelected = subtype === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSubtype(item)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition truncate cursor-pointer ${
                      isSelected
                        ? type === 'Obras'
                          ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold'
                          : 'bg-blue-100 text-blue-900 border-blue-400 font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            {/* Custom subtype text if 'Outros' is selected */}
            {subtype === 'Outros' && (
              <div className="mt-2 animate-in fade-in">
                <input
                  type="text"
                  id="input-custom-subtype"
                  placeholder={`Especifique o tipo de ${type.toLowerCase()} (ex: Calçamento, Pintura externa, etc.)`}
                  value={customSubtypeText}
                  onChange={(e) => setCustomSubtypeText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-blue-300 bg-blue-50/40 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* 4. Prioridade & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                Nível de Prioridade *
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['Alta', 'Média', 'Baixa'] as DemandPriority[]).map((p) => {
                  const isSelected = priority === p;
                  const colorClasses =
                    p === 'Alta'
                      ? isSelected
                        ? 'bg-red-600 text-white border-red-700'
                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      : p === 'Média'
                      ? isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-600'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      : isSelected
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 px-1.5 text-center text-xs font-bold rounded-lg border transition cursor-pointer ${colorClasses}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                Status *
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['Pendente', 'Em andamento', 'Concluído'] as DemandStatus[]).map((st) => {
                  const isSelected = status === st;
                  const colorClasses =
                    st === 'Pendente'
                      ? isSelected
                        ? 'bg-rose-600 text-white border-rose-700'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      : st === 'Em andamento'
                      ? isSelected
                        ? 'bg-amber-600 text-white border-amber-700'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      : isSelected
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';

                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`py-2 px-1 text-center text-xs font-bold rounded-lg border transition cursor-pointer truncate ${colorClasses}`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. Descrição Detalhada e Localização */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
              Descrição da Demanda *
            </label>
            <textarea
              id="textarea-demand-desc"
              rows={3}
              placeholder="Descreva a necessidade detalhada, impacto, urgência ou especificações..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError('');
              }}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Setor / Localização na Unidade (opcional)
            </label>
            <input
              type="text"
              id="input-location-details"
              placeholder="Ex: Bloco Pedagógico - Banheiro 2, Pátio dos Fundos, Telhado do Refeitório..."
              value={locationDetails}
              onChange={(e) => setLocationDetails(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* If Concluído: Notes on completion */}
          {status === 'Concluído' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 animate-in fade-in">
              <label className="block text-xs font-bold text-emerald-800">
                Observações de Conclusão / Solução Realizada
              </label>
              <textarea
                rows={2}
                placeholder="Detalhes de como a demanda foi atendida, profissional responsável ou data de execução..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* 6. Fotos do Registro (Até 4 Fotos - Câmera ou Galeria) */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Fotos da Demanda ({photos.length}/4)
                </label>
                <p className="text-[11px] text-slate-500">
                  Diretamente da câmera do celular ou da galeria de fotos
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Máx. 4
              </span>
            </div>

            {/* Hidden file inputs for Camera and Gallery */}
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              type="file"
              ref={galleryInputRef}
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Action Buttons: Camera & Gallery */}
            {photos.length < 4 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  id="btn-take-camera-photo"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isProcessingPhotos}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>Tirar com Câmera</span>
                </button>

                <button
                  type="button"
                  id="btn-pick-gallery-photos"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={isProcessingPhotos}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Galeria / Arquivo</span>
                </button>
              </div>
            )}

            {isProcessingPhotos && (
              <div className="text-center py-2 text-xs text-blue-600 font-medium">
                Otimizando e comprimindo imagem...
              </div>
            )}

            {/* Thumbnails of attached photos */}
            {photos.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {photos.map((photo, idx) => (
                  <div
                    key={photo.id || idx}
                    className="relative rounded-xl overflow-hidden aspect-square border border-slate-200 bg-slate-100 group shadow-xs"
                  >
                    <img
                      src={photo.dataUrl}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md transition active:scale-90"
                      title="Excluir foto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white text-center py-0.5">
                      Foto {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-500">
                Nenhuma foto anexada ainda. Use a câmera ou galeria para registrar evidências.
              </div>
            )}
          </div>

          {/* Footer Submit Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-save-demand"
              disabled={isProcessingPhotos}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isEditing ? 'Salvar Alterações' : 'Salvar no Registro da Unidade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
