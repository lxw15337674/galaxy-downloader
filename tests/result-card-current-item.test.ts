import React from 'react'
import { describe, expect, test, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => React.createElement('img', props),
}))

vi.mock('@/i18n/client', () => ({
  useDictionary: () => ({
    result: {
      title: 'Result',
      totalParts: '分P {count}',
      videoCount: '合集 {count}',
      videoList: '合集列表',
      collectionSearchPlaceholder: '搜索合集',
      collectionNoSearchResults: '无结果',
      articleVideoUntitled: '视频 {index}',
      playVideo: '播放视频',
      playAudio: '播放音频',
      downloadVideo: '下载视频',
      downloadAudio: '下载音频',
      mergeDownloadVideo: '合并下载视频',
      mergeDownloadVideoHint: 'hint',
      pureMusicHint: 'audio hint',
      originDownloadVideo: '原始视频',
      originDownloadAudio: '原始音频',
      sharePlayLink: '分享',
      sharePlayLinkCopied: '已复制',
      coverLabel: '封面',
      imageNote: '图片',
      imageCount: '{count} 张',
      imageLoadingProgress: '{loaded}/{total}',
      packaging: '打包中',
      packageDownload: '打包下载',
      loading: '加载中',
      downloadImage: '下载图片',
      downloadCover: '下载封面',
      imageAlt: '图片 {index}',
      imageIndexLabel: '图片 {index}',
      previewPlayerTitle: '预览',
      loadFailed: '失败',
      loadMoreItems: '更多 {count}',
      collapseParts: '收起 {count}',
    },
    extractAudio: {
      button: '提取音频',
    },
    errors: {
      clipboardFailed: '复制失败',
      clipboardPermission: '无权限',
      downloadError: '下载失败',
      allImagesLoadFailed: '图片加载失败',
      packageFailed: '打包失败',
    },
  }),
}))

vi.mock('@/lib/deferred-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, asChild, ...props }: Record<string, unknown> & { children?: React.ReactNode; asChild?: boolean }) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, props)
    }

    return React.createElement('button', props, children)
  },
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: Record<string, unknown> & { children?: React.ReactNode }) => React.createElement('div', props, children),
  CardContent: ({ children, ...props }: Record<string, unknown> & { children?: React.ReactNode }) => React.createElement('div', props, children),
  CardHeader: ({ children, ...props }: Record<string, unknown> & { children?: React.ReactNode }) => React.createElement('div', props, children),
  CardTitle: ({ children, ...props }: Record<string, unknown> & { children?: React.ReactNode }) => React.createElement('div', props, children),
}))

vi.mock('@/components/ui/input', () => ({
  Input: (props: Record<string, unknown>) => React.createElement('input', props),
}))

vi.mock('../src/components/downloader/result-card-visibility', () => ({
  getResultMediaActions: () => ({ videoAction: 'direct-download', audioAction: 'direct-download' }),
  resolveResultDisplayImages: () => [],
  shouldHideSingleImagePreview: () => false,
  shouldShowVideoDownloadButton: (url: string | null | undefined) => Boolean(url),
  shouldUseFrontendImageProxy: () => false,
}))

import { ResultCard } from '../src/components/downloader/ResultCard'

describe('ResultCard current collection item highlighting', () => {
  test('合集列表应高亮 currentItemId 对应的视频项', () => {
    const result = {
      title: '测试合集',
      desc: 'desc',
      cover: 'https://img.example.com/cover.jpg',
      platform: 'bili',
      url: 'https://www.bilibili.com/video/BV1ab411c7nA/',
      downloadAudioUrl: '/api/download?type=audio&item=BV2',
      downloadVideoUrl: '/api/download?type=video&item=BV2',
      originDownloadAudioUrl: null,
      originDownloadVideoUrl: null,
      mediaActions: { video: 'direct-download', audio: 'direct-download' } as const,
      duration: 123,
      isMultiPart: false,
      currentItemId: 'BV2',
      videos: [
        {
          id: 'BV1',
          title: '合集第1集',
          duration: 111,
          downloadVideoUrl: '/api/download?type=video&item=BV1',
          downloadAudioUrl: '/api/download?type=audio&item=BV1',
        },
        {
          id: 'BV2',
          title: '合集第2集当前页',
          duration: 123,
          downloadVideoUrl: '/api/download?type=video&item=BV2',
          downloadAudioUrl: '/api/download?type=audio&item=BV2',
        },
      ],
    }

    const html = renderToStaticMarkup(
      React.createElement(ResultCard, {
        result,
        onClose: () => {},
        onOpenExtractAudio: () => {},
        onRequestPreview: () => {},
      })
    )

    expect(html).toContain('合集第2集当前页')
    expect(html).toContain('border-primary bg-primary/5')
    expect(html).toContain('<video')
    expect(html).toContain('/api/play?url=')
    expect(html).toContain('aria-label="下载封面"')
    expect(html.match(/aria-label="播放视频"/g) ?? []).toHaveLength(1)
    expect(html.match(/aria-label="播放音频"/g) ?? []).toHaveLength(1)
  })
})
