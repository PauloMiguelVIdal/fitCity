// src/components/MapWorldActivities.jsx
// 🔥 Componente PURO DE RENDERIZAÇÃO — toda lógica fica no pai

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import { BuildingModel } from './BuildingModel'
import { resolverModeloSede } from './BuildingModels'
import { useFrame } from '@react-three/fiber'
import { useGraphicsConfig } from './GraphicsConfigContext'
import { Coins, Building2, Move } from 'lucide-react'
import { resolverVisualEdificio } from '../data/edificiosVisual'

const HEX_SIZE = 0.6

const hexToWorld = (hex, size) => ({
  x: size * 1.73 * (hex.q + hex.r / 2),
  z: size * 1.5 * hex.r,
})

// =============================================
// SETOR CONFIG
// =============================================
const SETOR_CONFIG = {
  agricultura:  { label: 'Agricultura', cor1: '#003816', cor2: '#1A5E2A', cor3: '#0C9123', cor4: '#4CAF50' },
  tecnologia:   { label: 'Tecnologia',  cor1: '#A64B00', cor2: '#D45A00', cor3: '#FF6F00', cor4: '#FF8C42' },
  industria:    { label: 'Indústria',   cor1: '#1A1A1A', cor2: '#4D4D4D', cor3: '#808080', cor4: '#B3B3B3' },
  comercio:     { label: 'Comércio',    cor1: '#660000', cor2: '#A31919', cor3: '#E60000', cor4: '#FF4D4D' },
  imobiliario:  { label: 'Imobiliário', cor1: '#000066', cor2: '#1A1A8C', cor3: '#3333CC', cor4: '#6666FF' },
  energia:      { label: 'Energia',     cor1: '#665200', cor2: '#A37F19', cor3: '#E6B800', cor4: '#FFD966' },
  outros:       { label: 'Outros',      cor1: '#111111', cor2: '#333333', cor3: '#555555', cor4: '#888888' },
}

// =============================================
// BADGE DE MOEDAS (coleta diária)
// =============================================
const CoinsBadge = React.memo(({ edificioId, jaColetou, onColetar, yOffset = 1.05 }) => {
  const [coletado, setColetado] = useState(() => !!jaColetou?.(edificioId))

  useEffect(() => {
    setColetado(!!jaColetou?.(edificioId))
  }, [edificioId, jaColetou])

  if (coletado) return null

  const handleClick = (e) => {
    e.stopPropagation()
    setColetado(true)
    onColetar?.(edificioId)
  }

  return (
    <Html
      position={[0, yOffset, 0]}
      center
      distanceFactor={10}
      style={{ pointerEvents: 'none' }}
      zIndexRange={[100, 0]}
    >
      <button
        onClick={handleClick}
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 34,
          height: 34,
          padding: 0,
          borderRadius: '50%',
          border: '1.5px solid #F2C230',
          background: 'linear-gradient(135deg, #FFD966 0%, #F2A900 100%)',
          boxShadow: '0 0 12px rgba(242,194,48,0.85), 0 1px 4px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'transform 0.12s ease',
          transformOrigin: 'center',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.9)' }}
        onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1.15)' }}
        title="Clique para coletar (1x por dia)"
      >
        <Coins size={18} strokeWidth={2.8} color="#3D2800" />
      </button>
    </Html>
  )
})

