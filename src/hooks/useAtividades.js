// src/hooks/useAtividades.js
import { useState, useCallback, useEffect } from 'react'
import { calcularMoedas } from '../utils/atividades'

const STORAGE_KEY = 'fitcity:atividades'

const gerarId = () =>
  crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`

function lerAtividades() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const dados = raw ? JSON.parse(raw) : []
    
    // Garante que cada atividade tenha moedas calculadas
    return dados.map(a => ({
      ...a,
      moedas: a.moedas || calcularMoedas(a)
    }))
  } catch {
    return []
  }
}

function gravarAtividades(lista) {
  try { 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista)) 
  } catch (error) {
    console.warn('Erro ao gravar atividades:', error)
  }
}

// ============================================================
// HOOK PRINCIPAL
// ============================================================

export function useAtividades() {
  const [atividades, setAtividades] = useState(() => lerAtividades())
  const [loading, setLoading] = useState(false)

  // ============================================================
  // ADICIONAR ATIVIDADE
  // ============================================================
  const adicionarAtividade = useCallback((dados) => {
    setLoading(true)
    
    try {
      // Calcula as moedas automaticamente
      const moedas = calcularMoedas(dados)
      
      const novaAtividade = {
        ...dados,
        id: gerarId(),
        data: new Date().toISOString(),
        moedas: moedas,
      }

      setAtividades(prev => {
        const novaLista = [novaAtividade, ...prev]
        gravarAtividades(novaLista)
        return novaLista
      })

      return novaAtividade
    } catch (error) {
      console.error('Erro ao adicionar atividade:', error)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // ============================================================
  // REMOVER ATIVIDADE
  // ============================================================
  const removerAtividade = useCallback((id) => {
    setAtividades(prev => {
      const novaLista = prev.filter(a => a.id !== id)
      gravarAtividades(novaLista)
      return novaLista
    })
  }, [])

  // ============================================================
  // ATUALIZAR ATIVIDADE
  // ============================================================
  const atualizarAtividade = useCallback((id, novosDados) => {
    setAtividades(prev => {
      const index = prev.findIndex(a => a.id === id)
      if (index === -1) return prev

      const atividadeAtual = prev[index]
      
      // Recalcula moedas se os dados mudaram
      const dadosAtualizados = {
        ...atividadeAtual,
        ...novosDados,
      }
      
      // Se os dados relevantes mudaram, recalcula as moedas
      if (
        novosDados.tipo !== undefined ||
        novosDados.tempo !== undefined ||
        novosDados.distancia !== undefined ||
        novosDados.calorias !== undefined
      ) {
        dadosAtualizados.moedas = calcularMoedas(dadosAtualizados)
      }

      const novaLista = [
        ...prev.slice(0, index),
        dadosAtualizados,
        ...prev.slice(index + 1),
      ]
      
      gravarAtividades(novaLista)
      return novaLista
    })
  }, [])

  // ============================================================
  // RECALCULAR TODAS AS MOEDAS
  // ============================================================
  const recalcularMoedas = useCallback(() => {
    setAtividades(prev => {
      const novaLista = prev.map(a => ({
        ...a,
        moedas: calcularMoedas(a)
      }))
      gravarAtividades(novaLista)
      return novaLista
    })
  }, [])

  // ============================================================
  // LIMPAR ATIVIDADES
  // ============================================================
  const limparAtividades = useCallback(() => {
    setAtividades([])
    gravarAtividades([])
  }, [])

  // ============================================================
  // FILTRAR POR PERÍODO
  // ============================================================
  const filtrarPorPeriodo = useCallback((periodo) => {
    const filtros = {
      hoje: (data) => new Date(data).toDateString() === new Date().toDateString(),
      semana: (data) => {
        const diff = (new Date() - new Date(data)) / (1000 * 60 * 60 * 24)
        return diff >= 0 && diff < 7
      },
      mes: (data) => {
        const d = new Date(data)
        const h = new Date()
        return d.getMonth() === h.getMonth() && d.getFullYear() === h.getFullYear()
      },
      todos: () => true,
    }

    const filtro = filtros[periodo] || filtros.todos
    return atividades.filter(a => filtro(a.data))
  }, [atividades])

  // ============================================================
  // RESUMO POR PERÍODO
  // ============================================================
  const resumoPorPeriodo = useCallback((periodo = 'todos') => {
    const filtradas = filtrarPorPeriodo(periodo)
    
    return filtradas.reduce((acc, a) => ({
      calorias: acc.calorias + (a.calorias || 0),
      distancia: acc.distancia + (a.distancia || 0),
      tempo: acc.tempo + (a.tempo || 0),
      moedas: acc.moedas + (a.moedas || 0),
      atividades: acc.atividades + 1,
    }), {
      calorias: 0,
      distancia: 0,
      tempo: 0,
      moedas: 0,
      atividades: 0,
    })
  }, [filtrarPorPeriodo])

  // ============================================================
  // ORDENAR ATIVIDADES
  // ============================================================
  const ordenarPor = useCallback((campo = 'data', direcao = 'desc') => {
    const sorted = [...atividades].sort((a, b) => {
      const valA = a[campo] || 0
      const valB = b[campo] || 0
      
      if (typeof valA === 'string') {
        return direcao === 'desc' 
          ? valB.localeCompare(valA)
          : valA.localeCompare(valB)
      }
      
      return direcao === 'desc' ? valB - valA : valA - valB
    })
    
    return sorted
  }, [atividades])

  // ============================================================
  // ESTATÍSTICAS GERAIS
  // ============================================================
  const estatisticas = useCallback(() => {
    const total = atividades.length
    
    if (total === 0) {
      return {
        total: 0,
        totalMoedas: 0,
        totalCalorias: 0,
        totalDistancia: 0,
        totalTempo: 0,
        mediaPorAtividade: 0,
        porTipo: {},
        porRaridade: {},
      }
    }

    const resumo = atividades.reduce((acc, a) => {
      // Por tipo
      const tipo = a.tipo || 'outro'
      acc.porTipo[tipo] = (acc.porTipo[tipo] || 0) + 1

      // Por raridade
      const raridade = a.raridade || 'comum'
      acc.porRaridade[raridade] = (acc.porRaridade[raridade] || 0) + 1

      return {
        totalMoedas: acc.totalMoedas + (a.moedas || 0),
        totalCalorias: acc.totalCalorias + (a.calorias || 0),
        totalDistancia: acc.totalDistancia + (a.distancia || 0),
        totalTempo: acc.totalTempo + (a.tempo || 0),
        porTipo: acc.porTipo,
        porRaridade: acc.porRaridade,
      }
    }, {
      totalMoedas: 0,
      totalCalorias: 0,
      totalDistancia: 0,
      totalTempo: 0,
      porTipo: {},
      porRaridade: {},
    })

    return {
      total,
      ...resumo,
      mediaPorAtividade: Math.round(resumo.totalMoedas / total),
    }
  }, [atividades])

  // ============================================================
  // RETORNO
  // ============================================================
  return {
    // Dados
    atividades,
    loading,
    
    // CRUD
    adicionarAtividade,
    removerAtividade,
    atualizarAtividade,
    limparAtividades,
    
    // Utilitários
    recalcularMoedas,
    filtrarPorPeriodo,
    resumoPorPeriodo,
    ordenarPor,
    estatisticas,
    
    // Total
    total: atividades.length,
  }
}