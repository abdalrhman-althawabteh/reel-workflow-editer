import { google } from "googleapis";

export const DRIVE_SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
];

export function makeOAuth2() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
  );
}

export async function getAccessToken(refreshToken: string) {
  const auth = makeOAuth2();
  auth.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await auth.refreshAccessToken();
  if (!credentials.access_token) {
    throw new Error("No access token returned from Google");
  }
  return credentials.access_token;
}
