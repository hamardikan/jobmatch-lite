import { AuthForm } from '@/components/auth-form';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export const metadata = {
  title: 'Login - JobMatch Lite',
  description: 'Sign in to your JobMatch Lite account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Theme toggle in corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Centered form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <AuthForm mode="login" />
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-foreground-muted">
        <p>Built with Next.js, ElysiaJS, and AI</p>
      </footer>
    </div>
  );
}
