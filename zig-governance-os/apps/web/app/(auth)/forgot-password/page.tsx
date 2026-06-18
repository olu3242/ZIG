import { AuthLink, AuthPanel, Field } from "@/app/(auth)/AuthPanel";
import { passwordResetAction } from "@/app/lib/actions";

export default function ForgotPasswordPage() {
  return (
    <AuthPanel
      title="Reset access"
      description="Request a Supabase Auth password reset link."
      footer={<>Remembered it? <AuthLink href="/login">Return to login</AuthLink></>}
    >
      <form action={passwordResetAction} className="grid gap-4">
        <Field label="Email" name="email" type="email" />
        <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">Send reset link</button>
      </form>
    </AuthPanel>
  );
}
