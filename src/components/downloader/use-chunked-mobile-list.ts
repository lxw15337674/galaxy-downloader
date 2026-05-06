import { useState } from 'react';

import { useIsMobileViewport } from './use-mobile-viewport';

export const DEFAULT_VISIBLE_PARTS = 100;
export const LOAD_MORE_BATCH = 100;

export function useChunkedMobileList<T>(
    items: T[],
    minimumVisibleCount: number = DEFAULT_VISIBLE_PARTS
) {
    const isMobile = useIsMobileViewport();
    const [mobileVisibleCount, setMobileVisibleCount] = useState(minimumVisibleCount);
    const visibleCount = isMobile
        ? Math.min(items.length, mobileVisibleCount)
        : items.length;
    const visibleItems = items.slice(0, visibleCount);
    const remainingCount = Math.max(0, items.length - visibleCount);
    const canCollapseMobile = isMobile
        && visibleCount >= items.length
        && items.length > minimumVisibleCount;

    const loadMore = () => {
        setMobileVisibleCount((previous) => Math.min(items.length, previous + LOAD_MORE_BATCH));
    };

    const collapse = () => {
        setMobileVisibleCount(minimumVisibleCount);
    };

    return {
        canCollapseMobile,
        collapse,
        isMobile,
        loadMore,
        minimumVisibleCount,
        remainingCount,
        setMobileVisibleCount,
        visibleItems,
    };
}
