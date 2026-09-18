import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, Calendar } from 'lucide-react';
import { DemandPhoto } from '../types';

interface PhotoViewerModalProps {
  photos: DemandPhoto[];
  initialIndex?: number;
  onClose: () => void;
  title?: string;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  photos,
  initialIndex = 0,
  onClose,
  title = 'Registro Fotográfico',
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!photos || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      id="modal-photo-viewer"
      className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-black/60 border-b border-white/10 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-semibold text-white truncate max-w-xs">{title}</h3>
            <p className="text-xs text-white/60">
              Foto {currentIndex + 1} de {photos.length}
            </p>
          </div>
        </div>

        <button
          id="btn-close-photo-viewer"
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
          aria-label="Fechar visualizador"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 flex items-center justify-center p-2 sm:p-6 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {photos.length > 1 && (
          <button
            id="btn-photo-prev"
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition active:scale-90"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="max-h-[75vh] max-w-full flex items-center justify-center">
          <img
            src={currentPhoto.dataUrl}
            alt={currentPhoto.name || `Foto ${currentIndex + 1}`}
            className="max-h-[72vh] max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-200"
            referrerPolicy="no-referrer"
          />
        </div>

        {photos.length > 1 && (
          <button
            id="btn-photo-next"
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition active:scale-90"
            aria-label="Próxima foto"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Thumbnails Bottom Bar */}
      <div
        className="px-4 py-3 bg-black/70 border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {photos.map((photo, index) => (
          <button
            key={photo.id || index}
            onClick={() => setCurrentIndex(index)}
            className={`relative rounded-md overflow-hidden h-12 w-16 shrink-0 border-2 transition ${
              index === currentIndex
                ? 'border-blue-500 scale-105 shadow-md ring-2 ring-blue-500/40'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img
              src={photo.dataUrl}
              alt=""
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
