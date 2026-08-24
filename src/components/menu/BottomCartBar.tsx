import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

export default function BottomCartBar({ onOpenCart }: { onOpenCart: () => void }) {
  const { itemCount, subtotal } = useCart()

  return (
    <motion.button
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      onClick={onOpenCart}
      className="fixed left-4 right-4 max-w-2xl mx-auto z-30 rounded-full bg-ink text-paper shadow-2xl px-5 py-3.5 flex items-center justify-between active:scale-[0.98] transition-transform"
      style={{ bottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}
    >
      <span className="flex items-center gap-2 font-medium">
        <span className="relative">
          <ShoppingBag size={18} />
          <span className="absolute -top-2 -right-2 bg-saffron text-ink text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {itemCount}
          </span>
        </span>
        عرض السلة
      </span>
      <span className="font-display font-semibold">{subtotal} ج.م</span>
    </motion.button>
  )
}
