import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";
export const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

export type AccessPayload = { id: string; email: string };

export function signAccessToken(payload: AccessPayload): string {
  const opts: SignOptions = { expiresIn: ACCESS_EXPIRES_IN };
  return jwt.sign(payload, ACCESS_SECRET, opts);
}

export function signRefreshToken(payload: AccessPayload): string {
  const opts: SignOptions = { expiresIn: REFRESH_EXPIRES_IN };
  return jwt.sign(payload, REFRESH_SECRET, opts);
}

export function verifyAccessToken(token: string): AccessPayload & JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessPayload & JwtPayload;
}

export function verifyRefreshToken(token: string): AccessPayload & JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as AccessPayload & JwtPayload;
}
