// Generates a URL-friendly slug from Arabic or Latin text, e.g. for
// restaurant public menu URLs: smartqrmenu.com/m/{slug}
export function generateSlug(text: string): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u0652]/g, '') // strip Arabic diacritics
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '') // keep Arabic, Latin, numbers
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  const suffix = Math.random().toString(36).slice(2, 6)
  return base ? `${base}-${suffix}` : `restaurant-${suffix}`
}
