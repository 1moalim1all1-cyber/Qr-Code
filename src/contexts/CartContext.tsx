import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import type { OrderItem, OrderItemExtra } from '@/types/database'

interface CartLine extends OrderItem {
  lineId: string // unique per (product + extras + notes) combination
}

interface CartContextValue {
  lines: CartLine[]
  addItem: (item: { productId: string; name: string; price: number; extras: OrderItemExtra[]; notes?: string }, quantity: number) => void
  updateQuantity: (lineId: string, quantity: number) => void
  removeItem: (lineId: string) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])

  function addItem(
    item: { productId: string; name: string; price: number; extras: OrderItemExtra[]; notes?: string },
    quantity: number
  ) {
    const extrasKey = item.extras.map((e) => e.name).sort().join('|')
    const lineId = `${item.productId}::${extrasKey}::${item.notes ?? ''}`
    setLines((prev) => {
      const existing = prev.find((l) => l.lineId === lineId)
      if (existing) {
        return prev.map((l) => (l.lineId === lineId ? { ...l, quantity: l.quantity + quantity } : l))
      }
      return [
        ...prev,
        { lineId, product_id: item.productId, name: item.name, price: item.price, quantity, extras: item.extras, notes: item.notes },
      ]
    })
  }

  function updateQuantity(lineId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(lineId)
      return
    }
    setLines((prev) => prev.map((l) => (l.lineId === lineId ? { ...l, quantity } : l)))
  }

  function removeItem(lineId: string) {
    setLines((prev) => prev.filter((l) => l.lineId !== lineId))
  }

  function clearCart() {
    setLines([])
  }

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines])
  const subtotal = useMemo(
    () =>
      lines.reduce((sum, l) => {
        const extrasTotal = l.extras.reduce((s, e) => s + e.price, 0)
        return sum + (l.price + extrasTotal) * l.quantity
      }, 0),
    [lines]
  )

  return (
    <CartContext.Provider value={{ lines, addItem, updateQuantity, removeItem, clearCart, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
