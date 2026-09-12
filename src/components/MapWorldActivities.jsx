// src/components/MapWorldActivities.jsx
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, OrbitControls, Html } from '@react-three/drei'
import { defineHex, Grid, spiral } from 'honeycomb-grid'
import * as THREE from 'three'
import { BuildingModel } from './BuildingModel'
import { resolverModeloSede, MODELOS, EDIFICIO_PARA_MODELO } from './BuildingModels'
import { useFrame } from '@react-three/fiber'
import { useGraphicsConfig } from './GraphicsConfigContext'
import { calcularMoedas } from '../utils/atividades'
import { Coins, TrendingUp, Building2, Move, ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react'

const HEX_SIZE = 0.6

// =============================================
// CONSTANTES
// =============================================
const STORAGE_PREFIX = 'fitcity_moedas_'

// =============================================
// TABELA DE NÍVEIS (atividades/mês → porte + raio)
// =============================================
const TABELA_NIVEIS = [
  { nivel: 1,  porte: 'Micro Empresa',           raio: 3, atvMin: 1  },
  { nivel: 2,  porte: 'Sociedade Limitada',      raio: 3, atvMin: 3  },
  { nivel: 3,  porte: 'Empresa Regional',        raio: 3, atvMin: 7  },
  { nivel: 4,  porte: 'Companhia Local',         raio: 4, atvMin: 12 },
  { nivel: 5,  porte: 'Empresa Estadual',        raio: 5, atvMin: 16 },
  { nivel: 6,  porte: 'Companhia Nacional',      raio: 6, atvMin: 21 },
  { nivel: 7,  porte: 'Corporação Multissetorial', raio: 6, atvMin: 27 },
  { nivel: 8,  porte: 'Grupo Empresarial',       raio: 7, atvMin: 34 },
  { nivel: 9,  porte: 'Conglomerado Global',     raio: 7, atvMin: 42 },
  { nivel: 10, porte: 'Mega Holding',            raio: 8, atvMin: 50 },
]

function calcularNivel(atividadesMes) {
  let resultado = TABELA_NIVEIS[0]
  for (const item of TABELA_NIVEIS) {
    if (atividadesMes >= item.atvMin) resultado = item
    else break
  }
  return resultado
}

function proximoNivel(atividadesMes) {
  const atual = calcularNivel(atividadesMes)
  const idx = TABELA_NIVEIS.findIndex(n => n.nivel === atual.nivel)
  if (idx < 0 || idx >= TABELA_NIVEIS.length - 1) return null
  return TABELA_NIVEIS[idx + 1]
}

// =============================================
// MAPEAMENTO DE EDIFÍCIOS POR NÍVEL DE MOEDAS
// =============================================
const EDIFICIOS_POR_NIVEL = {
  1: { edificios: [{ nome: 'Plantação De Vegetais', setor: 'agricultura' }] },
  2: { edificios: [{ nome: 'Granja De Aves', setor: 'agricultura' }] },
  3: { edificios: [{ nome: 'Fazenda De Vacas', setor: 'agricultura' }] },
  4: { edificios: [{ nome: 'Criação De Ovinos', setor: 'agricultura' }] },
  5: { edificios: [{ nome: 'Cooperativa Agrícola', setor: 'agricultura' }] },
  6: { edificios: [{ nome: 'Centro De Comércio De Plantações', setor: 'agricultura' }] },
}

// =============================================
// MAPEAMENTO DE CORES POR SETOR
// =============================================
const SETOR_CONFIG = {
  agricultura:  { label: 'Agricultura', cor1: '#003816', cor2: '#1A5E2A', cor3: '#0C9123', cor4: '#4CAF50' },
  tecnologia:   { label: 'Tecnologia',  cor1: '#A64B00', cor2: '#D45A00', cor3: '#FF6F00', cor4: '#FF8C42' },
  industria:    { label: 'Indústria',   cor1: '#1A1A1A', cor2: '#4D4D4D', cor3: '#808080', cor4: '#B3B3B3' },
  comercio:     { label: 'Comércio',    cor1: '#660000', cor2: '#A31919', cor3: '#E60000', cor4: '#FF4D4D' },
  imobiliario:  { label: 'Imobiliário', cor1: '#000066', cor2: '#1A1A8C', cor3: '#3333CC', cor4: '#6666FF' },
  energia:      { label: 'Energia',     cor1: '#665200', cor2: '#A37F19', cor3: '#E6B800', cor4: '#FFD966' },
}

// =============================================
// FUNÇÕES AUXILIARES
// =============================================
const getNivelPorMoedas = (moedas) => {
  if (moedas <= 5) return 1
  if (moedas <= 10) return 2
  if (moedas <= 20) return 3
  if (moedas <= 30) return 4
  if (moedas <= 50) return 5
  return 6
}

const escolherEdificioPorNivel = (nivel) => {
  const config = EDIFICIOS_POR_NIVEL[nivel] || EDIFICIOS_POR_NIVEL[1]
  const edificios = config.edificios || EDIFICIOS_POR_NIVEL[1].edificios
  return edificios[Math.floor(Math.random() * edificios.length)]
}

const edificioEhComposto = (() => {
  const cache = new Map()
  return (nomeEdificio) => {
    if (cache.has(nomeEdificio)) return cache.get(nomeEdificio)
    const modeloId = EDIFICIO_PARA_MODELO[nomeEdificio]
    const result = modeloId ? MODELOS[modeloId]?.tipo === 'composto' : false
    cache.set(nomeEdificio, result)
    return result
  }
})()

const edificioEhCluster = (() => {
  const cache = new Map()
  return (nomeEdificio) => {
    if (cache.has(nomeEdificio)) return cache.get(nomeEdificio)
    const modeloId = EDIFICIO_PARA_MODELO[nomeEdificio]
    const result = modeloId ? MODELOS[modeloId]?.tamanho === 7 : false
    cache.set(nomeEdificio, result)
    return result
  }
})()

const HEX_DIRECTIONS = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]]
const vizinhosDeHex = (q, r) => HEX_DIRECTIONS.map(([dq, dr]) => `${q + dq},${r + dr}`)

