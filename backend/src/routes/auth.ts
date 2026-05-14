import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { TokenExpiredError } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import {
  loginSchema,
  refreshSchema,
  registerSchema,
} from "../schemas/auth";
import {
  REFRESH_EXPIRES_MS,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../lib/jwt";

const router = Router();

function publicUser(u: {
  id: string;
  username: string;
  email: string;
  xp: number;
  gems: number;
  level: number;
  created_at: Date;
}) {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    xp: u.xp,
    gems: u.gems,
    level: u.level,
    created_at: u.created_at,
  };
}

async function issueTokens(user: { id: string; email: string }) {
  const access_token = signAccessToken({ id: user.id, email: user.email });
  const refresh_token = signRefreshToken({ id: user.id, email: user.email });
  await prisma.refreshToken.create({
    data: {
      user_id: user.id,
      token: refresh_token,
      expires_at: new Date(Date.now() + REFRESH_EXPIRES_MS),
    },
  });
  return { access_token, refresh_token };
}

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = registerSchema.parse(req.body);
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return res.status(409).json({ error: "email or username already in use" });
    }
    const password_hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { username, email, password_hash },
    });
    const tokens = await issueTokens({ id: user.id, email: user.email });
    return res.status(201).json({ user: publicUser(user), ...tokens });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: "validation failed", details: err.flatten() });
    }
    console.error(err);
    return res.status(500).json({ error: "internal error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "invalid credentials" });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "invalid credentials" });
    }
    const tokens = await issueTokens({ id: user.id, email: user.email });
    return res.json({ user: publicUser(user), ...tokens });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: "validation failed", details: err.flatten() });
    }
    console.error(err);
    return res.status(500).json({ error: "internal error" });
  }
});

router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refresh_token } = refreshSchema.parse(req.body);
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refresh_token },
    });
    if (!stored) {
      return res.status(401).json({ error: "invalid refresh token" });
    }
    if (stored.expires_at.getTime() < Date.now()) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
      return res.status(401).json({ error: "refresh token expired" });
    }
    const payload = verifyRefreshToken(refresh_token);
    const access_token = signAccessToken({ id: payload.id, email: payload.email });
    return res.json({ access_token });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: "validation failed", details: err.flatten() });
    }
    if (err instanceof TokenExpiredError) {
      return res.status(401).json({ error: "refresh token expired" });
    }
    return res.status(401).json({ error: "invalid refresh token" });
  }
});

router.post("/logout", async (req: Request, res: Response) => {
  try {
    const { refresh_token } = refreshSchema.parse(req.body);
    await prisma.refreshToken.deleteMany({ where: { token: refresh_token } });
    return res.json({ ok: true });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: "validation failed", details: err.flatten() });
    }
    console.error(err);
    return res.status(500).json({ error: "internal error" });
  }
});

export default router;
