import { AuthForm } from '@/components/auth-form';

export const metadata = {
  title: 'Register - JobMatch Lite',
  description: 'Create a JobMatch Lite account',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <AuthForm mode="register" />
    </div>
  );
}
