// src/widgets/shipment-map/DorogaIgra.tsx
// Дорога под цифрой «1 500 км» — мини-игра на трёх полосах. Навели курсор — рулите сами
// (полоса под курсором), убрали — рулит «второй водитель». Упёрлись в машину — резкий тормоз.
// Логика — model/igra.ts, здесь только холст и управление.
import { useEffect, useRef, useState } from 'react'
import { FiShield } from 'react-icons/fi'
import { DLINA_GRUZOVIKA, KM_NA_PX, POLOS, novayaIgra, polosaPoY, shag, stopSignal, type Igra } from './model/igra.ts'

type Kto = 'avtopilot' | 'mysh' | 'palec' | 'klaviatura'

const VYSOTA = 84
const PALEC_MS = 3000 // после касания руль возвращается второму водителю

const PODSKAZKA: Record<Kto, string> = {
  avtopilot: 'За рулём второй водитель. Наведите на дорогу или нажмите на неё — порулите сами',
  mysh: 'Рулите вы: курсор выше или ниже — другая полоса',
  palec: 'Рулите вы: нажимайте на полосу, чтобы перестроиться',
  klaviatura: 'Рулите вы: стрелки вверх и вниз',
}

const CVETA_MASHIN = ['#60a5fa', '#e5e7eb', '#4ade80', '#fbbf24', '#94a3b8']

interface Cveta {
  doroga: string
  pricep: string
  kabina: string
}

function cvetSayta(imya: string, alfa = 1) {
  const [h, s, l] = getComputedStyle(document.documentElement).getPropertyValue(imya).trim().split(/\s+/)
  return h && s && l ? `hsla(${h}, ${s}, ${l}, ${alfa})` : '#333'
}

function pryamougolnik(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r)
  else ctx.rect(x, y, w, h)
  ctx.fill()
}

function risovat(ctx: CanvasRenderingContext2D, igra: Igra, c: Cveta) {
  const { shirina: w, vysota: h } = igra
  const polosa = h / POLOS
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = c.doroga
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.fillRect(0, 3, w, 1.5)
  ctx.fillRect(0, h - 4.5, w, 1.5)
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  const sdvig = ((igra.sdvig % 30) + 30) % 30
  for (let p = 1; p < POLOS; p++) {
    for (let x = -sdvig; x < w; x += 30) ctx.fillRect(x, p * polosa - 1, 16, 2)
  }

  const vm = polosa * 0.52
  for (const m of igra.mashiny) {
    const y = (m.polosa + 0.5) * polosa - vm / 2
    ctx.fillStyle = CVETA_MASHIN[m.cvet]
    pryamougolnik(ctx, m.x, y, m.dlina, vm, 4)
    ctx.fillStyle = 'rgba(15,23,42,0.55)'
    pryamougolnik(ctx, m.x + m.dlina * 0.58, y + 2, m.dlina * 0.2, vm - 4, 2)
    pryamougolnik(ctx, m.x + m.dlina * 0.12, y + 3, m.dlina * 0.12, vm - 6, 2)
  }

  const g = igra.gruzovik
  const vg = polosa * 0.58
  const y = (g.y + 0.5) * polosa - vg / 2
  // В первые доли секунды резкого торможения грузовик дёргается
  const x = g.x + (igra.tormoz > 1.2 ? Math.sin(igra.tormoz * 90) * 1.5 : 0)
  ctx.fillStyle = c.pricep
  pryamougolnik(ctx, x, y, DLINA_GRUZOVIKA - 12, vg, 2)
  ctx.fillStyle = c.kabina
  pryamougolnik(ctx, x + DLINA_GRUZOVIKA - 11, y + 1, 11, vg - 2, 3)
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  pryamougolnik(ctx, x + DLINA_GRUZOVIKA - 5, y + 3, 3, vg - 6, 1)

  const stop = stopSignal(igra)
  if (stop > 0) {
    ctx.fillStyle = `rgba(239,68,68,${stop})`
    ctx.shadowColor = 'rgba(239,68,68,0.9)'
    ctx.shadowBlur = 8 * stop
    ctx.fillRect(x - 1.5, y + 1.5, 3, 4)
    ctx.fillRect(x - 1.5, y + vg - 5.5, 3, 4)
    ctx.shadowBlur = 0
  }
}

