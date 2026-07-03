import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "./auth.schema";
import { registerUser, loginUser } from "./auth.service";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);
    const user = await registerUser(input);
    res.status(201).json({ message: "Account created successfully.", user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await loginUser(input);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response) {
  res.status(200).json({ user: req.user });
}