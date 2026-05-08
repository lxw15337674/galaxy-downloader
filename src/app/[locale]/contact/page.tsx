import type { Metadata } from "next"
import Link from "next/link"
import { getMessages } from "next-intl/server"
import { PageStructuredData } from "@/components/page-structured-data"
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
    const title = dict.contactPage.metaTitle
    const description = dict.contactPage.metaDescription
    const url = buildLocaleUrl(locale, "/contact")

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
            languages: buildLanguageAlternates("/contact"),
        },
    }
}

export default async function ContactPage({
    params,
}: {
    params: Promise<{ locale: Locale }>
}) {
    const { locale } = await params
    const dict = await getMessages({ locale }) as Dictionary
    const copy = dict.contactPage

    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10 space-y-6">
                <h1 className="text-3xl font-semibold tracking-tight">{copy.title}</h1>
                <p className="text-sm text-muted-foreground leading-6">{copy.intro}</p>
                <div className="rounded-md border bg-card p-5 space-y-2">
                    <Link
                        href={`/${locale}/feedback`}
                        className="text-sm underline"
                    >
                        {copy.feedback}
                    </Link>
                    <p className="text-sm text-muted-foreground">{copy.feedbackHint}</p>
                </div>
                <div className="rounded-md border bg-card p-5 space-y-2">
                    <a
                        href="https://github.com/lxw15337674/galaxy-downloader/issues/new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline"
                    >
                        {copy.github}
                    </a>
                    <p className="text-sm text-muted-foreground">{copy.githubHint}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                    {dict.common.relatedPages}
                    {": "}
                    <Link className="underline" href={`/${locale}`}>{dict.common.home}</Link>
                    {' · '}
                    <Link className="underline" href={`/${locale}/feedback`}>{dict.feedbackPage.title}</Link>
                    {' · '}
                    <Link className="underline" href={`/${locale}/privacy`}>{dict.common.privacy}</Link>
                    {' · '}
                    <Link className="underline" href={`/${locale}/terms`}>{dict.common.terms}</Link>
                </p>
            </div>
            <PageStructuredData
                locale={locale}
                pageTitle={copy.title}
                pageDescription={copy.intro}
                path="/contact"
                breadcrumbs={[
                    { name: dict.common.home, path: "" },
                    { name: copy.title, path: "/contact" },
                ]}
            />
        </main>
    )
}
