import AuthLayout        from "../components/shared/AuthLayout.jsx";
import ResetPasswordForm from "../components/auth/ResetPasswordForm.jsx";

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Set new password"
      subtitle="Choose a strong password for your account"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
