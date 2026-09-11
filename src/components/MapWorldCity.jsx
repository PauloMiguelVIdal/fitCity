// ============================================================
//  MapWorldFitCity.jsx - Mapa Baseado nas Cartas FitCity
//  Raio: 6
// ============================================================

import React, { useState, useMemo, useContext, useEffect, useRef, useCallback } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, OrbitControls, Html } from '@react-three/drei'
import { defineHex, Grid, spiral } from 'honeycomb-grid'
import * as THREE from 'three'
import { BuildingModel } from './BuildingModel'
import { resolverModeloSede, MODELOS, EDIFICIO_PARA_MODELO } from './BuildingModels'
import { useFrame } from '@react-three/fiber'
import { useGraphicsConfig } from './GraphicsConfigContext'

const HEX_SIZE = 0.6

const hexToWorld = (hex, size) => ({
  x: size * 1.73 * (hex.q + hex.r / 2),
  z: size * 1.5 * hex.r,
})

// ─────────────────────────────────────────────────────────────
//  FUNÇÕES DE VERIFICAÇÃO (COM CACHE PARA PERFORMANCE)
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
//  Configurações e Constantes
// ─────────────────────────────────────────────────────────────
const SETOR_CONFIG = {
  agricultura:  { label: 'Agricultura', cor1: '#003816', cor3: '#0C9123', cor4: '#4CAF50' },
  tecnologia:   { label: 'Tecnologia',  cor1: '#A64B00', cor3: '#FF6F00', cor4: '#FF8C42' },
  industria:    { label: 'Indústria',   cor1: '#1A1A1A', cor3: '#808080', cor4: '#B3B3B3' },
  comercio:     { label: 'Comércio',    cor1: '#660000', cor3: '#E60000', cor4: '#FF4D4D' },
  imobiliario:  { label: 'Imobiliário', cor1: '#000066', cor3: '#3333CC', cor4: '#6666FF' },
  energia:      { label: 'Energia',     cor1: '#665200', cor3: '#E6B800', cor4: '#FFD966' },
  outros:       { label: 'Outros',      cor1: '#111111', cor3: '#555555', cor4: '#888888' },
}

const SETORES = ['agricultura', 'tecnologia', 'comercio', 'industria', 'imobiliario', 'energia']

const HEX_DIRECTIONS = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]]
const vizinhosDeHex = (q, r) => HEX_DIRECTIONS.map(([dq, dr]) => `${q + dq},${r + dr}`)

