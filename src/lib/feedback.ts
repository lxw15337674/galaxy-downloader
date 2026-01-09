import { FEEDBACK_CONFIG, type FeedbackData } from './feedback-config'

/**
 * 提交反馈到自建API
 * @param data 反馈数据
 * @returns Promise<{ success: boolean, error?: string }>
 */
export async function submitFeedback(data: FeedbackData): Promise<{ success: boolean; error?: string }> {
  try {
    // 构建请求体
    const requestBody = {
      type: data.type,
      content: data.content.trim(),
      email: data.email?.trim() || undefined,
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
    const result = await response.json()

    // 检查响应状态
    if (response.ok && result.success) {
      return { success: true }
    } else {
      return {
        success: false,
        error: result.error || result.message || 'Submission failed'
      }
    }

  } catch (error) {
    // 网络错误或其他异常
    console.error('Failed to submit feedback:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
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

