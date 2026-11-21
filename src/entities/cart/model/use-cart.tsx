import {createContext, useContext, useState, useEffect, type ReactNode} from 'react'
import type {Product} from '../../product/model/types'
import type {CartItem, CartState} from '../model/types'
import {productApi} from '../../product/api/product.api'
import {isRailProduct} from '@/shared/lib/price-convert'

interface CartContextType extends CartState {
    addToCart: (product: Product, quantity?: number) => void
    removeFromCart: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'cart_items'

function calculateTotals(items: CartItem[]): Pick<CartState, 'totalItems' | 'totalPrice'> {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => sum + ((item.product.price ?? 0) * item.quantity), 0)
    return {totalItems, totalPrice}
}

export function CartProvider({children}: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [storageReady, setStorageReady] = useState(false)
    useEffect(() => {
        let active = true
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
            if (Array.isArray(stored)) {
                const valid: CartItem[] = stored.filter(item => item?.product?.id && Number.isFinite(item.quantity) && item.quantity > 0)
                setItems(valid)
                for (const {product} of valid) {
                    if (!isRailProduct(product) || !product.slug) continue
                    void productApi.getBySlug(product.slug).then(latest => {
                        if (!active || latest.id !== product.id) return
                        setItems(previous => previous.map(item => item.product === product
                            ? {...item, product: {...product, price: latest.price, specs: latest.specs}}
                            : item))
                    }).catch(() => { /* A saved cart remains usable if the catalog is unavailable. */ })
                }
            }
        } catch { /* Storage can be unavailable in private browsing. */ }
        setStorageReady(true)
        return () => { active = false }
    }, [])
    useEffect(() => {
        if (!storageReady) return
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* Keep the cart usable without storage. */ }
    }, [items, storageReady])

    const {totalItems, totalPrice} = calculateTotals(items)

    const addToCart = (product: Product, quantity: number = 1) => {
        setItems(prev => {
            const existingIndex = prev.findIndex(item => item.product.id === product.id)
            if (existingIndex >= 0) {
                const updated = [...prev]
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    product,
                    quantity: updated[existingIndex].quantity + quantity
                }
                return updated
            }
            return [...prev, {product, quantity}]
        })
    }

    const removeFromCart = (productId: string) => {
        setItems(prev => prev.filter(item => item.product.id !== productId))
    }

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId)
            return
        }
        setItems(prev =>
            prev.map(item =>
                item.product.id === productId ? {...item, quantity} : item
            )
        )
    }

    const clearCart = () => {
        setItems([])
    }

    return (
        <CartContext.Provider value={{
            items,
            totalItems,
            totalPrice,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
