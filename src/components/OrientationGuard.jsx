// src/components/OrientationGuard.jsx
import { useEffect, useState } from 'react'

export default function OrientationGuard() {
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight)
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [])

  if (!isLandscape) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-fitcity-bg flex flex-col items-center justify-center text-white text-center p-8">
      <p className="text-lg font-semibold">Gire seu celular para o modo retrato 📱</p>
    </div>
  )
}