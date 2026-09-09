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


export default function App() {
  const [tab, setTab] = useState('inicio')
  const [modalAberto, setModalAberto] = useState(false)
  const { atividades, adicionarAtividade } = useAtividades()

  return (

    <div className="h-dvh w-full max-w-[480px] mx-auto flex flex-col bg-fitcity-bg relative overflow-hidden">
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





// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
     
//         <SpikeMap />
//         </GraphicsConfigProvider >
//       </>
//       )
// }