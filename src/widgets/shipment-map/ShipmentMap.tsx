// src/widgets/shipment-map/ShipmentMap.tsx
// Карта отгрузок: дуги от складов в Зеленодольске и Екатеринбурге к крупным городам,
// у каждого склада свой цвет, по дугам ездят вагончики. Над картой — выбор склада.
// Анимация — SVG (SMIL) + CSS, без библиотек; при prefers-reduced-motion карта статичная.
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { cn } from '@/shared/lib/cn'
import { SectionHeading } from '@/shared/ui/SectionHeading'
import { REGIONY, SKLADY, type Gorod } from './model/goroda.ts'
import { TranzitDostavka } from './TranzitDostavka'
import { OZERA, REKI, SUSHA } from './model/kontury.ts'
import {
  DOLYA_V_PUTI,
  GORODA_NA_KARTE,
  MARSHRUTY,
  RAZMER,
  TOCHKI_SKLADOV,
  VSE_GORODA,
  type Tochka,
} from './model/marshruty.ts'
import './shipment-map.css'

type Faza = 'staticheskaya' | 'zhdet' | 'vidno'

// Доли периода рейса для keyTimes: вагончик едет, гаснет у города, в городе вспыхивает кольцо.
const doli = (v: number) => String(Math.round(v * 100) / 100)
const V_PUTI = doli(DOLYA_V_PUTI)
const PERED_PRIBYTIEM = doli(DOLYA_V_PUTI - 0.04)
const PERED_VSPYSHKOY = doli(DOLYA_V_PUTI - 0.01)
const PRIBYL = doli(DOLYA_V_PUTI + 0.17)

const TON_SKLADA = new Map(SKLADY.map((sklad) => [sklad.id, sklad.ton]))

const poziciya = ({ x, y }: Tochka): CSSProperties => ({
  left: `${(x / RAZMER.shirina) * 100}%`,
  top: `${(y / RAZMER.vysota) * 100}%`,
})

const nomer = (i: number) => ({ '--nomer': i }) as CSSProperties