const hexToWorld = (hex, size) => ({
  x: size * 1.73 * (hex.q + hex.r / 2),
  z: size * 1.5 * hex.r,
})

// =============================================
// HELPERS: moedas
// =============================================
function jaColetou(edificioId) {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(`${STORAGE_PREFIX}${edificioId}`) === '1'
  } catch { return false }
}

function marcarColetado(edificioId) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${edificioId}`, '1')
  } catch {}
}

// =============================================
// BADGE DE MOEDAS
// =============================================
const CoinsBadge = React.memo(({ edificioId, yOffset = 1.05, onColetar }) => {
  const [coletado, setColetado] = useState(() => jaColetou(edificioId))

  if (coletado) return null

  const handleClick = (e) => {
    e.stopPropagation()
    marcarColetado(edificioId)
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
        title="Clique para coletar"
      >
        <Coins size={18} strokeWidth={2.8} color="#3D2800" />
      </button>
    </Html>
  )
})

// =============================================
// CAMADA 1: CÉU
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
// CAMADA 2: MAR
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
// CAMADA 3: HEX BASE
// =============================================
const HexBase = React.memo(({ 
  corTopo = '#5a9e44', 
  config = {},
  selected = false,
  hovered = false,
  moveMode = false,
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
    <group>
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
// HEX TILE — 🔥 agora com "lift" ao selecionar
// =============================================
const HexTile = React.memo(({ 
  hex, 
  building, 
  onClick, 
  selected, 
  moveMode, 
  config = {}, 
  onColetarMoeda,
  onHover,
  isHovered,
  isBlocked,
}) => {
  const { x, z } = hexToWorld(hex, HEX_SIZE)
  const groupRef = useRef()
  const [targetY, setTargetY] = useState(0)
  
  // 🔥 Y alvo: sobe quando selecionado (0.14) ou hovered (0.06)
  useEffect(() => {
    if (selected) setTargetY(0.14)
    else if (isHovered) setTargetY(0.06)
    else setTargetY(0)
  }, [selected, isHovered])

  // 🔥 Animação suave do Y a cada frame
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
      />
      
      {building && (
        <>
          <BuildingModel
            nomeEdificio={building.nome}
            corFallback={SETOR_CONFIG[building.setor]?.cor4 || '#888888'}
            posicaoBase={[0, 0.22, 0]}
            graphicsConfig={config}
          />
          <CoinsBadge
            edificioId={building.id}
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
  hex, corTopo, modeloId, corFallback, config = {}, edificioDono, onColetarMoeda,
}) => {
  const { x, z } = hexToWorld(hex, HEX_SIZE)
  return (
    <group position={[x, 0, z]}>
      <HexBase corTopo={corTopo} config={config} />
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
          yOffset={1.05}
          onColetar={(id) => onColetarMoeda?.(id)}
        />
      )}
    </group>
  )
})

// =============================================
// CAMADA 4: SEDE
// =============================================
const Sede = React.memo(({ nomeEmpresa, porte, config = {} }) => {
  const sedeConfig = useMemo(() => resolverModeloSede(porte), [porte])
  
  return (
    <group position={[0, 0, 0]}>
      <HexBase corTopo="#4a7230" config={config} />
      <BuildingModel
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
// 🔥 CONTROLADOR DE ZOOM (dentro do Canvas)
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
// PAINEL DE PROGRESSO
// =============================================
const PainelProgresso = ({ nivel, porte, raio, atividadesMes, proximo, ultimoNivel }) => {
  const falta = proximo ? Math.max(0, proximo.atvMin - atividadesMes) : 0
  const percentual = proximo
    ? Math.min(100, (atividadesMes / proximo.atvMin) * 100)
    : 100

  return (
    <div style={{
      position: 'absolute',
      bottom: 10,
      left: 10,
      zIndex: 60,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      fontFamily: "'Rajdhani','Segoe UI',sans-serif",
      pointerEvents: 'none',
      minWidth: 240,
      maxWidth: 280,
    }}>
      {proximo && !ultimoNivel && (
        <div style={{
          background: 'rgba(10,6,24,0.85)',
          border: '1px solid rgba(242,116,5,0.4)',
          borderRadius: 10,
          padding: '8px 12px',
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.05em',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#FFB060', fontSize: 10 }}>PRÓX. NV {proximo.nivel}</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>
              {atividadesMes} / {proximo.atvMin}
            </span>
          </div>
          <div style={{
            height: 6,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.1)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${percentual}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #F27405, #FFB060)',
              transition: 'width 0.4s ease',
            }} />
          </div>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>
            faltam <b style={{ color: '#FFB060' }}>{falta}</b> atividade{falta !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {ultimoNivel && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(242,116,5,0.3), rgba(139,61,0,0.3))',
          border: '1.5px solid #F27405',
          borderRadius: 10,
          padding: '6px 12px',
          color: '#FFB060',
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textAlign: 'center',
          textTransform: 'uppercase',
        }}>
          ★ Nível máximo atingido ★
        </div>
      )}
    </div>
  )
}

// =============================================
// 🔥 BANNER DE MOVE MODE
// =============================================
const MoveBanner = ({ onCancel }) => (
  <div style={{
    position: 'absolute',
    top: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 70,
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
// 🔥 PAINEL DE AÇÃO DO EDIFÍCIO SELECIONADO
// =============================================
const PainelSelecionado = ({ building, isFullscreen, onMover, onFechar }) => {
  if (!building) return null
  const cfg = SETOR_CONFIG[building.setor] || SETOR_CONFIG.agricultura

  return (
    <div style={{
      position: 'absolute',
      top: 16,
      right: 16,
      zIndex: 70,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      fontFamily: "'Rajdhani','Segoe UI',sans-serif",
      minWidth: 220,
      maxWidth: 260,
      pointerEvents: 'none',
    }}>
      {/* Card de info */}
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
            {building.nome}
          </div>
          <div style={{
            color: cfg.cor4, fontSize: 10, fontWeight: 700,
            marginTop: 2, letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            {cfg.label}
          </div>
        </div>
      </div>

      {/* Botões de ação */}
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
// TIPOS DE ATIVIDADE PERMITIDOS
// =============================================
const TIPOS_PERMITIDOS = ['corrida', 'musculacao', 'caminhada']

// =============================================
// COMPONENTE PRINCIPAL
// =============================================
export default function MapWorldActivities({ atividades = [], onSelecionarAtividade } = {}) {
  const { config: graphicsConfig } = useGraphicsConfig()

  const nomeEmpresa = 'Minha Cidade'

  const [selectedKey, setSelectedKey] = useState(null)
  const [dayProgress, setDayProgress] = useState(0)
  const [moveMode, setMoveMode] = useState(false)
  const [hoveredKey, setHoveredKey] = useState(null)

  // 🔥 NOVO: detecta fullscreen direto no componente
  const [isFullscreen, setIsFullscreen] = useState(() => {
    if (typeof document === 'undefined') return false
    return !!document.fullscreenElement
  })

  // 🔥 NOVO: refs para controle de zoom externo
  const controlsRef = useRef()
  const zoomApiRef = useRef({ zoomIn: () => {}, zoomOut: () => {} })

  useEffect(() => {
    const handleFsChange = () => {
      const fs = !!document.fullscreenElement
      setIsFullscreen(fs)
      if (!fs) {
        setMoveMode(false)
        setSelectedKey(null)
        setHoveredKey(null)
      }
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  // 🔥 Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
  }, [])

  // 🔥 Zoom handlers (usam a API registrada pelo ZoomController)
  const handleZoomIn  = useCallback(() => zoomApiRef.current.zoomIn(), [])
  const handleZoomOut = useCallback(() => zoomApiRef.current.zoomOut(), [])

  // ── Contador de atividades do mês ──
  const atividadesMes = useMemo(() => {
    return atividades.filter(a => TIPOS_PERMITIDOS.includes(a.tipo)).length
  }, [atividades])

  // ── Nível atual + próximo ──
  const nivelAtual = useMemo(() => calcularNivel(atividadesMes), [atividadesMes])
  const proximo = useMemo(() => proximoNivel(atividadesMes), [atividadesMes])

  const porte = nivelAtual.porte
  const raioMapa = nivelAtual.raio
  const ultimoNivel = !proximo

  // ── Edifícios ativos ──
  const edificiosAtivos = useMemo(() => {
    const atividadesFiltradas = atividades.filter(a => 
      TIPOS_PERMITIDOS.includes(a.tipo)
    )

    return atividadesFiltradas.map((atividade, idx) => {
      const moedas = calcularMoedas(atividade)
      const nivelMoeda = getNivelPorMoedas(moedas)
      const edificio = escolherEdificioPorNivel(nivelMoeda)
      
      return {
        id: atividade.id ?? `atividade-${idx}`,
        nome: edificio.nome,
        setor: edificio.setor,
        atividade,
        moedas,
        nivel: nivelMoeda,
        ehCluster: edificioEhCluster(edificio.nome),
        ehComposto: edificioEhComposto(edificio.nome),
      }
    })
  }, [atividades])

  // ── Hex Grid ──
  const hexGrid = useMemo(() => {
    const Tile = defineHex({ dimensions: HEX_SIZE, orientation: 'pointy' })
    return Array.from(new Grid(Tile, spiral({ center: [0, 0], radius: raioMapa })))
  }, [raioMapa])

  const hexMap = useMemo(() => {
    const map = new Map()
    hexGrid.forEach(h => map.set(`${h.q},${h.r}`, h))
    return map
  }, [hexGrid])

  const edificioPorId = useMemo(() => {
    const map = new Map()
    edificiosAtivos.forEach(e => map.set(e.id, e))
    return map
  }, [edificiosAtivos])

  // ── Posicionamento ──
  const [posicoes, setPosicoes] = useState({})

  useEffect(() => {
    const gridKeys = new Set(hexGrid.map(h => `${h.q},${h.r}`))
    
    const posOcupadas = new Set(['0,0'])
    const novasPosicoes = {}

    const idsAtivos = new Set(edificiosAtivos.map(e => e.id))
    Object.entries(posicoes).forEach(([key, id]) => {
      if (key === '0,0') return
      
      if (idsAtivos.has(id)) {
        novasPosicoes[key] = id
        posOcupadas.add(key)
        const ed = edificioPorId.get(id)
        if (ed?.ehCluster) {
          const [q, r] = key.split(',').map(Number)
          vizinhosDeHex(q, r).forEach(vk => {
            if (vk !== '0,0') posOcupadas.add(vk)
          })
        }
      }
    })

    const keys = hexGrid.map(h => `${h.q},${h.r}`)
      .sort((a, b) => {
        const [aq, ar] = a.split(',').map(Number)
        const [bq, br] = b.split(',').map(Number)
        return (aq*aq + ar*ar) - (bq*bq + br*br)
      })

    const proximoLivre = (predicado = null) => {
      for (const k of keys) {
        if (k === '0,0') continue
        if (posOcupadas.has(k)) continue
        if (predicado && !predicado(k)) continue
        return k
      }
      return null
    }

    const idsJaAlocados = new Set(Object.values(novasPosicoes))
    const clusters = edificiosAtivos.filter(ed => ed.ehCluster && !idsJaAlocados.has(ed.id))
    const simples = edificiosAtivos.filter(ed => !ed.ehCluster && !idsJaAlocados.has(ed.id))

    clusters.forEach(ed => {
      const central = proximoLivre(k => {
        const [cq, cr] = k.split(',').map(Number)
        return vizinhosDeHex(cq, cr).every(vk => {
          if (vk === '0,0') return false
          return !posOcupadas.has(vk) && gridKeys.has(vk)
        })
      })
      if (central) {
        const [cq, cr] = central.split(',').map(Number)
        novasPosicoes[central] = ed.id
        posOcupadas.add(central)
        vizinhosDeHex(cq, cr).forEach(vk => {
          if (vk !== '0,0') posOcupadas.add(vk)
        })
      }
    })

    simples.forEach(ed => {
      const pos = proximoLivre()
      if (pos) {
        novasPosicoes[pos] = ed.id
        posOcupadas.add(pos)
      }
    })

    setPosicoes(novasPosicoes)
  }, [edificiosAtivos, hexGrid, edificioPorId])

  // ── Satélites ──
  const satelites = useMemo(() => {
    const mapa = {}
    Object.entries(posicoes).forEach(([key, id]) => {
      const ed = edificioPorId.get(id)
      if (!ed?.ehCluster) return

      const cfg = SETOR_CONFIG[ed.setor]
      const cor = cfg?.cor3 || '#5a9e44'
      const corFall = cfg?.cor4 || '#888888'
      const modeloId = EDIFICIO_PARA_MODELO[ed.nome]
      const modeloDef = modeloId ? MODELOS[modeloId] : null
      const defSats = modeloDef?.satelites || []

      const [q, r] = key.split(',').map(Number)
      vizinhosDeHex(q, r).forEach((vk, i) => {
        if (vk === '0,0') return
        if (!posicoes[vk]) {
          mapa[vk] = {
            corTopo: cor,
            corFallback: corFall,
            modeloId: defSats[i]?.modeloId ?? null,
            edificioDono: ed,
          }
        }
      })
    })
    return mapa
  }, [posicoes, edificioPorId])

  const tilesToRender = useMemo(() => {
    return hexGrid
      .map(h => ({ hex: h, key: `${h.q},${h.r}` }))
      .filter(({ key }) => key !== '0,0' && !satelites[key])
  }, [hexGrid, satelites])

  // 🔥 Edifício selecionado
  const selectedBuilding = useMemo(() => {
    if (!selectedKey) return null
    const id = posicoes[selectedKey]
    return id ? edificioPorId.get(id) || null : null
  }, [selectedKey, posicoes, edificioPorId])

  // 🔥 Valida destino
  const destinoEhValido = useCallback((destKey) => {
    if (!selectedKey) return false
    if (destKey === '0,0') return false
    if (destKey === selectedKey) return false
    if (posicoes[destKey]) return false
    if (satelites[destKey]) return false

    const edSendo = edificioPorId.get(posicoes[selectedKey])
    if (!edSendo) return false

    if (edSendo.ehCluster) {
      const gridKeys = new Set(hexGrid.map(h => `${h.q},${h.r}`))
      const ocupadasSemEle = new Set(['0,0'])

      Object.entries(posicoes).forEach(([k, id]) => {
        if (k === selectedKey) return
        ocupadasSemEle.add(k)
        const ed = edificioPorId.get(id)
        if (ed?.ehCluster) {
          const [q, r] = k.split(',').map(Number)
          vizinhosDeHex(q, r).forEach(vk => ocupadasSemEle.add(vk))
        }
      })

      Object.keys(satelites).forEach(k => {
        if (k !== selectedKey) ocupadasSemEle.add(k)
      })

      const [dq, dr] = destKey.split(',').map(Number)
      return vizinhosDeHex(dq, dr).every(
        vk => !ocupadasSemEle.has(vk) && gridKeys.has(vk)
      )
    }

    return true
  }, [selectedKey, posicoes, satelites, edificioPorId, hexGrid])

  // 🔥 Executa movimento
  const moverEdificio = useCallback((destKey) => {
    if (!destinoEhValido(destKey)) return false

    setPosicoes(prev => {
      const copy = { ...prev }
      copy[destKey] = copy[selectedKey]
      delete copy[selectedKey]
      return copy
    })

    setSelectedKey(destKey)
    setMoveMode(false)
    setHoveredKey(null)
    return true
  }, [selectedKey, destinoEhValido])

  // ── Handle Click ──
  const handleHexClick = useCallback((hex) => {
    const key = `${hex.q},${hex.r}`

    if (moveMode) {
      moverEdificio(key)
      return
    }

    const edId = posicoes[key]
    if (!edId) {
      setSelectedKey(null)
      return
    }
    setSelectedKey(prev => (prev === key ? null : key))
    const edificio = edificioPorId.get(edId)
    if (edificio?.atividade) {
      onSelecionarAtividade?.(edificio.atividade)
    }
  }, [moveMode, posicoes, edificioPorId, onSelecionarAtividade, moverEdificio])

  // 🔥 Handle hover
  const handleHover = useCallback((key, isOver) => {
    setHoveredKey(isOver ? key : null)
  }, [])

  // 🔥 Ativar moveMode
  const ativarMoveMode = useCallback(() => {
    if (!isFullscreen) return
    if (!selectedKey) return
    setMoveMode(true)
  }, [isFullscreen, selectedKey])

  // 🔥 Cancelar moveMode
  const cancelarMoveMode = useCallback(() => {
    setMoveMode(false)
    setHoveredKey(null)
  }, [])

  const handleColetarMoeda = useCallback((edificioId) => {
    // hook para XP/global
  }, [])

  // ── Limites de zoom ──
  const tamanhoMapaMundo = HEX_SIZE * 1.73 * (raioMapa + 2.5)
  const minDistance = 4
  const maxDistance = Math.max(45, tamanhoMapaMundo * 2.2)

  // ── Render ──
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: 20, overflow: 'hidden', backgroundColor: '#350973' }}>

      {/* 🔥 Painel de progresso */}
      <PainelProgresso
        nivel={nivelAtual.nivel}
        porte={porte}
        raio={raioMapa}
        atividadesMes={atividadesMes}
        proximo={proximo}
        ultimoNivel={ultimoNivel}
      />

      {/* 🔥 Painel do edifício selecionado */}
      {selectedBuilding && !moveMode && (
        <PainelSelecionado
          building={selectedBuilding}
          isFullscreen={isFullscreen}
          onMover={ativarMoveMode}
          onFechar={() => setSelectedKey(null)}
        />
      )}

      {/* 🔥 Banner de moveMode */}
      {moveMode && (
        <MoveBanner onCancel={cancelarMoveMode} />
      )}

      <Canvas 
        frameloop={moveMode || hoveredKey ? "always" : "demand"}
        shadows={graphicsConfig.shadows}
        gl={{
          antialias: graphicsConfig.antialias,
          powerPreference: "high-performance",
        }}
        camera={{ position: [6, 6, 6], fov: 26 }}
        onPointerMissed={() => {
          if (!moveMode) setSelectedKey(null)
        }}
      >
        {/* 🔥 Registra API de zoom */}
        <ZoomController controlsRef={controlsRef} onReady={(api) => { zoomApiRef.current = api }} />

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
            const hex = hexMap.get(key)
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
                onColetarMoeda={handleColetarMoeda}
              />
            )
          })}

          {tilesToRender.map(({ hex, key }) => {
            const edId = posicoes[key]
            const building = edId ? edificioPorId.get(edId) || null : null
            return (
              <HexTile
                key={key}
                hex={hex}
                building={building}
                onClick={handleHexClick}
                selected={key === selectedKey}
                moveMode={moveMode}
                config={graphicsConfig}
                onColetarMoeda={handleColetarMoeda}
                onHover={handleHover}
                isHovered={hoveredKey === key}
                isBlocked={moveMode && hoveredKey === key && !destinoEhValido(key)}
              />
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