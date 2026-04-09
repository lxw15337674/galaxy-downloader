import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    cacheComponents: true,
    reactCompiler: true,
    experimental: {
        optimizePackageImports: [
            'lucide-react',
            'sonner',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
        ],
    },
};

function isVinextRuntime(): boolean {
    const lifecycleScript = process.env.npm_lifecycle_script ?? "";
    return /\bvinext\b/.test(lifecycleScript)
        || process.argv.some((arg) => arg.toLowerCase().includes("vinext"));
}

export default async function createConfig(): Promise<NextConfig> {
    if (isVinextRuntime()) {
        return nextConfig;
    }

    const [
        { default: withSerwistInit },
        { default: createNextIntlPlugin },
    ] = await Promise.all([
        import("@serwist/next"),
        import("next-intl/plugin"),
    ]);

    const withSerwist = withSerwistInit({
        swSrc: "src/sw.ts",
        swDest: "public/sw.js",
        disable: process.env.NODE_ENV === "development",
    });
    const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

    return withSerwist(withNextIntl(nextConfig));
}
