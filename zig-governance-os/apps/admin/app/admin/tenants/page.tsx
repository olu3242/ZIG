import { requirePlatformOwner } from "../guard";
import { loadPlatformTenants } from "../../lib/platform-data";

export default async function AdminTenantsPage() {
  await requirePlatformOwner();
  const tenants = await loadPlatformTenants();

  return (
    <main className="mx-auto grid max-w-6xl gap-6 p-8">
      <h1 className="text-3xl font-semibold">Tenant Registry</h1>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">Tenant</th>
            <th className="py-2">Slug</th>
            <th className="py-2">Status</th>
            <th className="py-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant) => (
            <tr key={tenant.id} className="border-b">
              <td className="py-2 font-medium">{tenant.name}</td>
              <td className="py-2">{tenant.slug}</td>
              <td className="py-2">{tenant.status}</td>
              <td className="py-2">{new Date(tenant.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
