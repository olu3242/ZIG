import { readFileSync } from "node:fs";
import { join } from "node:path";

interface Probe {
  name: string;
  status: "PASS" | "FAIL" | "WARNING";
  detail: string;
}

const expectedRestObjects = ["profiles", "auth_events", "organizations", "organization_memberships", "roles"] as const;

async function main() {
  const env = parseEnv(readFileSync(join(process.cwd(), ".env.local"), "utf8"));
  const baseUrl = env.AUTH_VERIFY_BASE_URL ?? "http://localhost:3001";
  const probes: Probe[] = [];

  probes.push(...await probeRoutes(baseUrl));

  if (env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    probes.push(...await probeSupabase(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY));
  } else {
    probes.push({ name: "supabase-env", status: "WARNING", detail: "Missing Supabase URL or service role key." });
  }

  for (const probe of probes) {
    console.log(`${probe.status.padEnd(7)} ${probe.name.padEnd(28)} ${probe.detail}`);
  }

  if (probes.some((probe) => probe.status === "FAIL")) {
    process.exitCode = 1;
  }
}

async function probeRoutes(baseUrl: string): Promise<Probe[]> {
  const routes = ["/login", "/forgot-password", "/dashboard"];
  const probes: Probe[] = [];

  for (const route of routes) {
    try {
      const response = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
      const expected =
        route === "/dashboard"
          ? response.status >= 300 && response.status < 400 && response.headers.get("location")?.includes("/login")
          : response.status >= 200 && response.status < 400;

      probes.push({
        name: `route:${route}`,
        status: expected ? "PASS" : "FAIL",
        detail: `HTTP ${response.status}${response.headers.get("location") ? ` -> ${response.headers.get("location")}` : ""}`,
      });
    } catch (error) {
      probes.push({
        name: `route:${route}`,
        status: "WARNING",
        detail: error instanceof Error ? error.message : "Route probe failed.",
      });
    }
  }

  return probes;
}

async function probeSupabase(url: string, serviceRoleKey: string): Promise<Probe[]> {
  const probes: Probe[] = [];

  for (const objectName of expectedRestObjects) {
    try {
      const response = await fetch(`${url}/rest/v1/${objectName}?select=*&limit=1`, {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });
      const text = await response.text();
      const missing = response.status === 404 || /Could not find the table|PGRST205|relation .* does not exist/i.test(text);
      probes.push({
        name: `rest:${objectName}`,
        status: missing ? "FAIL" : "PASS",
        detail: `HTTP ${response.status}`,
      });
    } catch (error) {
      probes.push({
        name: `rest:${objectName}`,
        status: "WARNING",
        detail: error instanceof Error ? error.message : "REST probe failed.",
      });
    }
  }

  return probes;
}

function parseEnv(source: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#=]+)=(.*)$/);
    if (!match) {
      continue;
    }
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
