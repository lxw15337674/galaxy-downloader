import type { Metadata } from "next"
import Link from "next/link"
import { getDictionary } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/config"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { FaqStructuredData } from "@/components/faq-structured-data"
import { PageStructuredData } from "@/components/page-structured-data"
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
            alternateLocale: buildOpenGraphLocaleAlternates(locale),
            type: "website",
            images: [
                {
                    url: "/og/faq.png",
                    width: 1200,
                    height: 630,
                    alt: dict.metadata.siteName,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: dict.faqPage.metaOgTitle,
            description: dict.faqPage.metaOgDescription,
            images: ["/og/faq.png"],
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
    const privacyLabel = locale === "en" ? "Privacy" : locale === "zh-tw" ? "隱私政策" : "隐私政策"
    const termsLabel = locale === "en" ? "Terms" : locale === "zh-tw" ? "使用條款" : "使用条款"
    const contactLabel = locale === "en" ? "Contact" : locale === "zh-tw" ? "聯絡我們" : "联系我们"
    const homeLabel = locale === "en" ? "Home" : locale === "zh-tw" ? "首頁" : "首页"

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
                        {' · '}
                        <Link href={`/${locale}/privacy`} className="underline">
                            {privacyLabel}
                        </Link>
                        {' · '}
                        <Link href={`/${locale}/terms`} className="underline">
                            {termsLabel}
                        </Link>
                        {' · '}
                        <Link href={`/${locale}/contact`} className="underline">
                            {contactLabel}
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
            <PageStructuredData
                locale={locale}
                pageTitle={dict.faqPage.title}
                pageDescription={dict.faqPage.metaDescription}
                path="/faq"
                breadcrumbs={[
                    { name: homeLabel, path: "" },
                    { name: dict.faqPage.title, path: "/faq" },
                ]}
            />
            <FaqStructuredData locale={locale} dict={dict} />
        </div>
    )
}
