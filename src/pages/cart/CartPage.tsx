import { productPath } from '@/shared/seo/route-data'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { FiArrowLeft, FiTrash2, FiMinus, FiPlus, FiShoppingCart, FiCheck } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useCart } from '@/entities/cart/model/use-cart'
import { Layout } from '@/widgets/Layout'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { FormField } from '@/shared/ui/FormField'
import { PhoneInput } from '@/shared/ui/PhoneInput'
import { Checkbox } from '@/shared/ui/Checkbox'
import { cn } from '@/shared/lib/cn'
import type { CartItem } from '@/entities/cart/model/types'
import type { CreateOrderDto } from '@/entities/order/model/types'
import { getImageUrl } from '@/shared/lib/product-helpers'
import { UploadImg } from '@/shared/ui/UploadImg'
import { orderApi } from '@/entities/order/api/order.api'
import { FORM_GOAL, metrikaReachGoal } from '@/shared/analytics/metrika'

export function CartPage() {
  const { items, totalItems, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart()
  // Товары «по запросу» в сумму не входят: без этого корзина из таких товаров показывает «0 ₽».
  const hasPriceOnRequest = items.some((item) => !item.product.price)
  const totalLabel = !hasPriceOnRequest
    ? `${totalPrice.toLocaleString('ru-RU')} ₽`
    : totalPrice > 0
      ? `${totalPrice.toLocaleString('ru-RU')} ₽ + по запросу`
      : 'По запросу'
  const priceOnRequestNote = hasPriceOnRequest && (
    <p className="text-xs text-muted-foreground">
      Стоимость позиций «по запросу» менеджер сообщит после оформления заказа.
    </p>
  )
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'form' | 'success'>('cart')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderNumber, setOrderNumber] = useState<string>('')
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    comment: '',
    policyAccepted: false,
  })

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      comment: '',
      policyAccepted: false,
    })
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.policyAccepted) {
      toast.error('Необходимо согласие с политикой конфиденциальности')
      return
    }

    if (items.length === 0) {
      toast.error('Корзина пуста')
      return
    }

    setIsSubmitting(true)

    try {
      const dto: CreateOrderDto = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        policyAccepted: formData.policyAccepted,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      }

      if (formData.email.trim()) {
        dto.email = formData.email.trim()
      }

      if (formData.address.trim()) {
        dto.address = formData.address.trim()
      }

      if (formData.comment.trim()) {
        dto.comment = formData.comment.trim()
      }

      const order = await orderApi.create(dto)

      metrikaReachGoal(FORM_GOAL)
      toast.success(`Заказ ${order.orderNumber} успешно оформлен!`)
      setOrderNumber(order.orderNumber)
      clearCart()
      resetForm()
      setCheckoutStep('success')
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Ошибка при оформлении заказа. Попробуйте позже'

      const errors = Array.isArray(message) ? message : [message]
      errors.forEach((error: string) => {
        toast.error(error)
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToCatalog = () => {
    navigate('/catalog')
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Главная
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">Корзина</span>
          </nav>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <FiArrowLeft className="h-4 w-4" />
              Назад
            </button>
          </div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FiShoppingCart className="h-8 w-8 text-primary" />
            Корзина
            {totalItems > 0 && (
              <span className="text-lg font-medium text-muted-foreground">
                ({totalItems} {totalItems === 1 ? 'товар' : totalItems < 5 ? 'товара' : 'товаров'})
              </span>
            )}
          </h1>
        </div>

        {items.length === 0 && checkoutStep === 'cart' ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-6 animate-in fade-in zoom-in duration-300">
              <FiShoppingCart className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Корзина пуста</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Добавьте товары из каталога, чтобы оформить заказ
            </p>
            <Button onClick={handleBackToCatalog} className="gap-2">
              <FiArrowLeft className="h-4 w-4" />
              Перейти в каталог
            </Button>
          </div>
        ) : checkoutStep === 'success' ? (
          <div className="flex flex-col items-center justify-center py-16 text-center max-w-2xl mx-auto">
            <div className="w-32 h-32 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-6 animate-in fade-in zoom-in duration-300">
              <FiCheck className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Заказ успешно оформлен!</h2>
            {orderNumber && (
              <p className="text-sm text-muted-foreground mb-2">
                Номер заказа: <span className="font-semibold text-foreground">{orderNumber}</span>
              </p>
            )}
            <p className="text-muted-foreground mb-6 max-w-md">
              Наш менеджер свяжется с вами в ближайшее время для уточнения деталей заказа.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBackToCatalog}>
                Продолжить покупки
              </Button>
              <Button onClick={() => setCheckoutStep('cart')}>
                Вернуться к корзине
              </Button>
            </div>
          </div>
        ) : checkoutStep === 'form' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Контактные данные</h2>

                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  <FormField label="Имя *" error="">
                    <Input
                      placeholder="Иван Иванов"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField label="Телефон *" error="">
                    <PhoneInput
                      value={formData.phone}
                      onChange={(value) => setFormData({ ...formData, phone: value })}
                      required
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField label="Email" error="">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField label="Адрес доставки" error="">
                    <Input
                      placeholder="Город, улица, дом, офис"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField label="Комментарий к заказу" error="">
                    <textarea
                      className="w-full rounded-lg border border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors h-24 p-3 resize-none"
                      placeholder="Дополнительная информация..."
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={formData.policyAccepted}
                      onChange={(e) => setFormData({ ...formData, policyAccepted: e.target.checked })}
                      id="cart-policy"
                      required
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor="cart-policy"
                      className="text-xs text-muted-foreground leading-tight cursor-pointer"
                    >
                      Я согласен с{' '}
                      <a
                        href="/privacy"
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        политикой конфиденциальности
                      </a>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setCheckoutStep('cart')}
                      disabled={isSubmitting}
                    >
                      <FiArrowLeft className="h-4 w-4 mr-2" />
                      Назад
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>Оформление...</>
                      ) : (
                        <>
                          <FiCheck className="h-4 w-4 mr-2" />
                          Подтвердить заказ
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Ваш заказ</h3>

                <div className="space-y-3 mb-4 pb-4 border-b border-border">
                  {items.map((item: CartItem) => (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                        {item.product.images[0] ? (
                          <UploadImg
                            src={getImageUrl(item.product.images[0])}
                            sizes="64px"
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <FiShoppingCart className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.product.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} шт × {!item.product.price ? 'По запросу' : `${item.product.price.toLocaleString('ru-RU')} ₽`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {!item.product.price ? 'По запросу' : `${(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Товары ({totalItems})</span>
                    <span className="font-medium">{totalLabel}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-foreground">Итого</span>
                    <span className="text-primary">{totalLabel}</span>
                  </div>
                  {priceOnRequestNote}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item: CartItem) => (
                  <div
                    key={item.product.id}
                    className={cn(
                      'flex gap-4 p-4 border border-border rounded-xl',
                      'bg-card hover:border-primary/50 transition-all duration-200',
                      'animate-in slide-in-from-bottom-2'
                    )}
                  >
                    <div className="w-24 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                      {item.product.images[0] ? (
                        <UploadImg
                          src={getImageUrl(item.product.images[0])}
                          sizes="96px"
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <FiShoppingCart className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={productPath(item.product)}
                        className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.product.title}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        Арт. {item.product.sku}
                      </p>

                      {!item.product.price && (
                        <p className="text-xs text-primary font-medium mt-1">
                          Цена по запросу
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
                          aria-label="Уменьшить количество"
                        >
                          <FiMinus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
                          aria-label="Увеличить количество"
                        >
                          <FiPlus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                        aria-label="Удалить товар"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          {!item.product.price ? 'По запросу' : `${(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽`}
                        </p>
                        {item.product.price && (
                          <p className="text-xs text-muted-foreground">
                            {item.product.price.toLocaleString('ru-RU')} ₽/шт
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {items.length > 0 && (
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="gap-2 text-destructive hover:text-destructive hover:border-destructive"
                  >
                    <FiTrash2 className="h-4 w-4" />
                    Очистить корзину
                  </Button>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Итого</h3>

                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Количество товаров</span>
                    <span className="font-medium">{totalItems} шт</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">Стоимость товаров</span>
                    <span className="font-semibold">{totalLabel}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between gap-4 text-lg font-bold">
                    <span className="text-foreground">Общая сумма</span>
                    <span className="text-right text-primary">{totalLabel}</span>
                  </div>
                  {priceOnRequestNote}
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={() => setCheckoutStep('form')}
                  >
                    <FiCheck className="h-4 w-4" />
                    Оформить заказ
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleBackToCatalog}
                  >
                    Продолжить покупки
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Нажимая «Оформить заказ», вы соглашаетесь с условиями обработки персональных данных
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}