// src/hooks/usePatrimonioMap.js
import { useMemo, useCallback, useState, useEffect } from 'react'
import { defineHex, Grid, spiral } from 'honeycomb-grid'
import { MODELOS, EDIFICIO_PARA_MODELO } from '../components/BuildingModels'
import { useFitCityStore } from '../store/fitCityStore'

const HEX_SIZE = 0.6

const HEX_DIRECTIONS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]
const vizinhosDeHex = (q, r) => HEX_DIRECTIONS.map(([dq, dr]) => `${q + dq},${r + dr}`)

const TABELA_NIVEIS_PATRIMONIO = [
  { nivel: 1,  porte: 'Micro Empresa',             raio: 3, cartasMin: 1  },
  { nivel: 2,  porte: 'Sociedade Limitada',        raio: 3, cartasMin: 5  },
  { nivel: 3,  porte: 'Empresa Regional',          raio: 3, cartasMin: 10 },
  { nivel: 4,  porte: 'Companhia Local',           raio: 4, cartasMin: 16 },
  { nivel: 5,  porte: 'Empresa Estadual',          raio: 5, cartasMin: 24 },
  { nivel: 6,  porte: 'Companhia Nacional',        raio: 6, cartasMin: 32 },
  { nivel: 7,  porte: 'Corporação Multissetorial', raio: 6, cartasMin: 40 },
  { nivel: 8,  porte: 'Grupo Empresarial',         raio: 7, cartasMin: 48 },
  { nivel: 9,  porte: 'Conglomerado Global',       raio: 7, cartasMin: 56 },
  { nivel: 10, porte: 'Mega Holding',              raio: 8, cartasMin: 65 },
]

function calcularNivelPatrimonio(cartasUnicas) {
  let resultado = TABELA_NIVEIS_PATRIMONIO[0]
  for (const item of TABELA_NIVEIS_PATRIMONIO) {
    if (cartasUnicas >= item.cartasMin) resultado = item
    else break
  }
  return resultado
}

function proximoNivelPatrimonio(cartasUnicas) {
  const atual = calcularNivelPatrimonio(cartasUnicas)
  const idx = TABELA_NIVEIS_PATRIMONIO.findIndex((n) => n.nivel === atual.nivel)
  if (idx < 0 || idx >= TABELA_NIVEIS_PATRIMONIO.length - 1) return null
  return TABELA_NIVEIS_PATRIMONIO[idx + 1]
}

const edificioEhCluster = (() => {
  const cache = new Map()
  return (nomeEdificio) => {
    if (!nomeEdificio) return false
    if (cache.has(nomeEdificio)) return cache.get(nomeEdificio)
    const modeloId = EDIFICIO_PARA_MODELO[nomeEdificio]
    const result = modeloId ? MODELOS[modeloId]?.tamanho === 7 : false
    cache.set(nomeEdificio, result)
    return result
  }
})()

