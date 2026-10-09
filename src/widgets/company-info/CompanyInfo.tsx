import { motion } from 'framer-motion'

const advantages = [
  { title: 'Наличие продукции', description: 'Собственные склады' },
  { title: 'Соответствие стандартам', description: 'ГОСТ и ТУ' },
  { title: 'Поставка по регионам', description: 'РФ и СНГ' },
  { title: 'Комплектация объектов', description: 'Под ключ' },
]

export function CompanyInfo() {
  return (
    <section className="py-16 bg-[hsl(var(--background))]">
      <div className="container mx-auto px-6 xl:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title mb-6 break-words text-foreground">
              Надёжный поставщик материалов для железнодорожного строительства
            </h2>

            <div className="space-y-4 text-[hsl(var(--muted-foreground))]">
              <p>
                Группа компаний ИНВИА специализируется на поставке железнодорожных
                материалов более 16 лет. Мы обеспечиваем полный цикл снабжения —
                от подбора продукции до доставки на объект.
              </p>
              <p>
                На наших складах всегда в наличии рельсы, шпалы, крепёжные
                элементы и другие материалы ВСП. Работаем с крупнейшими
                производителями России и СНГ, что гарантирует качество и
                конкурентные цены.
              </p>
              <p>
                Осуществляем комплектацию объектов любой сложности,
                предоставляем полный пакет сопроводительной документации и
                сертификатов качества.
              </p>
            </div>
          </motion.div>

          {/* Advantages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {advantages.map((item) => (
              <div
                key={item.title}
                className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
              >
                <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center mb-3">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-2xl leading-tight text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
