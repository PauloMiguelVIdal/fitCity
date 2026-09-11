// src/components/BottomNav.jsx
import { Home, Building2, Package, Activity, User } from 'lucide-react'

const TABS = [
  { id: 'inicio', label: 'Início', Icon: Home },
  { id: 'cidade', label: 'Cidade', Icon: Building2 },
  { id: 'inventario', label: 'Inventário', Icon: Package },
  { id: 'atividades', label: 'Atividades', Icon: Activity },
  { id: 'perfil', label: 'Perfil', Icon: User },
]

export default function BottomNav({ active, onChange }) {
  return (
    <footer className="absolute bottom-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-t border-white/10 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
      <div className="flex w-full justify-around items-center">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 touch-manipulation"
            >
              <div
                className={
                  isActive
                    ? 'rounded-xl p-1.5 bg-gradient-to-br from-fitcity-energy to-orange-600 shadow-[0_4px_14px_rgba(242,116,5,0.55)]'
                    : 'rounded-xl p-1.5'
                }
              >
                <Icon size={20} strokeWidth={2} className={isActive ? 'text-white' : 'text-white/40'} />
              </div>
              <span className={`text-[10px] ${isActive ? 'text-fitcity-energy font-semibold' : 'text-white/40'}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </footer>
  )
}