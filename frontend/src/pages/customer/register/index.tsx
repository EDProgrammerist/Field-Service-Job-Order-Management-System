import { CustomerRegistrationForm } from "@/components/features/auth/customer-registration-form";
import { RegistrationLayout } from "@/components/public/auth/registration-layout";

export default function CustomerRegisterPage() {
  return (
    <RegistrationLayout>
      <CustomerRegistrationForm />
    </RegistrationLayout>
  );
}
