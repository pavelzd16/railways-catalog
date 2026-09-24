import type { ReactNode } from 'react'
import {
  LuCircleCheck,
  LuFileCheck,
  LuFilePenLine,
  LuReceiptRussianRuble,
  LuReceiptText,
  LuWallet,
} from 'react-icons/lu'
import { Link } from 'react-router'
import { Card, CardContent } from '../../shared/ui/Card'
import { SectionHeading } from '../../shared/ui/SectionHeading'

/**
 * Оплата и документы на странице доставки. Условия — от пользователя (24.09.2026):
 * с НДС 22 % и без НДС, предоплата 100 %, полный пакет документов, ЭДО — СБИС. Текст свой,
 * сверен шинглами с promputsnab, vsp74 и tdtransmet.
 */
const OPTIONS: { icon: ReactNode; title: string; text: string }[] = [
  {
    icon: <LuReceiptRussianRuble className="size-7" />,
    title: 'С НДС 22 %',
    text: 'НДС выделен в счёте и в УПД, поэтому покупатель может принять его к вычету.',
  },
  {
    icon: <LuReceiptText className="size-7" />,
    title: 'Без НДС',
    text: 'Тоже работаем. Удобно, если вычет НДС вашей организации не нужен: отметьте это в заявке, и счёт придёт без НДС.',
  },
  {
    icon: <LuWallet className="size-7" />,
    title: 'Предоплата 100 %',
    text: 'Заказ уходит в отгрузку, как только вся сумма поступила на наш расчётный счёт.',
  },
]

const DOCUMENTS = [
  'Договор поставки',
  'Счёт на оплату',
  'УПД — с НДС или без, под выбранную форму оплаты',
  'Сертификаты и паспорта качества завода-изготовителя',
  'Транспортная накладная — при доставке автомобилем',
  'Железнодорожная накладная — при отгрузке вагоном',
]

export function PaymentTerms() {
  return (
    <section className="py-12 md:py-16">
      <SectionHeading>Оплата и документы</SectionHeading>
      <p className="mt-3 max-w-3xl text-base text-muted-foreground md:text-lg">
        Расчёт безналичный, по счёту. Подходит и тем, кто работает с НДС, и тем, кому
        он не нужен.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {OPTIONS.map((option) => (
          <Card key={option.title} className="relative">
            <div className="absolute inset-x-0 top-0 h-1 bg-accent" />
            <CardContent className="p-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {option.icon}
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">{option.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{option.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4 md:mt-6">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[minmax(0,18rem)_1fr] md:gap-10 md:p-8">
          <div>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <LuFileCheck className="size-7" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">
              Полный пакет сопроводительных документов
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Карточка предприятия с реквизитами для договора — на странице{' '}
              <Link to="/contacts" className="font-medium text-primary hover:underline">
                «Контакты»
              </Link>
              .
            </p>
          </div>

          <div className="flex flex-col justify-center gap-6">
            <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {DOCUMENTS.map((doc) => (
                <li key={doc} className="flex items-start gap-3 text-sm text-foreground">
                  <LuCircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
                  {doc}
                </li>
              ))}
            </ul>

            {/* ЭДО — СБИС (со слов пользователя, 24.09.2026). */}
            <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <LuFilePenLine aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-foreground">
                <strong className="font-bold">Электронный документооборот — СБИС.</strong>{' '}
                Документы можно получать в электронном виде, с электронной подписью.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
