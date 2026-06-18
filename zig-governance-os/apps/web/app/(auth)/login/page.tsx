import { AuthLink, AuthPanel, Field } from "@/app/(auth)/AuthPanel";
import { loginAction } from "@/app/lib/actions";

export default function LoginPage() {
  return (
    <AuthPanel
      title="Log in to Zig"
      description="Sign in with Supabase Auth, then load your tenant, role, and persona context."
      footer={<>Need a workspace? <AuthLink href="/signup">Create one</AuthLink></>}
    >
      <form action={loginAction} className="grid gap-4">
        <Field label="Email" name="email" type="email" />
        <Field label="Password" name="password" type="password" />
        <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">Log in</button>
        <AuthLink href="/forgot-password">Forgot password?</AuthLink>
      </form>
    </AuthPanel>
  );
}
