import { Header } from './header/ui/Header'
import { Footer } from './footer/Footer'

// bottomBar — закреплённая внизу экрана панель страницы; идёт после подвала, чтобы её отступ
// приходился на самый низ страницы.
export function Layout({ children, bottomBar }: { children: React.ReactNode; bottomBar?: React.ReactNode }) {
  return (
    <div className="site-shell flex min-h-dvh flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      {bottomBar}
    </div>
  )
}
