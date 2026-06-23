import Link from "next/link";
import { getAuthSuccessState } from "@/src/lib/auth/success-state";

export default async function AuthSuccessPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const state = await getAuthSuccessState(params.next);

  const checks = [
    ["Email verified", true],
    ["Session active", state.sessionExists],
    ["Profile exists", state.profileExists],
    ["Organization exists", state.organizationExists],
    ["Membership exists", state.membershipExists],
  ] as const;

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-3xl place-items-center">
        <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-emerald-300">Authentication / Success</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Your Zig account is verified.</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Zig confirmed the callback and is checking the workspace bootstrap before continuing setup.
          </p>

          <div className="mt-6 grid gap-3">
            {checks.map(([label, ok]) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3">
                <span className="text-sm text-zinc-300">{label}</span>
                <span className={`font-mono text-xs uppercase ${ok ? "text-emerald-300" : "text-amber-300"}`}>
                  {ok ? "confirmed" : "pending"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 font-mono text-xs leading-6 text-zinc-400">
            <div>User: {state.email ?? "No session"}</div>
            <div>ID: {state.userId ?? "Unavailable"}</div>
            <div>Next: {state.next}</div>
          </div>

          <Link
            href={state.next}
            className="mt-6 inline-flex w-full justify-center rounded-xl border border-blue-400/40 bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400"
          >
            Continue Setup
          </Link>
        </div>
      </section>
    </main>
  );
}
