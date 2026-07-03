import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import {
  invitations,
  organizationMembers,
  projectMembers,
} from "../../db/schema";
import { generateToken } from "../../utils/token";
import type { InviteMemberInput, AssignRoleInput } from "./member.schema";

export class MemberError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
  }
}

const ORG_ROLES = ["owner", "admin", "member"];
const PROJECT_ROLES = ["admin", "contributor", "reviewer"];

// ---------- Invitations ----------

export async function inviteToOrganization(
  organizationId: string,
  invitedBy: string,
  input: InviteMemberInput,
) {
  if (!ORG_ROLES.includes(input.role)) {
    throw new MemberError(
      `Role must be one of: ${ORG_ROLES.join(", ")}`,
      400,
    );
  }

  const [invitation] = await db
    .insert(invitations)
    .values({
      scope: "organization",
      organizationId,
      email: input.email,
      role: input.role,
      token: generateToken(),
      invitedBy,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })
    .returning();

  // TODO: send invitation email once email provider is wired in

  return invitation;
}

export async function inviteToProject(
  projectId: string,
  invitedBy: string,
  input: InviteMemberInput,
) {
  if (!PROJECT_ROLES.includes(input.role)) {
    throw new MemberError(
      `Role must be one of: ${PROJECT_ROLES.join(", ")}`,
      400,
    );
  }

  const [invitation] = await db
    .insert(invitations)
    .values({
      scope: "project",
      projectId,
      email: input.email,
      role: input.role,
      token: generateToken(),
      invitedBy,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
    .returning();

  // TODO: send invitation email once email provider is wired in

  return invitation;
}

// ---------- Acceptance ----------

export async function acceptInvitation(token: string, userId: string, userEmail: string) {
  const invitation = await db.query.invitations.findFirst({
    where: eq(invitations.token, token),
  });

  if (!invitation) {
    throw new MemberError("Invitation not found.", 404);
  }

  if (invitation.status !== "pending") {
    throw new MemberError("This invitation is no longer valid.", 410);
  }

  if (invitation.expiresAt < new Date()) {
    await db
      .update(invitations)
      .set({ status: "expired" })
      .where(eq(invitations.id, invitation.id));
    throw new MemberError("This invitation has expired.", 410);
  }

  if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
    throw new MemberError(
      "This invitation was sent to a different email address.",
      403,
    );
  }

  if (invitation.scope === "organization" && invitation.organizationId) {
    await db
      .insert(organizationMembers)
      .values({
        organizationId: invitation.organizationId,
        userId,
        role: invitation.role as "owner" | "admin" | "member",
      })
      .onConflictDoNothing();
  }

  if (invitation.scope === "project" && invitation.projectId) {
    await db
      .insert(projectMembers)
      .values({
        projectId: invitation.projectId,
        userId,
        role: invitation.role as "admin" | "contributor" | "reviewer",
      })
      .onConflictDoNothing();
  }

  const [accepted] = await db
    .update(invitations)
    .set({ status: "accepted" })
    .where(eq(invitations.id, invitation.id))
    .returning();

  return accepted;
}

// ---------- Role assignment ----------

export async function assignOrgMemberRole(
  organizationId: string,
  targetUserId: string,
  input: AssignRoleInput,
) {
  if (!ORG_ROLES.includes(input.role)) {
    throw new MemberError(`Role must be one of: ${ORG_ROLES.join(", ")}`, 400);
  }

  const [updated] = await db
    .update(organizationMembers)
    .set({ role: input.role as "owner" | "admin" | "member" })
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, targetUserId),
      ),
    )
    .returning();

  if (!updated) {
    throw new MemberError("Member not found in this organization.", 404);
  }

  return updated;
}

export async function assignProjectMemberRole(
  projectId: string,
  targetUserId: string,
  input: AssignRoleInput,
) {
  if (!PROJECT_ROLES.includes(input.role)) {
    throw new MemberError(
      `Role must be one of: ${PROJECT_ROLES.join(", ")}`,
      400,
    );
  }

  const [updated] = await db
    .update(projectMembers)
    .set({ role: input.role as "admin" | "contributor" | "reviewer" })
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, targetUserId),
      ),
    )
    .returning();

  if (!updated) {
    throw new MemberError("Member not found in this project.", 404);
  }

  return updated;
}