// =============================================
// CÉU
// =============================================
const SkyDome = React.memo(({ dayProgress, raioMapa }) => {
  const uniforms = useMemo(() => ({
    topColor:    { value: new THREE.Color('#4c2da0') },
    middleColor: { value: new THREE.Color('#F27405') },
    bottomColor: { value: new THREE.Color('#6411D9') },
    uProgress:   { value: 0 },
  }), [])

  useEffect(() => { uniforms.uProgress.value = dayProgress }, [dayProgress, uniforms])

  const tamanhoBase = HEX_SIZE * 1.73 * (raioMapa + 2.5)
  const escalaXZ = tamanhoBase
  const escalaY  = tamanhoBase * 0.75

  return (
    <mesh scale={[escalaXZ, escalaY, escalaXZ]} position={[0, 0.01, 0]}>
      <sphereGeometry args={[1, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <shaderMaterial
        side={THREE.BackSide}
        transparent
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform vec3 topColor;
          uniform vec3 middleColor;
          uniform vec3 bottomColor;
          uniform float uProgress;

          void main() {
            float h = vUv.y;
            vec3 gradient = mix(bottomColor, middleColor, smoothstep(0.0, 0.5, h));
            gradient = mix(gradient, topColor, smoothstep(0.3, 1.0, h));
            float sunset = uProgress * 0.6;
            vec3 sunsetColor = vec3(1.0, 0.4, 0.1);
            gradient = mix(gradient, sunsetColor, sunset * (1.0 - h));
            float alpha = smoothstep(0.0, 0.1, h) * 0.95;
            gl_FragColor = vec4(gradient, alpha);
          }
        `}
      />
    </mesh>
  )
})

// =============================================
// MAR
// =============================================
const Ocean = React.memo(({ raioMapa }) => {
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorBase:   { value: new THREE.Color('#0066cc') },
    uColorDeep:   { value: new THREE.Color('#001a33') },
  }), [])

  useFrame((state) => { uniforms.uTime.value = state.clock.elapsedTime })

  const tamanhoMar = HEX_SIZE * 1.73 * (raioMapa + 2.5)

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
      <circleGeometry args={[tamanhoMar, 64]} />
      <shaderMaterial
        transparent
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform float uTime;
          uniform vec3 uColorBase;
          uniform vec3 uColorDeep;

          void main() {
            vec2 st = vUv * 30.0;
            float wave1 = sin(st.x + uTime * 0.5) * cos(st.y + uTime * 0.3) * 0.5 + 0.5;
            float wave2 = sin(st.y - uTime * 0.4) * cos(st.x - uTime * 0.2) * 0.5 + 0.5;
            float waveStrength = mix(wave1, wave2, 0.5);
            vec3 finalColor = mix(uColorDeep, uColorBase, waveStrength);
            float alpha = mix(0.15, 0.5, waveStrength);
            float dist = distance(vUv, vec2(0.5, 0.5)) * 2.0;
            alpha = mix(alpha, 1.0, smoothstep(0.95, 1.0, dist));
            gl_FragColor = vec4(finalColor, alpha);
          }
        `}
      />
    </mesh>
  )
})

// =============================================
// HEX BASE
// =============================================
const HexBase = React.memo(({
  corTopo = '#5a9e44',
  config = {},
  selected = false,
  hovered = false,
  moveMode = false,
  scaleIn = 1,
}) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + Math.PI / 6
      const v = HEX_SIZE * 1.015
      i === 0 ? s.moveTo(v * Math.cos(angle), v * Math.sin(angle))
              : s.lineTo(v * Math.cos(angle), v * Math.sin(angle))
    }
    s.closePath()
    return s
  }, [])

  const hasShadows = config?.hexShadows ?? true

  return (
    <group scale={scaleIn}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow={hasShadows} receiveShadow={hasShadows}>
        <extrudeGeometry args={[shape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 2 }]} />
        <meshStandardMaterial color="#4a7230" roughness={0.9} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]} receiveShadow={hasShadows}>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color={corTopo} roughness={0.8} metalness={0} />
      </mesh>

      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
          <ringGeometry args={[HEX_SIZE * 0.87, HEX_SIZE * 0.99, 6]} />
          <meshBasicMaterial color="#F27405" transparent opacity={0.95} />
        </mesh>
      )}

      {moveMode && hovered && !selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
          <ringGeometry args={[HEX_SIZE * 0.87, HEX_SIZE * 0.99, 6]} />
          <meshBasicMaterial color="#d4f08a" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
})

