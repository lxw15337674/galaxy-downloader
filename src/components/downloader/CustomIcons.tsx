import type { SVGProps } from 'react';

export function VideoDownloadIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M14 6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z" />
            <path d="m22 7-6 4 6 4V7Z" />
            <path d="M9 10v4" />
            <path d="m7 12 2 2 2-2" />
        </svg>
    );
}

export function AudioDownloadIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M9 18V5l9-2v13" />
            <circle cx="6" cy="18" r="3" />
            <path d="m15 13 3 3 3-3" />
        </svg>
    );
}
