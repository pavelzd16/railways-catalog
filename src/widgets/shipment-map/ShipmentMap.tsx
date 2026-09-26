// src/widgets/shipment-map/ShipmentMap.tsx
// Карта отгрузок: дуги от склада в Зеленодольске к ключевым городам, по дугам ездят вагончики.
// Анимация — SVG (SMIL) + CSS, без библиотек; при prefers-reduced-motion карта статичная.
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { cn } from '@/shared/lib/cn'
import { SectionHeading } from '@/shared/ui/SectionHeading'
import { REGIONY, SKLAD } from './model/goroda.ts'
import { OZERA, REKI, SUSHA } from './model/kontury.ts'
import { DOLYA_V_PUTI, MARSHRUTY, RAZMER, TOCHKA_SKLADA, type Tochka } from './model/marshruty.ts'
import './shipment-map.css'

type Faza = 'staticheskaya' | 'zhdet' | 'vidno'

// Доли периода рейса для keyTimes: вагончик едет, гаснет у города, в городе вспыхивает кольцо.
const doli = (v: number) => String(Math.round(v * 100) / 100)
const V_PUTI = doli(DOLYA_V_PUTI)
const PERED_PRIBYTIEM = doli(DOLYA_V_PUTI - 0.04)
const PERED_VSPYSHKOY = doli(DOLYA_V_PUTI - 0.01)
const PRIBYL = doli(DOLYA_V_PUTI + 0.17)

const poziciya = ({ x, y }: Tochka): CSSProperties => ({
  left: `${(x / RAZMER.shirina) * 100}%`,
  top: `${(y / RAZMER.vysota) * 100}%`,
})

const nomer = (i: number) => ({ '--nomer': i }) as CSSProperties

