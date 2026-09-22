import { useState } from 'react'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { GRUPPY, IZDELIYA, izdelie } from '../model/dannye.ts'
import { perevestiIzdelie } from '../model/raschet.ts'
import { tekstIzdeliya } from '../model/tekst.ts'
import { DeystviyaRascheta } from './DeystviyaRascheta'
import { Itog, Pole, Ssylka } from './common'
import { PoiskIzdeliya } from './PoiskIzdeliya'
import { chislo, fmt } from '../model/format.ts'

const EDINICY = [
  { value: 'sht', label: 'штук' },
  { value: 'kg', label: 'килограммов' },
  { value: 't', label: 'тонн' },
]
const VSE = 'vse'

export function IzdeliyaTab() {
  const [gruppa, setGruppa] = useState<string>(VSE)
  const [id, setId] = useState(IZDELIYA[0].id)
  const [kolvo, setKolvo] = useState('100')
  const [ed, setEd] = useState<'sht' | 'kg' | 't'>('sht')

  const item = izdelie(id)
  const n = chislo(kolvo)
  const result = n > 0 ? perevestiIzdelie(id, n, ed) : null

  const vybratGruppu = (next: string) => {
    setGruppa(next)
    if (next !== VSE && izdelie(id).gruppa !== next) {
      setId(IZDELIYA.find((row) => row.gruppa === next)!.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <Pole
          label="Изделие"
          hint="Можно писать руками — подскажем полные названия. Пустое поле показывает весь список."
        >
          <PoiskIzdeliya
            value={id}
            gruppa={gruppa === VSE ? undefined : gruppa}
            onChange={(next) => { setId(next); if (gruppa !== VSE) setGruppa(izdelie(next).gruppa) }}
          />
        </Pole>
        <Pole label="Вид изделия" hint="Сужает подсказки в поле выше">
          <Select
            value={gruppa}
            onChange={(e) => vybratGruppu(e.target.value)}
            options={[{ value: VSE, label: 'Все виды' }, ...GRUPPY.map((g) => ({ value: g, label: g }))]}
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
              {item.name}. Масса одной штуки — {fmt(item.kgNaSht)} кг. <Ssylka istochnik={item.istochnik} />
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

      <DeystviyaRascheta tekst={result ? tekstIzdeliya(id, result) : null} />
    </div>
  )
}
