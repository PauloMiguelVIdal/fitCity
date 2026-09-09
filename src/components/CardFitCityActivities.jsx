// src/components/CardFitCity.jsx
import { useEffect, useRef } from 'react'

const getImageUrl = (nome) => `/imagens/${nome}.png`

// =============================================
// CONFIGURAÇÃO DE RARIDADE - COMPLETA
// =============================================
const RARIDADE_CONFIG = {
  comum:    { label: 'Comum',    stars: 1, cor: '#9CA3AF', corText: '#F3F4F6', corBg: '#1A1A2A', corBorder: '#9CA3AF66', boxShadow: '0 0 20px #9CA3AF22' },
  incomum:  { label: 'Incomum',  stars: 2, cor: '#34D399', corText: '#D1FAE5', corBg: '#0F2A22', corBorder: '#34D39966', boxShadow: '0 0 24px #34D39933' },
  raro:     { label: 'Raro',     stars: 3, cor: '#60A5FA', corText: '#DBEAFE', corBg: '#1A2A4A', corBorder: '#60A5FA66', boxShadow: '0 0 28px #60A5FA33' },
  epico:    { label: 'Épico',    stars: 4, cor: '#C084FC', corText: '#EDE9FE', corBg: '#2D1A4A', corBorder: '#C084FC66', boxShadow: '0 0 32px #C084FC44' },
  lendario: { label: 'Lendário', stars: 5, cor: '#F27405', corText: '#FFE8D0', corBg: '#4A2400', corBorder: '#F2740566', boxShadow: '0 0 40px #F2740544, 0 0 80px #F2740522' },
  eterno:   { label: '∞ Eterno', stars: 6, cor: '#7C3AED', corText: '#C4B5FD', corBg: '#2D0A4E', corBorder: '#7C3AED88', boxShadow: '0 0 40px #7C3AED44, 0 0 80px #7C3AED22' },
}

// =============================================
// FUNDO DE PARTÍCULAS
// =============================================
function StarsCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let width = 0, height = 0, stars = [], frame = 0, raf
    const STAR_COUNT = 24

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (!rect) return
      const dpr = window.devicePixelRatio || 1
      width = rect.width; height = rect.height
      canvas.width = width * dpr; canvas.height = height * dpr
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)
    }

    const createStars = () => {
      stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * width, y: Math.random() * height,
        radius: Math.random() * 1.1 + 0.3, speed: Math.random() * 0.003 + 0.001,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.beginPath()
      for (const s of stars) { ctx.moveTo(s.x + s.radius, s.y); ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2) }
      ctx.fillStyle = 'rgba(200,200,255,0.4)'
      ctx.shadowColor = 'rgba(150,150,255,0.15)'
      ctx.shadowBlur = 3
      ctx.fill()
      ctx.shadowBlur = 0
    }

    const animate = () => {
      frame++
      if (frame % 2 === 0) {
        const t = Date.now() * 0.001
        for (const s of stars) s.opacity = 0.2 + 0.3 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase))
        draw()
      }
      raf = requestAnimationFrame(animate)
    }

    resize(); createStars(); draw(); animate()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, borderRadius: 'inherit' }}
    />
  )
}

// =============================================
// CARD FIT CITY - COM CORES DO SETOR E ÁREA PARA ATIVIDADE
// =============================================
export default function CardFitCityActivities({ 
  nome, 
  raridade = 'comum', 
  quantidade,
  // Cores do setor
  cor1,
  cor2,
  cor3,
  cor4,
  setorLabel,
  // Ícone da atividade (opcional)
  IconAtividade,
  // Dados extras da atividade
  dataAtividade,
  detalheAtividade,
  moedasGanhas,
}) {
  // Pega a configuração base da raridade
  const config = RARIDADE_CONFIG[raridade] ?? RARIDADE_CONFIG.comum

  // Usa as cores do setor para o fundo
  const corBg = cor1 || config.corBg
  const corBgGradient = cor2 || config.corBg
  const corDestaque = cor3 || config.cor
  
  // Usa a cor da raridade para bordas e textos
  const cor = config.cor
  const corText = config.corText
  const corBorder = config.corBorder
  const boxShadow = config.boxShadow

  // Formata a data
  const dataFormatada = dataAtividade 
    ? new Date(dataAtividade).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      })
    : null

  return (
    <div
      className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden flex flex-col items-center justify-between p-4 transition-transform active:scale-95"
      style={{
        background: `linear-gradient(135deg, ${corBg} 0%, ${corBgGradient} 50%, #000 100%)`,
        border: `2px solid ${corBorder}`,
        boxShadow: boxShadow,
      }}
    >
      <StarsCanvas />

      {/* ─── ESPAÇO SUPERIOR (flexível) ─── */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        
        {/* IMAGEM DO EDIFÍCIO - MAIOR */}
        <div
          className="relative z-10 w-[60%] aspect-square rounded-xl flex items-center justify-center"
          style={{ 
            background: `radial-gradient(circle at 30% 30%, ${corBgGradient} 0%, #000 100%)`, 
            border: `1px solid ${corBorder}` 
          }}
        >
          <img
            src={getImageUrl(nome)}
            alt={nome}
            loading="lazy"
            className="w-[75%] h-[75%] object-contain"
            style={{ filter: `drop-shadow(0 0 8px ${cor}88)` }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        </div>

        {/* ESTRELAS - MAIORES */}
        <div 
          className="relative z-10 flex gap-1 mt-2" 
          style={{ color: cor, textShadow: `0 0 8px ${cor}` }}
        >
          {config.stars === 6 ? (
            <span className="text-lg">∞</span>
          ) : (
            '★'.repeat(config.stars).split('').map((star, i) => (
              <span key={i} className="text-base">{star}</span>
            ))
          )}
        </div>

        {/* NOME DO EDIFÍCIO - MAIOR */}
        <div className="relative z-10 text-center mt-1">
          <p className="text-sm font-bold uppercase tracking-wide" style={{ color: corText }}>
            {nome}
          </p>
        </div>
      </div>

      {/* ─── ÁREA DEDICADA PARA INFORMAÇÕES DA ATIVIDADE ─── */}
      <div 
        className="relative z-10 w-full rounded-xl p-3"
        style={{
          background: `rgba(0, 0, 0, 0.5)`,
          border: `1px solid ${corBorder}`,
          backdropFilter: 'blur(6px)',
        }}
      >
        {/* Ícone da atividade + Detalhe - MAIORES */}
        <div className="flex items-center justify-center gap-2.5">
          {IconAtividade && (
            <IconAtividade 
              size={20} 
              className="text-white/80" 
              style={{ filter: `drop-shadow(0 0 8px ${cor}66)` }}
            />
          )}
          {detalheAtividade && (
            <span className="text-xs text-white/80 font-medium">
              {detalheAtividade}
            </span>
          )}
        </div>

        {/* Data + Moedas - MAIORES */}
        <div className="flex items-center justify-center gap-4 mt-1.5">
          {dataFormatada && (
            <span className="text-[10px] text-white/50">
              📅 {dataFormatada}
            </span>
          )}
          {moedasGanhas != null && (
            <span className="flex items-center gap-1 text-sm font-bold text-fitcity-energy">
              +{moedasGanhas} 🪙
            </span>
          )}
        </div>
      </div>
    </div>
  )
}