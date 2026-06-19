"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Logo from "./Logo";

const capabilities = [
  {
    title: "Governance Management",
    features: ["Projects", "Assets", "Risks", "Controls", "Evidence", "Tasks"],
    outcome: "Run governance programs from one workspace.",
  },
  {
    title: "Compliance Readiness",
    features: ["ISO 27001", "SOC 2", "NIST", "CIS", "HIPAA", "PCI DSS"],
    outcome: "Understand readiness across multiple frameworks.",
  },
  {
    title: "Learning & Development",
    features: ["Learning Paths", "Labs", "Simulations", "Case Studies", "Career Tracks"],
    outcome: "Build governance professionals and teams.",
  },
  {
    title: "AI-Assisted Workflows",
    features: ["Workflow Automation", "AI Recommendations", "Governance Insights", "Agent Framework"],
    outcome: "Reduce manual governance effort.",
  },
  {
    title: "Executive Intelligence",
    features: ["Dashboards", "Governance Scores", "Reporting", "Executive Views"],
    outcome: "Give leadership governance visibility.",
  },
];

const lifecycle = [
  {
    step: "Create",
    items: ["Projects", "Assets", "Controls"],
  },
  {
    step: "Assess",
    items: ["Risks", "Frameworks", "Readiness"],
  },
  {
    step: "Improve",
    items: ["Tasks", "Recommendations", "Learning"],
  },
  {
    step: "Report",
    items: ["Dashboards", "Executive Reports"],
  },
];