export function ShipmentMap() {
  const [faza, setFaza] = useState<Faza>('staticheskaya')
  const [aktivnyy, setAktivnyy] = useState<string | null>(null)
  const [vybranSklad, setVybranSklad] = useState<string | null>(null)
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

  const aktivnyyGorod = VSE_GORODA.find((gorod) => gorod.id === aktivnyy)
  const skladAktiven = (id: string) => aktivnyy === id || aktivnyyGorod?.ryadomSoSkladom === id
  const vneVybora = (gorod: Gorod) => vybranSklad !== null && !gorod.sklady.includes(vybranSklad)

  const sostoyanie = (id: string) =>
    aktivnyy === id ? 'is-aktivnyy' : aktivnyy ? 'is-prigashen' : undefined

  return (
    <section className="mb-16" aria-labelledby="geografiya-otgruzok">
      <div className="max-w-3xl">
        <SectionHeading id="geografiya-otgruzok">География отгрузок</SectionHeading>
        <p className="mt-3 text-base md:text-lg text-muted-foreground leading-relaxed">
          Отгружаем с двух складов — в Зеленодольске (Татарстан) и Екатеринбурге — во все
          крупные города России и в Казахстан, железнодорожным и автомобильным транспортом.
          Наведите на город или нажмите на него, чтобы увидеть направление.
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
        style={{ '--vsego': MARSHRUTY.length } as CSSProperties}
      >
        <div className="karta-sklady" role="group" aria-label="Маршруты какого склада показать">
          <button
            type="button"
            className="karta-sklad-knopka"
            aria-pressed={vybranSklad === null}
            onClick={() => setVybranSklad(null)}
          >
            Все склады
          </button>
          {SKLADY.map((sklad) => (
            <button
              key={sklad.id}
              type="button"
              className={cn('karta-sklad-knopka', `ton-${sklad.ton}`)}
              aria-pressed={vybranSklad === sklad.id}
              onClick={() => setVybranSklad((bylo) => (bylo === sklad.id ? null : sklad.id))}
            >
              <span className="karta-sklad-znak" />
              <span>
                Склад {sklad.nazvanie}
                <small>{sklad.oblast}</small>
              </span>
            </button>
          ))}
        </div>

        <div className="karta-holst">
          <svg
            viewBox={`0 0 ${RAZMER.shirina} ${RAZMER.vysota}`}
            className="karta-svg"
            role="img"
            aria-label={`Схема отгрузок со складов в Зеленодольске и Екатеринбурге: ${VSE_GORODA.map((g) => g.nazvanie).join(', ')}`}
          >
            <path d={SUSHA} className="karta-susha" fillRule="evenodd" />
            <path d={OZERA} className="karta-ozera" />
            <path d={REKI} className="karta-reki" />

            {MARSHRUTY.map((m) => (
              <g
                key={m.id}
                className={cn(
                  'karta-marshrut',
                  `ton-${m.sklad.ton}`,
                  sostoyanie(m.gorod.id),
                  vybranSklad !== null && vybranSklad !== m.sklad.id && 'is-skryt',
                )}
                style={nomer(m.nomer)}
              >
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
              </g>
            ))}

            {GORODA_NA_KARTE.map((t) => (
              <g
                key={t.gorod.id}
                className={cn('karta-gorod', sostoyanie(t.gorod.id), vneVybora(t.gorod) && 'is-skryt')}
                style={nomer(t.nomer)}
                {...vybor(t.gorod.id)}
              >
                <circle cx={t.x} cy={t.y} r={16} className="karta-cel" />
                <circle cx={t.x} cy={t.y} r={5} className="karta-tochka" />
              </g>
            ))}

            {TOCHKI_SKLADOV.map((t) => (
              <g
                key={t.sklad.id}
                className={cn(
                  'karta-sklad',
                  `ton-${t.sklad.ton}`,
                  skladAktiven(t.sklad.id) && 'is-aktivnyy',
                  vybranSklad !== null && vybranSklad !== t.sklad.id && 'is-skryt',
                )}
              >
                <circle cx={t.x} cy={t.y} r={9} className="karta-puls" />
                <circle cx={t.x} cy={t.y} r={9} className="karta-puls karta-puls--2" />
                <circle cx={t.x} cy={t.y} r={8} className="karta-sklad-tochka" />
              </g>
            ))}
          </svg>

          <div className="karta-podpisi" aria-hidden="true">
            {TOCHKI_SKLADOV.map((t) => (
              <span
                key={t.sklad.id}
                className={cn(
                  'karta-podpis karta-podpis--sklad',
                  `karta-podpis--${t.sklad.podpis}`,
                  `karta-podpis--tel-${t.sklad.podpisNaTelefone}`,
                  `ton-${t.sklad.ton}`,
                  vybranSklad !== null && vybranSklad !== t.sklad.id && 'is-skryt',
                )}
                style={poziciya(t)}
              >
                {t.sklad.nazvanie}
                <small>{t.sklad.primechanie}</small>
              </span>
            ))}
            {GORODA_NA_KARTE.map((t) => (
              <span
                key={t.gorod.id}
                className={cn(
                  'karta-podpis karta-podpis--gorod',
                  `karta-podpis--${t.gorod.podpis}`,
                  sostoyanie(t.gorod.id),
                  vneVybora(t.gorod) && 'is-skryt',
                )}
                style={{ ...poziciya(t), ...nomer(t.nomer) }}
              >
                {t.gorod.nazvanie}
                {aktivnyy === t.gorod.id && t.gorod.srok && <small>{t.gorod.srok} из Казани</small>}
              </span>
            ))}
          </div>
        </div>

        <div className="karta-legenda">
          {SKLADY.map((sklad) => (
            <span key={sklad.id} className={cn('karta-legenda-punkt', `ton-${sklad.ton}`)}>
              <span className="karta-znak karta-znak--vagon" />
              Со склада {sklad.gde}
            </span>
          ))}
          <span className="karta-legenda-punkt">
            <span className="karta-znak karta-znak--gorod" />
            Город назначения
          </span>
          <span className="karta-legenda-primechanie">
            Схема условная: маршрут и вид транспорта подберём по заявке.
          </span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="text-xl md:text-2xl font-bold tracking-tight">Сроки доставки из Казани</h3>
        <p className="text-sm text-muted-foreground">
          Со склада в Зеленодольске под Казанью. Точный срок подтвердим при расчёте заявки.
        </p>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
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
                    className={cn(
                      'karta-knopka',
                      aktivnyy === gorod.id && 'is-aktivnyy',
                      vneVybora(gorod) && 'is-skryt',
                    )}
                    aria-pressed={aktivnyy === gorod.id}
                    onBlur={() => setAktivnyy((bylo) => (bylo === gorod.id ? null : bylo))}
                    {...vybor(gorod.id)}
                  >
                    <span className="karta-knopka-sklady">
                      {gorod.sklady.map((id) => (
                        <i key={id} className={`ton-${TON_SKLADA.get(id)}`} />
                      ))}
                    </span>
                    <span>
                      {gorod.nazvanie}
                      {gorod.srok && <small className="karta-knopka-srok">{gorod.srok}</small>}
                      {gorod.ryadomSoSkladom && <small>рядом со складом</small>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <TranzitDostavka />
    </section>
  )
}
