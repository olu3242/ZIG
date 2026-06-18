import { requirePlatformOwner } from "../guard";
import { loadPlatformUsers } from "../../lib/platform-data";

export default async function AdminUsersPage() {
  await requirePlatformOwner();
  const users = await loadPlatformUsers();

  return (
    <main className="mx-auto grid max-w-6xl gap-6 p-8">
      <h1 className="text-3xl font-semibold">User Registry</h1>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">Email</th>
            <th className="py-2">Role</th>
            <th className="py-2">Persona</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="py-2 font-medium">{user.email}</td>
              <td className="py-2">{user.role}</td>
              <td className="py-2">{user.persona}</td>
              <td className="py-2">{user.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
