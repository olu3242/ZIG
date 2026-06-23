import { AuthGateway } from "@/app/(auth)/AuthGateway";
import { googleOAuthAction, loginAction } from "@/app/lib/actions";

interface LoginPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  return (
    <AuthGateway
      mode="login"
      action={loginAction}
      googleAction={googleOAuthAction}
      error={toParam(params?.error)}
      success={toParam(params?.success)}
    />
  );
}

function toParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
