import { requireSession } from "@/app/lib/auth";
import { organizationSetupAction } from "@/app/onboarding/actions";

export default async function OnboardingOrganizationPage() {
  const session = await requireSession();
  const firstName = titleCase(session.email.split("@")[0]?.split(/[._-]/)[0] ?? "Zig");

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-blue-300">Step 2 / Workspace</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Set up your workspace</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">Your workspace keeps learning, practice artifacts, and recommendations together.</p>

        <form action={organizationSetupAction} className="mt-8 grid gap-5">
          <label className="grid gap-2 text-sm font-medium text-zinc-200">
            <span>Workspace name</span>
            <input
              name="workspaceName"
              defaultValue={`${firstName}'s Workspace`}
              required
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-400 focus:shadow-lg focus:shadow-blue-500/10"
            />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <Choice name="workspaceType" value="personal" title="Personal Learning Workspace" detail="Best for students, career changers, and solo practice." />
            <Choice name="workspaceType" value="company" title="Company Workspace" detail="Best for practicing in a business or team context." />
          </div>
          <button className="rounded-xl border border-blue-400/40 bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400">
            Continue
          </button>
        </form>
      </section>
    </main>
  );
}

function Choice({ name, value, title, detail }: { name: string; value: string; title: string; detail: string }) {
  return (
    <label className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 transition hover:border-blue-400">
      <input className="mr-3" type="radio" name={name} value={value} required defaultChecked={value === "personal"} />
      <span className="font-semibold text-white">{title}</span>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{detail}</p>
    </label>
  );
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
