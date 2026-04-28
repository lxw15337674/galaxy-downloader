import Image from 'next/image';
import type { Dictionary } from '@/lib/i18n/types';
import { cn } from '@/lib/utils';
import { getPlatformSupportItems } from './platform-support';

interface PlatformSupportGridProps {
    dict: Pick<Dictionary, 'guide'>;
}

export function PlatformSupportGrid({ dict }: PlatformSupportGridProps) {
    const items = getPlatformSupportItems(dict);

    return (
        <div className="space-y-1">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {items.map((item) => (
                    <div
                        key={item.key}
                        className="flex items-center gap-2 rounded-lg px-0.5 py-1"
                    >
                        <div
                            className={cn(
                                'relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md border',
                                item.visual.frameClassName,
                            )}
                        >
                            {item.visual.src && item.visual.darkSrc ? (
                                <>
                                    <Image
                                        src={item.visual.src}
                                        alt=""
                                        aria-hidden
                                        width={14}
                                        height={14}
                                        unoptimized
                                        className={cn(
                                            'h-3.5 w-3.5 object-contain dark:hidden',
                                            item.visual.iconClassName,
                                        )}
                                    />
                                    <Image
                                        src={item.visual.darkSrc}
                                        alt=""
                                        aria-hidden
                                        width={14}
                                        height={14}
                                        unoptimized
                                        className={cn(
                                            'hidden h-3.5 w-3.5 object-contain dark:block',
                                            item.visual.iconClassName,
                                        )}
                                    />
                                </>
                            ) : item.visual.src ? (
                                <Image
                                    src={item.visual.src}
                                    alt=""
                                    aria-hidden
                                    width={14}
                                    height={14}
                                    unoptimized
                                    className={cn(
                                        'h-3.5 w-3.5 object-contain',
                                        item.visual.iconClassName,
                                    )}
                                />
                            ) : (
                                <span className="text-[9px] font-semibold uppercase tracking-[0.02em] text-foreground/80">
                                    {item.visual.fallbackLabel || item.name.slice(0, 2)}
                                </span>
                            )}
                            {item.visual.badgeLabel ? (
                                <span
                                    className={cn(
                                        'absolute -right-1 -top-1 rounded-full px-1 py-0.5 text-[7px] font-semibold leading-none shadow-sm',
                                        item.visual.badgeClassName,
                                    )}
                                >
                                    {item.visual.badgeLabel}
                                </span>
                            ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-semibold leading-4 text-foreground">
                                {item.name}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-0.5 text-center text-[10px] text-muted-foreground">
                {dict.guide.platformSupport.comingSoon}
            </div>
        </div>
    );
}
