import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import createNextIntlPlugin from "next-intl/plugin";

const lifecycleScript = process.env.npm_lifecycle_script ?? "";
const isVinextRuntime =
    /\bvinext\b/.test(lifecycleScript) ||
    process.argv.some((arg) => arg.toLowerCase().includes("vinext"));

const withSerwist = withSerwistInit({
    swSrc: "src/sw.ts",
    swDest: "public/sw.js",
    disable: process.env.NODE_ENV === "development",
});
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

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

const intlConfig = withNextIntl(nextConfig);

export default isVinextRuntime ? nextConfig : withSerwist(intlConfig);
