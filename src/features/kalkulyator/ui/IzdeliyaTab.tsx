import { useState } from 'react'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { GRUPPY, IZDELIYA, izdelie } from '../model/dannye.ts'
import { perevestiIzdelie } from '../model/raschet.ts'
import { Itog, Pole, Ssylka } from './common'
import { chislo, fmt } from '../model/format.ts'

const EDINICY = [
  { value: 'sht', label: 'штук' },
  { value: 'kg', label: 'килограммов' },
  { value: 't', label: 'тонн' },
]

export function IzdeliyaTab() {
  const [gruppa, setGruppa] = useState<string>(GRUPPY[0])
  const [id, setId] = useState(IZDELIYA.find((item) => item.gruppa === GRUPPY[0])!.id)
  const [kolvo, setKolvo] = useState('100')
  const [ed, setEd] = useState<'sht' | 'kg' | 't'>('sht')

  const vGruppe = IZDELIYA.filter((item) => item.gruppa === gruppa)
  const item = izdelie(id)
  const n = chislo(kolvo)
  const result = n > 0 ? perevestiIzdelie(id, n, ed) : null

  const vybratGruppu = (next: string) => {
    setGruppa(next)
    setId(IZDELIYA.find((row) => row.gruppa === next)!.id)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <Pole label="Вид изделия">
          <Select value={gruppa} onChange={(e) => vybratGruppu(e.target.value)} options={GRUPPY.map((g) => ({ value: g, label: g }))} />
        </Pole>
        <Pole label="Изделие">
          <Select value={id} onChange={(e) => setId(e.target.value)} options={vGruppe.map((row) => ({ value: row.id, label: row.name }))} />
        </Pole>
        <div className="grid grid-cols-[1fr_1.2fr] gap-3">
          <Pole label="Количество">
            <Input inputMode="decimal" value={kolvo} onChange={(e) => setKolvo(e.target.value)} error={!(n > 0)} />
          </Pole>
          <Pole label="Единица">
            <Select value={ed} onChange={(e) => setEd(e.target.value as typeof ed)} options={EDINICY} />
          </Pole>
        </div>
      </div>

      <div className="space-y-3">
        {result ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Itog label={ed === 'sht' ? 'Штук' : 'Целых штук'} value={fmt(result.sht, 0)} />
              <Itog
                label={result.kg >= 1000 ? 'Масса, т' : 'Масса, кг'}
                value={result.kg >= 1000 ? fmt(result.kg / 1000, 3) : fmt(result.kg, 2)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Масса одной штуки — {fmt(item.kgNaSht)} кг. <Ssylka istochnik={item.istochnik} />
            </p>
            <p className="text-xs text-muted-foreground">
              Масса теоретическая, по номинальным размерам изделия. При пересчёте веса в штуки
              число округляется вниз до целого.
            </p>
          </>
        ) : (
          <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            Введите положительное количество.
          </p>
        )}
      </div>
    </div>
  )
}
