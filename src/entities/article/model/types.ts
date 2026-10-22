// Формы ответов API статей (railways-catalog-api, src/article/rdo) — поля те же, что на сервере.
export interface ArticleListItem {
  id: string
  slug: string
  title: string
  description: string
  h1: string
  category: string
  image?: string | null
  published: boolean
  publishedAt?: string | null
  updatedAt: string
  /** Время чтения считает сервер; сайт его не пересчитывает. */
  readingMinutes: number
}

export interface ArticleSpec {
  label: string
  value: string
  unit?: string | null
}

/** Товар каталога, упомянутый в статье (по артикулу в метке). Удалённые из каталога сервер не отдаёт. */
export interface ArticleProduct {
  id: string
  sku: string
  slug: string
  title: string
  price?: number | null
  stock: number
  condition: string
  images: string[]
  categorySlug: string
  subcategorySlug?: string | null
  categoryName: string
  subcategoryName?: string | null
  specs: ArticleSpec[]
}

export interface ArticleService {
  slug: string
  title: string
  description: string
  image?: string | null
}

export interface ArticleFull extends ArticleListItem {
  body: string
  /** Для предпросмотра черновика в админке; публично приходят только опубликованные. */
  published: boolean
  products: ArticleProduct[]
  services: ArticleService[]
  related: ArticleListItem[]
}

export interface CreateArticleDto {
  slug: string
  title: string
  description: string
  h1: string
  category: string
  body: string
  published?: boolean
  publishedAt?: string
}

export type UpdateArticleDto = Partial<CreateArticleDto>