// =============================================
// HEX TILE
// =============================================
const HexTile = React.memo(({
  hex,
  building,
  onClick,
  selected,
  moveMode,
  config = {},
  jaColetou,
  onColetarMoeda,
  onHover,
  isHovered,
  isBlocked,
  scaleIn = 1,
}) => {
  const { x, z } = hexToWorld(hex, HEX_SIZE)
  const groupRef = useRef()
  const [targetY, setTargetY] = useState(0)

  useEffect(() => {
    if (selected) setTargetY(0.14)
    else if (isHovered) setTargetY(0.06)
    else setTargetY(0)
  }, [selected, isHovered])

  useFrame(() => {
    if (!groupRef.current) return
    const currentY = groupRef.current.position.y
    const diff = targetY - currentY
    if (Math.abs(diff) > 0.001) {
      groupRef.current.position.y = currentY + diff * 0.15
    } else {
      groupRef.current.position.y = targetY
    }
  })

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    onClick(hex)
  }, [onClick, hex])

  const handleOver = useCallback((e) => {
    e.stopPropagation()
    if (onHover) onHover(`${hex.q},${hex.r}`, true)
  }, [onHover, hex])

  const handleOut = useCallback((e) => {
    e.stopPropagation()
    if (onHover) onHover(`${hex.q},${hex.r}`, false)
  }, [onHover, hex])

  const corTopo = building ? SETOR_CONFIG[building.setor]?.cor3 : undefined

  // ─── Resolve visual direto de edificioNivel + setor ───
  const visual = useMemo(() => {
    if (!building) return null
    return resolverVisualEdificio(building.edificioNivel, building.setor)
  }, [building])

  return (
    <group
      ref={groupRef}
      position={[x, 0, z]}
      onClick={handleClick}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
    >
      <HexBase
        corTopo={corTopo}
        config={config}
        selected={selected}
        hovered={isHovered}
        moveMode={moveMode}
        scaleIn={scaleIn}
      />

{building && visual && (
        <>
          <BuildingModel
            nomeEdificio={visual.nome}
            corFallback={visual.cor4}
            posicaoBase={[0, 0.22, 0]}
            graphicsConfig={config}
          />
          <CoinsBadge
            edificioId={building.id}
            jaColetou={jaColetou}
            yOffset={1.05}
            onColetar={(id) => onColetarMoeda?.(id)}
          />
        </>
      )}

      {moveMode && isHovered && isBlocked && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.22, 0]}>
          <ringGeometry args={[HEX_SIZE * 0.5, HEX_SIZE * 0.65, 6]} />
          <meshBasicMaterial color="#ff2222" transparent opacity={0.75} />
        </mesh>
      )}

      {moveMode && isHovered && !isBlocked && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.22, 0]}>
          <ringGeometry args={[HEX_SIZE * 0.45, HEX_SIZE * 0.58, 6]} />
          <meshBasicMaterial color="#F27405" transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  )
})

// =============================================
// HEX TILE CLUSTER SATELITE
// =============================================
const HexTileClusterSatelite = React.memo(({
  hex, corTopo, modeloId, corFallback, config = {}, edificioDono,
  jaColetou, onColetarMoeda, scaleIn = 1,
}) => {
  const { x, z } = hexToWorld(hex, HEX_SIZE)
  return (
    <group position={[x, 0, z]}>
      <HexBase corTopo={corTopo} config={config} scaleIn={scaleIn} />
      {modeloId != null && (
        <BuildingModel
          nomeEdificio={null}
          corFallback={corFallback || '#888888'}
          posicaoBase={[0, 0.22, 0]}
          _overrideModeloId={modeloId}
          graphicsConfig={config}
        />
      )}
      {edificioDono && (
        <CoinsBadge
          edificioId={edificioDono.id}
          jaColetou={jaColetou}
          yOffset={1.05}
          onColetar={(id) => onColetarMoeda?.(id)}
        />
      )}
    </group>
  )
})

