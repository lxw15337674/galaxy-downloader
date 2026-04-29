'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from '@/lib/deferred-toast'
import { useDictionary } from '@/i18n/client'
import type { FeedbackType } from '@/lib/feedback-config'
import { submitFeedback, validateContent, validateEmail } from '@/lib/feedback'
import { FEEDBACK_CONFIG } from '@/lib/feedback-config'
import { cn } from '@/lib/utils'
import { isApiRequestError, resolveApiErrorMessageWithFallback } from '@/lib/api-errors'

interface FeedbackDialogProps {
    triggerClassName?: string
    triggerIconOnly?: boolean
    defaultOpen?: boolean
    onTriggerClick?: () => void
}

export function FeedbackDialog({
    triggerClassName,
    triggerIconOnly = false,
    defaultOpen = false,
    onTriggerClick,
}: FeedbackDialogProps) {
    const dict = useDictionary()
    const feedback = dict.feedback
    const [open, setOpen] = useState(defaultOpen)
    const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug')
    const [content, setContent] = useState('')
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

    // 字符计数
    const contentLength = content.length
    const maxLength = FEEDBACK_CONFIG.validation.contentMaxLength

    // 验证状态
    const contentError = content ? validateContent(content) : null
    const emailError = email ? !validateEmail(email) : null
    const canSubmit = !contentError && !emailError && content.trim().length >= FEEDBACK_CONFIG.validation.contentMinLength
    const contentTooShortMessage = feedback.contentTooShort.replace('{min}', String(FEEDBACK_CONFIG.validation.contentMinLength))
    const contentCounterText = feedback.contentCounter
        .replace('{current}', String(contentLength))
        .replace('{max}', String(maxLength))

    // 获取当前反馈类型对应的placeholder
    const getPlaceholder = () => {
        return feedback.contentPlaceholder[feedbackType] || feedback.contentPlaceholder.other || ''
    }

    // 重置表单
    const resetForm = () => {
        setFeedbackType('bug')
        setContent('')
        setEmail('')
        setSubmitStatus('idle')
    }

    // 关闭弹窗时重置
    useEffect(() => {
        if (!open) {
            // 延迟重置，等待关闭动画完成
            const timer = setTimeout(resetForm, 200)
            return () => clearTimeout(timer)
        }
    }, [open])

    // 处理提交
    const handleSubmit = async () => {
        if (!canSubmit) return

        setIsSubmitting(true)

        try {
            // 提交反馈
            await submitFeedback({
                type: feedbackType,
                content: content.trim(),
                contact: email.trim(),
            })

            setSubmitStatus('success')
            toast.success(feedback.toastSuccess)

            // 3秒后自动关闭
            setTimeout(() => {
                setOpen(false)
            }, 3000)
        } catch (error) {
            if (isApiRequestError(error)) {
                console.error('Feedback submit failed', {
                    code: error.code,
                    status: error.status,
                    requestId: error.requestId,
                    details: error.details,
                })
            } else {
                console.error('Submit error:', error)
            }

            const errorMessage = resolveApiErrorMessageWithFallback(error, dict, feedback.errorMessage)
            setSubmitStatus('error')
            toast.error(feedback.toastError, {
                description: errorMessage,
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // 渲染成功状态
    const renderSuccess = () => (
        <div className="py-8 text-center space-y-4">
            <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                    {feedback.successTitle}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {feedback.successMessage}
                </p>
                {email && (
                    <p className="text-xs text-muted-foreground">
                        {feedback.successNote}
                    </p>
                )}
            </div>
            <Button onClick={() => setOpen(false)} className="mt-4">
                {feedback.closeButton}
            </Button>
        </div>
    )

    // 渲染表单
    const renderForm = () => (
        <div className="space-y-4">
            {/* 反馈类型 */}
            <div className="space-y-2">
                <Label htmlFor="feedback-type">
                    {feedback.typeLabel} <span className="text-red-500">*</span>
                </Label>
                <Select value={feedbackType} onValueChange={(value) => setFeedbackType(value as FeedbackType)}>
                    <SelectTrigger id="feedback-type">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="bug">
                            {feedback.types.bug}
                        </SelectItem>
                        <SelectItem value="feature">
                            {feedback.types.feature}
                        </SelectItem>
                        <SelectItem value="other">
                            {feedback.types.other}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* 详细描述 */}
            <div className="space-y-2">
                <Label htmlFor="feedback-content">
                    {feedback.contentLabel} <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="feedback-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={getPlaceholder()}
                    rows={5}
                    className="resize-none"
                    maxLength={maxLength}
                />
                <div className="flex justify-between items-center text-xs">
                    <span className={contentError ? 'text-red-500' : 'text-muted-foreground'}>
                        {contentError === 'contentRequired' && feedback.contentRequired}
                        {contentError === 'contentTooShort' && contentTooShortMessage}
                    </span>
                    <span className={contentLength > maxLength * 0.9 ? 'text-yellow-500' : 'text-muted-foreground'}>
                        {contentCounterText}
                    </span>
                </div>
            </div>

            {/* 联系邮箱 */}
            <div className="space-y-2">
                <Label htmlFor="feedback-email">
                    {feedback.emailLabel}
                </Label>
                <Input
                    id="feedback-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={feedback.emailPlaceholder}
                />
                {emailError && (
                    <p className="text-xs text-red-500">
                        {feedback.emailInvalid}
                    </p>
                )}
                {!email && !emailError && (
                    <p className="text-xs text-muted-foreground">
                        {feedback.emailRequired}
                    </p>
                )}
            </div>

            {/* 按钮 */}
            <div className="flex justify-end gap-2 pt-4">
                <Button
                    variant="ghost"
                    onClick={() => setOpen(false)}
                    disabled={isSubmitting}
                >
                    {feedback.cancelButton}
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {feedback.submittingButton}
                        </>
                    ) : (
                        feedback.submitButton
                    )}
                </Button>
            </div>
        </div>
    )

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size={triggerIconOnly ? 'icon' : 'sm'}
                    className={cn('text-sm', triggerClassName)}
                    onClick={onTriggerClick}
                    aria-label={feedback.triggerButton}
                >
                    <MessageSquare className={cn('h-4 w-4', !triggerIconOnly && 'mr-1')} />
                    {triggerIconOnly ? (
                        <span className="sr-only">{feedback.triggerButton}</span>
                    ) : (
                        feedback.triggerButton
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent
                className="max-w-lg max-h-[90vh] overflow-y-auto"
                onInteractOutside={(event) => event.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>
                        {feedback.title}
                    </DialogTitle>
                </DialogHeader>
                {submitStatus === 'success' ? renderSuccess() : renderForm()}
            </DialogContent>
        </Dialog>
    )
}
