/**
 * User Module Controller
 *
 * Handles user profile and password management.
 */

import { Elysia } from 'elysia';
import { eq, and } from 'drizzle-orm';
import { UserModel } from './model';
import { db } from '../../../infrastructure/db';
import { user, account } from '../../../infrastructure/db/schema';
import { AppError } from '../../../shared/errors';
import { getAuthSession, type AuthContext } from '../../middleware/auth';

// Password hashing using Bun's built-in bcrypt-compatible hasher
async function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, {
    algorithm: 'bcrypt',
    cost: 10,
  });
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return Bun.password.verify(password, hash);
}

export const userModule = new Elysia({ prefix: '/api/user' })
  // Guard to require authentication
  .guard({
    async beforeHandle({ request: { headers }, set }) {
      const authContext = await getAuthSession(headers);
      if (!authContext) {
        set.status = 401;
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        };
      }
    },
  })
  .resolve(async ({ request: { headers } }) => {
    const authContext = (await getAuthSession(headers)) as AuthContext;
    return { user: authContext.user, session: authContext.session };
  })

  // Get current user profile
  .get(
    '/profile',
    async ({ user: authUser }) => {
      const [userData] = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
        })
        .from(user)
        .where(eq(user.id, authUser.id))
        .limit(1);

      if (!userData) {
        throw AppError.notFound('User not found');
      }

      return {
        success: true as const,
        data: userData,
      };
    },
    {
      response: {
        200: UserModel.profileResponse,
      },
      detail: {
        tags: ['User'],
        summary: 'Get current user profile',
        description: 'Returns the authenticated user\'s profile information.',
      },
    }
  )

  // Update profile (name)
  .put(
    '/profile',
    async ({ user: authUser, body }) => {
      const [updated] = await db
        .update(user)
        .set({
          name: body.name,
          updatedAt: new Date(),
        })
        .where(eq(user.id, authUser.id))
        .returning();

      if (!updated) {
        throw AppError.notFound('User not found');
      }

      return {
        success: true as const,
        data: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
        },
      };
    },
    {
      body: UserModel.updateProfileRequest,
      response: {
        200: UserModel.profileResponse,
      },
      detail: {
        tags: ['User'],
        summary: 'Update user profile',
        description: 'Updates the authenticated user\'s profile name.',
      },
    }
  )

  // Change password
  .post(
    '/password',
    async ({ user: authUser, body }) => {
      // Get the user's credential account
      const [userAccount] = await db
        .select()
        .from(account)
        .where(
          and(
            eq(account.userId, authUser.id),
            eq(account.providerId, 'credential')
          )
        )
        .limit(1);

      if (!userAccount || !userAccount.password) {
        throw AppError.badRequest('No password set for this account. You may have signed up with OAuth.');
      }

      // Verify current password
      const isValid = await verifyPassword(body.currentPassword, userAccount.password);
      if (!isValid) {
        throw AppError.badRequest('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await hashPassword(body.newPassword);

      // Update password
      await db
        .update(account)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(account.id, userAccount.id));

      return {
        success: true as const,
        data: {
          message: 'Password changed successfully',
        },
      };
    },
    {
      body: UserModel.changePasswordRequest,
      response: {
        200: UserModel.successMessageResponse,
      },
      detail: {
        tags: ['User'],
        summary: 'Change password',
        description: 'Changes the authenticated user\'s password. Requires current password for verification.',
      },
    }
  );