// ─────────────────────────────────────────────────────────────
//  MAPEAMENTO DE SETOR PARA CARTAS FITCITY
// ─────────────────────────────────────────────────────────────
const mapaSetor = {
  "Plantação De Grãos": "agricultura",
  "Pomares": "agricultura",
  "Cooperativa Agrícola": "agricultura",
  "Centro De Comércio De Plantações": "agricultura",
  "Fazenda De Vacas": "agricultura",
  "Granja De Aves": "agricultura",
  "Criação De Ovinos": "agricultura",
  "Armazém": "agricultura",
  "Silo": "agricultura",
  "Depósito De Resíduos Orgânicos": "agricultura",
  "Serraria": "agricultura",
  "Área Florestal": "agricultura",
  "Terreno De Mineração": "agricultura",
  "Plantação De Eucalipto": "agricultura",
  "Pátio De Mineração": "agricultura",
  "Fábrica De Rações": "industria",
  "Fábrica De Bebidas": "industria",
  "Fábrica De Pães": "industria",
  "Fábrica De Calçados": "industria",
  "Fábrica De Papel": "industria",
  "Laboratório Farmacêutico": "industria",
  "Usina Siderúrgica": "industria",
  "Fábrica De Ligas Metálicas": "industria",
  "Fábrica De Peças Automotivas": "industria",
  "Fábrica De Robôs": "industria",
  "Empresa De Automação Industrial": "industria",
  "Fábrica De Motores": "industria",
  "Fábrica De Foguetes": "industria",
  "Fábrica De Aeronaves": "industria",
  "Estaleiro": "industria",
  "Container Modular": "industria",
  "Pátio De Veículos": "industria",
  "Startup": "tecnologia",
  "Servidor Em Nuvem": "tecnologia",
  "Empresa De Desenvolvimento De Software": "tecnologia",
  "Centro De Pesquisa Em Fusão Nuclear": "tecnologia",
  "Centro De Pesquisa Aeroespacial": "tecnologia",
  "Feira": "comercio",
  "Loja De Móveis": "comercio",
  "Farmácia": "comercio",
  "Câmara Fria": "comercio",
  "Mercado": "comercio",
  "Loja De Calçados": "comercio",
  "Posto De Combustíveis": "comercio",
  "Centro De Distribuição": "comercio",
  "Concessionária De Veículos": "comercio",
  "Transporte Petrolífero": "comercio",
  "Shopping Popular": "comercio",
  "Shopping Center": "comercio",
  "Mega Mercado": "comercio",
  "Construtora De Pequenas Obras": "imobiliario",
  "Cartório E Licenças": "imobiliario",
  "Escritório De Arquitetura": "imobiliario",
  "Consultoria Em Engenharia Civil": "imobiliario",
  "Escritório De Design De Interiores": "imobiliario",
  "Construtora": "imobiliario",
  "Imobiliária Residencial": "imobiliario",
  "Imobiliária Comercial": "imobiliario",
  "Construtora De Infraestruturas": "imobiliario",
  "Prédio De Alto Padrão": "imobiliario",
  "Subestação De Energia": "energia",
  "Campo De Estocagem": "energia",
  "Centro De Pesquisa Energética": "energia",
  "Empresa De Comércio Energético": "energia",
  "Usina De Biomassa": "energia",
  "Parque Eólico": "energia",
  "Fábrica De Turbinas Eólicas": "energia",
  "Usina Hidrelétrica": "energia",
  "Usina Termelétrica A Biocombustíveis": "energia",
  "Usina Termelétrica": "energia",
  "Reator Nuclear Convencional": "energia",
  "Usina De Fusão Nuclear": "energia",
  "Estação De Carregamento": "energia",
  "Tanque De Armazenamento De Fluidos": "energia",
  "Mineradora": "imobiliario",
  "Plataforma De Petróleo": "imobiliario",
  "Centro De Coleta De Biomassa": "imobiliario",
  "Hangar": "imobiliario",
  "Armazém De Materiais Sensíveis": "imobiliario",
  "Aeroporto": "imobiliario",
  "Porto": "imobiliario",
}

const getSetor = (nome) => mapaSetor[nome] || "outros"

