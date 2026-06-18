"use client";

export default function OnboardingError({ error }: { error: Error }) {
  return <p className="rounded-md border border-[var(--zig-amber)] p-4 text-sm">{error.message}</p>;
}
