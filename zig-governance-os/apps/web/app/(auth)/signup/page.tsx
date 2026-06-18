import { AuthGateway } from "@/app/(auth)/AuthGateway";
import { signupAction } from "@/app/lib/actions";

export default function SignupPage() {
  return <AuthGateway mode="signup" action={signupAction} />;
}
