import { pgEnum } from "drizzle-orm/pg-core";

export const orgRoleEnum = pgEnum("org_role", ["owner", "admin", "member"]);

export const projectRoleEnum = pgEnum("project_role", [
  "admin",
  "contributor",
  "reviewer",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "active",
  "archived",
]);

export const invitationScopeEnum = pgEnum("invitation_scope", [
  "organization",
  "project",
]);

export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "revoked",
  "expired",
]);