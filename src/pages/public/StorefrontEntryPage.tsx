import { useSearchParams } from 'react-router-dom'
import QRCategoryPage from './QRCategoryPage'
import ThemedMenuPage from './ThemedMenuPage'

export default function StorefrontEntryPage() {
  const [searchParams] = useSearchParams()
  const categoryName = searchParams.get('categoryName')
  const browseProducts = searchParams.get('browse') === 'products' || searchParams.get('qrBrowse') === '1'

  if (categoryName || browseProducts) return <ThemedMenuPage />
  return <QRCategoryPage />
}
