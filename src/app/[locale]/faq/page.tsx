import type { Metadata } from "next"
import Link from "next/link"
import { getDictionary } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/config"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { FaqStructuredData } from "@/components/faq-structured-data"
import {
    buildLanguageAlternates,
    buildLocaleUrl,
    localeToOpenGraphLocale,
} from "@/lib/seo"

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
    const { locale } = await params
    const dict = await getDictionary(locale)

    const url = buildLocaleUrl(locale, "/faq")

    return {
        title: dict.faqPage.metaTitle,
        description: dict.faqPage.metaDescription,
        openGraph: {
            title: dict.faqPage.metaOgTitle,
            description: dict.faqPage.metaOgDescription,
            url,
            siteName: dict.metadata.siteName,
            locale: localeToOpenGraphLocale(locale),
            type: "website",
            images: [
                {
                    url: "/favicon.svg",
                    width: 512,
                    height: 512,
                    alt: dict.metadata.siteName,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: dict.faqPage.metaOgTitle,
            description: dict.faqPage.metaOgDescription,
            images: ["/favicon.svg"],
        },
        alternates: {
            canonical: url,
            languages: buildLanguageAlternates("/faq"),
        },
    }
}

export default async function FaqPage({
    params,
}: {
    params: Promise<{ locale: Locale }>
}) {
    const { locale } = await params
    const dict = await getDictionary(locale)
    const guidesLabel = locale === "en" ? "Guides" : locale === "zh-tw" ? "下載指南" : "下载指南"

    return (
        <div className="min-h-screen bg-background">
            <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10 space-y-6">
                <header className="space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {dict.faqPage.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {dict.faqPage.intro}
                    </p>
                    <p className="text-sm">
                        <Link href={`/${locale}/guides`} className="underline">
                            {guidesLabel}
                        </Link>
                    </p>
                </header>

                <section className="grid gap-4">
                    {dict.faqPage.questions.map((item, index) => (
                            <Card key={`${item.question}-${index}`}>
                                <CardHeader className="p-4 md:p-6">
                                    <h2 className="text-base md:text-lg font-semibold tracking-tight">
                                        {item.question}
                                    </h2>
                                </CardHeader>
                                <CardContent className="p-4 md:p-6 pt-0 text-sm text-muted-foreground">
                                    {item.answer}
                                </CardContent>
                        </Card>
                    ))}
                </section>
            </main>
            <FaqStructuredData locale={locale} dict={dict} />
        </div>
    )
}
