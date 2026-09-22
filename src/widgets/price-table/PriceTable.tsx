import { Badge } from '@/shared/ui/Badge'
import { PriceNote } from '@/shared/ui/PriceNote'
import { formatPrice, getSpecValue } from '@/shared/lib/catalog-helpers'
import { useCatalog } from '@/pages/catalog/model/use-catalog'

function getStockBadge(stock: number) {
  if (stock > 10) return <Badge variant="default">В наличии</Badge>
  if (stock > 0) return <Badge variant="secondary">Мало</Badge>
  return <Badge variant="outline">Под заказ</Badge>
}

export function PriceTable() {
  const { products, loading } = useCatalog()
  const visibleProducts = products.slice(0, 6)

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Популярные позиции</h2>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-lg border border-border bg-card animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && visibleProducts.length > 0 && (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold text-muted-foreground">Наименование</th>
                    <th className="text-left py-4 px-4 font-semibold text-muted-foreground">ГОСТ</th>
                    <th className="text-left py-4 px-4 font-semibold text-muted-foreground">Масса</th>
                    <th className="text-left py-4 px-4 font-semibold text-muted-foreground">Цена</th>
                    <th className="text-left py-4 px-4 font-semibold text-muted-foreground">Наличие</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProducts.map((product) => (
                    <tr key={product.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="py-4 px-4 font-medium">{product.title}</td>
                      <td className="py-4 px-4 text-muted-foreground">{product.gost || '—'}</td>
                      <td className="py-4 px-4 text-muted-foreground">{getSpecValue(product, 'weight') || '—'}</td>
                      <td className="py-4 px-4">
                        {!product.price ? (
                          <span className="font-semibold text-primary">По запросу</span>
                        ) : (
                          <span className="font-semibold text-primary">
                            от {formatPrice(product.price)} ₽
                          </span>
                        )}
                        <PriceNote className="mt-0.5" />
                      </td>
                      <td className="py-4 px-4">{getStockBadge(product.stock)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {visibleProducts.map((product) => (
                <div key={product.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 line-clamp-2">{product.title}</h3>
                      {product.gost && (
                        <p className="text-sm text-muted-foreground">ГОСТ: {product.gost}</p>
                      )}
                    </div>
                    {getStockBadge(product.stock)}
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">
                      Масса: {getSpecValue(product, 'weight') || '—'}
                    </span>
                    <div className="text-right">
                      {!product.price ? (
                        <span className="font-semibold text-primary">По запросу</span>
                      ) : (
                        <span className="font-semibold text-primary text-lg">
                          от {formatPrice(product.price)} ₽
                        </span>
                      )}
                      <PriceNote className="mt-0.5 ml-auto" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && visibleProducts.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Продукты не найдены</p>
        )}
      </div>
    </section>
  )
}