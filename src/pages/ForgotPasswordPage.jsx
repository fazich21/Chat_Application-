import AuthLayout       from "../components/shared/AuthLayout.jsx";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm.jsx";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll send a link to your inbox"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