const workspaceCallouts = [
  { label: "Mission Control", detail: "Program status and next actions", position: "left-5 top-7" },
  { label: "Frameworks", detail: "ISO, SOC 2, NIST, CIS, HIPAA, PCI", position: "right-5 top-10" },
  { label: "Risk Workspace", detail: "Risk register and treatment status", position: "left-7 bottom-24" },
  { label: "Evidence Workspace", detail: "Evidence health and review state", position: "right-8 bottom-24" },
  { label: "Learning Center", detail: "Paths, labs, simulations, cases", position: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" },
  { label: "Executive Reporting", detail: "Scores and leadership views", position: "left-1/2 bottom-5 -translate-x-1/2" },
];

const comparisonRows = [
  ["Spreadsheets", "Unified OS"],
  ["Manual Tracking", "Governance Workspaces"],
  ["Disconnected Learning", "Learning Center"],
  ["Static Evidence", "Evidence Workspace"],
  ["Limited Visibility", "Executive Reporting"],
];

const audiences = [
  {
    title: "Governance Teams",
    useCase: "Coordinate programs, owners, controls, and tasks.",
    outcome: "A clearer operating model for day-to-day governance work.",
  },
  {
    title: "Compliance Teams",
    useCase: "Map frameworks, manage evidence, and track readiness.",
    outcome: "A stronger path from preparation to audit readiness.",
  },
  {
    title: "Risk & Audit Teams",
    useCase: "Track risk, evidence, findings, and executive status.",
    outcome: "Better visibility into what needs attention.",
  },
  {
    title: "Consultants & Advisors",
    useCase: "Organize client projects, frameworks, and reporting.",
    outcome: "A repeatable workspace for client delivery.",
  },
];

const frameworks = ["ISO 27001", "SOC 2", "NIST", "CIS", "HIPAA", "PCI DSS"];

const packages = [
  {
    name: "Starter",
    target: "Students, professionals, consultants",
    includes: ["Projects", "Framework Library", "Learning Center", "Basic Reporting"],
    cta: "Start Free",
    href: "/signup",
  },
  {
    name: "Professional",
    target: "Compliance teams, risk teams, audit teams",
    includes: ["Governance Workspaces", "Framework Mapping", "Evidence Management", "Reporting"],
    cta: "Start Trial",
    href: "/signup",
    featured: true,
  },
  {
    name: "Enterprise",
    target: "Healthcare, financial services, government, large organizations",
    includes: ["Everything", "Multi-Tenant", "Advanced Reporting", "Agent Framework", "Custom Integrations"],
    cta: "Contact Sales",
    href: "mailto:sales@zig.systems?subject=Zig%20Enterprise%20Demo",
  },
];

const outcomes = [
  "Reduce Governance Complexity",
  "Improve Audit Readiness",
  "Organize Evidence",
  "Track Risk",
  "Build Team Capability",
  "Provide Executive Visibility",
];

const navItems = [
  { href: "#capabilities", label: "Capabilities" },
  { href: "#workflow", label: "How it works" },
  { href: "#workspace", label: "Workspace" },
  { href: "#pricing", label: "Pricing" },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <BackgroundSystem />
      <Header />

      <section className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl content-center gap-12 px-5 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <Reveal>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-blue-300/80">Zig Governance OS</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
            The AI-Powered Governance Operating System
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            Manage governance programs, organize evidence, track risk, map frameworks, automate workflows, train teams, and generate executive insights from one platform.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton href="/signup">Start Free</PrimaryButton>
            <SecondaryButton href="mailto:sales@zig.systems?subject=Zig%20Demo">Book Demo</SecondaryButton>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-zinc-400 sm:grid-cols-3">
            {["Governance teams", "Compliance teams", "Risk and audit teams"].map((item) => (
              <div key={item} className="border-l border-zinc-800 pl-3">{item}</div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <WorkspaceVisual compact />
        </Reveal>
      </section>

      <SectionIntro
        id="capabilities"
        eyebrow="One platform. Five core capabilities."
        title="Everything a governance team needs to get organized."
        description="Zig brings the work of governance into a shared operating system instead of spreading it across spreadsheets, folders, slide decks, and one-off trackers."
      />
      <section className="relative mx-auto grid max-w-7xl gap-4 px-5 pb-20 md:grid-cols-2 xl:grid-cols-5">
        {capabilities.map((capability, index) => (
          <Reveal key={capability.title} delay={index * 0.04}>
            <article className="flex h-full flex-col rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
              <h2 className="text-lg font-semibold">{capability.title}</h2>
              <ul className="mt-5 grid gap-2 text-sm text-zinc-300">
                {capability.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-300" />
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="mt-auto pt-6 text-sm leading-6 text-zinc-400">{capability.outcome}</p>
            </article>
          </Reveal>
        ))}
      </section>

      <SectionIntro
        id="workflow"
        eyebrow="How Zig works"
        title="Create, assess, improve, and report."
        description="A simple lifecycle connects projects, risk, controls, evidence, learning, and executive visibility."
      />
      <section className="relative mx-auto grid max-w-7xl gap-4 px-5 pb-20 md:grid-cols-4">
        {lifecycle.map((stage, index) => (
          <Reveal key={stage.step} delay={index * 0.05}>
            <article className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">{stage.step}</h2>
                <span className="font-mono text-xs uppercase text-zinc-500">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="mt-6 grid gap-2">
                {stage.items.map((item) => (
                  <p key={item} className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-300">{item}</p>
                ))}
              </div>
            </article>
          </Reveal>
        ))}
      </section>

      <SectionIntro
        id="workspace"
        eyebrow="Inside the Zig workspace"
        title="A single view of governance work."
        description="Mission Control, frameworks, risk, evidence, learning, and executive reporting live in one connected workspace."
      />
      <section className="relative mx-auto max-w-7xl px-5 pb-20">
        <Reveal>
          <WorkspaceVisual />
        </Reveal>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-8 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <Reveal>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-blue-300/80">Why organizations choose Zig</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">A cleaner operating model for governance.</h2>
          <p className="mt-5 text-base leading-7 text-zinc-400">
            Zig replaces disconnected tracking with a workspace built for governance programs, readiness work, evidence, learning, and reporting.
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
            <div className="grid grid-cols-2 border-b border-zinc-800 bg-zinc-950/70 text-sm font-semibold">
              <div className="px-4 py-3 text-zinc-500">Traditional GRC</div>
              <div className="px-4 py-3 text-white">Zig</div>
            </div>
            {comparisonRows.map(([traditional, zig]) => (
              <div key={traditional} className="grid grid-cols-2 border-b border-zinc-800 last:border-b-0">
                <div className="px-4 py-3 text-sm text-zinc-500">{traditional}</div>
                <div className="px-4 py-3 text-sm text-zinc-200">{zig}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <SectionIntro
        id="audiences"
        eyebrow="Who Zig is for"
        title="Built for the people who run governance work."
        description="Zig is designed for teams and advisors who need structure, visibility, and repeatable governance execution."
      />
      <section className="relative mx-auto grid max-w-7xl gap-4 px-5 pb-20 md:grid-cols-2 lg:grid-cols-4">
        {audiences.map((audience, index) => (
          <Reveal key={audience.title} delay={index * 0.04}>
            <article className="h-full rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-xl">
              <h2 className="text-lg font-semibold">{audience.title}</h2>
              <p className="mt-4 text-sm leading-6 text-zinc-300">{audience.useCase}</p>
              <p className="mt-5 border-t border-zinc-800 pt-4 text-sm leading-6 text-zinc-500">{audience.outcome}</p>
            </article>
          </Reveal>
        ))}
      </section>

      <section className="relative mx-auto max-w-7xl px-5 py-20">
        <Reveal>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-blue-300/80">Framework coverage</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight">Mapped for readiness, not product sprawl.</h2>
                <p className="mt-4 text-sm leading-6 text-zinc-400">Frameworks are handled as mappings inside the workspace, so teams can compare readiness without managing separate tools.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {frameworks.map((framework) => (
                  <div key={framework} className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm font-medium text-zinc-200">
                    {framework}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <SectionIntro
        id="pricing"
        eyebrow="Pricing"
        title="Choose the package that matches your operating model."
        description="Three simple packages keep the decision clear for individuals, teams, and larger organizations."
      />
      <section className="relative mx-auto grid max-w-7xl gap-4 px-5 pb-20 lg:grid-cols-3">
        {packages.map((plan, index) => (
          <Reveal key={plan.name} delay={index * 0.05}>
            <article className={`flex h-full flex-col rounded-lg border p-6 backdrop-blur-xl ${plan.featured ? "border-blue-300/50 bg-zinc-900/70 shadow-[0_0_44px_rgba(59,130,246,0.18)]" : "border-zinc-800 bg-zinc-900/50"}`}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold">{plan.name}</h2>
                {plan.featured ? <span className="rounded-lg border border-blue-300/40 bg-blue-500/10 px-3 py-1 font-mono text-xs uppercase text-blue-200">Most Popular</span> : null}
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-400">{plan.target}</p>
              <ul className="mt-6 grid gap-3 text-sm text-zinc-300">
                {plan.includes.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className="mt-8 inline-flex h-11 items-center justify-center rounded-lg border border-blue-300/30 bg-zinc-950/70 px-4 text-sm font-semibold text-white transition-all hover:border-blue-300/60 hover:bg-zinc-900"
              >
                {plan.cta}
              </Link>
            </article>
          </Reveal>
        ))}
      </section>

      <SectionIntro
        id="outcomes"
        eyebrow="Customer outcomes"
        title="Governance work becomes easier to see, assign, and improve."
        description="Zig focuses on operational outcomes, not feature volume."
      />
      <section className="relative mx-auto grid max-w-7xl gap-4 px-5 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {outcomes.map((outcome, index) => (
          <Reveal key={outcome} delay={index * 0.03}>
            <article className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-xl">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">Outcome</p>
              <h2 className="mt-4 text-xl font-semibold">{outcome}</h2>
            </article>
          </Reveal>
        ))}
      </section>

      <section className="relative mx-auto max-w-5xl px-5 py-24 text-center">
        <Reveal>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-blue-300/80">Start with one workspace</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Stop Managing Governance Across Disconnected Tools.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-400">
            Bring governance, compliance, learning, automation, and reporting together in one operating system.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <PrimaryButton href="/signup">Start Free</PrimaryButton>
            <SecondaryButton href="mailto:sales@zig.systems?subject=Zig%20Demo">Book Demo</SecondaryButton>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <nav className="mx-auto flex h-[73px] max-w-7xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg border border-zinc-800 bg-zinc-900/50 shadow-[0_0_34px_rgba(59,130,246,0.20)] backdrop-blur-xl">
            <Logo className="h-9 w-9" />
          </span>
          <span className="truncate text-sm font-semibold tracking-wide">Zig Governance OS</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-zinc-400 transition-colors hover:text-white">
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center justify-end gap-3 text-sm">
          <Link href="/login" className="hidden text-zinc-400 transition-colors hover:text-white sm:inline">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border border-blue-300/30 bg-zinc-900/50 px-4 py-2 font-semibold text-white shadow-[0_12px_34px_rgba(59,130,246,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all hover:border-blue-300/60 hover:bg-zinc-900/70"
          >
            Start Free
          </Link>
        </div>
      </nav>
    </header>
  );
}

function WorkspaceVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 shadow-2xl shadow-black/50 backdrop-blur-xl ${compact ? "p-4" : "p-5 sm:p-6"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.16),transparent_32%)]" />
      <div className="relative">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <div>
              <p className="text-sm font-semibold">Zig OS Workspace</p>
              <p className="text-xs text-zinc-500">Mission Control</p>
            </div>
          </div>
          <div className="hidden gap-2 sm:flex">
            {["Risk", "Evidence", "Reporting"].map((item) => (
              <span key={item} className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-1 text-xs text-zinc-400">{item}</span>
            ))}
          </div>
        </div>

        <div className={`relative mt-5 grid gap-4 ${compact ? "lg:grid-cols-[0.8fr_1.2fr]" : "lg:grid-cols-[220px_1fr]"}`}>
          <div className="grid gap-2">
            {["Mission Control", "Frameworks", "Risk Workspace", "Evidence Workspace", "Learning Center", "Executive Reporting"].map((item, index) => (
              <motion.div
                key={item}
                animate={{ opacity: [0.72, 1, 0.72] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.18 }}
                className="rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-300"
              >
                {item}
              </motion.div>
            ))}
          </div>
          <div className={`relative min-h-[360px] rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 ${compact ? "" : "sm:min-h-[480px]"}`}>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Governance Score", "78"],
                ["Open Risks", "12"],
                ["Evidence Health", "Approved"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</p>
                  <p className="mt-3 font-mono text-2xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3">
              {["Framework readiness mapped to active projects", "Risk treatments linked to controls", "Evidence reviews moving toward audit readiness"].map((item, index) => (
                <div key={item} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm">
                  <span className="text-zinc-300">{item}</span>
                  <span className="font-mono text-xs uppercase text-blue-300">{index === 0 ? "Map" : index === 1 ? "Track" : "Report"}</span>
                </div>
              ))}
            </div>
            {!compact ? (
              <div className="pointer-events-none absolute inset-0 hidden lg:block">
                {workspaceCallouts.map((callout) => (
                  <div key={callout.label} className={`absolute max-w-[190px] rounded-lg border border-blue-300/30 bg-zinc-900/90 p-3 shadow-xl shadow-black/30 backdrop-blur-xl ${callout.position}`}>
                    <p className="text-xs font-semibold text-blue-100">{callout.label}</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-400">{callout.detail}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionIntro({ id, eyebrow, title, description }: { id: string; eyebrow: string; title: string; description: string }) {
  return (
    <section id={id} className="relative mx-auto max-w-7xl px-5 pt-20 pb-8">
      <Reveal>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-blue-300/80">{eyebrow}</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400">{description}</p>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Product", links: [["Governance", "#capabilities"], ["Frameworks", "#workspace"], ["Pricing", "#pricing"]] },
          { title: "Resources", links: [["Docs", "/developer"], ["Login", "/login"], ["Start Free", "/signup"]] },
          { title: "Teams", links: [["Governance", "#audiences"], ["Compliance", "#audiences"], ["Risk & Audit", "#audiences"]] },
          { title: "System", links: [["Mission Control", "/mission-control"], ["Frameworks", "/frameworks"], ["Evidence", "/evidence"]] },
        ].map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-semibold text-zinc-100">{column.title}</h2>
            <ul className="mt-4 grid gap-3 text-sm text-zinc-500">
              {column.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="transition-colors hover:text-white">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-zinc-800 px-5 py-5">
        <p className="mx-auto max-w-7xl font-mono text-xs uppercase tracking-[0.16em] text-zinc-600">
          © 2026 Zig Systems. All rights reserved. | ZIG-OS v1.0.0-Stable
        </p>
      </div>
    </footer>
  );
}

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex h-12 items-center justify-center rounded-lg border border-blue-300/30 bg-zinc-900/50 px-5 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(59,130,246,0.20),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all hover:border-blue-300/60 hover:bg-zinc-900/70">
      {children}
    </Link>
  );
}

function SecondaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex h-12 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/50 px-5 text-sm font-semibold text-zinc-200 backdrop-blur-xl transition-all hover:border-blue-400/70 hover:text-white">
      {children}
    </Link>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

function BackgroundSystem() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 0%, rgba(59,130,246,0.16), transparent 28%), radial-gradient(circle at 78% 24%, rgba(16,185,129,0.09), transparent 30%), linear-gradient(135deg, #09090b, #030712)",
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:80px_80px]" />
    </>
  );
}
