import AuthLayout from "../components/shared/AuthLayout.jsx";
import LoginForm  from "../components/auth/LoginForm.jsx";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to Pulse"
    >
      <LoginForm />
    </AuthLayout>
  );
}
