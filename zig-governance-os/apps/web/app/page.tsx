"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";

const values = [
  {
    title: "Tenant Isolation",
    body: "Every workspace is scoped by tenant context, RLS boundaries, and auditable service orchestration.",
  },
  {
    title: "Persona-Aware RBAC",
    body: "Platform owners, auditors, executives, risk teams, and learners see the operating layer built for their role.",
  },
  {
    title: "AI Workflows",
    body: "Compliance intelligence turns frameworks, controls, risk, evidence, and audit tasks into guided operating flows.",
  },
];

const faqs = [
  {
    question: "How is data isolated?",
    answer: "Zig uses tenant-scoped records, Supabase row-level security, and server-side tenant context to keep each workspace separated.",
  },
  {
    question: "Is it AI-native?",
    answer: "Yes. Zig models AI as a governed compliance layer for control mapping, risk analysis, gap review, evidence classification, and audit preparation.",
  },
  {
    question: "Can I customize the OS?",
    answer: "The framework, policy, automation, import/export, and integration layers are designed for tenant-specific operating models.",
  },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 0%, rgba(59,130,246,0.16), transparent 28%), radial-gradient(circle at 82% 22%, rgba(14,165,233,0.10), transparent 30%), linear-gradient(135deg, #09090b, #030712)",
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-[0_0_34px_rgba(59,130,246,0.20)] backdrop-blur-xl">
              <Logo className="h-9 w-9" />
            </span>
            <span className="text-sm font-semibold tracking-wide">Zig Governance OS</span>
          </Link>
          <div className="hidden items-center gap-6 justify-self-center text-sm md:flex">
            {[
              { href: "#features", label: "Features" },
              { href: "#faq", label: "FAQ" },
              { href: "/developer", label: "Docs" },
            ].map((item) => (
              <motion.div key={item.href} whileHover={{ y: -1 }} transition={{ duration: 0.2 }}>
                <Link href={item.href} className="text-zinc-400 transition-colors duration-200 hover:text-white">
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-3 text-sm">
            <Link href="/login" className="hidden text-zinc-400 transition-colors duration-200 hover:text-white sm:inline">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-xl border border-blue-300/30 bg-zinc-900/50 px-4 py-2 font-semibold text-white shadow-[0_12px_34px_rgba(59,130,246,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all hover:border-blue-300/60 hover:bg-zinc-900/70"
            >
              Initialize Workspace
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl content-center gap-12 px-5 py-16">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-blue-300/80">Compliance operating system</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-7xl">Governance, Automated.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Build the OS for modern organizations: tenant-isolated, persona-aware, AI-native, and ready for continuous governance.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="rounded-xl border border-blue-300/30 bg-zinc-900/50 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(59,130,246,0.20),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all hover:border-blue-300/60 hover:bg-zinc-900/70">
              Initialize Workspace
            </Link>
            <Link href="/login" className="rounded-xl border border-zinc-700 bg-zinc-900/50 px-5 py-3 text-sm font-semibold text-zinc-200 backdrop-blur-xl transition-all hover:border-blue-400/70 hover:text-white">
              Sign In
            </Link>
          </div>
        </Reveal>

        <Reveal className="mx-auto w-full max-w-5xl">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
              <div className="mb-5 flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <p className="text-sm font-semibold">Command Center</p>
                  <p className="text-xs text-zinc-500">Cinematic Dashboard Demo</p>
                </div>
                <div className="flex gap-2">
                  <span className="size-2.5 rounded-full bg-red-400/70" />
                  <span className="size-2.5 rounded-full bg-yellow-300/70" />
                  <span className="size-2.5 rounded-full bg-green-400/70" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                {["Compliance", "Risk", "Audit", "Evidence"].map((label, index) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-xl"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
                    <p className="mt-4 font-mono text-3xl font-semibold">{84 - index * 7}</p>
                    <div className="mt-4 h-1.5 rounded-full bg-zinc-800">
                      <div className="h-full rounded-full bg-blue-400" style={{ width: `${84 - index * 7}%` }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section id="features" className="relative mx-auto grid max-w-7xl gap-6 px-5 py-20 md:grid-cols-3">
        {values.map((item, index) => (
          <Reveal key={item.title} delay={index * 0.08} className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-xl">
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-400">{item.body}</p>
          </Reveal>
        ))}
      </section>

      <section id="faq" className="relative mx-auto max-w-4xl px-5 py-20">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-blue-300/80">Knowledge layer</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Frequently asked questions</h2>
        </Reveal>
        <div className="mt-8 grid gap-3">
          {faqs.map((faq) => <FAQItem key={faq.question} {...faq} />)}
        </div>
      </section>

      <footer className="relative border-t border-zinc-800 bg-zinc-950">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Product", links: ["Governance", "Risk", "Evidence"] },
            { title: "Resources", links: ["Docs", "FAQ"] },
            { title: "Company", links: ["About", "Contact"] },
            { title: "Legal", links: ["Privacy", "Terms"] },
          ].map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-semibold text-zinc-100">{column.title}</h2>
              <ul className="mt-4 grid gap-3 text-sm text-zinc-500">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link href={link === "Docs" ? "/developer" : "#"} className="transition-colors hover:text-white">
                      {link}
                    </Link>
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
    </main>
  );
}

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.58, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
      <button className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-zinc-100" onClick={() => setOpen((value) => !value)}>
        {question}
        <span className="text-blue-300">{open ? "-" : "+"}</span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.24 }}>
            <p className="border-t border-zinc-800 px-5 py-4 text-sm leading-7 text-zinc-400">{answer}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
