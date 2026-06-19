"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useOSInitialization } from "@/app/OSInitializationProvider";
import Logo from "@/app/Logo";

interface AuthGatewayProps {
  mode: "login" | "signup";
  action: (formData: FormData) => Promise<void>;
  googleAction: () => Promise<void>;
  error?: string;
  success?: string;
}

const copy = {
  login: {
    eyebrow: "Welcome back",
    title: "Initialize session",
    description: "Authenticate to load your tenant, role, and persona context.",
    button: "Authenticate",
    alternate: "New workspace?",
    alternateLink: "Create one",
    alternateHref: "/signup",
  },
  signup: {
    eyebrow: "Workspace initialization",
    title: "Create your workspace",
    description: "Start with a secure account, then configure your tenant operating context.",
    button: "Initialize workspace",
    alternate: "Already have access?",
    alternateLink: "Log in",
    alternateHref: "/login",
  },
};

const trustSignals = ["Tenant-isolated by design", "Persona-aware authorization", "AI-native compliance operations"];

const errorCopy: Record<string, string> = {
  invalid_credentials: "We could not authenticate that email and password combination.",
  oauth: "Google authentication did not complete. Please try again.",
  password_length: "Use a password with at least 8 characters.",
  password_mismatch: "Password confirmation did not match.",
};

const successCopy: Record<string, string> = {
  check_email: "Check your inbox to finish workspace initialization.",
  password_reset: "Password reset instructions have been sent if the email exists.",
};

