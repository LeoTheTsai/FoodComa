import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

export type UserContext = { id: string; email: string; name?: string } | null;

const ACCESS_COOKIE = "fc_access";
const REFRESH_COOKIE = "fc_refresh";
const JWT_SECRET = process.env.JWT_SECRET!;
const ACCESS_TTL_MIN = Number(process.env.ACCESS_TTL_MIN || 15);
const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TTL_DAYS || 7);

export function signAccessToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${ACCESS_TTL_MIN}m` });
}
export function signRefreshToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${REFRESH_TTL_DAYS}d` });
}
export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as any;
}

export function setAuthCookies(res: Response, access: string, refresh: string) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie(ACCESS_COOKIE, access, {
    httpOnly: true, secure: isProd, sameSite: "lax",
    maxAge: ACCESS_TTL_MIN * 60 * 1000, path: "/"
  });
  res.cookie(REFRESH_COOKIE, refresh, {
    httpOnly: true, secure: isProd, sameSite: "lax",
    maxAge: REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000, path: "/"
  });
}
export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { path: "/" });
  res.clearCookie(REFRESH_COOKIE, { path: "/" });
}

export function authFromReq(req: Request): UserContext {
  try {
    const token = (req.cookies?.[ACCESS_COOKIE] as string) || "";
    if (!token) return null;
    const decoded = verifyToken(token);
    return { id: decoded.id, email: decoded.email, name: decoded.name };
  } catch { return null; }
}
export function getRefreshFromReq(req: Request): any | null {
  try {
    const token = (req.cookies?.[REFRESH_COOKIE] as string) || "";
    if (!token) return null;
    return verifyToken(token);
  } catch { return null; }
}
