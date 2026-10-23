import { Link } from 'react-router'
import { gostSegments } from '../lib/gost-links'
import type { ProductNormDoc } from '../model/types'

/** Строка ГОСТ товара: номера, которые есть в справочнике, — ссылки на страницу документа, остальное — текстом. */
export function GostLinks({ gost, normDocs }: { gost: string; normDocs?: ProductNormDoc[] | null }) {
  return (
    <>
      {gostSegments(gost, normDocs).map((segment, index) =>
        segment.slug ? (
          <Link
            key={index}
            to={`/normativ/${encodeURIComponent(segment.slug)}`}
            className="underline decoration-[hsl(var(--primary))] underline-offset-4 transition-colors hover:text-[hsl(var(--primary))]"
          >
            {segment.text}
          </Link>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </>
  )
}
