import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@zig/agent-audit",
    "@zig/agent-approvals",
    "@zig/agent-certification",
    "@zig/agent-control-tower",
    "@zig/agent-finops",
    "@zig/agent-alerting",
    "@zig/agent-chaos",
    "@zig/agent-costing",
    "@zig/agent-ingestion",
    "@zig/agent-ledger",
    "@zig/agent-registry",
    "@zig/agent-reliability",
    "@zig/agent-risk",
    "@zig/agent-scorecards",
    "@zig/agent-self-healing",
    "@zig/agent-telemetry",
    "@zig/model-telemetry",
    "@zig/supervisor-agents",
    "@zig/agents",
    "@zig/whitelabel",
    "@zig/billing",
    "@zig/automation",
    "@zig/integrations",
    "@zig/api",
    "@zig/frameworks",
  ],
};

export default nextConfig;
