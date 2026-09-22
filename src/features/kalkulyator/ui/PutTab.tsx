import { useState } from 'react'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { DLINY_RELSA, izdelie } from '../model/dannye.ts'
import {
  DLYA_RELSA, OTVERSTIY_POD_KOSTYLI, itogoTonn, proveritPut, rasschitatPut,
  type PutRels, type Shpaly, type VvodPuti,
} from '../model/raschet.ts'
import { tekstVedomosti } from '../model/tekst.ts'
import { DeystviyaRascheta } from './DeystviyaRascheta'
import { Itog, Pole, Ssylka } from './common'
import { chislo, fmt } from '../model/format.ts'

const RELSY_PUTI: { value: PutRels; label: string }[] = [
  { value: 'R65', label: 'Р65' },
  { value: 'R50', label: 'Р50' },
  { value: 'R75', label: 'Р75 (на деревянных шпалах)' },
]
const KOSTYLI = ['k-16-165', 'k-16-205', 'k-16-230', 'k-16-280']

const varianty = (ids: string[]) => ids.map((id) => ({ value: id, label: izdelie(id).name }))

export function PutTab() {
  const [dlinaM, setDlinaM] = useState('1000')
  const [relsId, setRelsId] = useState<PutRels>('R65')
  const [dlinaRelsa, setDlinaRelsa] = useState('12.5')
  const [shpaly, setShpaly] = useState<Shpaly>('zhb')
  const [epura, setEpura] = useState('1840')
  const [nakladkaId, setNakladkaId] = useState(DLYA_RELSA.R65.nakladki[0])
  const [boltId, setBoltId] = useState(DLYA_RELSA.R65.bolty[0])
  const [podkladkaZhbId, setPodkladkaZhbId] = useState(DLYA_RELSA.R65.podkladkiZhb[0])
  const [podkladkaDerId, setPodkladkaDerId] = useState(DLYA_RELSA.R65.podkladkiDer[0])
  const [kostylId, setKostylId] = useState(KOSTYLI[0])
  const [kostyley, setKostyley] = useState(String(OTVERSTIY_POD_KOSTYLI))
  const [schitatShpaly, setSchitatShpaly] = useState<'epura' | 'svoi'>('epura')
  const [shpalSvoi, setShpalSvoi] = useState('')

  const nabor = DLYA_RELSA[relsId]
  const vybratRels = (next: PutRels) => {
    const n = DLYA_RELSA[next]
    setRelsId(next)
    setNakladkaId(n.nakladki[0])
    setBoltId(n.bolty[0])
    if (n.podkladkiZhb.length) setPodkladkaZhbId(n.podkladkiZhb[0])
    else setShpaly('der')
    setPodkladkaDerId(n.podkladkiDer[0])
  }

  const vvod: VvodPuti = {
    dlinaM: chislo(dlinaM), relsId, dlinaRelsa: chislo(dlinaRelsa), shpaly, epura: chislo(epura),
    shpalSvoi: schitatShpaly === 'svoi' ? chislo(shpalSvoi) : undefined,
    nakladkaId, boltId, podkladkaZhbId, podkladkaDerId, kostylId, kostyleyNaPodkladku: chislo(kostyley),
  }
  const oshibki = proveritPut(vvod)
  const rows = oshibki.length ? [] : rasschitatPut(vvod)

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Pole label="Длина участка, м" hint="1 000 м = 1 км">
          <Input inputMode="decimal" value={dlinaM} onChange={(e) => setDlinaM(e.target.value)} error={!(vvod.dlinaM > 0)} />
        </Pole>
        <Pole label="Тип рельса">
          <Select value={relsId} onChange={(e) => vybratRels(e.target.value as PutRels)} options={RELSY_PUTI} />
        </Pole>
        <Pole label="Длина рельса, м" hint={`Ходовые: ${DLINY_RELSA.map((d) => fmt(d)).join(' и ')} м`}>
          <Select
            value={dlinaRelsa}
            onChange={(e) => setDlinaRelsa(e.target.value)}
            options={DLINY_RELSA.map((d) => ({ value: String(d), label: `${fmt(d)} м` }))}
          />
        </Pole>
        <Pole label="Шпалы">
          <Select
            value={shpaly}
            onChange={(e) => setShpaly(e.target.value as Shpaly)}
            options={[
              ...(nabor.podkladkiZhb.length ? [{ value: 'zhb', label: 'Железобетонные, скрепление КБ' }] : []),
              { value: 'der', label: 'Деревянные, костыльное скрепление' },
            ]}
          />
        </Pole>
        <Pole label="Число шпал">
          <Select
            value={schitatShpaly}
            onChange={(e) => {
              const next = e.target.value as 'epura' | 'svoi'
              setSchitatShpaly(next)
              // переходя на своё число, подставляем посчитанное — его удобно поправить
              if (next === 'svoi' && !shpalSvoi && rows.length) setShpalSvoi(String(rows[1].sht))
            }}
            options={[
              { value: 'epura', label: 'Считать по эпюре' },
              { value: 'svoi', label: 'Указать своё число' },
            ]}
          />
        </Pole>
        {schitatShpaly === 'epura' ? (
          <Pole label="Эпюра, шпал на 1 км" hint="Укажите по проекту">
            <div className="flex gap-2">
              <Input className="min-w-0" inputMode="numeric" value={epura} onChange={(e) => setEpura(e.target.value)} error={!(vvod.epura >= 1000 && vvod.epura <= 3000)} />
              {['1840', '2000'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setEpura(value)}
                  className="shrink-0 rounded-lg border border-border px-3 text-sm font-semibold hover:border-primary hover:text-primary"
                >
                  {value}
                </button>
              ))}
            </div>
          </Pole>
        ) : (
          <Pole label="Шпал на участок, шт." hint="Своё число: подкладки и скрепления считаются от него">
            <Input
              inputMode="numeric"
              value={shpalSvoi}
              onChange={(e) => setShpalSvoi(e.target.value)}
              error={!(chislo(shpalSvoi) >= 1)}
            />
          </Pole>
        )}
        <Pole label="Накладка">
          <Select value={nakladkaId} onChange={(e) => setNakladkaId(e.target.value)} options={varianty(nabor.nakladki)} />
        </Pole>
        <Pole label="Стыковой болт" hint="Длину болта выберите по проекту">
          <Select value={boltId} onChange={(e) => setBoltId(e.target.value)} options={varianty(nabor.bolty)} />
        </Pole>
        {shpaly === 'zhb' ? (
          <Pole label="Подкладка">
            <Select value={podkladkaZhbId} onChange={(e) => setPodkladkaZhbId(e.target.value)} options={varianty(nabor.podkladkiZhb)} />
          </Pole>
        ) : (
          <>
            <Pole label="Подкладка">
              <Select value={podkladkaDerId} onChange={(e) => setPodkladkaDerId(e.target.value)} options={varianty(nabor.podkladkiDer)} />
            </Pole>
            <Pole label="Костыль">
              <Select value={kostylId} onChange={(e) => setKostylId(e.target.value)} options={varianty(KOSTYLI)} />
            </Pole>
            <Pole
              label="Костылей на одну подкладку"
              hint={`По умолчанию ${OTVERSTIY_POD_KOSTYLI} — по числу отверстий подкладки. Уменьшите, если по проекту меньше.`}
            >
              <Input inputMode="numeric" value={kostyley} onChange={(e) => setKostyley(e.target.value)} />
            </Pole>
          </>
        )}
      </div>

      {oshibki.length > 0 ? (
        <ul className="rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm text-foreground">
          {oshibki.map((text) => <li key={text}>{text}</li>)}
        </ul>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Itog label="Итого по позициям с массой" value={`${fmt(itogoTonn(rows), 3)} т`} />
            <Itog label="Рельсов" value={`${fmt(rows[0].sht, 0)} шт.`} />
            <Itog label="Шпал" value={`${fmt(rows[1].sht, 0)} шт.`} />
          </div>

          <ul className="divide-y divide-border rounded-lg border border-border sm:hidden">
            {rows.map((row) => (
              <li key={row.name} className="p-4">
                <div className="font-medium text-foreground">{row.name}</div>
                <div className="mt-1 text-sm tabular-nums text-foreground">
                  {fmt(row.sht, 0)} шт.{row.tonny === null ? '' : ` · ${fmt(row.tonny, 3)} т`}
                </div>
                {row.primechanie && <div className="mt-1 text-xs text-muted-foreground">{row.primechanie}</div>}
                {row.istochnik && <Ssylka istochnik={row.istochnik} />}
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto rounded-lg border border-border sm:block">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Позиция</th>
                  <th className="px-4 py-3 text-right font-semibold">Кол-во, шт.</th>
                  <th className="px-4 py-3 text-right font-semibold">Масса, т</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.name} className="border-t border-border align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{row.name}</div>
                      {row.primechanie && <div className="text-xs text-muted-foreground">{row.primechanie}</div>}
                      {row.istochnik && <Ssylka istochnik={row.istochnik} />}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{fmt(row.sht, 0)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.tonny === null ? '—' : fmt(row.tonny, 3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            Расчёт для звеньевого пути по две рельсовые нити, по одному стыку на рельс. Не учтены:
            прокладки и изолирующие детали, противоугоны, балласт, запас на отход. Путевые шурупы и шпалы
            идут без массы — их стандарты массу не устанавливают. Массы теоретические. Окончательную
            спецификацию определяет проект.
          </p>

          <DeystviyaRascheta tekst={tekstVedomosti(vvod, rows)} chtoKopiruem="Ведомость" />
        </>
      )}
    </div>
  )
}
