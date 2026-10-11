// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://launch.jammaru.com",
  output: "static",
  session: false,
  devToolbar: { enabled: false },
  adapter: cloudflare({
    imageService: "compile",
    prerenderEnvironment: "node",
  }),
  integrations: [sitemap()],
  i18n: {
    defaultLocale: "ja",
    locales: ["ja", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