export function usePatrimonioMap() {
  const inventario = useFitCityStore((s) => s.inventario)
  const catalogo = useFitCityStore((s) => s.catalogo)
  const posicoesSalvas = useFitCityStore((s) => s.cidade.posicoesPatrimonio)
  const posicionarCarta = useFitCityStore((s) => s.posicionarCartaPatrimonio)

  const cartasInventario = inventario?.cartas || {}
  const cartasCatalogo = catalogo?.cartas || {}

  const cartasPossuidas = useMemo(() => {
    return Object.values(cartasCatalogo)
      .map((carta) => {
        const item = cartasInventario[carta.id]
        const quantidade = item?.quantidade || 0
        if (quantidade <= 0) return null
        return {
          id: carta.id,
          nome: carta.nome,
          raridade: carta.raridade,
          setor: carta.setor,
          quantidade,
        }
      })
      .filter(Boolean)
  }, [cartasCatalogo, cartasInventario])

  const cartasUnicas = cartasPossuidas.length
  const totalCartasPossuidas = useMemo(
    () => cartasPossuidas.reduce((acc, c) => acc + c.quantidade, 0),
    [cartasPossuidas]
  )
  const totalCatalogo = Object.keys(cartasCatalogo).length

  const nivelAtual = useMemo(
    () => calcularNivelPatrimonio(cartasUnicas),
    [cartasUnicas]
  )
  const proximo = useMemo(
    () => proximoNivelPatrimonio(cartasUnicas),
    [cartasUnicas]
  )
  const porte = nivelAtual.porte
  const raioMapa = nivelAtual.raio
  const ultimoNivel = !proximo

  const edificiosAtivos = useMemo(() => {
    return cartasPossuidas.map((carta) => ({
      id: carta.id,
      nome: carta.nome,
      setor: carta.setor,
      raridade: carta.raridade,
      quantidade: carta.quantidade,
      ehCluster: edificioEhCluster(carta.nome),
    }))
  }, [cartasPossuidas])

  const hexGrid = useMemo(() => {
    const Tile = defineHex({ dimensions: HEX_SIZE, orientation: 'pointy' })
    return Array.from(new Grid(Tile, spiral({ center: [0, 0], radius: raioMapa })))
  }, [raioMapa])

  const hexMap = useMemo(() => {
    const map = new Map()
    hexGrid.forEach((h) => map.set(`${h.q},${h.r}`, h))
    return map
  }, [hexGrid])

  const edificioPorId = useMemo(() => {
    const map = new Map()
    edificiosAtivos.forEach((e) => map.set(e.id, e))
    return map
  }, [edificiosAtivos])

  const [posicoes, setPosicoes] = useState({})

  useEffect(() => {
    const gridKeys = new Set(hexGrid.map((h) => `${h.q},${h.r}`))
    const idsAtivos = new Set(edificiosAtivos.map((e) => e.id))

    const ocupadas = new Set(['0,0'])
    const novasPosicoes = {}

    Object.entries(posicoesSalvas || {}).forEach(([hexKey, cartaId]) => {
      if (hexKey === '0,0') return
      if (!idsAtivos.has(cartaId)) return
      if (!gridKeys.has(hexKey)) return
      if (ocupadas.has(hexKey)) return

      novasPosicoes[hexKey] = cartaId
      ocupadas.add(hexKey)

      const ed = edificioPorId.get(cartaId)
      if (ed?.ehCluster) {
        const [q, r] = hexKey.split(',').map(Number)
        vizinhosDeHex(q, r).forEach((vk) => {
          if (vk !== '0,0') ocupadas.add(vk)
        })
      }
    })

    const keys = hexGrid
      .map((h) => `${h.q},${h.r}`)
      .sort((a, b) => {
        const [aq, ar] = a.split(',').map(Number)
        const [bq, br] = b.split(',').map(Number)
        return (aq * aq + ar * ar) - (bq * bq + br * br)
      })

    const proximoLivre = (pred = null) => {
      for (const k of keys) {
        if (k === '0,0') continue
        if (ocupadas.has(k)) continue
        if (pred && !pred(k)) continue
        return k
      }
      return null
    }

    const idsJaAlocados = new Set(Object.values(novasPosicoes))
    const clusters = edificiosAtivos.filter((ed) => ed.ehCluster && !idsJaAlocados.has(ed.id))
    const simples = edificiosAtivos.filter((ed) => !ed.ehCluster && !idsJaAlocados.has(ed.id))

    clusters.forEach((ed) => {
      const central = proximoLivre((k) => {
        const [cq, cr] = k.split(',').map(Number)
        return vizinhosDeHex(cq, cr).every((vk) => {
          if (vk === '0,0') return false
          return !ocupadas.has(vk) && gridKeys.has(vk)
        })
      })
      if (central) {
        const [cq, cr] = central.split(',').map(Number)
        novasPosicoes[central] = ed.id
        ocupadas.add(central)
        vizinhosDeHex(cq, cr).forEach((vk) => {
          if (vk !== '0,0') ocupadas.add(vk)
        })
      }
    })

    simples.forEach((ed) => {
      const pos = proximoLivre()
      if (pos) {
        novasPosicoes[pos] = ed.id
        ocupadas.add(pos)
      }
    })

    setPosicoes(novasPosicoes)

    Object.entries(novasPosicoes).forEach(([hexKey, cartaId]) => {
      if (posicoesSalvas?.[hexKey] !== cartaId) {
        posicionarCarta(cartaId, hexKey)
      }
    })
  }, [edificiosAtivos, hexGrid, edificioPorId, posicoesSalvas, posicionarCarta])

  const satelites = useMemo(() => {
    const mapa = {}
    Object.entries(posicoes).forEach(([key, id]) => {
      const ed = edificioPorId.get(id)
      if (!ed?.ehCluster) return

      const modeloId = EDIFICIO_PARA_MODELO[ed.nome]
      const modeloDef = modeloId ? MODELOS[modeloId] : null
      const defSats = modeloDef?.satelites || []

      const [q, r] = key.split(',').map(Number)
      vizinhosDeHex(q, r).forEach((vk, i) => {
        if (vk === '0,0') return
        if (!posicoes[vk]) {
          mapa[vk] = {
            corTopo: undefined,
            corFallback: '#888888',
            modeloId: defSats[i]?.modeloId ?? null,
          }
        }
      })
    })
    return mapa
  }, [posicoes, edificioPorId])

  const tilesToRender = useMemo(() => {
    return hexGrid
      .map((h) => ({ hex: h, key: `${h.q},${h.r}` }))
      .filter(({ key }) => key !== '0,0' && !satelites[key])
  }, [hexGrid, satelites])

  const nivelProgresso = useMemo(() => {
    if (ultimoNivel) {
      return { atual: cartasUnicas, meta: nivelAtual.cartasMin, pct: 100, faltam: 0 }
    }
    const cartasAtual = nivelAtual.cartasMin
    const cartasProx = proximo.cartasMin
    const pct = ((cartasUnicas - cartasAtual) / (cartasProx - cartasAtual)) * 100
    return {
      atual: cartasUnicas,
      meta: cartasProx,
      pct: Math.min(100, Math.max(0, pct)),
      faltam: Math.max(0, cartasProx - cartasUnicas),
    }
  }, [cartasUnicas, nivelAtual, proximo, ultimoNivel])

  return {
    cartasPossuidas,
    cartasUnicas,
    totalCartasPossuidas,
    totalCatalogo,

    nivelAtual,
    proximo,
    porte,
    raioMapa,
    ultimoNivel,
    nivelProgresso,

    edificiosAtivos,
    posicoes,
    satelites,
    tilesToRender,
    hexMap,
    edificioPorId,
    temCartas: cartasUnicas > 0,
  }
}