export function DorogaIgra() {
  const holst = useRef<HTMLCanvasElement>(null)
  const igraRef = useRef<Igra | null>(null)
  const upravlenie = useRef<number | null>(null)
  const zapustitRef = useRef<() => void>(() => {})
  const taymer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [kto, setKto] = useState<Kto>('avtopilot')
  const [tormoz, setTormoz] = useState(false)
  const [km, setKm] = useState(0)

  useEffect(() => {
    const canvas = holst.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const medlenno = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cveta: Cveta = {
      doroga: cvetSayta('--foreground', 0.9),
      pricep: cvetSayta('--accent'),
      kabina: cvetSayta('--primary'),
    }
    let igra = novayaIgra(canvas.clientWidth || 300, VYSOTA)
    igraRef.current = igra
    let raf = 0
    let pred = 0
    let vidno = false
    let kmPokazano = -1
    let kmKogda = 0

    const razmer = () => {
      const w = canvas.clientWidth
      if (!w) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(VYSOTA * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (Math.abs(w - igra.shirina) > 1) {
        igra = novayaIgra(w, VYSOTA)
        igraRef.current = igra
      }
      risovat(ctx, igra, cveta)
    }

    const kadr = (t: number) => {
      raf = 0
      const dt = pred ? (t - pred) / 1000 : 0
      pred = t
      const sobytie = shag(igra, dt, upravlenie.current, Math.random)
      if (sobytie === 'tormoz') setTormoz(true)
      if (sobytie === 'poehali') setTormoz(false)
      const kmSeychas = Math.floor(igra.proydeno * KM_NA_PX)
      if (kmSeychas !== kmPokazano && (t - kmKogda > 200 || kmSeychas === 0)) {
        kmPokazano = kmSeychas
        kmKogda = t
        setKm(kmSeychas)
      }
      risovat(ctx, igra, cveta)
      zapustit()
    }

    // Крутим кадры, только пока дорогу видно; при «меньше движения» — только когда рулит человек.
    const zapustit = () => {
      const nado =
        vidno && !document.hidden && (!medlenno || upravlenie.current !== null || igra.tormoz > 0)
      if (nado && !raf) raf = requestAnimationFrame(kadr)
      if (!nado) pred = 0
    }
    zapustitRef.current = zapustit

    const nablyudatel = new IntersectionObserver((zapisi) => {
      vidno = zapisi.some((z) => z.isIntersecting)
      zapustit()
    })
    nablyudatel.observe(canvas)
    const razmerNablyudatel = new ResizeObserver(razmer)
    razmerNablyudatel.observe(canvas)
    document.addEventListener('visibilitychange', zapustit)
    razmer()

    return () => {
      cancelAnimationFrame(raf)
      nablyudatel.disconnect()
      razmerNablyudatel.disconnect()
      document.removeEventListener('visibilitychange', zapustit)
      clearTimeout(taymer.current)
    }
  }, [])

  const polosaUkazatelya = (e: React.PointerEvent<HTMLCanvasElement>) =>
    polosaPoY(e.clientY - e.currentTarget.getBoundingClientRect().top, VYSOTA)

  const vzyatRul = (polosa: number, kem: Kto) => {
    upravlenie.current = polosa
    setKto(kem)
    zapustitRef.current()
  }

  const otdatRul = () => {
    upravlenie.current = null
    setKto('avtopilot')
  }

  return (
    <div className="tranzit-igra">
      <div className="tranzit-igra-doroga">
        <canvas
          ref={holst}
          tabIndex={0}
          aria-label="Мини-игра: грузовик объезжает машины на трёх полосах. Стрелки вверх и вниз — смена полосы"
          onPointerMove={(e) => {
            if (e.pointerType === 'mouse') vzyatRul(polosaUkazatelya(e), 'mysh')
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === 'mouse') otdatRul()
          }}
          onPointerDown={(e) => {
            if (e.pointerType === 'mouse') return
            vzyatRul(polosaUkazatelya(e), 'palec')
            clearTimeout(taymer.current)
            taymer.current = setTimeout(otdatRul, PALEC_MS)
          }}
          onKeyDown={(e) => {
            if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
            e.preventDefault()
            const seychas = upravlenie.current ?? igraRef.current?.gruzovik.cel ?? 1
            const polosa = Math.max(0, Math.min(POLOS - 1, seychas + (e.key === 'ArrowUp' ? -1 : 1)))
            vzyatRul(polosa, 'klaviatura')
          }}
          onBlur={() => {
            if (kto === 'klaviatura') otdatRul()
          }}
        />
        <div className="tranzit-tormoz" role="status" aria-live="polite">
          {tormoz && (
            <p>
              <FiShield aria-hidden="true" />
              <span>
                <b>Резкий тормоз!</b> Всё в порядке — груз цел и застрахован.
              </span>
            </p>
          )}
        </div>
      </div>
      <div className="tranzit-igra-podpis">
        <span>{PODSKAZKA[kto]}</span>
        <span className="tranzit-igra-km">Без торможений: {km} км</span>
      </div>
    </div>
  )
}