export function AuthGateway({ mode, action, googleAction, error, success }: AuthGatewayProps) {
  const { isInitializing, beginInitialization } = useOSInitialization();
  const content = copy[mode];
  const banner = error ? { type: "error" as const, message: errorCopy[error] ?? "Authentication failed." } :
    success ? { type: "success" as const, message: successCopy[success] ?? "Authentication request completed." } :
      null;

  useEffect(() => {
    console.log("[AUTH STEP]", "STEP_04_RENDER", mode);
  }, [mode]);

  function handleCredentialSubmit() {
    console.log("[AUTH STEP]", "STEP_01_START", mode);
    beginInitialization();
  }

  function handleGoogleSubmit() {
    console.log("[AUTH STEP]", "STEP_03_OAUTH", mode);
    beginInitialization();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(59,130,246,0.22), transparent 28%), radial-gradient(circle at 70% 72%, rgba(14,165,233,0.14), transparent 34%), linear-gradient(135deg, rgba(24,24,27,0.96), rgba(9,9,11,1) 46%, rgba(3,7,18,1))",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <section className="relative grid min-h-screen lg:grid-cols-2">
        <BrandPanel mode={mode} />

        <div className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
          <AnimatePresence mode="wait">
            {!isInitializing ? (
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 28, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(20px)" }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                className="w-full max-w-md rounded-3xl border border-zinc-800/90 bg-zinc-900/55 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9"
              >
                <MobileBrand />
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-300/80">{content.eyebrow}</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight">{content.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{content.description}</p>
                </div>

                {banner ? <AuthBanner type={banner.type} message={banner.message} /> : null}

                <form action={action} onSubmit={handleCredentialSubmit} className="mt-8 grid gap-5">
                  {mode === "signup" ? <AuthInput label="Full name" name="name" type="text" autoComplete="name" /> : null}
                  <AuthInput label="Email" name="email" type="email" autoComplete="email" />
                  <AuthInput
                    label="Password"
                    name="password"
                    type="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                  {mode === "signup" ? (
                    <AuthInput label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" />
                  ) : (
                    <label className="flex items-center justify-between gap-3 text-sm text-zinc-400">
                      <span className="flex items-center gap-2">
                        <input
                          name="remember"
                          type="checkbox"
                          className="size-4 rounded border-zinc-800 bg-zinc-950 text-blue-500 focus:ring-blue-500/30"
                        />
                        Remember this workspace
                      </span>
                      <Link href="/forgot-password" className="transition hover:text-white">
                        Forgot password?
                      </Link>
                    </label>
                  )}
                  <SubmitButton label={content.button} />
                </form>

                <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-zinc-600">
                  <span className="h-px flex-1 bg-zinc-800" />
                  or
                  <span className="h-px flex-1 bg-zinc-800" />
                </div>

                <form action={googleAction} onSubmit={handleGoogleSubmit}>
                  <GoogleButton label={mode === "login" ? "Continue with Google" : "Initialize with Google"} />
                </form>

                <div className="mt-6 flex flex-col gap-3 border-t border-zinc-800 pt-5 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-zinc-500">Supabase Auth protected</span>
                  <span>
                    {content.alternate}{" "}
                    <Link href={content.alternateHref} className="font-medium text-blue-300 transition hover:text-blue-200">
                      {content.alternateLink}
                    </Link>
                  </span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}

function AuthBanner({ type, message }: { type: "error" | "success"; message: string }) {
  const styles = type === "error"
    ? "border-red-500/30 bg-red-950/35 text-red-100"
    : "border-emerald-500/30 bg-emerald-950/35 text-emerald-100";

  return (
    <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur-xl ${styles}`}>
      {message}
    </div>
  );
}

function BrandPanel({ mode }: { mode: "login" | "signup" }) {
  return (
    <div className="hidden min-h-screen flex-col justify-between border-r border-zinc-800/80 px-12 py-10 lg:flex xl:px-16">
      <Link href="/" className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-[0_0_40px_rgba(59,130,246,0.20)] backdrop-blur-xl">
          <Logo className="h-9 w-9" />
        </span>
        <span>
          <span className="block text-sm font-semibold tracking-wide">Zig Governance OS</span>
          <span className="block text-xs text-zinc-500">Compliance operating system</span>
        </span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-xl"
      >
        <p className="mb-5 text-sm font-medium uppercase tracking-[0.24em] text-blue-300/80">
          {mode === "login" ? "Secure command layer" : "Workspace provisioning"}
        </p>
        <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight text-white xl:text-6xl">
          Governance intelligence, ready when you are.
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-8 text-zinc-400">
          Enter a tenant-scoped workspace for controls, risk, evidence, audits, policy, automation, and executive readiness.
        </p>
        <div className="mt-10 grid gap-3">
          {trustSignals.map((signal) => (
            <div key={signal} className="flex items-center gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-300 backdrop-blur-md">
              <span className="size-2 rounded-full bg-blue-400 shadow-[0_0_18px_rgba(96,165,250,0.9)]" />
              {signal}
            </div>
          ))}
        </div>
      </motion.div>

      <div className="text-xs text-zinc-600">Secured with Supabase Auth and Zig tenant isolation.</div>
    </div>
  );
}

function MobileBrand() {
  return (
    <div className="mb-8 lg:hidden">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-[0_0_34px_rgba(59,130,246,0.18)] backdrop-blur-xl">
          <Logo className="h-9 w-9" />
        </span>
        <div>
          <p className="text-sm font-semibold">Zig Governance OS</p>
          <p className="text-xs text-zinc-500">Secure command layer</p>
        </div>
      </div>
    </div>
  );
}

function AuthInput({
  label,
  name,
  type,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-zinc-200">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className="h-12 rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500 focus:bg-zinc-950 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.14)]"
      />
    </label>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 flex h-12 w-full items-center justify-center rounded-xl border border-blue-300/30 bg-zinc-900/50 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(59,130,246,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition hover:border-blue-300/60 hover:bg-zinc-900/70 disabled:cursor-wait disabled:opacity-80"
    >
      {pending ? <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : label}
    </button>
  );
}

function GoogleButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition hover:border-zinc-700 hover:bg-zinc-900/70 disabled:cursor-wait disabled:opacity-80"
    >
      {pending ? (
        <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        <>
          <span className="grid size-5 place-items-center rounded-full bg-white text-xs font-bold text-zinc-950">G</span>
          {label}
        </>
      )}
    </button>
  );
}
