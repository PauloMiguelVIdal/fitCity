// src/components/MapWorldActivities.jsx
import React, { useState, useMemo, useContext, useEffect, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, OrbitControls, Html } from '@react-three/drei'
import { defineHex, Grid, spiral } from 'honeycomb-grid'
import * as THREE from 'three'
import { BuildingModel } from './BuildingModel'
import { resolverModeloSede, MODELOS, EDIFICIO_PARA_MODELO, PORTES_ORDENADOS } from './BuildingModels'
import { useFrame } from '@react-three/fiber'
import { useGraphicsConfig } from './GraphicsConfigContext'
import { calcularMoedas } from '../utils/atividades'
import { avaliarAtividade } from '../utils/atividadeModel'
import { Coins, TrendingUp } from 'lucide-react'

const HEX_SIZE = 0.6

// =============================================
// CONSTANTE: chave do localStorage
// =============================================
const STORAGE_PREFIX = 'fitcity_moedas_'
const STORAGE_PORTE = 'fitcity_porte_sede'

// =============================================
// MAPEAMENTO DE EDIFÍCIOS POR NÍVEL DE MOEDAS
// =============================================
const EDIFICIOS_POR_NIVEL = {
  1: { edificios: [{ nome: 'Plantação De Vegetais', setor: 'agricultura' }], cor1: '#003816', cor2: '#1A5E2A', cor3: '#0C9123', cor4: '#4CAF50', label: 'Nível 1' },
  2: { edificios: [{ nome: 'Granja De Aves', setor: 'agricultura' }], cor1: '#003816', cor2: '#1A5E2A', cor3: '#0C9123', cor4: '#4CAF50', label: 'Nível 2' },
  3: { edificios: [{ nome: 'Fazenda De Vacas', setor: 'agricultura' }], cor1: '#003816', cor2: '#1A5E2A', cor3: '#0C9123', cor4: '#4CAF50', label: 'Nível 3' },
  4: { edificios: [{ nome: 'Criação De Ovinos', setor: 'agricultura' }], cor1: '#003816', cor2: '#1A5E2A', cor3: '#0C9123', cor4: '#4CAF50', label: 'Nível 4' },
  5: { edificios: [{ nome: 'Cooperativa Agrícola', setor: 'agricultura' }], cor1: '#003816', cor2: '#1A5E2A', cor3: '#0C9123', cor4: '#4CAF50', label: 'Nível 5' },
  6: { edificios: [{ nome: 'Centro De Comércio De Plantações', setor: 'agricultura' }], cor1: '#003816', cor2: '#1A5E2A', cor3: '#0C9123', cor4: '#4CAF50', label: 'Nível 6' },
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
// 🔥 HELPER: lê / grava moeda no localStorage
// =============================================
function jaColetou(edificioId) {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(`${STORAGE_PREFIX}${edificioId}`) === '1'
  } catch {
    return false
  }
}

