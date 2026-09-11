import { LoginForm } from "@/components/features/auth/login-form";
import { SignInLayout } from "@/components/public/auth/sign-in-layout";

export default function LoginPage() {
  return (
    <SignInLayout>
      <LoginForm />
    </SignInLayout>
  );
}
