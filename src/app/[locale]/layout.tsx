import type { Metadata, Viewport } from "next";
import "../globals.css";
import { DeferredRuntimeServices } from "@/components/deferred-runtime-services"
import { ThemeProvider } from "@/components/theme-provider";
import { DeferredToaster } from "@/components/deferred-toaster"
import { NextIntlClientProvider } from "next-intl";
import { hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { AppI18nProvider } from "@/i18n/client";
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/types"
import { i18n } from "@/lib/i18n/config"
import { routing } from "@/i18n/routing";
import {
    buildOpenGraphLocaleAlternates,
    IS_INDEXABLE,
    SITE_URL,
    buildLanguageAlternates,
    buildLocaleUrl,
    localeToHtmlLang,
    localeToOpenGraphLocale,
} from "@/lib/seo"
import { notFound } from "next/navigation";

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
    const dict = await getMessages({ locale }) as Dictionary
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
        other: {
            'google-adsense-account': 'ca-pub-1581472267398547',
            'mobile-web-app-capable': 'yes',
            'msapplication-TileColor': '#000000',
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
        manifest: "/manifest.webmanifest",
        appleWebApp: {
            capable: true,
            statusBarStyle: 'black-translucent',
            title: dict.metadata.siteName,
        },
    }
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#000000',
    colorScheme: 'dark light',
}

export default async function RootLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>) {
    const { locale: localeParam } = await params
    if (!hasLocale(routing.locales, localeParam)) {
        notFound()
    }

    const locale = localeParam as Locale
    setRequestLocale(locale)
    const dict = await getMessages({ locale }) as Dictionary
    const htmlLang = localeToHtmlLang(locale)

    return (
        <html lang={htmlLang} suppressHydrationWarning>
            <body className="antialiased">
                <NextIntlClientProvider locale={locale} messages={dict}>
                    <AppI18nProvider locale={locale} dictionary={dict}>
                        <DeferredRuntimeServices />
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="dark"
                            enableSystem={true}
                            disableTransitionOnChange
                        >
                            {children}
                            <DeferredToaster />
                        </ThemeProvider>
                    </AppI18nProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}
