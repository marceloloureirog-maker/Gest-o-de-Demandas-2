import React, { useState } from 'react';
import { X, Building2, MapPin, User, Phone, Check } from 'lucide-react';
import { Unit } from '../types';

interface NewUnitModalProps {
  onClose: () => void;
  onSave: (unitData: Omit<Unit, 'id' | 'createdAt'>) => void;
}

export const NewUnitModal: React.FC<NewUnitModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [region, setRegion] = useState('');
  const [address, setAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome da unidade.');
      return;
    }

    onSave({
      name: name.trim(),
      code: code.trim() || undefined,
      region: region.trim() || 'Geral',
      address: address.trim() || undefined,
      contactName: contactName.trim() || undefined,
      phone: phone.trim() || undefined,
    });
  };

  return (
    <div
      id="modal-new-unit"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Cadastrar Nova Unidade</h2>
              <p className="text-xs text-slate-400">Escola, CMEI, Almoxarifado ou Unidade</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nome da Unidade *
            </label>
            <input
              type="text"
              id="input-unit-name"
              placeholder="Ex: Escola Municipal Cecília Meireles"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Código / Sigla
              </label>
              <input
                type="text"
                id="input-unit-code"
                placeholder="Ex: EM-15"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Regional / Setor
              </label>
              <input
                type="text"
                id="input-unit-region"
                placeholder="Ex: Regional Norte"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Endereço Completo
            </label>
            <input
              type="text"
              id="input-unit-address"
              placeholder="Rua, número, bairro"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Responsável
              </label>
              <input
                type="text"
                id="input-unit-contact"
                placeholder="Diretor(a) / Coord."
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Telefone
              </label>
              <input
                type="tel"
                id="input-unit-phone"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-submit-unit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              Cadastrar Unidade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
