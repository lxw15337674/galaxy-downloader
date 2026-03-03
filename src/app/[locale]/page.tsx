import dynamic from "next/dynamic"
import { getDictionary } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/config"
import { StructuredData } from "@/components/structured-data"
import { HomeFaqStructuredData } from "@/components/home-faq-structured-data"

const UnifiedDownloader = dynamic(
    () => import("./unified-downloader").then((m) => m.UnifiedDownloader),
    { ssr: false }
)

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
            <HomeFaqStructuredData locale={locale} dict={dict} />
            <UnifiedDownloader dict={dict} locale={locale} />
        </>
    )
} 
