import { AuthLink, AuthPanel, Field } from "@/app/(auth)/AuthPanel";

export default function LoginPage() {
  return (
    <AuthPanel
      title="Log in to Zig"
      description="UI-only authentication entry point for the Batch 2 identity foundation. Provider wiring comes after the tenant model is stable."
      footer={<>Need a workspace? <AuthLink href="/signup">Create one</AuthLink></>}
    >
      <form className="grid gap-4">
        <Field label="Email" type="email" />
        <Field label="Password" type="password" />
        <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">Log in</button>
        <AuthLink href="/forgot-password">Forgot password?</AuthLink>
      </form>
    </AuthPanel>
  );
}
