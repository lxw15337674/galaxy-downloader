import type { Metadata } from "next"
import { getMessages } from "next-intl/server"
import { GiscusFeedback } from "@/components/giscus-feedback"
import { PageStructuredData } from "@/components/page-structured-data"
import { Footer } from "@/components/layout/footer"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/types"
import {
    buildLanguageAlternates,
    buildLocaleUrl,
    buildOpenGraphLocaleAlternates,
    localeToOpenGraphLocale,
} from "@/lib/seo"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
    const { locale } = await params
    const dict = await getMessages({ locale }) as Dictionary
    const title = dict.feedbackPage.metaTitle
    const description = dict.feedbackPage.metaDescription
    const url = buildLocaleUrl(locale, "/feedback")

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url,
            siteName: dict.metadata.siteName,
            locale: localeToOpenGraphLocale(locale),
            alternateLocale: buildOpenGraphLocaleAlternates(locale),
            type: "website",
            images: ["/og/contact.png"],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["/og/contact.png"],
        },
        alternates: {
            canonical: url,
            languages: buildLanguageAlternates("/feedback"),
        },
    }
}

export default async function FeedbackPage({
    params,
}: {
    params: Promise<{ locale: Locale }>
}) {
    const { locale } = await params
    const dict = await getMessages({ locale }) as Dictionary
    const copy = dict.feedbackPage

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <div className="flex-1 w-full mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-8">
                <div className="space-y-4">
                    <h1 className="text-3xl font-semibold tracking-tight">{copy.title}</h1>
                    <p className="rounded-md border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
                        {copy.intro} {copy.publicNotice}
                    </p>
                </div>

                <section className="mt-8 rounded-md border bg-card p-4 sm:p-6 mb-10">
                    <GiscusFeedback locale={locale} />
                </section>
            </div>
            
            <Footer locale={locale} dict={dict} />

            <PageStructuredData
                locale={locale}
                pageTitle={copy.title}
                pageDescription={copy.intro}
                path="/feedback"
                breadcrumbs={[
                    { name: dict.common.home, path: "" },
                    { name: copy.title, path: "/feedback" },
                ]}
            />
        </main>
    )
}
