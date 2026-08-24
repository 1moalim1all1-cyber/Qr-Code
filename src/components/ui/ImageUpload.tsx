import { useRef, useState } from 'react'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import { uploadImage } from '@/lib/cloudinary'

interface ImageUploadProps {
  label: string
  value: string | null
  onChange: (url: string | null) => void
  folder?: string
  aspect?: 'square' | 'wide'
  fit?: 'cover' | 'contain'
}

export default function ImageUpload({ label, value, onChange, folder, aspect = 'square', fit = 'cover' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)
    setUploading(true)
    try {
      const result = await uploadImage(file, folder)
      onChange(result.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل رفع الصورة')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink">{label}</label>
      <div
        className={`relative rounded-xl border border-dashed border-stone-light/60 bg-paper-dim overflow-hidden flex items-center justify-center cursor-pointer hover:border-saffron/50 transition-colors ${
          aspect === 'square' ? 'w-28 h-28' : 'w-full h-36'
        }`}
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <>
            <img
              src={value}
              alt={label}
              className={`w-full h-full ${fit === 'contain' ? 'object-contain p-1.5 bg-white' : 'object-cover'}`}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange(null)
              }}
              className="absolute top-1.5 left-1.5 bg-ink/70 text-paper rounded-full p-1 hover:bg-ink"
              aria-label="حذف الصورة"
            >
              <X size={13} />
            </button>
          </>
        ) : uploading ? (
          <Loader2 size={22} className="text-stone animate-spin" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-stone-light">
            <ImagePlus size={22} />
            <span className="text-xs">ارفع صورة</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      {error && <span className="text-sm text-sumac">{error}</span>}
    </div>
  )
}
