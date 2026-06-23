import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type CheckStatus = "PASS" | "FAIL" | "WARNING";

interface CheckResult {
  status: CheckStatus;
  object: string;
  detail: string;
}

const requiredTables = [
  "profiles",
  "auth_events",
  "tenants",
  "users",
  "organizations",
  "organization_members",
  "roles",
  "permissions",
  "role_permissions",
  "projects",
  "project_frameworks",
  "frameworks",
  "controls",
  "assessments",
  "learning_paths",
  "learning_modules",
  "lessons",
  "user_progress",
  "scenarios",
  "scenario_runs",
  "artifacts",
  "audit_events",
] as const;

const compatibilityObjects = ["modules", "simulations", "simulation_runs", "activity_log"] as const;
const requiredFunctions = ["current_tenant_id", "bootstrap_new_user", "set_updated_at"] as const;
const requiredSeeds = ["Admin", "Instructor", "Learner", "Auditor", "Manager", "NIST CSF", "ISO 27001", "SOC 2", "HIPAA", "PCI DSS"] as const;

async function main() {
  const root = process.cwd();
  const migrationPath = join(root, "supabase", "migrations", "ZZZ_mvp_core_platform_recovery.sql");
  const seedPath = join(root, "supabase", "seed", "mvp_seed.sql");
  const envPath = join(root, ".env.local");
  const results: CheckResult[] = [];

  const migration = readIfExists(migrationPath);
  const seed = readIfExists(seedPath);

  results.push({
    status: migration ? "PASS" : "FAIL",
    object: "recovery migration",
    detail: migration ? "supabase/migrations/ZZZ_mvp_core_platform_recovery.sql exists." : "Recovery migration is missing.",
  });

  for (const table of requiredTables) {
    results.push(sqlContains(migration, `create table if not exists ${table}`, `table:${table}`));
  }

  for (const view of compatibilityObjects) {
    results.push(sqlContains(migration, `view ${view}`, `compatibility:${view}`));
  }

  for (const fn of requiredFunctions) {
    results.push(sqlContains(migration, `function ${fn}`, `function:${fn}`));
  }

  for (const seedValue of requiredSeeds) {
    results.push({
      status: seed.includes(seedValue) ? "PASS" : "FAIL",
      object: `seed:${seedValue}`,
      detail: seed.includes(seedValue) ? "Seed value present." : "Seed value missing from supabase/seed/mvp_seed.sql.",
    });
  }

  const env = parseEnv(readIfExists(envPath));
  if (env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    const restResults = await verifyRestTables(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, requiredTables);
    results.push(...restResults);
  } else {
    results.push({
      status: "WARNING",
      object: "supabase runtime",
      detail: "Skipped REST verification because NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.",
    });
  }

  for (const result of results) {
    console.log(`${result.status.padEnd(7)} ${result.object.padEnd(34)} ${result.detail}`);
  }

  if (results.some((result) => result.status === "FAIL")) {
    process.exitCode = 1;
  }
}

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
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

function sqlContains(source: string, needle: string, object: string): CheckResult {
  const found = source.toLowerCase().includes(needle.toLowerCase());
  return {
    status: found ? "PASS" : "FAIL",
    object,
    detail: found ? "Declared in recovery migration." : `Missing declaration containing "${needle}".`,
  };
}

async function verifyRestTables(url: string, serviceRoleKey: string, tables: readonly string[]): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  for (const table of tables) {
    try {
      const response = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });
      const text = await response.text();
      const missing = response.status === 404 || /Could not find the table|PGRST205|relation .* does not exist/i.test(text);
      results.push({
        status: missing ? "FAIL" : "PASS",
        object: `rest:${table}`,
        detail: missing ? `Supabase REST returned ${response.status}; table is not exposed.` : `Supabase REST returned ${response.status}.`,
      });
    } catch (error) {
      results.push({
        status: "WARNING",
        object: `rest:${table}`,
        detail: error instanceof Error ? error.message : "Unknown REST probe error.",
      });
    }
  }

  return results;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
