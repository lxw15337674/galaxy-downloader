import Link from "next/link"
import type { Locale } from "@/lib/i18n/config"
import type { Dictionary } from "@/lib/i18n/types"

interface FooterProps {
    locale: Locale
    dict: Dictionary
}

export function Footer({ locale, dict }: FooterProps) {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t bg-muted/30 py-6 mt-auto">
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
    )
}
