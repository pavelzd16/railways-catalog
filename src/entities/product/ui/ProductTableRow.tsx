import { productPath } from '@/shared/seo/route-data'
import { Link } from 'react-router'
import { formatPrice, getSpecValue } from '@/shared/lib/catalog-helpers'
import type { Product } from '../model/types'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { PriceNote } from '@/shared/ui/PriceNote'
import { getImageUrl } from '@/shared/lib/product-helpers'
import { MdNoPhotography, MdEdit, MdDelete } from 'react-icons/md'

interface ProductTableRowProps {
  product: Product
  onEdit?: (product: Product) => void
  onDelete?: (id: string) => void
}

export function ProductTableRow({ product, onEdit, onDelete }: ProductTableRowProps) {
  const weight = getSpecValue(product, 'weight')
  
  const conditionLabels: Record<Product['condition'], string> = {
    new: 'Новый',
    used: 'Б/У',
    service: 'Сервисный',
  }

  const conditionVariants: Record<Product['condition'], 'default' | 'secondary' | 'outline'> = {
    new: 'default',
    used: 'secondary',
    service: 'outline',
  }

  const firstImage = product.images[0]
  const imageUrl = firstImage ? getImageUrl(firstImage) : null

  return (
    <>
      <tr className="group border-b border-border/50 hover:bg-muted/30 transition-colors max-md:hidden">
        <td className="py-4 px-4">
          <Link
            to={productPath(product)}
            className="flex items-center gap-3"
          >
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <MdNoPhotography className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
          </Link>
        </td>

        <td className="py-4 px-4">
          <Link
            to={productPath(product)}
            className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
          >
            {product.title}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">{product.sku}</p>
        </td>

        <td className="py-4 px-4">
          <span className="text-sm text-muted-foreground">{product.gost || '—'}</span>
        </td>

        <td className="py-4 px-4">
          <Badge variant={conditionVariants[product.condition]}>
            {conditionLabels[product.condition]}
          </Badge>
        </td>

        <td className="py-4 px-4">
          <span className="text-sm text-muted-foreground">{weight}</span>
        </td>

        <td className="py-4 px-4">
          <span className="text-sm text-muted-foreground">{product.stock} шт.</span>
        </td>

        <td className="py-4 px-4">
          {!product.price ? (
            <span className="text-sm font-semibold text-primary">По запросу</span>
          ) : (
            <span className="text-base font-bold text-primary">
              {formatPrice(product.price)} ₽
            </span>
          )}
          <PriceNote className="mt-0.5" />
        </td>

        <td className="py-4 px-4">
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Редактировать ${product.title}`}
                onClick={() => onEdit(product)}
                className="h-8 px-2"
              >
                <MdEdit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Удалить ${product.title}`}
                onClick={() => onDelete(product.id)}
                className="h-8 px-2 text-destructive hover:text-destructive"
              >
                <MdDelete className="h-4 w-4" />
              </Button>
            )}
          </div>
        </td>
      </tr>

      <div className="md:hidden rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex gap-3">
          <Link
            to={productPath(product)}
            className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted flex items-center justify-center"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.title}
                className="h-full w-full object-contain"
              />
            ) : (
              <MdNoPhotography className="h-8 w-8 text-muted-foreground" />
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <Link
              to={productPath(product)}
              className="block font-medium leading-5 text-foreground hover:text-primary transition-colors line-clamp-2"
            >
              {product.title}
            </Link>
            <p className="text-xs text-muted-foreground mt-1">{product.sku}</p>
            
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={conditionVariants[product.condition]}>
                {conditionLabels[product.condition]}
              </Badge>
              <span className="text-xs text-muted-foreground">{product.stock} шт.</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">{product.gost || '—'}</p>
            <p className="text-xs text-muted-foreground">Масса: {weight}</p>
          </div>
          
          <div className="text-right">
            {!product.price ? (
              <span className="text-sm font-semibold text-primary">По запросу</span>
            ) : (
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price)} ₽
              </span>
            )}
            <PriceNote className="mt-0.5 ml-auto" />
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-2">
            {onEdit && (
              <Button
                variant="secondary"
                size="sm"
                aria-label={`Редактировать ${product.title}`}
                onClick={() => onEdit(product)}
                className="flex-1"
              >
                Редактировать
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                aria-label={`Удалить ${product.title}`}
                onClick={() => onDelete(product.id)}
                className="text-destructive hover:text-destructive"
              >
                Удалить
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  )
}