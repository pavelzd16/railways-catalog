import { Breadcrumbs } from '../../shared/ui/Breadcrumbs'
import { Container } from '../../shared/ui/Container'
import { SITE_FAQ } from '../../shared/lib/site-faq'
import { Layout } from '../../widgets/Layout'

/** «Частые вопросы» (/faq): ответы раскрыты сразу — весь текст виден и в серверном HTML, и посетителю. */
export function FaqPage() {
  return (
    <Layout>
      <Container className="py-8 md:py-12">
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Частые вопросы' }]} />
        <h1 className="mt-6 text-3xl md:text-5xl font-black tracking-tight text-foreground">
          Частые вопросы
        </h1>

        <div className="mt-8 max-w-4xl divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {SITE_FAQ.map((item) => (
            <section key={item.question} className="px-4 py-5 md:px-6">
              <h2 className="text-lg md:text-xl font-semibold text-foreground">{item.question}</h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">{item.answer}</p>
            </section>
          ))}
        </div>
      </Container>
    </Layout>
  )
}
