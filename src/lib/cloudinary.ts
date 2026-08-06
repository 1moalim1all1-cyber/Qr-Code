// Client-side image uploads via Cloudinary's unsigned upload API — same
// approach used in Al-Amal for Modern Paints. No backend/API secret needed:
// an unsigned upload preset (configured in the Cloudinary dashboard) is
// enough, and Cloudinary's free tier covers this comfortably.

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  // eslint-disable-next-line no-console
  console.warn(
    'Cloudinary env vars are missing. Copy .env.example to .env and fill in VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET.'
  )
}

export interface CloudinaryUploadResult {
  url: string
  publicId: string
  width: number
  height: number
}

export async function uploadImage(file: File, folder?: string): Promise<CloudinaryUploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  if (folder) formData.append('folder', folder)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(errorBody?.error?.message ?? 'فشل رفع الصورة، حاول تاني')
  }

  const data = await response.json()
  return {
    url: data.secure_url as string,
    publicId: data.public_id as string,
    width: data.width as number,
    height: data.height as number,
  }
}
