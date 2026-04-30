import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Check, Info } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n/types';

interface FreeSupportCardProps {
    dict: Pick<Dictionary, 'freeSupport'>;
}

export function FreeSupportCard({ dict }: FreeSupportCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="h-5 w-5 text-primary" />
                    {dict.freeSupport.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{dict.freeSupport.features.freeToUse}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{dict.freeSupport.features.noRegistration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{dict.freeSupport.features.unlimitedDownloads}</span>
                    </div>
                </div>

                <div className="pt-2 border-t">
                    <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-foreground/75">
                            <p>{dict.freeSupport.revenue.adsSupport}</p>
                            <p>{dict.freeSupport.revenue.serverCosts}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 
