import type { Dictionary } from '@/lib/i18n/types'
import type { Locale } from '@/lib/i18n/config'

interface FaqStructuredDataProps {
    locale: Locale
    dict: Dictionary
}

export function FaqStructuredData({ locale, dict }: FaqStructuredDataProps) {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "inLanguage": locale === 'zh' ? 'zh-CN' : locale === 'zh-tw' ? 'zh-TW' : 'en',
        "mainEntity": dict.faqPage.questions.map((item) => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(faqSchema)
            }}
        />
    )
}
