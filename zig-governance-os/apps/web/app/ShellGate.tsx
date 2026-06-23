"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { OSShell } from "./OSShell";

const publicRoutes = new Set(["/", "/demo", "/login", "/signup", "/forgot-password"]);

export function ShellGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (publicRoutes.has(pathname)) {
    return <>{children}</>;
  }

  return <OSShell>{children}</OSShell>;
}
