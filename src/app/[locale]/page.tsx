import Link from "next/link"
import { getMessages } from "next-intl/server"

import { ViewportSideRailAd } from "@/components/ads/viewport-side-rail-ad"
import { FreeSupportCard } from "@/components/downloader/FreeSupportCard"
import { PlatformGuideCard } from "@/components/downloader/PlatformGuideCard"
import { QuickStartCard } from "@/components/downloader/QuickStartCard"
import { StructuredData } from "@/components/structured-data"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/types"

import { UnifiedDownloaderClient } from "./unified-downloader-client"

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: Locale }>
}) {
    const { locale } = await params
    const dict = await getMessages({ locale }) as Dictionary
    const currentYear = new Date().getFullYear()

    return (
        <>
            <StructuredData locale={locale} dict={dict} />
            <UnifiedDownloaderClient
                leftRail={
                    <>
                        <QuickStartCard dict={dict} />
                        <FreeSupportCard dict={dict} />
                        <ViewportSideRailAd slot="1341604736" showOn="desktop" height={250} />
                    </>
                }
                rightRail={
                    <>
                        <PlatformGuideCard dict={dict} />
                        <ViewportSideRailAd slot="6380909506" showOn="desktop" height={250} />
                    </>
                }
                mobileAd={
                    <ViewportSideRailAd slot="5740014745" showOn="mobile" height={250} />
                }
                mobileGuides={
                    <>
                        <QuickStartCard dict={dict} />
                        <FreeSupportCard dict={dict} />
                        <PlatformGuideCard dict={dict} />
                    </>
                }
                heroMeta={
                    <p className="text-center text-xs text-muted-foreground">
                        {dict.page.feedback}
                    </p>
                }
                footer={
                    <footer className="border-t bg-muted/30 py-6">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                            <div className="space-y-1 text-center text-xs text-muted-foreground">
                                <p>
                                    {dict.common.trustAndPolicies}
                                    {": "}
                                    <Link className="underline" href={`/${locale}/privacy`} prefetch={false}>
                                        {dict.common.privacy}
                                    </Link>
                                    {" · "}
                                    <Link className="underline" href={`/${locale}/terms`} prefetch={false}>
                                        {dict.common.terms}
                                    </Link>
                                    {" · "}
                                    <Link className="underline" href={`/${locale}/contact`} prefetch={false}>
                                        {dict.common.contact}
                                    </Link>
                                </p>
                                <p>{dict.page.copyrightVideo}</p>
                                <p>{dict.page.copyrightStorage}</p>
                                <p>{dict.page.copyrightYear.replace("{year}", String(currentYear))}</p>
                            </div>
                        </div>
                    </footer>
                }
            />
        </>
    )
}
