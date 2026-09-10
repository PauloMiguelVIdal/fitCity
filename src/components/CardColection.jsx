// src/components/CardFitCity.jsx
import { useEffect, useRef, memo, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

// =============================================
// CONSTANTES E CONFIGURAÇÕES
// =============================================

// CONFIGURAÇÃO DOS SETORES
const SETORES_CONFIG = {
  agricultura: {
    id: "agricultura",
    cor1: "#003816",
    cor2: "#1A5E2A",
    cor3: "#0C9123",
    cor4: "#4CAF50",
    img: "/agricultura.png",
    descLicença: "Com a Licença Global de Agricultura, você terá acesso a cultivos exclusivos..."
  },
  tecnologia: {
    id: "tecnologia",
    cor1: "#A64B00",
    cor2: "#D45A00",
    cor3: "#FF6F00",
    cor4: "#FF8C42",
    img: "/tecnologia.png",
    descLicença: "Com a Licença Global de Tecnologia, você desbloqueia inovações..."
  },
  comercio: {
    id: "comercio",
    cor1: "#660000",
    cor2: "#A31919",
    cor3: "#E60000",
    cor4: "#FF4D4D",
    img: "/comercio.png",
    descLicença: "Com a Licença Global de Comércio, você tem acesso a novos mercados..."
  },
  industria: {
    id: "industria",
    cor1: "#1A1A1A",
    cor2: "#4D4D4D",
    cor3: "#808080",
    cor4: "#B3B3B3",
    img: "/industria.png",
    descLicença: "Com a Licença Global de Indústria, você acessa fábricas avançadas..."
  },
  imobiliario: {
    id: "imobiliario",
    cor1: "#000066",
    cor2: "#1A1A8C",
    cor3: "#3333CC",
    cor4: "#6666FF",
    img: "/imobiliario.png",
    descLicença: "Com a Licença Global Imobiliária, você pode investir em novos terrenos..."
  },
  energia: {
    id: "energia",
    cor1: "#665200",
    cor2: "#A37F19",
    cor3: "#E6B800",
    cor4: "#FFD966",
    img: "/energia.png",
    descLicença: "Com a Licença Global de Energia, você ativa fontes de energia sustentáveis..."
  }
}

// CONFIGURAÇÃO DE RARIDADE
const RARIDADE_CONFIG = {
  comum: { label: 'Comum', stars: 1, cor: '#9CA3AF', corText: '#F3F4F6', corBg: '#1A1A2A', corBorder: '#9CA3AF66', boxShadow: '0 0 20px #9CA3AF22' },
  incomum: { label: 'Incomum', stars: 2, cor: '#34D399', corText: '#D1FAE5', corBg: '#0F2A22', corBorder: '#34D39966', boxShadow: '0 0 24px #34D39933' },
  raro: { label: 'Raro', stars: 3, cor: '#60A5FA', corText: '#DBEAFE', corBg: '#1A2A4A', corBorder: '#60A5FA66', boxShadow: '0 0 28px #60A5FA33' },
  epico: { label: 'Épico', stars: 4, cor: '#C084FC', corText: '#EDE9FE', corBg: '#2D1A4A', corBorder: '#C084FC66', boxShadow: '0 0 32px #C084FC44' },
  lendario: { label: 'Lendário', stars: 5, cor: '#F27405', corText: '#FFE8D0', corBg: '#4A2400', corBorder: '#F2740566', boxShadow: '0 0 40px #F2740544' },
  eterno: { label: '∞ Eterno', stars: 6, cor: '#7C3AED', corText: '#C4B5FD', corBg: '#2D0A4E', corBorder: '#7C3AED88', boxShadow: '0 0 40px #7C3AED44' },
}

// HELPERS
const getImageUrl = (nome) => `/imagens/${nome}.png`

const getRaridade = (custo) => {
  if (custo >= 50_000_000) return "lendario"
  if (custo >= 10_000_000) return "epico"
  if (custo >= 1_000_000) return "raro"
  if (custo >= 500_000) return "incomum"
  return "comum"
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
    const STAR_COUNT = 12

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (!rect) return
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = rect.width; height = rect.height
      canvas.width = width * dpr; canvas.height = height * dpr
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)
    }

    const createStars = () => {
      stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * width, y: Math.random() * height,
        radius: Math.random() * 0.8 + 0.2,
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
      if (frame % 3 === 0) {
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
        opacity: 0.5
      }}
    />
  )
}

