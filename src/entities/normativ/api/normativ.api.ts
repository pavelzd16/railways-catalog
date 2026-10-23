import { baseApi } from '@/shared/api'
import type { NormDocumentFull, NormListItem } from '../model/types'

export const normativApi = {
  /** Публичный список: все опубликованные документы, без текста выжимки. */
  async getAll(): Promise<{ items: NormListItem[] }> {
    const { data } = await baseApi.get<{ items: NormListItem[] }>('/normativ')
    return data
  },

  async getBySlug(slug: string): Promise<NormDocumentFull> {
    const { data } = await baseApi.get<NormDocumentFull>(`/normativ/${encodeURIComponent(slug)}`)
    return data
  },
}
