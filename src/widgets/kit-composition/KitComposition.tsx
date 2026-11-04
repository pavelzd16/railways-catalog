import { useState } from 'react'
import { FiLayers } from 'react-icons/fi'
import { Link } from 'react-router'
import { kitMassKg, type Kit, type KitPart, type KitFigure, type KitCallout } from '@/shared/lib/kit-composition'

const decimal = (value: number) => (Number.isInteger(value) ? value.toFixed(1) : String(value)).replace('.', ',')

const rowId = (pos: number) => `kit-pos-${pos}`
/** Строка таблицы, к которой ведёт номер на схеме. */
const target = (callout: KitCallout) => callout.part ?? callout.n
const left = (callout: KitCallout, figure: KitFigure) => `${(callout.x / figure.w) * 100}%`
const top = (callout: KitCallout, figure: KitFigure) => `${(callout.y / figure.h) * 100}%`

/** У верхнего края подсказка — под номером, иначе над ним; у боковых краёв прижата к краю, чтобы не вылезать за схему. */
const tipBelow = (callout: KitCallout, figure: KitFigure) => callout.y / figure.h < 0.26
const tipShift = (callout: KitCallout, figure: KitFigure) =>
  `${callout.x / figure.w > 0.72 ? '-translate-x-[85%]' : callout.x / figure.w < 0.23 ? '-translate-x-[15%]' : '-translate-x-1/2'} ${tipBelow(callout, figure) ? '' : '-translate-y-full'}`

/**
 * Разрез узла с интерактивными номерами у выносок: наведение показывает название детали, нажатие — строку таблицы.
 * Размер кружков и цифр — в долях ширины картинки (cqw), чтобы сохранять пропорции при масштабировании.
 */
function KitScheme({ figure, main, names, active, hovered, onHover, onPick }: {
  figure: KitFigure; main: boolean; names: Map<number, string>; active: number | null; hovered: number | null
  onHover: (pos: number | null) => void; onPick: (pos: number) => void
}) {
  const callouts = figure.callouts ?? []
  /** Номер под мышью: у сборной детали (монорегулятор АРС) два номера ведут к одной строке, подсказка — у того, что под мышью. */
  const [under, setUnder] = useState<number | null>(null)
  // Подсказка от строки таблицы — только на главном рисунке, чтобы не дублировалась на втором разрезе.
  const tip = callouts.find((callout) => callout.n === under) ?? (main ? callouts.find((callout) => target(callout) === hovered) : undefined)
  return (
    <div className={`relative [container-type:inline-size] ${figure.calloutSize ? 'lg:!min-w-0' : ''}`} style={{ minWidth: figure.minWidth ?? 520 }}>
      <img
        src={figure.src}
        width={figure.w}
        height={figure.h}
        loading="lazy"
        alt={figure.alt}
        className="block h-auto w-full"
      />

      {callouts.map((callout) => (
        <a
          key={callout.n}
          href={`#${rowId(callout.n)}`}
          aria-label={`${callout.n} — ${callout.name ?? names.get(target(callout)) ?? ''}`}
          onMouseEnter={() => { setUnder(callout.n); onHover(target(callout)) }}
          onMouseLeave={() => { setUnder(null); onHover(null) }}
          onFocus={() => { setUnder(callout.n); onHover(target(callout)) }}
          onBlur={() => { setUnder(null); onHover(null) }}
          onClick={(event) => {
            event.preventDefault()
            onPick(target(callout))
          }}
          className={`absolute flex aspect-square w-[3cqw] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-primary text-[1.8cqw] font-bold leading-none shadow-sm transition-colors ${
            active === target(callout) ? 'bg-primary text-white' : 'bg-white text-primary hover:bg-primary hover:text-white'
          }`}
          style={{ left: left(callout, figure), top: top(callout, figure), ...(figure.calloutSize ? { width: `${figure.calloutSize}cqw`, fontSize: `${figure.calloutSize * 0.6}cqw` } : {}) }}
        >
          {callout.n}
        </a>
      ))}

      {tip && (
        <div
          role="tooltip"
          className={`pointer-events-none absolute z-10 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-lg ${figure.calloutSize ? `w-max max-w-64 -translate-x-1/2 whitespace-normal ${tipBelow(tip, figure) ? '' : '-translate-y-full'}` : `whitespace-nowrap ${tipShift(tip, figure)}`}`}
          style={{ left: figure.calloutSize ? `clamp(8rem, ${left(tip, figure)}, calc(100% - 8rem))` : left(tip, figure), top: `calc(${top(tip, figure)} ${tipBelow(tip, figure) ? '+' : '-'} 2.6cqw)` }}
        >
          {tip.name ?? names.get(target(tip))}
        </div>
      )}
    </div>
  )
}

/** Номер стандарта детали: ссылкой на страницу в «ГОСТах и нормативах», если она есть, иначе текстом. */
function PartStandard({ part }: { part: KitPart }) {
  if (!part.standard) return <>—</>
  if (!part.standard.slug) return <>{part.standard.code}</>
  return (
    <Link
      to={`/normativ/${encodeURIComponent(part.standard.slug)}`}
      className="underline decoration-[hsl(var(--primary))] underline-offset-4 transition-colors hover:text-[hsl(var(--primary))]"
    >
      {part.standard.code}
    </Link>
  )
}

