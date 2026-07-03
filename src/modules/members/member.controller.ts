import { Request, Response, NextFunction } from "express";
import { inviteMemberSchema, assignRoleSchema } from "./member.schema";
import {
  inviteToOrganization,
  inviteToProject,
  acceptInvitation,
  assignOrgMemberRole,
  assignProjectMemberRole,
} from "./member.service";

function getParam(req: Request, name: string): string | null {
  const value = req.params[name];
  if (!value || Array.isArray(value)) return null;
  return value;
}

export async function inviteOrgMember(req: Request, res: Response, next: NextFunction) {
  try {
    const organizationId = getParam(req, "orgId");
    if (!organizationId) {
      return res.status(400).json({ message: "Organization ID is required." });
    }

    const input = inviteMemberSchema.parse(req.body);
    const invitation = await inviteToOrganization(organizationId, req.user!.userId, input);
    res.status(201).json({ message: "Invitation sent successfully.", invitation });
  } catch (err) {
    next(err);
  }
}

export async function inviteProjectMember(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = getParam(req, "id");
    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required." });
    }

    const input = inviteMemberSchema.parse(req.body);
    const invitation = await inviteToProject(projectId, req.user!.userId, input);
    res.status(201).json({ message: "Invitation sent successfully.", invitation });
  } catch (err) {
    next(err);
  }
}

export async function accept(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getParam(req, "token");
    if (!token) {
      return res.status(400).json({ message: "Invitation token is required." });
    }

    const result = await acceptInvitation(token, req.user!.userId, req.user!.email);
    res.status(200).json({ message: "Invitation accepted successfully.", membership: result });
  } catch (err) {
    next(err);
  }
}

export async function assignOrgRole(req: Request, res: Response, next: NextFunction) {
  try {
    const organizationId = getParam(req, "orgId");
    const targetUserId = getParam(req, "userId");

    if (!organizationId || !targetUserId) {
      return res.status(400).json({ message: "Organization ID and user ID are required." });
    }

    const input = assignRoleSchema.parse(req.body);
    const updated = await assignOrgMemberRole(organizationId, targetUserId, input);
    res.status(200).json({ message: "Role updated successfully.", membership: updated });
  } catch (err) {
    next(err);
  }
}

export async function assignProjectRole(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = getParam(req, "id");
    const targetUserId = getParam(req, "userId");

    if (!projectId || !targetUserId) {
      return res.status(400).json({ message: "Project ID and user ID are required." });
    }

    const input = assignRoleSchema.parse(req.body);
    const updated = await assignProjectMemberRole(projectId, targetUserId, input);
    res.status(200).json({ message: "Role updated successfully.", membership: updated });
  } catch (err) {
    next(err);
  }
}