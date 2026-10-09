import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { FiArrowRight } from 'react-icons/fi'
import { HomeCategoriesSidebar } from '@/widgets/home-categories-sidebar/HomeCategoriesSidebar'
import { usePositionsCount } from '@/entities/product'
import { POSITIONS_CAPTION, positionsValue } from '@/shared/lib/positions-count'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const positions = usePositionsCount()
  useEffect(() => {
    // The hero fills the first screen below the header. Measure only at the
    // top of the page, where the header still has its full height.
    const measure = () => {
      const section = sectionRef.current
      if (!section || window.scrollY > 0) return
      const top = Math.round(section.getBoundingClientRect().top)
      section.style.setProperty('--hero-top', `${top}px`)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  return (
    <section
      ref={sectionRef}
      className="hero-section relative flex overflow-hidden bg-foreground text-white"
    >
      <div
        className="hero-photo absolute inset-0 bg-cover bg-center bg-[url('/hero-fon.jpg')]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-linear-to-r from-[#1C1F22]/95 via-[#1C1F22]/80 to-[#1C1F22]/25"
        aria-hidden="true"
      />
      <div className="hero-content container relative mx-auto grid content-center gap-6 px-6 pt-6 lg:grid-cols-[264px_minmax(0,1fr)] lg:items-center lg:gap-10 lg:pt-8 xl:gap-12 xl:px-8">
        <HomeCategoriesSidebar />
        <div className="hero-copy min-w-0 lg:self-center">
          <p className="hero-enter mb-5 text-sm font-bold tracking-[.05em] text-white/85">
            ИНВИА · МАТЕРИАЛЫ ВСП
          </p>
          <h1 className="hero-title hero-enter hero-delay-1">
            Материалы верхнего строения железнодорожного пути
          </h1>
          <p className="hero-enter hero-delay-2 mt-6 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
            Рельсы, шпалы, накладки и скрепления.
            <br />
            Производство, комплексные поставки.
          </p>
          <div className="hero-enter hero-delay-2 mt-8 flex flex-wrap gap-3">
            <Link
              to="/catalog"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-lg bg-accent px-6 py-3 font-bold text-accent-foreground transition-colors hover:bg-[#E85E14]"
            >
              Открыть каталог
              <FiArrowRight />
            </Link>
          </div>
          {/* Четыре цифры: на телефоне — два на два, с 640 px — в один ряд. */}
          <dl className="hero-enter hero-delay-3 mt-10 grid max-w-3xl grid-cols-2 gap-x-4 gap-y-6 border-t border-white/25 pt-7 sm:grid-cols-4 md:gap-x-10">
            {[
              [positionsValue(positions), POSITIONS_CAPTION],
              ['16+', 'лет на рынке'],
              ['5000+', 'партнёров'],
              ['48ч', 'отгрузка'],
            ].map(([value, label]) => (
              <div key={label} className="flex flex-col">
                <dt className="mt-2 text-xs text-white/85 sm:text-sm">
                  {label}
                </dt>
                <dd className="-order-1 text-[30px] font-bold leading-none text-accent [font-variant-numeric:tabular-nums] sm:text-5xl">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
