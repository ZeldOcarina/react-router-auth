import { OAuth2Client } from "google-auth-library";
import { env } from "~/env";

const oauthClient = new OAuth2Client({
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  redirectUri: env.GOOGLE_REDIRECT_URI,
});

export const generateGoogleAuthUrl = (state: string) => {
  return oauthClient.generateAuthUrl({
    access_type: "online",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    state,
  });
};

export const getTokenFromCode = async (code: string) => {
  const { tokens } = await oauthClient.getToken(code);
  if (!tokens.id_token) {
    throw new Error("Something went wrong. Please try again later.");
  }

  const payload = await oauthClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const idTokenBody = payload.getPayload();

  if (!idTokenBody) {
    throw new Error("Something went wrong. Please try again later.");
  }

  return idTokenBody;
};
