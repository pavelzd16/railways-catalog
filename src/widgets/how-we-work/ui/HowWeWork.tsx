import { FiFileText, FiCreditCard, FiClock, FiCheckCircle, FiShield } from 'react-icons/fi'
import { Link } from 'react-router'
import { WARRANTY_SHORT, WARRANTY_TEXT } from '@/shared/lib/warranty'

// Условия показаны как в PDF-рекомендации. Перед публикацией проверьте каждый пункт:
// пишем только то, что компания действительно выполняет.
const TERMS = [
  { icon: FiShield, title: WARRANTY_SHORT, text: WARRANTY_TEXT },
  { icon: FiFileText, title: 'Электронный документооборот', text: 'Накладные и полный пакет документов передаём через ЭДО.' },
  { icon: FiCheckCircle, title: 'Комплект документов', text: 'Сертификат и паспорт качества на каждую партию.' },
  { icon: FiCreditCard, title: 'Условия оплаты', text: 'Согласуем порядок оплаты под вашу сделку: по счёту, с отсрочкой или при отгрузке.' },
  { icon: FiClock, title: 'Срок ответа', text: 'Ответим на заявку и пришлём расчёт в течение рабочего дня.' },
]

export function HowWeWork() {
  return (
    <section className="bg-white py-12 md:py-16" aria-labelledby="how-we-work-title">
      <div className="container mx-auto px-6 xl:px-8">
        <h2 id="how-we-work-title" className="section-title mb-8">
          Как мы работаем
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {TERMS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-lg border border-border bg-card p-5">
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mb-2 text-lg font-bold leading-tight">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-bold text-primary">
          <Link to="/delivery" className="hover:underline">
            Доставка и оплата
          </Link>
          <Link to="/documents" className="hover:underline">
            Документы на партию
          </Link>
        </div>
      </div>
    </section>
  )
}