// ─────────────────────────────────────────────────────────────
//  DADOS DAS CARTAS FITCITY (APENAS NOMES ÚNICOS)
// ─────────────────────────────────────────────────────────────
const CARTAS_FITCITY_UNICAS = [
  "Terreno De Mineração","Pátio De Mineração","Pomares","Depósito De Resíduos Orgânicos",
  "Plantação De Grãos","Serraria","Plantação De Eucalipto","Cooperativa Agrícola",
  "Centro De Comércio De Plantações","Área Florestal",
  "Subestação De Energia","Campo De Estocagem","Silo","Centro De Pesquisa Energética",
  "Empresa De Comércio Energético","Usina De Biomassa","Parque Eólico","Fábrica De Turbinas Eólicas",
  "Usina Hidrelétrica","Usina Termelétrica A Biocombustíveis","Usina Termelétrica",
  "Reator Nuclear Convencional","Usina De Fusão Nuclear","Estação De Carregamento",
  "Tanque De Armazenamento De Fluidos",
  "Fazenda De Vacas","Granja De Aves","Fábrica De Rações","Fábrica De Papel","Fábrica De Pães",
  "Container Modular","Pátio De Veículos","Fábrica De Calçados","Fábrica De Bebidas",
  "Laboratório Farmacêutico","Fábrica De Motores","Fábrica De Robôs","Usina Siderúrgica",
  "Fábrica De Ligas Metálicas","Fábrica De Peças Automotivas","Fábrica De Smartphones",
  "Empresa De Automação Industrial",
  "Startup","Servidor Em Nuvem","Empresa De Desenvolvimento De Software",
  "Centro De Pesquisa Em Fusão Nuclear","Centro De Pesquisa Aeroespacial",
  "Feira","Loja De Móveis","Farmácia","Câmara Fria","Mercado","Loja De Calçados",
  "Posto De Combustíveis","Centro De Distribuição","Concessionária De Veículos",
  "Transporte Petrolífero","Shopping Popular","Shopping Center","Mega Mercado",
  "Construtora De Pequenas Obras","Cartório E Licenças","Escritório De Arquitetura",
  "Consultoria Em Engenharia Civil","Escritório De Design De Interiores","Construtora",
  "Imobiliária Residencial","Imobiliária Comercial","Construtora De Infraestruturas",
  "Hangar","Mineradora","Plataforma De Petróleo","Centro De Coleta De Biomassa",
  "Criação De Ovinos","Prédio De Alto Padrão","Armazém","Aeroporto","Porto","Estaleiro",
  "Fábrica De Aeronaves","Fábrica De Foguetes",
]

// ─────────────────────────────────────────────────────────────
//  CAMADA 1: CÉU E ATMOSFERA
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
//  CAMADA 2: MAR / OCEANO
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
//  CAMADA 3: TERRA E EDIFÍCIOS
// ─────────────────────────────────────────────────────────────
const HexBase = React.memo(({ corTopo = '#5a9e44', config = {}, selected = false, hovered = false, moveMode = false }) => {
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

      {/* Highlight de seleção */}
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
          <ringGeometry args={[HEX_SIZE * 0.87, HEX_SIZE * 0.99, 6]} />
          <meshBasicMaterial color="#F27405" transparent opacity={0.95} />
        </mesh>
      )}

      {/* Highlight de hover no moveMode */}
      {moveMode && hovered && !selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
          <ringGeometry args={[HEX_SIZE * 0.87, HEX_SIZE * 0.99, 6]} />
          <meshBasicMaterial color="#d4f08a" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
})

// ─────────────────────────────────────────────────────────────
//  HexTileClusterSatelite
// ─────────────────────────────────────────────────────────────
const HexTileClusterSatelite = React.memo(({ hex, corTopo, modeloId, corFallback, config = {} }) => {
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
    </group>
  )
})

// ─────────────────────────────────────────────────────────────
//  HexTile
// ─────────────────────────────────────────────────────────────
const HexTile = React.memo(({ 
  hex, 
  building, 
  onClick, 
  selected, 
  moveMode, 
  config = {},
  onHover,
  isHovered,
  isBlocked,
}) => {
  const { x, z } = hexToWorld(hex, HEX_SIZE)
  
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
  
  return (
    <group 
      position={[x, 0, z]}
      onClick={handleClick}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
    >
      <HexBase 
        corTopo={building ? SETOR_CONFIG[building.setor]?.cor3 : undefined} 
        config={config}
        selected={selected}
        hovered={isHovered}
        moveMode={moveMode}
      />
      
      {building && (
        <BuildingModel
          nomeEdificio={building.nome}
          corFallback={SETOR_CONFIG[building.setor]?.cor4 || '#888888'}
          posicaoBase={[0, 0.22, 0]}
          graphicsConfig={config}
        />
      )}

      {/* Indicador de bloqueio durante moveMode */}
      {moveMode && isHovered && isBlocked && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.22, 0]}>
          <ringGeometry args={[HEX_SIZE * 0.5, HEX_SIZE * 0.65, 6]} />
          <meshBasicMaterial color="#ff2222" transparent opacity={0.7} />
        </mesh>
      )}

      {/* Indicador de destino válido durante moveMode */}
      {moveMode && isHovered && !isBlocked && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.22, 0]}>
          <ringGeometry args={[HEX_SIZE * 0.45, HEX_SIZE * 0.58, 6]} />
          <meshBasicMaterial color="#F27405" transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  )
})

