import { google } from "googleapis";
import { getAccessToken, makeOAuth2 } from "./oauth";

const ROOT_FOLDER_NAME = process.env.DRIVE_ROOT_FOLDER_NAME ?? "Reel Workspace";

export async function ensureRootFolder(refreshToken: string) {
  const auth = makeOAuth2();
  auth.setCredentials({ refresh_token: refreshToken });
  const drive = google.drive({ version: "v3", auth });

  const { data } = await drive.files.list({
    q: `name='${ROOT_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
    spaces: "drive",
  });

  if (data.files && data.files.length > 0 && data.files[0].id) {
    return data.files[0].id;
  }

  const created = await drive.files.create({
    requestBody: {
      name: ROOT_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  });

  if (!created.data.id) throw new Error("Failed to create Drive folder");
  return created.data.id;
}

const B_ROLLS_FOLDER_NAME = "B-rolls Library";

// Ensures (and caches) a "B-rolls Library" subfolder under the workspace root,
// then returns its Drive folder id.
export async function ensureBRollsFolder(
  refreshToken: string,
  rootFolderId: string,
) {
  const auth = makeOAuth2();
  auth.setCredentials({ refresh_token: refreshToken });
  const drive = google.drive({ version: "v3", auth });

  const { data } = await drive.files.list({
    q: `name='${B_ROLLS_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and '${rootFolderId}' in parents and trashed=false`,
    fields: "files(id, name)",
    spaces: "drive",
  });

  if (data.files && data.files.length > 0 && data.files[0].id) {
    return data.files[0].id;
  }

  const created = await drive.files.create({
    requestBody: {
      name: B_ROLLS_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
      parents: [rootFolderId],
    },
    fields: "id",
  });

  if (!created.data.id) throw new Error("Failed to create B-rolls folder");
  return created.data.id;
}

// Mints a Drive resumable upload session URL. Browser will PUT bytes directly.
// Docs: https://developers.google.com/drive/api/guides/manage-uploads#resumable
export async function createResumableUploadSession({
  refreshToken,
  folderId,
  filename,
  mimeType,
  size,
  origin,
}: {
  refreshToken: string;
  folderId: string;
  filename: string;
  mimeType: string;
  size: number;
  /** Browser origin that will PUT chunks. Drive ties the session to this for CORS. */
  origin: string;
}) {
  const accessToken = await getAccessToken(refreshToken);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": mimeType,
        "X-Upload-Content-Length": String(size),
        Origin: origin,
      },
      body: JSON.stringify({ name: filename, parents: [folderId] }),
    },
  );

  if (!res.ok) {
    throw new Error(`Drive session init failed: ${res.status} ${await res.text()}`);
  }

  const sessionUrl = res.headers.get("location");
  if (!sessionUrl) throw new Error("Drive did not return a session URL");
  return sessionUrl;
}

export async function getDriveFileMetadata(refreshToken: string, fileId: string) {
  const auth = makeOAuth2();
  auth.setCredentials({ refresh_token: refreshToken });
  const drive = google.drive({ version: "v3", auth });
  const { data } = await drive.files.get({
    fileId,
    fields: "id, name, size, mimeType, webViewLink, webContentLink",
  });
  return data;
}

export async function makeFileShareable(refreshToken: string, fileId: string) {
  const auth = makeOAuth2();
  auth.setCredentials({ refresh_token: refreshToken });
  const drive = google.drive({ version: "v3", auth });
  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });
}

// Returns a short-lived signed URL the browser can play in a <video> tag.
export async function getStreamableUrl(refreshToken: string, fileId: string) {
  const accessToken = await getAccessToken(refreshToken);
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${accessToken}`;
}
