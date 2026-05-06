import type { NextRequest } from 'next/server';

import { proxyUpstreamApi } from '@/lib/upstream-api-proxy';

export function makeUpstreamApiProxy(pathname: string) {
    return function proxyRoute(request: NextRequest): Promise<Response> {
        return proxyUpstreamApi(request, pathname);
    };
}
