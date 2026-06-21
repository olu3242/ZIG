import { careerGoalsSetupAction } from "@/app/onboarding/actions";
import { requireSession } from "@/app/lib/auth";

const goals = [
  ["get_first_grc_job", "Get First GRC Job"],
  ["transition_grc", "Transition Into GRC"],
  ["governance", "Governance"],
  ["risk", "Risk Management"],
  ["compliance", "Compliance"],
  ["audit", "Audit"],
  ["security", "Security"],
  ["vendor_risk", "Vendor Risk"],
  ["privacy", "Privacy"],
];

export default async function CareerGoalsPage() {
  await requireSession();
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-blue-300">Step 5 / Career Goals</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Tell Zig where you are headed</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">Your dashboard and recommendations will be tuned around these outcomes.</p>
        <form action={careerGoalsSetupAction} className="mt-8 grid gap-3 md:grid-cols-2">
          {goals.map(([value, label]) => (
            <label key={value} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm font-semibold transition hover:border-blue-400">
              <input className="mr-3" type="checkbox" name="goals" value={value} />
              {label}
            </label>
          ))}
          <button className="mt-3 rounded-xl border border-blue-400/40 bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 md:col-span-2">Review Setup</button>
        </form>
      </section>
    </main>
  );
}
