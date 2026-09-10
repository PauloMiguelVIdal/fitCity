// src/components/CardFitCity.jsx
import { useEffect, useRef, memo,useMemo } from 'react'

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
// FUNDO DE PARTÍCULAS OTIMIZADO
// =============================================
function StarsCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let width = 0, height = 0, stars = [], frame = 0, raf
    const STAR_COUNT = 12 // REDUZIDO de 24 para 12

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (!rect) return
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) // LIMITA DPR
      width = rect.width; height = rect.height
      canvas.width = width * dpr; canvas.height = height * dpr
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)
    }

    const createStars = () => {
      stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * width, y: Math.random() * height,
        radius: Math.random() * 0.8 + 0.2, // MENOR
        speed: Math.random() * 0.002 + 0.001,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.beginPath()
      for (const s of stars) { 
        ctx.moveTo(s.x + s.radius, s.y)
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
      }
      ctx.fillStyle = 'rgba(200,200,255,0.3)'
      ctx.shadowColor = 'rgba(150,150,255,0.1)'
      ctx.shadowBlur = 2
      ctx.fill()
      ctx.shadowBlur = 0
    }

    const animate = () => {
      frame++
      if (frame % 3 === 0) { // REDUZ FPS DE 60 para 20
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
      style={{ 
        position: 'absolute', 
        inset: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none', 
        zIndex: 0, 
        borderRadius: 'inherit',
        opacity: 0.5 // REDUZ OPACIDADE
      }}
    />
  )
}

// =============================================
// CARD FIT CITY - MEMOIZADO
// =============================================
const CardFitCity = memo(function CardFitCity({ 
  nome, 
  raridade = 'comum', 
  quantidade,
  cor1,
  cor2,
  cor3,
  cor4,
  setorLabel,
}) {
  const config = RARIDADE_CONFIG[raridade] ?? RARIDADE_CONFIG.comum
  const corBg = cor1 || config.corBg
  const corBgGradient = cor2 || config.corBg
  const corDestaque = cor3 || config.cor
  const cor = config.cor
  const corText = config.corText
  const corBorder = config.corBorder
  const boxShadow = config.boxShadow

  // Memoiza a imagem para evitar recarregamentos
  const imageUrl = useMemo(() => getImageUrl(nome), [nome])

  return (
    <div
      className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden flex flex-col items-center justify-between p-3 transition-transform active:scale-95"
      style={{
        background: `linear-gradient(135deg, ${corBg} 0%, ${corBgGradient} 50%, #000 100%)`,
        border: `2px solid ${corBorder}`,
        boxShadow: boxShadow,
        willChange: 'transform', // DICA DE PERFORMANCE
      }}
    >
      <StarsCanvas />

      <div
        className="relative z-10 w-16 h-16 rounded-xl flex items-center justify-center"
        style={{ 
          background: `radial-gradient(circle at 30% 30%, ${corBgGradient} 0%, #000 100%)`, 
          border: `1px solid ${corBorder}` 
        }}
      >
        <img
          src={imageUrl}
          alt={nome}
          loading="lazy"
          decoding="async" // DECODIFICAÇÃO ASSÍNCRONA
          className="w-[70%] h-[70%] object-contain"
          style={{ filter: `drop-shadow(0 0 6px ${cor}88)` }}
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      </div>

      <div className="relative z-10 flex gap-0.5" style={{ color: cor, textShadow: `0 0 6px ${cor}` }}>
        {config.stars === 6 ? '∞' : '★'.repeat(config.stars)}
      </div>

      <div className="relative z-10 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: corText }}>
          {nome}
        </p>
        {quantidade != null && (
          <p className="text-[9px] text-white/50 mt-0.5">x{quantidade}</p>
        )}
      </div>
    </div>
  )
})

export default CardFitCity