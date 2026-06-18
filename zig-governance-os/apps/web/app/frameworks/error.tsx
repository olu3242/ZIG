"use client";

export default function FrameworksError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-lg border border-[var(--zig-amber)] bg-[var(--zig-paper-2)] p-5">
      <h1 className="font-display text-xl font-semibold">Framework library needs a refresh</h1>
      <p className="mt-2 text-sm text-[var(--zig-ink-muted)]">{error.message}</p>
      <button className="mt-4 rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]" onClick={reset}>Try again</button>
    </div>
  );
}
