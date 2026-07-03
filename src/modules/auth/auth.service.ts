import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users, refreshTokens } from "../../db/schema";
import { hashPassword, comparePassword } from "../../utils/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import type { RegisterInput, LoginInput } from "./auth.schema";
import crypto from "crypto";

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
  ) {
    super(message);
  }
}

export async function registerUser(input: RegisterInput) {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (existing) {
    throw new AuthError("An account with this email already exists.", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const [newUser] = await db
    .insert(users)
    .values({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
    })
    .returning();

  // TODO: trigger email verification send once email provider is wired in

  return { id: newUser.id, email: newUser.email };
}

export async function loginUser(input: LoginInput) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (!user) {
    throw new AuthError("Invalid email or password.", 401);
  }

  const validPassword = await comparePassword(input.password, user.passwordHash);

  if (!validPassword) {
    throw new AuthError("Invalid email or password.", 401);
  }

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken(user.id);

  // store a hash of the refresh token, not the raw token
  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, fullName: user.fullName },
  };
}