// ─────────────────────────────────────────────────────────────
//  CAMADA 4: SEDE E LUZES
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
//  LUZES
// ─────────────────────────────────────────────────────────────
const Lights = React.memo(({ config = {} }) => {
  const hasShadows = config?.shadows ?? true
  const mapSize = config?.shadowMapSize ?? 1024
  const bias = config?.shadowBias ?? -0.001
  const near = config?.shadowCameraNear ?? 0.5
  const far = config?.shadowCameraFar ?? 50
  const left = config?.shadowCameraLeft ?? -20
  const right = config?.shadowCameraRight ?? 20
  const top = config?.shadowCameraTop ?? 20
  const bottom = config?.shadowCameraBottom ?? -20

  return (
    <>
      <directionalLight 
        position={[15, 20, 10]} 
        intensity={1.5} 
        color="#ffffff" 
        castShadow={hasShadows}
        shadow-mapSize={[mapSize, mapSize]}
        shadow-bias={bias}
        shadow-camera-near={near}
        shadow-camera-far={far}
        shadow-camera-left={left}
        shadow-camera-right={right}
        shadow-camera-top={top}
        shadow-camera-bottom={bottom}
      />
      <ambientLight intensity={0.4} color="#ffffff" />
      <pointLight position={[-10, 5, 10]} intensity={0.8} color="#dbb2ff" />
      <hemisphereLight args={['#ffee00', '#ff5500', 0.5]} />
    </>
  )
})

