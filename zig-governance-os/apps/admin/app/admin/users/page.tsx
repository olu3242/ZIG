import { requirePlatformOwner } from "../guard";

export default async function AdminUsersPage() {
  await requirePlatformOwner();
  return <main className="p-8"><h1 className="text-3xl font-semibold">User Registry</h1></main>;
}
