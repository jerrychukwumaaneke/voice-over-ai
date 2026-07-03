import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { projects, projectMembers } from "../../db/schema";
import type { CreateProjectInput, UpdateProjectInput } from "./project.schema";

export class ProjectError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
  }
}

export async function createProject(
  organizationId: string,
  userId: string,
  input: CreateProjectInput,
) {
  const [project] = await db
    .insert(projects)
    .values({
      organizationId,
      name: input.name,
      description: input.description,
      createdBy: userId,
    })
    .returning();

  // creator automatically becomes the project's admin
  await db.insert(projectMembers).values({
    projectId: project.id,
    userId,
    role: "admin",
  });

  return project;
}

export async function updateProject(projectId: string, input: UpdateProjectInput) {
  const [updated] = await db
    .update(projects)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(projects.id, projectId))
    .returning();

  if (!updated) {
    throw new ProjectError("Project not found.", 404);
  }

  return updated;
}

export async function archiveProject(projectId: string) {
  const [archived] = await db
    .update(projects)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(projects.id, projectId))
    .returning();

  if (!archived) {
    throw new ProjectError("Project not found.", 404);
  }

  return archived;
}

export async function getProjectMembership(projectId: string, userId: string) {
  return db.query.projectMembers.findFirst({
    where: and(
      eq(projectMembers.projectId, projectId),
      eq(projectMembers.userId, userId),
    ),
  });
}