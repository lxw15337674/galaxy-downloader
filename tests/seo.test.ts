import { describe, expect, it } from 'vitest'

import { appendVaryHeader, resolveSiteAlternateName, sanitizeStructuredDataTextList, setXRobotsTag } from '../src/lib/seo.ts'

describe('seo helpers', () => {
it('returns locale-specific alternate site names', () => {
    expect(resolveSiteAlternateName('zh')).toBe('通用媒体下载器')
    expect(resolveSiteAlternateName('zh-tw')).toBe('通用媒體下載器')
    expect(resolveSiteAlternateName('ja')).toBe('ユニバーサルメディアダウンローダー')
    expect(resolveSiteAlternateName('en')).toBe('Universal Media Downloader')
})

it('sanitizes structured data text lists', () => {
    expect(sanitizeStructuredDataTextList([
        ' 下载视频 ',
        '????????????????',
        '下載影片',
        '',
        '下载视频',
    ])).toEqual([
        '下载视频',
        '下載影片',
    ])
})

it('merges Vary headers without duplicates', () => {
    const headers = new Headers({ Vary: 'Accept-Encoding, Cookie' })
    appendVaryHeader(headers, ['Accept-Language', 'Cookie', 'User-Agent'])

    expect(headers.get('Vary')).toBe('Accept-Encoding, Cookie, Accept-Language, User-Agent')
})

it('sets normalized X-Robots-Tag directives', () => {
    const headers = new Headers()
    setXRobotsTag(headers, ['NoIndex', 'nofollow', 'noarchive', 'nofollow'])

    expect(headers.get('X-Robots-Tag')).toBe('noindex, nofollow, noarchive')
})
})
