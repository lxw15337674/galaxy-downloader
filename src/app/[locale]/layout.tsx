import type { Metadata } from "next";
import "../globals.css";
import { DeferredRuntimeServices } from "@/components/deferred-runtime-services"
import { ThemeProvider } from "@/components/theme-provider";
import { DeferredToaster } from "@/components/deferred-toaster"
import { getDictionary } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n/config"
import { i18n } from "@/lib/i18n/config"
import {
    buildOpenGraphLocaleAlternates,
    IS_INDEXABLE,
    SITE_URL,
    buildLanguageAlternates,
    buildLocaleUrl,
    localeToHtmlLang,
    localeToOpenGraphLocale,
} from "@/lib/seo"

// 生成静态参数
export async function generateStaticParams() {
    return i18n.locales.map((locale) => ({ locale }))
}

// 动态生成 metadata
export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
    const { locale } = await params
    const dict = await getDictionary(locale)
    const localeUrl = buildLocaleUrl(locale)

    return {
        title: dict.metadata.title,
        description: dict.metadata.description,
        keywords: dict.metadata.keywords.split(','),
        authors: [{ name: dict.metadata.siteName }],
        creator: dict.metadata.siteName,
        publisher: dict.metadata.siteName,
        applicationName: dict.metadata.siteName,
        generator: 'Next.js',
        referrer: 'origin-when-cross-origin',
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
        metadataBase: new URL(SITE_URL),
        category: 'utilities',
        icons: {
            icon: [
                { url: '/favicon.ico' },
                { url: '/favicon.svg', type: 'image/svg+xml' },
            ],
            apple: [
                { url: '/icons/apple-touch-icon.png' },
            ],
        },
        openGraph: {
            title: dict.metadata.ogTitle,
            description: dict.metadata.ogDescription,
            url: localeUrl,
            siteName: dict.metadata.siteName,
            locale: localeToOpenGraphLocale(locale),
            alternateLocale: buildOpenGraphLocaleAlternates(locale),
            type: 'website',
            images: [
                {
                    url: '/og/home.png',
                    width: 1200,
                    height: 630,
                    alt: dict.metadata.siteName,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: dict.metadata.ogTitle,
            description: dict.metadata.ogDescription,
            images: ['/og/home.png'],
        },
        robots: {
            index: IS_INDEXABLE,
            follow: IS_INDEXABLE,
            googleBot: {
                index: IS_INDEXABLE,
                follow: IS_INDEXABLE,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        alternates: {
            canonical: localeUrl,
            languages: buildLanguageAlternates(),
        },
        manifest: buildLocaleUrl(locale, "manifest.webmanifest"),
        appleWebApp: {
            capable: true,
            statusBarStyle: 'black-translucent',
            title: dict.metadata.siteName,
        },
    }
}

export default async function RootLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>) {
    const { locale: localeParam } = await params
    const locale = localeParam as Locale
    const dict = await getDictionary(locale)
    const htmlLang = localeToHtmlLang(locale)

    return (
        <html lang={htmlLang} suppressHydrationWarning>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#000000" />
                <meta name="color-scheme" content="dark light" />
                <meta name="google-adsense-account" content="ca-pub-1581472267398547" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content={dict.metadata.siteName} />
                <meta name="application-name" content={dict.metadata.siteName} />
                <meta name="msapplication-TileColor" content="#000000" />
                <meta name="format-detection" content="telephone=no" />
                <meta httpEquiv="x-ua-compatible" content="ie=edge" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
            </head>
            <body className="antialiased">
                <DeferredToaster />
                <DeferredRuntimeServices />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem={true}
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    )
}
