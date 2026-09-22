import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { izdelie } from '../model/dannye.ts'
import { naytiIzdeliya } from '../model/poisk.ts'

/**
 * Поле «Изделие»: можно писать руками, снизу подсказываются полные названия,
 * можно выбрать мышкой или стрелками. Пустое поле показывает весь список.
 */
export function PoiskIzdeliya({ value, gruppa, onChange }: {
  value: string
  gruppa?: string
  onChange: (id: string) => void
}) {
  // null — поле показывает выбранное изделие; строка — то, что печатает пользователь
  const [vvod, setVvod] = useState<string | null>(null)
  const zapros = vvod ?? izdelie(value).name
  const [otkryt, setOtkryt] = useState(false)
  const [aktivnyy, setAktivnyy] = useState(0)
  const koren = useRef<HTMLDivElement>(null)
  const spisokId = useId()

  useEffect(() => {
    const vne = (event: MouseEvent) => {
      if (koren.current && !koren.current.contains(event.target as Node)) {
        setOtkryt(false)
        setVvod(null)
      }
    }
    document.addEventListener('mousedown', vne)
    return () => document.removeEventListener('mousedown', vne)
  }, [])

  const naydeno = naytiIzdeliya(otkryt ? (vvod ?? '') : '', gruppa)
  const vybrat = (id: string) => {
    onChange(id)
    setVvod(null)
    setOtkryt(false)
  }

  return (
    <div ref={koren} className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={otkryt}
        aria-controls={spisokId}
        aria-autocomplete="list"
        value={zapros}
        placeholder="Начните печатать: костыль, накладка Р65, М22…"
        onChange={(e) => { setVvod(e.target.value); setOtkryt(true); setAktivnyy(0) }}
        // раскрываем список и по фокусу, и по щелчку: щелчок по уже выбранному полю
        // тоже должен показывать подсказки
        onFocus={() => { setOtkryt(true); setVvod(''); setAktivnyy(0) }}
        onClick={() => { setOtkryt(true); setVvod((prev) => prev ?? ''); setAktivnyy(0) }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            if (!otkryt) { setOtkryt(true); return }
            setAktivnyy((i) => {
              const next = e.key === 'ArrowDown' ? i + 1 : i - 1
              return (next + naydeno.length) % Math.max(naydeno.length, 1)
            })
          } else if (e.key === 'Enter' && otkryt && naydeno[aktivnyy]) {
            e.preventDefault()
            vybrat(naydeno[aktivnyy].id)
          } else if (e.key === 'Escape') {
            setOtkryt(false)
            setVvod(null)
          }
        }}
        className="h-11 w-full min-w-0 rounded-xl border border-border bg-card px-4 text-sm text-foreground shadow-sm transition-all hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      {otkryt && (
        <ul
          id={spisokId}
          role="listbox"
          className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-border bg-card p-1 shadow-xl"
        >
          {naydeno.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-muted-foreground">
              Ничего не нашлось. Попробуйте «болт», «Р65», «16×16».
            </li>
          )}
          {naydeno.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                aria-selected={item.id === value}
                onMouseEnter={() => setAktivnyy(index)}
                onClick={() => vybrat(item.id)}
                className={cn(
                  'flex w-full flex-col items-start rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  index === aktivnyy && 'bg-muted',
                  item.id === value && 'bg-primary/10 font-semibold text-primary',
                )}
              >
                <span>{item.name}</span>
                <span className="text-xs text-muted-foreground">{item.gruppa}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
