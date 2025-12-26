# Setting Up Google OAuth for JobMatch Lite

## Current State
The code is **already configured** for Google OAuth:
- Backend: `apps/api/src/infrastructure/auth/index.ts` has Google provider configured
- Frontend: `apps/web/src/components/auth-form.tsx` has Google sign-in button

**What's missing**: Google Cloud Console credentials and Vercel environment variables.

---

## Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Name it something like "JobMatch Lite"

### Step 2: Configure OAuth Consent Screen

1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type (unless you have a Google Workspace)
3. Fill in required fields:
   - **App name**: JobMatch Lite
   - **User support email**: your email
   - **Developer contact**: your email
4. Add scopes (click "Add or Remove Scopes"):
   - `email`
   - `profile`
   - `openid`
5. Add test users (your email) if in testing mode
6. Save and continue

### Step 3: Create OAuth Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Name: "JobMatch Lite Web"
5. **Add Authorized redirect URIs** (IMPORTANT - must match exactly):

   ```
   http://localhost:3001/api/auth/callback/google
   https://jobmatch-api-seven.vercel.app/api/auth/callback/google
   ```

   ⚠️ Note: The callback goes to the **API server** (port 3001 / api domain), NOT the frontend.

6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

### Step 4: Set Environment Variables

#### Local Development (`apps/api/.env`)
```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

#### Production (Vercel Dashboard)

Go to [Vercel Dashboard](https://vercel.com) → **jobmatch-api** project → **Settings** → **Environment Variables**

Add:
| Name | Value |
|------|-------|
| `GOOGLE_CLIENT_ID` | your-client-id-here.apps.googleusercontent.com |
| `GOOGLE_CLIENT_SECRET` | your-client-secret-here |

Then **redeploy** the API for changes to take effect:
```bash
cd apps/api && vercel --prod
```

---

## Callback URL Reference

| Environment | Callback URL |
|-------------|--------------|
| Local | `http://localhost:3001/api/auth/callback/google` |
| Production | `https://jobmatch-api-seven.vercel.app/api/auth/callback/google` |

---

## Verification Checklist

After setup, test the flow:
1. [ ] Go to https://jobmatch-web-mauve.vercel.app/login
2. [ ] Click "Google" button
3. [ ] Should redirect to Google sign-in
4. [ ] After Google auth, should redirect back to dashboard
5. [ ] User should be logged in

---

## Common Issues

| Issue | Solution |
|-------|----------|
| `redirect_uri_mismatch` | Callback URL in Google Console doesn't match exactly. Check for trailing slashes, http vs https. |
| `invalid_client` | Client ID or Secret is wrong. Re-copy from Google Console. |
| OAuth consent not showing | App may be in "Testing" mode. Add your email as a test user. |
| "Access blocked: App not verified" | Normal for testing. Click "Advanced" → "Go to JobMatch Lite (unsafe)" |

---

## No Code Changes Required

The following files are already correctly configured:
- `apps/api/src/infrastructure/auth/index.ts` - Google provider setup ✓
- `apps/web/src/components/auth-form.tsx` - Google sign-in button ✓
- `apps/web/src/lib/auth-client.ts` - Auth client with credentials ✓

---

## Sources

- [Better Auth Google Docs](https://www.better-auth.com/docs/authentication/google)
- [Google OAuth Setup Guide](https://developers.google.com/identity/protocols/oauth2)
