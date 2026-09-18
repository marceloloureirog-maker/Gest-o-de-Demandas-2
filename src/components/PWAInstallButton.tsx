import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        id="btn-install-pwa-android"
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
        title="Instalar aplicativo no seu celular Android"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          id="btn-install-pwa-ios"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium transition cursor-pointer"
        >
          <Download className="w-3 h-3" />
          <span>Instalar</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  Instalar no Celular
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Para instalar como aplicativo direto na sua tela inicial:
              </p>
              <ol className="mt-3 text-xs text-slate-700 space-y-2 list-decimal list-inside bg-slate-50 p-3 rounded-xl border border-slate-200">
                <li>Toque no botão <strong>Compartilhar</strong> no navegador.</li>
                <li>Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</li>
                <li>Confirme em <strong>Adicionar</strong>.</li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
