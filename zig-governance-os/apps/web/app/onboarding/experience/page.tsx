import { experienceSetupAction } from "@/app/onboarding/actions";
import { requireSession } from "@/app/lib/auth";

const personas = ["Student", "Career Changer", "IT Professional", "Auditor", "Compliance Professional", "Risk Manager", "Security Professional"];

export default async function ExperiencePage() {
  await requireSession();
  return (
    <OnboardingShell eyebrow="Step 3 / Experience" title="Choose your experience track" description="Zig uses this to assign the right starter path and practice work.">
      <form action={experienceSetupAction} className="grid gap-3">
        {personas.map((persona) => (
          <label key={persona} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm font-semibold transition hover:border-blue-400">
            <input className="mr-3" type="radio" name="persona" value={persona} required />
            {persona}
          </label>
        ))}
        <button className="mt-3 rounded-xl border border-blue-400/40 bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400">Continue</button>
      </form>
    </OnboardingShell>
  );
}

function OnboardingShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-blue-300">{eyebrow}</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}
