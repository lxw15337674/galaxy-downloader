'use client';
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
  return (
    <div className={className}>
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1581472267398547"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
