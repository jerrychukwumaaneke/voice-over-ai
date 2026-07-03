import { Request, Response, NextFunction } from "express";
import { getProjectMembership } from "../modules/projects/project.service";

type ProjectRole = "admin" | "contributor" | "reviewer";

export function requireProjectRole(allowedRoles: ProjectRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const projectId = req.params.id;

    if (!projectId || Array.isArray(projectId)) {
      return res.status(400).json({ message: "Project ID is required." });
    }

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "You must be logged in." });
    }

    const membership = await getProjectMembership(projectId, userId);

    if (!membership) {
      return res.status(403).json({
        message: "You do not have access to this project.",
      });
    }

    if (!allowedRoles.includes(membership.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action.",
      });
    }

    next();
  };
}