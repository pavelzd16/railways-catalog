import { FiShoppingCart } from 'react-icons/fi'
import { useCart } from '@/entities/cart/model/use-cart'
import type { Product } from '@/entities/product/model/types'

interface AddToCartButtonProps {
  product: Product
  variant?: 'outline' | 'accent'
  /** Подпись рядом со значком (в карточках статей — «В корзину»); без неё — квадратная кнопка-значок. */
  label?: string
}

export function AddToCartButton({
  product,
  variant = 'outline',
  label,
}: AddToCartButtonProps) {
  const { addToCart } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      aria-label={`Добавить в корзину: ${product.title}`}
      className={`flex shrink-0 items-center justify-center gap-2 rounded-lg border transition-colors ${variant === 'accent' ? 'border-accent bg-accent text-accent-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground' : 'border-border bg-white text-foreground hover:border-primary hover:text-primary'} ${label ? 'h-10 px-4 text-sm font-bold' : variant === 'accent' ? 'h-11 w-11' : 'h-12 w-12'}`}
    >
      <FiShoppingCart className="h-5 w-5" />
      {label}
    </button>
  )
}
