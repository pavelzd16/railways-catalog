import { usePageData } from '@/shared/seo/page-context'

export function useNormativ(slug: string | undefined) {
  const data = usePageData()
  return {
    document: data.normativ?.slug === slug ? data.normativ : null,
    isLoading: data.status === 0,
    notFound: data.status === 404,
    error: data.status >= 500 ? 'Не удалось загрузить документ. Повторите попытку позже.' : null,
  }
}
