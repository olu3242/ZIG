import Link from "next/link";
import type { ReactNode } from "react";

export interface NavItem {
  href: string;
  label: string;
  kicker?: string;
}

const defaultNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", kicker: "Score" },
  { href: "/projects", label: "Projects", kicker: "Build" },
  { href: "/frameworks", label: "Frameworks", kicker: "Map" },
  { href: "/learning", label: "Learning", kicker: "Grow" },
  { href: "/scenarios", label: "Scenarios", kicker: "Model" },
  { href: "/mission-control", label: "Mission Control", kicker: "Act" },
  { href: "/ai-command", label: "AI Command", kicker: "Guide" },
  { href: "/settings", label: "Settings", kicker: "Admin" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--zig-paper)] text-[var(--zig-ink)]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <Sidebar items={defaultNavItems} />
        <div className="min-w-0">
          <TopNav />
          <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ items = defaultNavItems }: { items?: NavItem[] }) {
  return (
    <aside className="border-b border-[var(--zig-border)] bg-[var(--zig-ink)] px-4 py-5 text-[var(--zig-paper)] lg:border-b-0 lg:border-r">
      <Link href="/dashboard" className="block rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--zig-amber)]">
        <span className="block font-display text-2xl font-semibold">Zig</span>
        <span className="mt-1 block text-sm text-[var(--zig-paper-muted)]">Governance OS</span>
      </Link>
      <nav className="mt-6 grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center justify-between rounded-md px-3 py-2 text-sm text-[var(--zig-paper)] transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--zig-amber)]"
          >
            <span>{item.label}</span>
            {item.kicker ? (
              <span className="font-mono text-[0.7rem] uppercase text-[var(--zig-paper-muted)] group-hover:text-[var(--zig-paper)]">
                {item.kicker}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function TopNav() {
  return (
    <header className="border-b border-[var(--zig-border)] bg-[var(--zig-paper-2)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-2 font-mono text-xs uppercase text-[var(--zig-ink-muted)]">
          <span className="rounded bg-[var(--zig-teal)] px-2 py-1 text-white">Demo Tenant</span>
          <span>Project: SaaS Governance Launch</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link className="rounded-md border border-[var(--zig-ink)] px-3 py-2 font-medium" href="/projects/new">
            Create Project
          </Link>
          <Link className="rounded-md bg-[var(--zig-amber)] px-3 py-2 font-medium text-[var(--zig-ink)]" href="/ai-command">
            AI Coach
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="font-mono text-xs uppercase text-[var(--zig-teal)]">{eyebrow}</p> : null}
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-base leading-7 text-[var(--zig-ink-muted)]">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </section>
  );
}

export function StatCard({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  detail: string;
  tone?: "neutral" | "attention" | "healthy";
}) {
  const toneClass =
    tone === "attention"
      ? "border-[var(--zig-amber)]"
      : tone === "healthy"
        ? "border-[var(--zig-teal)]"
        : "border-[var(--zig-border)]";

  return (
    <article className={`rounded-lg border bg-[var(--zig-paper-2)] p-4 ${toneClass}`}>
      <p className="text-sm text-[var(--zig-ink-muted)]">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--zig-ink-muted)]">{detail}</p>
    </article>
  );
}

export function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[var(--zig-border)] bg-[var(--zig-paper-2)] p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
