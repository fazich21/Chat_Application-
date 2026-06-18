import AuthLayout  from "../components/shared/AuthLayout.jsx";
import RegisterForm from "../components/auth/RegisterForm.jsx";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Pulse and start chatting in seconds"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
