import { NextResponse } from "next/server";
import { DriveReauthRequiredError } from "./oauth";

// Centralises Drive route error responses. Without this, an uncaught throw
// becomes an empty 500 — the browser's res.json() then errors with
// "Unexpected end of JSON input" and the UI shows nothing useful.
export function driveErrorResponse(err: unknown) {
  if (err instanceof DriveReauthRequiredError) {
    return NextResponse.json(
      { error: err.message, code: err.code },
      { status: 401 },
    );
  }
  const message = err instanceof Error ? err.message : String(err);
  console.error("[drive route]", err);
  return NextResponse.json({ error: message }, { status: 500 });
}
