import type { MetadataRoute } from "next";

import { getDictionary } from "@/lib/i18n";
import { type Locale, i18n } from "@/lib/i18n/config";

const SHORT_NAME_BY_LOCALE: Record<Locale, string> = {
  zh: "媒体下载器",
  "zh-tw": "媒體下載器",
  en: "UM Downloader",
};

const LANGUAGE_TAG_BY_LOCALE: Record<Locale, string> = {
  zh: "zh-CN",
  "zh-tw": "zh-TW",
  en: "en",
};

export default async function manifest({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<MetadataRoute.Manifest> {
  const { locale } = await params;
  const normalizedLocale = i18n.locales.includes(locale) ? locale : i18n.defaultLocale;
  const dict = await getDictionary(normalizedLocale);
  const localeBasePath = `/${normalizedLocale}`;

  return {
    name: dict.metadata.siteName,
    short_name: SHORT_NAME_BY_LOCALE[normalizedLocale],
    description: dict.unified.pageDescription,
    lang: LANGUAGE_TAG_BY_LOCALE[normalizedLocale],
    id: "/",
    start_url: localeBasePath,
    scope: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
