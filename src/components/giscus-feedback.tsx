'use client'

import { useEffect, useRef } from 'react'
import type { Locale } from '@/lib/i18n/config'

const GISCUS_REPO = 'lxw15337674/galaxy-downloader'
const GISCUS_REPO_ID = 'R_kgDONqEZxQ'
const GISCUS_CATEGORY = 'Announcements'
const GISCUS_CATEGORY_ID = 'DIC_kwDONqEZxc4C8k_R'
const GISCUS_DISCUSSION_NUMBER = '28'

const GISCUS_LANG_BY_LOCALE: Record<Locale, string> = {
    zh: 'zh-CN',
    'zh-tw': 'zh-TW',
    en: 'en',
    ja: 'ja',
    es: 'es',
    ru: 'ru',
}

interface GiscusFeedbackProps {
    locale: Locale
}

export function GiscusFeedback({ locale }: GiscusFeedbackProps) {
    const containerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) {
            return
        }

        container.textContent = ''

        const script = document.createElement('script')
        script.src = 'https://giscus.app/client.js'
        script.async = true
        script.crossOrigin = 'anonymous'
        script.setAttribute('data-repo', GISCUS_REPO)
        script.setAttribute('data-repo-id', GISCUS_REPO_ID)
        script.setAttribute('data-category', GISCUS_CATEGORY)
        script.setAttribute('data-category-id', GISCUS_CATEGORY_ID)
        script.setAttribute('data-mapping', 'number')
        script.setAttribute('data-term', GISCUS_DISCUSSION_NUMBER)
        script.setAttribute('data-strict', '1')
        script.setAttribute('data-reactions-enabled', '1')
        script.setAttribute('data-emit-metadata', '0')
        script.setAttribute('data-input-position', 'top')
        script.setAttribute('data-theme', 'preferred_color_scheme')
        script.setAttribute('data-lang', GISCUS_LANG_BY_LOCALE[locale])

        container.appendChild(script)

        return () => {
            container.textContent = ''
        }
    }, [locale])

    return <div ref={containerRef} />
}
