import { AuthGateway } from "@/app/(auth)/AuthGateway";
import { loginAction } from "@/app/lib/actions";

export default function LoginPage() {
  return <AuthGateway mode="login" action={loginAction} />;
}
