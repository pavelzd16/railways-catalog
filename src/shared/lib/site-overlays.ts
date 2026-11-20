import { useSyncExternalStore } from 'react'

const initial = { modalActive: false, chatOpen: false }
let state = initial
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}
const snapshot = () => state

export function setSiteOverlay(patch: Partial<typeof state>) {
  if (patch.modalActive) patch = { ...patch, chatOpen: false }
  if (Object.entries(patch).every(([key, value]) => state[key as keyof typeof state] === value)) return
  state = { ...state, ...patch }
  listeners.forEach(listener => listener())
}

export function setChatOpen(next: boolean | ((open: boolean) => boolean)) {
  setSiteOverlay({ chatOpen: !state.modalActive && (typeof next === 'function' ? next(state.chatOpen) : next) })
}

export function useSiteOverlays() {
  return useSyncExternalStore(subscribe, snapshot, () => initial)
}
