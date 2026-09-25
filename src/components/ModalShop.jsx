// src/components/ModalShop.jsx
import React, { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Coins, ShoppingCart, X } from 'lucide-react'
import logo from '../../public/outrasImagens/logo Joguinho.png'
import PackOpeningOverlay from './Packopeningoverlay'
import { useFitCityStore } from '../store/fitCityStore'

// ─── DETECTAR DISPOSITIVO ──────────────────────────────────────────
function useDeviceDetection() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768
      const landscape = window.innerWidth > window.innerHeight && mobile
      setIsMobile(mobile)
      setIsLandscape(landscape)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    const handleOrientationChange = () => setTimeout(checkDevice, 300)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', checkDevice)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return { isMobile, isLandscape, isDesktop: !isMobile }
}

// ═══════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO DE SETORES (visual)
// ═══════════════════════════════════════════════════════════════════
const SETORES_CONFIG = {
  agricultura: { id: 'agricultura', label: 'Agricultura', cor1: '#003816', cor2: '#1A5E2A', cor3: '#0C9123', cor4: '#4CAF50' },
  tecnologia:  { id: 'tecnologia',  label: 'Tecnologia',  cor1: '#A64B00', cor2: '#D45A00', cor3: '#FF6F00', cor4: '#FF8C42' },
  industria:   { id: 'industria',   label: 'Indústria',   cor1: '#1A1A1A', cor2: '#4D4D4D', cor3: '#808080', cor4: '#B3B3B3' },
  comercio:    { id: 'comercio',    label: 'Comércio',    cor1: '#660000', cor2: '#A31919', cor3: '#E60000', cor4: '#FF4D4D' },
  imobiliario: { id: 'imobiliario', label: 'Imobiliário', cor1: '#000066', cor2: '#1A1A8C', cor3: '#3333CC', cor4: '#6666FF' },
  energia:     { id: 'energia',     label: 'Energia',     cor1: '#665200', cor2: '#A37F19', cor3: '#E6B800', cor4: '#FFD966' },
  outros:      { id: 'outros',      label: 'Outros',      cor1: '#1A1A1A', cor2: '#4D4D4D', cor3: '#808080', cor4: '#B3B3B3' },
}

// ═══════════════════════════════════════════════════════════════════
// RESOLVER CORES DOS PACOTES
// ═══════════════════════════════════════════════════════════════════
const mesclarCores = (setorA, setorB) => {
  const a = SETORES_CONFIG[setorA] || SETORES_CONFIG.outros
  const b = SETORES_CONFIG[setorB] || SETORES_CONFIG.outros
  return { cor1: a.cor1, cor2: b.cor2, cor3: a.cor3, cor4: b.cor4 }
}

