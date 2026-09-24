// src/widgets/delivery-steps/DeliverySteps.tsx
import { Card, CardContent } from '../../shared/ui/Card'
import { SectionHeading } from '../../shared/ui/SectionHeading'

const STEPS = [
  {
    number: '01',
    title: 'Заявка и уточнение объёма',
    description:
      'Оставляете заявку на сайте или по телефону, уточняем детали и объём партии',
    accent: 'from-primary to-accent',
  },
  {
    number: '02',
    title: 'Расчёт логистики и сроков',
    description: 'Рассчитываем оптимальный маршрут, стоимость и сроки доставки',
    accent: 'from-accent to-orange-500',
  },
  {
    number: '03',
    title: 'Отгрузка со склада (48 часов)',
    description: 'Комплектуем заказ и отгружаем со склада в течение 48 часов',
    accent: 'from-red-500 to-primary',
  },
  {
    number: '04',
    title: 'Доставка на объект + документы',
    description:
      'Доставляем груз на объект, передаём полный пакет сопроводительных документов',
    accent: 'from-primary to-red-400',
  },
]

export function DeliverySteps() {
  return (
    <section className="py-12 md:py-16">
      <SectionHeading>Как происходит доставка</SectionHeading>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {STEPS.map((step) => (
          <Card key={step.number} className="relative p-3 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-accent" />

            <CardContent className="flex h-full flex-col p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-accent text-xl font-bold text-accent-foreground mb-4">
                {step.number}
              </div>

              <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
