import { requirePlatformOwner } from "../guard";
import { loadPlatformAuditEvents } from "../../lib/platform-data";

export default async function AdminAuditPage() {
  await requirePlatformOwner();
  const events = await loadPlatformAuditEvents();

  return (
    <main className="mx-auto grid max-w-6xl gap-6 p-8">
      <h1 className="text-3xl font-semibold">Audit Events</h1>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-2">Action</th>
            <th className="py-2">Entity</th>
            <th className="py-2">Reason</th>
            <th className="py-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-b">
              <td className="py-2 font-medium">{event.action}</td>
              <td className="py-2">{event.entityTable}</td>
              <td className="py-2">{event.reason ?? "System mutation"}</td>
              <td className="py-2">{new Date(event.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
