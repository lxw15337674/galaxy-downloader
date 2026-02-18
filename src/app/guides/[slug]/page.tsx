import { permanentRedirect } from 'next/navigation'
import { i18n } from '@/lib/i18n/config'

export default async function RootGuideDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    permanentRedirect(`/${i18n.defaultLocale}/guides/${slug}`)
}
