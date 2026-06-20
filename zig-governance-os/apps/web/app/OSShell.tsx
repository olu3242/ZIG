"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import Logo from "./Logo";

export interface ModuleLink {
  href: string;
  label: string;
  kicker: string;
}

export interface ModuleConfig {
  id: string;
  label: string;
  description: string;
  match: (pathname: string) => boolean;
  links: ModuleLink[];
}

export const moduleConfig: ModuleConfig[] = [
  {
    id: "governance-command-center",
    label: "Governance Command Center",
    description: "Executive posture, frameworks, controls, evidence, gaps, and command readiness.",
    match: (pathname) => ["/dashboard", "/frameworks", "/controls", "/evidence", "/gaps", "/command-center"].some((prefix) => pathname.startsWith(prefix)),
    links: [
      { href: "/command-center", label: "Command Center", kicker: "Exec" },
      { href: "/dashboard", label: "Dashboard", kicker: "Score" },
      { href: "/frameworks", label: "Frameworks", kicker: "Map" },
      { href: "/controls", label: "Controls", kicker: "Test" },
      { href: "/evidence", label: "Evidence", kicker: "Proof" },
      { href: "/gaps", label: "Gaps", kicker: "Close" },
    ],
  },
  {
    id: "risk",
    label: "Risk",
    description: "Risks, scenarios, audits, findings, and readiness work.",
    match: (pathname) => ["/risks", "/scenarios", "/audits"].some((prefix) => pathname.startsWith(prefix)),
    links: [
      { href: "/risks", label: "Risks", kicker: "Score" },
      { href: "/scenarios", label: "Scenarios", kicker: "Model" },
      { href: "/audits", label: "Audits", kicker: "Assure" },
    ],
  },
  {
    id: "policy",
    label: "Policy",
    description: "Policies, learning, settings, and operating governance.",
    match: (pathname) => ["/policies", "/learning", "/academy", "/apprenticeship", "/skills", "/career", "/certifications", "/employment", "/learning-command-center", "/corporate-academy", "/university", "/employers", "/enterprise-learning", "/settings"].some((prefix) => pathname.startsWith(prefix)),
    links: [
      { href: "/policies", label: "Policies", kicker: "Govern" },
      { href: "/learning-command-center", label: "Learning Command", kicker: "Kernel" },
      { href: "/academy", label: "Academy", kicker: "Agents" },
      { href: "/apprenticeship", label: "Apprenticeship", kicker: "Live" },
      { href: "/skills", label: "Skills", kicker: "Graph" },
      { href: "/career", label: "Career", kicker: "Jobs" },
      { href: "/certifications", label: "Certifications", kicker: "Award" },
      { href: "/learning", label: "Learning", kicker: "Grow" },
      { href: "/learning/practice-lab", label: "Practice Lab", kicker: "Sim" },
      { href: "/learning/community", label: "Community", kicker: "Mentor" },
      { href: "/learning/instructor", label: "Instructor", kicker: "Teach" },
      { href: "/learning/marketplace", label: "Learning Market", kicker: "Assets" },
      { href: "/enterprise-learning", label: "Enterprise Learning", kicker: "Cloud" },
      { href: "/corporate-academy", label: "Corporate Academy", kicker: "Corp" },
      { href: "/university", label: "University", kicker: "Acad" },
      { href: "/employers", label: "Employers", kicker: "Hire" },
      { href: "/settings", label: "Settings", kicker: "Admin" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    description: "Projects, integrations, automation, data movement, developer APIs, and marketplace operations.",
    match: (pathname) => ["/projects", "/integrations", "/automation", "/imports", "/exports", "/developer", "/developers", "/marketplace", "/services", "/partners", "/mission-control", "/ai-command"].some((prefix) => pathname.startsWith(prefix)),
    links: [
      { href: "/projects", label: "Projects", kicker: "Build" },
      { href: "/mission-control", label: "Mission Control", kicker: "Act" },
      { href: "/ai-command", label: "AI Command", kicker: "Guide" },
      { href: "/integrations", label: "Integrations", kicker: "Sync" },
      { href: "/automation", label: "Automation", kicker: "Flow" },
      { href: "/imports", label: "Imports", kicker: "Load" },
      { href: "/exports", label: "Exports", kicker: "Share" },
      { href: "/trust-center", label: "Trust Center", kicker: "Assure" },
      { href: "/developer", label: "Developer", kicker: "API" },
      { href: "/developers", label: "Developers", kicker: "SDK" },
      { href: "/marketplace", label: "Marketplace", kicker: "Store" },
      { href: "/services", label: "Services", kicker: "GRC" },
      { href: "/partners", label: "Partners", kicker: "Cloud" },
    ],
  },
  {
    id: "autonomous",
    label: "Autonomous",
    description: "Agent workforce, continuous compliance, digital twin, board intelligence, and autonomous command posture.",
    match: (pathname) => ["/agents", "/digital-twin", "/compliance-command-center", "/executive-assurance", "/board"].some((prefix) => pathname.startsWith(prefix)),
    links: [
      { href: "/compliance-command-center", label: "Compliance Command", kicker: "Auto" },
      { href: "/agents", label: "Agents", kicker: "Run" },
      { href: "/digital-twin", label: "Digital Twin", kicker: "Twin" },
      { href: "/executive-assurance", label: "Executive Assurance", kicker: "Exec" },
      { href: "/board", label: "Board", kicker: "Pack" },
    ],
  },
];

const drawerVariants: Variants = {
  hidden: { opacity: 0, x: -20, filter: "blur(10px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: { opacity: 0, x: -12, filter: "blur(10px)", transition: { duration: 0.22 } },
};

const drawerItemVariants: Variants = {
  hidden: { opacity: 0, x: -14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
};

const layerVariants: Variants = {
  initial: { opacity: 0, y: 14, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -8, filter: "blur(10px)", transition: { duration: 0.22, ease: [0.7, 0, 0.84, 0] } },
};

export function OSLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isBooting, setIsBooting] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const activeModule = useMemo(() => moduleConfig.find((item) => item.match(pathname)) ?? moduleConfig[0], [pathname]);
  const commandItems = useMemo(
    () =>
      moduleConfig.flatMap((module) =>
        module.links.map((link) => ({
          ...link,
          moduleId: module.id,
          moduleLabel: module.label,
        })),
      ),
    [],
  );
  const filteredCommandItems = useMemo(() => {
    const query = commandQuery.trim().toLowerCase();
    if (!query) {
      return commandItems;
    }

    return commandItems.filter((item) =>
      [item.label, item.kicker, item.moduleLabel].some((value) => value.toLowerCase().includes(query)),
    );
  }, [commandItems, commandQuery]);

  useEffect(() => {
    setIsBooting(true);
    const timeout = window.setTimeout(() => setIsBooting(false), 800);
    return () => window.clearTimeout(timeout);
  }, [activeModule.id]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }

      if (event.key === "Escape") {
        setCommandOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function navigateToLayer(href: string) {
    setCommandOpen(false);
    setCommandQuery("");
    router.push(href);
  }

  return (
    <div
      className="min-h-screen bg-zinc-950 text-white selection:bg-blue-500/30"
      style={{
        "--zig-ink": "#f8fafc",
        "--zig-paper": "#09090b",
        "--zig-paper-2": "rgba(24,24,27,0.62)",
        "--zig-amber": "#60a5fa",
        "--zig-teal": "#3b82f6",
        "--zig-ink-muted": "#a1a1aa",
        "--zig-paper-muted": "#71717a",
        "--zig-border": "#27272a",
      } as CSSProperties}
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(circle at 20% 0%, rgba(59,130,246,0.13), transparent 30%), radial-gradient(circle at 80% 20%, rgba(14,165,233,0.08), transparent 32%), linear-gradient(135deg, #09090b, #030712)",
        }}
      />
      <TopNavigation activeModule={activeModule} onOpenCommand={() => setCommandOpen(true)} />
      <div className="relative grid min-h-[calc(100vh-73px)] pt-[73px] lg:grid-cols-[292px_1fr]">
        <AnimatePresence>
          {!isBooting ? <DashboardSidebar key={activeModule.id} activeModule={activeModule} pathname={pathname} /> : null}
        </AnimatePresence>

        <div className="min-w-0 lg:col-start-2">
          <AnimatePresence mode="wait">
            {!isBooting ? (
              <motion.main
                key={`${activeModule.id}:${pathname}`}
                variants={layerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8"
              >
                {children}
              </motion.main>
            ) : (
              <motion.div
                key="hydrating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid min-h-[calc(100vh-73px)] place-items-center px-6"
              >
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 px-7 py-6 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
                  <motion.div
                    animate={{ opacity: [0.72, 1, 0.72], scale: [0.98, 1.03, 0.98] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-[0_0_48px_rgba(59,130,246,0.24)] backdrop-blur-xl"
                  >
                    <Logo className="h-12 w-12" />
                  </motion.div>
                  <p className="font-mono text-xs uppercase tracking-[0.34em] text-zinc-400">INITIALIZING {activeModule.label}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <CommandPalette
        open={commandOpen}
        query={commandQuery}
        items={filteredCommandItems}
        onChangeQuery={setCommandQuery}
        onClose={() => setCommandOpen(false)}
        onNavigate={navigateToLayer}
      />
    </div>
  );
}

export const OSShell = OSLayout;

function TopNavigation({ activeModule, onOpenCommand }: { activeModule: ModuleConfig; onOpenCommand: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-[73px] w-full max-w-[1680px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50">
          <span className="grid size-10 place-items-center rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-[0_0_34px_rgba(59,130,246,0.22)] backdrop-blur-xl">
            <Logo className="h-9 w-9" />
          </span>
          <span className="hidden sm:block">
            <span className="block font-display text-sm font-semibold">Zig Governance OS</span>
            <span className="block text-xs text-zinc-500">Zig OS &gt; {activeModule.label}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-1 backdrop-blur-md md:flex">
          {moduleConfig.map((module) => (
            <Link
              key={module.id}
              href={module.links[0].href}
              className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                module.id === activeModule.id ? "bg-zinc-900/70 text-blue-100" : "text-zinc-500 hover:bg-zinc-900/70 hover:text-zinc-200"
              }`}
            >
              {module.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={onOpenCommand}
            className="hidden min-w-64 items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-left text-sm text-zinc-500 backdrop-blur-md transition-all hover:border-blue-400/50 hover:text-zinc-200 lg:flex"
            aria-label="Open command palette"
          >
            <span>Search modules...</span>
            <span className="font-mono text-[0.68rem] uppercase text-zinc-600">Cmd K</span>
          </button>
          <div className="hidden rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-zinc-500 backdrop-blur-md xl:block">
            Tenant Context Active
          </div>
          <Link className="rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 font-medium text-zinc-200 backdrop-blur-md transition-all hover:border-blue-400/60 hover:text-white" href="/projects/new">
            Create Project
          </Link>
          <Link className="hidden rounded-lg border border-blue-300/30 bg-zinc-900/50 px-3 py-2 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition-all hover:border-blue-300/60 hover:bg-zinc-900/70 sm:inline-flex" href="/ai-command">
            AI Coach
          </Link>
        </div>
      </div>
    </header>
  );
}

function CommandPalette({
  open,
  query,
  items,
  onChangeQuery,
  onClose,
  onNavigate,
}: {
  open: boolean;
  query: string;
  items: Array<ModuleLink & { moduleId: string; moduleLabel: string }>;
  onChangeQuery: (query: string) => void;
  onClose: () => void;
  onNavigate: (href: string) => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-start bg-black/60 px-4 pt-24 backdrop-blur-sm sm:pt-32"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 10, scale: 0.98, filter: "blur(10px)" }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/92 shadow-2xl shadow-black/60 backdrop-blur-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-zinc-800 p-4">
              <label className="grid gap-2">
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-blue-300/80">Command Palette</span>
                <input
                  value={query}
                  onChange={(event) => onChangeQuery(event.target.value)}
                  autoFocus
                  placeholder="Jump to Command Center, Risk, Policy, Operations..."
                  className="h-12 rounded-lg border border-zinc-800 bg-zinc-950 px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.14)]"
                />
              </label>
            </div>

            <div className="max-h-[420px] overflow-y-auto p-2">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-zinc-500">No module layers match that command.</p>
              ) : (
                items.map((item) => (
                  <button
                    key={`${item.moduleId}:${item.href}`}
                    type="button"
                    onClick={() => onNavigate(item.href)}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-all hover:bg-zinc-900/70"
                  >
                    <span>
                      <span className="block text-sm font-medium text-zinc-100">{item.label}</span>
                      <span className="mt-1 block text-xs text-zinc-500">Zig OS &gt; {item.moduleLabel}</span>
                    </span>
                    <span className="font-mono text-[0.68rem] uppercase text-zinc-600">{item.kicker}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function DashboardSidebar({ activeModule, pathname }: { activeModule: ModuleConfig; pathname: string }) {
  return (
    <motion.aside
      variants={drawerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="border-b border-zinc-800/80 bg-zinc-950/72 px-4 py-5 text-zinc-100 backdrop-blur-xl lg:fixed lg:inset-y-0 lg:left-0 lg:top-[73px] lg:w-[292px] lg:border-b-0 lg:border-r"
    >
      <motion.div variants={drawerItemVariants} className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-300/80">{activeModule.label}</p>
        <p className="mt-3 text-sm leading-6 text-zinc-400">{activeModule.description}</p>
      </motion.div>

      <motion.nav className="mt-5 grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
        {activeModule.links.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <motion.div key={item.href} variants={drawerItemVariants}>
              <Link
                href={item.href}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  active ? "bg-blue-500/14 text-blue-100" : "text-zinc-300 hover:bg-zinc-900/70 hover:text-white"
                }`}
              >
                <span>{item.label}</span>
                <span className="font-mono text-[0.68rem] uppercase text-zinc-600 group-hover:text-blue-200">{item.kicker}</span>
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>
    </motion.aside>
  );
}
