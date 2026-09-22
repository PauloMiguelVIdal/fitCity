// src/components/ModalGrupos.jsx
import { useState } from 'react'
import {
  X,
  Briefcase,
  Plus,
  Users,
  Copy,
  Check,
  ChevronRight,
} from 'lucide-react'
import { useFitCityStore } from '../store/fitCityStore'

// ============================================================
// MODAL GRUPOS — Lista + Criar + Entrar com código
// ============================================================
export default function ModalGrupos({ onClose }) {
  const [modo, setModo] = useState('lista')   // 'lista' | 'criar' | 'entrar'
  const [nomeNovo, setNomeNovo] = useState('')
  const [codigoEntrar, setCodigoEntrar] = useState('')
  const [copiado, setCopiado] = useState(null)

  const social = useFitCityStore((s) => s.social)
  const grupos = social?.grupos || []

  const handleCriar = () => {
    if (!nomeNovo.trim()) return
    // TODO: ação na store — criar grupo
    console.log('criar grupo:', nomeNovo)
    setNomeNovo('')
    setModo('lista')
  }

  const handleEntrar = () => {
    if (!codigoEntrar.trim()) return
    // TODO: ação na store — entrar com código
    console.log('entrar grupo:', codigoEntrar)
    setCodigoEntrar('')
    setModo('lista')
  }

  const handleCopiar = (codigo) => {
    try {
      navigator.clipboard.writeText(codigo)
      setCopiado(codigo)
      setTimeout(() => setCopiado(null), 2000)
    } catch { /* noop */ }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-fitcity-bg border-t border-white/10 rounded-t-3xl p-5 pb-3 flex flex-col gap-4 shadow-[0_-15px_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase size={20} className="text-fitcity-energy" />
            Grupos
          </h2>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors"
          >
            <X size={18} className="text-white/70" />
          </button>
        </div>

        {/* BOTÕES DE AÇÃO */}
        {modo === 'lista' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setModo('criar')}
                className="bg-gradient-to-br from-fitcity-energy to-orange-600 rounded-xl p-3 flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(242,116,5,0.4)]"
              >
                <Plus size={16} className="text-white" />
                <span className="text-xs font-bold text-white">Criar grupo</span>
              </button>
              <button
                onClick={() => setModo('entrar')}
                className="bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl p-3 flex items-center justify-center gap-2 transition-colors"
              >
                <Users size={16} className="text-fitcity-energy" />
                <span className="text-xs font-bold text-white">Entrar com código</span>
              </button>
            </div>

            {/* LISTA DE GRUPOS */}
            <div className="flex flex-col gap-2">
              {grupos.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase size={32} className="text-white/20 mx-auto mb-2" />
                  <p className="text-sm text-white/50">Você ainda não está em nenhum grupo.</p>
                  <p className="text-xs text-white/30 mt-1">
                    Crie um ou entre com um código.
                  </p>
                </div>
              ) : (
                grupos.map((grupo) => (
                  <div
                    key={grupo.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fitcity-accent to-fitcity-energy flex items-center justify-center font-bold shrink-0">
                      {(grupo.nome || 'G').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{grupo.nome}</p>
                      <p className="text-[10px] text-white/50 truncate">
                        {grupo.quantidadeMembros || 1} membros · #{grupo.inviteCode}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopiar(grupo.inviteCode)}
                        className="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
                      >
                        {copiado === grupo.inviteCode ? (
                          <Check size={14} className="text-emerald-400" />
                        ) : (
                          <Copy size={14} className="text-white/60" />
                        )}
                      </button>
                      <button
                        onClick={() => console.log('ver grupo', grupo.id)}
                        className="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
                      >
                        <ChevronRight size={14} className="text-white/60" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* CRIAR */}
        {modo === 'criar' && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[10px] font-bold text-fitcity-energy uppercase tracking-wider">
                NOME DO GRUPO
              </label>
              <input
                type="text"
                value={nomeNovo}
                onChange={(e) => setNomeNovo(e.target.value)}
                placeholder="Ex: Galera da Academia"
                className="w-full mt-1 bg-white/5 border-2 border-white/10 rounded-xl px-3 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-fitcity-energy transition-colors"
              />
            </div>

            <div className="bg-purple-700/20 border border-purple-500/30 rounded-xl p-3">
              <p className="text-[11px] text-purple-100/80 leading-relaxed">
                💡 Grupos permitem desafios coletivos, ranking interno e metas compartilhadas.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setModo('lista')}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 text-xs font-bold text-white/70 hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCriar}
                disabled={!nomeNovo.trim()}
                className="flex-1 bg-gradient-to-r from-fitcity-energy to-orange-600 rounded-xl py-3 text-xs font-bold text-white shadow-[0_4px_14px_rgba(242,116,5,0.4)] disabled:opacity-40 transition-all"
              >
                Criar grupo
              </button>
            </div>
          </div>
        )}

        {/* ENTRAR */}
        {modo === 'entrar' && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[10px] font-bold text-fitcity-energy uppercase tracking-wider">
                CÓDIGO DO GRUPO
              </label>
              <input
                type="text"
                value={codigoEntrar}
                onChange={(e) => setCodigoEntrar(e.target.value.toUpperCase())}
                placeholder="Ex: FIT8427"
                className="w-full mt-1 bg-white/5 border-2 border-white/10 rounded-xl px-3 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-fitcity-energy transition-colors tracking-widest font-mono"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setModo('lista')}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 text-xs font-bold text-white/70 hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEntrar}
                disabled={!codigoEntrar.trim()}
                className="flex-1 bg-gradient-to-r from-fitcity-energy to-orange-600 rounded-xl py-3 text-xs font-bold text-white shadow-[0_4px_14px_rgba(242,116,5,0.4)] disabled:opacity-40 transition-all"
              >
                Entrar
              </button>
            </div>
          </div>
        )}

        {/* FOOTER */}
        {modo === 'lista' && (
          <button
            onClick={onClose}
            className="mt-1 bg-gradient-to-r from-fitcity-energy to-orange-600 rounded-2xl py-3.5 font-black text-white text-sm tracking-wider uppercase shadow-[0_10px_25px_rgba(242,116,5,0.45)] transition-all active:scale-[0.98]"
          >
            Fechar
          </button>
        )}
      </div>
    </div>
  )
}