import type { Dictionary } from '@/lib/i18n/types'
import type { Locale } from '@/lib/i18n/config'

interface HomeFaqStructuredDataProps {
    locale: Locale
    dict: Dictionary
}

export function HomeFaqStructuredData({ locale, dict }: HomeFaqStructuredDataProps) {
    const faqLocale: keyof Dictionary['seo']['faq'] = locale === 'zh-tw'
        ? 'zh-tw'
        : locale === 'en'
          ? 'en'
          : 'zh'
    const questions = dict.seo.faq[faqLocale].slice(0, 4)

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "inLanguage": locale === 'zh' ? 'zh-CN' : locale === 'zh-tw' ? 'zh-TW' : 'en',
        "mainEntity": questions.map((item) => ({
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
