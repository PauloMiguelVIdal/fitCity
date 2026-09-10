// // src/App.jsx
// import { useState } from 'react'
// import BottomNav from './components/BottomNav'
// import HomeScreen from './screens/HomeScreen'
// import CityScreen from './screens/CityScreen'
// import InventoryScreen from './screens/InventoryScreen'
// import ActivitiesScreen from './screens/ActivitiesScreen'
// import ProfileScreen from './screens/ProfileScreen'
// import { GraphicsConfigProvider } from './components/GraphicsConfigContext'
// import { useAtividades } from './hooks/useAtividades'
// import RegistrarAtividadeModal from './components/RegistrarAtividadeModal'
// import { MockCardTest } from './components/MockCardStandalone'

// export default function App() {
//   const [tab, setTab] = useState('inicio')
//   const [modalAberto, setModalAberto] = useState(false)
//   const { atividades, adicionarAtividade } = useAtividades()

//   return (

//     <div className="h-dvh w-full max-w-[480px] mx-auto flex flex-col bg-fitcity-bg relative overflow-hidden">
//            <GraphicsConfigProvider>
//       <main className="flex-1 overflow-y-auto pb-[88px]">
//         {tab === 'inicio' && (
//           <HomeScreen onNavigate={setTab} atividades={atividades} onRegistrar={() => setModalAberto(true)} />
//         )}
//        {tab === 'cidade' && <CityScreen atividades={atividades} />}
//         {tab === 'inventario' && <InventoryScreen />}
//         {tab === 'atividades' && (
//           <ActivitiesScreen atividades={atividades} onRegistrar={() => setModalAberto(true)} />
//         )}
//         {tab === 'perfil' && <ProfileScreen />}
//       </main>
//       </GraphicsConfigProvider>
//       <BottomNav active={tab} onChange={setTab} />
//       {modalAberto && (
//         <RegistrarAtividadeModal onClose={() => setModalAberto(false)} onSalvar={adicionarAtividade} />
//       )}
//     </div>
//   )
// }





import React, { useState } from 'react';
import CardMinimal from './components/CardColection';
import { GraphicsConfigProvider } from './components/GraphicsConfigContext'
import CardUpgradeMock from './components/CardModal';
// Dados de exemplo
const dadosIniciais = {
  agricultura: {
    edificios: [
      {
        nome: "Plantação De Grãos",
        quantidade: 2,
        custoConstrucao: 150000,
        lojasNecessarias: { terrenos: 1, lojasP: 0, lojasM: 0, lojasG: 0 },
        construçõesNecessárias: [],
        recursoDeConstrução: [],
        powerUp: {
          nível1: { quantidadeMínima: 0 },
          nível2: { quantidadeMínima: 5 },
          nível3: { quantidadeMínima: 25 }
        },
        finanças: {
          faturamentoUnitário: 1200,
          impostoFixo: 100,
          impostoSobreFatu: 0.15
        },
        ForneceMelhoraEficiencia: [],
        RecebeMelhoraEficiencia: []
      }
    ]
  },
  // terrenos: { quantidade: 5, preçoConstrução: 50000 },
  // lojasP: { quantidade: 3, preçoConstrução: 80000, quantidadeNecTerreno: 1 },
  // lojasM: { quantidade: 2, preçoConstrução: 150000, quantidadeNecTerreno: 2 },
  // lojasG: { quantidade: 1, preçoConstrução: 300000, quantidadeNecTerreno: 3 }
};

function App() {
  const [dados, setDados] = useState(dadosIniciais);


  // const handleComprar = ({ setor, index, edificio, custoConstrucao, lojasNecessarias }) => {
  //   // Atualiza quantidade do edifício
  //   setDados(prev => {
  //     const novo = { ...prev };
  //     novo[setor].edificios[index] = {
  //       ...edificio,
  //       quantidade: (edificio.quantidade || 0) + 1
  //     };
  //     // Consome lojas
  //     novo.terrenos.quantidade -= lojasNecessarias.terrenos || 0;
  //     novo.lojasP.quantidade -= lojasNecessarias.lojasP || 0;
  //     novo.lojasM.quantidade -= lojasNecessarias.lojasM || 0;
  //     novo.lojasG.quantidade -= lojasNecessarias.lojasG || 0;
  //     return novo;
  //   });

  //   // Atualiza saldo e patrimônio
  //   setSaldo(prev => prev - custoConstrucao);
  //   setPatrimonio(prev => prev + custoConstrucao);
  // };

  return (
      <GraphicsConfigProvider>
    <div style={{ padding: 40, background: '#0a0a1a', minHeight: '100vh' }}>
{/* <CardMinimal
  nome="Plantação De Grãos"
  setor="agricultura"
  quantidade={12}
  custo={750000}
  setorLabel="Agricultura"
  powerUp={{ nível1: { quantidadeMínima: 0 }, nível2: { quantidadeMínima: 5 }, nível3: { quantidadeMínima: 25 } }}
  categoria="producao"
/> */}
<CardUpgradeMock/>
    </div>
     </GraphicsConfigProvider>
  );
}

export default App;