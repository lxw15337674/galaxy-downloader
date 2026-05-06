import { useState } from 'react';

import { downloadFile } from '@/lib/utils';

export function useTemporaryDownloadKeys() {
    const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());

    const triggerDownload = (url: string, key: string) => {
        setLoadingKeys((previous) => new Set(previous).add(key));
        downloadFile(url);
        setTimeout(() => {
            setLoadingKeys((previous) => {
                const next = new Set(previous);
                next.delete(key);
                return next;
            });
        }, 1500);
    };

    return { loadingKeys, triggerDownload };
}
