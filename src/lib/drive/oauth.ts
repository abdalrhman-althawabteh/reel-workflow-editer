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

// Thrown when Google rejects the stored refresh token (revoked, expired, or
// the OAuth client changed). Routes translate this into a 401 with a code
// the UI uses to prompt the creator to reconnect Drive.
export class DriveReauthRequiredError extends Error {
  code = "drive_reauth_required" as const;
  constructor(message = "Drive refresh token is invalid — creator must reconnect Drive") {
    super(message);
    this.name = "DriveReauthRequiredError";
  }
}

export async function getAccessToken(refreshToken: string) {
  const auth = makeOAuth2();
  auth.setCredentials({ refresh_token: refreshToken });
  try {
    const { credentials } = await auth.refreshAccessToken();
    if (!credentials.access_token) {
      throw new Error("No access token returned from Google");
    }
    return credentials.access_token;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/invalid_grant|Token has been expired or revoked|unauthorized_client/i.test(msg)) {
      throw new DriveReauthRequiredError();
    }
    throw err;
  }
}
