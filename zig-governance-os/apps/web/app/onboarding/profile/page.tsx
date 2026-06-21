import { requireSession } from "@/app/lib/auth";
import { profileSetupAction } from "@/app/onboarding/actions";

export default async function OnboardingProfilePage() {
  const session = await requireSession();
  const localName = session.email.split("@")[0]?.replace(/[._-]/g, " ") ?? "";

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-blue-300">Step 1 / Profile</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Create your Zig profile</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">This identifies you across learning, labs, frameworks, and portfolio work.</p>

        <form action={profileSetupAction} className="mt-8 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="First name" name="firstName" defaultValue={titleCase(localName.split(" ")[0] ?? "")} required />
            <Field label="Last name" name="lastName" required />
          </div>
          <Field label="Display name" name="displayName" defaultValue={titleCase(localName)} />
          <Field label="Profile picture URL" name="avatarUrl" />
          <button className="mt-2 rounded-xl border border-blue-400/40 bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400">
            Continue
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({ label, name, defaultValue, required = false }: { label: string; name: string; defaultValue?: string; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-200">
      <span>{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-400 focus:shadow-lg focus:shadow-blue-500/10"
      />
    </label>
  );
}

function titleCase(value: string): string {
  return value.split(" ").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
