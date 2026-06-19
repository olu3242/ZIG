# Auth Flow

## Email Signup

1. User submits `/signup`.
2. Supabase creates the auth user.
3. Zig stores the session cookie.
4. Zig upserts `profiles`.
5. Zig writes `auth_events.signup`.
6. User is routed to `/onboarding`.

## Email Login

1. User submits `/login`.
2. Supabase validates credentials.
3. Zig stores the session cookie.
4. Zig upserts `profiles`.
5. Zig writes `auth_events.login`.
6. Existing tenant users route to `/dashboard`; new users route to `/onboarding`.

## Google OAuth

1. User clicks Google on `/login` or `/signup`.
2. Zig starts Supabase Google OAuth with `/oauth/callback`.
3. Callback exchanges the auth code for a Supabase session.
4. Zig stores session/profile/audit state.
5. User routes to `/dashboard` or `/onboarding`.

## Password Reset

1. User submits `/forgot-password`.
2. Supabase sends recovery email.
3. Zig writes `auth_events.password_reset_requested`.
