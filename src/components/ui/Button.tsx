import { type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
}

const variants = {
  primary: 'bg-saffron text-ink hover:bg-saffron-dim',
  secondary: 'bg-ink text-paper hover:bg-ink-soft',
  ghost: 'bg-transparent text-ink hover:bg-paper-dim',
}

export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`rounded-full px-6 py-2.5 font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed
        flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  )
}
