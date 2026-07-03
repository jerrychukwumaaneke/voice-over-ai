import { Request, Response, NextFunction } from "express";
import { getOrgMembership } from "../modules/organizations/organization.service";

type OrgRole = "owner" | "admin" | "member";

export function requireOrgRole(allowedRoles: OrgRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const organizationId = req.params.id;

    if (!organizationId || Array.isArray(organizationId)) {
      return res.status(400).json({ message: "Organization ID is required." });
    }

    const userId = req.user?.userId;
    

    if (!userId) {
      return res.status(401).json({ message: "You must be logged in." });
    }

    const membership = await getOrgMembership(organizationId, userId);

    if (!membership) {
      return res.status(403).json({
        message: "You do not have access to this organization.",
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