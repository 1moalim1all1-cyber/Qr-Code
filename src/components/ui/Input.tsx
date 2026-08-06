import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, id, ...rest }, ref) => {
  const inputId = id ?? label
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={inputId}
        ref={ref}
        className={`rounded-xl border bg-white px-4 py-2.5 text-ink placeholder:text-stone-light
          focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron
          ${error ? 'border-sumac' : 'border-stone-light/60'}`}
        {...rest}
      />
      {error && <span className="text-sm text-sumac">{error}</span>}
    </div>
  )
})
Input.displayName = 'Input'

export default Input
