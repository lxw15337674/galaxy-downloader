'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, Globe, Link } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/types';
import { PlatformSupportGrid } from './PlatformSupportGrid';

interface HelpCardsProps {
    dict: Dictionary;
}

export function HelpCards({ dict }: HelpCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:flex lg:flex-col lg:space-y-4">
            {/* 快速入门指南 */}
            <Card className="order-1">
                <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <PlayCircle className="h-5 w-5 text-primary" />
                        {dict.guide.quickStart.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {dict.guide.quickStart.steps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                            </div>
                            <div>
                                <p className="font-medium">{step.title}</p>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* 支持平台 */}
            <Card className="order-2">
                <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Globe className="h-4 w-4 text-primary" />
                        {dict.guide.platformSupport.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                    <PlatformSupportGrid dict={dict} />

                    {/* 音频提取说明 */}
                    {dict.guide.platformSupport.audioTip && (
                        <div className="p-3 bg-muted/50 rounded-lg space-y-1 border border-border/50 mt-2">
                            <p className="text-sm font-medium flex items-center gap-1.5">
                                <span className="text-primary text-xs">🎵</span>
                                {dict.guide.platformSupport.audioTip.title}
                            </p>
                            <div className="text-[10px] leading-relaxed text-muted-foreground space-y-1">
                                <p>{dict.guide.platformSupport.audioTip.steps}</p>
                                <p>{dict.guide.platformSupport.audioTip.warning}</p>
                            </div>
                        </div>
                    )}

                    <div className="text-center text-sm text-muted-foreground pt-2 border-t">
                        {dict.guide.platformSupport.comingSoon}
                    </div>
                </CardContent>
            </Card>

            {/* URL格式说明 */}
            <Card className="order-3">
                <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Link className="h-5 w-5 text-primary" />
                        {dict.guide.linkFormats.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                    <div>
                        <p className="font-medium mb-2">{dict.guide.linkFormats.bilibili.title}</p>
                        <div className="bg-muted p-3 rounded-md space-y-1 text-sm font-mono">
                            {dict.guide.linkFormats.bilibili.examples.map((example, index) => (
                                <p key={index}>{example}</p>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="font-medium mb-2">{dict.guide.linkFormats.douyin.title}</p>
                        <div className="bg-muted p-3 rounded-md space-y-1 text-sm font-mono">
                            {dict.guide.linkFormats.douyin.examples.map((example, index) => (
                                <p key={index}>{example}</p>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                        <div className="text-blue-500 mt-0.5">💡</div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            {dict.guide.linkFormats.tip}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 
