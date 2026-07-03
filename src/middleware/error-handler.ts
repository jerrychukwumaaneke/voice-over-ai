import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AuthError } from "../modules/auth/auth.service";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Please check your input and try again.",
      errors: err.issues.map((e) => ({ field: e.path.join("."), message: e.message })),
    });
  }

  if (err instanceof AuthError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({
    message: "Something went wrong on our end. Please try again shortly.",
  });
}