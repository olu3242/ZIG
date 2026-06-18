import Link from "next/link";
import Logo from "./Logo";

export default function AdminHome() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-zinc-950 px-6 py-16 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(circle at 22% 10%, rgba(59,130,246,0.16), transparent 30%), radial-gradient(circle at 82% 22%, rgba(16,185,129,0.10), transparent 32%), linear-gradient(135deg, #09090b, #030712)",
        }}
      />
      <section className="relative w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="mx-auto grid size-20 place-items-center rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-[0_0_54px_rgba(59,130,246,0.24)] backdrop-blur-xl">
          <Logo className="h-16 w-16" />
        </div>
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.28em] text-blue-300/80">Platform Owner Console</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Zig Governance OS Admin</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-zinc-400">
          Govern tenants, users, runtime operations, and audit posture from the secured administration workspace.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/admin/dashboard"
            className="rounded-xl border border-blue-300/30 bg-zinc-900/50 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(59,130,246,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all hover:border-blue-300/60 hover:bg-zinc-900/70"
          >
            Open Admin Shell
          </Link>
          <Link
            href="/admin/audit"
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-3 text-sm font-semibold text-zinc-300 backdrop-blur-xl transition-all hover:border-blue-400/60 hover:text-white"
          >
            View Audit
          </Link>
        </div>
      </section>
    </main>
  );
}
