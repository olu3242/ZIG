import { requirePlatformOwner } from "../guard";

export default async function AdminRuntimePage() {
  await requirePlatformOwner();
  return <main className="p-8"><h1 className="text-3xl font-semibold">Runtime Operations</h1></main>;
}
