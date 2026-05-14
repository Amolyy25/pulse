import { NextFunction, Request, Response } from "express";
import { TokenExpiredError } from "jsonwebtoken";
import { verifyAccessToken, AccessPayload } from "../lib/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: AccessPayload;
    }
  }
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "missing or malformed Authorization header" });
  }
  const token = header.slice(7).trim();
  if (!token) {
    return res.status(401).json({ error: "missing token" });
  }
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.id, email: payload.email };
    return next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return res.status(403).json({ error: "token expired" });
    }
    return res.status(401).json({ error: "invalid token" });
  }
}