// =============================================
// CARD FIT CITY - ADAPTADO
// =============================================
const CardMinimal = memo(function CardFitCity({
  nome = "Edifício",
  setor = "agricultura",
  quantidade = 0,
  custo = 0,
  setorLabel,
  powerUp = { nível1: { quantidadeMínima: 0 }, nível2: { quantidadeMínima: 5 }, nível3: { quantidadeMínima: 25 } },
  categoria = "producao", // "producao", "venda", "estoque", "passiva"
}) {
  // ── SETORES ──────────────────────────────────────────
  const setorInfo = SETORES_CONFIG[setor] || SETORES_CONFIG.agricultura

  // ── RARIDADE ──────────────────────────────────────────
  const raridadeKey = getRaridade(custo)
  const rConfig = RARIDADE_CONFIG[raridadeKey] || RARIDADE_CONFIG.comum

  // ── POWERUP ──────────────────────────────────────────
  const quantidadeMinimaNv2 = powerUp.nível2?.quantidadeMínima || 5
  const quantidadeMinimaNv3 = powerUp.nível3?.quantidadeMínima || 25

  const powerUpSelecionado = quantidade >= quantidadeMinimaNv3
    ? "powerUpNv3"
    : quantidade >= quantidadeMinimaNv2
      ? "powerUpNv2"
      : "powerUpNv1"

  const getCorPowerUp = (pu) => {
    switch (pu) {
      case "powerUpNv1": return "#8F5ADA"
      case "powerUpNv2": return "#6411D9"
      case "powerUpNv3": return "#350973"
      default: return setorInfo.cor2
    }
  }

  const corPowerUpAtual = getCorPowerUp(powerUpSelecionado)

  const gradientLevel = () => {
    if (powerUpSelecionado === "powerUpNv3") return "#FFD700"
    if (powerUpSelecionado === "powerUpNv2") return "#6411D9"
    return setorInfo.cor2
  }

  // ── GRADIENTES DINÂMICOS ────────────────────────────
  const getGradient = useMemo(() => {
    const { cor1, cor2, cor3, cor4 } = setorInfo
    const gradColor = gradientLevel()

    switch (categoria) {
      case "producao":
        return `radial-gradient(circle at 2% 50%, ${cor1}99 0%, ${cor4}FF 40%, ${gradColor}CC 70%, ${cor4}FF 80%, ${cor2}B3 85%, ${cor1}99 92%, ${cor2}B3 98%, ${cor4}FF 100%)`
      case "venda":
        return `radial-gradient(circle at 100% 0%, ${cor1}11 0%, ${gradColor}CC 12%, ${cor4}CC 28%, ${cor3}FF 48%, ${cor3}FF 62%, ${gradColor}99 80%, ${cor1}11 100%)`
      case "estoque":
        return `linear-gradient(190deg, ${gradColor}15 0%, ${cor4}EE 28%, ${cor3}CC 50%, ${cor4}EE 70%, ${cor1}77 100%)`
      case "passiva":
        return `linear-gradient(135deg, ${gradColor}FF 0%, ${cor2}77 15%, ${cor3}BB 35%, ${cor4}FF 52%, ${cor3}99 70%, ${cor1}FF 100%)`
      default:
        return `radial-gradient(circle at center, ${cor3} 0%, rgba(255,255,255,0) 70%)`
    }
  }, [setorInfo, categoria, powerUpSelecionado])

  // ── GRADIENTE DE POWERUP ────────────────────────────
  const getGradientByLevel = useMemo(() => {
    if (powerUpSelecionado === "powerUpNv3") {
      return `linear-gradient(135deg, #7a5500 0%, #b8870b 20%, #F27405 40%, #FFD700 60%, #F27405 80%, #7a5500 100%)`
    }
    if (powerUpSelecionado === "powerUpNv2") {
      return `linear-gradient(135deg, #350973 0%, #6411D9 25%, #8F5ADA 50%, #6411D9 75%, #350973 100%)`
    }
    return `transparent`
  }, [powerUpSelecionado])

  // ── BORDA DINÂMICA ──────────────────────────────────
  const getBordaDinamica = useMemo(() => {
    const { cor1, cor2, cor3 } = setorInfo

    switch (categoria) {
      case "producao":
        return {
          border: `2px solid ${cor1}55`,
          boxShadow: `0 0 0 1px ${cor3}88, ${rConfig.boxShadow}`,
          borderRadius: "25px 10px 25px 10px"
        }
      case "estoque":
        return {
          border: `2px solid ${cor2}`,
          boxShadow: `0 0 0 3px ${cor3}88, ${rConfig.boxShadow}`,
          borderRadius: "20px 20px 20px 20px"
        }
      case "venda":
        return {
          borderRadius: "20px 20px 20px 20px",
          border: `1.5px solid ${cor3}`,
          boxShadow: rConfig.boxShadow
        }
      case "passiva":
        return {
          border: `1px solid ${cor3}55`,
          boxShadow: `0 0 0 1px ${cor1}88, ${rConfig.boxShadow}`,
          borderRadius: "20px 20px 20px 20px"
        }
      default:
        return {
          borderRadius: "20px 20px 20px 20px",
          boxShadow: rConfig.boxShadow
        }
    }
  }, [setorInfo, categoria, rConfig])

  // ── ICONE DA CATEGORIA ──────────────────────────────
  const getIconeCategoria = () => {
    switch (categoria) {
      case "producao": return "🏭"
      case "venda": return "🛒"
      case "estoque": return "📦"
      case "passiva": return "💰"
      default: return "📄"
    }
  }

  // ── IMAGEM ───────────────────────────────────────────
  const imageUrl = useMemo(() => getImageUrl(nome), [nome])

  // ── FLIP STATE ──────────────────────────────────────
  const [flipped, setFlipped] = useState(false)

  const handleMouseEnter = () => setFlipped(true)
  const handleMouseLeave = () => setFlipped(false)

  // ── RENDER ───────────────────────────────────────────
  return (
    <motion.div
      style={{
        background: getGradientByLevel,
        ...getBordaDinamica,
        width: "220px",
        height: "320px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        willChange: 'transform',
      }}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 100, damping: 10 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <StarsCanvas />

      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ── FRENTE DO CARD ── */}
        <div
          className="absolute w-full h-full flex items-center justify-center"
          style={{
            background: getGradient,
            borderRadius: "20px",
            backfaceVisibility: "hidden",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="w-[90%] h-[90%] flex flex-col items-center justify-between py-3 relative z-10">
            {/* Badge de raridade */}
            <div
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 15,
                fontSize: 7,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: ".1em",
                padding: "2px 6px",
                borderRadius: 4,
                background: `${setorInfo.cor1}cc`,
                color: rConfig.cor,
                border: `1px solid ${rConfig.cor}66`
              }}
            >
              {rConfig.label}
            </div>

            {/* Categoria Icon */}
            <div
              style={{
                position: "absolute",
                bottom: 8,
                right: 8,
                zIndex: 15,
                fontSize: 16
              }}
            >
              {getIconeCategoria()}
            </div>

            {/* Box da imagem */}
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${setorInfo.cor1} 0%, ${setorInfo.cor2} 100%)`,
                border: `1px solid ${setorInfo.cor3}66`,
                boxShadow: `0 4px 20px ${setorInfo.cor4}33, inset 0 0 20px ${setorInfo.cor1}88`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <img
                src={imageUrl}
                alt={nome}
                loading="lazy"
                decoding="async"
                className="w-[70%] h-[70%] object-contain"
                style={{
                  filter: `drop-shadow(0 0 8px ${setorInfo.cor4}88)`,
                }}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />

              {/* Estrelas */}
              <div
                style={{
                  position: "absolute",
                  bottom: 5,
                  left: 0,
                  right: 0,
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  fontSize: 8,
                  color: rConfig.cor,
                  textShadow: raridadeKey === "lendario" ? `0 0 6px ${rConfig.cor}` : "none"
                }}
              >
                {rConfig.stars === 6 ? '∞' : '★'.repeat(rConfig.stars)}
              </div>
            </div>

            {/* Divisor */}
            <div
              style={{
                width: "85%",
                height: 1,
                background: `linear-gradient(90deg, transparent, ${setorInfo.cor4}, transparent)`,
                boxShadow:
                  raridadeKey === "lendario" || raridadeKey === "epico"
                    ? `0 0 6px ${setorInfo.cor4}88`
                    : "none"
              }}
            />

            {/* Nome */}
            <h1
              className="text-center text-white"
              style={{
                fontSize: 12,
                lineHeight: 1.3,
                maxWidth: "85%",
                textTransform: "uppercase",
                letterSpacing: ".04em",
                fontWeight: 700,
                textShadow:
                  raridadeKey === "lendario"
                    ? `0 0 10px ${setorInfo.cor4}88, 0 1px 4px #00000088`
                    : `0 1px 6px #00000088`,
                fontFamily: "'Rajdhani', sans-serif"
              }}
            >
              {nome}
            </h1>

            {/* Quantidade e Custo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                justifyContent: "center",
                padding: "4px 0"
              }}
            >
              <div
                style={{
                  padding: "2px 10px",
                  borderRadius: 6,
                  background: setorInfo.cor1,
                  color: setorInfo.cor4,
                  border: `1px solid ${setorInfo.cor3}66`,
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: "'Rajdhani', sans-serif"
                }}
              >
                {quantidade}x
              </div>

              <div
                style={{
                  padding: "2px 10px",
                  borderRadius: 6,
                  background: setorInfo.cor1,
                  color: setorInfo.cor4,
                  border: `1px solid ${setorInfo.cor3}66`,
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: "'Rajdhani', sans-serif"
                }}
              >
                ${custo.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* ── VERSO DO CARD ── */}
        <div
          className="absolute w-full h-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${setorInfo.cor1} 0%, ${setorInfo.cor2} 100%)`,
            borderRadius: "20px",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            padding: "16px",
          }}
        >
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider">
              {setorLabel || setorInfo.id}
            </h3>
            <p className="text-white/80 text-[10px] leading-relaxed">
              {setorInfo.descLicença?.substring(0, 80) + "..." || "Informações do setor"}
            </p>
            <div
              className="mt-2 px-3 py-1 rounded-full"
              style={{
                background: `${setorInfo.cor3}33`,
                border: `1px solid ${setorInfo.cor3}66`
              }}
            >
              <span className="text-[8px] text-white/60 uppercase tracking-wider">
                Power: {powerUpSelecionado === "powerUpNv3" ? "Nível 3 ⚡" :
                  powerUpSelecionado === "powerUpNv2" ? "Nível 2 🔮" : "Nível 1 ✨"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
})

export default CardMinimal