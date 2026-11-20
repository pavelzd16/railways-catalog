import { useEffect, useRef } from 'react'

/** Фактическая высота закреплённой панели, включая safe-area и смену ориентации. */
export function useBottomClearance(property: string) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const update = () => document.documentElement.style.setProperty(property, `${Math.ceil(element.getBoundingClientRect().height)}px`)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
      document.documentElement.style.removeProperty(property)
    }
  }, [property])
  return ref
}
