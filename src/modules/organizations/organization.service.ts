import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { organizations, organizationMembers } from "../../db/schema";
import { slugify } from "../../utils/slug";
import type { CreateOrganizationInput, UpdateOrganizationInput } from "./organization.schema";

export class OrgError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
  }
}

export async function createOrganization(userId: string, input: CreateOrganizationInput) {
  const slug = slugify(input.name);

  const [org] = await db
    .insert(organizations)
    .values({ name: input.name, slug, ownerId: userId })
    .returning();

  // creator is automatically the "owner" member
  await db.insert(organizationMembers).values({
    organizationId: org.id,
    userId,
    role: "owner",
  });

  return org;
}

export async function updateOrganization(
  organizationId: string,
  input: UpdateOrganizationInput,
) {
  const [updated] = await db
    .update(organizations)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(organizations.id, organizationId))
    .returning();

  if (!updated) {
    throw new OrgError("Organization not found.", 404);
  }

  return updated;
}

export async function getOrgMembership(organizationId: string, userId: string) {
  return db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.organizationId, organizationId),
      eq(organizationMembers.userId, userId),
    ),
  });
}