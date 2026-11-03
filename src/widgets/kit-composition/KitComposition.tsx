import { useState } from 'react'
import { FiLayers } from 'react-icons/fi'
import { Link } from 'react-router'
import { kitMassKg, type Kit, type KitPart } from '@/shared/lib/kit-composition'

const decimal = (value: number) => (Number.isInteger(value) ? value.toFixed(1) : String(value)).replace('.', ',')

/** Разрез А–А узла КБ-65: своя обводка черт. 77 (МПС, 1995). */
const SCHEME = { src: '/schemes/kb-65-uzel-razrez-a-a.svg', w: 1160, h: 980 }

/** Те же узлы на трёх шпалах у стыка: вид сбоку и план (1450×1115 единиц viewBox). */
const PLAN = { src: '/schemes/kb-65-uzel-vid-plan.svg', w: 1450, h: 1115 }

/** Центры позиций в единицах viewBox: 1–10 — у выносок, 11 — на головке рельса. */
const CALLOUTS = [
  { n: 1, x: 94, y: 210 },
  { n: 2, x: 237, y: 213 },
  { n: 3, x: 308, y: 215 },
  { n: 4, x: 846, y: 233 },
  { n: 5, x: 921, y: 233 },
  { n: 6, x: 971, y: 233 },
  { n: 7, x: 1035, y: 288 },
  { n: 8, x: 1075, y: 290 },
  { n: 9, x: 1110, y: 291 },
  { n: 10, x: 393, y: 594 },
  { n: 11, x: 604, y: 120 },
]

type CalloutPos = (typeof CALLOUTS)[number]

const rowId = (pos: number) => `kit-pos-${pos}`
const left = (callout: CalloutPos) => `${(callout.x / SCHEME.w) * 100}%`
const top = (callout: CalloutPos) => `${(callout.y / SCHEME.h) * 100}%`

/** У верхнего края подсказка — под номером, иначе над ним; у боковых краёв прижата к краю, чтобы не вылезать за схему. */
const tipBelow = (callout: CalloutPos) => callout.y / SCHEME.h < 0.26
const tipShift = (callout: CalloutPos) =>
  `${callout.x / SCHEME.w > 0.72 ? '-translate-x-[85%]' : callout.x / SCHEME.w < 0.23 ? '-translate-x-[15%]' : '-translate-x-1/2'} ${tipBelow(callout) ? '' : '-translate-y-full'}`

/**
 * Разрез узла с интерактивными номерами у выносок: наведение показывает название детали, нажатие — строку таблицы.
 * Размер кружков и цифр — в долях ширины картинки (cqw), чтобы сохранять пропорции при масштабировании.
 */
function Kb65Scheme({ names, active, hovered, onHover, onPick }: {
  names: Map<number, string>; active: number | null; hovered: number | null
  onHover: (pos: number | null) => void; onPick: (pos: number) => void
}) {
  const tip = CALLOUTS.find((callout) => callout.n === hovered)
  return (
    <div className="relative min-w-[520px] [container-type:inline-size]">
      <img
        src={SCHEME.src}
        width={SCHEME.w}
        height={SCHEME.h}
        loading="lazy"
        alt="Узел скрепления КБ-65 на железобетонной шпале, разрез А-А: подкладка, клеммы, клеммные и закладные болты, прокладки"
        className="block h-auto w-full"
      />

      {CALLOUTS.map((callout) => (
        <a
          key={callout.n}
          href={`#${rowId(callout.n)}`}
          aria-label={`${callout.n} — ${names.get(callout.n) ?? ''}`}
          onMouseEnter={() => onHover(callout.n)}
          onMouseLeave={() => onHover(null)}
          onFocus={() => onHover(callout.n)}
          onBlur={() => onHover(null)}
          onClick={(event) => {
            event.preventDefault()
            onPick(callout.n)
          }}
          className={`absolute flex aspect-square w-[3cqw] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-primary text-[1.8cqw] font-bold leading-none shadow-sm transition-colors ${
            active === callout.n ? 'bg-primary text-white' : 'bg-white text-primary hover:bg-primary hover:text-white'
          }`}
          style={{ left: left(callout), top: top(callout) }}
        >
          {callout.n}
        </a>
      ))}

      {tip && (
        <div
          role="tooltip"
          className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-lg ${tipShift(tip)}`}
          style={{ left: left(tip), top: `calc(${top(tip)} ${tipBelow(tip) ? '+' : '-'} 2.6cqw)` }}
        >
          {names.get(tip.n)}
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
        Каждая деталь есть в каталоге и отдельно — по ссылке в таблице, если нужно доукомплектовать узлы.
      </p>

      {/* Разрез и вид/план — рядом на одном уровне; на телефоне друг под другом, разрез шире экрана и прокручивается. */}
      <div className="mb-8 grid items-start gap-4 lg:grid-cols-2">
        <figure className="min-w-0 rounded-lg border border-border bg-card p-4">
          <div className="overflow-x-auto">
            <Kb65Scheme names={names} active={active} hovered={hovered} onHover={setHovered} onPick={pick} />
          </div>
          <figcaption className="mt-2 text-sm text-muted-foreground">
            Узел КБ-65, разрез А-А. Наведите на номер — появится название детали, нажмите — покажем её в таблице.
          </figcaption>
        </figure>

        <figure className="min-w-0 rounded-lg border border-border bg-card p-4">
          <img
            src={PLAN.src}
            width={PLAN.w}
            height={PLAN.h}
            loading="lazy"
            alt="Скрепление КБ-65 на трёх железобетонных шпалах у рельсового стыка: вид сбоку и план, расстояние между стыковыми шпалами 420 мм"
            className="block h-auto w-full"
          />
          <figcaption className="mt-2 text-sm text-muted-foreground">
            Узлы КБ-65 у рельсового стыка: вид сбоку и план. Разрез А-А — по средней шпале.
          </figcaption>
        </figure>
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
                <td className="px-3 py-3 align-top font-bold text-primary">{part.pos}</td>
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
                  {!part.perNode && <div className="mt-1 text-xs text-muted-foreground">в комплект не входит</div>}
                  {/* На узком экране стандарт — строкой под названием, отдельный столбец не помещается. */}
                  <div className="mt-1 text-xs text-muted-foreground sm:hidden">
                    <PartStandard part={part} />
                  </div>
                </td>
                <td className="px-3 py-3 text-right align-top font-medium text-foreground">{part.perNode ? part.perNode * kit.nodes : '—'}</td>
                <td className="px-3 py-3 text-right align-top text-muted-foreground">{part.massLabel ?? decimal(part.massKg)}</td>
                <td className="hidden px-3 py-3 align-top text-muted-foreground sm:table-cell">
                  <PartStandard part={part} />
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot className="border-t border-border bg-muted/50">
            <tr>
              <td colSpan={5} className="px-3 py-3 font-medium text-foreground">
                Масса комплекта — около {decimal(kitMassKg(kit))} кг
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
