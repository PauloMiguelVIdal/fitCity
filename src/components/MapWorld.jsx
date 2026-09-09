// ============================================================
//  MapWorld.jsx - Com Suporte a Configuração Gráfica
//  Raio: 6
// ============================================================

import React, { useState, useMemo, useContext, useEffect, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, OrbitControls, Html } from '@react-three/drei'
import { defineHex, Grid, spiral } from 'honeycomb-grid'
import * as THREE from 'three'
// import { CentraldeDadosContext } from '../centralDeDadosContext'
// import { DadosEconomyGlobalContext } from '../dadosEconomyGlobal'
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
}

const SETORES = ['agricultura', 'tecnologia', 'comercio', 'industria', 'imobiliario', 'energia']

const HEX_DIRECTIONS = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]]
const vizinhosDeHex = (q, r) => HEX_DIRECTIONS.map(([dq, dr]) => `${q + dq},${r + dr}`)

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
const HexTile = React.memo(({ hex, building, onClick, selected, moveMode, config = {} }) => {
  const { x, z } = hexToWorld(hex, HEX_SIZE)
  
  const handleClick = useCallback(() => {
    onClick(hex)
  }, [onClick, hex])
  
  return (
    <group 
      position={[x, 0, z]}
      onClick={handleClick}
    >
      <HexBase corTopo={building ? SETOR_CONFIG[building.setor]?.cor3 : undefined} config={config} />
      
      {building && (
        <BuildingModel
          nomeEdificio={building.nome}
          corFallback={SETOR_CONFIG[building.setor]?.cor4 || '#888888'}
          posicaoBase={[0, 0.22, 0]}
          graphicsConfig={config}
        />
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
      {/* <Html position={[0, 3.0, 0]} center distanceFactor={8}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(76,20,169,0.95), rgba(30,8,80,0.95))',
          border: '1.5px solid rgba(199,159,255,0.6)',
          borderRadius: 10, padding: '4px 12px',
          fontFamily: "'Rajdhani',sans-serif",
          fontWeight: 800, fontSize: 20, color: '#fff',
          textTransform: 'uppercase',
          boxShadow: '0 0 18px rgba(100,17,217,0.55)',
        }}>
          {nomeEmpresa || 'Sua Empresa'}
        </div>
      </Html> */}
    </group>
  )
})

// ─────────────────────────────────────────────────────────────
//  LUZES (COM CONFIGURAÇÃO DINÂMICA)
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
// fora do componente, ou dentro de um useMemo com deps []
const DADOS_MOCK = {
  inicioGame: { nomeEmpresa: 'Spike Test' },
  agricultura: { edificios: [{ nome: 'Silo', quantidade: 2 }] },
  industria: { edificios: [{ nome: 'Usina De Fusão Nuclear', quantidade: 2 }] },
  tecnologia: { edificios: [{ nome: 'Data Center', quantidade: 1 }] },
}







  // ...
// ─────────────────────────────────────────────────────────────
//  COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function MapWorld() {
  // const { dados } = useContext(CentraldeDadosContext)
  // const { economiaSetores } = useContext(DadosEconomyGlobalContext)


const dados = DADOS_MOCK




  const { config: graphicsConfig } = useGraphicsConfig()
  
  const nomeEmpresa = dados.inicioGame?.nomeEmpresa || 
  'Empresa'
  const porte = 
  // economiaSetores?.centralEdificios?.classificacaoPorteEmpresa ||
   'Micro Empresa'

  const [selectedKey, setSelectedKey] = useState(null)
  const [dayProgress, setDayProgress] = useState(0)
  const [moveMode, setMoveMode] = useState(false)

  // ── Edifícios ativos ────────────────────────────────────────
  const edificiosAtivos = useMemo(() => {
    const lista = []
    SETORES.forEach(setor => {
      dados[setor]?.edificios?.forEach((ed, idx) => {
        if (ed.quantidade > 0) {
          lista.push({
            id: `${setor}-${idx}`,
            nome: ed.nome,
            setor,
            quantidade: ed.quantidade,
            ehCluster: edificioEhCluster(ed.nome),
            ehComposto: edificioEhComposto(ed.nome),
          })
        }
      })
    })
    return lista
  }, [dados])

  // ── Hex Grid ── RAIO 6 ──
  const hexGrid = useMemo(() => {
    const Tile = defineHex({ dimensions: HEX_SIZE, orientation: 'pointy' })
    return Array.from(new Grid(Tile, spiral({ center: [0, 0], radius: 6 })))
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

  // ── Handle Click ────────────────────────────────────────────
  const handleHexClick = useCallback((hex) => {
    const key = `${hex.q},${hex.r}`
    if (moveMode) {
      setMoveMode(false)
      return
    }
    if (posicoes[key]) {
      setSelectedKey(prev => prev === key ? null : key)
    }
  }, [moveMode, posicoes])

  // ── Configuração do Canvas ─────────────────────────────────
  const canvasConfig = useMemo(() => ({
    shadows: graphicsConfig.shadows,
    antialias: graphicsConfig.antialias,
  }), [graphicsConfig])

  // ── Render ──────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: 20, overflow: 'hidden' }}>
      <Canvas 
        frameloop="demand"
        shadows={canvasConfig.shadows}
        gl={{
          antialias: canvasConfig.antialias,
          powerPreference: "high-performance",
        }}
        camera={{ position: [18, 18, 18], fov: 26 }}
      >
        {/* CAMADA 1: CÉU */}
        <SkyDome dayProgress={dayProgress} />
        
        {/* CAMADA 2: MAR (desligado em performance) */}
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
            nomeEmpresa={nomeEmpresa} 
            porte={porte} 
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