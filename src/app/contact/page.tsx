import { permanentRedirect } from 'next/navigation'
import { i18n } from '@/lib/i18n/config'

export default function RootContactPage() {
    permanentRedirect(`/${i18n.defaultLocale}/contact`)
}
