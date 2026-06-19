import Link from "next/link";
import { requirePlatformOwner } from "../guard";

const links = [
  "/admin/tenants",
  "/admin/users",
  "/admin/runtime",
  "/admin/platform/auth",
  "/admin/audit",
  "/admin/billing",
  "/admin/automation",
  "/admin/integrations",
  "/admin/api",
  "/admin/agent-control-tower",
  "/admin/agent-soc",
];

export default async function AdminDashboardPage() {
  await requirePlatformOwner();
  return (
    <main className="mx-auto grid max-w-5xl gap-6 p-8">
      <h1 className="text-3xl font-semibold">Platform Owner Dashboard</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {links.map((href) => <Link key={href} className="rounded border p-4" href={href}>{href}</Link>)}
      </div>
    </main>
  );
}
