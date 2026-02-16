'use client';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface SideRailAdProps {
  slot: string;
  className?: string;
}

export function SideRailAd({ slot, className }: SideRailAdProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let retryCount = 0;
    const maxRetries = 20;
    const retryDelayMs = 300;

    const tryInitAd = () => {
      if (cancelled || initializedRef.current || !adRef.current) {
        return;
      }

      const adsQueue = window.adsbygoogle;
      if (!Array.isArray(adsQueue)) {
        if (retryCount < maxRetries) {
          retryCount += 1;
          window.setTimeout(tryInitAd, retryDelayMs);
        }
        return;
      }

      try {
        adsQueue.push({});
        initializedRef.current = true;
      } catch {
        if (retryCount < maxRetries) {
          retryCount += 1;
          window.setTimeout(tryInitAd, retryDelayMs);
        }
      }
    };

    tryInitAd();

    return () => {
      cancelled = true;
    };
  }, [slot]);

  return (
    <div className={cn('w-full min-h-[120px]', className)}>
      <ins
        ref={adRef}
        className="adsbygoogle block"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-1581472267398547"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
