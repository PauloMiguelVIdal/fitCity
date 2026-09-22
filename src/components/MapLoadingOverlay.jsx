// src/components/MapLoadingOverlay.jsx
import { useState, useEffect } from 'react'

const FRASES = [
  'Construindo as fundações…',
  'Erguendo os primeiros edifícios…',
  'Plantando árvores…',
  'Ligando os geradores…',
  'Pavimentando as estradas…',
  'Chamando os cidadãos…',
  'Quase lá…',
]

export default function MapLoadingOverlay({ visible }) {
  const [fraseIdx, setFraseIdx] = useState(0)
  const [progresso, setProgresso] = useState(0)

  // Rotaciona frases a cada 1.4s
  useEffect(() => {
    if (!visible) return
    const interval = setInterval(() => {
      setFraseIdx(prev => (prev + 1) % FRASES.length)
    }, 1400)
    return () => clearInterval(interval)
  }, [visible])

  // Progresso fake que desacelera conforme se aproxima de 90%
  useEffect(() => {
    if (!visible) return
    let p = 0
    const interval = setInterval(() => {
      p += p < 40 ? 4 : p < 70 ? 2 : p < 90 ? 0.8 : 0.2
      setProgresso(Math.min(95, p))
    }, 120)
    return () => clearInterval(interval)
  }, [visible])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 200,
        background: 'linear-gradient(160deg, #350973 0%, #1a0533 60%, #0d0118 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        borderRadius: 'inherit',
        overflow: 'hidden',
        fontFamily: "'Rajdhani','Segoe UI',sans-serif",
      }}
    >
      {/* Estrelinhas cintilantes no fundo */}
      <EstrelasFundo />

      {/* Ícone de cidade sendo construída */}
      <div style={{
        position: 'relative',
        width: 120,
        height: 120,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 6,
      }}>
        {/* Prédios que crescem de baixo pra cima, em loop */}
        {[
          { h: 40, delay: 0, cor: '#4C14A9' },
          { h: 70, delay: 0.15, cor: '#6411D9' },
          { h: 55, delay: 0.3, cor: '#8B3D00' },
          { h: 85, delay: 0.45, cor: '#F27405' },
          { h: 50, delay: 0.6, cor: '#6411D9' },
        ].map((predio, i) => (
          <div
            key={i}
            style={{
              width: 16,
              height: 0,
              background: `linear-gradient(to top, ${predio.cor} 0%, ${predio.cor}80 100%)`,
              borderRadius: 2,
              border: `1px solid ${predio.cor}ff`,
              boxShadow: `0 0 12px ${predio.cor}88`,
              animation: `predioCresce 1.8s ease-in-out infinite alternate`,
              animationDelay: `${predio.delay}s`,
              '--altura-final': `${predio.h}px`,
            }}
          />
        ))}
      </div>

      {/* Texto */}
      <div style={{ textAlign: 'center', padding: '0 32px' }}>
        <p style={{
          color: '#fff',
          fontSize: 16,
          fontWeight: 900,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          textShadow: '0 2px 12px rgba(100,17,217,0.8)',
          marginBottom: 6,
        }}>
          Carregando sua cidade
        </p>
        <p style={{
          color: 'rgba(199,159,255,0.7)',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.05em',
          minHeight: 18,
          transition: 'opacity 0.3s ease',
        }}>
          {FRASES[fraseIdx]}
        </p>
      </div>

      {/* Barra de progresso */}
      <div style={{
        width: 220,
        height: 6,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid rgba(199,159,255,0.2)',
      }}>
        <div style={{
          width: `${progresso}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #6411D9 0%, #F27405 100%)',
          borderRadius: 3,
          transition: 'width 0.2s ease-out',
          boxShadow: '0 0 12px rgba(242,116,5,0.8)',
        }} />
      </div>

      <p style={{
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
      }}>
        {Math.round(progresso)}%
      </p>

      {/* Keyframes */}
      <style>{`
        @keyframes predioCresce {
          0%   { height: 0; opacity: 0.4; }
          50%  { height: var(--altura-final); opacity: 1; }
          100% { height: var(--altura-final); opacity: 1; }
        }
        @keyframes estrelaTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%      { opacity: 0.9; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}

// =============================================
// ESTRELAS DE FUNDO
// =============================================
function EstrelasFundo() {
  // Gera 30 estrelas com posições/tempos aleatórios (mock fixo pra não re-renderizar)
  const estrelas = [
    { top: '8%', left: '12%', delay: 0.1 },
    { top: '15%', left: '78%', delay: 0.4 },
    { top: '22%', left: '32%', delay: 0.7 },
    { top: '10%', left: '55%', delay: 1.1 },
    { top: '35%', left: '88%', delay: 0.2 },
    { top: '42%', left: '18%', delay: 0.6 },
    { top: '30%', left: '62%', delay: 1.3 },
    { top: '50%', left: '45%', delay: 0.9 },
    { top: '60%', left: '82%', delay: 0.3 },
    { top: '68%', left: '22%', delay: 1.5 },
    { top: '75%', left: '68%', delay: 0.5 },
    { top: '82%', left: '38%', delay: 1.2 },
    { top: '88%', left: '75%', delay: 0.8 },
    { top: '18%', left: '8%', delay: 1.0 },
    { top: '55%', left: '5%', delay: 0.4 },
    { top: '72%', left: '92%', delay: 1.4 },
  ]

  return (
    <>
      {estrelas.map((e, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: e.top,
            left: e.left,
            width: 3,
            height: 3,
            borderRadius: '50%',
            background: '#C79FFF',
            boxShadow: '0 0 6px #C79FFF, 0 0 12px rgba(199,159,255,0.5)',
            animation: `estrelaTwinkle 2.4s ease-in-out infinite`,
            animationDelay: `${e.delay}s`,
          }}
        />
      ))}
    </>
  )
}