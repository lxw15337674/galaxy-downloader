import { cloudflare } from "@cloudflare/vite-plugin";
import { serwist } from "@serwist/vite";
import vinext from "vinext";
import { defineConfig, type ResolvedConfig } from "vite";
import { fileURLToPath } from "node:url";


export default defineConfig({
  resolve: {
    alias: {
      "next-intl/config": fileURLToPath(new URL("./src/i18n/request.ts", import.meta.url)),
    },
  },
  plugins: [
    vinext(),
    ...cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }),
    ...serwist({
      swSrc: "src/sw.ts",
      swDest: "client/sw.js",
      globDirectory: "dist/client",
      globPatterns: [
        "assets/**/*.{js,css}",
        "icons/**/*.{png}",
        "og/**/*.{png}",
        "*.{html,ico,svg,txt}",
      ],
      globIgnores: ["sw.js", "workbox-*.js", "worker-*.js"],
      injectionPoint: "self.__SW_MANIFEST",
      rollupFormat: "iife",
    }),
  ],
});
