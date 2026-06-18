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
  { href: "/controls", label: "Controls", kicker: "Test" },
  { href: "/risks", label: "Risks", kicker: "Score" },
  { href: "/evidence", label: "Evidence", kicker: "Proof" },
  { href: "/audits", label: "Audits", kicker: "Assure" },
  { href: "/policies", label: "Policies", kicker: "Govern" },
  { href: "/gaps", label: "Gaps", kicker: "Close" },
  { href: "/command-center", label: "Command Center", kicker: "Exec" },
  { href: "/integrations", label: "Integrations", kicker: "Sync" },
  { href: "/automation", label: "Automation", kicker: "Flow" },
  { href: "/imports", label: "Imports", kicker: "Load" },
  { href: "/exports", label: "Exports", kicker: "Share" },
  { href: "/developer", label: "Developer", kicker: "API" },
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
          <span className="rounded bg-[var(--zig-teal)] px-2 py-1 text-white">Tenant Scoped</span>
          <span>Vertical Slice MVP</span>
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

export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" }) {
  const toneClass =
    tone === "success"
      ? "bg-[var(--zig-teal)] text-white"
      : tone === "warning"
        ? "bg-[var(--zig-amber)] text-[var(--zig-ink)]"
        : "bg-[var(--zig-paper)] text-[var(--zig-ink-muted)]";

  return <span className={`rounded px-2 py-1 font-mono text-xs uppercase ${toneClass}`}>{children}</span>;
}

export function DataTable({
  columns,
  rows,
  empty,
}: {
  columns: string[];
  rows: ReactNode[][];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="rounded-md border border-[var(--zig-border)] p-4 text-sm text-[var(--zig-ink-muted)]">{empty}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-[var(--zig-border)]">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[var(--zig-paper)] font-mono text-xs uppercase text-[var(--zig-ink-muted)]">
          <tr>{columns.map((column) => <th key={column} className="px-3 py-2">{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-[var(--zig-border)]">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="px-3 py-3">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FormField({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span>{label}</span>
      <input
        className="rounded-md border border-[var(--zig-border)] bg-[var(--zig-paper)] px-3 py-2 text-[var(--zig-ink)]"
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  required = false,
  options,
}: {
  label: string;
  name: string;
  required?: boolean;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span>{label}</span>
      <select className="rounded-md border border-[var(--zig-border)] bg-[var(--zig-paper)] px-3 py-2" name={name} required={required}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

export function DialogPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-[var(--zig-border)] bg-[var(--zig-paper-2)] p-5 shadow-sm">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function GovernanceScoreWidget({ score, detail }: { score: number; detail: string }) {
  const tone = score >= 75 ? "healthy" : score >= 50 ? "neutral" : "attention";
  return <StatCard label="Governance Health Score" value={score} detail={detail} tone={tone} />;
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
