import { useState } from 'react'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { DLINY_RELSA, RELSY, rels } from '../model/dannye.ts'
import { perevestiRelsy } from '../model/raschet.ts'
import { Itog, Pole, Ssylka } from './common'
import { chislo, fmt } from '../model/format.ts'

const EDINICY = [
  { value: 'm', label: 'погонных метров' },
  { value: 't', label: 'тонн' },
  { value: 'sht', label: 'рельсов, шт.' },
]

export function RelsyTab() {
  const [relsId, setRelsId] = useState('R65')
  const [kolvo, setKolvo] = useState('1000')
  const [ed, setEd] = useState<'m' | 't' | 'sht'>('m')
  const [dlina, setDlina] = useState('25')

  const r = rels(relsId)
  const n = chislo(kolvo)
  const l = chislo(dlina)
  const ok = n > 0 && l > 0 && l <= 100
  const result = ok ? perevestiRelsy(relsId, n, ed, l) : null

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <Pole label="Тип рельса">
          <Select
            value={relsId}
            onChange={(e) => setRelsId(e.target.value)}
            options={RELSY.map((item) => ({ value: item.id, label: `${item.name} — ${item.gruppa.toLowerCase()}` }))}
          />
        </Pole>
        <div className="grid grid-cols-[1fr_1.2fr] gap-3">
          <Pole label="Количество">
            <Input inputMode="decimal" value={kolvo} onChange={(e) => setKolvo(e.target.value)} error={!(n > 0)} />
          </Pole>
          <Pole label="Единица">
            <Select value={ed} onChange={(e) => setEd(e.target.value as typeof ed)} options={EDINICY} />
          </Pole>
        </div>
        <Pole label="Длина одного рельса, м" hint={`Ходовые длины: ${DLINY_RELSA.map((d) => fmt(d)).join(' и ')} м`}>
          <div className="flex gap-2">
            <Input className="min-w-0" inputMode="decimal" value={dlina} onChange={(e) => setDlina(e.target.value)} error={!(l > 0 && l <= 100)} />
            {DLINY_RELSA.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDlina(String(d).replace('.', ','))}
                className="shrink-0 rounded-lg border border-border px-3 text-sm font-semibold hover:border-primary hover:text-primary"
              >
                {fmt(d)}
              </button>
            ))}
          </div>
        </Pole>
      </div>

      <div className="space-y-3">
        {result ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <Itog label="Погонных метров" value={fmt(result.metry, 2)} />
              <Itog label="Масса, т" value={fmt(result.tonny, 3)} />
              <Itog label={`Рельсов по ${fmt(l)} м`} value={`${fmt(result.relsov, 0)} шт.`} />
            </div>
            <p className="text-sm text-muted-foreground">
              Масса 1 м рельса {r.name} — {fmt(r.kgNaM)} кг. <Ssylka istochnik={r.istochnik} />
            </p>
            <p className="text-xs text-muted-foreground">
              Масса теоретическая, по номинальным размерам профиля. Фактический вес партии указывается
              в документах завода-изготовителя.
            </p>
          </>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            Введите положительное количество и длину рельса до 100 м.
          </p>
        )}
      </div>
    </div>
  )
}
