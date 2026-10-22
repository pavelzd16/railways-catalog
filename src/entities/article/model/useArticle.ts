import { usePageData } from '@/shared/seo/page-context'

export function useArticle(slug: string | undefined) {
  const data = usePageData()
  return {
    article: data.article?.slug === slug ? data.article : null,
    isLoading: data.status === 0,
    notFound: data.status === 404,
    error: data.status >= 500 ? 'Не удалось загрузить статью. Повторите попытку позже.' : null,
  }
}
