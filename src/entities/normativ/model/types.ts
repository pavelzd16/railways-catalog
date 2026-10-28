// Формы ответов API раздела «ГОСТы и нормативы» (railways-catalog-api, src/normativ) — поля те же, что на сервере.
import type { ArticleProduct, ArticleService } from '../../article/model/types.ts'

export type NormKind = 'gost' | 'gost-r' | 'ost' | 'sp' | 'tu' | 'rzd' | 'law' | 'order' | 'album' | 'series' | 'other'
export type NormStatus = 'active' | 'replaced' | 'cancelled'
export type NormWeight = 'main' | 'other'

/** Строка списка: без текста выжимки. */
export interface NormListItem {
  slug: string
  code: string
  name: string
  kind: NormKind
  status: NormStatus
  replacedBy: string | null
  /** Дата введения `YYYY-MM-DD` (строка, без часового пояса). */
  introducedAt: string | null
  scope: string
  /** Slug-и разделов каталога, к которым относится документ. */
  sections: string[]
  hasFile: boolean
  /** Число страниц PDF; null — не известно. */
  pageCount?: number | null
  updatedAt: string
}

/** Товар в выжимке документа: как в статьях, плюс ГОСТ. */
export interface NormProduct extends ArticleProduct {
  gost?: string | null
}

export interface NormDocumentFull {
  id: string
  slug: string
  code: string
  name: string
  kind: NormKind
  status: NormStatus
  replacedBy: string | null
  introducedAt: string | null
  scope: string
  sections: string[]
  sourceUrl: string | null
  sourceName: string | null
  /** `/uploads/<uuid>.pdf`; null — «Документ по запросу». */
  file: string | null
  /** Читаемое имя для скачивания: `ГОСТ 4121-96.pdf`. */
  fileName: string | null
  /** Размер файла в байтах. */
  fileSize: number | null
  /** Число страниц PDF; null — не известно. */
  pageCount?: number | null
  /** Картинки первых страниц PDF по порядку (`/uploads/<uuid>.webp`): лист документа на странице. */
  previews?: string[]
  title: string
  description: string
  h1: string
  body: string
  weight: NormWeight
  published: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  products: NormProduct[]
  /** Все наши товары, у которых документ указан в ГОСТе (до 24, без дублей с products). */
  relatedProducts: NormProduct[]
  services: ArticleService[]
  replacedByDoc: { slug: string; code: string } | null
  /** Опубликованные документы, которые этот заменил (старые версии). Старый API поля не отдаёт. */
  replaces?: { code: string; slug: string }[]
}

/** Документ справочника, найденный в строке ГОСТ товара (поле normDocs ответа GET /api/product/:slug). */
export interface ProductNormDoc {
  code: string
  slug: string
}
