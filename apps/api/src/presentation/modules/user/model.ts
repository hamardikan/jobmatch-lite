/**
 * User Module Models
 *
 * Request/response schemas for user profile management.
 */

import { t } from 'elysia';

export namespace UserModel {
  // Update profile request
  export const updateProfileRequest = t.Object({
    name: t.String({ minLength: 1, maxLength: 100 }),
  });

  export type UpdateProfileRequest = typeof updateProfileRequest.static;

  // Change password request
  export const changePasswordRequest = t.Object({
    currentPassword: t.String({ minLength: 8 }),
    newPassword: t.String({ minLength: 8 }),
  });

  export type ChangePasswordRequest = typeof changePasswordRequest.static;

  // User profile response
  export const profileResponse = t.Object({
    success: t.Literal(true),
    data: t.Object({
      id: t.String(),
      name: t.String(),
      email: t.String(),
    }),
  });

  // Success message response
  export const successMessageResponse = t.Object({
    success: t.Literal(true),
    data: t.Object({
      message: t.String(),
    }),
  });
}
