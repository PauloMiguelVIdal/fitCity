// src/components/RegistrarAtividadeModal.jsx
import { useState } from 'react'
import { X } from 'lucide-react'
import { TIPOS_ATIVIDADE } from '../data/tiposAtividade'
import { calcularMoedas } from '../utils/atividades'

const LABEL_CAMPO = {
  tempo: { label: 'Tempo (min)', placeholder: 'Ex: 45' },
  distancia: { label: 'Distância (km)', placeholder: 'Ex: 8.2' },
  calorias: { label: 'Calorias (kcal)', placeholder: 'Ex: 320' },
}

export default function RegistrarAtividadeModal({ onClose, onSalvar }) {
  const [tipo, setTipo] = useState(null)
  const [valores, setValores] = useState({ tempo: '', distancia: '', calorias: '' })
  const config = tipo ? TIPOS_ATIVIDADE[tipo] : null
  const podeSalvar = tipo && config.campos.every(c => valores[c] !== '')

  const handleSalvar = () => {
    if (!podeSalvar) return
    onSalvar({
      tipo,
      tempo: valores.tempo ? Number(valores.tempo) : null,
      distancia: valores.distancia ? Number(valores.distancia) : null,
      calorias: valores.calorias ? Number(valores.calorias) : null,
      moedas: calcularMoedas(tipo, valores),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-[480px] bg-fitcity-bg border-t border-white/10 rounded-t-3xl p-5 pb-8 flex flex-col gap-4 shadow-[0_-15px_50px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Registrar atividade</h2>
          <button onClick={onClose} className="bg-white/10 rounded-full p-1.5">
            <X size={18} className="text-white/70" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {Object.entries(TIPOS_ATIVIDADE).map(([id, { label, Icon }]) => {
            const ativo = tipo === id
            return (
              <button
                key={id}
                onClick={() => setTipo(id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl p-3 border ${
                  ativo
                    ? 'bg-gradient-to-br from-fitcity-energy to-orange-600 border-transparent shadow-[0_6px_18px_rgba(242,116,5,0.45)]'
                    : 'bg-white/5 border-white/10 text-white/60'
                }`}
              >
                <Icon size={20} className={ativo ? 'text-white' : 'text-fitcity-energy'} />
                <span className="text-[10px] font-medium text-center leading-tight">{label}</span>
              </button>
            )
          })}
        </div>

        {config && (
          <div className="flex flex-col gap-3">
            {config.campos.map(campo => (
              <div key={campo} className="flex flex-col gap-1">
                <label className="text-xs text-white/50">{LABEL_CAMPO[campo].label}</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={valores[campo]}
                  onChange={(e) => setValores(prev => ({ ...prev, [campo]: e.target.value }))}
                  placeholder={LABEL_CAMPO[campo].placeholder}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder:text-white/30 outline-none focus:border-fitcity-energy"
                />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleSalvar}
          disabled={!podeSalvar}
          className="mt-2 bg-gradient-to-r from-fitcity-energy to-orange-600 rounded-2xl py-3.5 font-semibold text-white shadow-[0_10px_25px_rgba(242,116,5,0.45)] disabled:opacity-40 disabled:shadow-none"
        >
          Salvar atividade
        </button>
      </div>
    </div>
  )
}