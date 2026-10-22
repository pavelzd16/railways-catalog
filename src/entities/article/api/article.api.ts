import { baseApi, type PaginatedResponse, type PaginationParams } from '@/shared/api'
import type { ArticleFull, ArticleListItem, CreateArticleDto, UpdateArticleDto } from '../model/types'

// Картинки уходят отдельными multipart-запросами, тексты — JSON (multipart портит переводы строк).
function imageForm(image: File): FormData {
  const form = new FormData()
  form.append('image', image)
  return form
}

// Создание, правка и обложка возвращают элемент списка (без текста), а не статью целиком.
export const articleApi = {
  /** Публичный список: только опубликованные. */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<ArticleListItem>> {
    const { data } = await baseApi.get<PaginatedResponse<ArticleListItem>>('/article', { params })
    return data
  },

  async getBySlug(slug: string): Promise<ArticleFull> {
    const { data } = await baseApi.get<ArticleFull>(`/article/${encodeURIComponent(slug)}`)
    return data
  },

  /** Админка: все статьи, включая черновики. */
  async adminList(params?: PaginationParams): Promise<PaginatedResponse<ArticleListItem>> {
    const { data } = await baseApi.get<PaginatedResponse<ArticleListItem>>('/article/admin/list', { params })
    return data
  },

  async adminGet(id: string): Promise<ArticleFull> {
    const { data } = await baseApi.get<ArticleFull>(`/article/admin/${id}`)
    return data
  },

  async create(dto: CreateArticleDto): Promise<ArticleListItem> {
    const { data } = await baseApi.post<ArticleListItem>('/article', dto)
    return data
  },

  async update(id: string, dto: UpdateArticleDto): Promise<ArticleListItem> {
    const { data } = await baseApi.put<ArticleListItem>(`/article/${id}`, dto)
    return data
  },

  async remove(id: string): Promise<void> {
    await baseApi.delete(`/article/${id}`)
  },

  /** Обложка статьи. */
  async uploadCover(id: string, image: File): Promise<ArticleListItem> {
    const { data } = await baseApi.put<ArticleListItem>(`/article/${id}/image`, imageForm(image), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  /** Картинка в тело статьи: возвращает путь для вставки. */
  async uploadImage(image: File): Promise<{ path: string }> {
    const { data } = await baseApi.post<{ path: string }>('/article/upload', imageForm(image), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}
