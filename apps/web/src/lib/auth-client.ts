/**
 * Better-Auth Client Configuration
 *
 * Client-side auth configuration for the frontend.
 */

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  fetchOptions: {
    credentials: 'include',
  },
});

// Export commonly used methods
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
