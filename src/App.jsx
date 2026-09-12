// src/App.jsx
import { useState } from 'react'
import BottomNav from './components/BottomNav'
import HomeScreen from './screens/HomeScreen'
import CityScreen from './screens/CityScreen'
import InventoryScreen from './screens/InventoryScreen'
import ActivitiesScreen from './screens/ActivitiesScreen'
import ProfileScreen from './screens/ProfileScreen'
import { GraphicsConfigProvider } from './components/GraphicsConfigContext'
import { useAtividades } from './hooks/useAtividades'
import RegistrarAtividadeModal from './components/RegistrarAtividadeModal'
import { useOrientationLock } from './hooks/useOrientationLock'  // 🔥 NOVO
import OrientationGuard from './components/OrientationGuard'

export default function App() {
  const [tab, setTab] = useState('inicio')
  const [modalAberto, setModalAberto] = useState(false)
  const { atividades, adicionarAtividade } = useAtividades()

  // 🔥 Força modo retrato sempre
  useOrientationLock()

  return (
<div 
// id="app-shell"
 className="h-dvh w-full max-w-[480px] mx-auto flex flex-col bg-fitcity-bg relative overflow-hidden">    
    {/* <OrientationGuard /> */}
      <GraphicsConfigProvider>
        <main className="flex-1 overflow-y-auto pb-[88px]">
          {tab === 'inicio' && (
            <HomeScreen onNavigate={setTab} atividades={atividades} onRegistrar={() => setModalAberto(true)} />
          )}
          {tab === 'cidade' && <CityScreen atividades={atividades} />}
          {tab === 'inventario' && <InventoryScreen />}
          {tab === 'atividades' && (
            <ActivitiesScreen atividades={atividades} onRegistrar={() => setModalAberto(true)} />
          )}
          {tab === 'perfil' && <ProfileScreen />}
        </main>
      </GraphicsConfigProvider>
      <BottomNav active={tab} onChange={setTab} />
      {modalAberto && (
        <RegistrarAtividadeModal onClose={() => setModalAberto(false)} onSalvar={adicionarAtividade} />
      )}
    </div>
  )
}

// import React, { useState } from 'react';
// import CardMinimal from './components/CardColection';
// import { GraphicsConfigProvider } from './components/GraphicsConfigContext'
// import CardUpgradeMock from './components/CardModal';
// // Dados de exemplo
// const dadosIniciais = {
//   agricultura: {
//     edificios: [
//       {
//         nome: "Plantação De Grãos",
//         quantidade: 2,
//         custoConstrucao: 150000,
//         lojasNecessarias: { terrenos: 1, lojasP: 0, lojasM: 0, lojasG: 0 },
//         construçõesNecessárias: [],
//         recursoDeConstrução: [],
//         powerUp: {
//           nível1: { quantidadeMínima: 0 },
//           nível2: { quantidadeMínima: 5 },
//           nível3: { quantidadeMínima: 25 }
//         },
//         finanças: {
//           faturamentoUnitário: 1200,
//           impostoFixo: 100,
//           impostoSobreFatu: 0.15
//         },
//         ForneceMelhoraEficiencia: [],
//         RecebeMelhoraEficiencia: []
//       }
//     ]
//   },
//   terrenos: { quantidade: 5, preçoConstrução: 50000 },
//   lojasP: { quantidade: 3, preçoConstrução: 80000, quantidadeNecTerreno: 1 },
//   lojasM: { quantidade: 2, preçoConstrução: 150000, quantidadeNecTerreno: 2 },
//   lojasG: { quantidade: 1, preçoConstrução: 300000, quantidadeNecTerreno: 3 }
// };

// function App() {
//   const [dados, setDados] = useState(dadosIniciais);

//   return (
//       <GraphicsConfigProvider>
//     <div style={{ padding: 40, background: '#0a0a1a', minHeight: '100vh' }}>

// <CardUpgradeMock/>
//     </div>
//      </GraphicsConfigProvider>
//   );
// }

// export default App;