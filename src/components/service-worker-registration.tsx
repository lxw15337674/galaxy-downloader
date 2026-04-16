'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
    useEffect(() => {
        if (!('serviceWorker' in navigator)) {
            return
        }

        let cancelled = false

        const unregisterServiceWorkers = async () => {
            const registrations = await navigator.serviceWorker.getRegistrations()
            await Promise.all(registrations.map((registration) => registration.unregister()))
        }

        if (process.env.NODE_ENV !== 'production') {
            void unregisterServiceWorkers()
            return
        }

        const registerServiceWorker = async () => {
            const { Serwist } = await import('@serwist/window')
            if (cancelled) return

            const serwist = new Serwist('/sw.js', {
                scope: '/',
                type: 'classic',
            })

            serwist.addEventListener('waiting', () => {
                serwist.addEventListener('controlling', () => {
                    window.location.reload()
                })
                serwist.messageSkipWaiting()
            })

            void serwist.register()
        }

        void registerServiceWorker()

        return () => {
            cancelled = true
        }
    }, [])

    return null
}
