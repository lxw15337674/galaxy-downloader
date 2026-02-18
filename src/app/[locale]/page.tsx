import { getDictionary } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/config"
import { UnifiedDownloader } from "./unified-downloader"
import { StructuredData } from "@/components/structured-data"

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: Locale }>
}) {
    const { locale } = await params
    const dict = await getDictionary(locale)

    return (
        <>
            <StructuredData locale={locale} dict={dict} />
            <UnifiedDownloader dict={dict} locale={locale} />
        </>
    )
} 
