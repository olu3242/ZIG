import Link from "next/link";
import { requireSession } from "@/app/lib/auth";

export default async function CompletePage() {
  await requireSession();
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-3xl place-items-center">
        <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center shadow-2xl backdrop-blur-xl">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-emerald-300">Workspace Ready</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Your Learning OS is configured.</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Zig has assigned your starter path, framework recommendations, labs, certifications, and roadmap.
          </p>
          <Link href="/dashboard" className="mt-8 inline-flex w-full justify-center rounded-xl border border-blue-400/40 bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400">
            Enter Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
