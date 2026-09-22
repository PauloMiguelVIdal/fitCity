// src/components/ModalSocial.jsx
import { useState, useMemo } from 'react'
import {
  X,
  Users,
  UserPlus,
  Check,
  Search,
  Trophy,
  ChevronRight,
} from 'lucide-react'
import { useFitCityStore } from '../store/fitCityStore'

// ============================================================
// MODAL SOCIAL — Amigos + Solicitações + Busca
// ============================================================
export default function ModalSocial({ onClose }) {
  const [aba, setAba] = useState('amigos')   // 'amigos' | 'solicitacoes' | 'buscar'
  const [busca, setBusca] = useState('')

  const social = useFitCityStore((s) => s.social)
  const amigos = social?.amigos || []
  const solicitacoesRecebidas = social?.solicitacoesRecebidas || []

  // ─── Busca mock (futuro: chamar service) ───
  const resultadosBusca = useMemo(() => {
    if (!busca.trim()) return []
    // Mock — futuramente chamar API
    const mock = [
      { id: 'u_1', username: 'maria.fit', nome: 'Maria', nivel: 12, avatarUrl: null },
      { id: 'u_2', username: 'pedro.run', nome: 'Pedro', nivel: 8, avatarUrl: null },
      { id: 'u_3', username: 'lucas.gym', nome: 'Lucas', nivel: 15, avatarUrl: null },
    ]
    return mock.filter((u) =>
      u.username.toLowerCase().includes(busca.toLowerCase()) ||
      u.nome.toLowerCase().includes(busca.toLowerCase())
    )
  }, [busca])

  const handleAceitar = (id) => {
    // TODO: ação na store — aceitar solicitacao
    console.log('aceitar', id)
  }

  const handleRecusar = (id) => {
    // TODO: ação na store — recusar solicitacao
    console.log('recusar', id)
  }

  const handleAdicionar = (id) => {
    // TODO: ação na store — enviar solicitacao
    console.log('adicionar', id)
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
            <Users size={20} className="text-fitcity-energy" />
            Amigos
          </h2>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors"
          >
            <X size={18} className="text-white/70" />
          </button>
        </div>

        {/* ABAS */}
        <div className="flex bg-white/5 border border-white/10 rounded-full p-1">
          {[
            { id: 'amigos', label: `Amigos (${amigos.length})` },
            { id: 'solicitacoes', label: `Solicitações (${solicitacoesRecebidas.length})` },
            { id: 'buscar', label: 'Buscar' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setAba(id)}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition ${
                aba === id
                  ? 'bg-gradient-to-r from-fitcity-energy to-orange-600 shadow-[0_4px_14px_rgba(242,116,5,0.5)]'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* CONTEÚDO — AMIGOS */}
        {aba === 'amigos' && (
          <div className="flex flex-col gap-2">
            {amigos.length === 0 ? (
              <div className="text-center py-8">
                <Users size={32} className="text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/50">Nenhum amigo ainda.</p>
                <p className="text-xs text-white/30 mt-1">
                  Use a aba Buscar pra encontrar outros atletas.
                </p>
              </div>
            ) : (
              amigos.map((amigo) => (
                <div
                  key={amigo.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fitcity-accent to-fitcity-energy flex items-center justify-center font-bold shrink-0">
                    {(amigo.nome || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{amigo.nome || amigo.username}</p>
                    <p className="text-[10px] text-white/50">
                      @{amigo.username} · Nv {amigo.nivel || 1}
                    </p>
                  </div>
                  <button
                    onClick={() => console.log('ver perfil', amigo.id)}
                    className="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    <ChevronRight size={14} className="text-white/60" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* CONTEÚDO — SOLICITAÇÕES */}
        {aba === 'solicitacoes' && (
          <div className="flex flex-col gap-2">
            {solicitacoesRecebidas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-white/50">Nenhuma solicitação pendente.</p>
              </div>
            ) : (
              solicitacoesRecebidas.map((sol) => (
                <div
                  key={sol.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fitcity-accent to-fitcity-energy flex items-center justify-center font-bold shrink-0">
                    {(sol.nome || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{sol.nome || sol.username}</p>
                    <p className="text-[10px] text-white/50">
                      @{sol.username} · Nv {sol.nivel || 1}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleRecusar(sol.id)}
                      className="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
                    >
                      <X size={14} className="text-white/60" />
                    </button>
                    <button
                      onClick={() => handleAceitar(sol.id)}
                      className="bg-gradient-to-br from-fitcity-energy to-orange-600 rounded-lg p-2 shadow-[0_4px_12px_rgba(242,116,5,0.4)]"
                    >
                      <Check size={14} className="text-white" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CONTEÚDO — BUSCAR */}
        {aba === 'buscar' && (
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou @username"
                className="w-full bg-white/5 border-2 border-white/10 rounded-xl pl-10 pr-3 py-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-fitcity-energy transition-colors"
              />
            </div>

            {resultadosBusca.length > 0 && (
              <div className="flex flex-col gap-2">
                {resultadosBusca.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fitcity-accent to-fitcity-energy flex items-center justify-center font-bold shrink-0">
                      {user.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{user.nome}</p>
                      <p className="text-[10px] text-white/50">
                        @{user.username} · Nv {user.nivel}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAdicionar(user.id)}
                      className="bg-gradient-to-br from-fitcity-energy to-orange-600 rounded-lg px-3 py-2 flex items-center gap-1.5 shadow-[0_4px_12px_rgba(242,116,5,0.4)]"
                    >
                      <UserPlus size={12} className="text-white" />
                      <span className="text-[10px] font-bold text-white">Adicionar</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {busca.trim() && resultadosBusca.length === 0 && (
              <p className="text-center text-sm text-white/40 py-6">
                Nenhum usuário encontrado.
              </p>
            )}
          </div>
        )}

        {/* FOOTER */}
        <button
          onClick={onClose}
          className="mt-1 bg-gradient-to-r from-fitcity-energy to-orange-600 rounded-2xl py-3.5 font-black text-white text-sm tracking-wider uppercase shadow-[0_10px_25px_rgba(242,116,5,0.45)] transition-all active:scale-[0.98]"
        >
          Fechar
        </button>
      </div>
    </div>
  )
}