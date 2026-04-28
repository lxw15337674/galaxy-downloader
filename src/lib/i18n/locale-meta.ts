import type {Locale} from './config'
import {i18n} from './config'

export const LOCALE_LABELS: Record<Locale, string> = {
    zh: '简体中文',
    'zh-tw': '繁體中文',
    en: 'English',
    ja: '日本語',
    es: 'Español',
    ru: 'Русский',
}

export function getLocaleLabel(locale: Locale): string {
    return LOCALE_LABELS[locale]
}

export const SUPPORTED_LOCALES = i18n.locales
