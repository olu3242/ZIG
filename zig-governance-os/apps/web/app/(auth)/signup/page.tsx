import { AuthLink, AuthPanel, Field } from "@/app/(auth)/AuthPanel";

export default function SignupPage() {
  return (
    <AuthPanel
      title="Create your tenant"
      description="Signup captures the tenant and first Tenant Admin in mock form so future Supabase auth can attach directly to the same contracts."
      footer={<>Already have access? <AuthLink href="/login">Log in</AuthLink></>}
    >
      <form className="grid gap-4">
        <Field label="Organization name" />
        <Field label="Workspace slug" />
        <Field label="Work email" type="email" />
        <Field label="Password" type="password" />
        <button className="rounded-md bg-[var(--zig-amber)] px-3 py-2 text-sm font-medium text-[var(--zig-ink)]">Create workspace</button>
      </form>
    </AuthPanel>
  );
}
