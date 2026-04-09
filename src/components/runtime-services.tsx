'use client'

import { DeferredAdSenseScript } from '@/components/deferred-adsense-script'
import { DeferredGoogleAnalyticsScript } from '@/components/deferred-google-analytics-script'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'
import { WebVitalsTracker } from '@/components/web-vitals-tracker'

export function RuntimeServices() {
    return (
        <>
            <ServiceWorkerRegistration />
            <DeferredAdSenseScript />
            <DeferredGoogleAnalyticsScript />
            <WebVitalsTracker />
        </>
    )
}
