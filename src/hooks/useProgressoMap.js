// src/hooks/useProgressoMap.js
import { useMemo } from 'react'
import { defineHex, Grid, spiral } from 'honeycomb-grid'
import { MODELOS, EDIFICIO_PARA_MODELO } from '../components/BuildingModels'
import { resolverVisualEdificio } from '../data/edificiosVisual'
import { edificioNivelPorAtividade, setorPorAtividade } from '../utils/atividades'

const HEX_SIZE = 0.6

const HEX_DIRECTIONS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]
const vizinhosDeHex = (q, r) => HEX_DIRECTIONS.map(([dq, dr]) => `${q + dq},${r + dr}`)

/**
 * Constrói o "mapa de progresso" — o mesmo grid que o CidadeProgresso
 * renderiza, mas SEM interação (read-only, usado no mini mapa da Home/Activities).
 *
 * Recebe:
 *   - `atividades` — array de atividades (da store ou props)
 *   - `edificiosAtivos` — (opcional) se vier, pula o cálculo a partir de atividades
 *   - `raioMapa` — raio do grid (vem do nível)
 *
 * Retorna tudo que o MapWorldActivities precisa pra renderizar.
 */
export function useProgressoMap({
  atividades = [],
  edificiosAtivos: edificiosAtivosProp = null,
  raioMapa,
}) {
  // ─── Edifícios (do prop ou derivados das atividades) ───
  const edificiosAtivos = useMemo(() => {
    if (edificiosAtivosProp) {
      return Object.values(edificiosAtivosProp)
    }

    const tipos = ['corrida', 'musculacao', 'caminhada']
    return atividades
      .filter((a) => tipos.includes(a.tipo))
      .map((atividade, idx) => {
        const edificioNivel = edificioNivelPorAtividade(atividade)
        const setor = setorPorAtividade(atividade)

        const visual = resolverVisualEdificio(edificioNivel, setor)
        if (!visual?.nome) return null

        const modeloId = EDIFICIO_PARA_MODELO[visual.nome]
        const modeloDef = modeloId ? MODELOS[modeloId] : null

        return {
          id: atividade.id ?? `atv-${idx}`,
          nome: visual.nome,
          setor,
          edificioNivel,
          ehCluster: modeloDef?.tamanho === 7,
          ehComposto: modeloDef?.tipo === 'composto',
        }
      })
      .filter(Boolean)
  }, [atividades, edificiosAtivosProp])

  // ─── Hex Grid ───
  const hexGrid = useMemo(() => {
    const Tile = defineHex({ dimensions: HEX_SIZE, orientation: 'pointy' })
    return Array.from(new Grid(Tile, spiral({ center: [0, 0], radius: raioMapa })))
  }, [raioMapa])

  const hexMap = useMemo(() => {
    const m = new Map()
    hexGrid.forEach((h) => m.set(`${h.q},${h.r}`, h))
    return m
  }, [hexGrid])

  const edificioPorId = useMemo(() => {
    const m = new Map()
    edificiosAtivos.forEach((e) => m.set(e.id, e))
    return m
  }, [edificiosAtivos])

  // ─── Posições (auto-organiza em espiral) ───
  const posicoes = useMemo(() => {
    const gridKeys = new Set(hexGrid.map((h) => `${h.q},${h.r}`))
    const ocupadas = new Set(['0,0'])
    const novas = {}

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

    // 1) Clusters primeiro
    edificiosAtivos.filter((e) => e.ehCluster).forEach((ed) => {
      const central = proximoLivre((k) => {
        const [cq, cr] = k.split(',').map(Number)
        return vizinhosDeHex(cq, cr).every((vk) => {
          if (vk === '0,0') return false
          return !ocupadas.has(vk) && gridKeys.has(vk)
        })
      })
      if (central) {
        const [cq, cr] = central.split(',').map(Number)
        novas[central] = ed.id
        ocupadas.add(central)
        vizinhosDeHex(cq, cr).forEach((vk) => vk !== '0,0' && ocupadas.add(vk))
      }
    })

    // 2) Simples
    edificiosAtivos.filter((e) => !e.ehCluster).forEach((ed) => {
      const pos = proximoLivre()
      if (pos) {
        novas[pos] = ed.id
        ocupadas.add(pos)
      }
    })

    return novas
  }, [edificiosAtivos, hexGrid])

  // ─── Satélites dos clusters ───
  const satelites = useMemo(() => {
    const m = {}
    Object.entries(posicoes).forEach(([key, id]) => {
      const ed = edificioPorId.get(id)
      if (!ed) return

      const visual = resolverVisualEdificio(ed.edificioNivel, ed.setor)
      if (!visual?.nome) return

      const modeloId = EDIFICIO_PARA_MODELO[visual.nome]
      const modeloDef = modeloId ? MODELOS[modeloId] : null

      if (!modeloDef?.tamanho || modeloDef.tamanho !== 7) return

      const defSats = modeloDef?.satelites || []
      const [q, r] = key.split(',').map(Number)

      vizinhosDeHex(q, r).forEach((vk, i) => {
        if (vk === '0,0') return
        if (!posicoes[vk]) {
          m[vk] = {
            corTopo: undefined,
            corFallback: '#888888',
            modeloId: defSats[i]?.modeloId ?? null,
            edificioDono: ed,
          }
        }
      })
    })
    return m
  }, [posicoes, edificioPorId])

  // ─── Tiles ───
  const tilesToRender = useMemo(
    () =>
      hexGrid
        .map((h) => ({ hex: h, key: `${h.q},${h.r}` }))
        .filter(({ key }) => key !== '0,0' && !satelites[key]),
    [hexGrid, satelites]
  )

  return {
    edificiosAtivos,
    hexGrid,
    hexMap,
    edificioPorId,
    posicoes,
    satelites,
    tilesToRender,
  }
}