function marcarColetado(edificioId) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${edificioId}`, '1')
  } catch {}
}

// =============================================
// 🔥 HELPER: lê / grava porte da sede
// =============================================
function lerPorteSalvo() {
  if (typeof window === 'undefined') return PORTES_ORDENADOS[0]
  try {
    const salvo = window.localStorage.getItem(STORAGE_PORTE)
    if (salvo && PORTES_ORDENADOS.includes(salvo)) return salvo
  } catch {}
  return PORTES_ORDENADOS[0]
}

function salvarPorte(porte) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_PORTE, porte)
  } catch {}
}

// =============================================
// 🔥 BADGE DE MOEDAS (só o ícone; some ao clicar)
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
const SkyDome = React.memo(({ dayProgress }) => {
  const uniforms = useMemo(() => ({
    topColor:    { value: new THREE.Color('#4c2da0') },
    middleColor: { value: new THREE.Color('#F27405') },
    bottomColor: { value: new THREE.Color('#6411D9') },
    uProgress:   { value: 0 },
  }), [])

  useEffect(() => { uniforms.uProgress.value = dayProgress }, [dayProgress, uniforms])

  return (
    <mesh scale={[8, 6, 8]} position={[0, 0.01, 0]}>
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
const Ocean = React.memo(() => {
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorBase:   { value: new THREE.Color('#0066cc') },
    uColorDeep:   { value: new THREE.Color('#001a33') },
  }), [])

  useFrame((state) => { uniforms.uTime.value = state.clock.elapsedTime })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
      <circleGeometry args={[8, 64]} />
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
const HexBase = React.memo(({ corTopo = '#5a9e44', config = {} }) => {
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
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        castShadow={hasShadows} 
        receiveShadow={hasShadows}
      >
        <extrudeGeometry args={[shape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 2 }]} />
        <meshStandardMaterial color="#4a7230" roughness={0.9} metalness={0} />
      </mesh>
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.2, 0]} 
        receiveShadow={hasShadows}
      >
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color={corTopo} roughness={0.8} metalness={0} />
      </mesh>
    </group>
  )
})

// =============================================
// HEX TILE (com badge de moeda)
// =============================================
const HexTile = React.memo(({ hex, building, onClick, selected, moveMode, config = {}, onColetarMoeda }) => {
  const { x, z } = hexToWorld(hex, HEX_SIZE)
  
  const handleClick = useCallback(() => {
    onClick(hex)
  }, [onClick, hex])
  
  const corTopo = building ? SETOR_CONFIG[building.setor]?.cor3 : undefined
  
  return (
    <group 
      position={[x, 0, z]}
      onClick={handleClick}
    >
      <HexBase corTopo={corTopo} config={config} />
      
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
    </group>
  )
})

// =============================================
// HEX TILE CLUSTER SATELITE (com badge de moeda)
// =============================================
const HexTileClusterSatelite = React.memo(({ 
  hex, 
  corTopo, 
  modeloId, 
  corFallback, 
  config = {},
  edificioDono,
  onColetarMoeda,
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
// CAMADA 4: SEDE (🔥 agora recebe o porte atual)
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
// 🔥 PAINEL DE PORTE + BOTÃO EXPANDIR (fora do Canvas)
// =============================================
const PortePanel = ({ porte, onExpandir, podeExpandir }) => (
  <div style={{
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 60,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    fontFamily: "'Rajdhani','Segoe UI',sans-serif",
    pointerEvents: 'none',
  }}>
    {/* Label do porte atual */}
    <div style={{
      background: 'linear-gradient(135deg, rgba(76,20,169,0.95), rgba(30,8,80,0.95))',
      border: '1.5px solid rgba(199,159,255,0.6)',
      boxShadow: '0 0 18px rgba(100,17,217,0.55), 0 2px 8px rgba(0,0,0,0.6)',
      borderRadius: 10,
      padding: '6px 14px',
      color: '#fff',
      fontWeight: 800,
      fontSize: 13,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      textShadow: '0 1px 4px rgba(0,0,0,0.6)',
      whiteSpace: 'nowrap',
      textAlign: 'center',
    }}>
      🏢 {porte}
    </div>

    {/* Botão Expandir */}
    {podeExpandir && (
      <button
        onClick={onExpandir}
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '8px 14px',
          borderRadius: 10,
          border: '1px solid #F2C230',
          background: 'linear-gradient(135deg, #F27405 0%, #8B3D00 100%)',
          boxShadow: '0 0 14px rgba(242,116,5,0.6), 0 2px 6px rgba(0,0,0,0.4)',
          color: '#fff',
          fontFamily: "'Rajdhani','Segoe UI',sans-serif",
          fontWeight: 800,
          fontSize: 12,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'transform 0.12s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)' }}
        onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }}
        title="Expandir para o próximo porte"
      >
        <TrendingUp size={16} strokeWidth={2.8} />
        Expandir Sede
      </button>
    )}
  </div>
)

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

  // 🔥 NOVO: estado do porte da sede (persiste no localStorage)
  const [porte, setPorte] = useState(() => lerPorteSalvo())

  const [selectedKey, setSelectedKey] = useState(null)
  const [dayProgress, setDayProgress] = useState(0)
  const [moveMode, setMoveMode] = useState(false)

  // 🔥 Expande para o próximo porte da lista
  const handleExpandirSede = useCallback(() => {
    setPorte(prev => {
      const idx = PORTES_ORDENADOS.indexOf(prev)
      const proximo = PORTES_ORDENADOS[Math.min(idx + 1, PORTES_ORDENADOS.length - 1)]
      salvarPorte(proximo)
      return proximo
    })
  }, [])

  const podeExpandir = porte !== PORTES_ORDENADOS[PORTES_ORDENADOS.length - 1]

  // ── Edifícios ativos baseados nas moedas ──────────────────
  const edificiosAtivos = useMemo(() => {
    const atividadesFiltradas = atividades.filter(a => 
      TIPOS_PERMITIDOS.includes(a.tipo)
    )

    return atividadesFiltradas.map((atividade, idx) => {
      const moedas = calcularMoedas(atividade)
      const nivel = getNivelPorMoedas(moedas)
      const edificio = escolherEdificioPorNivel(nivel)
      
      return {
        id: atividade.id ?? `atividade-${idx}`,
        nome: edificio.nome,
        setor: edificio.setor,
        atividade,
        moedas,
        nivel,
        ehCluster: edificioEhCluster(edificio.nome),
        ehComposto: edificioEhComposto(edificio.nome),
      }
    })
  }, [atividades])

  // ── Hex Grid ── RAIO 6 ──
  const hexGrid = useMemo(() => {
    const Tile = defineHex({ dimensions: HEX_SIZE, orientation: 'pointy' })
    return Array.from(new Grid(Tile, spiral({ center: [0, 0], radius: 6 })))
  }, [])

  // ── Hex Map ──
  const hexMap = useMemo(() => {
    const map = new Map()
    hexGrid.forEach(h => map.set(`${h.q},${h.r}`, h))
    return map
  }, [hexGrid])

  // ── Edifício Map ──
  const edificioPorId = useMemo(() => {
    const map = new Map()
    edificiosAtivos.forEach(e => map.set(e.id, e))
    return map
  }, [edificiosAtivos])

  // ── Posicionamento automático ──────────────────────────────
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

  // ── Tiles para renderizar ──
  const tilesToRender = useMemo(() => {
    return hexGrid
      .map(h => ({ hex: h, key: `${h.q},${h.r}` }))
      .filter(({ key }) => key !== '0,0' && !satelites[key])
  }, [hexGrid, satelites])

  // ── Handle Click ──
  const handleHexClick = useCallback((hex) => {
    const key = `${hex.q},${hex.r}`
    if (moveMode) {
      setMoveMode(false)
      return
    }
    const edId = posicoes[key]
    if (!edId) return
    setSelectedKey(prev => (prev === key ? null : key))
    const edificio = edificioPorId.get(edId)
    if (edificio?.atividade) {
      onSelecionarAtividade?.(edificio.atividade)
    }
  }, [moveMode, posicoes, edificioPorId, onSelecionarAtividade])

  // 🔥 Callback: chamado ao coletar moeda
  const handleColetarMoeda = useCallback((edificioId) => {
    // console.log(`+1 moeda no edifício ${edificioId}`)
  }, [])

  // ── Render ──
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: 20, overflow: 'hidden', backgroundColor: '#350973' }}>
      
      {/* 🔥 Painel de porte + botão Expandir */}
      <PortePanel
        porte={porte}
        onExpandir={handleExpandirSede}
        podeExpandir={podeExpandir}
      />

      <Canvas 
        frameloop="demand"
        shadows={graphicsConfig.shadows}
        gl={{
          antialias: graphicsConfig.antialias,
          powerPreference: "high-performance",
        }}
        camera={{ position: [18, 18, 18], fov: 26 }}
      >
        <SkyDome dayProgress={dayProgress} />
        
        {graphicsConfig.oceanWaves ? (
          <Ocean />
        ) : (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
            <circleGeometry args={[8, 32]} />
            <meshStandardMaterial color="#003366" roughness={0.3} metalness={0.1} />
          </mesh>
        )}
        
        <Lights config={graphicsConfig} />

        <group>
          {/* 🔥 Sede recebe o porte atual — troca o modelo 3D */}
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
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          rotateSpeed={0.5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.8}
          target={[0, 0, 0]}
          enableDamping={true}
          dampingFactor={0.08}
          autoRotate={graphicsConfig.autoRotate}
          autoRotateSpeed={graphicsConfig.autoRotateSpeed}
        />
      </Canvas>
    </div>
  )
}