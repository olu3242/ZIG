import { requirePlatformOwner } from "../guard";

export default async function AdminAuditPage() {
  await requirePlatformOwner();
  return <main className="p-8"><h1 className="text-3xl font-semibold">Audit Events</h1></main>;
}
