// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { execFileSync } from "node:child_process";
import type { Plugin } from "vite";

/**
 * Werkt changelog en zichtbare versies automatisch bij aan het begin van iedere build.
 * Zo staan wijzigingen, website, iconen en startschermen altijd actueel in de app.
 */
function changelogAutoPlugin(): Plugin {
  let gedaan = false;
  return {
    name: "changelog-auto",
    apply: "build",
    buildStart() {
      if (gedaan) return;
      gedaan = true;
      try {
        const uit = execFileSync(process.execPath, ["scripts/changelog-auto.mjs"], {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
        console.log(uit.trim());
        const versies = execFileSync(process.execPath, ["scripts/bump-assets.mjs"], {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
        console.log(versies.trim());
      } catch (e) {
        console.warn("changelog: automatisch bijwerken overgeslagen", (e as Error).message);
      }
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [changelogAutoPlugin()],
  },
});
