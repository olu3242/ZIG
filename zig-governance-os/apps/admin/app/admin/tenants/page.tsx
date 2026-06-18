import { requirePlatformOwner } from "../guard";

export default async function AdminTenantsPage() {
  await requirePlatformOwner();
  return <main className="p-8"><h1 className="text-3xl font-semibold">Tenant Registry</h1></main>;
}