/** «Состав комплекта» в карточке комплекта скрепления: схема узла и таблица деталей со ссылками на детали и ГОСТы. */
export function KitComposition({ kit }: { kit: Kit }) {
  const names = new Map(kit.parts.map((part) => [part.pos, part.name]))
  /** Номер под мышью (подсказка с названием) и выбранная нажатием позиция (подсвечена в таблице). */
  const [hovered, setHovered] = useState<number | null>(null)
  const [picked, setPicked] = useState<number | null>(null)
  const active = hovered ?? picked
  const mass = kitMassKg(kit)

  const pick = (pos: number) => {
    setPicked(pos)
    document.getElementById(rowId(pos))?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <section aria-labelledby="kit-composition-title" className="mb-12 border-t border-border pt-10">
      <div className="mb-5 flex items-center gap-2">
        <FiLayers aria-hidden className="h-5 w-5 text-primary" />

        <h2 id="kit-composition-title" className="section-title">
          {kit.name}
        </h2>
      </div>

      <p className="mb-6 max-w-4xl text-base leading-7 text-muted-foreground">
        {kit.nodes === 2
          ? 'На одну шпалу идут два узла скрепления — по одному под каждую рельсовую нить, поэтому количество деталей в таблице удвоено.'
          : 'Один узел крепит одну рельсовую нить на одной шпале; на шпалу нужно два таких комплекта.'}{' '}
        {kit.allPartsLinked
          ? 'Каждая деталь есть в каталоге и отдельно — по ссылке в таблице, если нужно доукомплектовать узлы.'
          : 'Детали, представленные в каталоге отдельно, доступны по ссылкам в таблице.'}
      </p>

      <div className={`mb-8 grid items-start gap-4 ${kit.figures.length > 2 ? 'lg:grid-cols-3' : kit.figures.length === 2 ? 'lg:grid-cols-2' : 'max-w-4xl'}`}>
        {kit.figures.map((figure, index) => (
          <figure key={figure.src} className="min-w-0 rounded-lg border border-border bg-card p-4">
            {figure.callouts?.length ? (
              <div className="overflow-x-auto">
                <KitScheme figure={figure} main={index === 0} names={names} active={active} hovered={hovered} onHover={setHovered} onPick={pick} />
              </div>
            ) : (
              <img src={figure.src} width={figure.w} height={figure.h} loading="lazy" alt={figure.alt} className="block h-auto w-full" />
            )}
            <figcaption className="mt-2 text-sm text-muted-foreground">{figure.caption}</figcaption>
          </figure>
        ))}
      </div>

      <div className="max-w-4xl overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-3 font-medium">№</th>
              <th scope="col" className="px-3 py-3 font-medium">Деталь</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">Шт. {kit.unitLabel}</th>
              <th scope="col" className="px-3 py-3 text-right font-medium">Масса 1 шт., кг</th>
              <th scope="col" className="hidden px-3 py-3 font-medium sm:table-cell">Стандарт</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {kit.parts.map((part) => (
              <tr
                key={part.pos}
                id={rowId(part.pos)}
                onMouseEnter={() => setHovered(part.pos)}
                onMouseLeave={() => setHovered(null)}
                className={`scroll-mt-24 transition-colors ${picked === part.pos ? 'bg-primary/10' : hovered === part.pos ? 'bg-muted/60' : ''}`}
              >
                <td className="whitespace-nowrap px-3 py-3 align-top font-bold text-primary">{part.label ?? part.pos}</td>
                <td className="px-3 py-3 text-foreground">
                  {part.product ? (
                    <Link
                      to={part.product.href}
                      className="font-medium underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-[hsl(var(--primary))]"
                    >
                      {part.name}
                    </Link>
                  ) : (
                    part.name
                  )}
                  {part.note && <div className="mt-1 text-xs text-muted-foreground">{part.note}</div>}
                  {!part.perNode && <div className="mt-1 text-xs text-muted-foreground">в комплект не входит</div>}
                  {/* На узком экране стандарт — строкой под названием, отдельный столбец не помещается. */}
                  <div className="mt-1 text-xs text-muted-foreground sm:hidden">
                    <PartStandard part={part} />
                  </div>
                </td>
                <td className="px-3 py-3 text-right align-top font-medium text-foreground">{part.perNode ? part.perNode * kit.nodes : '—'}</td>
                <td className="px-3 py-3 text-right align-top text-muted-foreground">{part.massLabel ?? (part.massKg === null ? '—' : decimal(part.massKg))}</td>
                <td className="hidden px-3 py-3 align-top text-muted-foreground sm:table-cell">
                  <PartStandard part={part} />
                </td>
              </tr>
            ))}
          </tbody>

          {mass !== null && <tfoot className="border-t border-border bg-muted/50">
            <tr>
              <td colSpan={5} className="px-3 py-3 font-medium text-foreground">
                Масса комплекта — около {decimal(mass)} кг
              </td>
            </tr>
          </tfoot>}
        </table>
      </div>
    </section>
  )
}
