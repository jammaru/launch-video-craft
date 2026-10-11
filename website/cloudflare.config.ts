import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "launch-video-craft",
    compatibilityDate: "2026-10-12",
    domains: ["launch.jammaru.com"],
    assets: {
      notFoundHandling: "404-page",
    },
  },
});
