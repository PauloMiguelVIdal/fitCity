// src/hooks/useOrientationLock.js
import { useEffect } from 'react'

export function useOrientationLock() {
  useEffect(() => {
    const htmlEl = document.documentElement

    const tryNativeLock = async () => {
      if (screen?.orientation?.lock) {
        try { await screen.orientation.lock('portrait') } catch {}
      }
    }

    const applyFallback = () => {
      const isLandscape = window.innerWidth > window.innerHeight
      const isMobile =
        /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        window.matchMedia('(pointer: coarse)').matches

      htmlEl.toggleAttribute('data-force-portrait', isMobile && isLandscape)
    }

    tryNativeLock()
    applyFallback()

    window.addEventListener('resize', applyFallback)
    window.addEventListener('orientationchange', applyFallback)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') { tryNativeLock(); applyFallback() }
    })

    return () => {
      window.removeEventListener('resize', applyFallback)
      window.removeEventListener('orientationchange', applyFallback)
      htmlEl.removeAttribute('data-force-portrait')
    }
  }, [])
}