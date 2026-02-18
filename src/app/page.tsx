import { permanentRedirect } from 'next/navigation'
import { i18n } from '@/lib/i18n/config'

/**
 * Root page - redirects to default locale
 * This ensures Google can properly crawl the site and users always land on a localized page
 */
export default function RootPage() {
  permanentRedirect(`/${i18n.defaultLocale}`)
}
