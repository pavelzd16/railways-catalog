import { useParams, Link } from 'react-router'
import { FiCheck, FiArrowLeft } from 'react-icons/fi'
import { Breadcrumbs } from '@/shared/ui/Breadcrumbs'
import { Button } from '@/shared/ui/Button'
import { Layout } from '@/widgets/Layout'
import { useService } from '@/entities/service/model/hooks/useService'
import { getImageUrl } from '@/shared/lib'
import { UploadImg } from '@/shared/ui/UploadImg'
import { ServiceRequestForm } from '@/features/service-request/ServiceRequestForm'

export function ServicePage() {
  const { slug } = useParams<{ slug: string }>()
  const { service, isLoading, error, notFound } = useService(slug)

  const breadcrumbs = service
    ? [
        { label: 'Главная', href: '/' },
        { label: 'Услуги', href: '/services' },
        { label: service.title, href: undefined },
      ]
    : [
        { label: 'Главная', href: '/' },
        { label: 'Услуги', href: '/services' },
      ]

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbs} />

        {isLoading && (
          <div className="py-16 text-center" role="status" aria-live="polite">
            <p className="text-[hsl(var(--muted-foreground))]">Загрузка услуги...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="py-16 text-center">
            <p className="text-red-500 mb-4" role="alert">{error}</p>
            <Link to="/services">
              <Button variant="primary">
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Вернуться к услугам
              </Button>
            </Link>
          </div>
        )}

        {notFound && !isLoading && (
          <div className="py-16 text-center">
            <h1 className="text-2xl font-bold mb-4">Услуга не найдена</h1>
            <Link to="/services">
              <Button variant="primary">
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Вернуться к услугам
              </Button>
            </Link>
          </div>
        )}

        {service && !isLoading && !error && !notFound && (
          <>
            <header className="mb-8">
              <Link
                to="/services"
                className="inline-flex items-center text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors mb-4"
                aria-label="Вернуться к списку услуг"
              >
                <FiArrowLeft className="w-4 h-4 mr-1" aria-hidden="true" />
                Назад к услугам
              </Link>

              <div className="flex flex-col md:flex-row items-start gap-6 mb-4">
                <div className="h-32 w-32 md:h-40 md:w-40 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                  {service.image ? (
                    <UploadImg
                      src={getImageUrl(service.image)}
                      sizes="160px"
                      alt={`${service.title} — услуга от компании INVIA`}
                      className="h-full w-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground" role="img" aria-label="Изображение услуги отсутствует">
                      <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-black mb-2">{service.title}</h1>
                  <p className="text-lg text-[hsl(var(--muted-foreground))]">{service.description}</p>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-8">
                {service.fullDescription && (
                  <section className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6" aria-labelledby="service-description-heading">
                    <h2 id="service-description-heading" className="text-xl font-bold mb-4">Описание услуги</h2>
                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed whitespace-pre-line">
                      {service.fullDescription}
                    </p>
                  </section>
                )}

                {service.features && service.features.length > 0 && (
                  <section className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6" aria-labelledby="service-features-heading">
                    <h2 id="service-features-heading" className="text-xl font-bold mb-4">Преимущества</h2>
                    <ul className="space-y-3" role="list">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <FiCheck className="w-5 h-5 text-[hsl(var(--primary))] flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span className="text-[hsl(var(--muted-foreground))]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6" aria-labelledby="service-process-heading">
                  <h2 id="service-process-heading" className="text-xl font-bold mb-4">Как мы работаем</h2>
                  <ol className="grid grid-cols-2 md:grid-cols-4 gap-4" role="list">
                    <li className="text-center" role="listitem">
                      <div className="text-3xl font-black text-[hsl(var(--primary))] mb-2" aria-hidden="true">01</div>
                      <h3 className="font-bold text-sm mb-1">Заявка</h3>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Оставляете заявку на сайте</p>
                    </li>
                    <li className="text-center" role="listitem">
                      <div className="text-3xl font-black text-[hsl(var(--primary))] mb-2" aria-hidden="true">02</div>
                      <h3 className="font-bold text-sm mb-1">Расчёт</h3>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Рассчитываем стоимость</p>
                    </li>
                    <li className="text-center" role="listitem">
                      <div className="text-3xl font-black text-[hsl(var(--primary))] mb-2" aria-hidden="true">03</div>
                      <h3 className="font-bold text-sm mb-1">Договор</h3>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Заключаем договор</p>
                    </li>
                    <li className="text-center" role="listitem">
                      <div className="text-3xl font-black text-[hsl(var(--primary))] mb-2" aria-hidden="true">04</div>
                      <h3 className="font-bold text-sm mb-1">Выполнение</h3>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Выполняем работу</p>
                    </li>
                  </ol>
                </section>
              </div>

              <aside className="lg:col-span-1" aria-label="Форма заказа услуги">
                <div className="sticky top-20">
                  <ServiceRequestForm
                    serviceId={service.id}
                    serviceTitle={service.title}
                    compact
                  />
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}