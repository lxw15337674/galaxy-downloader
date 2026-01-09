// 反馈API配置
export const FEEDBACK_CONFIG = {
  // API端点
  apiUrl: process.env.NEXT_PUBLIC_FEEDBACK_API_URL || 'http://127.0.0.1:8787/api/feedback',

  // 验证规则
  validation: {
    contentMinLength: 10,
    contentMaxLength: 1000,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  }
} as const

// 反馈类型
export type FeedbackType = 'bug' | 'feature' | 'other'

// 反馈数据接口
export interface FeedbackData {
  type: FeedbackType
  content: string
  email?: string
}
