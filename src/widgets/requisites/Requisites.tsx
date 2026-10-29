import { FiDownload } from 'react-icons/fi'

/**
 * Реквизиты ООО «ИНВИА» на страницах «О компании» и «Контакты». Данные и PDF — по карте
 * партнёра «ПроРельс – Карта партнера» от пользователя (29.10.2026): расчётный счёт …4216.
 * Файл лежит по старому адресу, чтобы прежние ссылки на него открывали новую карту.
 */
export const PARTNER_CARD_URL = '/data/Карта партнера ИНВИА1.pdf'
export const PARTNER_CARD_FILENAME = 'Карта партнера ИНВИА.pdf'

type Row = { label: string; value: string }

const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: 'Компания',
    rows: [
      { label: 'Бренд', value: 'Группа компаний ИНВИА' },
      { label: 'Наименование', value: 'ООО «ИНВИА»' },
      { label: 'ИНН', value: '1648052000' },
      { label: 'КПП', value: '164801001' },
      { label: 'ОГРН', value: '1201600037055' },
      {
        label: 'Юридический / фактический адрес',
        value:
          '422549, Республика Татарстан, Зеленодольский р-н, г. Зеленодольск, ул. Московская, зд. 4, помещ. 1',
      },
      { label: 'Почтовый адрес', value: '422540, г. Зеленодольск, а/я 34' },
    ],
  },
  {
    title: 'Банковские реквизиты',
    rows: [
      { label: 'Банк', value: 'ФИЛИАЛ «НИЖЕГОРОДСКИЙ» АО «АЛЬФА-БАНК»' },
      { label: 'БИК', value: '042202824' },
      { label: 'Расчётный счёт', value: '40702810229070014216' },
      { label: 'Корр. счёт', value: '30101810200000000824' },
    ],
  },
  {
    title: 'ЭДО',
    rows: [
      { label: 'Оператор', value: 'СБИС Тензор' },
      { label: 'ID участника', value: '2BEf45e6c1997934c0899e1425c5fdb485e' },
    ],
  },
]

export function Requisites({ titleClassName }: { titleClassName: string }) {
  const [company, ...rest] = GROUPS
  return (
    <section className="mb-12 rounded-xl border border-border bg-card p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className={titleClassName}>Реквизиты</h2>

        <a
          href={encodeURI(PARTNER_CARD_URL)}
          download={PARTNER_CARD_FILENAME}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent-gradient px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <FiDownload className="h-4 w-4" />
          Скачать реквизиты (PDF)
        </a>
      </div>

      <div className="grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-2">
        <Group {...company} />
        <div className="space-y-6">
          {rest.map((group) => (
            <Group key={group.title} {...group} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Group({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <dl className="divide-y divide-border border-y border-border text-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-1 gap-0.5 py-2.5 sm:grid-cols-[12rem_1fr] sm:gap-4"
          >
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="break-words font-medium text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
