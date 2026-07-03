import { Router } from "express";
import {
  inviteOrgMember,
  inviteProjectMember,
  accept,
  assignOrgRole,
  assignProjectRole,
} from "./member.controller";
import { authenticate } from "../../middleware/authenticate";
import { requireOrgRole } from "../../middleware/require-org-role";
import { requireProjectRole } from "../../middleware/requireprojectrole";

const router = Router();

router.post(
  "/organizations/:orgId/invitations",
  authenticate,
  requireOrgRole(["owner", "admin"]),
  inviteOrgMember,
);

router.post(
  "/projects/:id/invitations",
  authenticate,
  requireProjectRole(["admin"]),
  inviteProjectMember,
);

router.post("/invitations/:token/accept", authenticate, accept);

router.patch(
  "/organizations/:orgId/members/:userId",
  authenticate,
  requireOrgRole(["owner", "admin"]),
  assignOrgRole,
);

router.patch(
  "/projects/:id/members/:userId",
  authenticate,
  requireProjectRole(["admin"]),
  assignProjectRole,
);

export default router;