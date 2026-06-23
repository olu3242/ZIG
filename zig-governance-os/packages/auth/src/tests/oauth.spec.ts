import { startGoogleOAuth } from "../google";

export type GoogleOAuthStarter = typeof startGoogleOAuth;

export const googleOAuthRedirectContract: { provider: "google"; callbackPath: "/oauth/callback" } = {
  provider: "google",
  callbackPath: "/oauth/callback",
};
