import type { Locale } from './config'
import type { Dictionary } from './types'
import zh from './dictionaries/zh.json'
import zhTw from './dictionaries/zh-tw.json'
import en from './dictionaries/en.json'
import ja from './dictionaries/ja.json'
import es from './dictionaries/es.json'
import ru from './dictionaries/ru.json'

const dictionaries: Record<Locale, Dictionary> = {
    zh: zh as Dictionary,
    'zh-tw': zhTw as Dictionary,
    en: en as Dictionary,
    ja: ja as Dictionary,
    es: es as Dictionary,
    ru: ru as Dictionary,
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
    'use cache'
    return dictionaries[locale] ?? dictionaries.en
}
