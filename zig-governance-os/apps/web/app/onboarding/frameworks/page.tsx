import { frameworksSetupAction } from "@/app/onboarding/actions";
import { requireSession } from "@/app/lib/auth";

const frameworks = ["NIST CSF", "NIST RMF", "ISO 27001", "SOC 2", "COBIT", "CIS Controls", "HIPAA", "PCI DSS", "HITRUST", "FedRAMP", "GDPR"];

export default async function FrameworksPage() {
  await requireSession();
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-blue-300">Step 4 / Frameworks</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Select your GRC interests</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">Choose the frameworks you want Zig to prioritize in your learning path.</p>
        <form action={frameworksSetupAction} className="mt-8 grid gap-3 md:grid-cols-2">
          {frameworks.map((label) => (
            <label key={label} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 text-sm font-semibold transition hover:border-blue-400">
              <input className="mr-3" type="checkbox" name="frameworks" value={label.toLowerCase().replaceAll(" ", "_")} />
              {label}
            </label>
          ))}
          <button className="mt-3 rounded-xl border border-blue-400/40 bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 md:col-span-2">Continue</button>
        </form>
      </section>
    </main>
  );
}
