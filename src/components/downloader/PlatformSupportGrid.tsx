import type { Dictionary } from '@/lib/i18n/types';
import { getPlatformSupportItems } from './platform-support';

interface PlatformSupportGridProps {
    dict: Pick<Dictionary, 'guide'>;
}

export function PlatformSupportGrid({ dict }: PlatformSupportGridProps) {
    const items = getPlatformSupportItems(dict);

    return (
        <div className="space-y-2">
            <div className="space-y-0.5">
                {items.map((item) => (
                    <div
                        key={item.key}
                        className="flex items-center gap-2 border-b border-border/50 py-1 last:border-b-0"
                    >
                        <span
                            aria-hidden
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                        />
                        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                            <p className="shrink-0 text-sm font-medium leading-5">
                                {item.name}
                            </p>
                            <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap pb-0.5">
                                {item.features.map((feature) => (
                                    <span
                                        key={`${item.key}-${feature}`}
                                        className="inline-flex shrink-0 items-center rounded border border-border/50 px-1.5 py-0.5 text-xs leading-4 text-muted-foreground"
                                    >
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-1 text-center text-[11px] text-muted-foreground">
                {dict.guide.platformSupport.comingSoon}
            </div>
        </div>
    );
}
