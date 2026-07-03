import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AuthError } from "../modules/auth/auth.service";
import { OrgError } from "../modules/organizations/organization.service";
import { ProjectError } from "../modules/projects/project.service";
import { MemberError } from "../modules/members/member.service";

// alongside the other checks



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

  
    if (err instanceof ProjectError) {
      return res.status(err.statusCode).json({ message: err.message });
    }

  if (err instanceof OrgError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof MemberError) {
  return res.status(err.statusCode).json({ message: err.message });
}

  console.error(err);
  return res.status(500).json({
    message: "Something went wrong on our end. Please try again shortly.",
  });
}