// ─────────────────────────────────────────────────────────────
//  COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function MapWorldFitCity({ isFullscreen = false }) {
  const { config: graphicsConfig } = useGraphicsConfig()
  
  const [selectedKey, setSelectedKey] = useState(null)
  const [dayProgress, setDayProgress] = useState(0)
  const [moveMode, setMoveMode] = useState(false)
  const [hoveredKey, setHoveredKey] = useState(null)

  // 🔥 NOVO: Se o usuário sair do fullscreen, limpa seleção e moveMode
  useEffect(() => {
    if (!isFullscreen) {
      setMoveMode(false)
      setSelectedKey(null)
      setHoveredKey(null)
    }
  }, [isFullscreen])

  // ── Edifícios ativos (APENAS UMA UNIDADE DE CADA) ──────────
  const edificiosAtivos = useMemo(() => {
    return CARTAS_FITCITY_UNICAS.map((nome, index) => {
      const setor = getSetor(nome)
      return {
        id: `edificio-${index}`,
        nome: nome,
        setor: setor || 'outros',
        quantidade: 1,
        ehCluster: edificioEhCluster(nome),
        ehComposto: edificioEhComposto(nome),
      }
    })
  }, [])

  // ── Hex Grid ── RAIO 6 ──
  const hexGrid = useMemo(() => {
    const Tile = defineHex({ dimensions: HEX_SIZE, orientation: 'pointy' })
    return Array.from(new Grid(Tile, spiral({ center: [0, 0], radius: 7 })))
  }, [])

  // ── Hex Map para lookup O(1) ──────────────────────────────
  const hexMap = useMemo(() => {
    const map = new Map()
    hexGrid.forEach(h => map.set(`${h.q},${h.r}`, h))
    return map
  }, [hexGrid])

  // ── Edifício Map para lookup O(1) ─────────────────────────
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

  // ── Satélites dos clusters ──────────────────────────────────
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
          }
        }
      })
    })
    return mapa
  }, [posicoes, edificioPorId])

  // ── Tiles para renderizar (FILTRADO) ──────────────────────
  const tilesToRender = useMemo(() => {
    return hexGrid
      .map(h => ({ hex: h, key: `${h.q},${h.r}` }))
      .filter(({ key }) => key !== '0,0' && !satelites[key])
  }, [hexGrid, satelites])

  // ── Edifício selecionado ───────────────────────────────────
  const selectedBuilding = useMemo(() => {
    if (!selectedKey) return null
    const id = posicoes[selectedKey]
    return id ? edificioPorId.get(id) || null : null
  }, [selectedKey, posicoes, edificioPorId])

  // Verifica se um destino é válido para mover
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
      const destinoValido = vizinhosDeHex(dq, dr).every(
        vk => !ocupadasSemEle.has(vk) && gridKeys.has(vk)
      )
      return destinoValido
    }

    return true
  }, [selectedKey, posicoes, satelites, edificioPorId, hexGrid])

  // Executa o movimento
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

  // ── Handle Click ────────────────────────────────────────────
  const handleHexClick = useCallback((hex) => {
    const key = `${hex.q},${hex.r}`

    if (moveMode) {
      moverEdificio(key)
      return
    }

    if (posicoes[key]) {
      setSelectedKey(prev => prev === key ? null : key)
    } else {
      setSelectedKey(null)
    }
  }, [moveMode, posicoes, moverEdificio])

  // Handle hover
  const handleHover = useCallback((key, isOver) => {
    setHoveredKey(isOver ? key : null)
  }, [])

  // Ativar modo mover (só em fullscreen)
  const ativarMoveMode = useCallback(() => {
    if (!isFullscreen) return
    if (!selectedKey) return
    setMoveMode(true)
  }, [isFullscreen, selectedKey])

  // Cancelar moveMode
  const cancelarMoveMode = useCallback(() => {
    setMoveMode(false)
    setHoveredKey(null)
  }, [])

  // ── Configuração do Canvas ─────────────────────────────────
  const canvasConfig = useMemo(() => ({
    shadows: graphicsConfig.shadows,
    antialias: graphicsConfig.antialias,
  }), [graphicsConfig])

  // ── Render ──────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: 20, overflow: 'hidden', backgroundColor:'#350973' }}>
      
    
{/* Nome do edifício selecionado — canto inferior direito */}
{selectedBuilding && (
  <div
    style={{
      position: 'fixed',
      right: 20,          // 🔥 mudou
      bottom: 20,         // 🔥 mudou (era top: 100)
      zIndex: 60,
      pointerEvents: 'none',
      fontFamily: "'Rajdhani','Segoe UI',sans-serif",
      display: 'flex',
      flexDirection: 'column',   // 🔥 garante que botão fica embaixo
      alignItems: 'stretch',     // 🔥 botão acompanha a largura do card
      gap: 8,
    }}
  >
    {/* Card de info */}
    <div style={{
      background: 'linear-gradient(135deg, rgba(12,8,28,0.95), rgba(26,14,58,0.95))',
      border: `1.5px solid ${SETOR_CONFIG[selectedBuilding.setor]?.cor4 || '#888'}88`,
      boxShadow: `0 4px 24px rgba(0,0,0,0.6), 0 0 16px ${SETOR_CONFIG[selectedBuilding.setor]?.cor3 || '#555'}44`,
      borderRadius: 12,
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: `linear-gradient(135deg, ${SETOR_CONFIG[selectedBuilding.setor]?.cor3 || '#555'} 0%, ${SETOR_CONFIG[selectedBuilding.setor]?.cor1 || '#111'} 100%)`,
        border: `1px solid ${SETOR_CONFIG[selectedBuilding.setor]?.cor4 || '#888'}66`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', flexShrink: 0,
      }}>
        <img
          src={`/imagens/${selectedBuilding.nome}.png`}
          alt={selectedBuilding.nome}
          style={{ width: '70%', height: '70%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
          onError={(e) => { e.target.style.display = 'none' }}
        />
      </div>
      <div>
        <div style={{
          color: '#fff', fontWeight: 800, fontSize: 14,
          letterSpacing: '0.04em',
          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
          maxWidth: 200, whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {selectedBuilding.nome}
        </div>
        <div style={{
          color: SETOR_CONFIG[selectedBuilding.setor]?.cor4 || '#888',
          fontSize: 11, fontWeight: 600, marginTop: 2, opacity: 0.85,
        }}>
          {SETOR_CONFIG[selectedBuilding.setor]?.label || 'Outros'}
        </div>
      </div>
    </div>

    {/* Botão Mover — só aparece em fullscreen */}
    {isFullscreen && !moveMode && (
      <button
        onClick={ativarMoveMode}
        style={{
          pointerEvents: 'auto',
          background: 'linear-gradient(135deg,#4C14A9,#6411D9)',
          border: '1px solid rgba(199,159,255,0.5)',
          borderRadius: 10,
          padding: '8px 14px',
          cursor: 'pointer',
          color: '#fff',
          fontFamily: "'Rajdhani','Segoe UI',sans-serif",
          fontSize: 12, fontWeight: 700, letterSpacing: '.08em',
          boxShadow: '0 0 14px rgba(100,17,217,0.5)',
          textTransform: 'uppercase',
        }}
      >
        ✦ Mover edifício
      </button>
    )}

    {/* Aviso se não estiver em fullscreen */}
    {!isFullscreen && (
      <div style={{
        background: 'rgba(242,116,5,0.15)',
        border: '1px solid rgba(242,116,5,0.4)',
        borderRadius: 10,
        padding: '6px 12px',
        color: '#FFB060',
        fontSize: 10, fontWeight: 700,
        letterSpacing: '.06em',
        textAlign: 'center',
      }}>
        ⛶ Entre em fullscreen para mover
      </div>
    )}
  </div>
)}
      {/* Banner de modo mover */}
      {moveMode && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 60,
          background: 'linear-gradient(135deg,rgba(242,116,5,0.94),rgba(175,78,0,0.94))',
          border: '1px solid #F27405',
          boxShadow: '0 0 16px rgba(242,116,5,0.5)',
          borderRadius: 10,
          padding: '8px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          fontFamily: "'Rajdhani',sans-serif",
          color: '#fff', fontSize: 12, fontWeight: 700,
          letterSpacing: '.07em',
        }}>
          <span>✦ Selecione o destino</span>
          <button
            onClick={cancelarMoveMode}
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 6, padding: '3px 10px',
              cursor: 'pointer', color: '#fff',
              fontFamily: "'Rajdhani',sans-serif",
              fontSize: 11, fontWeight: 700,
            }}
          >
            Cancelar
          </button>
        </div>
      )}

      <Canvas 
        frameloop={moveMode || hoveredKey ? "always" : "demand"}
        shadows={canvasConfig.shadows}
        gl={{
          antialias: canvasConfig.antialias,
          powerPreference: "high-performance",
        }}
        camera={{ position: [18, 18, 18], fov: 26 }}
        onPointerMissed={() => {
          if (!moveMode) setSelectedKey(null)
        }}
      >
        {/* CAMADA 1: CÉU */}
        <SkyDome dayProgress={dayProgress} />
        
        {/* CAMADA 2: MAR */}
        {graphicsConfig.oceanWaves ? (
          <Ocean />
        ) : (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
            <circleGeometry args={[8, 32]} />
            <meshStandardMaterial color="#003366" roughness={0.3} metalness={0.1} />
          </mesh>
        )}
        
        {/* CAMADA 4: LUZES */}
        <Lights config={graphicsConfig} />

        {/* CAMADA 3: TERRA E EDIFÍCIOS */}
        <group>
          <Sede 
            nomeEmpresa={"FitCity"} 
            porte={"Micro Empresa"} 
            config={graphicsConfig}
          />

          {/* Satélites de clusters */}
          {Object.entries(satelites).map(([key, { corTopo, modeloId, corFallback }]) => {
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
              />
            )
          })}

          {/* Tiles normais */}
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
          enablePan={false}
          enableZoom={!moveMode}
          enableRotate={!moveMode}
          rotateSpeed={0.5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.8}
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