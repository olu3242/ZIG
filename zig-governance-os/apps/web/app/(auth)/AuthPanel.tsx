import Link from "next/link";
import type { ReactNode } from "react";

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
      <div className="rounded-lg border border-[var(--zig-border)] bg-[var(--zig-ink)] p-6 text-[var(--zig-paper)]">
        <p className="font-mono text-xs uppercase text-[var(--zig-paper-muted)]">Identity Foundation</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--zig-paper-muted)]">{description}</p>
        <div className="mt-8 grid gap-3 text-sm">
          {["Tenant isolation", "Role-based access control", "Mock session context"].map((item) => (
            <div key={item} className="rounded-md border border-white/15 px-3 py-2">{item}</div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-[var(--zig-border)] bg-[var(--zig-paper-2)] p-6">
        {children}
        <div className="mt-6 border-t border-[var(--zig-border)] pt-4 text-sm text-[var(--zig-ink-muted)]">{footer}</div>
      </div>
    </section>
  );
}

export function Field({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span>{label}</span>
      <input
        className="rounded-md border border-[var(--zig-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--zig-amber)] focus:ring-2 focus:ring-[var(--zig-amber)]/30"
        type={type}
      />
    </label>
  );
}

export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="font-medium text-[var(--zig-ink)] underline underline-offset-4" href={href}>{children}</Link>;
}
