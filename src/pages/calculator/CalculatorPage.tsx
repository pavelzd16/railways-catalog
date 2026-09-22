import { Breadcrumbs } from '../../shared/ui/Breadcrumbs'
import { Container } from '../../shared/ui/Container'
import { Tabs } from '../../shared/ui/Tabs'
import { Layout } from '../../widgets/Layout'
import { RelsyTab } from '../../features/kalkulyator/ui/RelsyTab'
import { IzdeliyaTab } from '../../features/kalkulyator/ui/IzdeliyaTab'
import { PutTab } from '../../features/kalkulyator/ui/PutTab'

export function CalculatorPage() {
  return (
    <Layout>
      <Container className="py-8 md:py-12">
        <section className="mb-10 rounded-lg border border-border bg-muted p-6 md:p-10">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Калькулятор' }]} />
          <div className="mt-6 max-w-3xl">
            <h1 className="text-3xl font-black tracking-tight text-foreground md:text-5xl">
              Калькулятор материалов ВСП
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              Переведите метры рельсов в тонны, штуки крепежа в килограммы или получите ведомость
              материалов на участок пути. Масса каждой позиции — из действующего ГОСТа, ссылка
              на пункт стандарта указана рядом с результатом.
            </p>
          </div>
        </section>

        <Tabs
          className="rounded-lg border border-border bg-card p-4 md:p-6"
          tabs={[
            { id: 'relsy', label: 'Рельсы', content: <RelsyTab /> },
            { id: 'krepezh', label: 'Крепёж и детали', content: <IzdeliyaTab /> },
            { id: 'put', label: 'Путь на километр', content: <PutTab /> },
          ]}
        />
      </Container>
    </Layout>
  )
}
