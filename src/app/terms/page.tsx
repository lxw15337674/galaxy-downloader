import { permanentRedirect } from 'next/navigation'
import { i18n } from '@/lib/i18n/config'

export default function RootTermsPage() {
    permanentRedirect(`/${i18n.defaultLocale}/terms`)
}
