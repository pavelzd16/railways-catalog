import { FiPhone } from 'react-icons/fi'
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs'
import { Button } from '@/shared/ui/Button'
import { StatCard } from '@/shared/ui/StatCard'
import { Layout } from '@/widgets/Layout'
import { Requisites } from '@/widgets/requisites/Requisites'


const PRODUCT_RANGE = [
  'железнодорожные рельсы',
  'деревянные и железобетонные шпалы',
  'пропитанные шпалы и брус',
  'стрелочные переводы и комплектующие',
  'рельсовые скрепления',
  'накладки, подкладки и крепёж',
  'детали верхнего строения пути',
  'путевой инструмент',
  'другие материалы и изделия для железнодорожной инфраструктуры',
]

const INTRO_PARAGRAPHS = [
  'Мы — группа компаний, работающая в сфере железнодорожных материалов, древесины и логистики.',
  'Группа компаний развивает свою деятельность с 2010 года, а с 2020 года отдельным направлением является организация грузовых перевозок и логистика.',
  'Сегодня мы объединяем опыт в снабжении и перевозках, чтобы закрывать задачи клиентов комплексно — от подбора необходимых материалов до их доставки на объект.',
  'Основное направление нашей работы — поставка материалов для строительства, ремонта и содержания железнодорожных путей.',
]

const SUPPLY_PARAGRAPHS = [
  'Мы понимаем, что при строительстве и ремонте железнодорожных путей важна не только цена отдельного изделия. Необходимо получить подходящий материал, в нужном количестве, в согласованные сроки и доставить его непосредственно на объект.',
  'Поэтому мы организуем поставку с учётом характеристик груза, места назначения и требований заказчика.',
  'Собственные склады и производственные мощности позволяют нам поддерживать необходимый запас продукции и оперативно комплектовать заказы. По ключевым позициям обеспечиваем 100% наличие.',
  'Вся поставляемая продукция соответствует установленным требованиям и сопровождается необходимыми ГОСТами, паспортами и сертификатами качества.',
  'Собственная экспертиза в логистике позволяет нам подбирать оптимальный вариант перевозки и контролировать процесс доставки от отправителя до места выгрузки.',
]

const CLIENT_PARAGRAPHS = [
  'Мы готовы работать как с отдельными позициями, так и с комплексными заявками.',
  'Помогаем подобрать необходимые материалы, сформировать поставку, согласовать сроки и организовать доставку.',
  'Наша задача — сделать закупку железнодорожных материалов максимально понятной и удобной для клиента: от заявки до получения продукции на объекте.',
  'Мы строим работу на долгосрочном сотрудничестве, ответственном отношении к обязательствам и внимании к деталям.',
]

const STATS = [
  { value: '16+', label: 'Лет на рынке' },
  { value: '5000+', label: 'Довольных партнёров' },
  { value: '100%', label: 'Наличие по ключевым позициям' },
  { value: '48ч', label: 'Отгрузка' },
]

export function AboutPage() {
  const breadcrumbs = [
    { label: 'Главная', href: '/' },
    { label: 'О компании', href: undefined },
  ]

  const handleOpenRequestForm = () => {
    window.dispatchEvent(new CustomEvent('open-request-form'))
  }

  return (
    <Layout>
      <div className="about-copy container mx-auto px-6 py-10 xl:px-8">
        <Breadcrumbs items={breadcrumbs} />

        <h1 className="page-title mb-8">О компании</h1>

        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            {INTRO_PARAGRAPHS.map((text, index) => (
              <p
                key={index}
                className={`text-muted-foreground ${
                  index < INTRO_PARAGRAPHS.length - 1 ? 'mb-4' : ''
                }`}
              >
                {text}
              </p>
            ))}
          </div>
          <div className="aspect-[1280/595] overflow-hidden rounded-xl bg-muted">
            {/* PNG весит 1,5 МБ — браузер берёт WebP той же картинки, PNG остаётся для старых браузеров. */}
            <picture className="contents">
              <source
                type="image/webp"
                srcSet="/about-building-640.webp 640w, /about-building-1280.webp 1280w"
                sizes="(min-width: 1024px) 600px, 100vw"
              />
              <img
                src="/about-building.png"
                alt="Вход в здание на Московской улице в Зеленодольске"
                className="h-full w-full object-cover"
              />
            </picture>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            В ассортименте
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {PRODUCT_RANGE.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-muted-foreground">
            Мы также работаем с древесиной и её обработкой, в том числе с
            продукцией, предназначенной для эксплуатации в условиях повышенных
            нагрузок и воздействия окружающей среды.
          </p>
        </div>

        <TextSection title="Поставка без лишних сложностей" paragraphs={SUPPLY_PARAGRAPHS} />

        <TextSection title="Работаем под задачу клиента" paragraphs={CLIENT_PARAGRAPHS} />

        <div className="mb-12 rounded-lg border border-border bg-muted p-8 text-foreground">
          <p className="text-xl font-bold">
            Материалы для пути. Логистика до объекта. Решение задачи в комплексе.
          </p>
        </div>

        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>

        <Requisites titleClassName="text-2xl font-bold text-foreground" />

        <div className="text-center">
          <Button size="lg" className="gap-2" onClick={handleOpenRequestForm}>
            <FiPhone className="h-5 w-5" />
            Запросить КП
          </Button>
        </div>
      </div>
    </Layout>
  )
}

function TextSection({
  title,
  paragraphs,
}: {
  title: string
  paragraphs: string[]
}) {
  return (
    <div className="mb-12">
      <h2 className="mb-6 text-2xl font-bold text-foreground">{title}</h2>
      <div className="space-y-4 text-muted-foreground">
        {paragraphs.map((text, index) => (
          <p key={index}>{text}</p>
        ))}
      </div>
    </div>
  )
}
