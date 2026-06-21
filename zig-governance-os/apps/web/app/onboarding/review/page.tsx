import { completeOnboardingAction } from "@/app/onboarding/actions";
import { requireSession } from "@/app/lib/auth";

export default async function ReviewPage() {
  const session = await requireSession();
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-blue-300">Step 6 / Assignment</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Generate your learning workspace</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Zig will assign a starter learning path, framework recommendations, labs, certifications, and a career roadmap for {session.email}.
        </p>
        <form action={completeOnboardingAction} className="mt-8">
          <button className="w-full rounded-xl border border-blue-400/40 bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400">
            Complete Setup
          </button>
        </form>
      </section>
    </main>
  );
}
