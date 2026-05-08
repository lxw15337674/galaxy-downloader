import { cloudflare } from "@cloudflare/vite-plugin";
import { serwist } from "@serwist/vite";
import vinext from "vinext";
import { defineConfig, type Plugin, type ResolvedConfig } from "vite";
import { fileURLToPath } from "node:url";

function normalizeTreeshakePreset(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const config = value as Record<string, unknown>;

  if (typeof config.preset !== "string") {
    return value;
  }

  const { preset, ...rest } = config;
  return Object.keys(rest).length > 0 ? rest : preset;
}

function normalizeVinextTreeshakePlugin(): Plugin {
  return {
    name: "app:normalize-vinext-treeshake",
    configResolved(config: ResolvedConfig) {
      const normalizeRollupOptions = (rollupOptions?: Record<string, unknown>) => {
        if (!rollupOptions) {
          return;
        }

        rollupOptions.treeshake = normalizeTreeshakePreset(rollupOptions.treeshake);
      };

      normalizeRollupOptions(config.build?.rollupOptions as Record<string, unknown> | undefined);

      for (const environment of Object.values((config as ResolvedConfig & {
        environments?: Record<string, { build?: { rollupOptions?: Record<string, unknown> } }>;
      }).environments ?? {})) {
        normalizeRollupOptions(environment.build?.rollupOptions);
      }
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const enableSerwist = command === "build" && mode === "production";

  return {
    optimizeDeps: {
      exclude: ["lucide-react", "next-intl"],
    },
    ssr: {
      optimizeDeps: {
        exclude: ["lucide-react", "next-intl"],
      },
    },
    resolve: {
      alias: {
        "next-intl/config": fileURLToPath(new URL("./src/i18n/request.ts", import.meta.url)),
      },
    },
    plugins: [
      vinext(),
      normalizeVinextTreeshakePlugin(),
      ...cloudflare({
        inspectorPort: false,
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
      }),
      ...(enableSerwist
        ? serwist({
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
          })
        : []),
    ],
  };
});
