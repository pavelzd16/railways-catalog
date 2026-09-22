import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router'
import { categoryApi } from '@/entities/category/api/category.api'
import { productApi } from '@/entities/product/api/product.api'
import { serviceApi } from '@/entities/service/api/service.api'
import { detailRoute, productPath, type PageData } from './route-data'
import { movedProductSlug } from './product-slug-moves'
import { getMetadata } from './metadata'
import { applyMetadata } from './apply-metadata'
import { PageDataContext, CategoriesContext } from './page-context'

export function PageDataProvider({ initial, children }: { initial: PageData; children: ReactNode }) {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const navigationType = useNavigationType()
  const previousPath = useRef(pathname)
  useEffect(() => {
    if (previousPath.current !== pathname && navigationType !== 'POP' && !window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    previousPath.current = pathname
  }, [pathname, navigationType])
  const url = pathname + search
  const [loaded, setLoaded] = useState(initial)
  const [categories, setCategories] = useState(initial.categories ?? [])
  const [categoriesLoading, setCategoriesLoading] = useState(!initial.categories)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true)
    try { setCategories((await categoryApi.getAll({ limit: 100 })).items); setCategoriesError(null) }
    catch { setCategoriesError('Не удалось загрузить категории') }
    finally { setCategoriesLoading(false) }
  }, [])
  useEffect(() => {
    if (initial.categories) return
    let cancelled = false
    categoryApi.getAll({ limit: 100 }).then(response => { if (!cancelled) setCategories(response.items) }).catch(() => { if (!cancelled) setCategoriesError('Не удалось загрузить категории') }).finally(() => { if (!cancelled) setCategoriesLoading(false) })
    return () => { cancelled = true }
  }, [initial.categories])
  const data = useMemo<PageData>(() => ({ ...(loaded.url === url ? loaded : { url, siteUrl: initial.siteUrl, status: detailRoute(pathname) ? 0 : 200, ssr: false }), categories }), [loaded, url, pathname, initial.siteUrl, categories])

  useEffect(() => {
    if (loaded.url === url) return
    const route = detailRoute(pathname)
    if (!route) return
    let cancelled = false
    const moved = route.kind === 'product' ? movedProductSlug(route.slug) : undefined
    const request = route.kind === 'product'
      ? productApi.getBySlug(route.slug).catch((error) => { if (moved && error?.response?.status === 404) return productApi.getBySlug(moved); throw error })
      : serviceApi.getBySlug(route.slug)
    request.then((value) => {
      if (cancelled) return
      const next = { url, siteUrl: initial.siteUrl, ssr: false, status: 200, [route.kind]: value }
      setLoaded(next)
      const canonical = route.kind === 'product' ? productPath(value as NonNullable<PageData['product']>) : `/services/${encodeURIComponent(value.slug)}`
      if (pathname !== canonical) navigate(canonical + search, { replace: true })
    }).catch((error) => {
      if (!cancelled) setLoaded({ url, siteUrl: initial.siteUrl, ssr: false, status: error?.response?.status === 404 ? 404 : 503 })
    })
    return () => { cancelled = true }
  }, [url, pathname, search, loaded.url, initial.siteUrl, navigate])

  useEffect(() => { applyMetadata(getMetadata(url, data)) }, [url, data])
  return <PageDataContext.Provider value={data}><CategoriesContext.Provider value={{ categories, isLoading: categoriesLoading, error: categoriesError, loadCategories }}>{children}</CategoriesContext.Provider></PageDataContext.Provider>
}
