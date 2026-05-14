import type { NextFunction, Request, Response } from "express";

const LITERAL_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "[::1]",
]);

const TRUSTED_SUFFIXES = [
  ".up.railway.app",
  ".railway.app",
  ".onrender.com",
] as const;

function configuredAllowedHostnames(): string[] {
  const raw = process.env.ALLOWED_HOST?.trim();
  if (!raw) {
    return [];
  }
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function hostnameAllowedBySuffix(hostnameLower: string): boolean {
  for (const suffix of TRUSTED_SUFFIXES) {
    if (hostnameLower.endsWith(suffix)) {
      return true;
    }
  }
  return false;
}

/** Host header value as sent by the client (may include port). */
export function getRequestHostHeader(
  raw: string | string[] | undefined,
): string | undefined {
  if (typeof raw === "string") {
    return raw;
  }
  if (Array.isArray(raw) && raw.length > 0) {
    return raw[0];
  }
  return undefined;
}

/** Hostname only (port-stripped), lowercased, or null if invalid. */
export function parseRequestHostname(
  hostHeader: string,
): string | null {
  try {
    return new URL(`http://${hostHeader}`).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isAllowedRequestHostname(hostnameLower: string): boolean {
  if (LITERAL_HOSTNAMES.has(hostnameLower)) {
    return true;
  }
  if (hostnameAllowedBySuffix(hostnameLower)) {
    return true;
  }
  for (const allowed of configuredAllowedHostnames()) {
    if (hostnameLower === allowed) {
      return true;
    }
  }
  return false;
}

/**
 * DNS rebinding protection: allow only trusted Host values before routing.
 * Rejects with 400 when the Host hostname is not permitted.
 */
export function validateRequestHostMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const hostHeader = getRequestHostHeader(req.headers.host);
  if (!hostHeader) {
    res.status(400).send("Bad Request");
    return;
  }
  const hostname = parseRequestHostname(hostHeader);
  if (!hostname || !isAllowedRequestHostname(hostname)) {
    res.status(400).send("Bad Request");
    return;
  }
  next();
}
