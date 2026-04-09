import type { Metadata } from "next"
import { Suspense } from "react"
import { getMessages } from "next-intl/server"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/types"
import {
    buildLanguageAlternates,
    buildLocaleUrl,
    buildOpenGraphLocaleAlternates,
    localeToOpenGraphLocale,
} from "@/lib/seo"
import { PlayPageClient } from "./play-client"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
    const { locale } = await params
    const dict = await getMessages({ locale }) as Dictionary
    const title = `${dict.result.sharePlayPlayerTitle} | ${dict.metadata.siteName}`
    const description = dict.unified.pageDescription
    const url = buildLocaleUrl(locale, "/play")

    return {
        title,
        description,
        robots: {
            index: false,
            follow: false,
        },
        openGraph: {
            title,
            description,
            url,
            siteName: dict.metadata.siteName,
            locale: localeToOpenGraphLocale(locale),
            alternateLocale: buildOpenGraphLocaleAlternates(locale),
            type: "website",
            images: ["/og/home.png"],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["/og/home.png"],
        },
        alternates: {
            canonical: url,
            languages: buildLanguageAlternates("/play"),
        },
    }
}

export default async function SharedPlayPage({
    params,
}: {
    params: Promise<{ locale: Locale }>
}) {
    const { locale } = await params
    const dict = await getMessages({ locale }) as Dictionary

    return (
        <main className="min-h-screen bg-background">
            <Suspense
                fallback={
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10">
                        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
                            {dict.form.downloading}
                        </div>
                    </div>
                }
            >
                <PlayPageClient />
            </Suspense>
        </main>
    )
}
