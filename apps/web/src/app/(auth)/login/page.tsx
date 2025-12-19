import { AuthForm } from '@/components/auth-form';

export const metadata = {
  title: 'Login - JobMatch Lite',
  description: 'Sign in to your JobMatch Lite account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <AuthForm mode="login" />
    </div>
  );
}
