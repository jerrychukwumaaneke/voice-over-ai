import { Request, Response, NextFunction } from "express";
import { createProjectSchema, updateProjectSchema } from "./project.schema";
import { createProject, updateProject, archiveProject } from "./project.service";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const organizationId = req.params.orgId;

    if (!organizationId || Array.isArray(organizationId)) {
      return res.status(400).json({ message: "Organization ID is required." });
    }

    const input = createProjectSchema.parse(req.body);
    const project = await createProject(organizationId, req.user!.userId, input);
    res.status(201).json({ message: "Project created successfully.", project });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = req.params.id;

    if (!projectId || Array.isArray(projectId)) {
      return res.status(400).json({ message: "Project ID is required." });
    }

    const input = updateProjectSchema.parse(req.body);
    const project = await updateProject(projectId, input);
    res.status(200).json({ message: "Project updated successfully.", project });
  } catch (err) {
    next(err);
  }
}

export async function archive(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = req.params.id;

    if (!projectId || Array.isArray(projectId)) {
      return res.status(400).json({ message: "Project ID is required." });
    }

    const project = await archiveProject(projectId);
    res.status(200).json({ message: "Project archived successfully.", project });
  } catch (err) {
    next(err);
  }
}