import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { useServices } from '@/entities/service/model/hooks/useServices'
import { getImageUrl } from '@/shared/lib'
import { UploadImg } from '@/shared/ui/UploadImg'

export function MaterialsServices() {
  const { services, isLoading } = useServices()
  const visibleServices = services.slice(0, 2)
  if (!isLoading && !visibleServices.length) return null

  return (
    <section className="py-20 bg-[hsl(var(--muted))]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-black mb-4 text-[hsl(var(--foreground))]"
        >
          Материалы и услуги
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-[hsl(var(--muted-foreground))] mb-12 max-w-2xl text-lg"
        >
          Не только поставка, но и полный комплекс работ — обработка и монтаж
        </motion.p>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="aspect-[4/5] rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden animate-pulse"
              >
                <div className="h-1/2 bg-[hsl(var(--muted))]" />
                <div className="p-8 space-y-4">
                  <div className="h-6 bg-[hsl(var(--muted))] rounded w-3/4" />
                  <div className="h-4 bg-[hsl(var(--muted))] rounded w-full" />
                  <div className="h-4 bg-[hsl(var(--muted))] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && visibleServices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {visibleServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
              >
                <Link
                  to={`/services/${service.slug}`}
                  className="group block h-full rounded-2xl overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))] hover:shadow-2xl hover:shadow-[hsl(var(--primary))/0.1] transition-all duration-500"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[hsl(var(--muted))]">
                    {service.image ? (
                      <UploadImg
                        src={getImageUrl(service.image)}
                        sizes="(min-width: 768px) 500px, calc(100vw - 34px)"
                        alt={service.title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <svg className="h-16 w-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="pointer-events-none absolute top-4 right-4 w-11 h-11 rounded-full bg-[hsl(var(--card))]/90 backdrop-blur-sm flex items-center justify-center text-[hsl(var(--foreground))] group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-all duration-300">
                      <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <div className="p-8 md:p-10">
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed mb-6 line-clamp-3">
                      {service.description}
                    </p>
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))] group-hover:gap-3 transition-all duration-300">
                      Подробнее
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && visibleServices.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] font-semibold hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition-all duration-300"
            >
              Все услуги
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}