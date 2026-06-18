import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/app/Logo";

export function AuthPanel({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <section className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_420px]">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
        <Logo className="h-12 w-12" />
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.22em] text-blue-300/80">Secure Gateway</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">{description}</p>
      </div>
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
        {children}
        <div className="mt-6 border-t border-zinc-800 pt-4 text-sm text-zinc-400">{footer}</div>
      </div>
    </section>
  );
}

export function Field({ label, name, type = "text", required = true }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span>{label}</span>
      <input
        className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white outline-none backdrop-blur-xl transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
        name={name}
        type={type}
        required={required}
      />
    </label>
  );
}

export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="font-medium text-blue-300 underline underline-offset-4 transition hover:text-blue-200" href={href}>{children}</Link>;
}