// =============================================
// SEDE
// =============================================
const Sede = React.memo(({ nomeEmpresa, porte, config = {} }) => {
  const sedeConfig = useMemo(() => resolverModeloSede(porte), [porte])

  return (
    <group position={[0, 0, 0]}>
      <HexBase corTopo="#4a7230" config={config} />
      <BuildingModel
        key={`sede-${porte}`}
        nomeEdificio={null}
        corFallback="#888888"
        posicaoBase={[0, 0.22, 0]}
        _overrideConfig={sedeConfig}
        graphicsConfig={config}
      />
    </group>
  )
})

// =============================================
// LUZES
// =============================================
const Lights = React.memo(({ config = {} }) => {
  const hasShadows = config?.shadows ?? true
  const mapSize = config?.shadowMapSize ?? 1024
  const bias = config?.shadowBias ?? -0.001

  return (
    <>
      <directionalLight
        position={[15, 20, 10]}
        intensity={1.5}
        color="#ffffff"
        castShadow={hasShadows}
        shadow-mapSize={[mapSize, mapSize]}
        shadow-bias={bias}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <ambientLight intensity={0.4} color="#ffffff" />
      <pointLight position={[-10, 5, 10]} intensity={0.8} color="#dbb2ff" />
      <hemisphereLight args={['#ffee00', '#ff5500', 0.5]} />
    </>
  )
})

// =============================================
// CONTROLADOR DE ZOOM
// =============================================
const ZoomController = ({ controlsRef, zoomStep = 0.15, onReady }) => {
  const { camera } = useThree()

  useEffect(() => {
    if (onReady) onReady({
      zoomIn: () => {
        const dir = camera.position.clone().normalize()
        const dist = camera.position.length()
        const nova = Math.max(4, dist * (1 - zoomStep))
        camera.position.copy(dir.multiplyScalar(nova))
        controlsRef.current?.update()
      },
      zoomOut: () => {
        const dir = camera.position.clone().normalize()
        const dist = camera.position.length()
        const nova = dist * (1 + zoomStep)
        camera.position.copy(dir.multiplyScalar(nova))
        controlsRef.current?.update()
      },
    })
  }, [camera, controlsRef, zoomStep, onReady])

  return null
}

// =============================================
// MOVE BANNER
// =============================================
const MoveBanner = ({ onCancel }) => (
  <div style={{
    position: 'absolute',
    top: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 80,
    background: 'linear-gradient(135deg,rgba(242,116,5,0.95),rgba(175,78,0,0.95))',
    border: '1.5px solid #F27405',
    boxShadow: '0 0 20px rgba(242,116,5,0.6), 0 4px 12px rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: '10px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontFamily: "'Rajdhani','Segoe UI',sans-serif",
    color: '#fff',
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: '.07em',
    textTransform: 'uppercase',
    pointerEvents: 'auto',
  }}>
    <Move size={16} strokeWidth={2.8} />
    <span>Selecione o destino</span>
    <button
      onClick={onCancel}
      style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.35)',
        borderRadius: 7,
        padding: '4px 11px',
        cursor: 'pointer',
        color: '#fff',
        fontFamily: "'Rajdhani','Segoe UI',sans-serif",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: '.06em',
      }}
    >
      Cancelar
    </button>
  </div>
)

