"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useEffect } from "react";
import Logo from "./Logo";

interface OSInitializationContextValue {
  isInitializing: boolean;
  beginInitialization: () => void;
}

const OSInitializationContext = createContext<OSInitializationContextValue | null>(null);
const publicRoutes = new Set(["/", "/login", "/signup", "/forgot-password"]);

export function OSInitializationProvider({ children }: { children: ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!isInitializing || publicRoutes.has(pathname)) {
      return;
    }

    const timeout = window.setTimeout(() => setIsInitializing(false), 800);
    return () => window.clearTimeout(timeout);
  }, [isInitializing, pathname]);

  const value = useMemo(
    () => ({
      isInitializing,
      beginInitialization: () => setIsInitializing(true),
    }),
    [isInitializing],
  );

  return (
    <OSInitializationContext.Provider value={value}>
      {children}
      <AnimatePresence>{isInitializing ? <BootScreen /> : null}</AnimatePresence>
    </OSInitializationContext.Provider>
  );
}

export function useOSInitialization() {
  const context = useContext(OSInitializationContext);
  if (!context) {
    throw new Error("useOSInitialization must be used inside OSInitializationProvider.");
  }
  return context;
}

function BootScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(14px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(18px)" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="fixed inset-0 z-50 grid place-items-center bg-zinc-950 text-white"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 50% 20%, rgba(59,130,246,0.16), transparent 30%), linear-gradient(135deg, rgba(9,9,11,1), rgba(3,7,18,1))",
        }}
      />
      <div className="relative grid place-items-center gap-5">
        <motion.div
          animate={{ opacity: [0.72, 1, 0.72], scale: [0.98, 1.03, 0.98] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 shadow-[0_0_54px_rgba(59,130,246,0.26)] backdrop-blur-xl"
        >
          <Logo className="h-14 w-14" />
        </motion.div>
        <motion.p
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="font-mono text-xs font-semibold uppercase tracking-[0.45em] text-zinc-300"
        >
          INITIALIZING ZIG OS...
        </motion.p>
      </div>
    </motion.div>
  );
}
