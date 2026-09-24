// src/pages/delivery/DeliveryPage.tsx
import { Breadcrumbs } from '../../shared/ui/Breadcrumbs'
import { Container } from '../../shared/ui/Container'
import { SectionHeading } from '../../shared/ui/SectionHeading'
import { FeatureCard } from '../../shared/ui/FeatureCard'
import { StatCard } from '../../shared/ui/StatCard'
import { DeliverySteps } from '../../widgets/delivery-steps/DeliverySteps'
import { DeliveryCTA } from '../../widgets/delivery-cta/DeliveryCTA'
import { PaymentTerms } from '../../widgets/payment-terms/PaymentTerms'
import { Layout } from '../../widgets/Layout'

const METHODS = [
  {
    icon: '🚂',
    title: 'Железнодорожная доставка',
    description:
      'Вагонами и контейнерами по всей России и СНГ. Оптимально для крупных партий рельсов и шпал.',
    accent: 'from-primary to-accent',
  },
  {
    icon: '🚛',
    title: 'Автотранспорт',
    description:
      'Доставка автотранспортом прямо на объект или склад. Удобно для небольших партий и крепежа.',
    accent: 'from-accent-300 to-orange-500',
  },
  {
    icon: '🏭',
    title: 'Самовывоз со склада',
    description:
      'Отгрузка в день обращения с собственных складов. Поможем с погрузкой и оформлением.',
    accent: 'from-red-500 to-primary',
  },
]

const ADVANTAGES = [
  {
    icon: '⏱️',
    title: 'Отгрузка 48 часов',
    description:
      'Быстрая отгрузка со склада в течение 48 часов после подтверждения.',
    accent: 'from-primary to-accent',
  },
  {
    icon: '🏗️',
    title: 'Собственные склады',
    description: 'Ключевые позиции ВСП всегда в наличии на наших складах.',
    accent: 'from-accent to-orange-500',
  },
  {
    icon: '📄',
    title: 'Полный пакет документов',
    description: 'Сертификаты, паспорта качества, сопроводительные документы.',
    accent: 'from-red-500 to-primary',
  },
  {
    icon: '🤝',
    title: 'Помощь с разгрузкой',
    description:
      'Консультации по разгрузке и размещению материалов на объекте.',
    accent: 'from-primary to-red-400',
  },
]

const STATS = [
  { value: '48ч', label: 'До отгрузки' },
  { value: 'РФ + СНГ', label: 'География доставки' },
  { value: 'Ж/Д + Авто', label: 'Виды транспорта' },
  { value: '100%', label: 'Пакет документов' },
]

export function DeliveryPage() {
  return (
    <Layout>
      <Container className="py-8 md:py-12">
        {/* Hero страницы */}
        <section className="relative overflow-hidden rounded-lg border border-border bg-muted p-6 md:p-12 mb-12">
          <div className="relative">
            <Breadcrumbs
              items={[{ label: 'Главная', href: '/' }, { label: 'Доставка' }]}
            />
            <div className="mt-6 max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 py-1.5 text-sm font-semibold text-primary">
                ⚡ Отгрузка в течение 48 часов
              </span>
              <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-tight text-foreground">
                Доставка по России и СНГ
              </h1>
              <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                Доставляем материалы ВСП железнодорожным и автомобильным
                транспортом — прямо на объект или ваш склад.
              </p>
            </div>
          </div>
        </section>

        {/* Ключевые цифры */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Способы доставки */}
        <section className="mb-16">
          <SectionHeading>Способы доставки</SectionHeading>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {METHODS.map((m) => (
              <FeatureCard key={m.title} {...m} />
            ))}
          </div>
        </section>

        {/* Этапы доставки */}
        <DeliverySteps />

        {/* Оплата и документы */}
        <PaymentTerms />

        {/* Преимущества */}
        <section className="py-12 md:py-16">
          <SectionHeading>Преимущества доставки</SectionHeading>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {ADVANTAGES.map((a) => (
              <FeatureCard key={a.title} {...a} />
            ))}
          </div>
        </section>

        {/* CTA с формой */}
        <DeliveryCTA />
      </Container>
    </Layout>
  )
}
