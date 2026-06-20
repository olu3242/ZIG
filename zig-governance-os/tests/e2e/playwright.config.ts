import { defineConfig } from "@playwright/test";

/**
 * Minimal Playwright config for the learning workflow E2E spec. This is not
 * wired into a CI job in this change set — running it requires a live (or
 * locally proxied) Supabase project with NEXT_PUBLIC_SUPABASE_URL,
 * NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY set, plus the
 * Next.js dev server started separately (`npm run dev --workspace web`).
 * See docs/certification/LEARNING_WORKFLOW_CERTIFICATION.md for the honest
 * status of this test (written and reviewed, not executed against a live
 * Supabase instance in this environment).
 */
export default defineConfig({
  testDir: ".",
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    headless: true,
  },
});
