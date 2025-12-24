'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';

export function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (isPending) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  if (!session?.user) {
    return (
      <div className="flex gap-2">
        <a
          href="/login"
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Sign In
        </a>
        <a
          href="/register"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Sign Up
        </a>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="relative" data-testid="user-menu">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
        data-testid="user-menu-button"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
          {session.user.name?.[0]?.toUpperCase() || session.user.email[0].toUpperCase()}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {session.user.name || session.user.email}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            </div>
            <a
              href="/history"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Analysis History
            </a>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              data-testid="sign-out-button"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
