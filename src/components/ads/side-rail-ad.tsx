'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  ADSENSE_CLIENT_ID, 
  AD_LOAD_TIMEOUT, 
  AD_CHECK_INTERVAL, 
  AD_MAX_CHECKS,
  AD_MIN_HEIGHT 
} from '@/lib/constants';

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
  const [shouldHide, setShouldHide] = useState(false);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalsRef = useRef<NodeJS.Timeout[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    let retryCount = 0;
    const maxRetries = 20;
    const retryDelayMs = 300;

    // 清理所有定时器
    const clearAllTimers = () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
        checkTimeoutRef.current = null;
      }
      checkIntervalsRef.current.forEach(timer => clearTimeout(timer));
      checkIntervalsRef.current = [];
    };

    const tryInitAd = () => {
      if (cancelled || initializedRef.current || !adRef.current) {
        return;
      }

      const adsQueue = window.adsbygoogle;
      if (!Array.isArray(adsQueue)) {
        if (retryCount < maxRetries) {
          retryCount += 1;
          const timer = setTimeout(tryInitAd, retryDelayMs);
          checkIntervalsRef.current.push(timer);
        }
        return;
      }

      try {
        adsQueue.push({});
        initializedRef.current = true;
        
        // 开始定期检查广告是否成功填充
        let checkCount = 0;
        
        const checkRendered = () => {
          if (cancelled) return;
          
          const el = adRef.current;
          checkCount++;
          
          // 更精确的状态检测：检查高度和AdSense状态
          const adStatus = el?.getAttribute('data-adsbygoogle-status');
          const adFilled = el?.getAttribute('data-ad-status');
          const hasHeight = el && el.offsetHeight > 0;
          
          if (hasHeight || adStatus === 'done' || adFilled === 'filled') {
            // 广告成功加载，保持显示
            setShouldHide(false);
            clearAllTimers();
            return;
          }
          
          // 如果还没达到最大检查次数，继续检查
          if (checkCount < AD_MAX_CHECKS) {
            const timer = setTimeout(checkRendered, AD_CHECK_INTERVAL);
            checkIntervalsRef.current.push(timer);
          } else {
            // 超时仍未加载，隐藏广告位
            setShouldHide(true);
          }
        };
        
        const initialTimer = setTimeout(checkRendered, AD_CHECK_INTERVAL);
        checkIntervalsRef.current.push(initialTimer);
        
        // 设置最终超时保护
        checkTimeoutRef.current = setTimeout(() => {
          if (cancelled) return;
          const el = adRef.current;
          const adStatus = el?.getAttribute('data-adsbygoogle-status');
          if (!el || (el.offsetHeight === 0 && adStatus !== 'done')) {
            setShouldHide(true);
          }
        }, AD_LOAD_TIMEOUT);
        
      } catch {
        if (retryCount < maxRetries) {
          retryCount += 1;
          const timer = setTimeout(tryInitAd, retryDelayMs);
          checkIntervalsRef.current.push(timer);
        } else {
          // 重试失败，隐藏广告位
          setShouldHide(true);
        }
      }
    };

    tryInitAd();

    return () => {
      cancelled = true;
      clearAllTimers();
    };
  }, [slot, pathname]); // 添加pathname依赖，路由变化时重新初始化

  return (
    <div className={cn('w-full', shouldHide && 'hidden', className)} style={{ minHeight: `${AD_MIN_HEIGHT}px` }}>
      <ins
        ref={adRef}
        className="adsbygoogle block"
        style={{ display: 'block', width: '100%', minHeight: `${AD_MIN_HEIGHT}px` }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
