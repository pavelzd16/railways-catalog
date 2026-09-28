import { FiChevronDown, FiHelpCircle } from 'react-icons/fi'
import { Link } from 'react-router'
import type { FaqItem } from '@/shared/lib/product-faq'

export interface ProductFaqProps {
  items: FaqItem[]
}

/**
 * «Частые вопросы» в карточке товара. Аккордеон на нативных <details>/<summary>:
 * ответы попадают в серверный HTML свёрнутыми, раскрываются без JS и с клавиатуры.
 */
export function ProductFaq({ items }: ProductFaqProps) {
  if (!items.length) return null
  return (
    <section aria-labelledby="product-faq-title" className="mb-12 border-t border-border pt-10">
      <div className="mb-5 flex items-center gap-2">
        <FiHelpCircle aria-hidden className="h-5 w-5 text-primary" />

        <h2 id="product-faq-title" className="section-title">
          Частые вопросы
        </h2>
      </div>

      <div className="max-w-4xl divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {items.map((item) => (
          <details key={item.question} className="group">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-base font-semibold text-foreground transition-colors hover:text-primary group-open:text-primary [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>

              <FiChevronDown
                aria-hidden
                className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              />
            </summary>

            <div className="px-4 pb-4 text-base leading-7 text-muted-foreground">
              <p>{item.answer}</p>

              {item.link && (
                <Link
                  to={item.link.href}
                  className="mt-2 inline-block font-medium text-primary hover:underline"
                >
                  {item.link.label} →
                </Link>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
