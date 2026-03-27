import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/types';
import { PlatformSupportGrid } from './PlatformSupportGrid';

interface PlatformGuideCardProps {
    dict: Pick<Dictionary, 'guide'>;
}

export function PlatformGuideCard({ dict }: PlatformGuideCardProps) {
    return (
        <Card>
            <CardHeader className="p-4 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="h-4 w-4 text-primary" />
                    {dict.guide.platformSupport.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <PlatformSupportGrid dict={dict} />
            </CardContent>
        </Card>
    );
} 
