import { Router } from "express";
import { create, update, archive } from "./project.controller";
import { authenticate } from "../../middleware/authenticate";
import { requireOrgRole } from "../../middleware/require-org-role";
import { requireProjectRole } from "../../middleware/requireprojectrole";

const router = Router();

// nested under an org: only org owner/admin can create a project
router.post(
  "/organizations/:orgId/projects",
  authenticate,
  requireOrgRole(["owner", "admin"]),
  create,
);

// project-level actions: only that project's admin
router.patch("/projects/:id", authenticate, requireProjectRole(["admin"]), update);
router.patch(
  "/projects/:id/archive",
  authenticate,
  requireProjectRole(["admin"]),
  archive,
);

export default router;