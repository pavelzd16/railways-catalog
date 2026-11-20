import { useEffect, useRef } from 'react'
import { setSiteOverlay } from './site-overlays'

const modalStack: HTMLElement[] = []
let previousOverflow = ''
let rootWasInert = false
const focusableSelector =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

export function useModalFocus(
  open: boolean,
  onOpenChange: (open: boolean) => void,
) {
  const panelRef = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onOpenChange)
  useEffect(() => {
    onChangeRef.current = onOpenChange
  }, [onOpenChange])

  useEffect(() => {
    const panel = panelRef.current
    if (!open || !panel) return
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const root = document.getElementById('root')
    if (!modalStack.length) {
      previousOverflow = document.body.style.overflow
      rootWasInert = root?.inert ?? false
      document.body.style.overflow = 'hidden'
      if (root) root.inert = true
    }
    modalStack.push(panel)
    setSiteOverlay({ modalActive: true })
    const focusable = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) =>
          element.getClientRects().length > 0 && !element.closest('[inert]'),
      )
    ;(focusable()[0] ?? panel).focus({ preventScroll: true })

    const handleKey = (event: KeyboardEvent) => {
      if (modalStack.at(-1) !== panel) return
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onChangeRef.current(false)
      } else if (event.key === 'Tab') {
        const elements = focusable()
        const first = elements[0]
        const last = elements.at(-1)
        if (!first || !last) {
          event.preventDefault()
          panel.focus()
        } else if (
          event.shiftKey &&
          (document.activeElement === first ||
            !panel.contains(document.activeElement))
        ) {
          event.preventDefault()
          last.focus()
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            !panel.contains(document.activeElement))
        ) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      const index = modalStack.indexOf(panel)
      if (index >= 0) modalStack.splice(index, 1)
      setSiteOverlay({ modalActive: modalStack.length > 0 })
      if (!modalStack.length) {
        document.body.style.overflow = previousOverflow
        if (root) root.inert = rootWasInert
      }
      if (previousFocus?.isConnected && !previousFocus.closest('[inert]'))
        previousFocus.focus({ preventScroll: true })
    }
  }, [open])
  return panelRef
}
