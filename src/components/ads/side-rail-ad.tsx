'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ADSENSE_CLIENT_ID, AD_MIN_HEIGHT } from '@/lib/constants';

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
  const pathname = usePathname();

  useEffect(() => {
    if (initializedRef.current || !adRef.current) {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      initializedRef.current = true;
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, [slot, pathname]);

  return (
    <div className={cn('w-full', className)} style={{ minHeight: `${AD_MIN_HEIGHT}px` }}>
      <ins
        ref={adRef}
        className="adsbygoogle block"
        style={{ display: 'block', width: '100%', minHeight: `${AD_MIN_HEIGHT}px` }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-ad-test={process.env.NODE_ENV === 'development' ? 'on' : undefined}
        data-full-width-responsive="true"
      />
    </div>
  );
}
