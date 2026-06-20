"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { OSShell } from "./OSShell";

const publicRoutes = new Set(["/", "/login", "/signup", "/forgot-password"]);

export function ShellGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (publicRoutes.has(pathname) || pathname.startsWith("/trust/")) {
    return <>{children}</>;
  }

  return <OSShell>{children}</OSShell>;
}
