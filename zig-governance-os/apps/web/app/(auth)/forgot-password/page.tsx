import { AuthLink, AuthPanel, Field } from "@/app/(auth)/AuthPanel";

export default function ForgotPasswordPage() {
  return (
    <AuthPanel
      title="Reset access"
      description="Password recovery UI for the authentication route group. This intentionally has no provider integration in Batch 2."
      footer={<>Remembered it? <AuthLink href="/login">Return to login</AuthLink></>}
    >
      <form className="grid gap-4">
        <Field label="Email" type="email" />
        <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">Send reset link</button>
      </form>
    </AuthPanel>
  );
}
