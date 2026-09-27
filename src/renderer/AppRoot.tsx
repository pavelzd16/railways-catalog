import { StrictMode } from 'react'
import { MotionConfig } from 'framer-motion'
import { BrowserRouter, StaticRouter } from 'react-router'
import { CartProvider } from '@/entities/cart/model/use-cart'
import { PageDataProvider } from '@/shared/seo/PageDataProvider'
import type { PageData } from '@/shared/seo/route-data'
import { MetrikaTracker } from '@/shared/analytics/MetrikaTracker'
import App from '@/App'
import '@/index.css'

export function AppRoot({ data, server = false }: { data: PageData; server?: boolean }) {
  const content = <PageDataProvider initial={data}><MotionConfig reducedMotion="user"><CartProvider><App /></CartProvider></MotionConfig></PageDataProvider>
  return <StrictMode>{server ? <StaticRouter location={data.url}><MetrikaTracker />{content}</StaticRouter> : <BrowserRouter><MetrikaTracker />{content}</BrowserRouter>}</StrictMode>
}