// =============================================
// PAINEL DO EDIFÍCIO SELECIONADO
// =============================================
const PainelSelecionado = ({ building, isFullscreen, onMover, onFechar }) => {
  if (!building) return null
  const cfg = SETOR_CONFIG[building.setor] || SETOR_CONFIG.outros
  const visual = resolverVisualEdificio(building.edificioNivel, building.setor)

  return (
    <div style={{
      position: 'absolute',
      top: 16,
      right: 16,
      zIndex: 75,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      fontFamily: "'Rajdhani','Segoe UI',sans-serif",
      minWidth: 220,
      maxWidth: 260,
      pointerEvents: 'none',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(12,8,28,0.95), rgba(26,14,58,0.95))',
        border: `1.5px solid ${cfg.cor4}88`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.6), 0 0 16px ${cfg.cor3}44`,
        borderRadius: 12,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: `linear-gradient(135deg, ${cfg.cor3} 0%, ${cfg.cor1} 100%)`,
          border: `1px solid ${cfg.cor4}66`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Building2 size={18} strokeWidth={2.5} color="#fff" />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            color: '#fff', fontWeight: 800, fontSize: 13,
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
          }}>
                  {visual?.nome ?? 'Edifício'}

          </div>
          <div style={{
            color: cfg.cor4, fontSize: 10, fontWeight: 700,
            marginTop: 2, letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
      {cfg.label} · Nv {building.edificioNivel}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, pointerEvents: 'auto' }}>
        {isFullscreen ? (
          <button
            onClick={onMover}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 10,
              border: '1px solid #F2C230',
              background: 'linear-gradient(135deg, #F27405 0%, #8B3D00 100%)',
              boxShadow: '0 0 14px rgba(242,116,5,0.5), 0 2px 6px rgba(0,0,0,0.4)',
              color: '#fff',
              fontFamily: "'Rajdhani','Segoe UI',sans-serif",
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <Move size={14} strokeWidth={2.8} />
            Mover
          </button>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 10px',
            borderRadius: 10,
            border: '1px solid rgba(242,116,5,0.45)',
            background: 'rgba(242,116,5,0.12)',
            color: '#FFB060',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.06em',
            textAlign: 'center',
            textTransform: 'uppercase',
          }}>
            ⛶ Entre em fullscreen para mover
          </div>
        )}
        <button
          onClick={onFechar}
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.65)',
            fontFamily: "'Rajdhani','Segoe UI',sans-serif",
            fontWeight: 800,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// =============================================
// 🔥 WRAPPER: hex que anima scale-in durante expansão
// =============================================
const AnimatedHex = React.memo(({ expandindo, ehNovo, children }) => {
  const ref = useRef()
  const startTimeRef = useRef(null)
  const DURACAO = 500

  useFrame(({ clock }) => {
    if (!ref.current) return

    if (!expandindo || !ehNovo) {
      ref.current.scale.setScalar(1)
      return
    }

    if (startTimeRef.current == null) {
      startTimeRef.current = clock.elapsedTime
    }

    const elapsed = (clock.elapsedTime - startTimeRef.current) * 1000
    const t = Math.min(1, elapsed / DURACAO)

    const c1 = 1.70158
    const c3 = c1 + 1
    const eased = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)

    ref.current.scale.setScalar(eased)
  })

  useEffect(() => {
    if (!expandindo) startTimeRef.current = null
  }, [expandindo])

  return <group ref={ref}>{children}</group>
})

// ═════════════════════════════════════════════════════════════
//  🔥 COMPONENTE PÚBLICO — SÓ RENDERIZA O QUE RECEBE
// ═════════════════════════════════════════════════════════════
export default function MapWorldActivities({
  // ─── Dados (vem do pai) ───
  nomeEmpresa = 'Minha Cidade',
  porte,
  raioMapa,
  dayProgress = 0,

  posicoes = {},
  satelites = {},
  tilesToRender = [],
  hexMap,
  edificioPorId,
  chavesAntigas = null,
  expandindo = false,

  // ─── Estado de interação ───
  selectedKey,
  moveMode,
  hoveredKey,
  isFullscreen = false,

  // ─── Handlers ───
  onHexClick,
  onHover,
  onMover,
  onCancelarMove,
  onFecharPainel,
  onColetarMoeda,
  jaColetou,
  onMapReady,
}) {
  const { config: graphicsConfig } = useGraphicsConfig()
  const controlsRef = useRef()
  const zoomApiRef = useRef({ zoomIn: () => {}, zoomOut: () => {} })

  const selectedBuilding = useMemo(() => {
    if (!selectedKey) return null
    const id = posicoes[selectedKey]
    return id ? edificioPorId?.get(id) || null : null
  }, [selectedKey, posicoes, edificioPorId])

  const canvasConfig = useMemo(() => ({
    shadows: graphicsConfig.shadows,
    antialias: graphicsConfig.antialias,
  }), [graphicsConfig])

  const tamanhoMapaMundo = HEX_SIZE * 1.73 * (raioMapa + 2.5)
  const minDistance = 4
  const maxDistance = Math.max(45, tamanhoMapaMundo * 2.2)

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: 20, overflow: 'hidden', backgroundColor: '#350973' }}>

      {selectedBuilding && !moveMode && (
        <PainelSelecionado
          building={selectedBuilding}
          isFullscreen={isFullscreen}
          onMover={onMover}
          onFechar={onFecharPainel}
        />
      )}

      {moveMode && (
        <MoveBanner onCancel={onCancelarMove} />
      )}

      <Canvas
        frameloop={moveMode || hoveredKey || expandindo ? "always" : "demand"}
        shadows={canvasConfig.shadows}
        gl={{
          antialias: canvasConfig.antialias,
          powerPreference: "high-performance",
        }}
        camera={{ position: [6, 6, 6], fov: 26 }}
        onPointerMissed={() => {
          if (!moveMode) onFecharPainel?.()
        }}
        onCreated={() => {
          onMapReady?.()
        }}
      >
        <ZoomController
          controlsRef={controlsRef}
          onReady={(api) => { zoomApiRef.current = api }}
        />

        <SkyDome dayProgress={dayProgress} raioMapa={raioMapa} />

        {graphicsConfig.oceanWaves ? (
          <Ocean raioMapa={raioMapa} />
        ) : (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
            <circleGeometry args={[HEX_SIZE * 1.73 * (raioMapa + 2.5), 32]} />
            <meshStandardMaterial color="#003366" roughness={0.3} metalness={0.1} />
          </mesh>
        )}

        <Lights config={graphicsConfig} />

        <group>
          <Sede nomeEmpresa={nomeEmpresa} porte={porte} config={graphicsConfig} />

          {Object.entries(satelites).map(([key, { corTopo, modeloId, corFallback, edificioDono }]) => {
            if (key === '0,0') return null
            const hex = hexMap?.get(key)
            if (!hex) return null
            return (
              <HexTileClusterSatelite
                key={`sat-${key}`}
                hex={hex}
                corTopo={corTopo}
                modeloId={modeloId}
                corFallback={corFallback}
                config={graphicsConfig}
                edificioDono={edificioDono}
                jaColetou={jaColetou}
                onColetarMoeda={onColetarMoeda}
                scaleIn={1}
              />
            )
          })}

          {tilesToRender.map(({ hex, key }) => {
            const edId = posicoes[key]
            const building = edId ? edificioPorId?.get(edId) || null : null

            const ehNovo = expandindo && chavesAntigas && !chavesAntigas.has(key)
            const scaleIn = ehNovo ? 0 : 1

            return (
              <AnimatedHex
                key={key}
                expandindo={expandindo}
                ehNovo={ehNovo}
              >
                <HexTile
                  hex={hex}
                  building={building}
                  onClick={onHexClick}
                  selected={key === selectedKey}
                  moveMode={moveMode}
                  config={graphicsConfig}
                  jaColetou={jaColetou}
                  onColetarMoeda={onColetarMoeda}
                  onHover={onHover}
                  isHovered={hoveredKey === key}
                  isBlocked={moveMode && hoveredKey === key}
                  scaleIn={scaleIn}
                />
              </AnimatedHex>
            )
          })}
        </group>

        <ContactShadows
          position={[0, 0.02, 0]}
          opacity={graphicsConfig.contactShadowsOpacity}
          scale={graphicsConfig.contactShadowsScale}
          blur={graphicsConfig.contactShadowsBlur}
          color="#1a3a10"
        />

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={!moveMode}
          enableRotate={!moveMode}
          rotateSpeed={0.5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.8}
          minDistance={minDistance}
          maxDistance={maxDistance}
          target={[0, 0, 0]}
          enableDamping={true}
          dampingFactor={0.08}
          autoRotate={graphicsConfig.autoRotate && !moveMode}
          autoRotateSpeed={graphicsConfig.autoRotateSpeed}
        />
      </Canvas>
    </div>
  )
}