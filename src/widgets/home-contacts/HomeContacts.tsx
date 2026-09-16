import { FiPhone, FiMail, FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router'
export function HomeContacts() {
  return (
    <section className="border-t border-border bg-muted py-12 md:py-16">
      <div className="container mx-auto grid gap-8 px-6 md:grid-cols-2 xl:px-8">
        <div>
          <h2 className="section-title mb-5">Обсудим вашу поставку</h2>
          <p className="max-w-lg text-muted-foreground">
            Позвоните или отправьте спецификацию. Подберём материалы и согласуем
            условия отгрузки.
          </p>
        </div>
        <div className="space-y-4">
          <a
            href="tel:+78432270005"
            className="flex items-center gap-3 text-2xl font-bold tracking-tight hover:text-primary sm:text-3xl"
          >
            <FiPhone className="h-6 w-6 shrink-0 text-primary" />
            +7 (843) 227-00-05
          </a>
          <a
            href="tel:+79625270005"
            className="flex items-center gap-3 text-lg font-bold hover:text-primary"
          >
            <FiPhone className="text-primary" />
            +7 (962) 527-00-05
          </a>
          <a
            href="mailto:zakaz@traer.ru"
            className="flex items-center gap-3 text-lg hover:text-primary"
          >
            <FiMail className="text-primary" />
            zakaz@traer.ru
          </a>
          <p className="text-sm text-muted-foreground">
            Зеленодольск, ул. Московская, зд. 4, помещ. 1<br />
            Пн–Пт, 8:00–17:00
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="tel:+78432270005"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-accent px-5 font-bold text-accent-foreground md:hidden"
            >
              <FiPhone />
              Позвонить
            </a>
            <Link
              to="/contacts"
              className="inline-flex min-h-12 items-center gap-2 font-bold text-primary"
            >
              Все контакты
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
