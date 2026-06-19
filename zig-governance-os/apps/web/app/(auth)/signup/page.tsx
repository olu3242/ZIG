import { AuthGateway } from "@/app/(auth)/AuthGateway";
import { googleOAuthAction, signupAction } from "@/app/lib/actions";

interface SignupPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  return (
    <AuthGateway
      mode="signup"
      action={signupAction}
      googleAction={googleOAuthAction}
      error={toParam(params?.error)}
      success={toParam(params?.success)}
    />
  );
}

function toParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
