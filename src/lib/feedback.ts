import { FEEDBACK_CONFIG, type FeedbackData } from './feedback-config'
import { ApiRequestError } from './api-errors'
import type { UnifiedApiResponse } from './types'

function resolveBrowser(userAgent: string): { name: string; version?: string } {
  const browserMatchers: Array<[string, RegExp]> = [
    ['Edge', /Edg\/([0-9.]+)/],
    ['Chrome', /Chrome\/([0-9.]+)/],
    ['Firefox', /Firefox\/([0-9.]+)/],
    ['Safari', /Version\/([0-9.]+).*Safari/],
  ]

  for (const [name, pattern] of browserMatchers) {
    const match = userAgent.match(pattern)
    if (match?.[1]) {
      return { name, version: match[1] }
    }
  }

  return { name: 'Unknown' }
}

function resolveOS(userAgent: string): { name: string; version?: string } {
  const osMatchers: Array<[string, RegExp]> = [
    ['Windows', /Windows NT ([0-9.]+)/],
    ['macOS', /Mac OS X ([0-9_]+)/],
    ['iOS', /(?:iPhone|iPad|iPod).*OS ([0-9_]+)/],
    ['Android', /Android ([0-9.]+)/],
    ['Linux', /Linux/],
  ]

  for (const [name, pattern] of osMatchers) {
    const match = userAgent.match(pattern)
    if (match) {
      return {
        name,
        version: match[1]?.replace(/_/g, '.'),
      }
    }
  }

  return { name: 'Unknown' }
}

function resolveDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  if (/iPad|Tablet|Android(?!.*Mobile)/i.test(userAgent)) {
    return 'tablet'
  }

  if (/Mobile|iPhone|iPod|Android/i.test(userAgent)) {
    return 'mobile'
  }

  return 'desktop'
}

export function collectFeedbackClientMetadata(): Record<string, unknown> | undefined {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return undefined
  }

  const userAgent = navigator.userAgent || ''

  return {
    browser: resolveBrowser(userAgent),
    os: resolveOS(userAgent),
    deviceType: resolveDeviceType(userAgent),
    userAgent,
    platform: navigator.platform || undefined,
    language: navigator.language || undefined,
    languages: Array.from(navigator.languages || []),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    path: window.location.pathname,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      pixelRatio: window.devicePixelRatio,
    },
  }
}

/**
 * 提交反馈到自建API
 */
export async function submitFeedback(data: FeedbackData): Promise<void> {
  try {
    // 构建请求体
    const requestBody = {
      type: data.type,
      content: data.content.trim(),
      contact: data.contact?.trim() || undefined,
      metadata: data.metadata,
    }

    // 发送POST请求到自建API
    const response = await fetch(FEEDBACK_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    // 解析响应
    const result = await response.json() as UnifiedApiResponse<{ feedbackId?: string }>

    // 检查响应状态
    if (response.ok && result.success) {
      return
    }

    throw new ApiRequestError({
      code: result.code,
      status: result.status ?? response.status,
      requestId: result.requestId,
      details: result.details,
      fallbackMessage: result.error || result.message,
    })

  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error
    }

    throw new ApiRequestError({
      fallbackMessage: error instanceof Error ? error.message : undefined
    })
  }
}

/**
 * 验证反馈内容
 * @param content 反馈内容
 * @returns 错误信息，如果验证通过则返回 null
 */
export function validateContent(content: string): string | null {
  const trimmed = content.trim()

  if (!trimmed) {
    return 'contentRequired'
  }

  if (trimmed.length < FEEDBACK_CONFIG.validation.contentMinLength) {
    return 'contentTooShort'
  }

  if (trimmed.length > FEEDBACK_CONFIG.validation.contentMaxLength) {
    return 'contentTooLong'
  }

  return null
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否有效
 */
export function validateEmail(email: string): boolean {
  if (!email.trim()) {
    return true // 邮箱是可选的，空值视为有效
  }

  return FEEDBACK_CONFIG.validation.emailRegex.test(email.trim())
}
