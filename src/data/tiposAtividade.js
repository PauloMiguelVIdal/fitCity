// src/data/tiposAtividade.js
import { Dumbbell, PersonStanding, Footprints, Bike } from 'lucide-react'

export const TIPOS_ATIVIDADE = {
  musculacao: { label: 'Musculação', Icon: Dumbbell, campos: ['tempo', 'calorias'] },
  corrida:    { label: 'Corrida',    Icon: PersonStanding, campos: ['tempo', 'distancia', 'calorias'] },
  caminhada:  { label: 'Caminhada',  Icon: Footprints, campos: ['tempo', 'distancia', 'calorias'] },
  // ciclismo:   { label: 'Ciclismo',   Icon: Bike, campos: ['tempo', 'distancia', 'calorias'] },
}