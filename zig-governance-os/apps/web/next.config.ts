import type { NextConfig } from "next";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  turbopack: {
    root: repoRoot,
  },
  transpilePackages: [
    "@zig/types",
    "@zig/data-access",
    "@zig/services",
    "@zig/framework-engine",
    "@zig/governance-engine",
    "@zig/ui",
  ],
};

export default nextConfig;