export function ShipmentMap() {
  const [faza, setFaza] = useState<Faza>('staticheskaya')
  const [aktivnyy, setAktivnyy] = useState<string | null>(null)
  const karta = useRef<HTMLDivElement>(null)
  const ukazatel = useRef('mouse')

  useEffect(() => {
    const uzel = karta.current
    if (!uzel || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Первый вызов приходит сразу после observe: карта вне экрана — прячем дуги до прокрутки.
    const nablyudatel = new IntersectionObserver(
      (zapisi) => {
        const vidno = zapisi.some((z) => z.isIntersecting)
        setFaza(vidno ? 'vidno' : 'zhdet')
        if (vidno) nablyudatel.disconnect()
      },
      { threshold: 0.3 },
    )
    nablyudatel.observe(uzel)
    return () => nablyudatel.disconnect()
  }, [])

  const vybor = (id: string) => ({
    onPointerDown: (e: React.PointerEvent) => {
      ukazatel.current = e.pointerType
    },
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') setAktivnyy(id)
    },
    onPointerLeave: (e: React.PointerEvent) => {
      if (e.pointerType === 'mouse') setAktivnyy(null)
    },
    onClick: () => {
      setAktivnyy((bylo) => (ukazatel.current !== 'mouse' && bylo === id ? null : id))
      ukazatel.current = 'keyboard'
    },
  })

  const sostoyanie = (id: string) =>
    aktivnyy === id ? 'is-aktivnyy' : aktivnyy ? 'is-prigashen' : undefined

  return (
    <section className="mb-16" aria-labelledby="geografiya-otgruzok">
      <div className="max-w-3xl">
        <SectionHeading id="geografiya-otgruzok">География отгрузок</SectionHeading>
        <p className="mt-3 text-base md:text-lg text-muted-foreground leading-relaxed">
          Отгружаем со склада в Зеленодольске (Республика Татарстан) по России и в Казахстан —
          железнодорожным и автомобильным транспортом. Наведите на город или нажмите на него,
          чтобы увидеть направление.
        </p>
      </div>

      <div
        ref={karta}
        className={cn(
          'karta mt-8 overflow-hidden rounded-lg border border-border',
          faza === 'zhdet' && 'karta--zhdet',
          faza === 'vidno' && 'karta--vidno',
          aktivnyy && 'is-vybor',
        )}
      >
        <div className="karta-holst">
          <svg
            viewBox={`0 0 ${RAZMER.shirina} ${RAZMER.vysota}`}
            className="karta-svg"
            role="img"
            aria-label={`Схема отгрузок со склада в Зеленодольске: ${MARSHRUTY.map((m) => m.gorod.nazvanie).join(', ')}`}
          >
            <path d={SUSHA} className="karta-susha" fillRule="evenodd" />
            <path d={OZERA} className="karta-ozera" />
            <path d={REKI} className="karta-reki" />

            {MARSHRUTY.map((m, i) => (
              <g key={m.gorod.id} className={cn('karta-marshrut', sostoyanie(m.gorod.id))} style={nomer(i)}>
                <path d={m.put} className="karta-shpaly" />
                <path d={m.put} className="karta-liniya" pathLength={1} />
                <g className="karta-vagon">
                  <g>
                    <animateMotion
                      path={m.put}
                      dur={`${m.period}s`}
                      begin={`${m.start}s`}
                      repeatCount="indefinite"
                      rotate="auto"
                      calcMode="spline"
                      keyPoints="0;1;1"
                      keyTimes={`0;${V_PUTI};1`}
                      keySplines="0.45 0 0.25 1;0 0 1 1"
                    />
                    <rect x={-8} y={-3.5} width={16} height={7} rx={2} opacity={0}>
                      <animate
                        attributeName="opacity"
                        values="0;1;1;0;0"
                        keyTimes={`0;0.05;${PERED_PRIBYTIEM};${V_PUTI};1`}
                        dur={`${m.period}s`}
                        begin={`${m.start}s`}
                        repeatCount="indefinite"
                      />
                    </rect>
                  </g>
                </g>
              </g>
            ))}

            {MARSHRUTY.map((m, i) => (
              <g
                key={m.gorod.id}
                className={cn('karta-gorod', sostoyanie(m.gorod.id))}
                style={nomer(i)}
                {...vybor(m.gorod.id)}
              >
                <circle cx={m.x} cy={m.y} r={5} className="karta-ping" opacity={0}>
                  <animate
                    attributeName="r"
                    values="5;5;20;20"
                    keyTimes={`0;${V_PUTI};${PRIBYL};1`}
                    dur={`${m.period}s`}
                    begin={`${m.start}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0;0.9;0;0"
                    keyTimes={`0;${PERED_VSPYSHKOY};${V_PUTI};${PRIBYL};1`}
                    dur={`${m.period}s`}
                    begin={`${m.start}s`}
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx={m.x} cy={m.y} r={16} className="karta-cel" />
                <circle cx={m.x} cy={m.y} r={5} className="karta-tochka" />
              </g>
            ))}

            <g className="karta-sklad">
              <circle cx={TOCHKA_SKLADA.x} cy={TOCHKA_SKLADA.y} r={9} className="karta-puls" />
              <circle cx={TOCHKA_SKLADA.x} cy={TOCHKA_SKLADA.y} r={9} className="karta-puls karta-puls--2" />
              <circle cx={TOCHKA_SKLADA.x} cy={TOCHKA_SKLADA.y} r={8} className="karta-sklad-tochka" />
            </g>
          </svg>

          <div className="karta-podpisi" aria-hidden="true">
            <span className="karta-podpis karta-podpis--sklad karta-podpis--sverhu" style={poziciya(TOCHKA_SKLADA)}>
              {SKLAD.nazvanie}
              <small>склад отгрузки</small>
            </span>
            {MARSHRUTY.map((m, i) => (
              <span
                key={m.gorod.id}
                className={cn('karta-podpis', `karta-podpis--${m.gorod.podpis}`, sostoyanie(m.gorod.id))}
                style={{ ...poziciya(m), ...nomer(i) }}
              >
                {m.gorod.nazvanie}
              </span>
            ))}
          </div>
        </div>

        <div className="karta-legenda">
          <span className="karta-legenda-punkt">
            <span className="karta-znak karta-znak--sklad" />
            Склад отгрузки
          </span>
          <span className="karta-legenda-punkt">
            <span className="karta-znak karta-znak--gorod" />
            Город назначения
          </span>
          <span className="karta-legenda-punkt">
            <span className="karta-znak karta-znak--vagon" />
            Направление отгрузки
          </span>
          <span className="karta-legenda-primechanie">
            Схема условная: маршрут, вид транспорта и срок доставки рассчитаем по заявке.
          </span>
        </div>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <li className="rounded-lg border border-primary/40 bg-primary/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Склад отгрузки</p>
          <p className="mt-2 font-bold text-foreground">{SKLAD.nazvanie}</p>
          <p className="text-sm text-muted-foreground">Республика Татарстан</p>
        </li>
        {REGIONY.map((region) => (
          <li key={region.nazvanie} className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {region.nazvanie}
            </p>
            <ul className="mt-2 space-y-1">
              {region.goroda.map((gorod) => (
                <li key={gorod.id}>
                  <button
                    type="button"
                    className={cn('karta-knopka', aktivnyy === gorod.id && 'is-aktivnyy')}
                    aria-pressed={aktivnyy === gorod.id}
                    onBlur={() => setAktivnyy((bylo) => (bylo === gorod.id ? null : bylo))}
                    {...vybor(gorod.id)}
                  >
                    {gorod.nazvanie}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  )
}