const obterCoresPacote = (pacote) => {
  if (!pacote) return { ...SETORES_CONFIG.outros }

  if (pacote.categoria === 'setorial' && Array.isArray(pacote.setoresIds) && pacote.setoresIds.length >= 2) {
    const [setorA, setorB] = pacote.setoresIds
    return { ...pacote, ...mesclarCores(setorA, setorB), setorA, setorB }
  }

  if (pacote.cor1 || pacote.cor2 || pacote.cor3 || pacote.cor4) {
    return {
      ...pacote,
      cor1: pacote.cor1 || SETORES_CONFIG.outros.cor1,
      cor2: pacote.cor2 || SETORES_CONFIG.outros.cor2,
      cor3: pacote.cor3 || SETORES_CONFIG.outros.cor3,
      cor4: pacote.cor4 || SETORES_CONFIG.outros.cor4,
    }
  }

  const setor = pacote.setorId || pacote.setor || (Array.isArray(pacote.setoresIds) ? pacote.setoresIds[0] : null)
  const config = SETORES_CONFIG[setor] || SETORES_CONFIG.outros
  return { ...pacote, ...config }
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTE VISUAL DO PACOTE (miniatura na lista da loja)
// ═══════════════════════════════════════════════════════════════════
const PacoteVisual = ({ pacote, onClick }) => {
  const tema = {
    cor1: pacote.cor1 || '#ffffff',
    cor2: pacote.cor2 || '#3e3a44',
    cor3: pacote.cor3 || '#fde4ce',
    cor4: pacote.cor4 || '#1f014e',
  }

  const packGradient = `linear-gradient(160deg, ${tema.cor1} 0%, ${tema.cor2} 25%, ${tema.cor3} 50%, ${tema.cor2} 75%, ${tema.cor1} 100%)`
  const metallicSheen = `linear-gradient(135deg, transparent 0%, ${tema.cor4}15 30%, ${tema.cor4}30 50%, ${tema.cor4}15 70%, transparent 100%)`
  const logoSizePercent = '45%'

  return (
    <motion.div
      className="relative w-full aspect-[3/4] rounded-lg flex flex-col items-center justify-center shadow-md border border-white/10 overflow-hidden transition-transform group-active:scale-95"
      style={{ cursor: 'pointer', perspective: 1200 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <motion.div
        style={{
          position: 'absolute', inset: '-15%', borderRadius: '30px',
          background: `radial-gradient(circle at 50% 40%, ${tema.cor4}44, ${tema.cor4}11 60%, transparent 80%)`,
          filter: 'blur(15px)', opacity: 0.4, pointerEvents: 'none',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div style={{ position: 'absolute', inset: 0, borderRadius: 8, background: packGradient, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 8,
          backgroundImage: `repeating-linear-gradient(0deg, ${tema.cor4}06 0px, ${tema.cor4}06 1px, transparent 1px, transparent 5px), repeating-linear-gradient(90deg, ${tema.cor4}04 0px, ${tema.cor4}04 1px, transparent 1px, transparent 5px)`,
        }} />
        <motion.div
          style={{ position: 'absolute', inset: 0, borderRadius: 8, background: metallicSheen }}
          animate={{ x: [-30, 30, -30], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <div style={{
        position: 'relative', width: logoSizePercent, aspectRatio: '1/1',
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${tema.cor2} 0%, ${tema.cor1} 80%, ${tema.cor3} 100%)`,
        border: `2px solid ${tema.cor4}88`,
        boxShadow: `inset 0 -8px 20px rgba(0,0,0,0.2), 0 8px 30px ${tema.cor4}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
      }}>
        <img
          src={logo}
          className="rounded-full"
          alt="Logo"
          style={{ width: '75%', height: '75%', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
        />
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
export const ModalShop = ({ onCancelar }) => {
  const { isMobile } = useDeviceDetection()

  // ─── Store ───
  const saldo = useFitCityStore((s) => s.economia.saldo)
  const pacotes = useFitCityStore((s) => s.catalogo.pacotes)
  const catalogoCartas = useFitCityStore((s) => s.catalogo.cartas)
  const comprarPacote = useFitCityStore((s) => s.comprarPacote)

  const [erro, setErro] = useState('')
  const [pacoteAbrindo, setPacoteAbrindo] = useState(null)

  // ─── Comprar e abrir pacote ───
  const comprarEAbirPacote = useCallback((pacote) => {
    // 1) Delega o sorteio + débito + inventário para a store
    const resultado = comprarPacote(pacote.id)

    if (!resultado.sucesso) {
      const msg =
        resultado.motivo === 'saldo_insuficiente'
          ? `Saldo insuficiente! Precisa de ${pacote.preco} moedas.`
          : 'Não foi possível comprar o pacote.'
      setErro(msg)
      setTimeout(() => setErro(''), 3000)
      return
    }

    // 2) Enriquece as cartas com dados do catálogo (nome, rank, setor)
    const cartasEnriquecidas = resultado.cartas.map((cartaId) => {
      const carta = catalogoCartas[cartaId]
      if (!carta) return null
      const setor = carta.setor || 'outros'
      return {
        id: carta.id,
        nome: carta.nome,
        rank: carta.rank || 'C',
        raridade: carta.raridade,
        setor,
        setorLabel: SETORES_CONFIG[setor]?.label || setor,
      }
    }).filter(Boolean)

    if (cartasEnriquecidas.length === 0) {
      setErro('Nenhuma carta sorteada.')
      setTimeout(() => setErro(''), 3000)
      return
    }

    // 3) Dispara overlay de abertura
    const pacoteComTema = obterCoresPacote(pacote)
    setPacoteAbrindo({
      nome: pacoteComTema.nome,
      tema: {
        cor1: pacoteComTema.cor1,
        cor2: pacoteComTema.cor2,
        cor3: pacoteComTema.cor3,
        cor4: pacoteComTema.cor4,
      },
      cartas: cartasEnriquecidas,
    })
  }, [comprarPacote, catalogoCartas])

  // ─── Fechar loja inteira ───
  const handleFechar = () => {
    setErro('')
    setPacoteAbrindo(null)
    if (onCancelar) onCancelar()
  }

  // ─── Fechar só o overlay de abertura ───
  const handleFecharAbertura = () => {
    setPacoteAbrindo(null)
  }

  // ═════════════════════════════════════════════════════════════
  // Se um pacote está sendo aberto, renderiza só o overlay.
  // ═════════════════════════════════════════════════════════════
  if (pacoteAbrindo) {
    return (
      <PackOpeningOverlay
        pacoteNome={pacoteAbrindo.nome}
        tema={pacoteAbrindo.tema}
        cartas={pacoteAbrindo.cartas}
        onClose={handleFecharAbertura}
      />
    )
  }

  // ═════════════════════════════════════════════════════════════
  // RENDER DA LOJA
  // ═════════════════════════════════════════════════════════════
  const renderPacotes = () => {
    const principais = pacotes.filter((p) => p.categoria === 'principal')
    const setoriais = pacotes.filter((p) => p.categoria === 'setorial')
    const customizacao = pacotes.filter((p) => p.categoria === 'customizacao')

    const renderSecao = (titulo, listaPacotes, subtitulo = '') => {
      if (listaPacotes.length === 0) return null

      return (
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-white">
            {titulo}
            {subtitulo && (
              <span className="text-[10px] text-white/60 font-normal">{subtitulo}</span>
            )}
          </h3>

          <div className="flex flex-col gap-3">
            {listaPacotes.map((pacote) => {
              const coresPacote = obterCoresPacote(pacote)
              const podeComprar = saldo >= (pacote.preco || 0)

              return (
                <motion.div
                  key={pacote.id}
                  whileHover={!isMobile ? { scale: 1.02, y: -2 } : {}}
                  className="flex items-center gap-3 bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10"
                >
                  <div className="w-16 flex-shrink-0">
                    <PacoteVisual
                      pacote={coresPacote}
                      onClick={() => comprarEAbirPacote(pacote)}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white">{pacote.nome}</p>
                    <p className="text-[11px] text-white/70 leading-tight">
                      {pacote.conteudo || pacote.setores || pacote.descricao}
                    </p>
                    <p className="text-[10px] text-white/50 mt-1 italic">{pacote.descricao}</p>

                    <div className="flex items-center gap-3 mt-2">
                      <p
                        className="text-sm font-bold"
                        style={{ color: podeComprar ? coresPacote.cor4 : '#ef4444' }}
                      >
                        {(pacote.preco || 0).toLocaleString('pt-BR')} Moedas
                      </p>

                      <button
                        onClick={() => comprarEAbirPacote(pacote)}
                        disabled={!podeComprar}
                        className="text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md transition-all active:scale-95 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          background: podeComprar
                            ? `linear-gradient(90deg, ${coresPacote.cor3}, ${coresPacote.cor4})`
                            : 'rgba(255,255,255,0.1)',
                        }}
                      >
                        {podeComprar ? 'COMPRAR' : 'SEM SALDO'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )
    }

    return (
      <div>
        {renderSecao('PACOTES PRINCIPAIS', principais, '(POPULAR)')}
        {renderSecao('PACOTES SETORIAIS', setoriais, '(Cartas direcionadas por área urbana)')}
        {renderSecao('CUSTOMIZAÇÃO & EXPANSÕES', customizacao, '(Exposição dos Prédios e Skins)')}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/10 my-8 bg-gradient-to-br from-[#6411D9] to-[#350973] overflow-hidden"
      >
        <button
          onClick={handleFechar}
          className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-20"
        >
          <X size={20} className="text-white" />
        </button>

        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="flex items-center gap-2">
            <ShoppingCart size={22} className="text-white" />
            <h2 className="text-xl font-bold text-white">LOJA DE PACOTES</h2>
          </div>
          <p className="text-xs text-white/70 text-center">
            Compre pacotes e desbloqueie novas cartas
          </p>
        </div>

        {/* Saldo */}
        <div className="flex items-center justify-between bg-black/20 backdrop-blur-sm rounded-xl p-3 mb-6 border border-white/10">
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-yellow-400" />
            <span className="text-sm font-bold text-white">
              Seu Saldo: {saldo.toLocaleString('pt-BR')} Moedas
            </span>
          </div>
          <button className="bg-gradient-to-r from-orange-500 to-[#F27405] text-xs font-bold px-3 py-1.5 rounded-full text-white shadow-md">
            + MOEDAS
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto pr-1">
          {erro && (
            <div className="mb-2 p-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-center text-xs">
              {erro}
            </div>
          )}
          {renderPacotes()}
        </div>
      </motion.div>
    </div>
  )
}