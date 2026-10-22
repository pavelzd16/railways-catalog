import { Link } from 'react-router'
import { FiArrowUpRight } from 'react-icons/fi'
import { getImageUrl } from '@/shared/lib'
import { UploadImg } from '@/shared/ui/UploadImg'
import type { ArticleListItem } from '../model/types'

// Дата в карточке — числами, как на макете (22.10.2026). Часовой пояс задан, чтобы сервер и браузер написали одно и то же.
function cardDate(value?: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })
}

/**
 * Тёмная карточка статьи (вариант B макета spisok-statej.html): картинка сверху, рубрика, дата и время
 * чтения, заголовок, анонс, «Читать статью». compact — для «Похожих статей»: без анонса и даты.
 */
export function ArticleCard({ article, compact = false }: { article: ArticleListItem; compact?: boolean }) {
  const image = article.image ? getImageUrl(article.image) : ''
  const minutes = `${article.readingMinutes} мин`
  const date = compact ? '' : cardDate(article.publishedAt)
  return (
    <article className="h-full">
      <Link
        to={`/stati/${encodeURIComponent(article.slug)}`}
        className="group flex h-full flex-col overflow-hidden rounded-[10px] border border-[#151D25] bg-[#151D25] text-white transition-colors hover:border-[hsl(var(--accent))] hover:bg-[#1e2d37]"
      >
        <div className={`${compact ? 'h-32' : 'h-44'} shrink-0 overflow-hidden bg-[#2a333c]`}>
          {image && (
            <UploadImg
              src={image}
              sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-start justify-between gap-3 text-[11px] uppercase leading-snug tracking-[0.06em] text-[#aeb8c2]">
            <span>{article.category}</span>
            <span className="whitespace-nowrap">{date ? `${date} · ${minutes}` : minutes}</span>
          </div>
          <h3 className={`${compact ? 'text-base' : 'text-lg'} mb-3 font-bold leading-snug text-white`}>{article.h1}</h3>
          {!compact && <p className="mb-5 text-sm leading-relaxed text-[#c7cfd6]">{article.description}</p>}
          <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--accent))]">
            Читать статью
            <FiArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  )
}
