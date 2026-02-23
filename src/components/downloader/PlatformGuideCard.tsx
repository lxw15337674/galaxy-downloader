import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/types';

interface PlatformGuideCardProps {
    dict: Dictionary;
}

export function PlatformGuideCard({ dict }: PlatformGuideCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="h-5 w-5 text-primary" />
                    {dict.guide.platformSupport.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* B站 */}
                <div className="flex items-start gap-2">
                    <span className="text-sm">✅</span>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{dict.guide.platformSupport.bilibili.name}</p>
                        <p className="text-xs text-muted-foreground">{dict.guide.platformSupport.bilibili.summary}</p>
                    </div>
                </div>

                {/* 抖音 */}
                <div className="flex items-start gap-2">
                    <span className="text-sm">✅</span>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{dict.guide.platformSupport.douyin.name}</p>
                        <p className="text-xs text-muted-foreground">{dict.guide.platformSupport.douyin.summary}</p>
                    </div>
                </div>

                {/* 小红书 */}
                <div className="flex items-start gap-2">
                    <span className="text-sm">✅</span>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{dict.guide.platformSupport.xiaohongshu.name}</p>
                        <p className="text-xs text-muted-foreground">{dict.guide.platformSupport.xiaohongshu.summary}</p>
                    </div>
                </div>

                {/* 更多平台预告 */}
                <div className="text-center text-xs text-muted-foreground pt-2 border-t">
                    {dict.guide.platformSupport.comingSoon}
                </div>
            </CardContent>
        </Card>
    );
} 