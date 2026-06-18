import { AuthLink, AuthPanel, Field } from "@/app/(auth)/AuthPanel";
import { signupAction } from "@/app/lib/actions";

export default function SignupPage() {
  return (
    <AuthPanel
      title="Create your tenant"
      description="Create a Supabase Auth account, then continue to tenant onboarding."
      footer={<>Already have access? <AuthLink href="/login">Log in</AuthLink></>}
    >
      <form action={signupAction} className="grid gap-4">
        <Field label="Work email" name="email" type="email" />
        <Field label="Password" name="password" type="password" />
        <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">Create account</button>
      </form>
    </AuthPanel>
  );
}
